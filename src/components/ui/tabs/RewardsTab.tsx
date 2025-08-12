"use client";

import { Button } from "../Button";
import { useRewards } from "~/hooks/useGameData";
import { useToast } from "~/components/ui/Toast";

export function RewardsTab() {
  const { claims, claim, busyId, error } = useRewards();
  const { addSuccess, addError } = useToast();

  const onClaim = async (roundId: number) => {
    try {
      await claim(roundId);
      addSuccess(`Reward for round #${roundId} claimed!`);
    } catch (e: any) {
      addError(e?.message || "Claim failed");
    }
  };

  return (
    <div className="px-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2 glow-effect">💰 Rewards</h2>
        <p className="text-gray-300">Claim your earned rewards from completed rounds</p>
      </div>

      {/* Rewards List */}
      <div className="space-y-3">
        {claims.map((c, index) => (
          <div 
            key={c.roundId} 
            className="card-floating p-5 animate-in fade-in slide-in-from-bottom-2 duration-200"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Round Badge */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">#{c.roundId}</span>
                </div>
                
                <div>
                  <p className="font-semibold text-white">Round #{c.roundId}</p>
                  <p className="text-gray-300 text-sm">Reward: {c.amount} CELO</p>
                  {c.txHash && (
                    <p className="text-xs text-gray-400 mt-1">
                      Tx: {c.txHash.slice(0, 8)}...{c.txHash.slice(-6)}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Claim Status/Button */}
              <div>
                {c.claimed ? (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-green-400/20 border border-green-400/30 flex items-center justify-center mb-1">
                      <span className="text-green-400 text-xl">✓</span>
                    </div>
                    <span className="text-xs text-green-400">Claimed</span>
                  </div>
                ) : (
                  <Button 
                    onClick={() => onClaim(c.roundId)} 
                    isLoading={busyId === c.roundId} 
                    variant="pulse"
                    className="px-6 py-2 text-sm font-semibold"
                  >
                    Claim
                  </Button>
                )}
              </div>
            </div>
            
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 rounded-[var(--border-radius-organic)] opacity-0 hover:opacity-10 transition-opacity duration-300 bg-gradient-to-r from-green-400 to-emerald-500 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Empty State */}
      {claims.length === 0 && (
        <div className="card blob p-8 text-center">
          <div className="glow-effect inline-block">
            <p className="text-gray-300 mb-2">🎁 No rewards available yet</p>
            <p className="text-sm text-gray-400">Complete rounds to earn claimable rewards!</p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="text-center">
          <div className="inline-block px-4 py-2 bg-red-400/20 border border-red-400/30 rounded-full">
            <p className="text-sm text-red-300" role="alert">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
