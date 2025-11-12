# stats_generator.py
import os
import json
import math
import csv

def compute_stats(process_result, output_folder):
    """
    Recibe el diccionario devuelto por process_video y genera estadísticas:
      - total_frames, fps, duration_s
      - total_detections (person-detections)
      - frames_with_detections
      - average_people_per_frame
      - average_people_when_occupied
      - peak_people (máximo personas simultáneas en un frame)
      - estimated_person_seconds (aprox; detecciones / fps)
      - people_per_second (lista por segundo)
    Guarda stats en output_folder/stats.json y output_folder/stats_summary.csv
    Devuelve el dict de estadísticas.
    """
    detections_per_frame = process_result.get("detections_per_frame", [])
    frame_count = process_result.get("frame_count", 0)
    fps = process_result.get("fps", 30.0)

    total_detections = sum(len(lst) for lst in detections_per_frame)
    frames_with_detections = sum(1 for lst in detections_per_frame if len(lst) > 0)
    peak_people = max((len(lst) for lst in detections_per_frame), default=0)
    average_people_per_frame = (total_detections / frame_count) if frame_count > 0 else 0
    average_people_when_occupied = (total_detections / frames_with_detections) if frames_with_detections > 0 else 0
    duration_s = frame_count / fps if fps > 0 else 0
    estimated_person_seconds = (total_detections / fps) if fps > 0 else 0

    # people_per_second series
    seconds = math.ceil(duration_s) if duration_s > 0 else 0
    people_per_second = [0] * seconds
    for idx, lst in enumerate(detections_per_frame):
        second_index = int(idx / fps)
        if second_index < seconds:
            people_per_second[second_index] += len(lst)

    stats = {
        "total_frames": frame_count,
        "fps": fps,
        "duration_seconds": duration_s,
        "total_detections": total_detections,
        "frames_with_detections": frames_with_detections,
        "average_people_per_frame": average_people_per_frame,
        "average_people_when_occupied": average_people_when_occupied,
        "peak_people_in_single_frame": peak_people,
        "estimated_person_seconds": estimated_person_seconds,
        "people_per_second": people_per_second
    }

    os.makedirs(output_folder, exist_ok=True)
    json_path = os.path.join(output_folder, "stats.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2)

    # también un CSV resumen breve
    csv_path = os.path.join(output_folder, "stats_summary.csv")
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["metric", "value"])
        writer.writerow(["total_frames", stats["total_frames"]])
        writer.writerow(["fps", stats["fps"]])
        writer.writerow(["duration_seconds", stats["duration_seconds"]])
        writer.writerow(["total_detections", stats["total_detections"]])
        writer.writerow(["frames_with_detections", stats["frames_with_detections"]])
        writer.writerow(["average_people_per_frame", stats["average_people_per_frame"]])
        writer.writerow(["average_people_when_occupied", stats["average_people_when_occupied"]])
        writer.writerow(["peak_people_in_single_frame", stats["peak_people_in_single_frame"]])
        writer.writerow(["estimated_person_seconds", stats["estimated_person_seconds"]])

    return stats, json_path, csv_path
