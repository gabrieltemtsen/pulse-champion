import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getNeynarUser } from "~/lib/neynar";
import { APP_NAME, APP_DESCRIPTION } from "~/lib/constants";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get('fid');

  const user = fid ? await getNeynarUser(Number(fid)) : null;

  return new ImageResponse(
    (
      <div tw="flex h-full w-full items-center justify-center bg-[#0b1020] relative">
        {/* Glow background accents */}
        <div tw="absolute -top-20 -left-20 w-[520px] h-[520px] rounded-full bg-[#00E1A1] opacity-20 blur-3xl" />
        <div tw="absolute -bottom-24 -right-24 w-[480px] h-[480px] rounded-full bg-[#5b8dff] opacity-20 blur-3xl" />
        <div tw="relative flex w-[1040px] h-[640px] items-center justify-between rounded-3xl bg-[#111936] border border-[#4CC9F0]/20 px-16">
          <div tw="flex flex-col">
            <div tw="text-7xl text-white font-extrabold tracking-tight">{APP_NAME}</div>
            <div tw="mt-6 text-3xl text-[#D1E8FF]">{APP_DESCRIPTION}</div>
            <div tw="mt-4 text-2xl text-[#9fb3c8]">Compete hourly. Win the prize pool.</div>
            {user && (
              <div tw="mt-8 flex items-center gap-4">
                {user.pfp_url && (
                  <div tw="w-24 h-24 rounded-full overflow-hidden border-4 border-white/30">
                    <img src={user.pfp_url} alt="Player" tw="w-full h-full object-cover" />
                  </div>
                )}
                <div tw="flex flex-col">
                  <div tw="text-3xl text-white font-bold">Player: {user.display_name ?? user.username}</div>
                  {user.username && <div tw="text-2xl text-[#9fb3c8]">@{user.username}</div>}
                </div>
              </div>
            )}
          </div>
          {/* Badge */}
          <div tw="flex flex-col items-end">
            <div tw="text-white text-2xl opacity-80">Pulse Champion</div>
            <div tw="mt-3 inline-flex items-center px-6 py-3 rounded-full bg-[#1a2348] border border-white/20 text-white text-2xl">🏆 Top Players • Live</div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 800,
    }
  );
}
