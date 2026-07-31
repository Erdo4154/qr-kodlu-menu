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
// PIN artık backend'de doğrulanır (bkz. backend/auth.py) — istemci
// kodunda sabit bir PIN yok. Doğrulanan PIN, yazma isteklerinde
// X-Admin-Pin header'ı olarak gönderilmek üzere bellekte (state)
// tutulur; sayfa yenilenince tekrar girilmesi gerekir.
// ---------------------------------------------------------------
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { api } from "../store/api";
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
import type { Product, RestaurantInfo } from "../types";
import ConfirmModal from "../components/ConfirmModal";
import ProductFormModal, { type ProductFormValues } from "../components/ProductFormModal";

type Tab = "restoran" | "menu" | "gelismis";

export default function AdminPage() {
  const [pinInput, setPinInput] = useState("");
  const [verifiedPin, setVerifiedPin] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!pinInput || verifying) return;
    setVerifying(true);
    setPinError(null);
    try {
      const { valid } = await api.verifyPin(pinInput);
      if (valid) {
        setVerifiedPin(pinInput);
      } else {
        setPinError("PIN hatalı.");
      }
    } catch (e) {
      setPinError(e instanceof Error ? e.message : "Sunucuya ulaşılamadı.");
    } finally {
      setVerifying(false);
    }
  };

  if (!verifiedPin) {
    return (
      <div className="admin-gate">
        <div className="admin-gate-card">
          <p className="admin-gate-kicker">Yönetici Girişi</p>
          <h1 className="admin-gate-title">Menüyü düzenlemek için giriş yap</h1>
          <input
            className="form-control mb-2"
            type="password"
            autoFocus
            placeholder="PIN"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <button className="btn btn-add w-100 mb-2" onClick={handleLogin} disabled={verifying}>
            {verifying ? "Kontrol ediliyor…" : "Giriş yap"}
          </button>
          {pinError && <small className="text-danger d-block mb-2">{pinError}</small>}
          <Link to="/" className="small">
            ← Siteye dön
          </Link>
        </div>
      </div>
    );
  }

  return <AdminDashboard pin={verifiedPin} />;
}

