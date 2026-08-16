import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ repoId: string }> }
) {
  const p = await params;
  
  // Mock fetching score from DB based on repoId
  const score = p.repoId === 'clean' ? 100 : 94;
  const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : 'C';
  const color = score >= 90 ? '#34D399' : '#F5A623'; // clear or caution
  
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="140" height="28" viewBox="0 0 140 28">
  <rect width="140" height="28" fill="#131720" rx="4"/>
  <rect x="1" y="1" width="138" height="26" fill="none" stroke="#6B7280" stroke-opacity="0.2" rx="3"/>
  <text x="12" y="18" font-family="monospace" font-size="12" fill="#B8BFCC">Scanline</text>
  <text x="80" y="18" font-family="monospace" font-size="12" font-weight="bold" fill="${color}">${score}</text>
  <rect x="110" y="4" width="20" height="20" fill="#6B7280" fill-opacity="0.1" rx="10"/>
  <text x="120" y="18" font-family="monospace" font-size="12" font-weight="bold" fill="#5EEAD4" text-anchor="middle">${grade}</text>
</svg>
  `.trim();

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'max-age=3600, s-maxage=3600'
    },
  });
}
