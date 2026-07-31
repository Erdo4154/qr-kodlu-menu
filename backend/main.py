# ---------------------------------------------------------------
# main.py — API'nin giriş noktası. Çalıştırmak için:
#   uvicorn main:app --reload
# (backend/ klasöründeyken, sanal ortam aktifken)
#
# Uçlar (endpoints), frontend'deki menuSlice.ts'teki reducer'larla
# birebir eşleşir: GET /api/menu tüm MenuState'i döner, geri kalanı
# updateRestaurant/addProduct/updateProduct/... işlemlerinin
# sunucu tarafı karşılığıdır.
# ---------------------------------------------------------------
import os
import time
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from auth import ADMIN_PIN, require_admin_pin
from database import engine, get_session, init_db
from models import Category, Product, Restaurant
from schemas import (
    CategoryCreate,
    CategoryUpdate,
    PinCheck,
    ProductCreate,
    ProductUpdate,
    RestaurantUpdate,
)
from seed import reseed, seed_if_empty

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    with Session(engine) as session:
        seed_if_empty(session)
    yield


app = FastAPI(title="Nar Lokantası Menü API", lifespan=lifespan)

_default_origins = "http://localhost:5173,https://qr-kodlu-menu-beta.vercel.app"
origins = [o.strip() for o in os.getenv("CORS_ORIGINS", _default_origins).split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _new_id(prefix: str) -> str:
    return f"{prefix}{int(time.time() * 1000)}"


# ================= Menü (tam durum) =================
@app.get("/api/menu")
def get_menu(session: Session = Depends(get_session)):
    restaurant = session.get(Restaurant, 1)
    categories = session.exec(select(Category)).all()
    products = session.exec(select(Product)).all()
    return {"restaurant": restaurant, "categories": categories, "products": products}


@app.post("/api/menu/reset", dependencies=[Depends(require_admin_pin)])
def reset_menu(session: Session = Depends(get_session)):
    reseed(session)
    return get_menu(session)


# ================= Admin =================
@app.post("/api/admin/verify")
def verify_pin(payload: PinCheck):
    return {"valid": payload.pin == ADMIN_PIN}


# ================= Restoran =================
@app.put("/api/restaurant", dependencies=[Depends(require_admin_pin)])
def update_restaurant(payload: RestaurantUpdate, session: Session = Depends(get_session)):
    restaurant = session.get(Restaurant, 1)
    if not restaurant:
        raise HTTPException(404, "Restoran bulunamadı")
    restaurant.name = payload.name
    restaurant.slogan = payload.slogan
    restaurant.heroImage = payload.heroImage
    session.add(restaurant)
    session.commit()
    session.refresh(restaurant)
    return restaurant


# ================= Bölümler =================
@app.post("/api/categories", dependencies=[Depends(require_admin_pin)])
def create_category(payload: CategoryCreate, session: Session = Depends(get_session)):
    category = Category(id=_new_id("c"), **payload.model_dump())
    session.add(category)
    session.commit()
    session.refresh(category)
    return category


@app.put("/api/categories/{category_id}", dependencies=[Depends(require_admin_pin)])
def update_category(category_id: str, payload: CategoryUpdate, session: Session = Depends(get_session)):
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(404, "Bölüm bulunamadı")
    for field, value in payload.model_dump().items():
        setattr(category, field, value)
    session.add(category)
    session.commit()
    session.refresh(category)
    return category


@app.delete("/api/categories/{category_id}", dependencies=[Depends(require_admin_pin)])
def delete_category(category_id: str, session: Session = Depends(get_session)):
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(404, "Bölüm bulunamadı")
    # Bölüm silinince içindeki ürünler de kaldırılır (frontend'deki davranışla aynı).
    products = session.exec(select(Product).where(Product.categoryId == category_id)).all()
    for product in products:
        session.delete(product)
    session.delete(category)
    session.commit()
    return {"ok": True}


# ================= Ürünler =================
@app.post("/api/products", dependencies=[Depends(require_admin_pin)])
def create_product(payload: ProductCreate, session: Session = Depends(get_session)):
    if not session.get(Category, payload.categoryId):
        raise HTTPException(400, "Geçersiz bölüm")
    product = Product(id=_new_id("p"), **payload.model_dump())
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


@app.put("/api/products/{product_id}", dependencies=[Depends(require_admin_pin)])
def update_product(product_id: str, payload: ProductUpdate, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(404, "Ürün bulunamadı")
    if not session.get(Category, payload.categoryId):
        raise HTTPException(400, "Geçersiz bölüm")
    for field, value in payload.model_dump().items():
        setattr(product, field, value)
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


@app.delete("/api/products/{product_id}", dependencies=[Depends(require_admin_pin)])
def delete_product(product_id: str, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(404, "Ürün bulunamadı")
    session.delete(product)
    session.commit()
    return {"ok": True}
