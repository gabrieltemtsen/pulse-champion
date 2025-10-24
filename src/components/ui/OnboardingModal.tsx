"use client";

import { useEffect, useState } from "react";
import { Button } from "./Button";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function OnboardingModal({ open, onClose }: Props) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!open) setStep(0);
  }, [open]);

  if (!open) return null;

  const steps = [
    {
      title: "Welcome to Pulse Champion",
      body: "Compete in live rounds. Score points once per hour, fund the prize pool, and climb the leaderboard.",
    },
    {
      title: "Select Network",
      body: "Use the toggle in the header to choose your network (Base or Celo). You can switch anytime.",
    },
    {
      title: "Connect Your Wallet",
      body: "Connect a wallet supported by your chosen network to interact (work, fund, and settle).",
    },
    {
      title: "Work Once Per Hour",
      body: "Click Work to earn points once each hour. The earlier you work, the more points you get.",
    },
    {
      title: "Fund & Settle",
      body: "Add to the prize pool anytime during a round. When time is up, anyone can settle and winners are paid automatically.",
    },
  ];

  const last = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[92%] max-w-md card p-5 border border-white/15">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold">{steps[step].title}</h3>
          <button className="text-sm opacity-80 hover:opacity-100 focus-ring rounded" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <p className="text-sm opacity-90">{steps[step].body}</p>
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-1" aria-label="Progress">
            {steps.map((_, i) => (
              <span key={i} className={`h-1.5 w-6 rounded ${i <= step ? 'bg-primary' : 'bg-white/20'}`} />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="secondary" onClick={() => setStep((s) => Math.max(0, s - 1))}>Back</Button>
            )}
            {!last ? (
              <Button onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}>Next</Button>
            ) : (
              <Button onClick={onClose}>Got it</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

