import fs from "node:fs";
import path from "node:path";

/**
 * Отдаёт загруженные из админки изображения из public/uploads.
 * Нужен потому, что `next start` НЕ раздаёт файлы, добавленные в public/ уже
 * после сборки (они дают 404). Этот роут читает файл с диска в рантайме.
 */

export const dynamic = "force-dynamic";

const DIR = path.join(process.cwd(), "public", "uploads");
const TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: parts } = await params;
  const rel = (parts ?? []).join("/");
  const full = path.join(DIR, rel);

  // защита от path traversal — итоговый путь должен оставаться внутри DIR
  if (full !== DIR && !full.startsWith(DIR + path.sep)) {
    return new Response("Not found", { status: 404 });
  }
  if (!fs.existsSync(full) || !fs.statSync(full).isFile()) {
    return new Response("Not found", { status: 404 });
  }

  const ext = path.extname(full).slice(1).toLowerCase();
  const type = TYPES[ext] ?? "application/octet-stream";
  const buf = fs.readFileSync(full);
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": type,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
