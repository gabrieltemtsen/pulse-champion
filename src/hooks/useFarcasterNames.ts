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
    const qs = new URLSearchParams({ addresses: addrs.join(",") }).toString();
    fetch(`/api/users?${qs}`)
      .then((res) => res.json())
      .then((data: { users?: User[] }) => {
        if (cancelled) return;
        const next: Record<string, string> = {};
        for (const u of data.users || []) {
          const label = u.username ? `@${u.username}` : (u.display_name || "");
          if (!label) continue;
          const eth = u.verified_addresses?.eth_addresses || [];
          const custody = u.custody_address ? [u.custody_address] : [];
          for (const a of [...eth, ...custody]) {
            if (!a) continue;
            next[a.toLowerCase()] = label;
          }
        }
        setMap(next);
      })
      .catch((e) => !cancelled && setError(e?.message || "Failed to load usernames"))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [addrs.join(",")]);

  return { namesByAddress: map, loading, error };
}

