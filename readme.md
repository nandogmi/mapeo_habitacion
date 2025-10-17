# Mapeo de Uso de Habitación

Este proyecto implementa un sistema para **registrar y analizar el uso de una habitación, oficina o sala**, utilizando videos como fuente de información. Se enfoca en detectar personas, generar estadísticas y construir mapas de calor que muestren las zonas más ocupadas.

---

## 🎯 Objetivo

- Detectar la presencia de personas en un video usando **YOLOv8**.
- Registrar las posiciones de las personas cuadro a cuadro.
- Generar un **mapa de calor** que indique las zonas más frecuentadas.
- Guardar estadísticas para análisis posterior (tiempo y frecuencia de uso).

---

## ⚙️ Tecnologías y librerías

- **Python 3.11+**
- [OpenCV](https://pypi.org/project/opencv-python/) – Procesamiento de video.
- [YOLOv8 / Ultralytics](https://github.com/ultralytics/ultralytics) – Detección de objetos.
- [NumPy](https://numpy.org/) – Manejo de matrices y datos.
- [Matplotlib](https://matplotlib.org/) – Visualización y generación de mapas de calor.
- [PyTorch](https://pytorch.org/) – Backend de YOLO.
- **Conda** – Gestión de entornos virtuales.

Opcional:
- GPU NVIDIA con CUDA para acelerar detección en tiempo real.

---
