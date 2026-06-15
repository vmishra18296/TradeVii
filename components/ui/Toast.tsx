'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

let toastListeners: ((toast: ToastMessage) => void)[] = [];

export function showToast(message: string, type: ToastMessage['type'] = 'info') {
  const toast: ToastMessage = { id: crypto.randomUUID(), message, type };
  toastListeners.forEach((fn) => fn(toast));
}

const typeStyles = {
  success: 'bg-emerald-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-indigo-600 text-white',
  warning: 'bg-amber-500 text-black',
};

const typeIcons = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const listener = (toast: ToastMessage) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 4000);
    };
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl animate-in slide-in-from-right duration-300 ${typeStyles[toast.type]}`}
          role="alert"
        >
          <span className="text-lg font-bold">{typeIcons[toast.type]}</span>
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      ))}
    </div>,
    document.body
  );
}
