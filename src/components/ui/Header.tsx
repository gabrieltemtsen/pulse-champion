"use client";

import { useState } from "react";
import { APP_NAME } from "~/lib/constants";
import sdk from "@farcaster/miniapp-sdk";
import { useMiniApp } from "@neynar/react";
import { useMode } from "~/components/providers/ModeProvider";

type HeaderProps = {
  neynarUser?: {
    fid: number;
    score: number;
  } | null;
};

export function Header({ neynarUser }: HeaderProps) {
  const { context } = useMiniApp();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { mode, setMode } = useMode();

  return (
    <div className="relative">
      <div className="sticky top-0 z-30 mx-4 mt-3 mb-2">
        <div className="card backdrop-blur supports-[backdrop-filter]:backdrop-blur bg-white/70 dark:bg-gray-900/50 border-primary/30 flex items-center justify-between px-3 py-2">
          <div className="text-base font-semibold tracking-tight">{APP_NAME}</div>
          {/* Mode Toggle */}
          <div className="flex items-center gap-2">
            <div className="mode-toggle flex items-center border border-black/20 dark:border-white/20">
              <button
                type="button"
                onClick={() => setMode("base")}
                className={`px-3 py-1 text-xs font-semibold tracking-wide uppercase ${mode === "base" ? "bg-black text-white" : "bg-transparent text-current"}`}
                aria-pressed={mode === "base"}
              >
                Base
              </button>
              <button
                type="button"
                onClick={() => setMode("celo")}
                className={`px-3 py-1 text-xs font-semibold tracking-wide uppercase border-l border-black/20 dark:border-white/20 ${mode === "celo" ? "bg-[#FCFF52] text-black" : "bg-transparent text-current"}`}
                aria-pressed={mode === "celo"}
              >
                Celo
              </button>
            </div>
          {context?.user && (
            <button
              type="button"
              className="cursor-pointer focus-ring rounded-full"
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              aria-haspopup="menu"
              aria-expanded={isUserDropdownOpen}
              aria-label="Open profile menu"
            >
              {context.user.pfpUrl && (
                <img
                  src={context.user.pfpUrl}
                  alt="Profile"
                  className="w-9 h-9 rounded-full border-2 border-primary/60 shadow-sm"
                />
              )}
            </button>
          )}
          </div>
        </div>
      </div>
      {context?.user && isUserDropdownOpen && (
        <div className="absolute top-full right-4 z-50 w-fit mt-1 bg-white/95 dark:bg-gray-800/95 rounded-lg shadow-lg border border-gray-200/60 dark:border-gray-700/60 backdrop-blur supports-[backdrop-filter]:backdrop-blur-sm">
          <div className="p-3 space-y-2 text-right">
            <h3
              className="font-bold text-sm hover:underline cursor-pointer inline-block"
              onClick={() => sdk.actions.viewProfile({ fid: context.user.fid })}
            >
              {context.user.displayName || context.user.username}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">@{context.user.username}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">FID: {context.user.fid}</p>
            {neynarUser && (
              <p className="text-xs text-gray-500 dark:text-gray-500">Neynar Score: {neynarUser.score}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
