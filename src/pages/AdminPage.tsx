// ---------------------------------------------------------------
// AdminPage.tsx — Yönetici paneli kendi sayfası (/admin).
// Müşteri menüsünden görsel olarak bilinçli şekilde ayrışır:
// koyu "düzenleme modu" üst şeridi + "Siteye Dön" bağlantısı,
// böylece kullanıcı hangi modda olduğunu her zaman anlar.
//
//   • Restoran adı ve sloganını değiştirme
//   • Menü: bölüme tıklayınca altında o bölümün ürünleri açılır
//     (akordeon), oradan doğrudan ekleme/düzenleme/silme yapılır
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
import ProductFormModal, { type ProductFormValues } from "../components/ProductFormModal";

const ADMIN_PIN = "1234"; // Demo amaçlı. Değiştirmeyi unutmayın!

type Tab = "restoran" | "menu" | "gelismis";

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
  const [newCategoryName, setNewCategoryName] = useState("");
  // Akordeon: aynı anda tek bölüm açık kalır. null = hepsi kapalı.
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
  // Ürün formu modalı: hangi bölümden açıldığını ve (varsa) hangi ürünü
  // düzenlediğini tutar. null = kapalı.
  const [productModal, setProductModal] = useState<{
    categoryId: string;
    product: Product | null;
  } | null>(null);
  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  } | null>(null);
  const closeConfirm = () => setConfirmState(null);

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

  const handleProductSubmit = (values: ProductFormValues) => {
    const data = {
      name: values.name.trim(),
      description: values.description.trim(),
      emoji: values.emoji || "🍽️",
      image: values.image.trim(),
      categoryId: values.categoryId,
      price: Number(values.price) || 0,
      grams: Number(values.grams) || 0,
      calories: Number(values.calories) || 0,
    };

    if (productModal?.product) {
      dispatch(updateProduct({ id: productModal.product.id, ...data }));
    } else {
      dispatch(addProduct(data));
    }
    setProductModal(null);
  };

  const askDeleteCategory = (categoryId: string, categoryName: string) => {
    setConfirmState({
      title: "Bölümü sil",
      message: `"${categoryName}" bölümü ve içindeki tüm ürünler silinsin mi?`,
      onConfirm: () => {
        dispatch(deleteCategory(categoryId));
        closeConfirm();
      },
    });
  };

  const askDeleteProduct = (productId: string, productName: string) => {
    setConfirmState({
      title: "Ürünü sil",
      message: `"${productName}" silinsin mi?`,
      onConfirm: () => {
        dispatch(deleteProduct(productId));
        closeConfirm();
      },
    });
  };

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
              ["menu", "📋 Menü"],
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

        {/* ===== 2) Menü: bölüm + o bölümün ürünleri tek akordeonda ===== */}
        {tab === "menu" && (
          <>
            <p className="admin-card-hint mb-3">
              Bir bölüme tıklayın, altında o bölümün ürünleri açılsın — oradan doğrudan
              ekleyin, düzenleyin ya da silin.
            </p>

            {/* Yeni bölüm ekle */}
            <section className="admin-card mb-3">
              <h2 className="admin-card-title">Yeni bölüm ekle</h2>
              <div className="d-flex gap-2">
                <input
                  className="form-control form-control-sm"
                  placeholder="Bölüm adı (ör. Tatlılar)"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                />
                <button className="btn btn-sm btn-add text-nowrap" onClick={handleAddCategory}>
                  Ekle
                </button>
              </div>
            </section>

            <div className="category-accordion mb-3">
              {categories.map((cat) => {
                const catProducts = products.filter((p) => p.categoryId === cat.id);
                const isOpen = expandedCategoryId === cat.id;
                return (
                  <div
                    key={cat.id}
                    className="category-accordion-item"
                    style={{ ["--cat-accent" as string]: cat.accent }}
                  >
                    <button
                      className="category-accordion-header"
                      onClick={() => setExpandedCategoryId(isOpen ? null : cat.id)}
                      aria-expanded={isOpen}
                    >
                      <span className="color-dot" style={{ background: cat.accent }} />
                      <span className="category-accordion-name">
                        {cat.emoji} {cat.name}
                      </span>
                      <span className="admin-count-badge">{catProducts.length}</span>
                      <span className={`accordion-chevron ${isOpen ? "open" : ""}`}>▾</span>
                    </button>

                    {isOpen && (
                      <div className="category-accordion-body">
                        {/* Bölüm adı + silme */}
                        <div className="d-flex gap-2 mb-3 align-items-center">
                          <input
                            className="form-control form-control-sm"
                            value={cat.name}
                            onChange={(e) =>
                              dispatch(updateCategory({ ...cat, name: e.target.value }))
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            className="btn btn-sm btn-outline-danger text-nowrap"
                            onClick={() => askDeleteCategory(cat.id, cat.name)}
                          >
                            🗑 Bölümü sil
                          </button>
                        </div>

                        {/* O bölümün ürünleri */}
                        {catProducts.length === 0 ? (
                          <p className="text-muted small">Bu bölümde henüz ürün yok.</p>
                        ) : (
                          <div className="admin-product-list mb-2">
                            {catProducts.map((product) => (
                              <div key={product.id} className="admin-product-row">
                                <span className="flex-grow-1">
                                  {product.emoji} {product.name}{" "}
                                  <small className="text-muted">— {product.price} ₺</small>
                                </span>
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() =>
                                    setProductModal({ categoryId: cat.id, product })
                                  }
                                >
                                  ✏️
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => askDeleteProduct(product.id, product.name)}
                                >
                                  🗑
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <button
                          className="btn btn-sm btn-add"
                          onClick={() => setProductModal({ categoryId: cat.id, product: null })}
                        >
                          + Ürün ekle
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ===== 3) Gelişmiş / tehlikeli işlemler ===== */}
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

      <ProductFormModal
        open={productModal !== null}
        categories={categories}
        editingProduct={productModal?.product ?? null}
        defaultCategoryId={productModal?.categoryId}
        onSubmit={handleProductSubmit}
        onClose={() => setProductModal(null)}
      />

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
