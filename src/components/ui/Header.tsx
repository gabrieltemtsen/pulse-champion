"use client";

import { useEffect, useState } from "react";
import { APP_NAME } from "~/lib/constants";
import sdk from "@farcaster/miniapp-sdk";
import { useMiniApp } from "@neynar/react";
import { useMode } from "~/components/providers/ModeProvider";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { base, celo } from "wagmi/chains";
import { Button } from "./Button";

type HeaderProps = {
  neynarUser?: {
    fid: number;
    score: number;
  } | null;
};

export function Header({ neynarUser }: HeaderProps) {
  const { context, actions, added } = useMiniApp();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { mode, setMode } = useMode();
  const [showBanner, setShowBanner] = useState(true);
  const [showAddBanner, setShowAddBanner] = useState(true);
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const desiredChain = mode === "celo" ? celo : base;
  const onDesiredChain = Number(chainId) === desiredChain.id;
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  useEffect(() => {
    try {
      const v = localStorage.getItem('pc_testing_banner_dismissed');
      if (v === '1') setShowBanner(false);
    } catch {}
  }, []);
  const dismissBanner = () => {
    setShowBanner(false);
    try { localStorage.setItem('pc_testing_banner_dismissed', '1'); } catch {}
  };

  // Dismiss state for Add Mini App banner
  useEffect(() => {
    try {
      const v = localStorage.getItem('pc_add_banner_dismissed');
      if (v === '1') setShowAddBanner(false);
    } catch {}
  }, []);
  const dismissAddBanner = () => {
    setShowAddBanner(false);
    try { localStorage.setItem('pc_add_banner_dismissed', '1'); } catch {}
  };

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
        {/* Testing Banner */}
        {showBanner && (
          <div className="mt-2 px-3 py-2 rounded bg-yellow-400/20 text-yellow-100 border border-yellow-300/30 text-xs flex items-center justify-between">
            <span>We’re in the final stages of testing. Thanks for your patience!</span>
            <button type="button" className="ml-3 text-yellow-100/80 hover:text-yellow-100 focus-ring rounded" onClick={dismissBanner} aria-label="Dismiss testing notice">✕</button>
          </div>
        )}

        {/* Wrong Network Banner */}
        {isConnected && !onDesiredChain && (
          <div className="mt-2 px-3 py-2 rounded bg-red-500/15 text-red-100 border border-red-400/30 text-xs flex items-center justify-between">
            <span>Wrong network — switch to {desiredChain.name} to interact.</span>
            <Button
              variant="secondary"
              size="sm"
              disabled={isSwitching}
              onClick={async () => {
                try {
                  await switchChain({ chainId: desiredChain.id });
                } catch (e) {
                  // ignore; user can try again or use wallet UI
                }
              }}
            >
              {isSwitching ? 'Switching…' : `Switch to ${desiredChain.name}`}
            </Button>
          </div>
        )}

        {/* Add Mini App Banner (Farcaster clients only) */}
        {context?.client && !added && showAddBanner && (
          <div className="mt-2 px-3 py-2 rounded bg-blue-500/15 text-blue-100 border border-blue-400/30 text-xs flex items-center justify-between">
            <span>Add Pulse Champion to your Farcaster client for faster access.</span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => actions.addMiniApp()}
              >
                Add Mini App
              </Button>
              <button type="button" className="ml-1 text-blue-100/80 hover:text-blue-100 focus-ring rounded" onClick={dismissAddBanner} aria-label="Dismiss add mini app notice">✕</button>
            </div>
          </div>
        )}
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
