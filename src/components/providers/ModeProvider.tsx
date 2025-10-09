"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getItem, setItem } from "~/lib/localStorage";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { base, celo } from "wagmi/chains";

export type AppMode = "base" | "celo";

type ModeContextValue = {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  toggle: () => void;
};

const ModeContext = createContext<ModeContextValue | undefined>(undefined);

const STORAGE_KEY = "pulsechampion:mode";

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<AppMode>(() => getItem<AppMode>(STORAGE_KEY) || "base");
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  // Persist + apply class to <html>
  useEffect(() => {
    setItem<AppMode>(STORAGE_KEY, mode);
    const root = document.documentElement;
    if (mode === "celo") {
      root.classList.add("mode-celo");
    } else {
      root.classList.remove("mode-celo");
    }
  }, [mode]);

  // Switch EVM chain to match mode when connected
  useEffect(() => {
    if (!isConnected) return;
    try {
      if (mode === "celo" && chainId !== celo.id) {
        switchChain({ chainId: celo.id });
      } else if (mode === "base" && chainId !== base.id) {
        switchChain({ chainId: base.id });
      }
    } catch (_) {
      // ignore switching errors; user can switch manually
    }
  }, [mode, isConnected, chainId, switchChain]);

  const setMode = useCallback((m: AppMode) => setModeState(m), []);
  const toggle = useCallback(() => setModeState((prev) => (prev === "base" ? "celo" : "base")), []);

  const value = useMemo(() => ({ mode, setMode, toggle }), [mode, setMode, toggle]);

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error("useMode must be used within ModeProvider");
  return ctx;
}

