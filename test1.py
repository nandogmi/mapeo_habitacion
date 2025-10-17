import cv2
from ultralytics import YOLO

# Cargar modelo YOLOv8
model = YOLO("yolov8n.pt")

# Cargar video
video_path = "videos/timelapse1.mp4"
cap = cv2.VideoCapture(video_path)

while True:
    ret, frame = cap.read()
    if not ret:
        break  # fin del video

    results = model(frame, verbose=False)
    annotated_frame = results[0].plot()

    cv2.imshow("Detección en Video", annotated_frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
