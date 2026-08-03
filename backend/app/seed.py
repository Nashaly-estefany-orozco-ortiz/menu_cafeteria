from sqlalchemy.orm import Session

from . import models


def seed(db: Session):
    if db.query(models.Category).count() == 0:
        categories = [
            models.Category(name="Bebidas", description="Refrescos, jugos y aguas"),
            models.Category(name="Botanas", description="Papas, chicharrones y snacks"),
            models.Category(name="Almuerzos", description="Tortas, sándwiches y guisados"),
            models.Category(name="Postres", description="Gelatinas, galletas y dulces"),
        ]
        db.add_all(categories)
        db.commit()

        bebidas = db.query(models.Category).filter_by(name="Bebidas").one()
        botanas = db.query(models.Category).filter_by(name="Botanas").one()
        almuerzos = db.query(models.Category).filter_by(name="Almuerzos").one()
        postres = db.query(models.Category).filter_by(name="Postres").one()

        products = [
            models.Product(name="Agua embotellada", description="500 ml", price=10.0, category_id=bebidas.id),
            models.Product(name="Refresco", description="600 ml", price=15.0, category_id=bebidas.id),
            models.Product(name="Jugo de naranja", description="250 ml", price=12.0, category_id=bebidas.id),
            models.Product(name="Papas fritas", description="Bolsa 40 g", price=14.0, category_id=botanas.id),
            models.Product(name="Palomitas", description="Bolsa 50 g", price=10.0, category_id=botanas.id),
            models.Product(name="Torta de jamón", description="Con lechuga y jitomate", price=28.0, category_id=almuerzos.id),
            models.Product(name="Sándwich de pollo", description="Pollo deshebrado", price=25.0, category_id=almuerzos.id),
            models.Product(name="Gelatina", description="De agua o de leche", price=8.0, category_id=postres.id),
        ]
        db.add_all(products)
        db.commit()
