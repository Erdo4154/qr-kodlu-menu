# ---------------------------------------------------------------
# database.py — SQLite bağlantısı. Varsayılan olarak backend/menu.db
# dosyasına yazar; DATABASE_URL ortam değişkeniyle değiştirilebilir.
# ---------------------------------------------------------------
import os

from sqlmodel import Session, SQLModel, create_engine

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./menu.db")

# check_same_thread=False: SQLite varsayılanı tek thread'e kilitler,
# FastAPI istekleri farklı thread'lerde çalıştırabildiği için gerekli.
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)


def init_db() -> None:
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
