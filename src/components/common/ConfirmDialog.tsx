"use client";

import { Modal } from "@/components/common/Modal";

type ConfirmDialogProps = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p>{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          aria-label={cancelLabel}
          onClick={onCancel}
          className="rounded border border-emerald-100/30 px-4 py-2 text-sm text-emerald-50 hover:bg-white/10"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          aria-label={confirmLabel}
          onClick={onConfirm}
          className="rounded bg-amber-300 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-amber-200"
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
