// ---------------------------------------------------------------
// CartModal.tsx — Sepet, ürün detayıyla aynı görsel dili paylaşan
// ortada açılan bir modal. Müşteri adet artırıp azaltır, masa
// numarasını yazar ve "Siparişi gönder"e basar. Demo aşamasında
// sipariş ekranda onaylanır; gerçek bir restoranda bu nokta
// mutfağa/kasaya giden bir isteğe bağlanır (README'de anlatıldı).
// ---------------------------------------------------------------
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addToCart, decreaseQuantity, removeFromCart, clearCart } from "../store/cartSlice";

interface CartModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CartModal({ open, onClose }: CartModalProps) {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((s) => s.cart.items);
  const products = useAppSelector((s) => s.menu.products);
  const [tableNo, setTableNo] = useState("");
  const [orderSent, setOrderSent] = useState(false);

  if (!open) return null;

  // Sepet satırlarını ürün bilgileriyle birleştir.
  // Ürün menüden silinmişse satırı atla (filter Boolean hilesi).
  const lines = cartItems
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return product ? { product, quantity: item.quantity } : null;
    })
    .filter((line): line is NonNullable<typeof line> => line !== null);

  const total = lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);

  const handleOrder = () => {
    setOrderSent(true);
    dispatch(clearCart());
  };

  const handleClose = () => {
    setOrderSent(false);
    onClose();
  };

  return (
    <div className="detail-backdrop" onClick={handleClose}>
      <div
        className="cart-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Sepetiniz"
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Sepetiniz</h4>
          <button className="btn-close" onClick={handleClose} aria-label="Kapat" />
        </div>

        {orderSent ? (
          // Sipariş sonrası teşekkür ekranı
          <div className="text-center py-5">
            <div style={{ fontSize: "3rem" }}>✅</div>
            <h5>Siparişiniz alındı!</h5>
            <p className="text-muted">Afiyet olsun. Siparişiniz hazırlanıyor.</p>
            <button className="btn btn-add" onClick={handleClose}>
              Menüye dön
            </button>
          </div>
        ) : lines.length === 0 ? (
          <p className="text-muted">
            Sepetiniz boş. Menüden bir ürüne dokunup "Sepete ekle" deyin.
          </p>
        ) : (
          <>
            <div className="cart-modal-lines">
              {lines.map(({ product, quantity }) => (
                <div key={product.id} className="cart-line">
                  <div className="flex-grow-1">
                    <div className="fw-semibold">{product.name}</div>
                    <small className="text-muted">{product.price} ₺ / adet</small>
                  </div>
                  {/* Adet kontrolleri */}
                  <div className="d-flex align-items-center gap-2">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => dispatch(decreaseQuantity(product.id))}
                      aria-label="Azalt"
                    >
                      −
                    </button>
                    <span className="qty">{quantity}</span>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => dispatch(addToCart(product.id))}
                      aria-label="Artır"
                    >
                      +
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => dispatch(removeFromCart(product.id))}
                      aria-label="Satırı sil"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-total d-flex justify-content-between">
              <span>Toplam</span>
              <strong>{total} ₺</strong>
            </div>

            <label className="form-label mt-3" htmlFor="tableNo">
              Masa numaranız
            </label>
            <input
              id="tableNo"
              className="form-control mb-3"
              placeholder="Örn. 12"
              value={tableNo}
              onChange={(e) => setTableNo(e.target.value)}
            />

            <button
              className="btn btn-add w-100"
              disabled={tableNo.trim() === ""}
              onClick={handleOrder}
            >
              Siparişi gönder
            </button>
            {tableNo.trim() === "" && (
              <small className="text-muted d-block mt-1">
                Göndermek için masa numarası girin.
              </small>
            )}
          </>
        )}
      </div>
    </div>
  );
}
