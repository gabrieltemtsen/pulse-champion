"use client";

import { useMiniApp } from "@neynar/react";
import { useState } from "react";
import { useAccount, useSwitchChain, usePublicClient, useConnect } from "wagmi";
import { useMode } from "~/components/providers/ModeProvider";
import { useChampionGame } from "~/hooks/useChampionGame";
import { Button } from "../Button";
import { useToast } from "~/components/ui/Toast";

export function ProfileTab() {
  const { context } = useMiniApp();
  const { address, isConnected } = useAccount();
  const { addSuccess, addError } = useToast();
  const { mode } = useMode();
  const { isOwner, onDesiredChain, desiredChain, startRound, gameAddress, owner, roundActive, endTime, isValidContract, refresh, hasContract } = useChampionGame();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const publicClient = usePublicClient();
  const { connectAsync, connect, connectors, isPending: isConnecting } = useConnect();
  const [showVerify, setShowVerify] = useState(false);
  const [verifyBusy, setVerifyBusy] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [compiler, setCompiler] = useState<string>("v0.8.20+commit.a1b79de6");
  const [contractName, setContractName] = useState<string>("PulseChampionGame");
  const [sourceJson, setSourceJson] = useState<string>("");

  return (
    <div className="px-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2 glow-effect">Profile</h2>
        <p className="text-gray-300">Manage your account settings and preferences</p>
      </div>

      {/* User Info Card */}
      <div className="card-floating p-6 animate-in fade-in duration-200">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src={context?.user?.pfpUrl || ''} 
              alt="Your avatar" 
              className="w-16 h-16 rounded-full border-2 border-blue-400/50 glow-effect bg-gray-700" 
            />
            <div className="absolute inset-0 rounded-full animate-pulse bg-blue-400/10" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {context?.user?.displayName || context?.user?.username || 'Guest'}
            </h3>
            {context?.user?.username && (
              <p className="text-gray-300 mt-1">@{context.user.username}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-green-400">Active Player</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Card */}
      <div className="card-neuro p-5 animate-in fade-in duration-300">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-white">Wallet</h4>
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
        </div>
        {isConnected ? (
          <div>
            <p className="text-sm text-gray-300 mb-1">Connected Address</p>
            <div className="bg-black/20 p-3 rounded-lg border border-blue-400/20">
              <p className="text-xs text-gray-300 font-mono break-all">{address}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 space-y-3">
            <p className="text-gray-400 text-sm">No wallet connected</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              {(() => {
                const mm = connectors.find((c) => c.name.toLowerCase().includes('meta'));
                const cb = connectors.find((c) => c.name.toLowerCase().includes('coinbase'));
                return (
                  <>
                    {mm && (
                      <button
                        type="button"
                        className="btn btn-primary px-4 py-2"
                        disabled={isConnecting}
                        onClick={async () => {
                          try {
                            await connectAsync({ connector: mm, chainId: desiredChain.id });
                            addSuccess('Wallet connected');
                          } catch (e: any) {
                            addError(e?.message || 'Failed to connect MetaMask');
                          }
                        }}
                      >
                        {isConnecting ? 'Connecting…' : (mm.ready ? 'Connect MetaMask' : 'Install MetaMask')}
                      </button>
                    )}
                    {cb && (
                      <button
                        type="button"
                        className="btn btn-secondary px-4 py-2"
                        disabled={isConnecting}
                        onClick={async () => {
                          try {
                            await connectAsync({ connector: cb, chainId: desiredChain.id });
                            addSuccess('Wallet connected');
                          } catch (e: any) { addError(e?.message || 'Failed to connect Coinbase Wallet'); }
                        }}
                      >
                        {isConnecting ? 'Connecting…' : (cb.ready ? 'Connect Coinbase' : 'Install Coinbase Wallet')}
                      </button>
                    )}
                    {!mm && !cb && (
                      <button
                        type="button"
                        className="btn btn-primary px-4 py-2"
                        disabled
                      >
                        No wallet available
                      </button>
                    )}
                  </>
                );
              })()}
            </div>
            <p className="text-xs text-gray-500">Connect to claim rewards</p>
          </div>
        )}
      </div>

      {/* Admin Controls - visible only to owner */}
      {isOwner && (
        <div className="card p-5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-white">Admin</h4>
          </div>
          {!isValidContract && (
            <div className="text-sm text-red-400">Contract not configured. Set NEXT_PUBLIC_CHAMPION_GAME_{mode === 'celo' ? 'CELO' : 'BASE'} to your PulseChampionGame address.</div>
          )}
          <div className="space-y-2">
            <p className="text-xs text-gray-400">You are the owner. Chain: {desiredChain.name}</p>
            <p className="text-xs text-gray-400">Active round: {roundActive ? 'Yes' : 'No'}{endTime ? ` • Ends: ${new Date(Number(endTime) * 1000).toLocaleString()}` : ''}</p>
            {!onDesiredChain && (
              <Button
                variant="secondary"
                disabled={isSwitching}
                onClick={() => switchChain({ chainId: desiredChain.id })}
              >
                Switch to {desiredChain.name}
              </Button>
            )}
            <Button
              disabled={roundActive || (onDesiredChain && (!isValidContract || hasContract === false))}
              onClick={async () => { 
                try { 
                  if (!onDesiredChain) { await switchChain({ chainId: desiredChain.id }); }
                  // after switching, ensure reads refresh
                  refresh();
                  const hash = await startRound();
                  if (!hash) throw new Error('Transaction was not initiated');
                  if (publicClient) {
                    await publicClient.waitForTransactionReceipt({ hash });
                  }
                  refresh();
                  addSuccess('Round started'); 
                } catch (e: any) { addError(e?.message || 'Failed to start'); } 
              }}
            >
              Start Round
            </Button>
            <div className="text-xs text-gray-400 space-y-1">
              <div>Contract: <span className="font-mono">{gameAddress ?? 'not set'}</span></div>
              <div>Owner on chain: <span className="font-mono">{owner}</span></div>
              <div>Your address: <span className="font-mono">{address}</span></div>
              <div>Chain: {desiredChain.name} • Status: {onDesiredChain ? 'On correct chain' : 'Wrong chain'}</div>
              <button type="button" className="underline" onClick={() => refresh()}>Refresh status</button>
            </div>
            {onDesiredChain && hasContract === false && (
              <div className="text-sm text-red-400 mt-2">No contract code found at this address on {desiredChain.name}. Check NEXT_PUBLIC_CHAMPION_GAME_{mode === 'celo' ? 'CELO' : 'BASE'}.</div>
            )}
            <div className="pt-2">
              <button type="button" className="text-sm underline" onClick={() => setShowVerify((v) => !v)}>
                {showVerify ? 'Hide Verification' : 'Verify Contract on Celoscan'}
              </button>
              {showVerify && (
                <div className="mt-3 border border-white/10 rounded p-3 space-y-2">
                  <p className="text-sm text-gray-300">Submit Standard JSON input to Celoscan. You can export this from your Solidity build (Flattened or Standard JSON).</p>
                  <div className="grid gap-2">
                    <label className="text-xs opacity-80">Celoscan API Key (optional, else server env used)</label>
                    <input className="input" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="VERIFY_API_KEY" />
                    <label className="text-xs opacity-80">Compiler Version</label>
                    <input className="input" value={compiler} onChange={(e) => setCompiler(e.target.value)} placeholder="v0.8.20+commit.a1b79de6" />
                    <label className="text-xs opacity-80">Contract Name (as in metadata)</label>
                    <input className="input" value={contractName} onChange={(e) => setContractName(e.target.value)} placeholder="contracts/PulseChampionGame.sol:PulseChampionGame or PulseChampionGame" />
                    <label className="text-xs opacity-80">Standard JSON Input</label>
                    <textarea className="input" style={{ minHeight: 160 }} value={sourceJson} onChange={(e) => setSourceJson(e.target.value)} placeholder="Paste combined JSON here" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      disabled={verifyBusy || !gameAddress}
                      onClick={async () => {
                        setVerifyMsg(null);
                        setVerifyBusy(true);
                        try {
                          const res = await fetch('/api/verify/celo', {
                            method: 'POST',
                            headers: { 'content-type': 'application/json' },
                            body: JSON.stringify({
                              address: gameAddress,
                              compiler,
                              contractName,
                              codeformat: 'solidity-standard-json-input',
                              sourceCode: sourceJson,
                              apiKey: apiKey || undefined,
                            }),
                          });
                          const js = await res.json();
                          if (!res.ok) throw new Error(js?.error || 'Verification failed');
                          setVerifyMsg('Verified: ' + (js?.result || 'OK'));
                        } catch (e: any) {
                          setVerifyMsg(e?.message || 'Verification failed');
                        } finally {
                          setVerifyBusy(false);
                        }
                      }}
                    >
                      {verifyBusy ? 'Verifying…' : 'Verify Now'}
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={!gameAddress}
                      onClick={async () => {
                        setVerifyMsg(null);
                        try {
                          const qs = new URLSearchParams({ address: gameAddress!, apiKey });
                          const res = await fetch('/api/verify/celo?' + qs.toString());
                          const js = await res.json();
                          const result = js?.result?.[0];
                          if (result && result.SourceCode && String(result.ABI || '').toLowerCase() !== 'contract source code not verified') {
                            setVerifyMsg('Status: Verified');
                          } else {
                            setVerifyMsg('Status: Not verified');
                          }
                        } catch (e: any) {
                          setVerifyMsg(e?.message || 'Check failed');
                        }
                      }}
                    >
                      Check Status
                    </Button>
                  </div>
                  {verifyMsg && <div className="text-sm mt-1">{verifyMsg}</div>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Card */}
      <div className="card-floating p-5 animate-in fade-in duration-400">
        <h4 className="font-semibold text-white mb-4">Preferences</h4>
        
        {/* Notifications Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-white">Round Updates</span>
            <p className="text-xs text-gray-400 mt-1">Get notified about new rounds</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked="false"
            className="inline-flex items-center cursor-pointer focus-ring rounded-full ml-4"
            aria-label="Toggle round update notifications"
          >
            <span className="w-12 h-6 bg-gray-600 rounded-full relative transition-colors duration-300 hover:bg-gray-500">
              <span className="absolute left-1 top-1 h-4 w-4 bg-white rounded-full shadow-lg transition-transform duration-300" />
            </span>
          </button>
        </div>
      </div>

      {/* Stats Card */}
      <div className="card blob p-6 text-center animate-in fade-in duration-500">
        <div className="glow-effect inline-block">
          <p className="text-gray-300 mb-2">🚀 Keep playing to unlock more features!</p>
          <p className="text-sm text-gray-400">Build your reputation in Pulse Champion</p>
        </div>
      </div>
    </div>
  );
}
