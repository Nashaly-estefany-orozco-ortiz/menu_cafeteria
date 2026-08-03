from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from . import models
from .config import PUBLIC_DIR
from .database import Base, engine
from .routers import auth_router, categories, orders, products, users

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Cafetería Escolar API",
    description="Backend para la cafetería escolar con autenticación por reconocimiento facial (DeepFace).",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static/products", StaticFiles(directory=PUBLIC_DIR), name="products")

app.include_router(auth_router.router)
app.include_router(users.router)
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(orders.router)


@app.get("/")
def root():
    return {
        "app": "Cafetería Escolar API",
        "docs": "/docs",
        "endpoints": [
            "POST /auth/login",
            "POST /users",
            "GET /users",
            "GET/POST/PUT/DELETE /categories",
            "GET/POST/PUT/DELETE /products",
            "GET/POST /orders",
            "PUT /orders/{id}/status",
            "GET /orders/user/{user_id}",
            "GET /orders/{id}",
        ],
    }
