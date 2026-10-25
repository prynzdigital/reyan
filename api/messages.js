// POST   /api/messages        → a visitor sends the contact / prayer / testimony / newsletter form (public)
// GET    /api/messages        → list messages (admin)
// PATCH  /api/messages        → mark read/unread { id, read } (admin)
// DELETE /api/messages?id=... → delete (admin)
import crypto from "node:crypto";
import { handler, send, readJson, query, clientIp, today, methodNotAllowed } from "./_lib/http.js";
import { requireAdmin } from "./_lib/auth.js";
import { cmd, pipeline, hashToObject } from "./_lib/store.js";

const clip = (s, n) => String(s ?? "").trim().slice(0, n);

export default handler(async (req, res) => {
  if (req.method === "POST") {
    const b = await readJson(req, 50_000);
    if (b.website) return send(res, 200, { ok: true }); // hidden spam trap filled in → ignore quietly
    const msg = {
      id: crypto.randomUUID(),
      at: new Date().toISOString(),
      name: clip(b.name, 120),
      email: clip(b.email, 200),
      subject: clip(b.subject, 120) || "General question",
      message: clip(b.message, 5000),
      read: false,
    };
    if (!msg.email && !msg.message) return send(res, 400, { error: "Please fill in the form." });

    // Max 10 messages per hour from one connection.
    const rateKey = `msg:rate:${clientIp(req)}`;
    const [count] = await pipeline([["INCR", rateKey], ["EXPIRE", rateKey, 3600]]);
    if (count > 10) return send(res, 429, { error: "Too many messages. Please try again later." });

    await pipeline([
      ["HSET", "messages", msg.id, JSON.stringify(msg)],
      ["HINCRBY", `m:ev:${today()}`, "form", 1],
    ]);
    return send(res, 201, { ok: true });
  }

  if (!(await requireAdmin(req, res))) return;

  if (req.method === "GET") {
    const all = Object.values(hashToObject(await cmd("HGETALL", "messages")))
      .map((m) => JSON.parse(m))
      .sort((a, b) => (a.at < b.at ? 1 : -1));
    return send(res, 200, { messages: all });
  }

  if (req.method === "PATCH") {
    const { id, read } = await readJson(req, 10_000);
    const raw = await cmd("HGET", "messages", String(id));
    if (!raw) return send(res, 404, { error: "Message not found." });
    const msg = { ...JSON.parse(raw), read: !!read };
    await cmd("HSET", "messages", msg.id, JSON.stringify(msg));
    return send(res, 200, { message: msg });
  }

  if (req.method === "DELETE") {
    const id = query(req).get("id");
    if (!id) return send(res, 400, { error: "Missing id." });
    await cmd("HDEL", "messages", id);
    return send(res, 200, { ok: true });
  }

  methodNotAllowed(res);
});
