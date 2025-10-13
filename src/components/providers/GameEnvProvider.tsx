"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getItem, setItem } from "~/lib/localStorage";

export type GameEnv = "prod" | "staging";

type Ctx = {
  env: GameEnv;
  setEnv: (e: GameEnv) => void;
  toggleEnv: () => void;
};

const GameEnvContext = createContext<Ctx | undefined>(undefined);
const KEY = "pulsechampion:gameenv";

export function GameEnvProvider({ children }: { children: React.ReactNode }) {
  const [env, setEnvState] = useState<GameEnv>(() => getItem<GameEnv>(KEY) || "prod");
  useEffect(() => { setItem<GameEnv>(KEY, env); }, [env]);
  const setEnv = useCallback((e: GameEnv) => setEnvState(e), []);
  const toggleEnv = useCallback(() => setEnvState((p) => (p === "prod" ? "staging" : "prod")), []);
  const value = useMemo(() => ({ env, setEnv, toggleEnv }), [env, setEnv, toggleEnv]);
  return <GameEnvContext.Provider value={value}>{children}</GameEnvContext.Provider>;
}

export function useGameEnv() {
  const ctx = useContext(GameEnvContext);
  if (!ctx) throw new Error("useGameEnv must be used within GameEnvProvider");
  return ctx;
}

