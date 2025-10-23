"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useAccount, useChainId, usePublicClient, useReadContract, useWriteContract } from "wagmi";
import { PulseChampionGameAbi } from "~/lib/abi/PulseChampionGame";
import { useMode } from "~/components/providers/ModeProvider";
import { base, celo } from "wagmi/chains";
import { CHAMPION_GAME_ADDRESSES } from "~/lib/gameAddresses";

export function useChampionGame() {
  const { mode } = useMode();
  const chainId = useChainId();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const gameAddress = mode === "celo" ? CHAMPION_GAME_ADDRESSES.celo : CHAMPION_GAME_ADDRESSES.base;
  const desiredChain = mode === "celo" ? celo : base;
  const onDesiredChain = Number(chainId) === desiredChain.id;

  const { data: currentRound, isError: isRoundError, refetch: refetchCurrentRound } = useReadContract({
    abi: PulseChampionGameAbi,
    address: gameAddress,
    functionName: "getCurrentRound",
    query: { enabled: Boolean(gameAddress) },
  });

  const { data: active, isError: isActiveError, refetch: refetchActive } = useReadContract({
    abi: PulseChampionGameAbi,
    address: gameAddress,
    functionName: "roundActive",
    query: { enabled: Boolean(gameAddress) },
  });

  const currentRoundId = (currentRound as any)?.id as bigint | undefined;
  const startTime = (currentRound as any)?.startTime as bigint | undefined;
  const endTime = (currentRound as any)?.endTime as bigint | undefined;
  const prizePool = (currentRound as any)?.prizePool as bigint | undefined;
  const topPlayers = ((currentRound as any)?.topPlayers as `0x${string}`[] | undefined) || [];
  const topScores = ((currentRound as any)?.topScores as bigint[] | undefined) || [];
  const settled = (currentRound as any)?.settled as boolean | undefined;

  const { data: myScore, refetch: refetchMyScore } = useReadContract({
    abi: PulseChampionGameAbi,
    address: gameAddress,
    functionName: "totalScores",
    args: currentRoundId && address ? [currentRoundId, address] : undefined,
    query: { enabled: Boolean(gameAddress && currentRoundId && address) },
  });

  const { writeContractAsync, isPending } = useWriteContract();

  const { data: owner, refetch: refetchOwner } = useReadContract({
    abi: PulseChampionGameAbi,
    address: gameAddress,
    functionName: "owner",
    query: { enabled: Boolean(gameAddress) },
  });

  const isOwner = !!owner && !!address && (owner as string).toLowerCase() === address.toLowerCase();

  // Detect if a contract is actually deployed at the configured address on the current chain
  const [hasContract, setHasContract] = useState<boolean | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!gameAddress || !publicClient) { setHasContract(null); return; }
      try {
        const code = await publicClient.getBytecode({ address: gameAddress });
        if (!cancelled) setHasContract(Boolean(code));
      } catch {
        if (!cancelled) setHasContract(null);
      }
    })();
    return () => { cancelled = true; };
  }, [gameAddress, publicClient, desiredChain.id, chainId]);

  // Last worked hour and countdown helpers
  const { data: lastWorked, refetch: refetchLastWorked } = useReadContract({
    abi: PulseChampionGameAbi,
    address: gameAddress,
    functionName: "lastWorkedHour",
    args: currentRoundId && address ? [currentRoundId, address] : undefined,
    query: { enabled: Boolean(gameAddress && currentRoundId && address) },
  });

  const [nowSec, setNowSec] = useState<number>(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const t = setInterval(() => setNowSec(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  const start = Number(startTime || 0n);
  const elapsed = start > 0 ? Math.max(0, nowSec - start) : 0;
  const HOUR = 3600;
  const currentHourIndex = start > 0 ? Math.floor(elapsed / HOUR) : -1;
  const lastHour = lastWorked ? Number(lastWorked) : -1;
  const alreadyWorkedThisHour = currentHourIndex >= 0 && lastHour === currentHourIndex;
  const nextWorkInSec = alreadyWorkedThisHour ? (HOUR - (elapsed % HOUR)) : 0;

  const work = useCallback(async () => {
    if (!gameAddress) throw new Error("Game address missing");
    try {
      if (publicClient && address) {
        const code = await publicClient.getBytecode({ address: gameAddress });
        if (!code) throw new Error('No contract found at configured address on this chain');
        await publicClient.simulateContract({ abi: PulseChampionGameAbi, address: gameAddress, functionName: "work", account: address as `0x${string}` });
      }
    } catch (e: any) {
      throw new Error(e?.shortMessage || e?.cause?.shortMessage || e?.details || e?.message || 'Execution reverted');
    }
    return writeContractAsync({ abi: PulseChampionGameAbi, address: gameAddress, functionName: "work" });
  }, [gameAddress, writeContractAsync, publicClient, address, owner, active]);

  const fund = useCallback(async (value: bigint) => {
    if (!gameAddress) throw new Error("Game address missing");
    try {
      if (publicClient && address) {
        const code = await publicClient.getBytecode({ address: gameAddress });
        if (!code) throw new Error('No contract found at configured address on this chain');
        await publicClient.simulateContract({ abi: PulseChampionGameAbi, address: gameAddress, functionName: "fundCurrentRound", account: address as `0x${string}`, value });
      }
    } catch (e: any) {
      throw new Error(e?.shortMessage || e?.cause?.shortMessage || e?.details || e?.message || 'Execution reverted');
    }
    return writeContractAsync({ abi: PulseChampionGameAbi, address: gameAddress, functionName: "fundCurrentRound", value });
  }, [gameAddress, writeContractAsync, publicClient, address]);

  const startRound = useCallback(async () => {
    if (!gameAddress) throw new Error("Game address missing");
    if (owner && address && (owner as string).toLowerCase() !== address.toLowerCase()) {
      throw new Error('Only the contract owner can start a round');
    }
    if (Boolean(active)) {
      throw new Error('Round already active');
    }
    try {
      if (publicClient && address) {
        const code = await publicClient.getBytecode({ address: gameAddress });
        if (!code) throw new Error('No contract found at configured address on this chain');
        await publicClient.simulateContract({ abi: PulseChampionGameAbi, address: gameAddress, functionName: "startRound", account: address as `0x${string}` });
      }
    } catch (e: any) {
      throw new Error(e?.shortMessage || e?.cause?.shortMessage || e?.details || e?.message || 'Execution reverted');
    }
    return writeContractAsync({ abi: PulseChampionGameAbi, address: gameAddress, functionName: "startRound" });
  }, [gameAddress, writeContractAsync, publicClient, address]);

  const settleRound = useCallback(async () => {
    if (!gameAddress || !currentRoundId) throw new Error("Game address or round missing");
    try {
      if (publicClient && address) {
        const code = await publicClient.getBytecode({ address: gameAddress });
        if (!code) throw new Error('No contract found at configured address on this chain');
        await publicClient.simulateContract({ abi: PulseChampionGameAbi, address: gameAddress, functionName: "settleRound", args: [currentRoundId], account: address as `0x${string}` });
      }
    } catch (e: any) {
      throw new Error(e?.shortMessage || e?.cause?.shortMessage || e?.details || e?.message || 'Execution reverted');
    }
    return writeContractAsync({ abi: PulseChampionGameAbi, address: gameAddress, functionName: "settleRound", args: [currentRoundId] });
  }, [gameAddress, writeContractAsync, currentRoundId, publicClient, address]);

  return {
    mode,
    desiredChain,
    onDesiredChain,
    address,
    gameAddress,
    owner: owner as string | undefined,
    isOwner,
    roundActive: Boolean(active),
    isValidContract: Boolean(gameAddress) && !isRoundError && !isActiveError,
    currentRoundId,
    startTime,
    endTime,
    prizePool,
    topPlayers,
    topScores,
    settled,
    myScore: (myScore as bigint | undefined) ?? 0n,
    isPending,
    alreadyWorkedThisHour,
    nextWorkInSec,
    work,
    fund,
    startRound,
    settleRound,
    refresh: () => {
      try { refetchCurrentRound?.(); } catch {}
      try { refetchActive?.(); } catch {}
      try { refetchMyScore?.(); } catch {}
      try { refetchOwner?.(); } catch {}
      try { refetchLastWorked?.(); } catch {}
      (async () => {
        try {
          if (publicClient && gameAddress) {
            const code = await publicClient.getBytecode({ address: gameAddress });
            setHasContract(Boolean(code));
          }
        } catch {}
      })();
    },
    hasContract,
  };
}
