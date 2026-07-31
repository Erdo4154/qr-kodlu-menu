# ---------------------------------------------------------------
# seed.py — Örnek menü verisi. src/data/menuData.ts ile birebir
# aynı içerik: backend olmadan önce localStorage'a düşen ilk menü
# neyse, veritabanına da o düşer.
# ---------------------------------------------------------------
from urllib.parse import quote

from sqlmodel import Session, select

from models import Category, Product, Restaurant


def _wiki(file_name: str, width: int = 640) -> str:
    """Commons dosya adını doğrudan resim adresine çevirir."""
    return f"https://commons.wikimedia.org/wiki/Special:FilePath/{quote(file_name)}?width={width}"


def _build_initial_restaurant() -> Restaurant:
    return Restaurant(
        id=1,
        name="Nar Lokantası",
        slogan="Ev yemeği",
        heroImage=_wiki("Esnaf lokantası (Dishes in bain marie).jpg", 1200),
    )


def _build_initial_categories() -> list[Category]:
    return [
        Category(id="corbalar", name="Çorbalar", tagline="Güne buradan başlayın", accent="#2F5D50", emoji="🍲"),
        Category(id="sicak", name="Sıcak Yemekler", tagline="Günün kazan yemekleri", accent="#9E2B25", emoji="🍛"),
        Category(id="icecekler", name="İçecekler", tagline="Soğuk ve sıcak", accent="#1F4E79", emoji="🥤"),
        Category(id="tatlilar", name="Tatlılar", tagline="Şerbetli ve sütlü", accent="#B07D2B", emoji="🍮"),
    ]


def _build_initial_products() -> list[Product]:
    return [
        Product(id="p1", categoryId="corbalar", name="Mercimek Çorbası", emoji="",
                image=_wiki("Mercimek çorbasi.jpg"),
                description="Kırmızı mercimek, soğan ve havuçla pişirilir; üzerine tereyağlı pul biber gezdirilir.",
                calories=180, grams=300, price=60),
        Product(id="p2", categoryId="corbalar", name="Ezogelin Çorbası", emoji="",
                image=_wiki("Ezogelin soup.jpg"),
                description="Mercimek, bulgur ve pirinçle hazırlanan baharatlı klasik.",
                calories=210, grams=300, price=65),

        Product(id="p3", categoryId="sicak", name="Kuru Fasulye & Pilav", emoji="",
                image=_wiki("Kuru fasulye ve pilav.jpg"),
                description="Tereyağlı kuru fasulye, yanında tane tane pirinç pilavı ile.",
                calories=620, grams=400, price=145),
        Product(id="p4", categoryId="sicak", name="İzmir Köfte", emoji="",
                image=_wiki("Izmir köfte.jpg"),
                description="Fırında patates ve domates sosuyla pişen el yapımı köfte.",
                calories=540, grams=350, price=175),
        Product(id="p5", categoryId="sicak", name="Sebze Türlüsü", emoji="",
                image=_wiki("Türlü ve pilav.jpg"),
                description="Mevsim sebzeleriyle pişen türlü, yanında pilav ile.",
                calories=380, grams=380, price=130),

        Product(id="p6", categoryId="icecekler", name="Ayran", emoji="",
                image=_wiki("Ayran in a big glass.jpg"),
                description="Günlük yoğurttan, açık ayran.",
                calories=90, grams=300, price=30),
        Product(id="p7", categoryId="icecekler", name="Şalgam Suyu", emoji="",
                image=_wiki("Şalgam suyu in market.jpg"),
                description="Adana usulü, acılı veya acısız seçilebilir.",
                calories=25, grams=300, price=35),
        Product(id="p8", categoryId="icecekler", name="Çay", emoji="",
                image=_wiki("Turkish tea.jpg"),
                description="İnce belli bardakta, demli.",
                calories=2, grams=150, price=15),

        Product(id="p9", categoryId="tatlilar", name="Fırın Sütlaçı", emoji="",
                image=_wiki("Firinda sütlaç.jpg"),
                description="Taş fırında üzeri kızartılmış, fındık ile servis edilir.",
                calories=320, grams=220, price=85),
        Product(id="p10", categoryId="tatlilar", name="Cevizli Baklava", emoji="",
                image=_wiki("Baklava displayed on a white plate.jpg"),
                description="El açması yufkayla, bol cevizli ve şerbetli.",
                calories=420, grams=180, price=120),
    ]


def reseed(session: Session) -> None:
    """Tüm tabloları temizleyip örnek menüyle yeniden doldurur."""
    for model in (Product, Category, Restaurant):
        for row in session.exec(select(model)).all():
            session.delete(row)
    session.commit()

    session.add(_build_initial_restaurant())
    session.add_all(_build_initial_categories())
    session.add_all(_build_initial_products())
    session.commit()


def seed_if_empty(session: Session) -> None:
    """Sunucu ilk açıldığında veritabanı boşsa örnek menüyle doldurur."""
    if session.exec(select(Restaurant)).first() is None:
        reseed(session)
