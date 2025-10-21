"use client";

import { AnimatedNumber } from "~/components/ui/AnimatedNumber";
import { useChampionGame } from "~/hooks/useChampionGame";
import { getAddressUrl } from "~/lib/explorers";
import { useMode } from "~/components/providers/ModeProvider";
import { useAccount } from "wagmi";

export function LeaderboardTab() {
  const { address } = useAccount();
  const { topPlayers, topScores, myScore, desiredChain } = useChampionGame();
  const chainId = desiredChain.id;
  const entries = topPlayers.map((p, i) => ({ address: p, score: topScores[i] ?? 0n }));

  return (
    <div className="px-4 space-y-6">
      {/* Header with Glow Effect */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2 glow-effect">🏆 Leaderboard</h2>
        <p className="text-gray-300">Top champions in the current round</p>
      </div>

      {/* Top 3 with Floating Cards */}
      <div className="space-y-3">
        {entries.map((p, i) => (
          <div 
            key={i} 
            className={`card-floating p-4 animate-in fade-in slide-in-from-bottom-2 duration-200 ${
              i === 0 ? 'card-primary' : ''
            }`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Rank Badge */}
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${
                  i === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
                  i === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-white' :
                  i === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white' :
                  'bg-gradient-to-r from-blue-400 to-cyan-400 text-white'
                }`}>
                  {i + 1}
                </div>
                
                {/* Player Info */}
                <div>
                  <p className="font-semibold text-white">
                    {p.address && p.address !== '0x0000000000000000000000000000000000000000'
                      ? (() => {
                          const url = getAddressUrl(chainId, p.address as `0x${string}`);
                          const label = `${p.address.slice(0,6)}…${p.address.slice(-4)}`;
                          return url ? <a className="underline" href={url} target="_blank" rel="noreferrer">{label}</a> : label;
                        })()
                      : '—'}
                  </p>
                  <p className="text-xs text-gray-300">Address</p>
                </div>
              </div>
              
              {/* Points with Animated Number */}
              <div className="text-right">
                <AnimatedNumber 
                  className="text-xl font-bold text-white" 
                  value={Number(p.score || 0n)} 
                />
                <p className="text-xs text-gray-300">points</p>
              </div>
            </div>
            
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 rounded-[var(--border-radius-organic)] opacity-0 hover:opacity-20 transition-opacity duration-300 bg-gradient-to-r from-blue-400 to-cyan-400 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* My score */}
      {address && (
        <div className="card-neuro p-4 text-center">
          <p className="text-sm text-gray-300 mb-1">Your current round score</p>
          <p className="text-2xl font-bold text-white">{String(myScore)}</p>
        </div>
      )}

      <div className="card p-4 text-center">
        <p className="text-sm opacity-80">Work early each hour to maximize points. Top 3 split the pool when the round ends.</p>
      </div>
    </div>
  );
}
