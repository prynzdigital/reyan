// POST /api/password → change the admin password { current, next } (admin)
import { handler, send, readJson, methodNotAllowed } from "./_lib/http.js";
import { requireAdmin, verifyPassword, setPassword, createSession } from "./_lib/auth.js";

export default handler(async (req, res) => {
  if (req.method !== "POST") return methodNotAllowed(res);
  if (!(await requireAdmin(req, res))) return;
  const { current, next } = await readJson(req, 10_000);
  if (!(await verifyPassword(current))) return send(res, 401, { error: "Your current password is not correct." });
  if (typeof next !== "string" || next.length < 8) return send(res, 400, { error: "Choose a new password with at least 8 characters." });
  await setPassword(next);
  await createSession(res, req); // keep this device signed in; others are signed out
  send(res, 200, { ok: true });
});
