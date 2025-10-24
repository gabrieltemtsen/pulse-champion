"use client";

import { useEffect, useMemo, useState } from "react";

type User = {
  fid: number;
  username?: string | null;
  display_name?: string | null;
  custody_address?: string | null;
  verified_addresses?: {
    eth_addresses?: string[];
    sol_addresses?: string[];
  };
};

export function useFarcasterNames(addresses: (string | undefined)[] | undefined) {
  const [map, setMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addrs = useMemo(() => {
    return (addresses || [])
      .filter((a): a is string => !!a && a !== "0x0000000000000000000000000000000000000000")
      .map((a) => a.toLowerCase());
  }, [addresses]);

  useEffect(() => {
    if (!addrs.length) { setMap({}); setError(null); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      const next: Record<string, string> = {};
      const chunkSize = 20;
      try {
        for (let i = 0; i < addrs.length; i += chunkSize) {
          if (cancelled) break;
          const chunk = addrs.slice(i, i + chunkSize);
          const results = await Promise.allSettled(
            chunk.map(async (addr) => {
              try {
                const res = await fetch(`/api/farcaster/username?address=${addr}`);
                if (!res.ok) return;
                const data: { username?: string | null } = await res.json();
                if (data?.username) {
                  next[addr] = `@${data.username}`;
                }
              } catch {}
            })
          );
          // noop; iterate next chunk
        }
        if (!cancelled) setMap(next);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load usernames');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [addrs.join(",")]);

  return { namesByAddress: map, loading, error };
}
