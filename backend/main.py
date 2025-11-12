# main.py
from video_processor import process_video
from stats_generator import compute_stats
import os

def main():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    video_path = os.path.join(BASE_DIR, "data", "input", "timelapse1.mp4")
    output_folder = os.path.join(BASE_DIR, "data", "output")

    print("[1/2] Procesando video con YOLOv8...")
    result = process_video(video_path, output_folder)

    print("[2/2] Calculando estadísticas...")
    stats, json_path, csv_path = compute_stats(result, output_folder)

    print("✅ Proceso finalizado.")
    print(f"- CSV detecciones: {result.get('detections_csv')}")
    print(f"- Estadísticas (JSON): {json_path}")
    print(f"- Resumen (CSV): {csv_path}")

    # Imprimir resumen rápido en consola
    print("\nResumen rápido:")
    print(f"Total frames: {stats['total_frames']}")
    print(f"Duración (s): {stats['duration_seconds']:.2f}")
    print(f"Total detecciones (person-frames): {stats['total_detections']}")
    print(f"Frames con detecciones: {stats['frames_with_detections']}")
    print(f"Promedio personas por frame: {stats['average_people_per_frame']:.3f}")
    print(f"Promedio personas cuando hay ocupación: {stats['average_people_when_occupied']:.3f}")
    print(f"Pico de personas simultáneas en un frame: {stats['peak_people_in_single_frame']}")

if __name__ == "__main__":
    main()
