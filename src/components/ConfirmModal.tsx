// ---------------------------------------------------------------
// ConfirmModal.tsx — Yönetici panelindeki silme/sıfırlama gibi geri
// alınamaz işlemler için, tarayıcının çirkin confirm() kutusu yerine
// sitenin kendi tasarımına uyan bir onay penceresi.
//
// onConfirm artık backend'e bir istek attığı için asenkron: istek
// sürerken düğmeler kilitlenir, başarısız olursa hata burada gösterilir.
// ---------------------------------------------------------------
import { useState } from "react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Evet, sil",
  cancelLabel = "Vazgeç",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleConfirm = async () => {
    setSaving(true);
    setError(null);
    try {
      await onConfirm();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bir hata oluştu.");
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setError(null);
    onCancel();
  };

  return (
    <div className="detail-backdrop" onClick={handleCancel}>
      <div
        className={`confirm-card ${danger ? "confirm-card-danger" : ""}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>
        {error && <p className="confirm-error">{error}</p>}
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary flex-grow-1"
            onClick={handleCancel}
            disabled={saving}
          >
            {cancelLabel}
          </button>
          <button
            className={`btn flex-grow-1 ${danger ? "btn-outline-danger" : "btn-add"}`}
            onClick={handleConfirm}
            disabled={saving}
          >
            {saving ? "İşleniyor…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
