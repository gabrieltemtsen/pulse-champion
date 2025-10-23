"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getItem, setItem } from "~/lib/localStorage";

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
  // Keep chain switching manual via UI; no auto switch here to avoid flicker

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

  // No automatic chain switching; handled via explicit switch buttons in UI.

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
