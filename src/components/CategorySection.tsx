// ---------------------------------------------------------------
// CategorySection.tsx — Menünün bir bölümü (ör. İçecekler).
// Her bölüm kendi accent rengini CSS değişkeni olarak alır;
// başlık şeridi, ürün kartlarının kenar çizgisi ve fiyat rengi
// bu değişkenden beslenir. Böylece "her bölümün kendine has
// tasarımı" tek bir yerden yönetilir.
// ---------------------------------------------------------------
import type { Category, Product } from "../types";
import ProductCard from "./ProductCard";

interface CategorySectionProps {
  category: Category;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export default function CategorySection({
  category,
  products,
  onSelectProduct,
}: CategorySectionProps) {
  return (
    <section
      id={`section-${category.id}`}
      className="category-section"
      style={{ ["--accent" as string]: category.accent }}
    >
      <div className="section-heading">
        <span className="section-emoji">{category.emoji}</span>
        <div>
          <h2 className="section-title mb-0">{category.name}</h2>
          <p className="section-tagline mb-0">{category.tagline}</p>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="text-muted fst-italic px-2">
          Bu bölümde henüz ürün yok. Yönetici panelinden ekleyebilirsiniz.
        </p>
      ) : (
        <div className="row g-3">
          {products.map((product) => (
            <div className="col-12 col-md-6" key={product.id}>
              <ProductCard product={product} accent={category.accent} onSelect={onSelectProduct} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
