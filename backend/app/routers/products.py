import os

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from .. import models, schemas
from ..config import PUBLIC_DIR
from ..database import get_db

router = APIRouter(prefix="/products", tags=["productos"])


@router.post("", response_model=schemas.ProductOut, status_code=201)
def create_product(data: schemas.ProductCreate, db: Session = Depends(get_db)):
    if not db.get(models.Category, data.category_id):
        raise HTTPException(status_code=400, detail="La categoría no existe.")
    product = models.Product(**data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.get("", response_model=list[schemas.ProductOut])
def list_products(include_inactive: bool = False, db: Session = Depends(get_db)):
    query = db.query(models.Product)
    if not include_inactive:
        query = query.filter(models.Product.is_active.is_(True))
    return query.order_by(models.Product.name).all()


@router.put("/{product_id}", response_model=schemas.ProductOut)
def update_product(
    product_id: int, data: schemas.ProductUpdate, db: Session = Depends(get_db)
):
    product = db.get(models.Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado.")
    payload = data.model_dump(exclude_unset=True)
    if "category_id" in payload and not db.get(models.Category, payload["category_id"]):
        raise HTTPException(status_code=400, detail="La categoría no existe.")
    for field, value in payload.items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Baja lógica del producto."""
    product = db.get(models.Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado.")
    product.is_active = False
    db.commit()


@router.post("/{product_id}/image", response_model=schemas.ProductOut)
def upload_product_image(
    product_id: int, image: UploadFile = File(...), db: Session = Depends(get_db)
):
    product = db.get(models.Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado.")
    ext = os.path.splitext(image.filename or "")[1].lower()
    if ext not in {".jpg", ".jpeg", ".png", ".webp"}:
        raise HTTPException(status_code=400, detail="Formato de imagen no soportado.")
    path = os.path.join(PUBLIC_DIR, f"product_{product_id}{ext}")
    with open(path, "wb") as f:
        f.write(image.file.read())
    product.image_url = f"/static/products/product_{product_id}{ext}"
    db.commit()
    db.refresh(product)
    return product
