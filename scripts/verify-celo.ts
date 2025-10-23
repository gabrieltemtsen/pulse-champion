#!/usr/bin/env ts-node
/*
  Minimal Celoscan verification helper.

  Usage examples:
  - Single-file verification:
    VERIFY_API_KEY=your_key \
    ts-node scripts/verify-celo.ts \
      --address 0xYourContract \
      --contract-name contracts/MyContract.sol:MyContract \
      --compiler v0.8.20+commit.a1b79de6 \
      --opt 1 \
      --runs 200 \
      --source ./contracts/MyContract.sol

  - Standard JSON input (multi-file):
    VERIFY_API_KEY=your_key \
    ts-node scripts/verify-celo.ts \
      --address 0xYourContract \
      --contract-name MyContract \
      --compiler v0.8.20+commit.a1b79de6 \
      --json ./artifacts/combined.json

  Notes:
  - Set VERIFY_API_KEY to your Celoscan API key.
  - For constructor args, add: --constructor-args 0xdeadbeef...
*/

import fs from 'fs';

type Args = Record<string, string | undefined>;
function parseArgs(argv: string[]): Args {
  const out: Args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : '1';
      out[key] = val;
    }
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv);
  const apiKey = process.env.VERIFY_API_KEY;
  if (!apiKey) throw new Error('Missing VERIFY_API_KEY env var');

  const address = args['address'];
  const compiler = args['compiler'];
  const contractName = args['contract-name'];
  const sourcePath = args['source'];
  const jsonPath = args['json'];
  const constructorArgs = args['constructor-args'] || '';
  const optimizationUsed = args['opt'] === '1' ? '1' : '0';
  const runs = args['runs'] || '200';

  if (!address || !compiler || !contractName) {
    throw new Error('Required: --address --compiler --contract-name');
  }

  const baseUrl = 'https://api.celoscan.io/api';

  const form = new URLSearchParams();
  form.set('apikey', apiKey);
  form.set('module', 'contract');
  form.set('action', 'verifysourcecode');
  form.set('contractaddress', address);
  form.set('compilerversion', compiler);
  form.set('contractname', contractName);
  form.set('constructorArguements', constructorArgs); // spelling per etherscan API

  if (jsonPath) {
    const content = fs.readFileSync(jsonPath, 'utf8');
    form.set('codeformat', 'solidity-standard-json-input');
    form.set('sourceCode', content);
  } else if (sourcePath) {
    const content = fs.readFileSync(sourcePath, 'utf8');
    form.set('codeformat', 'solidity-single-file');
    form.set('sourceCode', content);
    form.set('optimizationUsed', optimizationUsed);
    form.set('runs', runs);
  } else {
    throw new Error('Provide either --json <path> or --source <path>');
  }

  const submit = await fetch(baseUrl, { method: 'POST', body: form as any });
  const submitJson: any = await submit.json();
  if (submitJson.status !== '1') {
    console.error('Submit failed:', submitJson);
    process.exit(1);
  }
  const guid = submitJson.result as string;
  console.log('Submitted. GUID:', guid);

  // Poll for result
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 4000));
    const qs = new URLSearchParams({
      apikey: apiKey,
      module: 'contract',
      action: 'checkverifystatus',
      guid,
    });
    const res = await fetch(`${baseUrl}?${qs.toString()}`);
    const js: any = await res.json();
    if (js.status === '1') {
      console.log('Verified:', js.result);
      return;
    }
    if (js.result && typeof js.result === 'string' && js.result.toLowerCase().includes('already verified')) {
      console.log('Already verified');
      return;
    }
    console.log('Pending:', js.result || js.message);
  }
  console.error('Verification timed out');
  process.exit(2);
}

main().catch((e) => { console.error(e); process.exit(1); });

