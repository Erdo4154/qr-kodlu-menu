// ---------------------------------------------------------------
// Header.tsx — Üst şerit. Gerçek bir restoran sitesi hissi için
// arka planda lokanta fotoğrafı, üzerinde karartma katmanı ve
// restoran adı bulunur. Fotoğraf yönetici panelinden değiştirilir.
// ---------------------------------------------------------------
import { Link } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

interface HeaderProps {
  onOpenCart: () => void;
}

export default function Header({ onOpenCart }: HeaderProps) {
  const restaurant = useAppSelector((s) => s.menu.restaurant);
  // Sepetteki toplam adet (rozet için)
  const cartCount = useAppSelector((s) =>
    s.cart.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  return (
    <header
      className="site-header"
      style={
        restaurant.heroImage
          ? { backgroundImage: `url("${restaurant.heroImage}")` }
          : undefined
      }
    >
      {/* Fotoğrafın üzerine yazı okunsun diye koyu katman */}
      <div className="header-overlay">
        <div className="container d-flex align-items-end justify-content-between hero-inner">
          <div>
            <h1 className="brand mb-0">{restaurant.name}</h1>
            <p className="slogan mb-0">{restaurant.slogan}</p>
          </div>

          <div className="d-flex gap-2 pb-1">
            <button
              className="btn btn-header position-relative"
              onClick={onOpenCart}
              aria-label="Sepeti aç"
            >
              🛒 Sepet
              {cartCount > 0 && (
                <span className="badge cart-badge position-absolute top-0 start-100 translate-middle rounded-pill">
                  {cartCount}
                </span>
              )}
            </button>
            <Link className="btn btn-header" to="/admin" aria-label="Yönetici paneli">
              ⚙️
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
