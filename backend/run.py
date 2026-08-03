import uvicorn

from app.database import Base, SessionLocal, engine
from app.seed import seed

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed(db)
        print("Base de datos inicializada con datos de ejemplo.")
    finally:
        db.close()
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
