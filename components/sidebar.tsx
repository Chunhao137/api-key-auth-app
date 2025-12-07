"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
}: SidebarProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (session?.user?.name) {
      return session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (session?.user?.email) {
      return session.user.email[0].toUpperCase();
    }
    return "U";
  };

  const userName = session?.user?.name || session?.user?.email || "User";

  return (
    <>
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full flex-shrink-0 transform border-r border-zinc-200 bg-white transition-all duration-300 ease-in-out dark:border-zinc-800 dark:bg-zinc-900 lg:relative lg:z-auto lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          isSidebarCollapsed ? "w-16" : "w-64"
        } flex flex-col`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800 lg:px-3">
          {!isSidebarCollapsed ? (
            <>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="h-6 w-6 rounded bg-gradient-to-br from-blue-500 to-orange-500" />
                  <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    GitHub Analyzer
                  </span>
                </div>
              </div>
              {/* Toggle button for desktop */}
              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className="hidden lg:inline-flex items-center justify-center rounded-lg p-1.5 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                aria-label="Collapse sidebar"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                  />
                </svg>
              </button>
              {/* Close button for mobile */}
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden inline-flex items-center justify-center rounded-lg p-1.5 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                aria-label="Close sidebar"
              >
                <svg
                  className="h-5 w-5"
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
            </>
          ) : (
            <div className="flex w-full items-center justify-center">
              <div className="h-6 w-6 rounded bg-gradient-to-br from-blue-500 to-orange-500" />
            </div>
          )}
        </div>

        {/* Account Selector */}
        <div className="border-b border-zinc-200 px-3 py-3 dark:border-zinc-800">
          {isSidebarCollapsed ? (
            <div className="flex justify-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-800">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500 text-xs font-medium text-white">
                  C
                </div>
              </div>
            </div>
          ) : (
            <button className="flex w-full items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 text-left text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500 text-xs font-medium text-white">
                C
              </div>
              <span className="flex-1">Personal</span>
              <svg
                className="h-4 w-4 text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 py-4">
          <Link
            href="/dashboards"
            className={`flex items-center rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 transition dark:bg-zinc-800 dark:text-zinc-50 ${
              isSidebarCollapsed ? "justify-center" : "gap-3"
            }`}
            title={isSidebarCollapsed ? "Overview" : undefined}
          >
            <svg
              className="h-5 w-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            {!isSidebarCollapsed && <span>Overview</span>}
          </Link>
          <Link
            href="/playground"
            className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 ${
              isSidebarCollapsed ? "justify-center" : "gap-3"
            }`}
            title={isSidebarCollapsed ? "API Playground" : undefined}
          >
            <svg
              className="h-5 w-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
            {!isSidebarCollapsed && <span>API Playground</span>}
          </Link>
          <button
            className={`flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 ${
              isSidebarCollapsed ? "justify-center" : "gap-3"
            }`}
            title={isSidebarCollapsed ? "Settings" : undefined}
          >
            <svg
              className="h-5 w-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {!isSidebarCollapsed && <span>Settings</span>}
          </button>
          <button
            className={`flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 ${
              isSidebarCollapsed ? "justify-center" : "gap-3"
            }`}
            title={isSidebarCollapsed ? "Documentation" : undefined}
          >
            <svg
              className="h-5 w-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            {!isSidebarCollapsed && (
              <>
                <span>Documentation</span>
                <svg
                  className="ml-auto h-4 w-4 text-zinc-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </>
            )}
          </button>
        </nav>

        {/* User Profile and Logout */}
        <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
          {isSidebarCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={userName}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-xs font-medium text-white">
                  {getUserInitials()}
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center justify-center rounded-lg p-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                title="Logout"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex w-full items-center gap-3 rounded-lg px-3 py-2">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={userName}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-xs font-medium text-white">
                  {getUserInitials()}
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {userName}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center rounded-lg p-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                title="Logout"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
