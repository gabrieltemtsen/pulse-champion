"use client";

import { useEffect, useState } from "react";
import { useMiniApp } from "@neynar/react";
import { AnimatedNumber } from "~/components/ui/AnimatedNumber";
import { useChampionGame } from "~/hooks/useChampionGame";
import { formatEther } from "viem";

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
  const { myScore, mode, endTime, settled, prizePool, currentRoundId } = useChampionGame();
  const ended = !!endTime && Date.now() >= Number(endTime) * 1000;
  const statusLabel = settled ? "Settled" : ended ? "Ended" : "Active";
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const timeLeft = Math.max(0, (Number(endTime || 0n) * 1000) - now);

  return (
    <div className="sticky top-0 z-20 mx-4 mt-2">
      <div className="card card-primary backdrop-blur supports-[backdrop-filter]:backdrop-blur-md bg-white/70 dark:bg-gray-900/50 border-primary/30 shadow-sm">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2 text-sm">
            <span aria-hidden>⏳</span>
            <span className="font-medium">Round #{currentRoundId ? Number(currentRoundId) : '—'}</span>
            <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] ${settled ? 'bg-green-500/20 text-green-300' : ended ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'}`}>{statusLabel}</span>
            <span className="text-gray-500 dark:text-gray-400">•</span>
            <span className="font-mono tabular-nums" aria-live="polite">{msToMMSS(timeLeft)}</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span aria-hidden>💰</span>
              <AnimatedNumber className="font-semibold" value={Number(prizePool ? Number(formatEther(prizePool)) : 0)} format={(v) => v.toFixed(2)} ariaLabel={`Reward ${prizePool ? Number(formatEther(prizePool)).toFixed(2) : '0.00'}`} />
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span aria-hidden>⭐</span>
              <span className="font-semibold">{String(myScore)}</span>
              <span className="text-xs opacity-70 uppercase">on-chain ({mode})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
