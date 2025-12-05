"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import { useToast } from "@/components/notifications";
import { supabase } from "@/lib/supabase";

interface SummaryResult {
  summary: string;
  cool_facts: string[];
}

export default function PlaygroundPage() {
  const [apiKey, setApiKey] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const trimmedApiKey = apiKey.trim();
    const trimmedGithubUrl = githubUrl.trim();

    if (!trimmedApiKey) {
      showToast("Please enter an API key", "error");
      return;
    }

    if (!trimmedGithubUrl) {
      showToast("Please enter a GitHub URL", "error");
      return;
    }

    setIsLoading(true);
    setSummaryResult(null);

    try {
      // Step 1: Validate API key
      const { data, error } = await supabase
        .from("api_keys")
        .select("id, is_active")
        .eq("key", trimmedApiKey)
        .maybeSingle();

      if (error) {
        console.error("Supabase error:", error);
        showToast("Invalid API key", "error");
        setIsLoading(false);
        return;
      }

      if (!data) {
        showToast("Invalid API key", "error");
        setIsLoading(false);
        return;
      }

      if (!data.is_active) {
        showToast("API key is not active", "error");
        setIsLoading(false);
        return;
      }

      // Step 2: API key is valid, now call the LLM to summarize the GitHub page
      const response = await fetch("/api/github-summarizer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": trimmedApiKey,
        },
        body: JSON.stringify({
          githubUrl: trimmedGithubUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        showToast(errorData.error || "Failed to fetch summary", "error");
        setIsLoading(false);
        return;
      }

      const result: SummaryResult = await response.json();
      setSummaryResult(result);
      showToast("Summary generated successfully", "success");
    } catch (err) {
      console.error("Error:", err);
      showToast("An error occurred. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
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
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  disabled={isLoading}
                  className="mt-3 h-10 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm text-zinc-900 outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-sky-400 dark:focus:ring-sky-800/60"
                />
              </div>

              <div>
                <label
                  htmlFor="github-url"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-200"
                >
                  GitHub URL
                </label>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Enter a GitHub repository URL to get an AI-generated summary
                </p>
                <input
                  type="text"
                  id="github-url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo or owner/repo"
                  disabled={isLoading}
                  className="mt-3 h-10 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm text-zinc-900 outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-sky-400 dark:focus:ring-sky-800/60"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setApiKey("");
                    setGithubUrl("");
                    setSummaryResult(null);
                  }}
                  disabled={isLoading}
                  className="inline-flex items-center justify-center rounded-full bg-zinc-100 px-5 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={!apiKey.trim() || !githubUrl.trim() || isLoading}
                  className="inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-sky-300"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="mr-2 h-4 w-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Results Display */}
          {summaryResult && (
            <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800 sm:p-8">
              <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Summary
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Overview
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {summaryResult.summary}
                  </p>
                </div>
                {summaryResult.cool_facts && summaryResult.cool_facts.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Cool Facts
                    </h3>
                    <ul className="list-inside list-disc space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {summaryResult.cool_facts.map((fact, index) => (
                        <li key={index}>{fact}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

