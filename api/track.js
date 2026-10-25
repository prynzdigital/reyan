// POST /api/track → anonymous visit statistics from the website (no personal data stored).
// Counts page views, unique visitors (random anonymous id), devices, referrers,
// sections viewed, downloads, plays, video views, app installs and forms sent.
import { handler, send, readJson, today, methodNotAllowed } from "./_lib/http.js";
import { pipeline, storeMode } from "./_lib/store.js";

const KEEP = 400 * 24 * 3600; // keep daily stats ~13 months
const TYPES = new Set(["pageview", "download", "play", "video", "form", "install", "sections", "outbound"]);
const clip = (s, n = 120) => String(s || "").replace(/[\r\n]/g, " ").slice(0, n);

export default handler(async (req, res) => {
  if (req.method !== "POST") return methodNotAllowed(res);
  if (storeMode === "none") return send(res, 204);
  const ua = String(req.headers["user-agent"] || "");
  if (/bot|crawl|spider|preview|headless/i.test(ua)) return send(res, 204);

  const e = await readJson(req, 10_000);
  if (!TYPES.has(e.t)) return send(res, 400, { error: "Unknown event" });
  const d = today();
  const cmds = [];
  const day = (k) => { cmds.push(["EXPIRE", k, KEEP]); return k; };

  if (e.t === "pageview") {
    cmds.push(["INCR", `m:pv:${d}`]); day(`m:pv:${d}`);
    if (e.v) { cmds.push(["PFADD", `m:uv:${d}`, clip(e.v, 40)]); day(`m:uv:${d}`); }
    const device = ["app", "mobile", "desktop"].includes(e.d) ? e.d : "desktop";
    cmds.push(["HINCRBY", `m:dev:${d}`, device, 1]); day(`m:dev:${d}`);
    let ref = "Direct";
    try { if (e.r) ref = new URL(e.r).hostname.replace(/^www\./, "") || "Direct"; } catch { /* keep Direct */ }
    cmds.push(["HINCRBY", `m:ref:${d}`, clip(ref, 60), 1]); day(`m:ref:${d}`);
  } else if (e.t === "sections") {
    const list = Array.isArray(e.s) ? e.s.slice(0, 30) : [];
    list.forEach((s) => cmds.push(["HINCRBY", `m:sec:${d}`, clip(s, 40), 1]));
    if (list.length) day(`m:sec:${d}`);
  } else {
    cmds.push(["HINCRBY", `m:ev:${d}`, e.t, 1]); day(`m:ev:${d}`);
    if (e.i) cmds.push(["HINCRBY", `m:item:${e.t}`, clip(e.i), 1]);
  }
  await pipeline(cmds);
  send(res, 204);
});
