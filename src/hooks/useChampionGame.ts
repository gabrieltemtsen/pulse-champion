"use client";

import { useCallback, useMemo, useState } from "react";
import { useAccount, useChainId, useReadContract, useWriteContract } from "wagmi";
import { PulseChampionGameAbi } from "~/lib/abi/PulseChampionGame";
import { useMode } from "~/components/providers/ModeProvider";
import { base, celo } from "wagmi/chains";

function getGameAddress(mode: "base" | "celo") {
  const key = mode === "base" ? "NEXT_PUBLIC_CHAMPION_GAME_BASE" : "NEXT_PUBLIC_CHAMPION_GAME_CELO";
  return (process.env[key] as `0x${string}` | undefined) || undefined;
}

export function useChampionGame() {
  const { mode } = useMode();
  const chainId = useChainId();
  const { address } = useAccount();
  const gameAddress = getGameAddress(mode);
  const desiredChain = mode === "celo" ? celo : base;
  const onDesiredChain = Number(chainId) === desiredChain.id;

  const { data: currentRound } = useReadContract({
    abi: PulseChampionGameAbi,
    address: gameAddress,
    functionName: "getCurrentRound",
    query: { enabled: Boolean(gameAddress) },
  });

  const currentRoundId = (currentRound as any)?.id as bigint | undefined;
  const startTime = (currentRound as any)?.startTime as bigint | undefined;
  const endTime = (currentRound as any)?.endTime as bigint | undefined;
  const prizePool = (currentRound as any)?.prizePool as bigint | undefined;
  const topPlayers = ((currentRound as any)?.topPlayers as `0x${string}`[] | undefined) || [];
  const topScores = ((currentRound as any)?.topScores as bigint[] | undefined) || [];
  const settled = (currentRound as any)?.settled as boolean | undefined;

  const { data: myScore } = useReadContract({
    abi: PulseChampionGameAbi,
    address: gameAddress,
    functionName: "totalScores",
    args: currentRoundId && address ? [currentRoundId, address] : undefined,
    query: { enabled: Boolean(gameAddress && currentRoundId && address) },
  });

  const { writeContract, isPending } = useWriteContract();

  const { data: owner } = useReadContract({
    abi: PulseChampionGameAbi,
    address: gameAddress,
    functionName: "owner",
    query: { enabled: Boolean(gameAddress) },
  });

  const isOwner = !!owner && !!address && (owner as string).toLowerCase() === address.toLowerCase();

  const work = useCallback(() => {
    if (!gameAddress) throw new Error("Game address missing");
    return writeContract({ abi: PulseChampionGameAbi, address: gameAddress, functionName: "work" });
  }, [gameAddress, writeContract]);

  const fund = useCallback((value: bigint) => {
    if (!gameAddress) throw new Error("Game address missing");
    return writeContract({ abi: PulseChampionGameAbi, address: gameAddress, functionName: "fundCurrentRound", value });
  }, [gameAddress, writeContract]);

  const startRound = useCallback(() => {
    if (!gameAddress) throw new Error("Game address missing");
    return writeContract({ abi: PulseChampionGameAbi, address: gameAddress, functionName: "startRound" });
  }, [gameAddress, writeContract]);

  const settleRound = useCallback(() => {
    if (!gameAddress || !currentRoundId) throw new Error("Game address or round missing");
    return writeContract({ abi: PulseChampionGameAbi, address: gameAddress, functionName: "settleRound", args: [currentRoundId] });
  }, [gameAddress, writeContract, currentRoundId]);

  return {
    mode,
    desiredChain,
    onDesiredChain,
    address,
    gameAddress,
    owner: owner as string | undefined,
    isOwner,
    currentRoundId,
    startTime,
    endTime,
    prizePool,
    topPlayers,
    topScores,
    settled,
    myScore: (myScore as bigint | undefined) ?? 0n,
    isPending,
    work,
    fund,
    startRound,
    settleRound,
  };
}
