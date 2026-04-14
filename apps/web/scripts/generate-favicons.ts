/**
 * generate-favicons.ts
 *
 * Generates favicon.ico and apple-touch-icon.png from the SVG source.
 * Requires `sharp` — install once: bun add -d sharp @types/sharp
 *
 * Usage:
 *   bunx tsx apps/web/scripts/generate-favicons.ts
 *
 * Outputs:
 *   apps/web/public/favicon.ico         (32×32 + 16×16 multi-size ICO)
 *   apps/web/public/apple-touch-icon.png (180×180)
 *   apps/web/public/favicon.svg         (already committed — source)
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Resolve paths relative to repo root
const PUBLIC = join(import.meta.dirname, "..", "public");
const SVG_PATH = join(PUBLIC, "favicon.svg");

async function main() {
  // Dynamic import so the file parses even when sharp isn't installed
  let sharp: typeof import("sharp");
  try {
    sharp = (await import("sharp")).default as unknown as typeof import("sharp");
  } catch {
    console.error(
      "sharp is not installed. Run: bun add -d sharp @types/sharp\n"
    );
    process.exit(1);
  }

  const svgBuffer = readFileSync(SVG_PATH);

  // apple-touch-icon — 180×180 PNG
  const appleTouchPath = join(PUBLIC, "apple-touch-icon.png");
  await sharp(svgBuffer).resize(180, 180).png().toFile(appleTouchPath);
  console.log("✓ apple-touch-icon.png (180×180)");

  // favicon.ico — embed 32×32 and 16×16 PNGs
  // ICO format: https://en.wikipedia.org/wiki/ICO_(file_format)
  const sizes = [32, 16] as const;
  const pngs = await Promise.all(
    sizes.map((size) =>
      sharp(svgBuffer).resize(size, size).png().toBuffer()
    )
  );

  const ico = buildIco(pngs);
  writeFileSync(join(PUBLIC, "favicon.ico"), ico);
  console.log("✓ favicon.ico (32×32 + 16×16)");
}

/**
 * Builds a minimal ICO file from an array of PNG buffers.
 * Each PNG is stored as-is inside the ICO container (PNG in ICO, supported
 * since Windows Vista and all modern browsers).
 */
function buildIco(pngs: Buffer[]): Buffer {
  const count = pngs.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = headerSize + count * dirEntrySize;

  let dataOffset = dirSize;
  const entries: Array<{ buffer: Buffer; offset: number }> = pngs.map(
    (buf) => {
      const entry = { buffer: buf, offset: dataOffset };
      dataOffset += buf.length;
      return entry;
    }
  );

  const totalSize = dataOffset;
  const out = Buffer.alloc(totalSize);

  // ICONDIR header
  out.writeUInt16LE(0, 0); // reserved
  out.writeUInt16LE(1, 2); // type = 1 (ICO)
  out.writeUInt16LE(count, 4); // image count

  // ICONDIRENTRY for each image
  entries.forEach(({ buffer, offset }, i) => {
    const pos = headerSize + i * dirEntrySize;
    // width/height: 0 means 256; for ≤255 write the actual value
    // We read size from PNG IHDR at bytes 16-23
    const w = buffer.readUInt32BE(16);
    const h = buffer.readUInt32BE(20);
    out.writeUInt8(w >= 256 ? 0 : w, pos);
    out.writeUInt8(h >= 256 ? 0 : h, pos + 1);
    out.writeUInt8(0, pos + 2); // color count
    out.writeUInt8(0, pos + 3); // reserved
    out.writeUInt16LE(1, pos + 4); // color planes
    out.writeUInt16LE(32, pos + 6); // bits per pixel
    out.writeUInt32LE(buffer.length, pos + 8); // size in bytes
    out.writeUInt32LE(offset, pos + 12); // offset from file start
    buffer.copy(out, offset);
  });

  return out;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
