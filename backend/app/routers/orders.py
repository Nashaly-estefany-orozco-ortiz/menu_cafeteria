from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/orders", tags=["órdenes"])

VALID_STATUSES = {"pending", "preparing", "ready", "completed", "cancelled"}


def _serialize(order: models.Order) -> schemas.OrderOut:
    items = []
    for item in order.items:
        items.append(
            schemas.OrderItemOut(
                id=item.id,
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=item.unit_price,
                product_name=item.product.name if item.product else None,
            )
        )
    return schemas.OrderOut(
        id=order.id,
        user_id=order.user_id,
        status=order.status,
        total=order.total,
        created_at=order.created_at,
        updated_at=order.updated_at,
        items=items,
    )


@router.post("", response_model=schemas.OrderOut, status_code=201)
def create_order(data: schemas.OrderCreate, db: Session = Depends(get_db)):
    if not data.items:
        raise HTTPException(status_code=400, detail="La orden no puede estar vacía.")
    if not db.get(models.User, data.user_id):
        raise HTTPException(status_code=400, detail="El usuario no existe.")

    order = models.Order(user_id=data.user_id, status="pending", total=0.0)
    db.add(order)
    db.flush()

    total = 0.0
    for entry in data.items:
        product = db.get(models.Product, entry.product_id)
        if not product or not product.is_active:
            raise HTTPException(status_code=400, detail=f"Producto {entry.product_id} no disponible.")
        if entry.quantity <= 0:
            raise HTTPException(status_code=400, detail="La cantidad debe ser mayor a 0.")
        line_total = product.price * entry.quantity
        total += line_total
        db.add(
            models.OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=entry.quantity,
                unit_price=product.price,
            )
        )

    order.total = round(total, 2)
    db.commit()
    db.refresh(order)
    order = db.query(models.Order).options(joinedload(models.Order.items).joinedload(models.OrderItem.product)).filter(models.Order.id == order.id).one()
    return _serialize(order)


@router.get("", response_model=list[schemas.OrderOut])
def list_orders(status: str | None = None, db: Session = Depends(get_db)):
    """Vista administrador: lista todas las órdenes."""
    query = db.query(models.Order).options(
        joinedload(models.Order.items).joinedload(models.OrderItem.product)
    )
    if status:
        query = query.filter(models.Order.status == status)
    return [_serialize(o) for o in query.order_by(models.Order.created_at.desc()).all()]


@router.get("/user/{user_id}", response_model=list[schemas.OrderOut])
def user_order_history(user_id: int, db: Session = Depends(get_db)):
    """Historial de órdenes de un usuario específico."""
    if not db.get(models.User, user_id):
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    orders = (
        db.query(models.Order)
        .options(joinedload(models.Order.items).joinedload(models.OrderItem.product))
        .filter(models.Order.user_id == user_id)
        .order_by(models.Order.created_at.desc())
        .all()
    )
    return [_serialize(o) for o in orders]


@router.get("/{order_id}", response_model=schemas.OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = (
        db.query(models.Order)
        .options(joinedload(models.Order.items).joinedload(models.OrderItem.product))
        .filter(models.Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Orden no encontrada.")
    return _serialize(order)


@router.put("/{order_id}/status", response_model=schemas.OrderOut)
def update_order_status(order_id: int, data: schemas.OrderStatusUpdate, db: Session = Depends(get_db)):
    if data.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Estado inválido. Válidos: {', '.join(sorted(VALID_STATUSES))}",
        )
    order = db.get(models.Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Orden no encontrada.")
    order.status = data.status
    db.commit()
    db.refresh(order)
    order = (
        db.query(models.Order)
        .options(joinedload(models.Order.items).joinedload(models.OrderItem.product))
        .filter(models.Order.id == order_id)
        .one()
    )
    return _serialize(order)
