// ---------------------------------------------------------------
// CategoryNav.tsx — Sayfanın üstüne yapışan bölüm düğmeleri.
// Tıklanınca ilgili bölüme yumuşakça kaydırır. Her düğme kendi
// bölümünün rengini taşır; böylece renk dili menü boyunca tutarlı.
// ---------------------------------------------------------------
import { useAppSelector } from "../store/hooks";

export default function CategoryNav() {
  const categories = useAppSelector((s) => s.menu.categories);

  const scrollToCategory = (id: string) => {
    // Her bölümün DOM id'si "section-<kategoriId>" formatında.
    document.getElementById(`section-${id}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <nav className="category-nav">
      <div className="container d-flex gap-2 py-2 overflow-auto">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className="btn category-pill flex-shrink-0"
            style={{ ["--pill-accent" as string]: cat.accent }}
            onClick={() => scrollToCategory(cat.id)}
          >
            {cat.emoji} {cat.name}
          </button>
        ))}
      </div>
    </nav>
  );
}
