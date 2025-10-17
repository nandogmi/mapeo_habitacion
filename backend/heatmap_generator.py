import numpy as np
import matplotlib.pyplot as plt
import os
import cv2

def generate_heatmap(detections, output_folder, frame_shape=(720, 1280)):
    """
    Genera un mapa de calor a partir de una lista de coordenadas (x, y).
    - detections: lista de tuplas (x, y)
    - output_folder: ruta donde guardar el resultado
    - frame_shape: tamaño aproximado de los frames del video (alto, ancho)
    """
    if len(detections) == 0:
        print("⚠️ No se encontraron detecciones. No se generará mapa de calor.")
        return None

    # Crear una matriz vacía del tamaño del video
    heatmap = np.zeros(frame_shape, dtype=np.float32)

    # Marcar las posiciones detectadas
    for (x, y) in detections:
        if 0 <= y < frame_shape[0] and 0 <= x < frame_shape[1]:
            heatmap[int(y), int(x)] += 1

    # Aplicar un suavizado para que el mapa sea más legible
    heatmap = cv2.GaussianBlur(heatmap, (0, 0), sigmaX=25, sigmaY=25)

    # Normalizar para escalar entre 0 y 1
    heatmap = cv2.normalize(heatmap, None, 0, 1, cv2.NORM_MINMAX)

    # Crear una figura con Matplotlib
    plt.figure(figsize=(10, 6))
    plt.imshow(heatmap, cmap='jet', interpolation='nearest')
    plt.title("Mapa de calor - Zonas más ocupadas")
    plt.axis('off')

    # Guardar imagen
    os.makedirs(output_folder, exist_ok=True)
    heatmap_path = os.path.join(output_folder, "heatmap.png")
    plt.savefig(heatmap_path, bbox_inches='tight', pad_inches=0)
    plt.close()

    return heatmap_path
