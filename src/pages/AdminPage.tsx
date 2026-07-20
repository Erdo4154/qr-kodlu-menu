// ---------------------------------------------------------------
// AdminPage.tsx — Yönetici paneli artık kendi sayfası (/admin).
// Müşteri menüsünden görsel olarak bilinçli şekilde ayrışır:
// koyu "düzenleme modu" üst şeridi + "Siteye Dön" bağlantısı,
// böylece kullanıcı hangi modda olduğunu her zaman anlar.
//
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
import { Link } from "react-router-dom";
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
import ConfirmModal from "../components/ConfirmModal";

const ADMIN_PIN = "1234"; // Demo amaçlı. Değiştirmeyi unutmayın!

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

type Tab = "restoran" | "bolumler" | "urunler" | "gelismis";

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");

  if (!unlocked) {
    return (
      <div className="admin-gate">
        <div className="admin-gate-card">
          <p className="admin-gate-kicker">Yönetici Girişi</p>
          <h1 className="admin-gate-title">Menüyü düzenlemek için giriş yap</h1>
          <p className="text-muted small mb-3">Demo PIN: 1234</p>
          <input
            className="form-control mb-2"
            type="password"
            autoFocus
            placeholder="PIN"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && pinInput === ADMIN_PIN) setUnlocked(true);
            }}
          />
          <button
            className="btn btn-add w-100 mb-2"
            onClick={() => pinInput === ADMIN_PIN && setUnlocked(true)}
          >
            Giriş yap
          </button>
          {pinInput !== "" && pinInput !== ADMIN_PIN && (
            <small className="text-danger d-block mb-2">PIN hatalı.</small>
          )}
          <Link to="/" className="small">
            ← Siteye dön
          </Link>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const dispatch = useAppDispatch();
  const { restaurant, categories, products } = useAppSelector((s) => s.menu);

  const [tab, setTab] = useState<Tab>("restoran");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null); // null = yeni ürün
  const [newCategoryName, setNewCategoryName] = useState("");
  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  } | null>(null);
  const closeConfirm = () => setConfirmState(null);

  const startEditing = (product: Product) => {
    setEditingId(product.id);
    setTab("urunler");
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
        accent: ["#2F5D50", "#9E2B25", "#1F4E79", "#B07D2B", "#5B3A70"][
          categories.length % 5
        ],
      })
    );
    setNewCategoryName("");
  };

  const isFormValid = form.name.trim() !== "" && form.categoryId !== "" && form.price !== "";

  return (
    <div className="admin-page">
      {/* ===== Düzenleme modu üst şeridi ===== */}
      <div className="admin-topbar">
        <div className="container d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <span className="admin-mode-badge">✏️ Düzenleme Modu</span>
            <h1 className="admin-topbar-title mb-0">Yönetici Paneli</h1>
          </div>
          <Link to="/" className="btn btn-header">
            ← Siteye dön
          </Link>
        </div>
      </div>

      <div className="container py-4">
        {/* ===== Sekmeler ===== */}
        <ul className="nav nav-pills admin-tabs mb-4">
          {(
            [
              ["restoran", "🏠 Restoran"],
              ["bolumler", "📋 Bölümler"],
              ["urunler", "🍽️ Ürünler"],
              ["gelismis", "⚠️ Gelişmiş"],
            ] as [Tab, string][]
          ).map(([key, label]) => (
            <li className="nav-item" key={key}>
              <button
                className={`nav-link admin-tab ${tab === key ? "active" : ""}`}
                onClick={() => setTab(key)}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>

        {/* ===== 1) Restoran bilgileri ===== */}
        {tab === "restoran" && (
          <section className="admin-card">
            <h2 className="admin-card-title">Restoran bilgileri</h2>
            <p className="admin-card-hint">
              Bu bilgiler müşterinin gördüğü üst şeritte anında görünür.
            </p>
            <label className="form-label small fw-semibold">Restoran adı</label>
            <input
              className="form-control mb-3"
              value={restaurant.name}
              onChange={(e) => dispatch(updateRestaurant({ ...restaurant, name: e.target.value }))}
              placeholder="Restoran adı"
            />
            <label className="form-label small fw-semibold">Slogan</label>
            <input
              className="form-control mb-3"
              value={restaurant.slogan}
              onChange={(e) => dispatch(updateRestaurant({ ...restaurant, slogan: e.target.value }))}
              placeholder="Slogan"
            />
            <label className="form-label small fw-semibold">Kapak fotoğrafı URL</label>
            <input
              className="form-control"
              value={restaurant.heroImage ?? ""}
              onChange={(e) =>
                dispatch(updateRestaurant({ ...restaurant, heroImage: e.target.value }))
              }
              placeholder="https://... (üst şerit arka planı)"
            />
          </section>
        )}

        {/* ===== 2) Bölümler ===== */}
        {tab === "bolumler" && (
          <section className="admin-card">
            <h2 className="admin-card-title">Bölümler</h2>
            <p className="admin-card-hint">Menüdeki kategoriler ve renkleri.</p>
            {categories.map((cat) => (
              <div key={cat.id} className="d-flex gap-2 mb-2 align-items-center">
                <span className="color-dot" style={{ background: cat.accent }} title="Bölüm rengi" />
                <input
                  className="form-control form-control-sm"
                  value={cat.name}
                  onChange={(e) => dispatch(updateCategory({ ...cat, name: e.target.value }))}
                />
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() =>
                    setConfirmState({
                      title: "Bölümü sil",
                      message: `"${cat.name}" bölümü ve içindeki tüm ürünler silinsin mi?`,
                      onConfirm: () => {
                        dispatch(deleteCategory(cat.id));
                        closeConfirm();
                      },
                    })
                  }
                >
                  🗑
                </button>
              </div>
            ))}
            <div className="d-flex gap-2 mt-3">
              <input
                className="form-control form-control-sm"
                placeholder="Yeni bölüm adı"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
              />
              <button className="btn btn-sm btn-add" onClick={handleAddCategory}>
                Ekle
              </button>
            </div>
          </section>
        )}

        {/* ===== 3) Ürünler ===== */}
        {tab === "urunler" && (
          <div className="row g-4">
            <div className="col-lg-6">
              <section className="admin-card h-100">
                <h2 className="admin-card-title">
                  {editingId ? "Ürünü düzenle" : "Yeni ürün ekle"}
                </h2>
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
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-add flex-grow-1"
                    disabled={!isFormValid}
                    onClick={saveProduct}
                  >
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
              </section>
            </div>

            <div className="col-lg-6">
              <section className="admin-card h-100">
                <h2 className="admin-card-title">
                  Mevcut ürünler <span className="admin-count-badge">{products.length}</span>
                </h2>
                <div className="admin-product-list">
                  {products.map((product) => (
                    <div key={product.id} className="admin-product-row">
                      <span className="flex-grow-1">
                        {product.emoji} {product.name}{" "}
                        <small className="text-muted">— {product.price} ₺</small>
                      </span>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => startEditing(product)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() =>
                          setConfirmState({
                            title: "Ürünü sil",
                            message: `"${product.name}" silinsin mi?`,
                            onConfirm: () => {
                              dispatch(deleteProduct(product.id));
                              closeConfirm();
                            },
                          })
                        }
                      >
                        🗑
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* ===== 4) Gelişmiş / tehlikeli işlemler ===== */}
        {tab === "gelismis" && (
          <section className="admin-card admin-card-danger">
            <h2 className="admin-card-title">Menüyü fabrika ayarlarına döndür</h2>
            <p className="admin-card-hint">
              Tüm bölümler, ürünler ve restoran bilgileri örnek menüyle değiştirilir. Bu işlem
              geri alınamaz.
            </p>
            <button
              className="btn btn-outline-danger"
              onClick={() =>
                setConfirmState({
                  title: "Menüyü sıfırla",
                  message: "Tüm değişiklikler silinip örnek menüye dönülsün mü? Bu işlem geri alınamaz.",
                  confirmLabel: "Evet, sıfırla",
                  onConfirm: () => {
                    dispatch(resetMenu());
                    closeConfirm();
                  },
                })
              }
            >
              Menüyü sıfırla
            </button>
          </section>
        )}
      </div>

      <ConfirmModal
        open={confirmState !== null}
        title={confirmState?.title ?? ""}
        message={confirmState?.message ?? ""}
        confirmLabel={confirmState?.confirmLabel}
        danger
        onConfirm={() => confirmState?.onConfirm()}
        onCancel={closeConfirm}
      />
    </div>
  );
}
