"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type ToastType = "success" | "error";

interface Toast {
  message: string;
  id: string;
  type?: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).slice(2, 9);
    setToast({ message, id, type });
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 transform animate-in fade-in slide-in-from-top-2">
          <div
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ring-1 ${
              toast.type === "error"
                ? "bg-red-500 ring-red-600/20"
                : "bg-emerald-500 ring-emerald-600/20"
            }`}
          >
            {toast.type === "error" ? (
              <svg
                className="h-5 w-5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className={`ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full transition-colors ${
                toast.type === "error"
                  ? "hover:bg-red-600/80"
                  : "hover:bg-emerald-600/80"
              }`}
              aria-label="Dismiss"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

