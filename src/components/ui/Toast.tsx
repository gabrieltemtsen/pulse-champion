"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export type ToastKind = "success" | "error" | "info";

export type Toast = {
  id: string;
  title?: string;
  message: string;
  kind?: ToastKind;
  duration?: number; // ms
};

type ToastContextValue = {
  addToast: (t: Omit<Toast, "id">) => string;
  addSuccess: (message: string, opts?: Omit<Toast, "id" | "message" | "kind">) => string;
  addError: (message: string, opts?: Omit<Toast, "id" | "message" | "kind">) => string;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, any>>({});

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const tm = timers.current[id];
    if (tm) {
      clearTimeout(tm);
      delete timers.current[id];
    }
  }, []);

  const addToast = useCallback<ToastContextValue["addToast"]>((toast) => {
    const id = Math.random().toString(36).slice(2);
    const duration = toast.duration ?? 2500;
    const item: Toast = { id, kind: "info", ...toast, duration };
    setToasts((prev) => [item, ...prev].slice(0, 4));
    timers.current[id] = setTimeout(() => removeToast(id), duration);
    return id;
  }, [removeToast]);

  const addSuccess: ToastContextValue["addSuccess"] = useCallback((message, opts) => addToast({ message, kind: "success", ...opts }), [addToast]);
  const addError: ToastContextValue["addError"] = useCallback((message, opts) => addToast({ message, kind: "error", ...opts }), [addToast]);

  const value = useMemo(() => ({ addToast, addSuccess, addError, removeToast }), [addToast, addSuccess, addError, removeToast]);

  useEffect(() => () => {
    Object.values(timers.current).forEach(clearTimeout);
    timers.current = {};
  }, []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Live region for screen readers */}
      <div className="fixed inset-x-0 top-2 z-[100] flex justify-center px-4 pointer-events-none" aria-live="polite" aria-atomic="true" role="status">
        <div className="w-full max-w-md space-y-2">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

function kindStyles(kind?: ToastKind) {
  switch (kind) {
    case "success":
      return "border-green-500/50 bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-100";
    case "error":
      return "border-red-500/50 bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-100";
    default:
      return "border-primary/40 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100";
  }
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  return (
    <div
      className={
        "pointer-events-auto card border-l-4 " +
        kindStyles(toast.kind) +
        " animate-in fade-in slide-in-from-top-2 duration-200 shadow-md"
      }
      role="alert"
    >
      <div className="flex items-start gap-3 p-3">
        <div className="mt-0.5 text-lg" aria-hidden>
          {toast.kind === "success" ? "✅" : toast.kind === "error" ? "⚠️" : "🔔"}
        </div>
        <div className="flex-1">
          {toast.title && <div className="text-sm font-semibold leading-tight">{toast.title}</div>}
          <div className="text-sm leading-snug">{toast.message}</div>
        </div>
        <button className="ml-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus-ring rounded" onClick={onClose} aria-label="Dismiss notification">
          ✕
        </button>
      </div>
    </div>
  );
}
