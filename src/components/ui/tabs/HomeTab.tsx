"use client";

import { useState } from "react";
import { Button } from "../Button";
import { AnimatedNumber } from "../AnimatedNumber";
import { useChampionGame } from "~/hooks/useChampionGame";
import { useMode } from "~/components/providers/ModeProvider";
import { parseEther, formatEther } from "viem";

export function HomeTab() {
  const { mode } = useMode();
  const {
    desiredChain,
    onDesiredChain,
    currentRoundId,
    prizePool,
    endTime,
    isPending,
    isValidContract,
    work,
    fund,
    settleRound,
    alreadyWorkedThisHour,
    nextWorkInSec,
  } = useChampionGame();

  const [fundAmount, setFundAmount] = useState<string>("0.05");

  let amountOk = false;
  try { amountOk = !!fundAmount && parseEther(fundAmount) > 0n; } catch { amountOk = false; }
  const canDeposit = onDesiredChain && !isPending && !!currentRoundId && isValidContract && amountOk;

  const roundEnded = !!endTime && Date.now() >= Number(endTime) * 1000;
  const canWork = onDesiredChain && !isPending && !!currentRoundId && isValidContract && !roundEnded && !alreadyWorkedThisHour;
  const canSettle = onDesiredChain && !isPending && !!currentRoundId && !!endTime && roundEnded && isValidContract;
  const canDepositFinal = canDeposit && !roundEnded;

  return (
    <div className="px-4 space-y-5 max-w-md mx-auto">
      {/* Live Round Summary */}
      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs opacity-70 uppercase">Round</p>
            <p className="text-lg font-bold">{currentRoundId ? Number(currentRoundId) : '—'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-70">Ends</p>
            <p className="font-mono text-sm">{endTime ? new Date(Number(endTime) * 1000).toLocaleString() : '—'}</p>
          </div>
        </div>
        <div>
          <p className="text-xs opacity-70">Prize Pool</p>
          <p className="text-2xl font-bold">
            {prizePool ? Number(formatEther(prizePool)).toLocaleString(undefined, { maximumFractionDigits: 4 }) : '0'} {desiredChain.nativeCurrency.symbol}
          </p>
        </div>
      </div>

      {/* Work / Countdown */}
      <div className="card p-5 space-y-2">
        <Button
          variant="primary"
          disabled={!canWork}
          onClick={async () => { try { await work(); } catch {} }}
        >
          Work (once per hour)
        </Button>
        {!onDesiredChain && (
          <p className="text-xs text-red-400">Switch to {desiredChain.name} to interact.</p>
        )}
        {alreadyWorkedThisHour && (
          <p className="text-xs opacity-80">Next work in {Math.floor(nextWorkInSec / 60)}:{String(nextWorkInSec % 60).padStart(2, '0')}</p>
        )}
      </div>

      {/* Deposit Panel */}
      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm opacity-75">Fund Prize Pool</p>
          <p className="text-xs opacity-60">{onDesiredChain ? desiredChain.name : 'Wrong chain'}</p>
        </div>
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
            disabled={!canDepositFinal}
            onClick={async () => { try { await fund(parseEther(fundAmount)); } catch {} }}
          >
            Deposit
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {['0.01','0.05','0.1'].map((preset) => (
            <button key={preset} type="button" className="btn btn-secondary px-2 py-1 text-xs" onClick={() => setFundAmount(preset)}>
              {preset} {desiredChain.nativeCurrency.symbol}
            </button>
          ))}
        </div>
        {!amountOk && fundAmount && (
          <p className="text-xs text-red-400">Enter a valid amount (e.g., 0.01)</p>
        )}
        {!currentRoundId && (
          <p className="text-xs opacity-70">No active round. Owner can start a round from Profile.</p>
        )}
        {roundEnded && (
          <p className="text-xs opacity-70">Funding disabled after round end.</p>
        )}
      </div>

      {/* Settle */}
      <div className="card p-5">
        <Button
          disabled={!canSettle}
          onClick={async () => { try { await settleRound(); } catch {} }}
        >
          Settle Round (anyone)
        </Button>
      </div>
    </div>
  );
}
