from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from .. import auth, models, schemas
from ..database import get_db

router = APIRouter(prefix="/users", tags=["usuarios"])


@router.post("", response_model=schemas.UserOut, status_code=201)
def create_user(
    full_name: str = Form(...),
    email: str = Form(...),
    role: str = Form("customer"),
    face_image: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if db.query(models.User).filter(models.User.email == email.lower()).first():
        raise HTTPException(status_code=409, detail="Ya existe un usuario con ese correo.")

    user = models.User(full_name=full_name, email=email.lower(), role=role)
    db.add(user)
    db.commit()
    db.refresh(user)

    user.face_image = auth.save_face(user.id, face_image)
    db.commit()
    db.refresh(user)
    return user


@router.get("", response_model=list[schemas.UserOut])
def list_users(db: Session = Depends(get_db)):
    return db.query(models.User).order_by(models.User.id).all()


@router.get("/{user_id}", response_model=schemas.UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    return user


@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    db.delete(user)
    db.commit()
