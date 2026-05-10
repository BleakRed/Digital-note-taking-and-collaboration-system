/**
 * Converts drawing data from JSON stroke format → base64 PNG Data URLs.
 *
 * Run with: node prisma/convertDrawings.js
 *
 * Background:
 *   - seed.ts stored drawings as JSON stroke objects (structured format)
 *   - DrawingCanvas.tsx expects base64 PNG Data URLs (what you draw on canvas)
 *   - This script bridges the gap by rendering strokes → SVG → data URL
 *
 * Uses pure SVG generation — no canvas/npm dependency needed.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/** Convert stroke JSON → SVG string */
function strokesToSvg(strokesData, width = 800, height = 600) {
  let elements = '';
  const strokeStyle = (s) =>
    `stroke="${s.color || '#000'}" stroke-width="${s.width || 2}" fill="none" stroke-linecap="round" stroke-linejoin="round"`;

  try {
    const parsed = typeof strokesData === 'string' ? JSON.parse(strokesData) : strokesData;
    const strokes = parsed.strokes || parsed;
    if (!Array.isArray(strokes)) return null;

    for (const s of strokes) {
      if (s.tool === 'rect') {
        elements +=
          `<rect x="${s.x || 0}" y="${s.y || 0}" width="${s.w || 80}" height="${s.h || 40}" ${strokeStyle(s)} />\n`;
      } else if (s.points && s.points.length >= 2) {
        const d = s.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
        elements += `<path d="${d}" ${strokeStyle(s)} />\n`;
      } else if (s.x1 !== undefined) {
        elements +=
          `<line x1="${s.x1}" y1="${s.y1}" x2="${s.x2}" y2="${s.y2}" ${strokeStyle(s)} />\n`;
      }
    }
  } catch (e) {
    return null;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<rect width="100%" height="100%" fill="white"/>\n${elements}</svg>`;
}

/** SVG string → base64 PNG data URL (via Buffer) */
function svgToDataUrl(svg) {
  if (!svg) return null;
  const b64 = Buffer.from(svg, 'utf8').toString('base64');
  return `data:image/svg+xml;base64,${b64}`;
}

async function main() {
  console.log('🔄 Converting drawings to data URLs...\n');

  const drawings = await prisma.drawing.findMany();

  for (const drawing of drawings) {
    // Skip if already a data URL
    if (drawing.data.startsWith('data:')) {
      console.log(`⏭   Skip (already data URL): ${drawing.title}`);
      continue;
    }

    const svg = strokesToSvg(drawing.data);
    const dataUrl = svgToDataUrl(svg);

    if (!dataUrl) {
      console.log(`❌  Failed: ${drawing.title}`);
      continue;
    }

    await prisma.drawing.update({
      where: { id: drawing.id },
      data: { data: dataUrl, updatedAt: new Date() },
    });

    console.log(`✅  Converted: ${drawing.title}`);
  }

  console.log('\n✨ Done!');
  await prisma.$disconnect();
}

main().catch(console.error);
