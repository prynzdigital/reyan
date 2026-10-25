// GET  /api/content            → the live site content (public; used by the website)
// PUT  /api/content            → save content (admin) { content, baseUpdatedAt }
// POST /api/content?restore=1  → undo the last save (admin)
import { handler, send, readJson, query, methodNotAllowed } from "./_lib/http.js";
import { requireAdmin } from "./_lib/auth.js";
import { getJson, setJson, storeMode } from "./_lib/store.js";

const MAX_SIZE = 900_000; // characters

export default handler(async (req, res) => {
  if (req.method === "GET" || req.method === "HEAD") {
    const saved = storeMode === "none" ? null : await getJson("content");
    const etag = `"${saved?.updatedAt || "default"}"`;
    const headers = { ETag: etag, "Cache-Control": "no-cache" };
    if (req.headers["if-none-match"] === etag) { res.writeHead(304, headers); return res.end(); }
    if (req.method === "HEAD") { res.writeHead(200, headers); return res.end(); }
    return send(res, 200, { content: saved?.content || null, updatedAt: saved?.updatedAt || null }, headers);
  }

  if (req.method === "PUT") {
    if (!(await requireAdmin(req, res))) return;
    const { content, baseUpdatedAt } = await readJson(req, 2_000_000);
    if (!content || typeof content !== "object" || Array.isArray(content)) return send(res, 400, { error: "Nothing to save." });
    const size = JSON.stringify(content).length;
    if (size > MAX_SIZE) return send(res, 413, { error: "The content is too large to save. Use uploads for big text like books." });

    const current = await getJson("content");
    if (current && baseUpdatedAt !== current.updatedAt) {
      return send(res, 409, { error: "The site was changed somewhere else (another device or tab). Reload to get the latest version, then make your change again.", updatedAt: current.updatedAt });
    }
    if (current) await setJson("content:prev", current);
    const saved = { content, updatedAt: new Date().toISOString() };
    await setJson("content", saved);
    return send(res, 200, { updatedAt: saved.updatedAt });
  }

  if (req.method === "POST" && query(req).get("restore")) {
    if (!(await requireAdmin(req, res))) return;
    const prev = await getJson("content:prev");
    if (!prev) return send(res, 404, { error: "There is no earlier version to go back to." });
    const current = await getJson("content");
    const restored = { content: prev.content, updatedAt: new Date().toISOString() };
    await setJson("content", restored);
    if (current) await setJson("content:prev", current);
    return send(res, 200, restored);
  }

  methodNotAllowed(res);
});
