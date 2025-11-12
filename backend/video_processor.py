# video_processor.py
import cv2
from ultralytics import YOLO
import os
import csv

def process_video(video_path, output_folder):
    """
    Procesa un video con YOLOv8 para detectar personas.
    Devuelve un diccionario con:
      - detections_per_frame: lista donde cada elemento es una lista de (x, y) para ese frame
      - frame_count: número de frames procesados
      - fps: frames por segundo del video
      - frame_shape: (height, width)
    Además guarda detecciones en CSV: output_folder/detections.csv con columnas (frame_idx, x, y).
    """
    model = YOLO("yolov8n.pt")  # modelo preentrenado

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"❌ No se pudo abrir el video: {video_path}")
        return {
            "detections_per_frame": [],
            "frame_count": 0,
            "fps": 0,
            "frame_shape": (0, 0)
        }

    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)  or 1280)
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT) or 720)

    os.makedirs(output_folder, exist_ok=True)
    csv_path = os.path.join(output_folder, "detections.csv")
    csv_file = open(csv_path, "w", newline="", encoding="utf-8")
    csv_writer = csv.writer(csv_file)
    csv_writer.writerow(["frame_idx", "x", "y"])

    frame_idx = 0
    detections_per_frame = []

    print("Iniciando procesamiento de video...")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_idx += 1
        results = model(frame, verbose=False)

        centers = []
        # results es iterable; cada r corresponde a los resultados del batch (aquí batch=1)
        for r in results:
            boxes = r.boxes.xyxy  # (N,4)
            classes = r.boxes.cls  # (N,)
            # zip boxes y classes
            for box, cls in zip(boxes, classes):
                if int(cls) == 0:  # clase 0 = persona (COCO)
                    # box puede ser tensor/array; convertir a float
                    x1, y1, x2, y2 = box
                    cx = int((float(x1) + float(x2)) / 2.0)
                    cy = int((float(y1) + float(y2)) / 2.0)
                    centers.append((cx, cy))
                    csv_writer.writerow([frame_idx, cx, cy])

        detections_per_frame.append(centers)

        if frame_idx % 30 == 0:
            print(f"Procesados {frame_idx} frames...")

    cap.release()
    csv_file.close()

    print(f"✅ Video procesado. {frame_idx} frames analizados.")

    return {
        "detections_per_frame": detections_per_frame,
        "frame_count": frame_idx,
        "fps": float(fps),
        "frame_shape": (height, width),
        "detections_csv": csv_path
    }
