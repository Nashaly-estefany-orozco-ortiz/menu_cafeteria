import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'cafeteria.db')}")

UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
FACE_DB_DIR = os.path.join(UPLOAD_DIR, "faces")
PUBLIC_DIR = os.path.join(UPLOAD_DIR, "products")

for directory in (UPLOAD_DIR, FACE_DB_DIR, PUBLIC_DIR):
    os.makedirs(directory, exist_ok=True)

# DeepFace match threshold (euclidean distance). The smaller, the stricter.
FACE_MATCH_THRESHOLD = float(os.getenv("FACE_MATCH_THRESHOLD", "0.55"))

# Modelo usado por DeepFace para generar embeddings
DEEPFACE_MODEL = os.getenv("DEEPFACE_MODEL", "Facenet")
DEEPFACE_DETECTOR = os.getenv("DEEPFACE_DETECTOR", "opencv")
