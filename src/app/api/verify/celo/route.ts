import { NextRequest, NextResponse } from 'next/server';

const CELOSCAN_API = 'https://api.celoscan.io/api';

function ok(data: any, init: number = 200) {
  return NextResponse.json(data, { status: init });
}

function bad(message: string, init: number = 400) {
  return NextResponse.json({ error: message }, { status: init });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');
  const apiKey = searchParams.get('apiKey') || process.env.VERIFY_API_KEY || process.env.CELOSCAN_API_KEY;
  if (!address) return bad('Missing address');
  if (!apiKey) return bad('Missing VERIFY_API_KEY on server or apiKey param');

  const qs = new URLSearchParams({ module: 'contract', action: 'getsourcecode', address, apikey: apiKey });
  const r = await fetch(`${CELOSCAN_API}?${qs.toString()}`, { cache: 'no-store' });
  const j = await r.json();
  return ok(j);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const {
    address,
    compiler,          // e.g. v0.8.20+commit.a1b79de6
    contractName,      // e.g. contracts/My.sol:My
    sourceCode,        // string (single file) or standard JSON input
    codeformat = 'solidity-standard-json-input',
    optimizationUsed = '1',
    runs = '200',
    constructorArgs = '',
    apiKey: apiKeyOverride,
  } = body || {};

  const apiKey = apiKeyOverride || process.env.VERIFY_API_KEY || process.env.CELOSCAN_API_KEY;
  if (!apiKey) return bad('Missing VERIFY_API_KEY on server or apiKey field');
  if (!address || !compiler || !contractName || !sourceCode) return bad('Required: address, compiler, contractName, sourceCode');

  const form = new URLSearchParams();
  form.set('apikey', apiKey);
  form.set('module', 'contract');
  form.set('action', 'verifysourcecode');
  form.set('contractaddress', address);
  form.set('compilerversion', compiler);
  form.set('contractname', contractName);
  form.set('constructorArguements', constructorArgs || '');
  form.set('codeformat', codeformat);
  form.set('sourceCode', typeof sourceCode === 'string' ? sourceCode : JSON.stringify(sourceCode));
  if (codeformat === 'solidity-single-file') {
    form.set('optimizationUsed', optimizationUsed);
    form.set('runs', runs);
  }

  const submit = await fetch(CELOSCAN_API, { method: 'POST', body: form as any });
  const submitJson = await submit.json();
  if (submitJson.status !== '1') {
    return bad(`Submit failed: ${submitJson.result || submitJson.message || 'unknown'}`);
  }

  const guid: string = submitJson.result;

  // Poll for result up to ~2 minutes
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 4000));
    const qs = new URLSearchParams({ apikey: apiKey, module: 'contract', action: 'checkverifystatus', guid });
    const res = await fetch(`${CELOSCAN_API}?${qs.toString()}`);
    const js = await res.json();
    if (js.status === '1') {
      return ok({ status: 'ok', result: js.result, guid });
    }
    const msg = (js.result || js.message || '').toString().toLowerCase();
    if (msg.includes('already verified')) {
      return ok({ status: 'ok', result: 'Already verified', guid });
    }
  }
  return bad('Verification timed out');
}

