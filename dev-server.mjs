// Local test server: serves the website and runs the /api functions like Vercel does.
// Run:  npm run dev   → http://localhost:5173   (admin: http://localhost:5173/admin/, password "admin")
import http from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const PORT = +process.env.PORT || 5173;
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json", ".webmanifest": "application/manifest+json",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml",
  ".ico": "image/x-icon", ".pdf": "application/pdf", ".mp3": "audio/mpeg", ".m4a": "audio/mp4", ".wav": "audio/wav",
  ".mp4": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime", ".txt": "text/plain; charset=utf-8",
};
const BLOCKED = /^\/(\.data|node_modules|\.git|api\/_lib)(\/|$)/;

// Apply the same response headers as vercel.json, so security rules can be tested locally.
let HEADER_RULES = [];
try {
  HEADER_RULES = JSON.parse(await fs.readFile(path.join(ROOT, "vercel.json"), "utf8")).headers
    .map((r) => ({ re: new RegExp(`^${r.source}$`), headers: r.headers }));
} catch { /* no vercel.json */ }
function applyHeaders(res, pathname) {
  for (const rule of HEADER_RULES) if (rule.re.test(pathname)) rule.headers.forEach((h) => res.setHeader(h.key, h.value));
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let p = decodeURIComponent(url.pathname);
  applyHeaders(res, p);

  if (p.startsWith("/api/")) {
    const name = p.slice(5).replace(/\/$/, "");
    if (!/^[a-z-]+$/.test(name)) { res.writeHead(404); return res.end("Not found"); }
    try {
      const mod = await import(pathToFileURL(path.join(ROOT, "api", `${name}.js`)).href + `?t=${Date.now()}`);
      return mod.default(req, res);
    } catch (e) {
      if (e.code === "ERR_MODULE_NOT_FOUND") { res.writeHead(404); return res.end("Not found"); }
      console.error(e); res.writeHead(500); return res.end("Server error");
    }
  }

  if (BLOCKED.test(p)) { res.writeHead(404); return res.end("Not found"); }
  if (p.endsWith("/")) p += "index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  try {
    const st = await fs.stat(file);
    if (st.isDirectory()) { res.writeHead(301, { Location: `${p}/` }); return res.end(); }
    const data = await fs.readFile(file);
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream", "Last-Modified": st.mtime.toUTCString(), "Cache-Control": "no-cache" });
    res.end(req.method === "HEAD" ? undefined : data);
  } catch {
    res.writeHead(404); res.end("Not found");
  }
}).listen(PORT, () => console.log(`Site:  http://localhost:${PORT}\nAdmin: http://localhost:${PORT}/admin/  (local password: admin)`));
