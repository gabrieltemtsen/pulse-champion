"use client";

import { useChampionGameRounds } from "~/hooks/useChampionGameRounds";
import { getAddressUrl } from "~/lib/explorers";
import { useChampionGame } from "~/hooks/useChampionGame";

function format(tsSec: number) {
  if (!tsSec) return "—";
  const d = new Date(tsSec * 1000);
  return d.toLocaleString();
}

export function RoundsTab() {
  const { rounds, isLoading } = useChampionGameRounds(10);
  const { desiredChain } = useChampionGame();
  const chainId = desiredChain.id;
  return (
    <div className="px-4 space-y-3" aria-live="polite">
      {isLoading && <div className="spinner h-6 w-6" />}
      {!isLoading && rounds.length === 0 && (
        <div className="card p-4 text-sm opacity-80">No rounds yet.</div>
      )}
      {rounds.map((r) => (
        r ? <div key={r.id} className="card p-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Round #{r.id}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">{format(r.startTime)} {'\u2192'} {format(r.endTime)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Prize Pool</p>
              <p className="font-semibold">{String(r.prizePool)} wei</p>
              <p className="text-xs mt-1">{r.settled ? 'Settled' : 'Active/Ended'}</p>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xs opacity-75 mb-1">Top 3</p>
            <ul className="text-sm space-y-1">
              {r.topPlayers.map((p, i) => (
                <li key={i} className="flex justify-between">
                  <span>
                    #{i + 1}{' '}{p && p !== '0x0000000000000000000000000000000000000000'
                      ? (() => { const url = getAddressUrl(chainId, p as `0x${string}`); const label = `${p.slice(0,6)}…${p.slice(-4)}`; return url ? <a className="underline" href={url} target="_blank" rel="noreferrer">{label}</a> : label; })()
                      : '—'}
                  </span>
                  <span className="font-mono">{String(r.topScores[i] || 0n)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div> : null
      ))}
    </div>
  );
}
