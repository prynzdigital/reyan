// Uploaded files (photos, audio, music, video, PDFs).
// On Vercel: Vercel Blob (Vercel dashboard → Storage → Blob). Locally: the ./uploads folder.
import { promises as fs } from "node:fs";
import path from "node:path";

// Vercel adds BLOB_READ_WRITE_TOKEN when Blob storage is connected. If a custom
// "environment variable prefix" was chosen, the name differs (e.g. MEDIA_READ_WRITE_TOKEN),
// so also accept any *_READ_WRITE_TOKEN whose value is a Vercel Blob token.
function findBlobToken() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN;
  for (const [name, value] of Object.entries(process.env)) {
    if (/READ_WRITE_TOKEN$/.test(name) && String(value).startsWith("vercel_blob_rw_")) return value;
  }
  return "";
}
export const blobToken = findBlobToken();
export const mediaMode = blobToken ? "blob" : process.env.VERCEL ? "none" : "local";

// Names (never values) of storage-related settings the server can see — shown in the admin to help setup.
export const storageSettingNames = () =>
  Object.keys(process.env).filter((n) => /BLOB|READ_WRITE_TOKEN|KV_REST|UPSTASH/i.test(n)).sort();

export const ALLOWED_TYPES = ["image/*", "audio/*", "video/*", "application/pdf"];
export const MAX_BYTES = 500 * 1024 * 1024; // 500 MB per file

const LOCAL_DIR = path.join(process.cwd(), "uploads");

export function cleanName(name) {
  const ext = path.extname(name).toLowerCase().replace(/[^.a-z0-9]/g, "").slice(0, 8);
  const base = path.basename(name, path.extname(name)).toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "file";
  return `${base}${ext}`;
}

export function folderFor(type = "") {
  if (type.startsWith("image/")) return "images";
  if (type.startsWith("audio/")) return "audio";
  if (type.startsWith("video/")) return "video";
  if (type === "application/pdf") return "documents";
  return "files";
}

export async function listMedia() {
  if (mediaMode === "blob") {
    const { list } = await import("@vercel/blob");
    const out = [];
    let cursor;
    do {
      const page = await list({ cursor, limit: 1000, token: blobToken });
      out.push(...page.blobs.map((b) => ({ url: b.url, pathname: b.pathname, size: b.size, uploadedAt: b.uploadedAt })));
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    return out;
  }
  if (mediaMode === "local") {
    const out = [];
    async function walk(dir) {
      let entries = [];
      try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return; }
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) await walk(full);
        else {
          const st = await fs.stat(full);
          const rel = path.relative(process.cwd(), full).split(path.sep).join("/");
          out.push({ url: `/${rel}`, pathname: rel.replace(/^uploads\//, ""), size: st.size, uploadedAt: st.mtime.toISOString() });
        }
      }
    }
    await walk(LOCAL_DIR);
    return out;
  }
  return [];
}

export async function deleteMedia(url) {
  if (mediaMode === "blob") {
    const { del } = await import("@vercel/blob");
    await del(url, { token: blobToken });
    return;
  }
  if (mediaMode === "local") {
    const full = path.join(process.cwd(), decodeURIComponent(new URL(url, "http://x").pathname));
    if (!full.startsWith(LOCAL_DIR)) throw Object.assign(new Error("Invalid file"), { status: 400 });
    await fs.unlink(full);
  }
}

export async function saveLocal(name, type, buffer) {
  const folder = folderFor(type);
  const file = cleanName(name);
  const unique = `${path.basename(file, path.extname(file))}-${Date.now().toString(36)}${path.extname(file)}`;
  const dir = path.join(LOCAL_DIR, folder);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, unique), buffer);
  return { url: `/uploads/${folder}/${unique}`, pathname: `${folder}/${unique}`, size: buffer.length, contentType: type };
}
