/* =========================================================
   REM Admin — edit the whole website, see statistics, read messages, upload media.
   Talks to the /api functions. Content is published live when "Publish" is pressed.
   ========================================================= */
const API = (p) => new URL(`../api/${p}`, location.href).href;
const BLOB_CLIENT = "https://esm.sh/@vercel/blob@2.8.0/client";

/* ---------------- tiny DOM helper ---------------- */
function h(tag, props = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "style" && typeof v === "object") Object.entries(v).forEach(([p, val]) => (p.startsWith("--") ? el.style.setProperty(p, val) : (el.style[p] = val)));
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
    else if (k in el && k !== "list" && k !== "form") el[k] = v;
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue;
    el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
  return el;
}
const $ = (s, r = document) => r.querySelector(s);

const ICON_PATHS = {
  dashboard: "M3 13h8V3H3zm0 8h8v-6H3zm10 0h8V11h-8zm0-18v6h8V3z",
  inbox: "M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 12h-4a3 3 0 0 1-6 0H5V5h14z",
  home: "M12 3 2 11h3v9h5v-6h4v6h5v-9h3z",
  person: "M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z",
  tiles: "M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z",
  book: "M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM9 4h2v5l-1-.8L9 9zm9 16H6V4h1v9l3-2.3 3 2.3V4h5z",
  gift: "M20 7h-2.2A3 3 0 0 0 12 3.8 3 3 0 0 0 6.2 7H4a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8h1a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zM11 20H7v-8h4zm0-10H5V9h6zm6 10h-4v-8h4zm2-10h-6V9h6z",
  video: "M21 6h-7.6l3.3-3.3-.7-.7L12 6 8 2l-.7.7L10.6 6H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm0 14H3V8h18zM9 10v8l7-4z",
  mic: "M12 3a4 4 0 0 1 4 4v5a4 4 0 0 1-8 0V7a4 4 0 0 1 4-4zm7 9a7 7 0 0 1-6 6.93V22h-2v-3.07A7 7 0 0 1 5 12h2a5 5 0 0 0 10 0z",
  music: "M12 3v10.6A4 4 0 1 0 14 17V7h4V3z",
  calendar: "M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V9h14z",
  quote: "M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM9.5 12.6 8 14l-1-1 .9-1.6A2 2 0 1 1 9.5 12.6zm6 0L14 14l-1-1 .9-1.6a2 2 0 1 1 1.6.2z",
  phone: "M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z",
  image: "M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5z",
  gear: "M19.4 13a7.6 7.6 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.4 7.4 0 0 0-1.7-1L15 3h-4l-.4 2.6a7.4 7.4 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.6 7.6 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1a7.4 7.4 0 0 0 1.7 1L11 21h4l.4-2.6a7.4 7.4 0 0 0 1.7-1l2.5 1 2-3.5zM13 15.5A3.5 3.5 0 1 1 13 8.5a3.5 3.5 0 0 1 0 7z",
  external: "M14 3h7v7h-2V6.4l-9.3 9.3-1.4-1.4L17.6 5H14zM5 5h6v2H5v12h12v-6h2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z",
  logout: "M10 17l1.4-1.4-2.6-2.6H20v-2H8.8l2.6-2.6L10 7l-5 5zM4 5h8V3H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8v-2H4z",
  menu: "M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z",
  up: "M7 14l5-5 5 5z", down: "M7 10l5 5 5-5z",
  trash: "M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z",
  copy: "M16 1H4a2 2 0 0 0-2 2v14h2V3h12zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11z",
  upload: "M5 20h14v-2H5zm7-16-5 5h3v6h4V9h3z",
  plus: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z",
  chev: "M7 10l5 5 5-5z",
  eye: "M12 5C7 5 2.7 8.1 1 12c1.7 3.9 6 7 11 7s9.3-3.1 11-7c-1.7-3.9-6-7-11-7zm0 11.5A4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 0 1 0 9z",
  doc: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm-1 7V3.5L18.5 9z",
  audio: "M12 3v10.6A4 4 0 1 0 14 17V7h4V3z",
  users: "M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 2c-2.3 0-7 1.2-7 3.5V19h14v-2.5C15 14.2 10.3 13 8 13zm8 0c-.3 0-.6 0-1 .1a4.2 4.2 0 0 1 2 3.4V19h6v-2.5c0-2.3-4.7-3.5-7-3.5z",
  download: "M19 9h-4V3H9v6H5l7 7zM5 18v2h14v-2z",
  play: "M8 5v14l11-7z",
  mail: "M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5z",
  app: "M17 1H7a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2zm0 18H7V5h10z",
};
function icon(name) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  const p = document.createElementNS(ns, "path");
  p.setAttribute("d", ICON_PATHS[name] || "");
  svg.append(p);
  return svg;
}

