// ---------------------------------------------------------------
// MenuPage.tsx — Müşterinin gördüğü sayfa. Hangi ürün modalının
// açık olduğu gibi "arayüz durumu" burada tutulur; menü verisi ise
// Redux'tadır (veri -> src/store/, görünüm -> src/components/).
// ---------------------------------------------------------------
import { useState } from "react";
import { useAppSelector } from "../store/hooks";
import type { Product } from "../types";
import Header from "../components/Header";
import CategoryNav from "../components/CategoryNav";
import CategorySection from "../components/CategorySection";
import ProductModal from "../components/ProductModal";
import CartDrawer from "../components/CartDrawer";

export default function MenuPage() {
  const { categories, products } = useAppSelector((s) => s.menu);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  // Seçili ürünün bölüm rengini bul (modalda kullanılır)
  const selectedAccent =
    categories.find((c) => c.id === selectedProduct?.categoryId)?.accent ?? "#2F5D50";

  return (
    <>
      <Header onOpenCart={() => setCartOpen(true)} />
      <CategoryNav />

      <main className="container py-4">
        {categories.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            products={products.filter((p) => p.categoryId === category.id)}
            onSelectProduct={setSelectedProduct}
          />
        ))}

        <footer className="site-footer">
          Menü QR kod ile açılır · Fiyatlara KDV dahildir
        </footer>
      </main>

      {/* Aynı sayfada açılan katmanlar */}
      <ProductModal
        product={selectedProduct}
        accent={selectedAccent}
        onClose={() => setSelectedProduct(null)}
      />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
