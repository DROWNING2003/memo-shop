import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    params: string[];
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const [width, height] = params.params;
  
  // 创建一个简单的 SVG 占位符
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#F4E4D6"/>
      <circle cx="50%" cy="50%" r="30%" fill="#E07B39" opacity="0.3"/>
      <text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-family="Arial" font-size="12" fill="#3D2914">
        ${width}×${height}
      </text>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000',
    },
  });
}