/* ---------------- helpers ---------------- */
const clone = (o) => JSON.parse(JSON.stringify(o ?? null));
const getPath = (o, p) => p.split(".").reduce((x, k) => (x == null ? undefined : x[k]), o);
function setPath(o, p, v) {
  const keys = p.split(".");
  let x = o;
  keys.slice(0, -1).forEach((k) => { if (x[k] == null || typeof x[k] !== "object") x[k] = {}; x = x[k]; });
  x[keys.at(-1)] = v;
}
const fmtSize = (b) => (b > 1e9 ? `${(b / 1e9).toFixed(1)} GB` : b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`);
const fmtWhen = (iso) => {
  const d = new Date(iso), diff = (Date.now() - d) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined });
};
const kindOf = (urlOrType = "") => {
  const s = urlOrType.toLowerCase();
  if (/^image\/|\.(png|jpe?g|webp|gif|svg|avif)(\?|$)/.test(s)) return "image";
  if (/^audio\/|\.(mp3|m4a|wav|aac|ogg)(\?|$)/.test(s)) return "audio";
  if (/^video\/|\.(mp4|mov|webm|m4v)(\?|$)/.test(s)) return "video";
  if (/pdf/.test(s)) return "pdf";
  return "file";
};
// Content uses paths relative to the website (images/x.jpg); the admin lives in /admin/.
const siteUrl = (u = "") => (/^(https?:|data:|blob:|\/)/i.test(u) ? u : `../${u}`);
const fileNameOf = (url = "") => decodeURIComponent(url.split("?")[0].split("/").pop() || url);
const ytId = (v = "") => {
  const s = v.trim();
  const m = s.match(/(?:youtu\.be\/|v=|shorts\/|embed\/|live\/)([\w-]{11})/);
  return m ? m[1] : s;
};

function toast(msg, type = "ok") {
  const t = h("div", { class: `toast ${type}` }, msg);
  $("#toasts").append(t);
  setTimeout(() => t.remove(), type === "err" ? 6000 : 3500);
}
function modal({ title, text, body, actions = [], wide = false }) {
  return new Promise((resolve) => {
    const close = (v) => { back.remove(); document.removeEventListener("keydown", onKey); resolve(v); };
    const onKey = (e) => { if (e.key === "Escape") close(null); };
    const back = h("div", { class: "modal-back", onclick: (e) => { if (e.target === back) close(null); } },
      h("div", { class: `modal${wide ? " wide" : ""}`, role: "dialog", "aria-modal": "true" },
        title && h("h3", {}, title),
        text && h("p", {}, text),
        body,
        actions.length && h("div", { class: "modal-actions" },
          actions.map((a) => h("button", { class: `btn ${a.class || "btn-ghost"}`, onclick: () => close(a.value) }, a.label)))));
    document.addEventListener("keydown", onKey);
    document.body.append(back);
    modal.current = { close };
  });
}
const confirmBox = (title, text, label = "Delete", cls = "btn-danger") =>
  modal({ title, text, actions: [{ label: "Cancel", value: false }, { label, value: true, class: cls }] });

/* ---------------- API ---------------- */
async function api(path, { method = "GET", body, raw } = {}) {
  const res = await fetch(API(path), {
    method,
    credentials: "same-origin",
    headers: { "X-Requested-With": "rem-admin", ...(body !== undefined ? { "Content-Type": "application/json" } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (raw) return res;
  let data = {};
  try { data = await res.json(); } catch { /* empty */ }
  if (res.status === 401 && path !== "login") { state.me = null; renderLogin("Your session ended. Please sign in again."); throw Object.assign(new Error(data.error || "Signed out"), { silent: true }); }
  if (!res.ok) throw Object.assign(new Error(data.error || `Request failed (${res.status})`), { status: res.status, data });
  return data;
}

/* ---------------- state ---------------- */
const state = {
  me: null,
  published: null, // content as it is live on the site
  draft: null,     // content being edited
  updatedAt: null,
  page: "dashboard",
  unread: 0,
  statsDays: 30,
};
const DEFAULTS = () => clone(window.SITE || {});

/* =========================================================
   CONTENT SCHEMA — every editable part of the website
   ========================================================= */
const LINK_HELP = "A web address (https://…) or a part of this page, e.g. #contact";
const head = (id, parts = ["kicker", "title", "text"]) => ({
  type: "group", title: "Section heading",
  fields: [
    { key: `sections.${id}.visible`, type: "toggle", label: "Show this section on the website", default: true },
    ...parts.map((p) => ({
      key: `sections.${id}.${p}`,
      type: p === "text" ? "textarea" : "text",
      rows: 2,
      label: { kicker: "Small label above the title", title: "Title", text: "Description" }[p],
      help: p === "title" || p === "text" ? "Tip: {name} shows the preacher's name, {ministry} the ministry name." : undefined,
    })),
  ],
});
const showOnly = (id) => ({ key: `sections.${id}.visible`, type: "toggle", label: "Show this section on the website", default: true });
const PHOTO_POS = [["50% 20%", "Top (faces)"], ["50% 35%", "Upper middle"], ["50% 50%", "Center"], ["50% 80%", "Bottom"]];

const PAGES = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard", group: "Overview" },
  { id: "inbox", label: "Inbox", icon: "inbox", group: "Overview" },

  { id: "home", label: "Home & brand", icon: "home", group: "Website",
    intro: "The name, tagline and the photo slideshow at the very top of the website.",
    fields: [
      { type: "group", title: "Brand", fields: [
        { key: "ministryName", type: "text", label: "Ministry name" },
        { key: "preacherName", type: "text", label: "Preacher's name (as used on the site)" },
        { key: "tagline", type: "text", label: "Tagline", help: "Shown over the photos at the top." },
      ] },
      { key: "photos.hero", type: "list", label: "Slideshow photos", help: "Shown in this order. Use wide (landscape) photos.", addLabel: "Add photo",
        newItem: () => ({ src: "", position: "50% 30%" }), summary: (it) => fileNameOf(it?.src || "") || "New photo",
        normalize: (it) => (typeof it === "string" ? { src: it, position: "50% 30%" } : it),
        item: [{ key: "src", type: "image", label: "Photo" }, { key: "position", type: "position", label: "Keep in view when cropped" }] },
    ] },

  { id: "about", label: "About", icon: "person", group: "Website",
    intro: "The biography section and its photo.",
    fields: [
      showOnly("about"),
      { key: "photos.about", type: "photo", label: "Portrait photo" },
      { key: "bio", type: "strings", label: "Biography paragraphs", addLabel: "Add paragraph" },
    ] },

  { id: "resources", label: "Resources", icon: "tiles", group: "Website",
    intro: "The big tiles (Books, School of Ministry, Meetings, Podcast).",
    fields: [
      head("resources"),
      { key: "resources", type: "list", label: "Tiles", addLabel: "Add tile", summary: (it) => it.title,
        newItem: () => ({ title: "New tile", text: "", link: "#contact", cta: "Learn more", image: "", logo: "" }),
        item: [
          { key: "title", type: "text", label: "Title" },
          { key: "text", type: "textarea", label: "Short description", rows: 3 },
          { key: "cta", type: "text", label: "Button text" },
          { key: "link", type: "text", label: "Link", help: LINK_HELP },
          { key: "image", type: "image", label: "Background photo (optional)" },
          { key: "logo", type: "image", label: "Logo instead of the title (optional)", dark: true },
        ] },
    ] },

  { id: "books", label: "Books & eBooks", icon: "book", group: "Website",
    intro: "The featured new book, and free PDF books people can download.",
    fields: [
      { type: "group", title: "Featured new book", fields: [
        showOnly("new-release"),
        { key: "newRelease.kicker", type: "text", label: "Small label (e.g. New Release)" },
        { key: "newRelease.title", type: "text", label: "Book title" },
        { key: "newRelease.subtitle", type: "text", label: "Subtitle" },
        { key: "newRelease.text", type: "textarea", label: "Description", rows: 4 },
        { key: "newRelease.cta", type: "text", label: "Button text" },
        { key: "newRelease.link", type: "text", label: "Button link (where to buy)", help: LINK_HELP },
        { key: "newRelease.cover", type: "image", label: "Cover image (optional)" },
      ] },
      head("ebooks"),
      { key: "ebooks", type: "list", label: "Free eBooks (PDF)", addLabel: "Add eBook", addTop: true, summary: (it) => it.title,
        newItem: () => ({ title: "New eBook", subtitle: "", text: "", file: "", cover: "", details: "PDF" }),
        item: [
          { key: "file", type: "media", accept: "pdf", label: "PDF file" },
          { key: "title", type: "text", label: "Title" },
          { key: "subtitle", type: "text", label: "Subtitle" },
          { key: "text", type: "textarea", label: "Short description", rows: 3 },
          { key: "details", type: "text", label: "Small details line", help: "e.g. PDF · 64 pages · 2 MB" },
          { key: "cover", type: "image", label: "Cover image (optional)" },
        ] },
    ] },

  { id: "partner", label: "Partner & give", icon: "gift", group: "Website",
    intro: "The partnership section, current project, giving link and bank details.",
    fields: [
      showOnly("partner"),
      { type: "group", title: "Partnership", fields: [
        { key: "partner.title", type: "text", label: "Title" },
        { key: "partner.text", type: "textarea", label: "Text", rows: 4 },
        { key: "links.givingLink", type: "text", label: "Giving page link", help: "Your PayPal / Paystack / bank giving page. The 'Join now' button opens it." },
        { key: "partner.currency", type: "text", label: "Currency symbol", help: "e.g. $, GH₵, £" },
        { key: "partner.bankDetails", type: "textarea", label: "Bank transfer & mobile money details", rows: 4, help: "Leave empty to hide this part." },
        { key: "photos.partner", type: "photo", label: "Background photo" },
      ] },
      { type: "group", title: "Current project", fields: [
        { key: "partner.project.title", type: "text", label: "Project name" },
        { key: "partner.project.raised", type: "number", label: "Amount raised" },
        { key: "partner.project.goal", type: "number", label: "Goal" },
      ] },
      { key: "giveImpact", type: "list", label: "What each gift does", help: "Shown under the amount buttons. {amt} is replaced with the amount.", addLabel: "Add line",
        summary: (it) => `${it.min}+ → ${it.text}`, newItem: () => ({ min: 0, text: "" }),
        item: [{ key: "min", type: "number", label: "From this amount" }, { key: "text", type: "text", label: "Text" }] },
    ] },

  { id: "live", label: "Live & videos", icon: "video", group: "Website",
    intro: "Your YouTube channel, live service times and the videos shown on the site.",
    fields: [
      head("live", ["kicker", "title"]),
      { type: "group", title: "YouTube", fields: [
        { key: "youtube.handle", type: "text", label: "YouTube @handle", help: "e.g. @richardengmannministries" },
        { key: "youtube.channelId", type: "text", label: "Channel ID (for the live player)", help: "Starts with UC… Ask your web person if unsure." },
      ] },
      { key: "services", type: "list", label: "Regular live services", help: "Leave empty if there are no regular live services.", addLabel: "Add service time",
        summary: (it) => `${it.name || "Service"} · ${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][it.day] || ""} ${it.time || ""}`,
        newItem: () => ({ name: "Sunday Service", day: 0, time: "10:00", durationMins: 120 }),
        item: [
          { key: "name", type: "text", label: "Name" },
          { key: "day", type: "select", label: "Day", number: true, options: [[0, "Sunday"], [1, "Monday"], [2, "Tuesday"], [3, "Wednesday"], [4, "Thursday"], [5, "Friday"], [6, "Saturday"]] },
          { key: "time", type: "time", label: "Start time" },
          { key: "durationMins", type: "number", label: "Length (minutes)" },
        ] },
      head("videos", ["kicker", "title"]),
      { key: "videos", type: "list", label: "Videos", help: "Use a YouTube link, or upload a video file.", addLabel: "Add video", addTop: true, summary: (it) => it.title,
        newItem: () => ({ title: "New video", place: "", youtubeId: "", file: "", thumbnail: "" }),
        item: [
          { key: "title", type: "text", label: "Title" },
          { key: "place", type: "text", label: "Small line under the title", help: "A date or place" },
          { key: "youtubeId", type: "youtube", label: "YouTube link" },
          { key: "file", type: "media", accept: "video", label: "…or upload a video file" },
          { key: "thumbnail", type: "image", label: "Thumbnail (for uploaded videos)" },
        ] },
    ] },

  { id: "podcast", label: "Podcast", icon: "mic", group: "Website",
    intro: "The Faith Café Podcast: platform links and episodes.",
    fields: [
      head("podcast", ["text"]),
      { type: "group", title: "Where to listen", fields: [
        { key: "links.podcastTiktok", type: "url", label: "TikTok" },
        { key: "links.podcastInstagram", type: "url", label: "Instagram" },
        { key: "links.spotify", type: "url", label: "Spotify", help: "Leave empty to show 'Coming soon'." },
        { key: "links.applePodcasts", type: "url", label: "Apple Podcasts", help: "Leave empty to show 'Coming soon'." },
      ] },
      { key: "podcast", type: "list", label: "Episodes", addLabel: "Add episode", addTop: true, summary: (it) => it.title,
        newItem: () => ({ title: "New episode", date: new Date().toISOString().slice(0, 10), length: "", audio: "" }),
        item: [
          { key: "title", type: "text", label: "Title" },
          { key: "date", type: "date", label: "Date" },
          { key: "length", type: "text", label: "Length", help: "e.g. 32 min" },
          { key: "audio", type: "media", accept: "audio", label: "Audio file (MP3)", help: "Without audio, the play button opens Spotify/YouTube." },
        ] },
    ] },

  { id: "music", label: "Music", icon: "music", group: "Website",
    intro: "Songs and albums, with links to Spotify, Apple Music and more.",
    fields: [
      head("music"),
      { key: "music", type: "list", label: "Releases", addLabel: "Add release", addTop: true, summary: (it) => `${it.title}${it.type ? ` · ${it.type}` : ""}`,
        newItem: () => ({ title: "New song", type: "Single", year: String(new Date().getFullYear()), cover: "", audio: "", spotify: "", appleMusic: "", youtubeMusic: "", audiomack: "", boomplay: "" }),
        item: [
          { key: "title", type: "text", label: "Title" },
          { key: "type", type: "select", label: "Type", options: [["Single", "Single"], ["EP", "EP"], ["Album", "Album"]] },
          { key: "year", type: "text", label: "Year" },
          { key: "cover", type: "image", label: "Cover art (square)" },
          { key: "audio", type: "media", accept: "audio", label: "Audio preview (optional)" },
          { key: "spotify", type: "url", label: "Spotify link" },
          { key: "appleMusic", type: "url", label: "Apple Music link" },
          { key: "youtubeMusic", type: "url", label: "YouTube Music link" },
          { key: "audiomack", type: "url", label: "Audiomack link" },
          { key: "boomplay", type: "url", label: "Boomplay link" },
        ] },
    ] },

  { id: "events", label: "Events & conferences", icon: "calendar", group: "Website",
    intro: "Your signature conferences and the dated schedule. Past events hide themselves.",
    fields: [
      head("events", ["kicker", "title"]),
      { key: "conferences", type: "list", label: "Signature conferences", addLabel: "Add conference", summary: (it) => it.name,
        newItem: () => ({ name: "New conference", kicker: "Signature conference", logo: "", text: "", link: "#contact", cta: "Get updates" }),
        item: [
          { key: "name", type: "text", label: "Name" },
          { key: "kicker", type: "text", label: "Small label", help: "e.g. Signature conference, Healing service" },
          { key: "logo", type: "image", label: "Logo (optional)", dark: true },
          { key: "text", type: "textarea", label: "Description", rows: 3 },
          { key: "cta", type: "text", label: "Button text" },
          { key: "link", type: "text", label: "Button link", help: LINK_HELP },
        ] },
      { key: "events", type: "list", label: "Schedule", addLabel: "Add event", summary: (it) => `${it.date || ""} · ${it.city || ""} — ${it.venue || ""}`,
        newItem: () => ({ date: new Date().toISOString().slice(0, 10), endDate: "", city: "", venue: "", link: "#contact", cta: "More info" }),
        item: [
          { key: "date", type: "date", label: "Date" },
          { key: "endDate", type: "date", label: "End date (for multi-day events)" },
          { key: "city", type: "text", label: "City" },
          { key: "venue", type: "text", label: "Venue / event name" },
          { key: "cta", type: "text", label: "Button text" },
          { key: "link", type: "text", label: "Button link", help: LINK_HELP },
        ] },
    ] },

  { id: "testimonies", label: "Testimonies", icon: "quote", group: "Website",
    intro: "Testimonies shown on the site. Tip: open one from the Inbox and press 'Add to testimonies'.",
    fields: [
      head("testimonies"),
      { key: "testimonies", type: "list", label: "Testimonies", addLabel: "Add testimony", addTop: true, summary: (it) => `${it.name || "Anonymous"} — ${(it.text || "").slice(0, 60)}`,
        newItem: () => ({ text: "", name: "", place: "" }),
        item: [
          { key: "text", type: "textarea", label: "Testimony", rows: 4 },
          { key: "name", type: "text", label: "Name", help: "Ask permission first. A first name and initial is fine." },
          { key: "place", type: "text", label: "Town" },
        ] },
    ] },

  { id: "contact", label: "Contact & social", icon: "phone", group: "Website",
    intro: "Contact details, where form messages go, social media and the invite section.",
    fields: [
      { type: "group", title: "Contact details", fields: [
        { key: "phone", type: "tel", label: "Phone" },
        { key: "email", type: "email", label: "Email" },
        { key: "address", type: "text", label: "Mailing address" },
        { key: "whatsapp", type: "text", label: "WhatsApp number (digits only, with country code)", help: "e.g. 233547904882" },
      ] },
      { type: "group", title: "Form messages", fields: [
        { key: "formsTo", type: "select", label: "Where contact, prayer and newsletter forms go",
          options: [["inbox", "This admin's Inbox (recommended)"], ["whatsapp", "WhatsApp"], ["email", "Email"]] },
      ] },
      { type: "group", title: "Social media", fields: [
        { key: "socials.youtube", type: "url", label: "YouTube" },
        { key: "socials.facebook", type: "url", label: "Facebook" },
        { key: "socials.instagram", type: "url", label: "Instagram" },
        { key: "socials.tiktok", type: "url", label: "TikTok" },
        { key: "socials.x", type: "url", label: "X (Twitter)" },
      ] },
      head("contact"),
      { type: "group", title: "Invite section", fields: [
        { key: "sections.invite.visible", type: "toggle", label: "Show this section on the website", default: true },
        { key: "sections.invite.title", type: "text", label: "Title" },
        { key: "sections.invite.text", type: "textarea", label: "Text", rows: 2 },
      ] },
      { type: "group", title: "Newsletter", fields: [
        { key: "sections.newsletter.visible", type: "toggle", label: "Show this section on the website", default: true },
        { key: "sections.newsletter.title", type: "text", label: "Title" },
      ] },
    ] },

  { id: "media", label: "Media library", icon: "image", group: "Library" },
  { id: "settings", label: "Settings", icon: "gear", group: "Account" },
];
const pageById = (id) => PAGES.find((p) => p.id === id) || PAGES[0];

/* =========================================================
   LOGIN
   ========================================================= */
function renderLogin(message = "") {
  const err = h("p", { class: "error", role: "alert" }, message);
  const pw = h("input", { type: "password", id: "pw", class: "input", autocomplete: "current-password", required: true, placeholder: "Password" });
  const show = h("button", { type: "button", class: "btn-icon", "aria-label": "Show password", onclick: () => { pw.type = pw.type === "password" ? "text" : "password"; } }, icon("eye"));
  const btn = h("button", { class: "btn btn-gold", type: "submit" }, "Sign in");
  const notes = [];
  if (state.setup?.storeMode === "none") notes.push("The database isn't connected yet, so signing in isn't possible. Follow the setup guide (README) to connect Upstash Redis in Vercel.");
  if (state.setup?.localDevPassword) notes.push("Local test mode — the password is: admin");
  const form = h("form", {
    onsubmit: async (e) => {
      e.preventDefault();
      btn.disabled = true; err.textContent = "";
      try {
        state.me = await api("login", { method: "POST", body: { password: pw.value } });
        await startApp();
      } catch (ex) {
        err.textContent = ex.message;
        btn.disabled = false;
        pw.select();
      }
    },
  },
  h("div", { class: "field" }, h("label", { for: "pw", class: "sr" }, "Password"), h("div", { class: "pw-wrap" }, pw, show)),
  btn, err,
  notes.map((n) => h("p", { class: "note" }, n)));

  $("#root").replaceChildren(h("div", { class: "login" },
    h("div", { class: "login-card" },
      h("div", { class: "login-brand" },
        h("div", { class: "mark" }, h("img", { src: "../images/logo-mark-white.png", alt: "" })),
        h("h1", {}, "REM Admin"),
        h("p", {}, "Richard Engmann Ministries")),
      form)));
  setTimeout(() => pw.focus(), 50);
}

/* =========================================================
   APP SHELL
   ========================================================= */
async function loadContent() {
  const data = await api("content");
  const defaults = DEFAULTS();
  const merged = data.content ? { ...defaults, ...data.content } : defaults;
  state.published = clone(merged);
  state.draft = clone(merged);
  state.updatedAt = data.updatedAt;
}

async function startApp() {
  await loadContent();
  try { state.unread = (await api("stats?days=1")).totals.unread; } catch { state.unread = 0; }
  renderShell();
  go(location.hash.slice(1) || "dashboard");
}

function renderShell() {
  let group = "";
  const nav = h("nav", { "aria-label": "Admin" });
  PAGES.forEach((p) => {
    if (p.group !== group) { group = p.group; nav.append(h("div", { class: "nav-group" }, group)); }
    nav.append(h("button", { class: "nav-item", "data-page": p.id, onclick: () => go(p.id) },
      icon(p.icon), p.label, p.id === "inbox" ? h("span", { class: "badge", id: "unread-badge", hidden: !state.unread }, state.unread) : null));
  });
  const side = h("aside", { class: "side" },
    h("a", { class: "side-brand", href: "#dashboard" }, h("img", { src: "../images/logo-mark-white.png", alt: "" }),
      h("span", {}, h("strong", {}, "REM Admin"), h("small", {}, "Website manager"))),
    nav,
    h("div", { class: "side-foot" },
      h("a", { class: "nav-item", href: "../", target: "_blank", rel: "noopener" }, icon("external"), "View website"),
      h("button", { class: "nav-item", onclick: signOut }, icon("logout"), "Sign out")));

  const savebar = h("div", { class: "savebar", id: "savebar", role: "region", "aria-label": "Unsaved changes" },
    h("div", { class: "save-msg" }, h("strong", {}, "Unsaved changes. "), "Publish to put them live on the website."),
    h("button", { class: "btn btn-ghost", onclick: discard }, "Discard"),
    h("button", { class: "btn btn-gold", id: "publish-btn", onclick: publish }, "Publish changes"));

  $("#root").replaceChildren(h("div", { class: "app" },
    side,
    h("div", { class: "side-backdrop", onclick: () => document.body.classList.remove("nav-open") }),
    h("div", { class: "main" },
      h("header", { class: "topbar" },
        h("button", { class: "btn-icon menu-btn", "aria-label": "Menu", onclick: () => document.body.classList.toggle("nav-open") }, icon("menu")),
        h("div", {}, h("h2", { id: "page-title" }, ""), h("div", { class: "sub", id: "page-sub" }, "")),
        h("div", { class: "spacer" }),
        h("span", { class: "status-pill", id: "status-pill" }, "All changes live")),
      h("main", { class: "content", id: "content" }))),
    savebar);
  updateDirty();
}

function go(id) {
  const page = pageById(id);
  state.page = page.id;
  if (location.hash.slice(1) !== page.id) history.replaceState(null, "", `#${page.id}`);
  document.body.classList.remove("nav-open");
  document.querySelectorAll(".nav-item[data-page]").forEach((b) => b.classList.toggle("active", b.dataset.page === page.id));
  $("#page-title").textContent = page.label;
  $("#page-sub").textContent = page.fields ? "Edit, then press Publish" : "";
  const content = $("#content");
  content.replaceChildren(h("div", { class: "loading" }, h("div", { class: "spinner" })));
  window.scrollTo(0, 0);
  const view = { dashboard: viewDashboard, inbox: viewInbox, media: viewMedia, settings: viewSettings }[page.id];
  Promise.resolve(view ? view() : viewEditor(page))
    .then((el) => { if (state.page === page.id) content.replaceChildren(el); })
    .catch((e) => { if (!e.silent) content.replaceChildren(h("div", { class: "card" }, h("p", {}, e.message))); });
}
window.addEventListener("hashchange", () => { if (state.me && location.hash.slice(1) !== state.page) go(location.hash.slice(1)); });

