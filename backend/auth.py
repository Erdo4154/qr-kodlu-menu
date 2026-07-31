# ---------------------------------------------------------------
# auth.py — Basit PIN koruması. Frontend'deki AdminPage.tsx'te PIN
# artık sadece ekranı kilitlemekle kalmıyor: yazma isteklerinde
# X-Admin-Pin header'ı olarak da gönderilip burada doğrulanıyor.
# Gerçek bir üründe bunun yerine token tabanlı bir oturum sistemi
# (ör. JWT + gerçek kullanıcı hesapları) kullanılmalı.
# ---------------------------------------------------------------
import os
from typing import Annotated, Optional

from fastapi import Header, HTTPException, status

ADMIN_PIN = os.getenv("ADMIN_PIN", "1234")


def require_admin_pin(x_admin_pin: Annotated[Optional[str], Header()] = None) -> None:
    if x_admin_pin != ADMIN_PIN:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Geçersiz PIN")
