# ---------------------------------------------------------------
# schemas.py — İstek gövdeleri (create/update). Tablo modellerinden
# ayrı tutulur çünkü id gibi alanlar burada olmamalı (id sunucuda
# üretilir ya da URL'den gelir).
# ---------------------------------------------------------------
from typing import Optional

from sqlmodel import SQLModel


class RestaurantUpdate(SQLModel):
    name: str
    slogan: str = ""
    heroImage: Optional[str] = None


class CategoryCreate(SQLModel):
    name: str
    tagline: str = ""
    accent: str
    emoji: str = "📋"


class CategoryUpdate(CategoryCreate):
    pass


class ProductCreate(SQLModel):
    categoryId: str
    name: str
    description: str = ""
    calories: int = 0
    grams: int = 0
    price: float = 0
    emoji: str = "🍽️"
    image: Optional[str] = None


class ProductUpdate(ProductCreate):
    pass


class PinCheck(SQLModel):
    pin: str