function AdminDashboard({ pin }: { pin: string }) {
  const dispatch = useAppDispatch();
  const { restaurant, categories, products } = useAppSelector((s) => s.menu);

  const [tab, setTab] = useState<Tab>("restoran");
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
  const [productModal, setProductModal] = useState<{
    categoryId: string;
    product: Product | null;
  } | null>(null);
  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => Promise<void>;
  } | null>(null);
  const closeConfirm = () => setConfirmState(null);

  // --- Menü sekmesindeki "hızlı" işlemler (bölüm ekle/yeniden adlandır) için ortak hata durumu ---
  const [menuActionError, setMenuActionError] = useState<string | null>(null);
  const runMenuAction = async (action: Promise<unknown>) => {
    try {
      await action;
      setMenuActionError(null);
    } catch (e) {
      setMenuActionError(e instanceof Error ? e.message : "İşlem başarısız oldu.");
    }
  };

  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || addingCategory) return;
    setAddingCategory(true);
    await runMenuAction(
      dispatch(
        addCategory({
          pin,
          data: {
            name: newCategoryName.trim(),
            tagline: "",
            emoji: "📋",
            accent: ["#2F5D50", "#9E2B25", "#1F4E79", "#B07D2B", "#5B3A70"][categories.length % 5],
          },
        })
      ).unwrap()
    );
    setAddingCategory(false);
    setNewCategoryName("");
  };

  // --- Restoran bilgileri: yazarken bekletmemek için yerel form, kaydetme onBlur'da ---
  const [restaurantForm, setRestaurantForm] = useState<RestaurantInfo>(restaurant);
  const [restaurantSaving, setRestaurantSaving] = useState(false);
  useEffect(() => setRestaurantForm(restaurant), [restaurant]);

  const saveRestaurant = async () => {
    if (
      restaurantForm.name === restaurant.name &&
      restaurantForm.slogan === restaurant.slogan &&
      restaurantForm.heroImage === restaurant.heroImage
    ) {
      return;
    }
    setRestaurantSaving(true);
    await runMenuAction(dispatch(updateRestaurant({ pin, data: restaurantForm })).unwrap());
    setRestaurantSaving(false);
  };

  const handleProductSubmit = async (values: ProductFormValues) => {
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
      await dispatch(updateProduct({ pin, product: { id: productModal.product.id, ...data } })).unwrap();
    } else {
      await dispatch(addProduct({ pin, data })).unwrap();
    }
    setProductModal(null);
  };

  const askDeleteCategory = (categoryId: string, categoryName: string) => {
    setConfirmState({
      title: "Bölümü sil",
      message: `"${categoryName}" bölümü ve içindeki tüm ürünler silinsin mi?`,
      onConfirm: async () => {
        await dispatch(deleteCategory({ pin, id: categoryId })).unwrap();
        closeConfirm();
      },
    });
  };

  const askDeleteProduct = (productId: string, productName: string) => {
    setConfirmState({
      title: "Ürünü sil",
      message: `"${productName}" silinsin mi?`,
      onConfirm: async () => {
        await dispatch(deleteProduct({ pin, id: productId })).unwrap();
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
              Bu bilgiler müşterinin gördüğü üst şeritte anında görünür. Bir alandan çıkınca
              (tab/tıklama) otomatik kaydedilir.
            </p>
            <label className="form-label small fw-semibold">Restoran adı</label>
            <input
              className="form-control mb-3"
              value={restaurantForm.name}
              onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
              onBlur={saveRestaurant}
              placeholder="Restoran adı"
            />
            <label className="form-label small fw-semibold">Slogan</label>
            <input
              className="form-control mb-3"
              value={restaurantForm.slogan}
              onChange={(e) => setRestaurantForm({ ...restaurantForm, slogan: e.target.value })}
              onBlur={saveRestaurant}
              placeholder="Slogan"
            />
            <label className="form-label small fw-semibold">Kapak fotoğrafı URL</label>
            <input
              className="form-control"
              value={restaurantForm.heroImage ?? ""}
              onChange={(e) => setRestaurantForm({ ...restaurantForm, heroImage: e.target.value })}
              onBlur={saveRestaurant}
              placeholder="https://... (üst şerit arka planı)"
            />
            {restaurantSaving && <small className="text-muted d-block mt-2">Kaydediliyor…</small>}
            {menuActionError && <p className="confirm-error mt-2">{menuActionError}</p>}
          </section>
        )}

        {/* ===== 2) Menü: bölüm + o bölümün ürünleri tek akordeonda ===== */}
        {tab === "menu" && (
          <>
            <p className="admin-card-hint mb-3">
              Bir bölüme tıklayın, altında o bölümün ürünleri açılsın — oradan doğrudan
              ekleyin, düzenleyin ya da silin.
            </p>

            {menuActionError && <p className="confirm-error">{menuActionError}</p>}

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
                  disabled={addingCategory}
                />
                <button
                  className="btn btn-sm btn-add text-nowrap"
                  onClick={handleAddCategory}
                  disabled={addingCategory}
                >
                  {addingCategory ? "Ekleniyor…" : "Ekle"}
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
                            defaultValue={cat.name}
                            onClick={(e) => e.stopPropagation()}
                            onBlur={(e) => {
                              const newName = e.target.value.trim();
                              if (newName && newName !== cat.name) {
                                runMenuAction(
                                  dispatch(updateCategory({ pin, category: { ...cat, name: newName } })).unwrap()
                                );
                              }
                            }}
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
                  onConfirm: async () => {
                    await dispatch(resetMenu({ pin })).unwrap();
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
        onConfirm={() => confirmState?.onConfirm() ?? Promise.resolve()}
        onCancel={closeConfirm}
      />
    </div>
  );
}
