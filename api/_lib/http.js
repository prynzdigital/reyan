// Small request/response helpers that work both on Vercel and in the local dev server.

export function send(res, status, data, headers = {}) {
  const body = data === undefined ? "" : typeof data === "string" ? data : JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": typeof data === "string" ? "text/plain; charset=utf-8" : "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...headers,
  });
  res.end(body);
}

export function readRaw(req, limit = 2_000_000) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > limit) { reject(Object.assign(new Error("Request too large"), { status: 413 })); req.destroy(); return; }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

// Vercel may already have parsed the body; locally we read the stream ourselves.
export async function readJson(req, limit) {
  let body = req.body;
  if (body === undefined) body = await readRaw(req, limit);
  if (Buffer.isBuffer(body)) body = body.toString("utf8");
  if (typeof body === "string") {
    if (!body.trim()) return {};
    try { return JSON.parse(body); } catch { throw Object.assign(new Error("Invalid JSON"), { status: 400 }); }
  }
  return body || {};
}

export function query(req) {
  return new URL(req.url, "http://localhost").searchParams;
}

export function cookies(req) {
  const out = {};
  (req.headers.cookie || "").split(";").forEach((part) => {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

export function clientIp(req) {
  return String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown").split(",")[0].trim();
}

export function isHttps(req) {
  return req.headers["x-forwarded-proto"] === "https" || !!process.env.VERCEL;
}

// Wrap a handler so thrown errors become clean JSON responses.
export function handler(fn) {
  return async (req, res) => {
    try {
      await fn(req, res);
    } catch (err) {
      console.error(err);
      if (!res.headersSent) send(res, err.status || 500, { error: err.status ? err.message : "Something went wrong" });
    }
  };
}

export function methodNotAllowed(res) {
  send(res, 405, { error: "Method not allowed" });
}

export const today = () => new Date().toISOString().slice(0, 10);
