# ---------------------------------------------------------------
# auth.py — Basit PIN koruması. Frontend'deki AdminPage.tsx'te PIN
# artık sadece ekranı kilitlemekle kalmıyor: yazma isteklerinde
# X-Admin-Pin header'ı olarak da gönderilip burada doğrulanıyor.
# Gerçek bir üründe bunun yerine token tabanlı bir oturum sistemi
# (ör. JWT + gerçek kullanıcı hesapları) kullanılmalı.
#
# ADMIN_PIN için bilerek bir yedek (varsayılan) değer YOK: ortam
# değişkeni tanımlı değilse sunucu hiç açılmaz. Kodun içine gömülü,
# herkesin GitHub'dan okuyabileceği bir "yedek şifre" olmasın diye.
#
# Ayrıca aynı IP'den art arda çok fazla yanlış PIN denemesi gelirse
# bir süreliğine engellenir (kaba kuvvet / brute-force koruması).
# Bellekte tutulur — küçük, tek sunuculu bir proje için yeterli;
# sunucu yeniden başlarsa sıfırlanır.
# ---------------------------------------------------------------
import os
import time
from collections import defaultdict
from typing import Annotated, Optional

from fastapi import Header, HTTPException, Request, status

ADMIN_PIN = os.getenv("ADMIN_PIN")
if not ADMIN_PIN:
    raise RuntimeError(
        "ADMIN_PIN ortam değişkeni tanımlı değil. "
        "backend/.env.example dosyasını .env olarak kopyalayıp ADMIN_PIN değerini "
        "ayarlamadan sunucu başlatılamaz (Render'da bu, Environment sekmesinden girilir)."
    )

MAX_ATTEMPTS = 5
WINDOW_SECONDS = 60
BLOCK_SECONDS = 300

_failed_attempts: dict[str, list[float]] = defaultdict(list)
_blocked_until: dict[str, float] = {}


def _client_ip(request: Request) -> str:
    # Render gibi ters proxy arkasındaki servislerde gerçek istemci IP'si
    # X-Forwarded-For'un ilk değeridir; yoksa doğrudan bağlantı IP'sine düş.
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _ensure_not_blocked(ip: str) -> None:
    blocked_at = _blocked_until.get(ip)
    if blocked_at and time.time() < blocked_at:
        remaining = int(blocked_at - time.time())
        raise HTTPException(
            status.HTTP_429_TOO_MANY_REQUESTS,
            f"Çok fazla hatalı deneme. {remaining} saniye sonra tekrar deneyin.",
        )


def _record_attempt(ip: str, success: bool) -> None:
    now = time.time()
    if success:
        _failed_attempts.pop(ip, None)
        _blocked_until.pop(ip, None)
        return
    attempts = [t for t in _failed_attempts[ip] if now - t < WINDOW_SECONDS]
    attempts.append(now)
    if len(attempts) >= MAX_ATTEMPTS:
        _blocked_until[ip] = now + BLOCK_SECONDS
        _failed_attempts.pop(ip, None)
    else:
        _failed_attempts[ip] = attempts


def check_pin(request: Request, pin: str) -> bool:
    """PIN'i dener; brute-force korumasını da uygular. Doğruysa True döner."""
    ip = _client_ip(request)
    _ensure_not_blocked(ip)
    is_valid = pin == ADMIN_PIN
    _record_attempt(ip, is_valid)
    return is_valid


def require_admin_pin(
    request: Request, x_admin_pin: Annotated[Optional[str], Header()] = None
) -> None:
    if not check_pin(request, x_admin_pin or ""):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Geçersiz PIN")
