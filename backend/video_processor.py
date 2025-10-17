import cv2
from ultralytics import YOLO
import os
import numpy as np

def process_video(video_path, output_folder):
    """
    Procesa un video con YOLOv8 para detectar personas y devuelve
    una lista de coordenadas de las detecciones por frame.
    """
    model = YOLO("yolov8n.pt")  # Modelo pequeño y rápido

    cap = cv2.VideoCapture(video_path)
    frame_count = 0
    detections = []  # Guardará (x, y) del centro de cada persona detectada

    if not cap.isOpened():
        print(f"❌ No se pudo abrir el video: {video_path}")
        return []

    os.makedirs(output_folder, exist_ok=True)

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1
        results = model(frame, verbose=False)

        for r in results:
            boxes = r.boxes.xyxy  # Coordenadas (x1, y1, x2, y2)
            classes = r.boxes.cls  # ID de clase

            for box, cls in zip(boxes, classes):
                if int(cls) == 0:  # Clase 0 = persona
                    x1, y1, x2, y2 = box
                    center_x = int((x1 + x2) / 2)
                    center_y = int((y1 + y2) / 2)
                    detections.append((center_x, center_y))

        if frame_count % 30 == 0:  # Muestra progreso cada 30 frames
            print(f"Procesados {frame_count} frames...")

    cap.release()
    print(f"✅ Video procesado. {frame_count} frames analizados.")

    # Guardar detecciones en un archivo CSV (opcional)
    np.savetxt(os.path.join(output_folder, "detections.csv"), detections, delimiter=",", fmt="%d")

    return detections
