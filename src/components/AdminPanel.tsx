// ---------------------------------------------------------------
// AdminPanel.tsx — "Kullanıcının siteyi istediği gibi
// değiştirebilmesi" bu panelle sağlanır:
//   • Restoran adı ve sloganını değiştirme
//   • Bölüm (kategori) ekleme / yeniden adlandırma / silme
//   • Ürün ekleme / düzenleme / silme
//   • Menüyü fabrika ayarlarına döndürme
//
// Yapılan her değişiklik Redux'a, oradan da localStorage'a yazılır;
// sayfa yenilense bile kaybolmaz (yalnızca o cihazda — README'ye bakın).
//
// Basit bir PIN koruması var (varsayılan: 1234). Gerçek bir üründe
// bunun yerine sunucu taraflı kimlik doğrulama gerekir.
// ---------------------------------------------------------------
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  updateRestaurant,
  addProduct,
  updateProduct,
  deleteProduct,
  addCategory,
  updateCategory,
  deleteCategory,
  resetMenu,
} from "../store/menuSlice";
import type { Product } from "../types";

const ADMIN_PIN = "1234"; // Demo amaçlı. Değiştirmeyi unutmayın!

/** Ürün formunun boş hali */
const emptyForm = {
  name: "",
  description: "",
  emoji: "🍽️",
  image: "",
  categoryId: "",
  price: "",
  grams: "",
  calories: "",
};

interface AdminPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function AdminPanel({ open, onClose }: AdminPanelProps) {
  const dispatch = useAppDispatch();
  const { restaurant, categories, products } = useAppSelector((s) => s.menu);

  // --- Panelin kendi iç durumu ---
  const [pinInput, setPinInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null); // null = yeni ürün
  const [newCategoryName, setNewCategoryName] = useState("");

  if (!open) return null;

