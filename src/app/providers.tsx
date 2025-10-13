'use client';

import dynamic from 'next/dynamic';
import { MiniAppProvider } from '@neynar/react';
import { SafeFarcasterSolanaProvider } from '~/components/providers/SafeFarcasterSolanaProvider';
import { ANALYTICS_ENABLED, RETURN_URL } from '~/lib/constants';
import { ToastProvider } from '~/components/ui/Toast';
import { ModeProvider } from "~/components/providers/ModeProvider";
import { GameEnvProvider } from "~/components/providers/GameEnvProvider";

const WagmiProvider = dynamic(
  () => import('~/components/providers/WagmiProvider'),
  {
    ssr: false,
  }
);

export function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const solanaEndpoint =
    process.env.SOLANA_RPC_ENDPOINT || 'https://solana-rpc.publicnode.com';
  return (
    <WagmiProvider>
      <ModeProvider>
        <GameEnvProvider>
          <MiniAppProvider
            analyticsEnabled={ANALYTICS_ENABLED}
            backButtonEnabled={true}
            returnUrl={RETURN_URL}
          >
            <ToastProvider>
              <SafeFarcasterSolanaProvider endpoint={solanaEndpoint}>
                {children}
              </SafeFarcasterSolanaProvider>
            </ToastProvider>
          </MiniAppProvider>
        </GameEnvProvider>
      </ModeProvider>
    </WagmiProvider>
  );
}