async function signOut() {
  if (isDirty() && !(await confirmBox("Sign out without publishing?", "Your unpublished changes will be lost.", "Sign out"))) return;
  await api("login", { method: "DELETE" }).catch(() => {});
  state.me = null;
  renderLogin("You are signed out.");
}

/* ---------------- dirty state / publish ---------------- */
const isDirty = () => state.draft && JSON.stringify(state.draft) !== JSON.stringify(state.published);
let dirtyTimer;
function updateDirty() {
  clearTimeout(dirtyTimer);
  dirtyTimer = setTimeout(() => {
    const d = isDirty();
    $("#savebar")?.classList.toggle("show", d);
    const pill = $("#status-pill");
    if (pill) { pill.classList.toggle("dirty", d); pill.textContent = d ? "Unsaved changes" : "All changes live"; }
  }, 120);
}
window.addEventListener("beforeunload", (e) => { if (isDirty()) { e.preventDefault(); e.returnValue = ""; } });

async function publish() {
  const btn = $("#publish-btn");
  btn.disabled = true; btn.textContent = "Publishing…";
  try {
    const r = await api("content", { method: "PUT", body: { content: state.draft, baseUpdatedAt: state.updatedAt } });
    state.updatedAt = r.updatedAt;
    state.published = clone(state.draft);
    updateDirty();
    toast("Published — your changes are live on the website.");
  } catch (e) {
    if (e.status === 409) {
      const reload = await modal({ title: "The website was changed elsewhere", text: e.message,
        actions: [{ label: "Keep editing", value: false }, { label: "Load latest (lose my changes)", value: true, class: "btn-danger" }] });
      if (reload) { await loadContent(); go(state.page); updateDirty(); }
    } else if (!e.silent) toast(e.message, "err");
  } finally {
    btn.disabled = false; btn.textContent = "Publish changes";
  }
}
async function discard() {
  if (!(await confirmBox("Discard your changes?", "Everything you changed since the last publish will be undone.", "Discard"))) return;
  state.draft = clone(state.published);
  updateDirty();
  go(state.page);
}

