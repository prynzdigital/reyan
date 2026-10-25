// POST /api/upload → upload a file (admin).
// On Vercel the browser uploads straight to Vercel Blob (so big videos work);
// this route only hands out a short-lived upload permission after checking the admin login.
// Locally the file body is posted here and saved in ./uploads.
import { handler, send, readJson, readRaw, query, methodNotAllowed } from "./_lib/http.js";
import { requireAdmin } from "./_lib/auth.js";
import { mediaMode, blobAuth, blobToken, blobCreds, ALLOWED_TYPES, MAX_BYTES, saveLocal } from "./_lib/media.js";

const typeAllowed = (t) => ALLOWED_TYPES.some((a) => (a.endsWith("/*") ? t.startsWith(a.slice(0, -1)) : t === a));

export default handler(async (req, res) => {
  if (req.method !== "POST") return methodNotAllowed(res);

  if (mediaMode === "blob" && blobAuth === "oidc") {
    // Presigned upload: Vercel signs a one-off upload address for this exact file.
    const body = await readJson(req, 100_000);
    if (body?.type !== "blob.generate-presigned-url") return send(res, 400, { error: "Unexpected upload request." });
    if (!(await requireAdmin(req, res))) return;
    const { handleUploadPresigned } = await import("@vercel/blob/client");
    const { issueSignedToken } = await import("@vercel/blob");
    const result = await handleUploadPresigned({
      body,
      request: req,
      getSignedToken: async (pathname) => ({
        token: await issueSignedToken({
          ...blobCreds(req),
          pathname,
          operations: ["put"],
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_BYTES,
          validUntil: Date.now() + 60 * 60 * 1000,
        }),
        urlOptions: { allowedContentTypes: ALLOWED_TYPES, maximumSizeInBytes: MAX_BYTES },
      }),
    });
    return send(res, 200, result);
  }

  if (mediaMode === "blob") {
    const body = await readJson(req, 100_000);
    // Only "please give me an upload token" requests come here (no completion callback is used).
    if (body?.type !== "blob.generate-client-token") return send(res, 400, { error: "Unexpected upload request." });
    if (!(await requireAdmin(req, res))) return;
    const { handleUpload } = await import("@vercel/blob/client");
    const result = await handleUpload({
      body,
      request: req,
      token: blobToken,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED_TYPES,
        maximumSizeInBytes: MAX_BYTES,
        addRandomSuffix: true,
      }),
    });
    return send(res, 200, result);
  }

  if (!(await requireAdmin(req, res))) return;

  if (mediaMode === "local") {
    const q = query(req);
    const type = String(req.headers["content-type"] || "application/octet-stream").split(";")[0];
    if (!typeAllowed(type)) return send(res, 415, { error: "This file type can't be uploaded. Use images, audio, video or PDF." });
    const buffer = await readRaw(req, MAX_BYTES);
    return send(res, 201, await saveLocal(q.get("name") || "file", type, buffer));
  }

  send(res, 503, { error: "File storage isn't connected yet. In Vercel, add Blob under Storage." });
});
