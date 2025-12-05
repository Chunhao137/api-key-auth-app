"use client";

import { useState, useEffect } from "react";

type ApiKey = {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsedAt?: string;
  isActive: boolean;
  keyType?: string;
  usageCount?: number;
  monthlyLimit?: number | null;
};

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    keyType: "dev" | "prod";
  }) => void;
  mode: "create" | "edit";
  editingKey?: ApiKey | null;
}

export default function ApiKeyModal({
  isOpen,
  onClose,
  onSubmit,
  mode,
  editingKey,
}: ApiKeyModalProps) {
  const [name, setName] = useState("");
  const [keyType, setKeyType] = useState<"dev" | "prod">("dev");

  // Reset form when modal opens/closes or editingKey changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && editingKey) {
        setName(editingKey.name);
        setKeyType((editingKey.keyType as "dev" | "prod") || "dev");
      } else {
        // Reset for create mode
        setName("");
        setKeyType("dev");
      }
    }
  }, [isOpen, mode, editingKey]);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    onSubmit({
      name: trimmed,
      keyType,
    });
  };

  const handleClose = () => {
    setName("");
    setKeyType("dev");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 text-sm text-zinc-900 shadow-xl ring-1 ring-zinc-200 dark:bg-zinc-950 dark:text-zinc-50 dark:ring-zinc-800 sm:p-8">
        <h2 className="text-lg font-semibold text-center">
          {mode === "create" ? "Create a new API key" : "Edit API key"}
        </h2>
        <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
          {mode === "create"
            ? "Enter a name for the new API key."
            : "Update the name and type for this API key."}
        </p>

        {/* Key name */}
        <div className="mt-6 space-y-1.5">
          <p className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
            Key Name
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            A unique name to identify this key.
          </p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Key Name"
            className="mt-1 h-9 w-full rounded-xl border border-zinc-300 bg-white px-3 text-xs text-zinc-900 outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-sky-400 dark:focus:ring-sky-800/60"
          />
        </div>

        {/* Key type */}
        <div className="mt-5 space-y-1.5">
          <p className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
            Key Type
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Choose the environment for this key.
          </p>
          <div className="mt-2 space-y-2">
            <button
              type="button"
              onClick={() => setKeyType("dev")}
              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-xs transition ${
                keyType === "dev"
                  ? "border-sky-500 bg-sky-50 shadow-sm dark:border-sky-400 dark:bg-sky-950/40"
                  : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-500"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full border text-[10px] ${
                    keyType === "dev"
                      ? "border-sky-500 bg-sky-500 text-white"
                      : "border-zinc-300 text-transparent dark:border-zinc-600"
                  }`}
                >
                  ●
                </span>
                <div>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-100">
                    Development
                  </p>
                  <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                    Rate limited to 100 requests/minute.
                  </p>
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setKeyType("prod")}
              className="flex w-full cursor-not-allowed items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-left text-xs text-zinc-400 opacity-70 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-600"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-4 w-4 items-center justify-center rounded-full border border-zinc-300 text-transparent dark:border-zinc-700">
                  ●
                </span>
                <div>
                  <p className="font-semibold">Production</p>
                  <p className="mt-0.5 text-[11px]">
                    Rate limited to 1,000 requests/minute.
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                Coming soon
              </span>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-center gap-3 text-sm">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="inline-flex min-w-[96px] items-center justify-center rounded-full bg-sky-600 px-5 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-sky-300"
          >
            {mode === "create" ? "Create" : "Update"}
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex min-w-[96px] items-center justify-center rounded-full bg-zinc-100 px-5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

