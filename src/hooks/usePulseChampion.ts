"use client";

import { useMemo } from "react";
import { useAccount, useChainId, useReadContract, useWriteContract } from "wagmi";
import { PulseChampionAbi } from "~/lib/abi/PulseChampion";
import { getPulseChampionAddress, getChainForMode } from "~/lib/contracts";
import { useMode } from "~/components/providers/ModeProvider";

export function usePulseChampion() {
  const { mode } = useMode();
  const chainId = useChainId();
  const { address } = useAccount();
  const contractAddress = getPulseChampionAddress(mode);
  const desiredChain = getChainForMode(mode);

  const activeOnCorrectChain = Number(chainId) === desiredChain.id;
  const ready = Boolean(contractAddress) && activeOnCorrectChain;

  const ownerRead = useReadContract({
    abi: PulseChampionAbi,
    address: contractAddress || undefined,
    functionName: "owner",
    query: { enabled: ready },
  });

  const pointsRead = useReadContract({
    abi: PulseChampionAbi,
    address: contractAddress || undefined,
    functionName: "points",
    args: address ? [address] : undefined,
    query: { enabled: ready && Boolean(address) },
  });

  const { writeContractAsync, isPending } = useWriteContract();

  const isOwner = useMemo(() => {
    if (!ownerRead.data || !address) return false;
    return (ownerRead.data as string).toLowerCase() === address.toLowerCase();
  }, [ownerRead.data, address]);

  async function awardPoints(to: `0x${string}`, amount: bigint) {
    if (!contractAddress) throw new Error("Contract address not set for mode");
    return writeContractAsync({ abi: PulseChampionAbi, address: contractAddress, functionName: "awardPoints", args: [to, amount] });
  }

  async function setPoints(to: `0x${string}`, value: bigint) {
    if (!contractAddress) throw new Error("Contract address not set for mode");
    return writeContractAsync({ abi: PulseChampionAbi, address: contractAddress, functionName: "setPoints", args: [to, value] });
  }

  return {
    mode,
    chainId,
    desiredChain,
    contractAddress,
    activeOnCorrectChain,
    ready,
    isOwner,
    owner: ownerRead.data as string | undefined,
    ownerLoading: ownerRead.isLoading,
    points: (pointsRead.data as bigint | undefined) ?? 0n,
    pointsLoading: pointsRead.isLoading,
    writePending: isPending,
    awardPoints,
    setPoints,
  };
}
