"use client";
import { useEffect, useRef, type ReactNode } from "react";
/** Native modal supplies focus containment, restoration and Escape handling. */
export default function Modal({
  children,
  label,
  onClose,
  alert = false,
  className = "",
}: {
  children: ReactNode;
  label: string;
  onClose: () => void;
  alert?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${className}`.trim()}
      role={alert ? "alertdialog" : "dialog"}
      aria-labelledby={label}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      {children}
    </dialog>
  );
}
