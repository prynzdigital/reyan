# Reyan Ministries — Website

A fast, mobile-friendly website for Reyan's preaching ministry: live YouTube services, sermon library, podcast, missions, events, prayer requests, giving and contact.

## Files
| File | What it is |
|---|---|
| `index.html` | Page layout and fixed text (hero, about, mission descriptions) |
| `site-data.js` | **Edit this file** for everyday updates: service times, sermons, podcast episodes, events, testimonies, project goal, links |
| `styles.css` | Design (colors are at the top under `:root`) |
| `script.js` | Behaviour (live countdown, players, sliders, forms) |

## Setup checklist
1. **YouTube live** — in `site-data.js`, set `youtube.channelId` (starts with `UC…`) and `youtube.handle`. The live player will then show the current stream, or the latest one when offline.
2. **Sermons** — add each video's ID (the part after `v=` in the link) to `youtubeId` to show real thumbnails.
3. **Podcast** — paste Spotify / Apple Podcasts links into `links`. Add an `.mp3` URL to an episode's `audio` to play it right on the site.
4. **Giving** — set `links.givingLink` to your PayPal / Stripe / giving page, and fill in bank & mobile money details in `index.html` (search for "add your bank").
5. **Forms** — create a free form at [formspree.io](https://formspree.io) and paste its URL into `formEndpoint` so prayer requests and messages reach your inbox. Until then, forms open the visitor's email app.
6. **Photo** — put a photo at `images/reyan.jpg` and in `index.html` replace the `photo-placeholder` block with `<img src="images/reyan.jpg" alt="Reyan preaching" />`.
7. **Contact details & socials** — update `email`, `phone`, `address` and `socials` in `site-data.js`.
8. **Numbers** — the stats (nations reached, salvations, etc.) are in `index.html` as `data-count="…"`. Replace them with real figures.

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
