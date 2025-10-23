import { NeynarAPIClient } from '@neynar/nodejs-sdk';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const apiKey = process.env.NEYNAR_API_KEY;
  const { searchParams } = new URL(request.url);
  const fids = searchParams.get('fids');
  const addresses = searchParams.get('addresses');
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Neynar API key is not configured. Please add NEYNAR_API_KEY to your environment variables.' },
      { status: 500 }
    );
  }

  if (!fids && !addresses) {
    return NextResponse.json(
      { error: 'Either fids or addresses parameter is required' },
      { status: 400 }
    );
  }

  try {
    const neynar = new NeynarAPIClient({ apiKey });

    if (fids) {
      const fidsArray = fids.split(',').map(fid => parseInt(fid.trim()));
      const { users } = await neynar.fetchBulkUsers({ fids: fidsArray });
      return NextResponse.json({ users });
    }

    if (addresses) {
      const addressesArray = addresses
        .split(',')
        .map(a => a.trim().toLowerCase())
        .filter(Boolean);
      const { users } = await neynar.fetchBulkUsersByEthOrSolAddress({ addresses: addressesArray });
      return NextResponse.json({ users });
    }

    return NextResponse.json({ users: [] });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users. Please check your Neynar API key and try again.' },
      { status: 500 }
    );
  }
}
