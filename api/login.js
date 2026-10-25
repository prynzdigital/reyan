// GET    /api/login  → is the admin signed in? (plus setup status)
// POST   /api/login  → sign in { password }
// DELETE /api/login  → sign out
import { handler, send, readJson, methodNotAllowed } from "./_lib/http.js";
import { isAdmin, verifyPassword, createSession, clearSession, tooManyAttempts, recordFailure, clearFailures } from "./_lib/auth.js";
import { storeMode } from "./_lib/store.js";
import { mediaMode } from "./_lib/media.js";

export default handler(async (req, res) => {
  const setup = {
    storeMode,
    mediaMode,
    passwordSet: !!process.env.ADMIN_PASSWORD || storeMode === "local",
  };

  if (req.method === "GET") {
    const signedIn = storeMode === "none" ? false : await isAdmin(req);
    return send(res, 200, { signedIn, ...setup, localDevPassword: storeMode === "local" && !process.env.ADMIN_PASSWORD });
  }

  if (req.method === "POST") {
    if (storeMode === "none") return send(res, 503, { error: "The database isn't connected yet. See the setup guide.", ...setup });
    if (await tooManyAttempts(req)) return send(res, 429, { error: "Too many wrong attempts. Please wait 15 minutes and try again." });
    const { password } = await readJson(req, 10_000);
    if (!(await verifyPassword(password))) {
      await recordFailure(req);
      return send(res, 401, { error: "That password is not correct." });
    }
    await clearFailures(req);
    await createSession(res, req);
    return send(res, 200, { signedIn: true, ...setup });
  }

  if (req.method === "DELETE") {
    clearSession(res, req);
    return send(res, 200, { signedIn: false });
  }

  methodNotAllowed(res);
});
