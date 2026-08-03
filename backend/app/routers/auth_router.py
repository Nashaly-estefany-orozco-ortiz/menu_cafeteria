from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from .. import auth, models, schemas
from ..database import get_db

router = APIRouter(prefix="/auth", tags=["autenticación"])


@router.post("/login", response_model=schemas.LoginResponse)
def login_with_face(face_image: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Login biométrico: recibe una foto del rostro, la valida con DeepFace
    contra los rostros almacenados y autentica al usuario.
    """
    user_id, distance = auth.recognize_face(face_image)
    if user_id is None:
        return schemas.LoginResponse(
            authenticated=False, user=None, message="No se reconoció el rostro."
        )

    user = db.get(models.User, user_id)
    if not user:
        return schemas.LoginResponse(
            authenticated=False, user=None, message="El rostro no corresponde a un usuario registrado."
        )

    return schemas.LoginResponse(
        authenticated=True,
        user=schemas.UserOut.model_validate(user),
        message=f"Autenticación exitosa (distancia {distance:.4f}).",
    )
