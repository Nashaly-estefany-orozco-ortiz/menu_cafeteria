from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


# ---------- Usuarios ----------
class UserBase(BaseModel):
    full_name: str
    email: str
    role: str = "customer"


class UserCreate(UserBase):
    face_image: Optional[bytes] = None


class UserOut(UserBase):
    id: int
    face_image: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LoginResponse(BaseModel):
    authenticated: bool
    user: Optional[UserOut] = None
    message: str


# ---------- Categorías ----------
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class CategoryOut(CategoryBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------- Productos ----------
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category_id: int
    image_url: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category_id: Optional[int] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class ProductOut(ProductBase):
    id: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------- Órdenes ----------
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int = 1


class OrderItemOut(OrderItemBase):
    id: int
    unit_price: float
    product_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class OrderCreate(BaseModel):
    user_id: int
    items: List[OrderItemBase]


class OrderStatusUpdate(BaseModel):
    status: str


class OrderOut(BaseModel):
    id: int
    user_id: int
    status: str
    total: float
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemOut]

    model_config = ConfigDict(from_attributes=True)
