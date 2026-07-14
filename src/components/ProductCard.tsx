// ---------------------------------------------------------------
// ProductCard.tsx — Menüdeki tek bir ürün kartı.
//
// Solda gerçek yemek fotoğrafı, sağda isim + noktalı çizgi + fiyat.
// Fiyat, klasik lokanta menülerindeki gibi HER ZAMAN görünür —
// müşterinin fiyatı görmek için ürüne dokunması gerekmez.
// Karta tıklamak ise detayı (açıklama, kalori, gramaj) açar.
// ---------------------------------------------------------------
import type { Product } from "../types";
import ProductImage from "./ProductImage";

interface ProductCardProps {
  product: Product;
  accent: string; // Ait olduğu bölümün rengi
  onSelect: (product: Product) => void;
}

export default function ProductCard({ product, accent, onSelect }: ProductCardProps) {
  return (
    <button
      className="product-card w-100 text-start"
      style={{ ["--accent" as string]: accent }}
      onClick={() => onSelect(product)}
      aria-label={`${product.name} detayını gör`}
    >
      <div className="d-flex gap-3 align-items-center">
        <ProductImage
          src={product.image}
          emoji={product.emoji}
          alt={product.name}
          className="product-thumb"
        />
        <div className="flex-grow-1 min-w-0">
          <div className="d-flex align-items-baseline gap-2">
            <span className="product-name">{product.name}</span>
            {/* Noktalı çizgi: isim ile fiyat arasını doldurur */}
            <span className="dotted-leader" aria-hidden="true" />
            <span className="product-price">{product.price} ₺</span>
          </div>
          <div className="product-meta">
            {product.grams} g · {product.calories} kcal · detay için dokunun
          </div>
        </div>
      </div>
    </button>
  );
}
