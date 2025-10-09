import { base, celo } from "wagmi/chains";
import type { AppMode } from "~/components/providers/ModeProvider";

export const PULSE_CHAMPION_ADDRESSES: Record<"base" | "celo", `0x${string}` | null> = {
  base: (process.env.NEXT_PUBLIC_PULSE_CHAMPION_BASE as `0x${string}`) || null,
  celo: (process.env.NEXT_PUBLIC_PULSE_CHAMPION_CELO as `0x${string}`) || null,
};

export function getPulseChampionAddress(mode: AppMode): `0x${string}` | null {
  return PULSE_CHAMPION_ADDRESSES[mode];
}

export function getChainForMode(mode: AppMode) {
  return mode === "celo" ? celo : base;
}

