from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/categories", tags=["categorías"])


@router.post("", response_model=schemas.CategoryOut, status_code=201)
def create_category(data: schemas.CategoryCreate, db: Session = Depends(get_db)):
    if db.query(models.Category).filter(models.Category.name == data.name).first():
        raise HTTPException(status_code=409, detail="Ya existe una categoría con ese nombre.")
    category = models.Category(**data.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.get("", response_model=list[schemas.CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).order_by(models.Category.name).all()


@router.put("/{category_id}", response_model=schemas.CategoryOut)
def update_category(
    category_id: int, data: schemas.CategoryUpdate, db: Session = Depends(get_db)
):
    category = db.get(models.Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Categoría no encontrada.")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(category, field, value)
    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    category = db.get(models.Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Categoría no encontrada.")
    if db.query(models.Product).filter(models.Product.category_id == category_id).first():
        raise HTTPException(
            status_code=400,
            detail="La categoría tiene productos asociados. Elimínalos o cambia su categoría primero.",
        )
    db.delete(category)
    db.commit()
