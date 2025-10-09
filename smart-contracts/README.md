Smart Contracts (Base + Celo)

Overview
- Independent Hardhat workspace to avoid Node/tooling conflicts with the Next.js app.
- Deploys a minimal Ownable points ledger `PulseChampion` to Base and Celo.

Prereqs
- Node: v22 LTS (`nvm use` will pick up the `.nvmrc`)
- npm (or pnpm/yarn)

Setup
1) Install deps
   npm install

2) Copy env
   cp .env.example .env
   # Fill in:
   # DEPLOYER_PRIVATE_KEY=0x...
   # BASE_RPC_URL=https://...
   # CELO_RPC_URL=https://...

3) Compile
   npm run compile

4) Deploy
   npm run deploy:base
   npm run deploy:celo

5) Add addresses to the web app
   In the Next app root `.env.local`, set:
   NEXT_PUBLIC_PULSE_CHAMPION_BASE=0x...
   NEXT_PUBLIC_PULSE_CHAMPION_CELO=0x...

Notes
- Verification (optional): add explorer API keys in `.env` and wire in `etherscan.apiKey` in `hardhat.config.ts`.
- The contract is intentionally minimal; extend as needed.