/* =========================================================
   FORM BUILDER
   ========================================================= */
function renderFields(defs, target) {
  return defs.map((def) => renderField(def, target));
}

function renderField(def, target) {
  if (def.type === "group") {
    return h("div", { class: "group" }, h("p", { class: "group-title" }, def.title), h("div", { class: "fields" }, renderFields(def.fields, target)));
  }
  const id = `f${Math.random().toString(36).slice(2, 9)}`;
  const get = () => getPath(target, def.key);
  const set = (v) => { setPath(target, def.key, v); updateDirty(); };
  const label = h("label", { for: id }, def.label);
  const help = def.help ? h("div", { class: "help" }, def.help) : null;
  const wrap = (control, cls = "") => h("div", { class: `field ${cls}` }, label, control, help);

  switch (def.type) {
    case "text": case "url": case "email": case "tel": case "date": case "time":
      return wrap(h("input", { id, type: def.type, value: get() ?? "", placeholder: def.placeholder || "", oninput: (e) => set(e.target.value) }));
    case "number":
      return wrap(h("input", { id, type: "number", value: get() ?? "", oninput: (e) => set(e.target.value === "" ? "" : Number(e.target.value)) }));
    case "textarea":
      return wrap(h("textarea", { id, rows: def.rows || 4, value: get() ?? "", oninput: (e) => set(e.target.value) }));
    case "youtube":
      return wrap(h("input", { id, type: "text", value: get() ?? "", placeholder: "https://youtu.be/…", onchange: (e) => { const v = ytId(e.target.value); e.target.value = v; set(v); } }),
        "");
    case "select": {
      const cur = get();
      const sel = h("select", { id, onchange: (e) => set(def.number ? Number(e.target.value) : e.target.value) },
        def.options.map(([v, l]) => h("option", { value: v, selected: String(cur) === String(v) }, l)));
      return wrap(sel);
    }
    case "toggle": {
      const val = get();
      const input = h("input", { id, type: "checkbox", checked: val === undefined ? def.default !== false : !!val, onchange: (e) => set(e.target.checked) });
      return h("div", { class: "field full" }, h("label", { class: "toggle", for: id }, input, def.label), help);
    }
    case "position": {
      const cur = get() || "50% 30%";
      const known = PHOTO_POS.some(([v]) => v === cur);
      return wrap(h("select", { id, onchange: (e) => set(e.target.value) },
        PHOTO_POS.map(([v, l]) => h("option", { value: v, selected: v === cur }, l)),
        !known ? h("option", { value: cur, selected: true }, `Custom (${cur})`) : null));
    }
    case "image": case "media":
      return mediaField(def, id, get, set, label, help);
    case "photo": {
      // stored as { src, position } (older content may be a plain string)
      let v = get();
      if (typeof v === "string") { v = { src: v, position: "50% 30%" }; setPath(target, def.key, v); }
      if (!v) { v = { src: "", position: "50% 30%" }; }
      const holder = { v };
      const commit = () => { setPath(target, def.key, holder.v); updateDirty(); };
      return h("div", { class: "field full" },
        h("div", { class: "fields two" },
          mediaField({ ...def, type: "image" }, id, () => holder.v.src, (s) => { holder.v = { ...holder.v, src: s }; commit(); }, h("label", { for: id }, def.label), null),
          renderField({ key: "position", type: "position", label: "Keep in view when cropped" }, new Proxy({}, {
            get: (_, k) => (k === "position" ? holder.v.position : undefined),
            set: (_, k, val) => { holder.v = { ...holder.v, position: val }; commit(); return true; },
          }))),
        help);
    }
    case "list":
      return listField(def, target);
    case "strings":
      return stringsField(def, target);
    default:
      return wrap(h("input", { id, type: "text", value: get() ?? "", oninput: (e) => set(e.target.value) }));
  }
}

