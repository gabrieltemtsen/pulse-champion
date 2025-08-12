"use client";

import { useMiniApp } from "@neynar/react";
import { useLeaderboard } from "~/hooks/useGameData";
import { AnimatedNumber } from "~/components/ui/AnimatedNumber";

export function LeaderboardTab() {
  const { context } = useMiniApp();
  const meFid = context?.user?.fid;
  const { top5, me, meRank } = useLeaderboard(meFid);

  return (
    <div className="px-4 space-y-6">
      {/* Header with Glow Effect */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2 glow-effect">🏆 Leaderboard</h2>
        <p className="text-gray-300">Top champions in the current round</p>
      </div>

      {/* Top 5 with Floating Cards */}
      <div className="space-y-3">
        {top5.map((p, i) => (
          <div 
            key={p.fid} 
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
                  'bg-gradient-to-r from-purple-400 to-pink-400 text-white'
                }`}>
                  {i + 1}
                </div>
                
                {/* Avatar with Glow */}
                <div className="relative">
                  <img 
                    src={p.avatar} 
                    alt={`${p.name}'s avatar`} 
                    className="w-12 h-12 rounded-full border-2 border-purple-400/50 glow-effect" 
                  />
                  {i === 0 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-xs">👑</span>
                    </div>
                  )}
                </div>
                
                {/* Player Info */}
                <div>
                  <p className="font-semibold text-white">{p.name}</p>
                  <p className="text-xs text-gray-300">Player #{p.fid}</p>
                </div>
              </div>
              
              {/* Points with Animated Number */}
              <div className="text-right">
                <AnimatedNumber 
                  className="text-xl font-bold text-white" 
                  value={p.points} 
                />
                <p className="text-xs text-gray-300">points</p>
              </div>
            </div>
            
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 rounded-[var(--border-radius-organic)] opacity-0 hover:opacity-20 transition-opacity duration-300 bg-gradient-to-r from-purple-400 to-pink-400 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* My Position Card (if not in top 5) */}
      {me && meRank >= 5 && (
        <div className="relative">
          <div className="text-center mb-2">
            <p className="text-sm text-gray-400">Your Position</p>
          </div>
          <div className="card-neuro p-4 animate-in fade-in slide-in-from-bottom-2 duration-300 border border-purple-400/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* My Rank Badge */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 text-white font-bold text-lg">
                  {meRank + 1}
                </div>
                
                {/* My Avatar with Special Glow */}
                <div className="relative">
                  <img 
                    src={me.avatar} 
                    alt="Your avatar" 
                    className="w-12 h-12 rounded-full border-2 border-pink-400/50 glow-effect" 
                  />
                  <div className="absolute inset-0 rounded-full animate-ping bg-pink-400/20" />
                </div>
                
                <div>
                  <p className="font-semibold text-white">You</p>
                  <p className="text-xs text-gray-300">Keep climbing! 🚀</p>
                </div>
              </div>
              
              <div className="text-right">
                <AnimatedNumber 
                  className="text-xl font-bold text-white" 
                  value={me.points} 
                />
                <p className="text-xs text-gray-300">points</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Motivational Call-to-Action */}
      <div className="card blob p-6 text-center">
        <div className="glow-effect inline-block">
          <p className="text-gray-300 mb-2">💫 Ready to climb higher?</p>
          <p className="text-sm text-gray-400">Play more rounds to boost your ranking!</p>
        </div>
      </div>
    </div>
  );
}
