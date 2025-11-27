"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { useToast } from "@/components/notifications";
import { supabase } from "@/lib/supabase";

function ProtectedPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const { showToast } = useToast();
  const hasValidated = useRef(false);
  const [isValid, setIsValid] = useState(false);
  const apiKey = searchParams.get("key");

  useEffect(() => {
    // Prevent multiple validations
    if (hasValidated.current || !apiKey) {
      if (!apiKey) {
        // No API key provided, redirect to playground
        router.push("/playground");
      }
      return;
    }

    // Mark as validated to prevent re-running
    hasValidated.current = true;

    const validateApiKey = async () => {
      setIsValidating(true);

      try {
        // Query Supabase to check if the API key exists and is active
        // The column name is "key" (quoted in schema because it's a reserved word)
        const { data, error } = await supabase
          .from("api_keys")
          .select("id, is_active")
          .eq("key", apiKey)
          .maybeSingle();

        // Check if there was an error or if the key doesn't exist
        if (error) {
          console.error("Supabase error:", error);
          showToast("invalid API key", "error");
          setIsValidating(false);
          // Redirect to playground after showing toast
          setTimeout(() => {
            router.push("/playground");
          }, 1000);
          return;
        }

        // If no data is returned, the key doesn't exist
        if (!data) {
          showToast("invalid API key", "error");
          setIsValidating(false);
          // Redirect to playground after showing toast
          setTimeout(() => {
            router.push("/playground");
          }, 1000);
          return;
        }

        // Check if the key is active
        if (data.is_active) {
          // Valid and active API key
          setIsValid(true);
          showToast("valid API key. /protected can be accessed", "success");
        } else {
          // Key exists but is not active
          showToast("invalid API key", "error");
          setIsValidating(false);
          // Redirect to playground after showing toast
          setTimeout(() => {
            router.push("/playground");
          }, 1000);
        }
      } catch (err) {
        console.error("Error validating API key:", err);
        showToast("invalid API key", "error");
        setIsValidating(false);
        // Redirect to playground after showing toast
        setTimeout(() => {
          router.push("/playground");
        }, 1000);
      } finally {
        if (isValid) {
          setIsValidating(false);
        }
      }
    };

    validateApiKey();
    // Only run once when component mounts - apiKey is extracted outside useEffect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty array ensures it only runs once

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
                Protected Page
              </h1>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                {isValidating
                  ? "Validating API key..."
                  : "This is a protected page that requires a valid API key"}
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

          {/* Content */}
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800 sm:p-8">
            {isValidating ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  Validating API key...
                </div>
              </div>
            ) : isValid ? (
              <div className="space-y-4">
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  You have successfully validated your API key.
                </p>
                <button
                  onClick={() => router.push("/playground")}
                  className="inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-sky-500"
                >
                  Go Back to Playground
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  Redirecting to playground...
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProtectedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Loading...
          </div>
        </div>
      }
    >
      <ProtectedPageContent />
    </Suspense>
  );
}

