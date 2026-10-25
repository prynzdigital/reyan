// Key-value storage.
// On Vercel: Upstash Redis (connected from the Vercel dashboard → Storage → Upstash for Redis).
// Locally (no Redis variables): a JSON file in .data/db.json, so everything can be tested offline.
import { promises as fs } from "node:fs";
import path from "node:path";

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const storeMode = URL_ && TOKEN ? "redis" : process.env.VERCEL ? "none" : "local";

/* ---------------- Upstash Redis (REST) ---------------- */
async function redis(args) {
  const r = await fetch(URL_, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}
async function redisPipeline(cmds) {
  const r = await fetch(`${URL_}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmds),
  });
  const j = await r.json();
  return j.map((x) => { if (x.error) throw new Error(x.error); return x.result; });
}

/* ---------------- Local JSON file (development only) ---------------- */
const DB_FILE = path.join(process.cwd(), ".data", "db.json");
let db = null;
async function loadDb() {
  if (db) return db;
  try { db = JSON.parse(await fs.readFile(DB_FILE, "utf8")); } catch { db = { s: {}, h: {}, p: {} }; }
  return db;
}
let saveTimer = null;
function saveDb() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    await fs.mkdir(path.dirname(DB_FILE), { recursive: true });
    await fs.writeFile(DB_FILE, JSON.stringify(db));
  }, 50);
}
async function local([cmd, ...a]) {
  const d = await loadDb();
  const C = cmd.toUpperCase();
  const h = (k) => (d.h[k] ||= {});
  switch (C) {
    case "GET": return d.s[a[0]] ?? null;
    case "SET": d.s[a[0]] = String(a[1]); saveDb(); return "OK";
    case "DEL": a.forEach((k) => { delete d.s[k]; delete d.h[k]; delete d.p[k]; }); saveDb(); return a.length;
    case "INCR": d.s[a[0]] = String((+d.s[a[0]] || 0) + 1); saveDb(); return +d.s[a[0]];
    case "INCRBY": d.s[a[0]] = String((+d.s[a[0]] || 0) + +a[1]); saveDb(); return +d.s[a[0]];
    case "EXPIRE": return 1; // expiry is not needed locally
    case "HSET": { const m = h(a[0]); for (let i = 1; i < a.length; i += 2) m[a[i]] = String(a[i + 1]); saveDb(); return 1; }
    case "HGET": return d.h[a[0]]?.[a[1]] ?? null;
    case "HDEL": { const m = h(a[0]); a.slice(1).forEach((f) => delete m[f]); saveDb(); return 1; }
    case "HGETALL": { const m = d.h[a[0]] || {}; return Object.entries(m).flat(); }
    case "HINCRBY": { const m = h(a[0]); m[a[1]] = String((+m[a[1]] || 0) + +a[2]); saveDb(); return +m[a[1]]; }
    case "PFADD": { const s = new Set(d.p[a[0]] || []); a.slice(1).forEach((v) => s.add(v)); d.p[a[0]] = [...s]; saveDb(); return 1; }
    case "PFCOUNT": { const s = new Set(); a.forEach((k) => (d.p[k] || []).forEach((v) => s.add(v))); return s.size; }
    default: throw new Error(`Local store: unsupported command ${C}`);
  }
}

/* ---------------- Public API ---------------- */
function assertReady() {
  if (storeMode === "none") {
    throw Object.assign(new Error("Database not connected. In Vercel, add Upstash for Redis under Storage."), { status: 503 });
  }
}
export async function cmd(...args) {
  assertReady();
  return storeMode === "redis" ? redis(args) : local(args);
}
export async function pipeline(cmds) {
  assertReady();
  if (!cmds.length) return [];
  if (storeMode === "redis") return redisPipeline(cmds);
  const out = [];
  for (const c of cmds) out.push(await local(c));
  return out;
}
export const hashToObject = (arr) => {
  const o = {};
  for (let i = 0; i < (arr || []).length; i += 2) o[arr[i]] = arr[i + 1];
  return o;
};
export async function getJson(key) {
  const v = await cmd("GET", key);
  return v ? JSON.parse(v) : null;
}
export async function setJson(key, value) {
  return cmd("SET", key, JSON.stringify(value));
}