/* image / audio / video / pdf field with upload + library */
function mediaField(def, id, get, set, label, help) {
  const kind = def.type === "image" ? "image" : def.accept || "file";
  const thumb = h("div", { class: `thumb${def.dark ? " dark" : ""}` });
  const preview = h("div", { class: "media-preview" });
  const input = h("input", { id, type: "url", value: get() || "", placeholder: "Upload, choose from the library, or paste a link", oninput: (e) => { set(e.target.value.trim()); paint(); } });
  const bar = h("div", { class: "progress", hidden: true }, h("div"));
  function paint() {
    const url = get() || "";
    thumb.replaceChildren();
    thumb.style.backgroundImage = "";
    preview.replaceChildren();
    if (!url) { thumb.append(icon(kind === "pdf" ? "doc" : kind === "audio" ? "audio" : kind === "video" ? "video" : "image")); return; }
    const k = kindOf(url) === "file" ? kind : kindOf(url);
    const full = siteUrl(url);
    if (k === "image") thumb.style.backgroundImage = `url("${full.replace(/"/g, "%22")}")`;
    else thumb.append(icon(k === "pdf" ? "doc" : k === "audio" ? "audio" : "video"));
    if (k === "audio") preview.append(h("audio", { controls: true, preload: "none", src: full }));
    if (k === "video") preview.append(h("video", { controls: true, preload: "metadata", src: full }));
    if (k === "pdf") preview.append(h("a", { href: full, target: "_blank", rel: "noopener", class: "btn btn-ghost btn-sm" }, icon("doc"), `Open ${fileNameOf(url)}`));
  }
  const fileInput = h("input", { type: "file", hidden: true, accept: ACCEPT[kind] || "", onchange: async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    bar.hidden = false;
    try {
      const url = await uploadFile(file, (p) => { bar.firstChild.style.width = `${p}%`; });
      set(url); input.value = url; paint();
      toast(`Uploaded ${file.name}`);
    } catch (ex) { if (!ex.silent) toast(ex.message, "err"); }
    finally { bar.hidden = true; bar.firstChild.style.width = "0"; }
  } });
  paint();
  return h("div", { class: "field full" },
    label,
    h("div", { class: "media-field" },
      thumb,
      h("div", { class: "media-controls" },
        input,
        h("div", { class: "row" },
          h("button", { type: "button", class: "btn btn-primary btn-sm", onclick: () => fileInput.click() }, icon("upload"), "Upload"),
          h("button", { type: "button", class: "btn btn-ghost btn-sm", onclick: async () => { const url = await pickFromLibrary(kind); if (url) { set(url); input.value = url; paint(); } } }, icon("image"), "Library"),
          get() !== undefined ? h("button", { type: "button", class: "btn btn-ghost btn-sm", onclick: () => { set(""); input.value = ""; paint(); } }, "Remove") : null),
        bar, preview, fileInput)),
    help);
}
const ACCEPT = { image: "image/*", audio: "audio/*", video: "video/*", pdf: "application/pdf" };

