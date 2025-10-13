"use client";

import { useState } from "react";
import { Button } from "../Button";
import { useToast } from "~/components/ui/Toast";
import { AnimatedNumber } from "~/components/ui/AnimatedNumber";
import { useChampionGame } from "~/hooks/useChampionGame";
import { useAccount } from "wagmi";
import { useMode } from "~/components/providers/ModeProvider";
import { parseEther } from "viem";

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
  } = useChampionGame();
  const [fundAmount, setFundAmount] = useState<string>("0.01");

  return (
    <div className="space-y-6 px-4">
      {/* On-chain Overview */}
      <div className="card-floating p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold">Pulse Champion</h3>
            <p className="text-sm opacity-75 mt-1">Mode: {mode} • Chain ID: {desiredChain.id} • Round: {currentRoundId ? Number(currentRoundId) : '—'}</p>
          </div>
          {!onDesiredChain && (
            <div className="text-xs text-red-400">Switch to {desiredChain.name} to interact</div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="card-neuro p-4 text-center">
            <p className="text-sm opacity-75 mb-2">My Score (round)</p>
            <AnimatedNumber className="text-2xl font-bold" value={Number(myScore)} />
          </div>
          <div className="card-neuro p-4 text-center">
            <p className="text-sm opacity-75 mb-2">Contract</p>
            <p className="text-xs break-all opacity-80">{gameAddress ?? 'not set'}</p>
          </div>
        </div>
      </div>

      {/* Round Controls + Work/Fund */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-75">Prize Pool</p>
            <p className="text-xl font-bold">{prizePool ? String(prizePool) : '0'} wei</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-75">Ends</p>
            <p className="font-mono">{endTime ? new Date(Number(endTime) * 1000).toLocaleString() : '—'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Button
            variant="primary"
            disabled={!onDesiredChain || isPending || !currentRoundId || (endTime ? Date.now() >= Number(endTime) * 1000 : false) || !isValidContract}
            onClick={async () => {
              try { await work(); addSuccess('Worked!'); } catch (e: any) { addError(e?.message || 'Failed to work'); }
            }}
          >
            Work (once per hour)
          </Button>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder={`Amount in ${desiredChain.nativeCurrency.symbol}`}
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              inputMode="decimal"
            />
            <Button
              variant="secondary"
              disabled={!onDesiredChain || isPending || !currentRoundId || !fundAmount || !isValidContract}
              onClick={async () => {
                try {
                  const wei = parseEther(fundAmount as `${number}`);
                  await fund(wei);
                  addSuccess('Funded');
                } catch (e: any) {
                  addError(e?.message || 'Failed to fund');
                }
              }}
            >
              Fund
            </Button>
          </div>
        </div>

        {!currentRoundId && (
          <div className="text-xs opacity-80 mt-2">No active round. The owner can start a round from the Profile tab.</div>
        )}

        <div className="mt-4">
          <h4 className="font-semibold mb-2">Top 3 (live)</h4>
          <ul className="space-y-1 text-sm">
            {topPlayers.map((p, i) => (
              <li key={i} className="flex justify-between">
                <span className="opacity-80">#{i + 1} {p && p !== '0x0000000000000000000000000000000000000000' ? `${p.slice(0,6)}…${p.slice(-4)}` : '—'}</span>
                <span className="font-mono">{topScores[i] ? String(topScores[i]) : '0'}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-1 gap-2 pt-2 border-t border-white/10">
          <Button disabled={!onDesiredChain || isPending || !currentRoundId || !endTime || Date.now() < Number(endTime) * 1000 || !isValidContract} onClick={async () => { try { await settleRound(); addSuccess('Round settled'); } catch (e: any) { addError(e?.message || 'Failed settle'); }}}>Settle Round (anyone)</Button>
        </div>
      </div>

      {/* Info */}
      <div className="card p-6">
        <p className="opacity-80 text-sm">Gameplay: click Work once per hour. Earlier clicks in the hour earn more points. Rounds last 5 days; prize pool can be funded by anyone; top 3 split 50/30/20 when settled.</p>
        {!isValidContract && <p className="opacity-80 text-sm mt-2 text-red-400">Configured contract doesn’t implement the game interface. Update NEXT_PUBLIC_CHAMPION_GAME_{mode === 'celo' ? 'CELO' : 'BASE'}.</p>}
      </div>
    </div>
  );
}
