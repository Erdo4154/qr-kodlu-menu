// ---------------------------------------------------------------
// ConfirmModal.tsx — Yönetici panelindeki silme/sıfırlama gibi geri
// alınamaz işlemler için, tarayıcının çirkin confirm() kutusu yerine
// sitenin kendi tasarımına uyan bir onay penceresi.
// ---------------------------------------------------------------
interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
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
  if (!open) return null;

  return (
    <div className="detail-backdrop" onClick={onCancel}>
      <div
        className={`confirm-card ${danger ? "confirm-card-danger" : ""}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary flex-grow-1" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className={`btn flex-grow-1 ${danger ? "btn-outline-danger" : "btn-add"}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
