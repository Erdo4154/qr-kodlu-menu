// ---------------------------------------------------------------
// ProductModal.tsx — Ürüne tıklanınca AYNI SAYFADA açılan detay
// penceresi: büyük fotoğraf, açıklama, kalori, gramaj ve büyük
// puntoyla fiyat. Açma/kapamayı React state yönetir.
// ---------------------------------------------------------------
import type { Product } from "../types";
import { useAppDispatch } from "../store/hooks";
import { addToCart } from "../store/cartSlice";
import ProductImage from "./ProductImage";

interface ProductModalProps {
  product: Product | null; // null ise modal kapalıdır
  accent: string;
  onClose: () => void;
}

export default function ProductModal({ product, accent, onClose }: ProductModalProps) {
  const dispatch = useAppDispatch();

  if (!product) return null; // Kapalıyken hiçbir şey çizme

  const handleAdd = () => {
    dispatch(addToCart(product.id));
    onClose();
  };

  return (
    // Arka plandaki karartıya tıklayınca kapanır
    <div className="detail-backdrop" onClick={onClose}>
      {/* İçeriğe tıklamak kapatmasın diye yayılımı durduruyoruz */}
      <div
        className="detail-card"
        style={{ ["--accent" as string]: accent }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
      >
        {/* Üstte büyük ürün fotoğrafı */}
        <ProductImage
          src={product.image}
          emoji={product.emoji}
          alt={product.name}
          className="detail-hero"
        />
        <button className="btn-close detail-close" onClick={onClose} aria-label="Kapat" />

        <div className="detail-body">
          <h3 className="detail-title">{product.name}</h3>
          <p className="detail-description">{product.description}</p>

          {/* Kalori ve gramaj rozetleri */}
          <div className="d-flex gap-2 justify-content-center mb-3">
            <span className="info-chip">⚖️ {product.grams} g</span>
            <span className="info-chip">🔥 {product.calories} kcal</span>
          </div>

          {/* Fiyat: en belirgin öğe */}
          <div className="detail-price">{product.price} ₺</div>

          <button className="btn btn-add w-100" onClick={handleAdd}>
            Sepete ekle
          </button>
        </div>
      </div>
    </div>
  );
}
