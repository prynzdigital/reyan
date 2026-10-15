# Richard Engmann Ministries — Website

A clean, black-and-white website (with gold accents) for Richard Engmann's preaching ministry: biography, resources (books, School of Ministry, meetings, podcast), new book release, partnership and giving, live YouTube services, popular videos, the Faith Café Podcast, travel schedule, invitations and contact.

## Files
| File | What it is |
|---|---|
| `site-data.js` | **Edit this file** for everyday updates: tagline, biography, resource tiles, new book, partner project, service times, videos, podcast episodes, events, links, contact details |
| `index.html` | Page layout |
| `styles.css` | Design (colors and fonts are at the top under `:root`) |
| `script.js` | Fills the page from `site-data.js`; live status, players, forms |

## Setup checklist
Anything marked `PLACEHOLDER` in `site-data.js` is an example to replace.
1. **Photos** — the design is built around strong photos. Put them in the `images` folder and add the file names under `photos` in `site-data.js`:
   - `hero` — wide photo of Richard preaching (landscape, at least 1920px wide)
   - `about` — portrait for the biography
   - `partner` — crowd or outreach photo
   - Each resource tile can also take an `image`, and the new book a `cover`.
2. **YouTube live** — set `youtube.channelId` (starts with `UC…`) and `youtube.handle`.
3. **Videos** — add each video's ID (the part after `v=` in the link) to `youtubeId` to show real thumbnails.
4. **Podcast** — paste Spotify / Apple Podcasts links into `links`. Add an `.mp3` URL to an episode's `audio` to play it on the site.
5. **Giving** — set `links.givingLink` to your giving page, and fill in bank & mobile money details in `index.html` (search for "add your bank").
6. **Forms** — create a free form at [formspree.io](https://formspree.io) and paste its URL into `formEndpoint` so messages and prayer requests reach your inbox. Until then, forms open the visitor's email app.
7. **Contact details & socials** — update `email`, `phone`, `address` and `socials`.

## Mobile app
On phones (screens up to 768px wide) the site switches to an app layout: a bottom tab bar (Home, Live, Sermons, Podcast, More), a "More" sheet, quick-action buttons, swipeable sermon and mission cards, and a podcast mini player docked above the tabs.

It is also an installable app (PWA). Once the site is live on **https**, visitors can install it:
- **Android / Chrome**: an "Install" banner appears, or use the browser menu → *Install app*.
- **iPhone / Safari**: tap Share → *Add to Home Screen*.

It then opens full-screen with its own icon and still loads when offline.

| File | What it is |
|---|---|
| `mobile.css` | Phone app layout |
| `app.js` | Tab bar, More sheet, install prompt |
| `manifest.webmanifest` | App name, colors, icons, home-screen shortcuts |
| `sw.js` | Offline support. Updates show up automatically; files are cached only so the app opens offline. |
| `icons/` | App icons |

## Preview locally
```bash
python -m http.server 5173
```
Then open http://localhost:5173

## Publish (free options)
- **Netlify**: drag this folder onto https://app.netlify.com/drop
- **GitHub Pages** or **Cloudflare Pages**: upload the folder as a repository
