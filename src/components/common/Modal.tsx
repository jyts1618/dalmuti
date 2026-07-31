"use client";

import { useEffect, useRef, type ReactNode } from "react";

type ModalProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
  widthClassName?: string;
};

export function Modal({ title, children, onClose, widthClassName = "max-w-xl" }: ModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const panel = panelRef.current;
    panel?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !panel) return;

      const focusable = panel.querySelectorAll<HTMLElement>(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="presentation">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className={`w-full ${widthClassName} rounded-md border border-amber-300/40 bg-[#24172e] p-6 text-ivory shadow-2xl outline-none`}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="modal-title" className="text-xl font-semibold text-amber-200">
            {title}
          </h2>
          <button
            type="button"
            aria-label="모달 닫기"
            onClick={onClose}
            className="rounded border border-amber-200/40 px-3 py-1 text-sm text-amber-100 hover:bg-amber-100 hover:text-[#1a1023]"
          >
            닫기
          </button>
        </div>
        <div className="mt-4 text-sm leading-6 text-[#fff8e5]">{children}</div>
      </div>
    </div>
  );
}
