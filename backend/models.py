# ---------------------------------------------------------------
# models.py — Veritabanı tabloları (SQLModel).
#
# Alan adları bilinçli olarak camelCase (Python'da normalde
# snake_case tercih edilir): frontend'deki src/types.ts ile birebir
# aynı JSON şeklini üretir (categoryId, heroImage gibi), böylece
# React tarafı ekstra bir dönüşüm yazmadan API'yi doğrudan kullanır.
# ---------------------------------------------------------------
from typing import Optional

from sqlmodel import Field, SQLModel


class Category(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str
    tagline: str = ""
    accent: str
    emoji: str = "📋"


class Product(SQLModel, table=True):
    id: str = Field(primary_key=True)
    categoryId: str = Field(foreign_key="category.id", index=True)
    name: str
    description: str = ""
    calories: int = 0
    grams: int = 0
    price: float = 0
    emoji: str = "🍽️"
    image: Optional[str] = None


class Restaurant(SQLModel, table=True):
    # Tek satırlık "singleton" tablo: id her zaman 1.
    id: int = Field(default=1, primary_key=True)
    name: str
    slogan: str = ""
    heroImage: Optional[str] = None
