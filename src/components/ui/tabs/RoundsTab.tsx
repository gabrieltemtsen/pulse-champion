"use client";

import { useRoundsHistory } from "~/hooks/useGameData";

function format(ts: number) {
  const d = new Date(ts);
  return d.toLocaleString();
}

export function RoundsTab() {
  const { rounds } = useRoundsHistory();
  return (
    <div className="px-4 space-y-3" aria-live="polite">
      {rounds.map((r) => (
        <div key={r.id} className="card p-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Round #{r.id}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">{format(r.startTime)} → {format(r.endTime)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Reward</p>
              <p className="font-semibold">{r.rewardPool.toFixed(2)}</p>
            </div>
          </div>
          {r.winner && (
            <div className="mt-3 flex items-center gap-3">
              <img src={r.winner.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
              <div>
                <p className="text-sm">Winner: {r.winner.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{r.winner.points} pts</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
