// Admin login: one password, signed session cookie, brute-force protection.
// Set ADMIN_PASSWORD in Vercel → Settings → Environment Variables.
// Richard can change it later inside the admin (stored hashed in the database).
import crypto from "node:crypto";
import { cmd, storeMode } from "./store.js";
import { cookies, clientIp, isHttps, send } from "./http.js";

const COOKIE = "rem_admin";
const WEEK = 7 * 24 * 3600;
const LOCAL_DEV_PASSWORD = "admin"; // only used when running locally without ADMIN_PASSWORD

function secret() {
  const base = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || (storeMode === "local" ? "local-dev-secret" : "");
  if (!base) throw Object.assign(new Error("ADMIN_PASSWORD is not set in Vercel."), { status: 503 });
  return crypto.createHash("sha256").update(`rem-session:${base}`).digest();
}
const b64 = (buf) => Buffer.from(buf).toString("base64url");
const sign = (data) => b64(crypto.createHmac("sha256", secret()).update(data).digest());

async function passwordVersion() {
  return (await cmd("GET", "auth:ver")) || "1";
}

export async function createSession(res, req) {
  const payload = b64(JSON.stringify({ exp: Date.now() + WEEK * 1000, v: await passwordVersion() }));
  const token = `${payload}.${sign(payload)}`;
  res.setHeader("Set-Cookie", `${COOKIE}=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${WEEK}${isHttps(req) ? "; Secure" : ""}`);
}

export function clearSession(res, req) {
  res.setHeader("Set-Cookie", `${COOKIE}=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0${isHttps(req) ? "; Secure" : ""}`);
}

export async function isAdmin(req) {
  const token = cookies(req)[COOKIE];
  if (!token || !token.includes(".")) return false;
  const [payload, mac] = token.split(".");
  const expected = sign(payload);
  if (mac.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return false;
  try {
    const { exp, v } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return exp > Date.now() && String(v) === String(await passwordVersion());
  } catch {
    return false;
  }
}

// Use at the top of admin-only routes. Also blocks cross-site requests.
export async function requireAdmin(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD" && req.headers["x-requested-with"] !== "rem-admin") {
    send(res, 403, { error: "Forbidden" });
    return false;
  }
  if (!(await isAdmin(req))) {
    send(res, 401, { error: "Please sign in again." });
    return false;
  }
  return true;
}

/* ---------- passwords ---------- */
function hashPassword(pw) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(pw, salt, 64);
  return `${b64(salt)}:${b64(hash)}`;
}
function checkHash(pw, stored) {
  const [salt, hash] = stored.split(":");
  const test = crypto.scryptSync(pw, Buffer.from(salt, "base64url"), 64);
  return crypto.timingSafeEqual(test, Buffer.from(hash, "base64url"));
}
function safeEqual(a, b) {
  const x = crypto.createHash("sha256").update(a).digest();
  const y = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(x, y);
}

export async function verifyPassword(pw) {
  if (typeof pw !== "string" || !pw) return false;
  const stored = await cmd("GET", "auth:hash");
  if (stored) return checkHash(pw, stored);
  if (process.env.ADMIN_PASSWORD) return safeEqual(pw, process.env.ADMIN_PASSWORD);
  if (storeMode === "local") return safeEqual(pw, LOCAL_DEV_PASSWORD);
  throw Object.assign(new Error("ADMIN_PASSWORD is not set in Vercel."), { status: 503 });
}

export async function setPassword(pw) {
  await cmd("SET", "auth:hash", hashPassword(pw));
  await cmd("INCR", "auth:ver"); // signs out every other device
}

/* ---------- brute-force protection: 8 wrong tries per 15 minutes per IP ---------- */
export async function tooManyAttempts(req) {
  const n = +(await cmd("GET", `auth:fail:${clientIp(req)}`)) || 0;
  return n >= 8;
}
export async function recordFailure(req) {
  const key = `auth:fail:${clientIp(req)}`;
  await cmd("INCR", key);
  await cmd("EXPIRE", key, 900);
}
export async function clearFailures(req) {
  await cmd("DEL", `auth:fail:${clientIp(req)}`);
}