/* repeatable items */
function listField(def, target) {
  let arr = getPath(target, def.key);
  if (!Array.isArray(arr)) { arr = []; setPath(target, def.key, arr); }
  if (def.normalize) arr.forEach((it, i) => { arr[i] = def.normalize(it); });
  const open = new Set();
  const listEl = h("div", { class: "list" });
  const count = h("span", { class: "help" });
  const draw = () => {
    count.textContent = ` · ${arr.length} item${arr.length === 1 ? "" : "s"}`;
    listEl.replaceChildren();
    if (!arr.length) listEl.append(h("div", { class: "list-empty" }, "Nothing here yet."));
    arr.forEach((item, i) => {
      const title = (def.summary && def.summary(item)) || `Item ${i + 1}`;
      const card = h("div", { class: `item${open.has(item) ? "" : " collapsed"}` });
      const toggle = () => { open.has(item) ? open.delete(item) : open.add(item); card.classList.toggle("collapsed"); };
      const tool = (name, label, fn, disabled) => h("button", { type: "button", class: "btn-icon", "aria-label": label, title: label, disabled, onclick: (e) => { e.stopPropagation(); fn(); } }, icon(name));
      card.append(
        h("div", { class: "item-head", onclick: toggle },
          h("span", { class: "num" }, i + 1),
          h("span", { class: "title" }, title),
          h("span", { class: "item-tools" },
            tool("up", "Move up", () => { [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; updateDirty(); draw(); }, i === 0),
            tool("down", "Move down", () => { [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]; updateDirty(); draw(); }, i === arr.length - 1),
            tool("trash", "Delete", async () => {
              if (!(await confirmBox("Delete this item?", `“${title}” will be removed when you publish.`))) return;
              arr.splice(i, 1); updateDirty(); draw();
            })),
          icon("chev")),
        h("div", { class: "item-body" }, h("div", { class: "fields" }, renderFields(def.item, item))));
      card.querySelector(".item-head > svg").classList.add("chev");
      // keep the summary up to date while typing
      card.querySelector(".item-body").addEventListener("input", () => { card.querySelector(".title").textContent = (def.summary && def.summary(item)) || `Item ${i + 1}`; });
      listEl.append(card);
    });
  };
  draw();
  const add = () => {
    const item = def.newItem ? def.newItem() : {};
    def.addTop ? arr.unshift(item) : arr.push(item);
    open.add(item);
    updateDirty(); draw();
  };
  return h("div", { class: "field full" },
    h("div", { class: "label" }, def.label, count),
    def.help ? h("div", { class: "help" }, def.help) : null,
    listEl,
    h("div", { class: "add-row" }, h("button", { type: "button", class: "btn btn-ghost", onclick: add }, icon("plus"), def.addLabel || "Add")));
}

/* list of paragraphs */
function stringsField(def, target) {
  let arr = getPath(target, def.key);
  if (!Array.isArray(arr)) { arr = []; setPath(target, def.key, arr); }
  const listEl = h("div", { class: "list" });
  const draw = () => {
    listEl.replaceChildren();
    arr.forEach((text, i) => {
      listEl.append(h("div", { class: "item" },
        h("div", { class: "item-head" }, h("span", { class: "num" }, i + 1), h("span", { class: "title" }, `Paragraph ${i + 1}`),
          h("span", { class: "item-tools" },
            h("button", { type: "button", class: "btn-icon", "aria-label": "Move up", disabled: i === 0, onclick: () => { [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; updateDirty(); draw(); } }, icon("up")),
            h("button", { type: "button", class: "btn-icon", "aria-label": "Move down", disabled: i === arr.length - 1, onclick: () => { [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]; updateDirty(); draw(); } }, icon("down")),
            h("button", { type: "button", class: "btn-icon", "aria-label": "Delete", onclick: async () => { if (await confirmBox("Delete this paragraph?", "It will be removed when you publish.")) { arr.splice(i, 1); updateDirty(); draw(); } } }, icon("trash")))),
        h("div", { class: "item-body" }, h("div", { class: "field" }, h("textarea", { rows: 4, value: text, "aria-label": `Paragraph ${i + 1}`, oninput: (e) => { arr[i] = e.target.value; updateDirty(); } })))));
    });
  };
  draw();
  return h("div", { class: "field full" }, h("div", { class: "label" }, def.label), listEl,
    h("div", { class: "add-row" }, h("button", { type: "button", class: "btn btn-ghost", onclick: () => { arr.push(""); updateDirty(); draw(); } }, icon("plus"), def.addLabel || "Add")));
}

function viewEditor(page) {
  return h("div", {},
    page.intro ? h("p", { class: "page-intro" }, page.intro) : null,
    h("div", { class: "card" }, h("div", { class: "fields" }, renderFields(page.fields, state.draft))),
    h("p", { class: "page-intro" }, "Changes are saved as a draft while you work. Press ", h("strong", {}, "Publish changes"), " to put them live."));
}

/* =========================================================
   UPLOADS & MEDIA LIBRARY
   ========================================================= */
function cleanName(name) {
  const dot = name.lastIndexOf(".");
  const ext = dot > 0 ? name.slice(dot).toLowerCase().replace(/[^.a-z0-9]/g, "") : "";
  const base = (dot > 0 ? name.slice(0, dot) : name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "file";
  return base + ext;
}
const folderFor = (type) => (type.startsWith("image/") ? "images" : type.startsWith("audio/") ? "audio" : type.startsWith("video/") ? "video" : type === "application/pdf" ? "documents" : "files");

async function uploadFile(file, onProgress = () => {}) {
  const mode = state.me?.mediaMode;
  if (file.size > 500 * 1024 * 1024) throw new Error("That file is larger than 500 MB. Please compress it first.");
  if (mode === "blob") {
    const { upload } = await import(BLOB_CLIENT);
    const res = await upload(`${folderFor(file.type)}/${cleanName(file.name)}`, file, {
      access: "public",
      handleUploadUrl: API("upload"),
      headers: { "X-Requested-With": "rem-admin" },
      multipart: file.size > 20 * 1024 * 1024,
      onUploadProgress: ({ percentage }) => onProgress(percentage),
    });
    return res.url;
  }
  if (mode === "local") {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API("upload")}?name=${encodeURIComponent(file.name)}`);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
      xhr.setRequestHeader("X-Requested-With", "rem-admin");
      xhr.upload.onprogress = (e) => e.lengthComputable && onProgress((e.loaded / e.total) * 100);
      xhr.onload = () => {
        let d = {};
        try { d = JSON.parse(xhr.responseText); } catch { /* ignore */ }
        xhr.status < 300 ? resolve(d.url) : reject(new Error(d.error || "Upload failed"));
      };
      xhr.onerror = () => reject(new Error("Upload failed. Check your internet connection."));
      xhr.send(file);
    });
  }
  throw new Error("File storage isn't connected yet. In Vercel, add Blob storage (see the setup guide).");
}

async function fetchMedia() {
  return (await api("media")).files;
}

function mediaCard(f, { pick, onDelete } = {}) {
  const k = kindOf(f.url);
  const prev = h("div", { class: "prev" });
  if (k === "image") prev.style.backgroundImage = `url("${f.url.replace(/"/g, "%22")}")`;
  else prev.append(icon(k === "pdf" ? "doc" : k === "audio" ? "audio" : k === "video" ? "video" : "doc"));
  return h("div", { class: `mfile${pick ? " pickable" : ""}`, onclick: pick ? () => pick(f.url) : null, title: f.pathname },
    prev,
    h("div", { class: "info" }, h("div", { class: "n" }, fileNameOf(f.pathname)), h("div", { class: "s" }, `${fmtSize(f.size)} · ${fmtWhen(f.uploadedAt)}`)),
    pick ? null : h("div", { class: "acts" },
      h("button", { class: "btn btn-ghost btn-sm", onclick: () => { navigator.clipboard?.writeText(f.url); toast("Link copied"); } }, icon("copy"), "Copy link"),
      h("a", { class: "btn btn-ghost btn-sm", href: f.url, target: "_blank", rel: "noopener", "aria-label": "Open" }, icon("external")),
      h("button", { class: "btn btn-danger btn-sm", "aria-label": "Delete", onclick: () => onDelete(f) }, icon("trash"))));
}

async function pickFromLibrary(kind) {
  const grid = h("div", { class: "media-grid" }, h("div", { class: "loading" }, h("div", { class: "spinner" })));
  const p = modal({ title: "Choose from the media library", body: grid, wide: true, actions: [{ label: "Cancel", value: null }] });
  try {
    const files = (await fetchMedia()).filter((f) => kind === "file" || kindOf(f.url) === kind);
    grid.replaceChildren(...(files.length ? files.map((f) => mediaCard(f, { pick: (url) => modal.current.close(url) })) : [h("div", { class: "empty" }, "No files of this type yet. Use Upload instead.")]));
  } catch (e) { grid.replaceChildren(h("div", { class: "empty" }, e.message)); }
  return p;
}

async function viewMedia() {
  const filterTabs = [["all", "All"], ["image", "Images"], ["audio", "Audio"], ["video", "Video"], ["pdf", "PDFs"]];
  let filter = "all", files = [];
  const grid = h("div", { class: "media-grid" });
  const tabs = h("div", { class: "tabs" });
  const usedIn = (url) => JSON.stringify(state.draft).includes(url);
  const draw = () => {
    tabs.replaceChildren(...filterTabs.map(([v, l]) => h("button", { class: `tab${filter === v ? " on" : ""}`, onclick: () => { filter = v; draw(); } }, l,
      h("span", { class: "c" }, v === "all" ? files.length : files.filter((f) => kindOf(f.url) === v).length))));
    const list = files.filter((f) => filter === "all" || kindOf(f.url) === filter);
    grid.replaceChildren(...(list.length ? list.map((f) => mediaCard(f, { onDelete: remove })) : [h("div", { class: "empty" }, "No files yet. Upload photos, audio, video or PDFs above.")]));
  };
  async function remove(f) {
    const inUse = usedIn(f.url);
    if (!(await confirmBox("Delete this file for good?", inUse ? "This file is still used on the website. It will stop showing there." : "It will be removed from storage. This can't be undone."))) return;
    try { await api(`media?url=${encodeURIComponent(f.url)}`, { method: "DELETE" }); files = files.filter((x) => x !== f); draw(); toast("File deleted"); }
    catch (e) { if (!e.silent) toast(e.message, "err"); }
  }
  const uploads = h("div", { class: "uploads" });
  const input = h("input", { type: "file", multiple: true, hidden: true, accept: "image/*,audio/*,video/*,application/pdf", onchange: (e) => { handle([...e.target.files]); e.target.value = ""; } });
  async function handle(list) {
    for (const file of list) {
      const bar = h("div", { class: "progress" }, h("div"));
      const status = h("span", {}, "0%");
      const row = h("div", { class: "upl" }, h("span", {}, file.name), status, bar);
      uploads.append(row);
      try {
        await uploadFile(file, (p) => { bar.firstChild.style.width = `${p}%`; status.textContent = `${Math.round(p)}%`; });
        status.textContent = "Done";
        bar.firstChild.style.width = "100%";
      } catch (ex) { status.textContent = "Failed"; if (!ex.silent) toast(`${file.name}: ${ex.message}`, "err"); }
    }
    files = await fetchMedia(); draw();
    setTimeout(() => uploads.replaceChildren(), 2500);
  }
  const drop = h("div", { class: "dropzone",
    ondragover: (e) => { e.preventDefault(); drop.classList.add("over"); },
    ondragleave: () => drop.classList.remove("over"),
    ondrop: (e) => { e.preventDefault(); drop.classList.remove("over"); handle([...e.dataTransfer.files]); } },
    h("p", {}, "Drag files here, or"),
    h("button", { class: "btn btn-primary", onclick: () => input.click() }, icon("upload"), "Choose files to upload"),
    h("p", { class: "help", style: { marginTop: ".6rem" } }, "Photos, audio (MP3), video (MP4) and PDF books · up to 500 MB each"),
    input, uploads);
  try { files = await fetchMedia(); } catch (e) { if (!e.silent) toast(e.message, "err"); }
  draw();
  return h("div", {},
    h("p", { class: "page-intro" }, "Everything you upload is stored here. You can also upload straight from any photo, audio, video or PDF field while editing."),
    state.me?.mediaMode === "none" ? h("div", { class: "card" }, h("p", {}, "File storage isn't connected yet. Follow the setup guide to add Vercel Blob storage.")) : null,
    h("div", { class: "card" }, drop),
    tabs, grid);
}

/* =========================================================
   DASHBOARD
   ========================================================= */
const SECTION_NAMES = { home: "Top of page", about: "About", resources: "Resources", "new-release": "New book", ebooks: "eBooks", partner: "Partner & give", live: "Watch live", videos: "Videos", podcast: "Podcast", music: "Music", events: "Events", testimonies: "Testimonies", invite: "Invite", contact: "Contact", newsletter: "Newsletter" };

async function viewDashboard() {
  const s = await api(`stats?days=${state.statsDays}`);
  state.unread = s.totals.unread;
  const badge = $("#unread-badge");
  if (badge) { badge.textContent = s.totals.unread; badge.hidden = !s.totals.unread; }

  const range = h("div", { class: "range" }, [7, 30, 90].map((d) => h("button", { class: state.statsDays === d ? "on" : "", onclick: () => { state.statsDays = d; go("dashboard"); } }, `${d} days`)));
  const kpi = (label, value, ic, note, accent) => h("div", { class: `kpi${accent ? " accent" : ""}` },
    h("div", { class: "k-label" }, icon(ic), label), h("div", { class: "k-value" }, Number(value).toLocaleString()), note ? h("div", { class: "k-note" }, note) : null);
  const t = s.totals;
  const kpis = h("div", { class: "kpis" },
    kpi("Visitors", t.visitors, "users", `last ${s.days} days`, true),
    kpi("Page views", t.views, "eye", `${t.visitors ? (t.views / t.visitors).toFixed(1) : 0} per visitor`),
    kpi("New messages", t.unread, "inbox", "waiting in your inbox"),
    kpi("Downloads", t.downloads, "download", "eBooks"),
    kpi("Plays", t.plays, "play", "audio & video"),
    kpi("App installs", t.installs, "app", "added to home screen"));

  const bars = (rows, nameMap = {}) => {
    if (!rows.length) return h("div", { class: "empty" }, "No data yet");
    const max = Math.max(...rows.map((r) => r.count), 1);
    return h("div", { class: "bars" }, rows.map((r) => h("div", { class: "bar-row" },
      h("span", { class: "name" }, nameMap[r.name] || r.name), h("span", { class: "num" }, r.count.toLocaleString()),
      h("div", { class: "track" }, h("div", { class: "fill", style: { width: `${(r.count / max) * 100}%` } })))));
  };

  const noData = !t.views && !t.forms;
  return h("div", {},
    h("div", { class: "card-head" }, h("p", { class: "page-intro", style: { margin: 0 } }, "How the website is doing. Statistics are anonymous."), range),
    kpis,
    noData ? h("div", { class: "card" }, h("p", { class: "empty" }, "No visits recorded yet in this period. Numbers appear as soon as people visit the live website.")) : null,
    h("div", { class: "grid-2" },
      h("div", { class: "card" },
        h("div", { class: "card-head" }, h("div", {}, h("h3", {}, "Visitors & page views")),
          h("div", { class: "legend" }, h("span", { style: { "--c": "var(--gold)" } }, "Visitors"), h("span", { style: { "--c": "var(--ink)" } }, "Page views"))),
        lineChart(s.daily)),
      h("div", { class: "card" }, h("div", { class: "card-head" }, h("h3", {}, "Devices")), devicesChart(s.devices))),
    h("div", { class: "grid-3" },
      h("div", { class: "card" }, h("div", { class: "card-head" }, h("div", {}, h("h3", {}, "Most viewed sections"), h("p", {}, "What visitors scroll to"))), bars(s.sections, SECTION_NAMES)),
      h("div", { class: "card" }, h("div", { class: "card-head" }, h("div", {}, h("h3", {}, "Top downloads & plays"), h("p", {}, "All time"))), bars([...s.topDownloads, ...s.topPlays].sort((a, b) => b.count - a.count).slice(0, 8))),
      h("div", { class: "card" }, h("div", { class: "card-head" }, h("div", {}, h("h3", {}, "Where visitors come from"), h("p", {}, "Direct = typed the address or opened the app"))), bars(s.referrers))),
    h("div", { class: "card" }, h("div", { class: "card-head" }, h("h3", {}, "Quick actions")),
      h("div", { class: "quick" },
        h("button", { class: "btn btn-primary", onclick: () => go("events") }, icon("calendar"), "Add an event"),
        h("button", { class: "btn btn-ghost", onclick: () => go("live") }, icon("video"), "Add a video"),
        h("button", { class: "btn btn-ghost", onclick: () => go("podcast") }, icon("mic"), "Add a podcast episode"),
        h("button", { class: "btn btn-ghost", onclick: () => go("media") }, icon("upload"), "Upload files"),
        h("button", { class: "btn btn-ghost", onclick: () => go("inbox") }, icon("inbox"), `Read messages${t.unread ? ` (${t.unread})` : ""}`))));
}

function lineChart(daily) {
  const W = 640, H = 240, L = 34, B = 26, T = 10, R = 8;
  const max = Math.max(4, ...daily.map((d) => Math.max(d.views, d.visitors)));
  const nice = Math.ceil(max / 4) * 4;
  const x = (i) => L + (daily.length === 1 ? (W - L - R) / 2 : (i * (W - L - R)) / (daily.length - 1));
  const y = (v) => T + (H - T - B) * (1 - v / nice);
  const ns = "http://www.w3.org/2000/svg";
  const el = (tag, attrs) => { const e = document.createElementNS(ns, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); return e; };
  const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Visitors and page views per day" });
  const grid = el("g", { class: "grid" }), axis = el("g", { class: "axis" });
  for (let i = 0; i <= 4; i++) {
    const v = (nice / 4) * i;
    grid.append(el("line", { x1: L, x2: W - R, y1: y(v), y2: y(v) }));
    const t = el("text", { x: L - 6, y: y(v) + 4, "text-anchor": "end" }); t.textContent = v; axis.append(t);
  }
  const step = Math.ceil(daily.length / 6);
  daily.forEach((d, i) => {
    if (i % step && i !== daily.length - 1) return;
    const t = el("text", { x: x(i), y: H - 6, "text-anchor": "middle" });
    t.textContent = new Date(d.date + "T12:00:00").toLocaleDateString(undefined, { day: "numeric", month: "short" });
    axis.append(t);
  });
  const pts = (k) => daily.map((d, i) => `${x(i)},${y(d[k])}`).join(" ");
  const area = el("polygon", { points: `${x(0)},${y(0)} ${pts("visitors")} ${x(daily.length - 1)},${y(0)}`, fill: "rgba(201,162,74,.18)" });
  const vis = el("polyline", { points: pts("visitors"), fill: "none", stroke: "var(--gold)", "stroke-width": 2.5, "stroke-linejoin": "round" });
  const views = el("polyline", { points: pts("views"), fill: "none", stroke: "var(--ink)", "stroke-width": 2, "stroke-linejoin": "round", "stroke-dasharray": "0" });
  const guide = el("line", { y1: T, y2: H - B, stroke: "var(--line-2)", "stroke-width": 1, visibility: "hidden" });
  const dotV = el("circle", { r: 4, fill: "var(--gold)", visibility: "hidden" });
  const dotP = el("circle", { r: 4, fill: "var(--ink)", visibility: "hidden" });
  svg.append(grid, axis, area, vis, views, guide, dotV, dotP);
  const tip = h("div", { class: "tip", hidden: true });
  const wrap = h("div", { class: "chart" }, svg, tip);
  const hit = el("rect", { x: L, y: T, width: W - L - R, height: H - T - B, fill: "transparent" });
  svg.append(hit);
  const show = (evt) => {
    const box = svg.getBoundingClientRect();
    const px = ((evt.clientX - box.left) / box.width) * W;
    const i = Math.max(0, Math.min(daily.length - 1, Math.round(((px - L) / (W - L - R)) * (daily.length - 1))));
    const d = daily[i];
    [guide, dotV, dotP].forEach((n) => n.setAttribute("visibility", "visible"));
    guide.setAttribute("x1", x(i)); guide.setAttribute("x2", x(i));
    dotV.setAttribute("cx", x(i)); dotV.setAttribute("cy", y(d.visitors));
    dotP.setAttribute("cx", x(i)); dotP.setAttribute("cy", y(d.views));
    tip.hidden = false;
    tip.textContent = `${new Date(d.date + "T12:00:00").toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })} · ${d.visitors} visitors · ${d.views} views`;
    tip.style.left = `${(x(i) / W) * 100}%`;
    tip.style.top = `${(Math.min(y(d.visitors), y(d.views)) / H) * 100}%`;
  };
  hit.addEventListener("pointermove", show);
  hit.addEventListener("pointerleave", () => { tip.hidden = true; [guide, dotV, dotP].forEach((n) => n.setAttribute("visibility", "hidden")); });
  return wrap;
}

function devicesChart(devices) {
  const items = [["mobile", "Phone browser", "var(--gold)"], ["app", "Installed app", "var(--gold-deep)"], ["desktop", "Computer", "var(--ink)"]];
  const total = items.reduce((n, [k]) => n + (+devices[k] || 0), 0);
  if (!total) return h("div", { class: "empty" }, "No data yet");
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 42 42");
  const C = 2 * Math.PI * 15.9;
  let offset = 25;
  items.forEach(([k, , color]) => {
    const v = +devices[k] || 0;
    if (!v) return;
    const c = document.createElementNS(ns, "circle");
    Object.entries({ cx: 21, cy: 21, r: 15.9, fill: "none", stroke: color, "stroke-width": 6, "stroke-dasharray": `${(v / total) * C} ${C}`, "stroke-dashoffset": (offset / 100) * C, transform: "rotate(-90 21 21)" })
      .forEach(([a, b]) => c.setAttribute(a, b));
    svg.append(c);
    offset -= (v / total) * 100;
  });
  return h("div", { class: "devices" }, svg,
    h("div", { class: "bars", style: { flex: 1 } }, items.map(([k, label, color]) => h("div", { class: "legend" },
      h("span", { style: { "--c": color } }, `${label}: ${Math.round(((+devices[k] || 0) / total) * 100)}%`)))));
}

/* =========================================================
   INBOX
   ========================================================= */
const KIND = (subject = "") => /prayer/i.test(subject) ? "prayer" : /testimon/i.test(subject) ? "testimony" : /newsletter/i.test(subject) ? "news" : "";

async function viewInbox() {
  let messages = (await api("messages")).messages;
  let filter = "all";
  const openIds = new Set();
  const tabsEl = h("div", { class: "tabs" });
  const listEl = h("div", { class: "msg-list" });
  const FILTERS = [
    ["all", "All", () => true], ["unread", "Unread", (m) => !m.read],
    ["prayer", "Prayer", (m) => KIND(m.subject) === "prayer"], ["testimony", "Testimonies", (m) => KIND(m.subject) === "testimony"],
    ["invite", "Invitations", (m) => /invitation/i.test(m.subject)], ["news", "Newsletter sign-ups", (m) => KIND(m.subject) === "news"],
  ];
  const setBadge = () => {
    state.unread = messages.filter((m) => !m.read).length;
    const b = $("#unread-badge"); if (b) { b.textContent = state.unread; b.hidden = !state.unread; }
  };
  async function setRead(m, read) {
    try { await api("messages", { method: "PATCH", body: { id: m.id, read } }); m.read = read; setBadge(); draw(); }
    catch (e) { if (!e.silent) toast(e.message, "err"); }
  }
  const draw = () => {
    tabsEl.replaceChildren(...FILTERS.map(([v, l, fn]) => h("button", { class: `tab${filter === v ? " on" : ""}`, onclick: () => { filter = v; draw(); } }, l, h("span", { class: "c" }, messages.filter(fn).length))));
    const fn = FILTERS.find((f) => f[0] === filter)[2];
    const list = messages.filter(fn);
    listEl.replaceChildren(...(list.length ? list.map((m) => {
      const isOpen = openIds.has(m.id);
      const kind = KIND(m.subject);
      return h("div", { class: `msg${m.read ? "" : " unread"}`, onclick: (e) => {
          if (e.target.closest("button, a")) return;
          isOpen ? openIds.delete(m.id) : openIds.add(m.id);
          if (!isOpen && !m.read) setRead(m, true); else draw();
        } },
        h("div", { class: "msg-top" },
          h("span", { class: `chip ${kind}` }, m.subject),
          h("span", { class: "who" }, m.name || m.email || "Someone"),
          h("span", { class: "when" }, fmtWhen(m.at))),
        !isOpen ? h("div", { class: "msg-preview" }, m.message || m.email) : null,
        isOpen ? h("div", { class: "msg-full" },
          h("div", { class: "meta" }, [m.name, m.email].filter(Boolean).join(" · "), " · ", new Date(m.at).toLocaleString()),
          m.message ? h("p", { class: "body" }, m.message) : null,
          h("div", { class: "quick" },
            m.email ? h("a", { class: "btn btn-primary btn-sm", href: `mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}` }, icon("mail"), "Reply by email") : null,
            kind === "testimony" && m.message ? h("button", { class: "btn btn-gold btn-sm", onclick: () => {
              state.draft.testimonies = state.draft.testimonies || [];
              state.draft.testimonies.unshift({ text: m.message, name: m.name || "", place: "" });
              updateDirty(); go("testimonies");
              toast("Added to testimonies. Check it, then press Publish.");
            } }, icon("quote"), "Add to testimonies") : null,
            h("button", { class: "btn btn-ghost btn-sm", onclick: () => setRead(m, !m.read) }, m.read ? "Mark unread" : "Mark read"),
            h("button", { class: "btn btn-danger btn-sm", onclick: async () => {
              if (!(await confirmBox("Delete this message?", "This can't be undone."))) return;
              try { await api(`messages?id=${encodeURIComponent(m.id)}`, { method: "DELETE" }); messages = messages.filter((x) => x !== m); setBadge(); draw(); toast("Message deleted"); }
              catch (ex) { if (!ex.silent) toast(ex.message, "err"); }
            } }, icon("trash"), "Delete"))) : null);
    }) : [h("div", { class: "card" }, h("p", { class: "empty" }, filter === "all" ? "No messages yet. Contact, prayer, testimony and newsletter forms from the website arrive here." : "Nothing here."))]));
  };
  const exportCsv = () => {
    const fn = FILTERS.find((f) => f[0] === filter)[2];
    const rows = [["Date", "Subject", "Name", "Email", "Message"], ...messages.filter(fn).map((m) => [m.at, m.subject, m.name, m.email, m.message])];
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const a = h("a", { href: URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv" })), download: `rem-messages-${filter}.csv` });
    a.click();
  };
  setBadge();
  draw();
  return h("div", {},
    h("div", { class: "card-head" },
      h("p", { class: "page-intro", style: { margin: 0 } }, "Messages sent from the website's forms. Prayer requests are private — only visible here."),
      h("button", { class: "btn btn-ghost btn-sm", onclick: exportCsv }, icon("download"), "Export (Excel/CSV)")),
    tabsEl, listEl);
}

/* =========================================================
   SETTINGS
   ========================================================= */
async function viewSettings() {
  const me = await api("login");
  state.me = { ...state.me, ...me };
  const row = (ok, cls, text) => h("div", { class: "setup-row" }, h("span", { class: `dot ${cls}` }), text);
  const store = me.storeMode === "redis" ? row(true, "", "Database connected (content, statistics, messages)")
    : me.storeMode === "local" ? row(true, "local", "Local test database (this computer only)") : row(false, "off", "Database not connected");
  const media = me.mediaMode === "blob" ? row(true, "", "File storage connected (uploads)")
    : me.mediaMode === "local" ? row(true, "local", "Local test file storage (this computer only)") : row(false, "off", "File storage not connected — uploads are off");
  const storageHelp = me.mediaMode === "none" ? h("div", { class: "help", style: { marginTop: ".8rem" } },
    "To fix: in Vercel open Storage → your Blob store → Connect to this project (tick Production), then Deployments → Redeploy. ",
    "Storage settings the server can see right now: ",
    h("strong", {}, (me.settingNames || []).join(", ") || "none")) : null;

  const cur = h("input", { type: "password", autocomplete: "current-password", id: "pw-cur" });
  const nxt = h("input", { type: "password", autocomplete: "new-password", id: "pw-new", minlength: 8 });
  const nxt2 = h("input", { type: "password", autocomplete: "new-password", id: "pw-new2" });
  const pwForm = h("form", { class: "fields two", onsubmit: async (e) => {
      e.preventDefault();
      if (nxt.value !== nxt2.value) return toast("The new passwords don't match.", "err");
      try { await api("password", { method: "POST", body: { current: cur.value, next: nxt.value } }); toast("Password changed. Other devices are signed out."); pwForm.reset(); }
      catch (ex) { if (!ex.silent) toast(ex.message, "err"); }
    } },
    h("div", { class: "field full" }, h("label", { for: "pw-cur" }, "Current password"), cur),
    h("div", { class: "field" }, h("label", { for: "pw-new" }, "New password (8+ characters)"), nxt),
    h("div", { class: "field" }, h("label", { for: "pw-new2" }, "Repeat new password"), nxt2),
    h("div", { class: "field full" }, h("div", {}, h("button", { class: "btn btn-primary", type: "submit" }, "Change password"))));

  const exportJson = () => {
    const a = h("a", { href: URL.createObjectURL(new Blob([JSON.stringify(state.draft, null, 2)], { type: "application/json" })), download: `rem-website-backup-${new Date().toISOString().slice(0, 10)}.json` });
    a.click();
  };
  const importInput = h("input", { type: "file", accept: "application/json,.json", hidden: true, onchange: async (e) => {
    const file = e.target.files[0]; e.target.value = "";
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!data || typeof data !== "object" || !data.ministryName) throw new Error("This doesn't look like a website backup file.");
      if (!(await confirmBox("Load this backup?", "It replaces everything in the editor. Nothing goes live until you press Publish.", "Load backup", "btn-primary"))) return;
      state.draft = { ...DEFAULTS(), ...data }; updateDirty(); toast("Backup loaded. Review it, then press Publish.");
    } catch (ex) { toast(ex.message, "err"); }
  } });

  return h("div", {},
    h("div", { class: "card" }, h("div", { class: "card-head" }, h("div", {}, h("h3", {}, "Setup status"), h("p", {}, "What's connected on the server"))), store, media, storageHelp),
    h("div", { class: "card" }, h("div", { class: "card-head" }, h("div", {}, h("h3", {}, "Change password"), h("p", {}, "Use a strong password only you know."))), pwForm),
    h("div", { class: "card" }, h("div", { class: "card-head" }, h("div", {}, h("h3", {}, "Undo & backups"), h("p", {}, "Go back to the version before your last publish, or keep a copy of everything."))),
      h("div", { class: "quick" },
        h("button", { class: "btn btn-ghost", onclick: async () => {
          if (!(await confirmBox("Undo the last publish?", "The website goes back to how it was before the last time you pressed Publish.", "Undo last publish", "btn-primary"))) return;
          try { const r = await api("content?restore=1", { method: "POST" }); state.updatedAt = r.updatedAt; await loadContent(); updateDirty(); toast("Restored the previous version. It's live now."); }
          catch (ex) { if (!ex.silent) toast(ex.message, "err"); }
        } }, "Undo last publish"),
        h("button", { class: "btn btn-ghost", onclick: exportJson }, icon("download"), "Download backup"),
        h("button", { class: "btn btn-ghost", onclick: () => importInput.click() }, icon("upload"), "Load a backup"),
        importInput)),
    h("div", { class: "card" }, h("div", { class: "card-head" }, h("h3", {}, "Account")),
      h("button", { class: "btn btn-danger", onclick: signOut }, icon("logout"), "Sign out")));
}

/* =========================================================
   BOOT
   ========================================================= */
(async function boot() {
  try {
    const me = await api("login");
    state.setup = me;
    if (me.signedIn) { state.me = me; await startApp(); }
    else renderLogin();
  } catch (e) {
    $("#root").replaceChildren(h("div", { class: "login" }, h("div", { class: "login-card" },
      h("div", { class: "login-brand" }, h("h1", {}, "REM Admin"), h("p", {}, "The admin can't reach the server. It only works on the live website (Vercel) or with the local test server.")))));
  }
})();
