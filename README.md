# Richard Engmann Ministries — Website

A clean, black-and-white website (with gold accents) for Richard Engmann's preaching ministry, with an installable phone app and an **admin dashboard** so the site can be managed without a developer.

**Website sections:** biography, resources, new book, free eBooks, partnership & giving, live YouTube, videos, the Faith Café Podcast, music, conferences & events, testimonies, invitations, contact and newsletter.

---

## Admin dashboard (`/admin`)

Sign in at **https://your-site/admin/** with the admin password.

| Area | What it does |
|---|---|
| **Dashboard** | Visitors, page views, most viewed sections, downloads, plays, app installs, devices, where visitors come from (anonymous statistics) |
| **Inbox** | Every contact, prayer request, testimony, speaking invitation and newsletter sign-up from the website. Reply by email, mark read, delete, export to Excel/CSV, or turn a testimony into a website testimony in one click |
| **Website pages** | Edit every section: Home & brand, About, Resources, Books & eBooks, Partner & give, Live & videos, Podcast, Music, Events & conferences, Testimonies, Contact & social. Add, edit, reorder and delete items; show/hide whole sections; change section titles |
| **Media library** | Upload photos, audio (MP3), video (MP4) and PDF books (up to 500 MB each), copy links, delete |
| **Settings** | Change password, undo the last publish, download/restore a full backup, see what's connected |

Changes are kept as a draft until **Publish changes** is pressed — then they're live immediately (no rebuild needed).

### One-time setup on Vercel (about 10 minutes)
The admin needs three things connected to the Vercel project. All have free plans.

1. **Database** (content, statistics, messages)
   Vercel → your project → **Storage** → **Create** → **Upstash for Redis** (from the Marketplace) → free plan → **Connect** to this project.
   This adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically.
2. **File storage** (uploads)
   Vercel → your project → **Storage** → **Create** → **Blob** → **Connect** to this project.
   This adds `BLOB_READ_WRITE_TOKEN` automatically.
3. **Admin password**
   Vercel → your project → **Settings** → **Environment Variables** → add `ADMIN_PASSWORD` with a strong password (all environments).
   *(Optional)* add `SESSION_SECRET` with any long random text.
4. **Redeploy** so the new settings take effect: Vercel → **Deployments** → latest → **⋯** → **Redeploy**.
5. Open **/admin/**, sign in, and change the password in **Settings** if you like.

Until step 1 is done the website keeps working normally from `site-data.js`; only the admin is unavailable.

**Good to know**
- The first time you press Publish, the admin copies the current content into the database. From then on the admin is the source of truth (edits to `site-data.js` won't show unless you load them via Settings → Load a backup).
- Large videos use a lot of storage and data. For long sermons, uploading to YouTube and pasting the link is best; use uploads for short clips.
- Statistics are anonymous: a random ID per browser, no names, no IP addresses stored.
- Forms go to the admin Inbox by default (Contact & social → *Where forms go*). If the database is ever unreachable they fall back to WhatsApp.

---

## Files
| File / folder | What it is |
|---|---|
| `index.html`, `styles.css`, `mobile.css` | Page layout and design |
| `script.js` | Loads content (from the admin, or `site-data.js`) and fills the page; players, forms, statistics |
| `site-data.js` | Built-in default content (used until the first publish in the admin, and as a fallback) |
| `app.js`, `sw.js`, `manifest.webmanifest`, `icons/` | Installable phone app, offline support and automatic updates |
| `admin/` | The admin dashboard |
| `api/` | Server functions (Vercel): login, content, uploads, media, inbox, statistics, password |
| `downloads/` | Optional place for PDF books shipped with the site (uploads via the admin are preferred) |
| `dev-server.mjs` | Local test server |

## Run locally
```bash
npm install
```
```bash
npm run dev
```
Then open http://localhost:5173 (website) and http://localhost:5173/admin/ (admin, local password: `admin`).
Locally, content and uploads are stored in `.data/` and `uploads/` (both ignored by git).

## Mobile app
On phones the site switches to an app layout (bottom tabs, More sheet, swipeable cards, docked podcast player). It's installable (PWA): Android shows an **Install** banner; on iPhone use Share → **Add to Home Screen**. The installed app checks for updates when reopened and refreshes itself.
