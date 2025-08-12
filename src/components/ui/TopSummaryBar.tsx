"use client";

import { useMiniApp } from "@neynar/react";
import { AnimatedNumber } from "~/components/ui/AnimatedNumber";
import { useGameState } from "~/hooks/useGameData";

function msToMMSS(ms: number) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(m)}:${pad(s)}`;
}

export function TopSummaryBar() {
  const { context } = useMiniApp();
  const meFid = context?.user?.fid;
  const { round, timeLeft, me } = useGameState(meFid);

  return (
    <div className="sticky top-0 z-20 mx-4 mt-2">
      <div className="card card-primary backdrop-blur supports-[backdrop-filter]:backdrop-blur-md bg-white/70 dark:bg-gray-900/50 border-primary/30 shadow-sm">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2 text-sm">
            <span aria-hidden>⏳</span>
            <span className="font-medium">Round #{round.id}</span>
            <span className="text-gray-500 dark:text-gray-400">•</span>
            <span className="font-mono tabular-nums" aria-live="polite">{msToMMSS(timeLeft)}</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span aria-hidden>💰</span>
              <AnimatedNumber className="font-semibold" value={round.rewardPool} format={(v) => v.toFixed(2)} ariaLabel={`Reward ${round.rewardPool.toFixed(2)}`} />
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span aria-hidden>⭐</span>
              <AnimatedNumber className="font-semibold" value={me?.points ?? 0} ariaLabel={`My points ${me?.points ?? 0}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
