import { useEffect, useMemo, useState } from "react";

export type Player = {
  fid: number;
  name: string;
  avatar: string;
  points: number;
};

export type Round = {
  id: number;
  startTime: number; // ms
  endTime: number;   // ms
  rewardPool: number; // in CELO or ETH units
  winner?: Player;
};

export type Claim = {
  roundId: number;
  amount: number;
  claimed: boolean;
  txHash?: string;
};

function randomAvatar(fid: number) {
  // Placeholder avatar using DiceBear initials
  return `https://api.dicebear.com/8.x/identicon/svg?seed=${fid}`;
}

function genPlayers(count = 25): Player[] {
  return Array.from({ length: count }).map((_, i) => ({
    fid: 1000 + i,
    name: `Player ${i + 1}`,
    avatar: randomAvatar(1000 + i),
    points: Math.floor(Math.random() * 1000),
  }));
}

export function useGameState(meFid?: number) {
  const [now, setNow] = useState<number>(() => Date.now());
  const [round, setRound] = useState<Round>(() => {
    const start = Date.now() - (Date.now() % (60 * 60 * 1000));
    const end = start + 60 * 60 * 1000;
    return { id: Math.floor(start / (60 * 60 * 1000)), startTime: start, endTime: end, rewardPool: 1234.56 };
  });
  const [me, setMe] = useState<Player | null>(() =>
    meFid ? { fid: meFid, name: "You", avatar: randomAvatar(meFid), points: Math.floor(Math.random() * 200) } : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Simulate polling of reward pool growth and my points
  useEffect(() => {
    const t = setInterval(() => {
      setLoading(true);
      try {
        setRound((r) => ({ ...r, rewardPool: +(r.rewardPool + Math.random() * 5).toFixed(2) }));
        setMe((m) => (m ? { ...m, points: m.points + Math.floor(Math.random() * 3) } : m));
        setError(null);
      } catch (e: any) {
        setError(e?.message || 'Failed updating game state');
      } finally {
        setLoading(false);
      }
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const timeLeft = Math.max(0, round.endTime - now);
  const progress = 1 - timeLeft / (round.endTime - round.startTime);

  return { round, timeLeft, progress, me, setMe, loading, error };
}

export function useLeaderboard(meFid?: number) {
  const [players, setPlayers] = useState<Player[]>(() => genPlayers());
  const me = useMemo(() => (meFid ? { fid: meFid, name: 'You', avatar: randomAvatar(meFid), points: Math.floor(Math.random() * 300) } : null), [meFid]);

  useEffect(() => {
    const t = setInterval(() => {
      setPlayers((prev) =>
        prev
          .map((p) => ({ ...p, points: Math.max(0, p.points + Math.floor(Math.random() * 20 - 5)) }))
      );
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const sorted = useMemo(() => [...players].sort((a, b) => b.points - a.points), [players]);
  const top5 = sorted.slice(0, 5);
  const meRank = me ? sorted.findIndex((p) => p.fid === me.fid) : -1;

  return { top5, all: sorted, me, meRank };
}

export function useRoundsHistory() {
  const [rounds] = useState<Round[]>(() => {
    const now = Date.now();
    return Array.from({ length: 10 }).map((_, i) => {
      const end = now - i * 60 * 60 * 1000;
      const start = end - 60 * 60 * 1000;
      const winner = { fid: 2000 + i, name: `Winner ${i + 1}` , avatar: randomAvatar(2000 + i), points: 800 + i * 10 };
      return { id: Math.floor(start / (60 * 60 * 1000)), startTime: start, endTime: end, rewardPool: 1000 + i * 12, winner };
    });
  });

  return { rounds };
}

export function useRewards(_meFid?: number) {
  const [claims, setClaims] = useState<Claim[]>([
    { roundId: 123, amount: 12.34, claimed: false },
    { roundId: 122, amount: 8.1, claimed: true, txHash: '0xabc...def' },
  ]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const claim = async (roundId: number) => {
    setBusyId(roundId);
    setError(null);
    try {
      await new Promise((res) => setTimeout(res, 1200));
      setClaims((prev) => prev.map((c) => (c.roundId === roundId ? { ...c, claimed: true, txHash: '0x' + Math.random().toString(16).slice(2, 10) } : c)));
    } catch (e: any) {
      setError(e?.message || 'Claim failed');
    } finally {
      setBusyId(null);
    }
  };

  return { claims, claim, busyId, error };
}
