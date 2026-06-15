'use client';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'info', onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null;

  const btnClass = variant === 'danger'
    ? 'bg-red-600 hover:bg-red-500'
    : variant === 'warning'
    ? 'bg-amber-600 hover:bg-amber-500'
    : 'bg-indigo-600 hover:bg-indigo-500';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--bg-card)] border border-slate-700 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl animate-in zoom-in-95" style={{ animationDuration: '150ms' }}>
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
        <p className="text-sm text-[var(--text-muted)] mt-2">{message}</p>
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${btnClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
