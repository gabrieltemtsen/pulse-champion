"use client";

import { useMiniApp } from "@neynar/react";
import { useAccount, useSwitchChain, usePublicClient } from "wagmi";
import { useMode } from "~/components/providers/ModeProvider";
import { useGameEnv } from "~/components/providers/GameEnvProvider";
import { useChampionGame } from "~/hooks/useChampionGame";
import { Button } from "../Button";
import { useToast } from "~/components/ui/Toast";

export function ProfileTab() {
  const { context } = useMiniApp();
  const { address, isConnected } = useAccount();
  const { addSuccess, addError } = useToast();
  const { mode } = useMode();
  const { isOwner, onDesiredChain, desiredChain, startRound, gameAddress, owner, roundActive, endTime, isValidContract, refresh } = useChampionGame();
  const { env, setEnv } = useGameEnv();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const publicClient = usePublicClient();

  return (
    <div className="px-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2 glow-effect">👤 Profile</h2>
        <p className="text-gray-300">Manage your account settings and preferences</p>
      </div>

      {/* User Info Card */}
      <div className="card-floating p-6 animate-in fade-in duration-200">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src={context?.user?.pfpUrl || ''} 
              alt="Your avatar" 
              className="w-16 h-16 rounded-full border-2 border-blue-400/50 glow-effect bg-gray-700" 
            />
            <div className="absolute inset-0 rounded-full animate-pulse bg-blue-400/10" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {context?.user?.displayName || context?.user?.username || 'Guest'}
            </h3>
            {context?.user?.username && (
              <p className="text-gray-300 mt-1">@{context.user.username}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-green-400">Active Player</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Card */}
      <div className="card-neuro p-5 animate-in fade-in duration-300">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-white">💳 Wallet Connection</h4>
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
        </div>
        {isConnected ? (
          <div>
            <p className="text-sm text-gray-300 mb-1">Connected Address</p>
            <div className="bg-black/20 p-3 rounded-lg border border-blue-400/20">
              <p className="text-xs text-gray-300 font-mono break-all">{address}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-400 text-sm">No wallet connected</p>
            <p className="text-xs text-gray-500 mt-1">Connect to claim rewards</p>
          </div>
        )}
      </div>

      {/* Admin Controls */}
      <div className="card p-5 animate-in fade-in duration-300">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-white">🔐 Admin</h4>
          <div className="text-xs opacity-80">Contract: <span className="font-mono">{gameAddress ?? 'not set'}</span></div>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs opacity-80">Environment:</span>
          <div className="mode-toggle flex items-center border border-white/20">
            <button aria-pressed={env === 'prod'} className={`px-2 py-1 text-xs ${env === 'prod' ? 'bg-white text-black' : ''}`} onClick={() => setEnv('prod')}>Production</button>
            <button aria-pressed={env === 'staging'} className={`px-2 py-1 text-xs ${env === 'staging' ? 'bg-white text-black' : ''}`} onClick={() => setEnv('staging')}>Staging</button>
          </div>
        </div>
        {!isValidContract && (
          <div className="text-sm text-red-400">The configured contract does not match the game interface. Please set NEXT_PUBLIC_CHAMPION_GAME_{mode === 'celo' ? 'CELO' : 'BASE'} to the PulseChampionGame address.</div>
        )}
        {isOwner ? (
          <div className="space-y-2">
            <p className="text-xs text-gray-400">You are the owner. Chain: {desiredChain.name}</p>
            <p className="text-xs text-gray-400">Active round: {roundActive ? 'Yes' : 'No'}{endTime ? ` • Ends: ${new Date(Number(endTime) * 1000).toLocaleString()}` : ''}</p>
            {!onDesiredChain && (
              <Button
                variant="secondary"
                disabled={isSwitching}
                onClick={() => switchChain({ chainId: desiredChain.id })}
              >
                Switch to {desiredChain.name}
              </Button>
            )}
            <Button
              disabled={!onDesiredChain || roundActive || !isValidContract}
              onClick={async () => { try { const hash = await startRound(); if (publicClient && hash) { await publicClient.waitForTransactionReceipt({ hash }); } refresh(); addSuccess('Round started'); } catch (e: any) { addError(e?.message || 'Failed to start'); } }}
            >
              Start Round
            </Button>
            <div className="text-xs text-gray-400">
              <div>Owner on chain: <span className="font-mono">{owner}</span></div>
              <div>Your address: <span className="font-mono">{address}</span></div>
              <div>Status: {onDesiredChain ? 'On correct chain' : 'Wrong chain'}</div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Connect the owner wallet to manage rounds.</p>
        )}
      </div>

      {/* Settings Card */}
      <div className="card-floating p-5 animate-in fade-in duration-400">
        <h4 className="font-semibold text-white mb-4">⚙️ Preferences</h4>
        
        {/* Notifications Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-white">Round Updates</span>
            <p className="text-xs text-gray-400 mt-1">Get notified about new rounds</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked="false"
            className="inline-flex items-center cursor-pointer focus-ring rounded-full ml-4"
            aria-label="Toggle round update notifications"
          >
            <span className="w-12 h-6 bg-gray-600 rounded-full relative transition-colors duration-300 hover:bg-gray-500">
              <span className="absolute left-1 top-1 h-4 w-4 bg-white rounded-full shadow-lg transition-transform duration-300" />
            </span>
          </button>
        </div>
      </div>

      {/* Stats Card */}
      <div className="card blob p-6 text-center animate-in fade-in duration-500">
        <div className="glow-effect inline-block">
          <p className="text-gray-300 mb-2">🚀 Keep playing to unlock more features!</p>
          <p className="text-sm text-gray-400">Build your reputation in Pulse Champion</p>
        </div>
      </div>
    </div>
  );
}
