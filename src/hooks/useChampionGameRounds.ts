"use client";

import { useMemo } from "react";
import { useReadContracts } from "wagmi";
import { PulseChampionGameAbi } from "~/lib/abi/PulseChampionGame";
import { useChampionGame } from "~/hooks/useChampionGame";

export function useChampionGameRounds(count: number = 10) {
  const { gameAddress, currentRoundId } = useChampionGame();
  const maxId = Number(currentRoundId || 0n);

  const ids = useMemo(() => {
    if (!maxId) return [] as number[];
    const start = Math.max(1, maxId - count + 1);
    return Array.from({ length: maxId - start + 1 }, (_, i) => start + i).reverse();
  }, [maxId, count]);

  const contracts = useMemo(() => ids.map((id) => ({
    abi: PulseChampionGameAbi,
    address: gameAddress!,
    functionName: "getRound" as const,
    args: [BigInt(id)],
  })), [ids, gameAddress]);

  const { data, isLoading } = useReadContracts({
    contracts,
    query: { enabled: Boolean(gameAddress && ids.length > 0) },
  });

  const rounds = useMemo(() => (
    (data || []).map((res, i) => {
      const r: any = res?.result;
      return r ? {
        id: Number(r.id),
        startTime: Number(r.startTime),
        endTime: Number(r.endTime),
        prizePool: r.prizePool as bigint,
        settled: r.settled as boolean,
        topPlayers: r.topPlayers as `0x${string}`[],
        topScores: r.topScores as bigint[],
        totalPlayers: Number(r.totalPlayers),
      } : null;
    }).filter(Boolean)
  ), [data]);

  return { ids, rounds, isLoading };
}

