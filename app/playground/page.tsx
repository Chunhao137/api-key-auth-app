"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { useToast } from "@/components/notifications";

export default function PlaygroundPage() {
  const [apiKey, setApiKey] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const trimmed = apiKey.trim();
    if (!trimmed) {
      showToast("Please enter an API key", "error");
      return;
    }
    // Navigate to /protected with the API key as a query parameter
    router.push(`/protected?key=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
      />
      <main
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        }`}
      >
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                API Playground
              </h1>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Test your API key and explore the Research API
              </p>
            </div>
            {/* Sidebar Toggle Button for Mobile */}
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </header>

          {/* API Key Form */}
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800 sm:p-8">
            <form onSubmit={handleSubmit} method="get" className="space-y-6">
              <div>
                <label
                  htmlFor="api-key"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-200"
                >
                  API Key
                </label>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Enter your API key to test the Research API endpoints
                </p>
                <input
                  type="text"
                  id="api-key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key"
                  className="mt-3 h-10 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm text-zinc-900 outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-sky-400 dark:focus:ring-sky-800/60"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setApiKey("")}
                  className="inline-flex items-center justify-center rounded-full bg-zinc-100 px-5 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!apiKey.trim()}
                  className="inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-sky-300"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

