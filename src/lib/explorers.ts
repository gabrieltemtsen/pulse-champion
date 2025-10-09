import { base, celo } from "wagmi/chains";

export function getExplorerBaseUrl(chainId: number): string | null {
  switch (chainId) {
    case base.id:
      return "https://basescan.org";
    case celo.id:
      return "https://celoscan.io";
    default:
      return null;
  }
}

export function getAddressUrl(chainId: number, address: `0x${string}`): string | null {
  const baseUrl = getExplorerBaseUrl(chainId);
  return baseUrl ? `${baseUrl}/address/${address}` : null;
}

