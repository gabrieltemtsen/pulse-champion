"use client";

import { useCallback, useMemo, useState } from "react";
import { useMiniApp } from "@neynar/react";
import { Button } from "../Button";
import { useGameState, useLeaderboard } from "~/hooks/useGameData";
import { useToast } from "~/components/ui/Toast";
import { AnimatedNumber } from "~/components/ui/AnimatedNumber";

function msToHMS(ms: number) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function DashboardTab() {
  const { context } = useMiniApp();
  const meFid = context?.user?.fid;
  const { round, timeLeft, progress, me, setMe, error } = useGameState(meFid);
  const { meRank } = useLeaderboard(meFid);
  const [playBusy, setPlayBusy] = useState(false);
  const [playMsg, setPlayMsg] = useState<string | null>(null);
  const { addSuccess, addError } = useToast();

  const timeStr = useMemo(() => msToHMS(timeLeft), [timeLeft]);

  const onPlay = useCallback(async () => {
    if (playBusy) return;
    setPlayBusy(true);
    setPlayMsg(null);
    try {
      // Simulated play() call
      await new Promise((res) => setTimeout(res, 900));
      setMe((prev) => (prev ? { ...prev, points: prev.points + 10 } : prev));
      setPlayMsg("Play successful! +10 points");
      addSuccess("+10 points added!", { title: "Nice!" });
    } catch (e: any) {
      const msg = e?.message || "Play failed. Try again.";
      setPlayMsg(msg);
      addError(msg, { title: "Action failed" });
    } finally {
      setPlayBusy(false);
      setTimeout(() => setPlayMsg(null), 2000);
    }
  }, [playBusy, setMe, addSuccess, addError]);

  return (
    <div className="space-y-6 px-4">
      {/* Main Round Card with Circular Progress */}
      <div className="card-floating p-6 relative">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Current Round</h3>
            <p className="text-sm text-gray-300 mt-1">ID #{round.id}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-300">Time Remaining</p>
            <p className="font-mono font-bold text-lg text-white mt-1" aria-live="polite">{timeStr}</p>
          </div>
        </div>

        {/* Circular Progress Timer around Play Button */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            {/* Circular progress background */}
            <div 
              className="progress-radial glow-effect" 
              style={{
                background: `conic-gradient(from 0deg, #7F00FF 0%, #E100FF ${progress * 50}%, #FF61FF ${progress * 100}%, transparent ${progress * 100}%)`
              }}
            >
              {/* Inner content */}
              <div className="relative z-10 flex flex-col items-center">
                <Button 
                  onClick={onPlay} 
                  isLoading={playBusy} 
                  className="btn-pulse w-20 h-20 rounded-full text-sm font-bold" 
                  aria-label="Play now"
                >
                  {playBusy ? '' : 'PLAY'}
                </Button>
                <div className="text-xs text-gray-300 mt-2">
                  {Math.floor(progress * 100)}% Complete
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reward Pool with Glow */}
        <div className="text-center mb-4">
          <p className="text-sm text-gray-300 mb-2">Reward Pool</p>
          <div className="glow-effect inline-block px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30">
            <AnimatedNumber 
              className="text-2xl font-bold text-white" 
              value={round.rewardPool} 
              format={(v) => `${v.toFixed(2)} CELO`} 
              ariaLabel={`Reward pool ${round.rewardPool.toFixed(2)} CELO`} 
            />
          </div>
        </div>

        {/* Status Messages */}
        {playMsg && (
          <div className="mt-4 text-center">
            <div className="inline-block px-4 py-2 bg-green-400/20 border border-green-400/30 rounded-full">
              <p className="text-sm text-green-300" role="status">{playMsg}</p>
            </div>
          </div>
        )}
        {error && (
          <div className="mt-4 text-center">
            <div className="inline-block px-4 py-2 bg-red-400/20 border border-red-400/30 rounded-full">
              <p className="text-sm text-red-300" role="alert">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* My Stats with Neumorphic Style */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card-neuro p-4 text-center">
          <p className="text-sm text-gray-300 mb-2">My Points</p>
          <AnimatedNumber 
            className="text-2xl font-bold text-white" 
            value={me?.points ?? 0} 
            ariaLabel={`My points ${me?.points ?? 0}`} 
          />
        </div>
        <div className="card-neuro p-4 text-center">
          <p className="text-sm text-gray-300 mb-2">My Rank</p>
          <p className="text-2xl font-bold text-white tabular-nums">
            {meRank >= 0 ? `#${meRank + 1}` : "—"}
          </p>
        </div>
      </div>

      {/* Activity Card with Organic Shape */}
      <div className="card blob p-6 text-center">
        <div className="glow-effect inline-block">
          <p className="text-gray-300">🚀 Stay tuned for live activity…</p>
        </div>
      </div>
    </div>
  );
}
