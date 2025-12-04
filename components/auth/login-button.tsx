"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";

export function LoginButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <button
        disabled
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-solid border-black/[.08] px-5 text-zinc-900 transition-colors disabled:opacity-50 dark:border-white/[.145] dark:text-zinc-50 md:w-[200px]"
      >
        Loading...
      </button>
    );
  }

  if (session?.user) {
    return (
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3 rounded-full border border-solid border-black/[.08] px-4 py-2 dark:border-white/[.145]">
          {session.user.image && (
            <Image
              src={session.user.image}
              alt={session.user.name || "User"}
              width={32}
              height={32}
              className="rounded-full"
            />
          )}
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            {session.user.name || session.user.email}
          </span>
        </div>
        <button
          onClick={() => signOut()}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-solid border-black/[.08] px-5 text-zinc-900 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-50 dark:hover:bg-[#1a1a1a] md:w-[200px]"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[200px]"
    >
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      Sign in with Google
    </button>
  );
}

