from video_processor import process_video
from heatmap_generator import generate_heatmap
import os

def main():
    # Ruta del video de entrada
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    input_path = os.path.join(BASE_DIR, "data", "input", "timelapse1.mp4")
    output_folder = os.path.join(BASE_DIR, "data", "output")

    # Carpeta donde se guardarán los resultados
    output_folder = os.path.join("data", "output")

    print("[1/3] Procesando video con YOLOv8...")
    detections = process_video(input_path, output_folder)

    print(f"[2/3] Detecciones realizadas: {len(detections)} cuadros procesados")

    print("[3/3] Generando mapa de calor...")
    heatmap_path = generate_heatmap(detections, output_folder)

    print(f"✅ Proceso finalizado. Mapa de calor guardado en: {heatmap_path}")

if __name__ == "__main__":
    main()
