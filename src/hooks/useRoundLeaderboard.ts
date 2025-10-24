"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { parseAbiItem } from "viem";
import { usePublicClient } from "wagmi";
import { PulseChampionGameAbi } from "~/lib/abi/PulseChampionGame";
import { useChampionGame } from "~/hooks/useChampionGame";

export type LeaderboardEntry = { address: `0x${string}`; score: bigint };

/**
 * Builds a leaderboard by scanning Worked events for the current round
 * and reading totalScores for discovered participants.
 */
export function useRoundLeaderboard(initialPageSize = 50) {
  const publicClient = usePublicClient();
  const { gameAddress, currentRoundId, topPlayers, topScores } = useChampionGame();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [allAddrs, setAllAddrs] = useState<`0x${string}`[]>([]);
  const [cursor, setCursor] = useState(0);
  const [loadingAddrs, setLoadingAddrs] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fallback = useMemo<LeaderboardEntry[]>(() => {
    return (topPlayers || []).map((a, i) => ({ address: a as `0x${string}`, score: topScores[i] ?? 0n }));
  }, [topPlayers, topScores]);

  // Fetch participant addresses once per round
  useEffect(() => {
    let cancelled = false;
    async function fetchAddresses() {
      if (!publicClient || !gameAddress || !currentRoundId) { setAllAddrs([]); setEntries([]); setCursor(0); return; }
      setLoadingAddrs(true);
      setError(null);
      try {
        const event = parseAbiItem('event Worked(uint256 indexed id, address indexed player, uint32 hourIndex, uint256 points, uint256 newTotal)');
        const logs = await publicClient.getLogs({ address: gameAddress, event, args: { id: currentRoundId }, fromBlock: 0n });
        const seen = new Set<string>();
        const addrs: `0x${string}`[] = [];
        for (const l of logs) {
          const p = (l.args?.player as `0x${string}` | undefined);
          if (!p) continue;
          const low = p.toLowerCase();
          if (!seen.has(low)) { seen.add(low); addrs.push(p); }
        }
        if (!cancelled) {
          setAllAddrs(addrs);
          setEntries([]);
          setCursor(0);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || 'Failed to load leaderboard');
          setAllAddrs([]);
          setEntries([]);
          setCursor(0);
        }
      } finally {
        if (!cancelled) setLoadingAddrs(false);
      }
    }
    fetchAddresses();
    return () => { cancelled = true; };
  }, [publicClient, gameAddress, currentRoundId]);

  const loadMore = useCallback(async (pageSize = initialPageSize) => {
    if (!publicClient || !gameAddress || !currentRoundId) return;
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const start = cursor;
      const end = Math.min(allAddrs.length, start + pageSize);
      const nextEntries: LeaderboardEntry[] = [];
      for (let i = start; i < end; i++) {
        const a = allAddrs[i];
        try {
          const score = await publicClient.readContract({ abi: PulseChampionGameAbi, address: gameAddress, functionName: 'totalScores', args: [currentRoundId, a] });
          nextEntries.push({ address: a, score: BigInt(score as any) });
        } catch {}
      }
      const merged = [...entries, ...nextEntries];
      merged.sort((x, y) => (y.score > x.score ? 1 : y.score < x.score ? -1 : 0));
      setEntries(merged);
      setCursor(end);
    } finally {
      setLoadingMore(false);
    }
  }, [publicClient, gameAddress, currentRoundId, allAddrs, cursor, entries, initialPageSize, loadingMore]);

  // Auto-load the first page when addresses are fetched
  useEffect(() => {
    if (allAddrs.length && entries.length === 0 && !loadingMore) {
      loadMore(initialPageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allAddrs.length]);

  const hasMore = cursor < allAddrs.length;
  const loading = loadingAddrs || loadingMore;

  return { entries: entries.length ? entries : fallback, loading, error, hasMore, loadMore };
}
