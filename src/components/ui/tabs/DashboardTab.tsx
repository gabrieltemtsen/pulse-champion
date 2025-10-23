"use client";

import { useState } from "react";
import { Button } from "../Button";
import { useToast } from "~/components/ui/Toast";
import { AnimatedNumber } from "~/components/ui/AnimatedNumber";
import { useChampionGame } from "~/hooks/useChampionGame";
import { useAccount, usePublicClient } from "wagmi";
import { useMode } from "~/components/providers/ModeProvider";
import { parseEther, formatEther } from "viem";
import { useFarcasterNames } from "~/hooks/useFarcasterNames";

function msToHMS(ms: number) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function DashboardTab() {
  const { mode } = useMode();
  const { address, isConnected } = useAccount();
  const { addSuccess, addError } = useToast();
  const {
    desiredChain,
    onDesiredChain,
    gameAddress,
    isOwner,
    currentRoundId,
    startTime,
    endTime,
    prizePool,
    topPlayers,
    topScores,
    settled,
    myScore,
    isPending,
    work,
    fund,
    startRound,
    settleRound,
    isValidContract,
    alreadyWorkedThisHour,
    nextWorkInSec,
    refresh,
  } = useChampionGame();
  const [fundAmount, setFundAmount] = useState<string>("0.01");
  const [showHow, setShowHow] = useState<boolean>(false);
  const publicClient = usePublicClient();
  const roundEnded = !!endTime && Date.now() >= Number(endTime) * 1000;
  const statusLabel = settled ? "Settled" : roundEnded ? "Ended" : "Active";
  const { namesByAddress } = useFarcasterNames(topPlayers);

  return (
    <div className="space-y-6 px-4">
      {/* On-chain Overview */}
      <div className="card-floating p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold">Pulse Champion</h3>
          </div>
          {!onDesiredChain && (
            <div className="text-xs text-red-400">Switch to {desiredChain.name} to interact</div>
          )}
        </div>
        <div className="mt-6 flex justify-center">
          <div className="card-neuro p-4 text-center w-full max-w-xs">
            <p className="text-sm opacity-75 mb-2">My Score (round)</p>
            <AnimatedNumber className="text-2xl font-bold" value={Number(myScore)} />
            {(() => {
              const idx = topPlayers.findIndex((p) => p && address && p.toLowerCase() === address.toLowerCase());
              return <p className="text-xs text-gray-300 mt-1">Position: {idx >= 0 ? `#${idx + 1}` : '—'}</p>;
            })()}
          </div>
        </div>
      </div>

      {/* Round Controls + Work/Fund */}
      <div className="card p-6 space-y-5 relative">
        <div className="flex items-center justify-between text-xs">
          <span className={`px-2 py-1 rounded ${settled ? 'bg-green-500/20 text-green-300' : roundEnded ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'}`}>{statusLabel} round</span>
          {roundEnded && !settled && <span className="opacity-80">Anyone can settle the round</span>}
        </div>
        {/* Summary row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm opacity-75">Prize Pool</p>
            <p className="text-2xl font-bold">
              {prizePool ? Number(formatEther(prizePool)).toLocaleString(undefined, { maximumFractionDigits: 4 }) : '0'} {desiredChain.nativeCurrency.symbol}
            </p>
          </div>
          <div>
            <p className="text-sm opacity-75">Ends</p>
            <p className="font-mono text-sm">{endTime ? new Date(Number(endTime) * 1000).toLocaleString() : '—'}</p>
          </div>
        </div>

        {/* Deposit panel */}
        <div className="rounded border border-white/10 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm opacity-75">Fund Prize Pool</p>
            <p className="text-xs opacity-60">{onDesiredChain ? desiredChain.name : 'Wrong chain'}</p>
          </div>
          {(() => {
            let amountOk = false;
            try { amountOk = !!fundAmount && parseEther(fundAmount) > 0n; } catch { amountOk = false; }
            const roundEnded = !!endTime && Date.now() >= Number(endTime) * 1000;
            const canDeposit = onDesiredChain && !isPending && !!currentRoundId && isValidContract && amountOk && !roundEnded;
            return (
              <>
                {/* Input row */}
                <div className="flex flex-wrap gap-2 items-center">
                  <input
                    className="input flex-1 min-w-0"
                    placeholder={`0.00 ${desiredChain.nativeCurrency.symbol}`}
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    inputMode="decimal"
                  />
                  <div className="text-xs px-2 py-1 border border-white/20">{desiredChain.nativeCurrency.symbol}</div>
                  <Button
                    variant="secondary"
                    className="w-full sm:w-auto"
                    disabled={!canDeposit}
                    onClick={async () => {
                      try {
                        const wei = parseEther(fundAmount);
                        const hash = await fund(wei);
                        if (publicClient && hash) {
                          await publicClient.waitForTransactionReceipt({ hash });
                        }
                        refresh();
                        addSuccess('Deposit confirmed');
                      } catch (e: any) {
                        addError(e?.message || 'Failed to deposit');
                      }
                    }}
                  >
                    Deposit
                  </Button>
                </div>
                {/* Presets */}
                <div className="flex flex-wrap gap-2">
                  {['0.01','0.05','0.1'].map((preset) => (
                    <button key={preset} type="button" className="btn btn-secondary px-2 py-1 text-xs" onClick={() => setFundAmount(preset)}>
                      {preset} {desiredChain.nativeCurrency.symbol}
                    </button>
                  ))}
                </div>
                {/* Helpers */}
                {!amountOk && fundAmount && (
                  <p className="text-xs text-red-400">Enter a valid amount (e.g., 0.01)</p>
                )}
                {!currentRoundId && (
                  <p className="text-xs opacity-70">No active round. Owner can start a round from Profile.</p>
                )}
                {!!endTime && Date.now() >= Number(endTime) * 1000 && (
                  <p className="text-xs opacity-70">Funding disabled after round end.</p>
                )}
              </>
            );
          })()}
        </div>

        <div className="flex flex-col items-center gap-2">
          <Button
            variant="primary"
            disabled={!onDesiredChain || isPending || !currentRoundId || (endTime ? Date.now() >= Number(endTime) * 1000 : false) || !isValidContract || alreadyWorkedThisHour}
            onClick={async () => {
              try {
                const hash = await work();
                if (!hash) throw new Error('Transaction was not initiated');
                if (publicClient) {
                  await publicClient.waitForTransactionReceipt({ hash });
                }
                refresh();
                addSuccess('Work confirmed');
              } catch (e: any) { addError(e?.message || 'Failed to work'); }
            }}
          >
            Work once per hour
          </Button>
          {alreadyWorkedThisHour && (
            <div className="text-xs opacity-80 self-center">Next work in {Math.floor(nextWorkInSec / 60)}:{String(nextWorkInSec % 60).padStart(2, '0')}</div>
          )}
          <div className="w-full flex items-center justify-end">
            <button type="button" className="text-sm underline opacity-90 hover:opacity-100" onClick={() => setShowHow((v) => !v)} aria-expanded={showHow} aria-controls="how-it-works">
              How it works
            </button>
          </div>
          {showHow && (
            <div id="how-it-works" role="dialog" aria-label="How the game works" className="absolute right-3 -top-2 w-80 card-neuro p-4 z-30 border border-white/10">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold">How it works</h4>
                <button type="button" className="text-sm opacity-80 hover:opacity-100" onClick={() => setShowHow(false)} aria-label="Close">
                  ✕
                </button>
              </div>
              <ul className="text-sm space-y-2">
                <li>• Click <strong>Work</strong> once per hour — earlier in the hour scores more.</li>
                <li>• Anyone can <strong>Fund</strong> the prize pool during an active round.</li>
                <li>• When the round ends, anyone can <strong>Settle</strong>. Top 3 split 50/30/20.</li>
              </ul>
            </div>
          )}
        </div>

        {!currentRoundId && (
          <div className="text-xs opacity-80 mt-2">No active round. The owner can start a round from the Profile tab.</div>
        )}

        <div className="mt-4">
          <h4 className="font-semibold mb-2">Top 3 (live)</h4>
          <ul className="space-y-1 text-sm">
            {topPlayers.map((p, i) => {
              const lower = (p || '').toLowerCase();
              const name = namesByAddress[lower];
              const label = name || (p && p !== '0x0000000000000000000000000000000000000000' ? `${p.slice(0,6)}…${p.slice(-4)}` : '—');
              return (
                <li key={i} className="flex justify-between">
                  <span className="opacity-80">#{i + 1} {label}</span>
                  <span className="font-mono">{topScores[i] ? String(topScores[i]) : '0'}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="grid grid-cols-1 gap-2 pt-2 border-t border-white/10">
          <Button disabled={!onDesiredChain || isPending || !currentRoundId || !endTime || Date.now() < Number(endTime) * 1000 || !isValidContract} onClick={async () => { try { const hash = await settleRound(); if (!hash) throw new Error('Transaction was not initiated'); if (publicClient) { await publicClient.waitForTransactionReceipt({ hash }); } refresh(); addSuccess('Round settled'); } catch (e: any) { addError(e?.message || 'Failed settle'); }}}>Settle Round</Button>
        </div>
      </div>

      {/* Production: suppress developer configuration warnings from the main UI */}
    </div>
  );
}
