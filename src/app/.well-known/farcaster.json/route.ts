import { NextResponse } from 'next/server';
import { getFarcasterDomainManifest } from '~/lib/utils';

export async function GET() {
  const base = await getFarcasterDomainManifest();
  return NextResponse.json(
    {
      ...base,
      baseBuilder: {
        ownerAddress: '0x06329049fB0aa569Be8D1b781Cf1753f371Bb76C',
      },
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
      },
    }
  );
}

