// GET /api/stats?days=30 → dashboard numbers for the admin.
import { handler, send, query, methodNotAllowed } from "./_lib/http.js";
import { requireAdmin } from "./_lib/auth.js";
import { pipeline, cmd, hashToObject } from "./_lib/store.js";

const sumInto = (target, obj) => {
  for (const [k, v] of Object.entries(obj || {})) target[k] = (target[k] || 0) + (+v || 0);
  return target;
};
const top = (obj, n = 8) => Object.entries(obj).map(([name, count]) => ({ name, count: +count || 0 })).sort((a, b) => b.count - a.count).slice(0, n);

export default handler(async (req, res) => {
  if (req.method !== "GET") return methodNotAllowed(res);
  if (!(await requireAdmin(req, res))) return;

  const days = Math.min(365, Math.max(1, +query(req).get("days") || 30));
  const dates = [];
  for (let i = days - 1; i >= 0; i--) dates.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));

  const cmds = [];
  dates.forEach((d) => cmds.push(
    ["GET", `m:pv:${d}`], ["PFCOUNT", `m:uv:${d}`], ["HGETALL", `m:ev:${d}`],
    ["HGETALL", `m:dev:${d}`], ["HGETALL", `m:ref:${d}`], ["HGETALL", `m:sec:${d}`],
  ));
  cmds.push(["PFCOUNT", ...dates.map((d) => `m:uv:${d}`)]);
  cmds.push(["HGETALL", "m:item:download"], ["HGETALL", "m:item:play"], ["HGETALL", "m:item:video"]);
  const r = await pipeline(cmds);

  const daily = [];
  const events = {}, devices = {}, referrers = {}, sections = {};
  dates.forEach((date, i) => {
    const [pv, uv, ev, dev, ref, sec] = r.slice(i * 6, i * 6 + 6);
    const e = hashToObject(ev);
    daily.push({ date, views: +pv || 0, visitors: +uv || 0 });
    sumInto(events, e); sumInto(devices, hashToObject(dev)); sumInto(referrers, hashToObject(ref)); sumInto(sections, hashToObject(sec));
  });
  const rest = r.slice(dates.length * 6);
  const visitors = +rest[0] || 0;

  const messages = Object.values(hashToObject(await cmd("HGETALL", "messages"))).map((m) => JSON.parse(m));

  send(res, 200, {
    days,
    totals: {
      visitors,
      views: daily.reduce((n, d) => n + d.views, 0),
      downloads: events.download || 0,
      plays: (events.play || 0) + (events.video || 0),
      forms: events.form || 0,
      installs: events.install || 0,
      unread: messages.filter((m) => !m.read).length,
    },
    daily,
    devices,
    referrers: top(referrers),
    sections: top(sections, 15),
    topDownloads: top(hashToObject(rest[1])),
    topPlays: top(sumInto(sumInto({}, hashToObject(rest[2])), hashToObject(rest[3]))),
  });
});
