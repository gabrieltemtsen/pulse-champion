"use client";

import { useChampionGameRounds } from "~/hooks/useChampionGameRounds";
import { getAddressUrl } from "~/lib/explorers";
import { useChampionGame } from "~/hooks/useChampionGame";
import { useFarcasterNames } from "~/hooks/useFarcasterNames";

export function RewardsTab() {
  const { rounds, isLoading } = useChampionGameRounds(10);
  const { desiredChain } = useChampionGame();
  const chainId = desiredChain.id;
  const settled = rounds.filter((r) => r && r.settled);
  const { namesByAddress } = useFarcasterNames(rounds.flatMap((r) => r?.topPlayers || []));

  return (
    <div className="px-4 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2 glow-effect">Rewards</h2>
        <p className="text-gray-300">Settled rounds and payouts</p>
      </div>

      {isLoading && <div className="spinner h-6 w-6 mx-auto" />}

      <div className="space-y-3">
        {settled.map((r, idx) => {
          if (!r) return null;
          const a1 = (r.prizePool * 50n) / 100n;
          const a2 = (r.prizePool * 30n) / 100n;
          const a3 = r.prizePool - a1 - a2;
          const amounts = [a1, a2, a3];
          return (
            <div key={r.id} className="card-floating p-5 animate-in fade-in slide-in-from-bottom-2 duration-200" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">Round #{r.id}</p>
                  <p className="text-gray-300 text-sm">Prize pool: {Number(formatEther(r.prizePool)).toLocaleString(undefined, { maximumFractionDigits: 4 })} {desiredChain.nativeCurrency.symbol}</p>
                </div>
                <div className="text-right text-xs opacity-80">Settled</div>
              </div>
              <div className="mt-3">
                <p className="text-xs opacity-75 mb-1">Winners</p>
                <ul className="text-sm space-y-1">
                  {r.topPlayers.map((p, i) => {
                    const lower = (p || '').toLowerCase();
                    const fc = namesByAddress[lower];
                    const content = fc
                      ? fc
                      : (p && p !== '0x0000000000000000000000000000000000000000'
                          ? (() => { const url = getAddressUrl(chainId, p as `0x${string}`); const label = `${p.slice(0,6)}…${p.slice(-4)}`; return url ? <a className="underline" href={url} target="_blank" rel="noreferrer">{label}</a> : label; })()
                          : '—');
                    return (
                      <li key={i} className="flex justify-between">
                        <span>#{i + 1} {content}</span>
                        <span className="font-mono">{Number(formatEther(amounts[i])).toLocaleString(undefined, { maximumFractionDigits: 4 })} {desiredChain.nativeCurrency.symbol}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {!isLoading && settled.length === 0 && (
        <div className="card p-6 text-center">
          <p className="text-gray-300 mb-2">No rounds settled yet</p>
          <p className="text-sm text-gray-400">Payouts are sent automatically when anyone settles a finished round.</p>
        </div>
      )}
    </div>
  );
}
import { formatEther } from "viem";