  // ---------- PIN ekranı ----------
  if (!unlocked) {
    return (
      <div className="drawer-backdrop" onClick={onClose}>
        <div className="pin-card" onClick={(e) => e.stopPropagation()}>
          <h5>Yönetici girişi</h5>
          <p className="text-muted small">Demo PIN: 1234</p>
          <input
            className="form-control mb-2"
            type="password"
            placeholder="PIN"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && pinInput === ADMIN_PIN) setUnlocked(true);
            }}
          />
          <button
            className="btn btn-add w-100"
            onClick={() => pinInput === ADMIN_PIN && setUnlocked(true)}
          >
            Giriş yap
          </button>
          {pinInput !== "" && pinInput !== ADMIN_PIN && (
            <small className="text-danger">PIN hatalı.</small>
          )}
        </div>
      </div>
    );
  }

  // ---------- Yardımcı fonksiyonlar ----------

  /** Formu doldurulmuş bir ürünle aç (düzenleme modu) */
  const startEditing = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      emoji: product.emoji,
      image: product.image ?? "",
      categoryId: product.categoryId,
      price: String(product.price),
      grams: String(product.grams),
      calories: String(product.calories),
    });
  };

  /** Formu kaydet: editingId varsa güncelle, yoksa yeni ekle */
  const saveProduct = () => {
    if (!form.name.trim() || !form.categoryId || !form.price) return;

    const data = {
      name: form.name.trim(),
      description: form.description.trim(),
      emoji: form.emoji || "🍽️",
      image: form.image.trim(),
      categoryId: form.categoryId,
      price: Number(form.price) || 0,
      grams: Number(form.grams) || 0,
      calories: Number(form.calories) || 0,
    };

    if (editingId) {
      dispatch(updateProduct({ id: editingId, ...data }));
    } else {
      dispatch(addProduct(data));
    }
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    dispatch(
      addCategory({
        name: newCategoryName.trim(),
        tagline: "",
        emoji: "📋",
        // Yeni bölümlere sırayla renk atanır.
        accent: ["#2F5D50", "#9E2B25", "#1F4E79", "#B07D2B", "#5B3A70"][
          categories.length % 5
        ],
      })
    );
    setNewCategoryName("");
  };

  const isFormValid = form.name.trim() !== "" && form.categoryId !== "" && form.price !== "";

  // ---------- Panel ----------
  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <aside className="admin-panel open">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">⚙️ Yönetici Paneli</h4>
          <button className="btn-close" onClick={onClose} aria-label="Kapat" />
        </div>

        {/* ===== 1) Restoran bilgileri ===== */}
        <h6 className="admin-section-title">Restoran bilgileri</h6>
        <input
          className="form-control mb-2"
          value={restaurant.name}
          onChange={(e) => dispatch(updateRestaurant({ ...restaurant, name: e.target.value }))}
          placeholder="Restoran adı"
        />
        <input
          className="form-control mb-2"
          value={restaurant.slogan}
          onChange={(e) => dispatch(updateRestaurant({ ...restaurant, slogan: e.target.value }))}
          placeholder="Slogan"
        />
        <input
          className="form-control mb-3"
          value={restaurant.heroImage ?? ""}
          onChange={(e) =>
            dispatch(updateRestaurant({ ...restaurant, heroImage: e.target.value }))
          }
          placeholder="Kapak fotoğrafı URL (üst şerit)"
        />

        {/* ===== 2) Bölümler ===== */}
        <h6 className="admin-section-title">Bölümler</h6>
        {categories.map((cat) => (
          <div key={cat.id} className="d-flex gap-2 mb-2 align-items-center">
            <span
              className="color-dot"
              style={{ background: cat.accent }}
              title="Bölüm rengi"
            />
            <input
              className="form-control form-control-sm"
              value={cat.name}
              onChange={(e) => dispatch(updateCategory({ ...cat, name: e.target.value }))}
            />
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => {
                // Yanlışlıkla silmeyi önlemek için onay iste
                if (confirm(`"${cat.name}" bölümü ve içindeki tüm ürünler silinsin mi?`)) {
                  dispatch(deleteCategory(cat.id));
                }
              }}
            >
              🗑
            </button>
          </div>
        ))}
        <div className="d-flex gap-2 mb-3">
          <input
            className="form-control form-control-sm"
            placeholder="Yeni bölüm adı"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <button className="btn btn-sm btn-add" onClick={handleAddCategory}>
            Ekle
          </button>
        </div>

        {/* ===== 3) Ürün ekle / düzenle formu ===== */}
        <h6 className="admin-section-title">
          {editingId ? "Ürünü düzenle" : "Yeni ürün ekle"}
        </h6>
        <div className="row g-2 mb-2">
          <div className="col-9">
            <input
              className="form-control form-control-sm"
              placeholder="Ürün adı *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="col-3">
            <input
              className="form-control form-control-sm"
              placeholder="Emoji"
              value={form.emoji}
              onChange={(e) => setForm({ ...form, emoji: e.target.value })}
            />
          </div>
          <div className="col-12">
            <textarea
              className="form-control form-control-sm"
              placeholder="Açıklama (ürünün ne olduğu)"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="col-12">
            <input
              className="form-control form-control-sm"
              placeholder="Fotoğraf URL (isteğe bağlı)"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
            />
            <small className="text-muted">
              Boş bırakılırsa emoji gösterilir. Telifsiz fotoğraf için
              commons.wikimedia.org veya unsplash.com kullanabilirsiniz.
            </small>
          </div>
          <div className="col-12">
            <select
              className="form-select form-select-sm"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              <option value="">Bölüm seçin *</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.emoji} {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-4">
            <input
              className="form-control form-control-sm"
              type="number"
              placeholder="Fiyat ₺ *"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div className="col-4">
            <input
              className="form-control form-control-sm"
              type="number"
              placeholder="Gramaj"
              value={form.grams}
              onChange={(e) => setForm({ ...form, grams: e.target.value })}
            />
          </div>
          <div className="col-4">
            <input
              className="form-control form-control-sm"
              type="number"
              placeholder="Kalori"
              value={form.calories}
              onChange={(e) => setForm({ ...form, calories: e.target.value })}
            />
          </div>
        </div>
        <div className="d-flex gap-2 mb-3">
          <button className="btn btn-sm btn-add flex-grow-1" disabled={!isFormValid} onClick={saveProduct}>
            {editingId ? "Değişiklikleri kaydet" : "Ürünü ekle"}
          </button>
          {editingId && (
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Vazgeç
            </button>
          )}
        </div>

        {/* ===== 4) Mevcut ürünler ===== */}
        <h6 className="admin-section-title">Mevcut ürünler ({products.length})</h6>
        {products.map((product) => (
          <div key={product.id} className="admin-product-row">
            <span className="flex-grow-1">
              {product.emoji} {product.name}{" "}
              <small className="text-muted">— {product.price} ₺</small>
            </span>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => startEditing(product)}>
              ✏️
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => {
                if (confirm(`"${product.name}" silinsin mi?`)) dispatch(deleteProduct(product.id));
              }}
            >
              🗑
            </button>
          </div>
        ))}

        {/* ===== 5) Sıfırlama ===== */}
        <button
          className="btn btn-sm btn-outline-danger w-100 mt-3"
          onClick={() => {
            if (confirm("Tüm değişiklikler silinip örnek menüye dönülsün mü?")) {
              dispatch(resetMenu());
            }
          }}
        >
          Menüyü fabrika ayarlarına döndür
        </button>
      </aside>
    </>
  );
}
