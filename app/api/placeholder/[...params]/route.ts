import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { params: string[] } }
) {
  const [width, height] = params.params;
  
  // Parse dimensions
  const w = parseInt(width) || 64;
  const h = parseInt(height) || 64;
  
  // Validate dimensions (prevent abuse)
  const maxSize = 1000;
  const finalWidth = Math.min(Math.max(w, 1), maxSize);
  const finalHeight = Math.min(Math.max(h, 1), maxSize);
  
  // Generate a simple SVG placeholder
  const svg = `
    <svg width="${finalWidth}" height="${finalHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <rect x="2" y="2" width="${finalWidth - 4}" height="${finalHeight - 4}" fill="none" stroke="#d1d5db" stroke-width="2" stroke-dasharray="5,5"/>
      <text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-family="Arial, sans-serif" font-size="${Math.min(finalWidth, finalHeight) / 8}" fill="#6b7280">
        ${finalWidth}×${finalHeight}
      </text>
    </svg>
  `;
  
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
