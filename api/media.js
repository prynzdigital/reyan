// GET    /api/media          → list uploaded files (admin)
// DELETE /api/media?url=...  → delete an uploaded file (admin)
import { handler, send, query, methodNotAllowed } from "./_lib/http.js";
import { requireAdmin } from "./_lib/auth.js";
import { listMedia, deleteMedia, mediaMode } from "./_lib/media.js";

export default handler(async (req, res) => {
  if (!(await requireAdmin(req, res))) return;

  if (req.method === "GET") {
    const files = (await listMedia()).sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
    return send(res, 200, { mode: mediaMode, files });
  }

  if (req.method === "DELETE") {
    const url = query(req).get("url");
    if (!url) return send(res, 400, { error: "Missing file." });
    await deleteMedia(url);
    return send(res, 200, { ok: true });
  }

  methodNotAllowed(res);
});
