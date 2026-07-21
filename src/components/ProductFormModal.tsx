// ---------------------------------------------------------------
// ProductFormModal.tsx — Yönetici panelinde ürün ekleme/düzenleme
// artık bir modal: bir bölümün altındaki "+ Ürün ekle" ya da bir
// ürünün ✏️ düğmesiyle açılır, hangi bölümden açıldığını bilir.
// ---------------------------------------------------------------
import { useEffect, useState } from "react";
import type { Category, Product } from "../types";

export interface ProductFormValues {
  name: string;
  description: string;
  emoji: string;
  image: string;
  categoryId: string;
  price: string;
  grams: string;
  calories: string;
}

const emptyForm: ProductFormValues = {
  name: "",
  description: "",
  emoji: "🍽️",
  image: "",
  categoryId: "",
  price: "",
  grams: "",
  calories: "",
};

interface ProductFormModalProps {
  open: boolean;
  categories: Category[];
  editingProduct: Product | null; // null = yeni ürün
  defaultCategoryId?: string;
  onSubmit: (values: ProductFormValues) => void;
  onClose: () => void;
}

export default function ProductFormModal({
  open,
  categories,
  editingProduct,
  defaultCategoryId,
  onSubmit,
  onClose,
}: ProductFormModalProps) {
  const [form, setForm] = useState<ProductFormValues>(emptyForm);

  // Modal her açıldığında (yeni ürün ya da farklı bir ürün için) formu tazele.
  useEffect(() => {
    if (!open) return;
    setForm(
      editingProduct
        ? {
            name: editingProduct.name,
            description: editingProduct.description,
            emoji: editingProduct.emoji,
            image: editingProduct.image ?? "",
            categoryId: editingProduct.categoryId,
            price: String(editingProduct.price),
            grams: String(editingProduct.grams),
            calories: String(editingProduct.calories),
          }
        : { ...emptyForm, categoryId: defaultCategoryId ?? "" }
    );
  }, [open, editingProduct, defaultCategoryId]);

  if (!open) return null;

  const isValid = form.name.trim() !== "" && form.categoryId !== "" && form.price !== "";

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit(form);
  };

  return (
    <div className="detail-backdrop" onClick={onClose}>
      <div
        className="product-form-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={editingProduct ? "Ürünü düzenle" : "Yeni ürün ekle"}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="confirm-title mb-0">
            {editingProduct ? "Ürünü düzenle" : "Yeni ürün ekle"}
          </h3>
          <button className="btn-close" onClick={onClose} aria-label="Kapat" />
        </div>

        <div className="row g-2 mb-2">
          <div className="col-9">
            <input
              className="form-control form-control-sm"
              placeholder="Ürün adı *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoFocus
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

        <div className="d-flex gap-2 mt-2">
          <button className="btn btn-outline-secondary flex-grow-1" onClick={onClose}>
            Vazgeç
          </button>
          <button className="btn btn-add flex-grow-1" disabled={!isValid} onClick={handleSubmit}>
            {editingProduct ? "Değişiklikleri kaydet" : "Ürünü ekle"}
          </button>
        </div>
      </div>
    </div>
  );
}
