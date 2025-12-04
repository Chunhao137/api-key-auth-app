 "use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/notifications";
import Sidebar from "@/components/sidebar";
import ApiKeyModal from "@/components/api-key-modal";
import PlanBanner from "@/components/plan-banner";

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

// Database type (matches Supabase schema)
type DbApiKey = {
  id: string;
  name: string;
  key: string;
  key_type: string;
  monthly_limit: number | null;
  usage_count: number;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
  updated_at: string;
};

const generateKey = () =>
  `sk_${Math.random().toString(36).slice(2, 10)}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;

// Convert database format to UI format
const dbToUi = (db: DbApiKey): ApiKey => ({
  id: db.id,
  name: db.name,
  key: db.key,
  createdAt: db.created_at,
  lastUsedAt: db.last_used_at || undefined,
  isActive: db.is_active,
  keyType: db.key_type,
  usageCount: db.usage_count,
  monthlyLimit: db.monthly_limit,
});

export default function DashboardsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nameInput, setNameInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "revoked">("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>(
    {}
  );
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { showToast } = useToast();

  // Check authentication and redirect if not signed in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Fetch keys from Supabase (only if authenticated)
  useEffect(() => {
    if (status === "authenticated") {
      fetchKeys();
    }
  }, [status]);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("api_keys")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setKeys(data ? data.map(dbToUi) : []);
    } catch (err) {
      console.error("Error fetching keys:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load API keys"
      );
    } finally {
      setLoading(false);
    }
  };

  const visibleKeys = useMemo(() => {
    if (filter === "active") return keys.filter((k) => k.isActive);
    if (filter === "revoked") return keys.filter((k) => !k.isActive);
    return keys;
  }, [keys, filter]);

  const handleCreate = async (data: {
    name: string;
    keyType: "dev" | "prod";
    monthlyLimit: number | null;
  }) => {
    try {
      setError(null);
      const newKey = generateKey();
      const { data: createdData, error: createError } = await supabase
        .from("api_keys")
        .insert({
          name: data.name,
          key: newKey,
          key_type: data.keyType,
          monthly_limit: data.monthlyLimit,
          is_active: true,
        })
        .select()
        .single();

      if (createError) throw createError;

      if (createdData) {
        setKeys((prev) => [dbToUi(createdData), ...prev]);
        setNameInput("");
        setIsCreateModalOpen(false);
        showToast("API key created successfully");
      }
    } catch (err) {
      console.error("Error creating key:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create API key"
      );
    }
  };

  const handleRename = async (id: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    try {
      setError(null);
      const { error: updateError } = await supabase
        .from("api_keys")
        .update({ name: trimmed })
        .eq("id", id);

      if (updateError) throw updateError;

      setKeys((prev) =>
        prev.map((k) => (k.id === id ? { ...k, name: trimmed } : k))
      );
      setEditingId(null);
      showToast("API key renamed successfully");
    } catch (err) {
      console.error("Error renaming key:", err);
      setError(
        err instanceof Error ? err.message : "Failed to rename API key"
      );
      setEditingId(null);
    }
  };

  const handleToggleActive = async (id: string) => {
    const key = keys.find((k) => k.id === id);
    if (!key) return;

    const wasActive = key.isActive;

    try {
      setError(null);
      const { error: updateError } = await supabase
        .from("api_keys")
        .update({ is_active: !wasActive })
        .eq("id", id);

      if (updateError) throw updateError;

      setKeys((prev) =>
        prev.map((k) => (k.id === id ? { ...k, isActive: !wasActive } : k))
      );
      showToast(
        wasActive
          ? "API key revoked successfully"
          : "API key restored successfully"
      );
    } catch (err) {
      console.error("Error toggling key status:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update API key"
      );
    }
  };

  const handleRotate = async (id: string) => {
    try {
      setError(null);
      const newKey = generateKey();
      const now = new Date().toISOString();
      const { error: updateError } = await supabase
        .from("api_keys")
        .update({
          key: newKey,
          last_used_at: now,
          is_active: true,
        })
        .eq("id", id);

      if (updateError) throw updateError;

      setKeys((prev) =>
        prev.map((k) =>
          k.id === id
            ? { ...k, key: newKey, lastUsedAt: now, isActive: true }
            : k
        )
      );
      showToast("API key rotated successfully");
    } catch (err) {
      console.error("Error rotating key:", err);
      setError(
        err instanceof Error ? err.message : "Failed to rotate API key"
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this API key?")) return;

    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from("api_keys")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      setKeys((prev) => prev.filter((k) => k.id !== id));
      showToast("API key deleted successfully", "error");
    } catch (err) {
      console.error("Error deleting key:", err);
      setError(
        err instanceof Error ? err.message : "Failed to delete API key"
      );
    }
  };

  const handleEdit = (key: ApiKey) => {
    setEditingKey(key);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (data: {
    name: string;
    keyType: "dev" | "prod";
    monthlyLimit: number | null;
  }) => {
    if (!editingKey) return;

    try {
      setError(null);
      const { error: updateError } = await supabase
        .from("api_keys")
        .update({
          name: data.name,
          key_type: data.keyType,
          monthly_limit: data.monthlyLimit,
        })
        .eq("id", editingKey.id);

      if (updateError) throw updateError;

      // Refresh keys from database
      await fetchKeys();
      setIsEditModalOpen(false);
      setEditingKey(null);
      showToast("API key updated successfully");
    } catch (err) {
      console.error("Error updating key:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update API key"
      );
    }
  };

  const toggleRevealKey = (id: string) => {
    setRevealedKeys((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };


  const handleCopyKey = async (key: string, keyId: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKeyId(keyId);
      showToast("Copied API Key to clipboard");
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedKeyId(null);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy key:", err);
      setError("Failed to copy to clipboard");
    }
  };

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="mb-4 text-lg font-medium text-zinc-900 dark:text-zinc-50">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated (this is a fallback, useEffect should handle redirect)
  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        <div className="min-h-screen px-4 py-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        {/* Top navigation / breadcrumb */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Sidebar Toggle Button */}
            <button
              onClick={() => {
                setIsSidebarOpen(!isSidebarOpen);
                if (isSidebarOpen) {
                  setIsSidebarCollapsed(false);
                }
              }}
              className="inline-flex items-center justify-center rounded-lg p-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 lg:hidden"
              aria-label="Toggle sidebar"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                {isSidebarOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              <span className="hidden sm:inline">Pages / </span>
              <span className="font-medium text-zinc-700 dark:text-zinc-200">
                Overview
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Operational
            </span>
          </div>
        </header>

        {/* Gradient plan card */}
        <PlanBanner />

        {/* API Keys section */}
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                API Keys
              </h2>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                The key is used to authenticate your requests to the{" "}
                <button className="underline underline-offset-2">
                  Research API
                </button>
                .
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center justify-center gap-1 rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-50 shadow-sm transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              <span className="text-base leading-none">＋</span>
              New key
            </button>
          </div>

          {/* New key input inline, like Tavily */}
          <div className="mt-4 flex flex-col gap-2 rounded-2xl bg-zinc-50 px-4 py-3 text-xs text-zinc-600 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-800 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <p className="font-medium text-zinc-700 dark:text-zinc-100">
                Create a new API key
              </p>
              <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                Name your key to remember where it&apos;s used. The full secret
                will only be shown once.
              </p>
            </div>
            <div className="mt-2 flex flex-1 flex-col gap-2 sm:mt-0 sm:flex-row sm:items-center">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. default, dev, production-backend"
                className="h-8 w-full rounded-full border border-zinc-200 bg-white px-3 text-xs text-zinc-900 outline-none ring-0 transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
              />
            </div>
          </div>

          {/* Filter row */}
          <div className="mt-4 flex flex-col gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="font-medium text-zinc-700 dark:text-zinc-200">
                The key is used to authenticate your requests.
              </span>{" "}
              To learn more, see the{" "}
              <button className="underline underline-offset-2">
                documentation
              </button>
              .
            </div>
            <div className="flex items-center gap-2">
              <span>Filter</span>
              <div className="inline-flex overflow-hidden rounded-full bg-zinc-100 p-1 text-[11px] dark:bg-zinc-900">
                {["all", "active", "revoked"].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setFilter(value as "all" | "active" | "revoked")
                    }
                    className={`rounded-full px-3 py-1 capitalize transition ${
                      filter === value
                        ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                        : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300">
              <p className="font-medium">Error: {error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-xs underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Keys table */}
          <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/60">
            {loading ? (
              <div className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                Loading API keys...
              </div>
            ) : visibleKeys.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                No API keys yet. Create your first key above to get started.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-zinc-200 text-xs dark:divide-zinc-800">
                <thead className="bg-white/80 text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:bg-zinc-950/60 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Type</th>
                    <th className="px-4 py-3 text-left font-medium">Usage</th>
                    <th className="px-4 py-3 text-left font-medium">Key</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Options
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white/80 dark:divide-zinc-800 dark:bg-zinc-950/40">
                  {visibleKeys.map((apiKey) => {
                    const isEditing = editingId === apiKey.id;
                    const isRevoked = !apiKey.isActive;
                    const isRevealed = revealedKeys[apiKey.id];
                    return (
                      <tr key={apiKey.id} className="align-middle">
                        {/* Name */}
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-0.5">
                            {isEditing ? (
                              <input
                                type="text"
                                defaultValue={apiKey.name}
                                autoFocus
                                onBlur={(e) => {
                                  handleRename(apiKey.id, e.target.value);
                                  setEditingId(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleRename(
                                      apiKey.id,
                                      (e.target as HTMLInputElement).value
                                    );
                                    setEditingId(null);
                                  }
                                  if (e.key === "Escape") {
                                    setEditingId(null);
                                  }
                                }}
                                className="w-full rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
                              />
                            ) : (
                              <button
                                type="button"
                                onClick={() => setEditingId(apiKey.id)}
                                className="max-w-[200px] truncate text-left text-xs font-medium text-zinc-900 hover:underline dark:text-zinc-50"
                              >
                                {apiKey.name}
                              </button>
                            )}
                            <span
                              className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                isRevoked
                                  ? "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                                  : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                              }`}
                            >
                              {isRevoked ? "Revoked" : "Active"}
                            </span>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                          {apiKey.keyType || "dev"}
                        </td>

                        {/* Usage */}
                        <td className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                          {apiKey.usageCount ?? 0}
                        </td>

                        {/* Key */}
                        <td className="px-4 py-3 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex max-w-[260px] flex-1 items-center rounded-full bg-zinc-100 px-3 py-1 font-mono text-[11px] text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                              <span className="truncate">
                                {isRevealed
                                  ? apiKey.key
                                  : `${apiKey.key.slice(
                                      0,
                                      6
                                    )}-****************-${apiKey.key.slice(
                                      -4
                                    )}`}
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyKey(apiKey.key, apiKey.id)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors"
                              aria-label="Copy key to clipboard"
                              title="Copy key to clipboard"
                            >
                              {copiedKeyId === apiKey.id ? (
                                <span className="text-emerald-600 dark:text-emerald-400" title="Copied!">
                                  ✓
                                </span>
                              ) : (
                                <span>📋</span>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleRevealKey(apiKey.id)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                              aria-label={isRevealed ? "Hide key" : "Reveal key"}
                            >
                              {isRevealed ? "🙈" : "👁"}
                            </button>
                          </div>
                        </td>

                        {/* Options */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1 text-xs">
                            <button
                              type="button"
                              onClick={() => handleEdit(apiKey)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                              aria-label="Edit key"
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRotate(apiKey.id)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                              aria-label="Rotate key"
                            >
                              ↻
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleActive(apiKey.id)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                              aria-label={isRevoked ? "Restore key" : "Revoke key"}
                            >
                              {isRevoked ? "⟳" : "⏻"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(apiKey.id)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-red-400 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/60 dark:hover:text-red-300"
                              aria-label="Delete key"
                            >
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
      {/* Create API key modal */}
      <ApiKeyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={(data) => {
          handleCreate(data);
          setIsCreateModalOpen(false);
        }}
        mode="create"
      />

      {/* Edit API key modal */}
      <ApiKeyModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingKey(null);
        }}
        onSubmit={(data) => {
          handleUpdate(data);
        }}
        mode="edit"
        editingKey={editingKey}
      />
        </div>
      </main>
    </div>
  );
}


