export const CHAMPION_GAME_ADDRESSES = {
  base: process.env.NEXT_PUBLIC_CHAMPION_GAME_BASE as `0x${string}` | undefined,
  celo: process.env.NEXT_PUBLIC_CHAMPION_GAME_CELO as `0x${string}` | undefined,
};

export const CHAMPION_GAME_ADDRESSES_STAGING = {
  base: process.env.NEXT_PUBLIC_CHAMPION_GAME_BASE_STAGING as `0x${string}` | undefined,
  celo: process.env.NEXT_PUBLIC_CHAMPION_GAME_CELO_STAGING as `0x${string}` | undefined,
};
