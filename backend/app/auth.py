import logging
import os
import uuid

from fastapi import HTTPException, UploadFile

from .config import DEEPFACE_DETECTOR, DEEPFACE_MODEL, FACE_DB_DIR, FACE_MATCH_THRESHOLD

logger = logging.getLogger("cafeteria.auth")

_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}


def save_upload(temp_dir: str, file: UploadFile) -> str:
    """Guarda un archivo subido en disco y devuelve su ruta."""
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in _IMAGE_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Formato de imagen no soportado.")
    name = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(temp_dir, name)
    with open(path, "wb") as f:
        f.write(file.file.read())
    return path


def save_face(user_id: int, file: UploadFile) -> str:
    """Guarda la imagen base del rostro de un usuario en el FaceDatabase."""
    ext = os.path.splitext(file.filename or "")[1].lower() or ".jpg"
    if ext not in _IMAGE_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Formato de imagen no soportado.")
    path = os.path.join(FACE_DB_DIR, f"user_{user_id}{ext}")
    with open(path, "wb") as f:
        f.write(file.file.read())
    return f"faces/user_{user_id}{ext}"


def recognize_face(file: UploadFile):
    """
    Recibe una foto y la compara contra la base de rostros.

    Retorna (user_id, distance) con la coincidencia más cercana o (None, None).
    """
    from deepface import DeepFace

    probe_path = save_upload(FACE_DB_DIR, file)
    try:
        result = DeepFace.find(
            img_path=probe_path,
            db_path=FACE_DB_DIR,
            model_name=DEEPFACE_MODEL,
            detector_backend=DEEPFACE_DETECTOR,
            enforce_detection=True,
            silent=True,
        )
        if result and isinstance(result, list) and not result[0].empty:
            best = result[0].sort_values("distance").iloc[0]
            distance = float(best["distance"])
            identity = str(best["identity"])
            if distance <= FACE_MATCH_THRESHOLD:
                user_id = _extract_user_id(identity)
                if user_id is not None:
                    return user_id, distance
        return None, None
    except ValueError as exc:
        if "could not be detected" in str(exc).lower():
            raise HTTPException(status_code=400, detail="No se detectó un rostro en la imagen.")
        raise HTTPException(status_code=400, detail=f"Error al procesar la imagen: {exc}")
    finally:
        try:
            os.remove(probe_path)
        except OSError:
            pass


def _extract_user_id(identity: str) -> int | None:
    base = os.path.basename(identity)
    if base.startswith("user_"):
        try:
            return int(base.split("_")[1].split(".")[0])
        except (ValueError, IndexError):
            return None
    return None
