/* Richard Engmann Ministries — site behaviour. Content lives in site-data.js. */
(function () {
  "use strict";
  const S = window.SITE || {};
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const parseDate = (iso) => { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d); };
  const fmtDate = (iso) => { const d = parseDate(iso); return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`; };
  const fmtTime = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
  };
  const ICON = {
    play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>',
  };
  const SOCIAL_ICONS = {
    youtube: '<path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.7 15.1V8.9L15.5 12z"/>',
    facebook: '<path d="M14 8V6c0-.8.2-1.3 1.4-1.3H17V1.2C16.7 1.1 15.6 1 14.4 1 11.8 1 10 2.6 10 5.5V8H7v3.6h3V23h4V11.6h3l.5-3.6z"/>',
    instagram: '<path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zM17.3 5.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zM12 2c-2.7 0-3 0-4.1.1C4.3 2.2 2.2 4.3 2.1 7.9 2 9 2 9.3 2 12s0 3 .1 4.1c.1 3.6 2.2 5.7 5.8 5.8 1.1.1 1.4.1 4.1.1s3 0 4.1-.1c3.6-.1 5.7-2.2 5.8-5.8.1-1.1.1-1.4.1-4.1s0-3-.1-4.1c-.1-3.6-2.2-5.7-5.8-5.8C15 2 14.7 2 12 2zm0 1.8c2.7 0 3 0 4 .1 2.7.1 3.9 1.4 4 4 .1 1 .1 1.3.1 4s0 3-.1 4c-.1 2.6-1.3 3.9-4 4-1 .1-1.3.1-4 .1s-3 0-4-.1c-2.7-.1-3.9-1.4-4-4-.1-1-.1-1.3-.1-4s0-3 .1-4c.1-2.6 1.3-3.9 4-4 1-.1 1.3-.1 4-.1z"/>',
    tiktok: '<path d="M16.6 2h-3.4v13.4a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.1a6.4 6.4 0 1 0 5.4 6.3V8.6a8 8 0 0 0 4.4 1.4V6.6a4.5 4.5 0 0 1-4.4-4.6z"/>',
    x: '<path d="M17.8 2h3.4l-7.4 8.5L22.5 22h-6.8l-5.3-7-6.1 7H.9l7.9-9L.5 2h7l4.8 6.4zm-1.2 18h1.9L7.5 4H5.5z"/>',
  };
  const isExternal = (url) => /^https?:/i.test(url || "");
  const linkAttrs = (url) => `href="${esc(url || "#")}"${isExternal(url) ? ' target="_blank" rel="noopener"' : ""}`;
  // A photo is either "images/x.jpg" or { src: "images/x.jpg", position: "50% 30%" }.
  const setPhoto = (el, photo) => {
    const p = typeof photo === "string" ? { src: photo } : photo;
    if (!el || !p?.src) return;
    el.style.backgroundImage = `url("${encodeURI(p.src)}")`;
    if (p.position) el.style.backgroundPosition = p.position;
    el.classList.add("has-photo");
  };

  /* ---------- Text bindings & links ---------- */
  $$("[data-bind]").forEach((el) => { const v = S[el.dataset.bind]; if (v) el.textContent = v; });

  const handle = S.youtube?.handle || "";
  const channelUrl = handle
    ? `https://www.youtube.com/${handle.startsWith("@") ? handle : "@" + handle}`
    : S.youtube?.channelId ? `https://www.youtube.com/channel/${S.youtube.channelId}` : "https://www.youtube.com/";
  const hrefs = {
    youtubeChannel: channelUrl,
    youtubeSubscribe: channelUrl + "?sub_confirmation=1",
    spotify: S.links?.spotify,
    applePodcasts: S.links?.applePodcasts,
    podcastTiktok: S.links?.podcastTiktok || S.socials?.tiktok,
    podcastInstagram: S.links?.podcastInstagram || S.socials?.instagram,
    givingLink: S.links?.givingLink,
    emailLink: S.email ? `mailto:${S.email}` : "",
    phoneLink: S.phone ? `tel:${S.phone.replace(/[^\d+]/g, "")}` : "",
  };
  $$("[data-href]").forEach((el) => {
    const v = hrefs[el.dataset.href];
    if (v) el.href = v;
    if (v && !isExternal(v)) { el.removeAttribute("target"); el.removeAttribute("rel"); }
    // A platform without a link yet shows as "coming soon" instead of a dead button.
    if (!v && el.hasAttribute("data-soon")) {
      el.removeAttribute("href");
      el.setAttribute("aria-disabled", "true");
      el.classList.add("is-soon");
      el.insertAdjacentHTML("beforeend", ' <small>Coming soon</small>');
    }
  });
  $("#year").textContent = new Date().getFullYear();

  const socialsHTML = Object.entries(S.socials || {})
    .filter(([k, url]) => url && SOCIAL_ICONS[k])
    .map(([k, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener" aria-label="${esc(k)}"><svg viewBox="0 0 24 24">${SOCIAL_ICONS[k]}</svg></a>`)
    .join("");
  $("#socials").innerHTML = socialsHTML;
  $("#footer-socials").innerHTML = socialsHTML;

  /* ---------- Photos ---------- */
  // Hero slideshow: photos crossfade in the order listed, starting with the first.
  const heroPhotos = [].concat(S.photos?.hero || []).filter((p) => (typeof p === "string" ? p : p?.src));
  const heroMedia = $("#hero-media");
  if (heroPhotos.length) {
    heroMedia.classList.add("has-photo");
    $(".hero").classList.add("has-photos");
    const slides = heroPhotos.map((p, i) => {
      const slide = document.createElement("div");
      slide.className = "hero-slide" + (i === 0 ? " on" : "");
      setPhoto(slide, p);
      heroMedia.appendChild(slide);
      return slide;
    });
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (slides.length > 1 && !still) {
      let cur = 0;
      setInterval(() => {
        if (document.hidden) return;
        slides[cur].classList.remove("on");
        cur = (cur + 1) % slides.length;
        slides[cur].classList.add("on");
      }, 6500);
    }
  }
  setPhoto($("#bio-photo"), S.photos?.about);
  setPhoto($("#partner-bg"), S.photos?.partner);

  /* ---------- Biography ---------- */
  $("#bio-text").innerHTML = (S.bio || []).map((p) => `<p>${esc(p)}</p>`).join("");

  /* ---------- Resource tiles ---------- */
  $("#tiles").innerHTML = (S.resources || []).map((r, i) => `
    <a class="tile-card tile-bg-${i % 4} reveal" ${linkAttrs(r.link)}${r.image ? ` style="background-image:url('${encodeURI(r.image)}')"` : ""}>
      ${r.logo ? `<h3 class="tile-logo"><img src="${esc(r.logo)}" alt="${esc(r.title)}" /></h3>` : `<h3>${esc(r.title)}</h3>`}
      <p>${esc(r.text)}</p>
      <span class="tile-cta">${esc(r.cta || "View more")} →</span>
    </a>`).join("");

  /* ---------- New release ---------- */
  const nr = S.newRelease;
  if (nr) {
    $("#release-kicker").textContent = nr.kicker || "New Release";
    $("#release-title").textContent = nr.title;
    $("#book-title").textContent = nr.title;
    $("#release-sub").textContent = nr.subtitle || "";
    $("#release-text").textContent = nr.text || "";
    $("#release-cta").outerHTML = `<a class="btn btn-dark" id="release-cta" ${linkAttrs(nr.link)}>${esc(nr.cta || "Get a copy")}</a>`;
    setPhoto($(".book-cover"), nr.cover);
  }

  /* ---------- Partner ---------- */
  const pt = S.partner;
  if (pt) {
    $("#partner-title").textContent = pt.title;
    $("#partner-text").textContent = pt.text;
    const pr = pt.project, cur = pt.currency || "$";
    if (pr) {
      const money = (n) => cur + Number(n).toLocaleString();
      const pct = Math.min(100, Math.round((pr.raised / pr.goal) * 100));
      $("#project-title").textContent = pr.title;
      $("#project-raised").textContent = money(pr.raised);
      $("#project-goal").textContent = `${money(pr.goal)} (${pct}%)`;
      $("#project-progress").setAttribute("aria-valuenow", pct);
      $("#project-bar").dataset.pct = pct;
    } else {
      $(".project").hidden = true;
    }
  }

  /* ---------- Give widget ---------- */
  let amount = 50, freq = "monthly";
  const currency = S.partner?.currency || "$";
  const giveBtn = $("#give-btn"), impactEl = $("#give-impact"), custom = $("#amt-custom");
  function updateGive() {
    const label = `${currency}${amount.toLocaleString()}`;
    giveBtn.textContent = amount > 0 ? (freq === "monthly" ? `Partner with ${label} / month` : `Give ${label}`) : "Give now";
    const tiers = (S.giveImpact || []).filter((t) => amount >= t.min);
    const t = tiers[tiers.length - 1];
    if (t) impactEl.textContent = t.text.replace("{amt}", label) + (freq === "monthly" ? " Every month." : "");
  }
  $("#amounts").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-amt]"); if (!b) return;
    $$("#amounts button").forEach((x) => x.classList.toggle("active", x === b));
    custom.value = "";
    amount = +b.dataset.amt; updateGive();
  });
  custom.addEventListener("input", () => {
    $$("#amounts button").forEach((x) => x.classList.remove("active"));
    amount = Math.max(0, Math.floor(+custom.value || 0)); updateGive();
  });
  $$(".give-toggle button").forEach((b) => b.addEventListener("click", () => {
    $$(".give-toggle button").forEach((x) => { x.classList.toggle("active", x === b); x.setAttribute("aria-checked", x === b); });
    freq = b.dataset.freq; updateGive();
  }));
  updateGive();

  /* ---------- Live services ---------- */
  const services = S.services || [];
  $("#service-times").textContent = services.map((s) => `${DAYS[s.day]}s ${fmtTime(s.time)} — ${s.name}`).join("  ·  ");

  function serviceWindow(s, from) {
    const [h, m] = s.time.split(":").map(Number);
    const start = new Date(from);
    start.setHours(h, m, 0, 0);
    start.setDate(start.getDate() + ((s.day - start.getDay() + 7) % 7));
    const end = new Date(start.getTime() + (s.durationMins || 90) * 60000);
    if (end <= from) { start.setDate(start.getDate() + 7); end.setDate(end.getDate() + 7); }
    return { s, start, end };
  }
  function nextService(now) {
    const yesterday = new Date(now.getTime() - 86400000);
    const all = services.flatMap((s) => [serviceWindow(s, now), serviceWindow(s, yesterday)]);
    const live = all.find((w) => w.start <= now && now < w.end);
    if (live) return { live: true, ...live };
    return { live: false, ...all.filter((w) => w.start > now).sort((a, b) => a.start - b.start)[0] };
  }
  function tick() {
    if (!services.length) return;
    const n = nextService(new Date());
    $$(".live-dot").forEach((d) => d.classList.toggle("on", n.live));
    $("#live-badge-text").textContent = n.live ? "LIVE NOW" : "LIVE STREAM";
  }
  tick();
  setInterval(tick, 30000);

  $("#live-poster").addEventListener("click", () => {
    const id = S.youtube?.channelId;
    if (!id) {
      $("#poster-sub").textContent = "Live stream not connected yet — add your YouTube channel ID in site-data.js. Opening the channel instead…";
      window.open(channelUrl, "_blank", "noopener");
      return;
    }
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/live_stream?channel=${encodeURIComponent(id)}&autoplay=1`;
    iframe.title = `${S.ministryName || "Ministry"} live stream`;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    $("#live-player").replaceChildren(iframe);
  });

  /* ---------- Popular videos ---------- */
  $("#video-grid").innerHTML = (S.videos || []).map((v) => {
    const url = v.youtubeId ? `https://www.youtube.com/watch?v=${encodeURIComponent(v.youtubeId)}` : channelUrl;
    const bg = v.youtubeId ? ` style="background-image:url('https://i.ytimg.com/vi/${encodeURIComponent(v.youtubeId)}/hqdefault.jpg')"` : "";
    return `
      <a class="video reveal" href="${esc(url)}" target="_blank" rel="noopener">
        <div class="video-thumb"${bg}><span class="vt-play">${ICON.play}</span></div>
        <h3>${esc(v.title)}</h3>
        <p>${esc(v.place || "")}</p>
      </a>`;
  }).join("");

  /* ---------- Podcast ---------- */
  const eps = S.podcast || [];
  $("#episode-list").innerHTML = eps.map((ep, i) => `
    <li class="episode" data-i="${i}">
      <div><h4>${esc(ep.title)}</h4><span class="ep-meta">${fmtDate(ep.date)} · ${esc(ep.length)}</span></div>
      <button class="ep-play" aria-label="Play ${esc(ep.title)}">${ICON.play}</button>
    </li>`).join("");

  const audio = $("#audio"), player = $("#player");
  const toggleBtn = $("#player-toggle"), seek = $("#player-seek");
  let current = -1;
  const mmss = (t) => isFinite(t) ? `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}` : "0:00";
  const setPlayIcon = (playing) => {
    toggleBtn.innerHTML = playing ? ICON.pause : ICON.play;
    toggleBtn.setAttribute("aria-label", playing ? "Pause" : "Play");
    $$(".episode").forEach((li) => {
      const on = +li.dataset.i === current;
      li.classList.toggle("playing", on);
      $(".ep-play", li).innerHTML = on && playing ? ICON.pause : ICON.play;
    });
  };
  $("#episode-list").addEventListener("click", (e) => {
    const btn = e.target.closest(".ep-play"); if (!btn) return;
    const i = +btn.closest(".episode").dataset.i;
    const ep = eps[i];
    if (!ep.audio) { window.open(S.links?.spotify || channelUrl, "_blank", "noopener"); return; }
    if (i === current) { audio.paused ? audio.play() : audio.pause(); return; }
    current = i;
    audio.src = ep.audio;
    $("#player-title").textContent = ep.title;
    player.hidden = false;
    audio.play().catch(() => {});
  });
  toggleBtn.addEventListener("click", () => (audio.paused ? audio.play() : audio.pause()));
  $("#player-back").addEventListener("click", () => { audio.currentTime = Math.max(0, audio.currentTime - 15); });
  $("#player-fwd").addEventListener("click", () => { audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 30); });
  audio.addEventListener("play", () => setPlayIcon(true));
  audio.addEventListener("pause", () => setPlayIcon(false));
  audio.addEventListener("loadedmetadata", () => { $("#player-dur").textContent = mmss(audio.duration); });
  audio.addEventListener("timeupdate", () => {
    $("#player-cur").textContent = mmss(audio.currentTime);
    if (audio.duration) seek.value = (audio.currentTime / audio.duration) * 100;
  });
  seek.addEventListener("input", () => { if (audio.duration) audio.currentTime = (seek.value / 100) * audio.duration; });

  /* ---------- Signature conferences ---------- */
  $("#signature-conferences").innerHTML = (S.conferences || []).map((c) => `
    <article class="conf reveal">
      <p class="kicker">${esc(c.kicker || "Signature conference")}</p>
      ${c.logo ? `<h3 class="conf-logo"><img src="${esc(c.logo)}" alt="${esc(c.name)}" /></h3>` : `<h3>${esc(c.name)}</h3>`}
      <p>${esc(c.text)}</p>
      <a class="btn btn-gold btn-sm" ${linkAttrs(c.link)} data-event="${esc(c.name)}">${esc(c.cta || "Learn more")}</a>
    </article>`).join("");

  /* ---------- Events ---------- */
  function dateRange(ev) {
    const a = parseDate(ev.date), M = (d) => MONTHS[d.getMonth()].toUpperCase();
    if (!ev.endDate) return `${M(a)} ${a.getDate()}`;
    const b = parseDate(ev.endDate);
    return a.getMonth() === b.getMonth() ? `${M(a)} ${a.getDate()}–${b.getDate()}` : `${M(a)} ${a.getDate()} – ${M(b)} ${b.getDate()}`;
  }
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcoming = (S.events || [])
    .filter((e) => parseDate(e.endDate || e.date) >= today)
    .sort((a, b) => parseDate(a.date) - parseDate(b.date));
  $("#event-list").innerHTML = upcoming.length ? upcoming.map((ev) => `
    <article class="event reveal">
      <div class="event-date">${dateRange(ev)}</div>
      <div><h3 class="event-city">${esc(ev.city)}</h3><p class="event-venue">${esc(ev.venue)}</p></div>
      <a class="btn btn-outline btn-sm" ${linkAttrs(ev.link)} data-event="${esc(ev.venue)}">${esc(ev.cta || "More info")}</a>
    </article>`).join("") : `<p class="center muted">New dates will be announced soon. Subscribe to the newsletter to hear first.</p>`;

  /* ---------- Contact subject shortcuts ---------- */
  const subject = $("#contact-subject"), message = $("#contact-form textarea");
  document.addEventListener("click", (e) => {
    const s = e.target.closest("[data-subject]");
    if (s) subject.value = s.dataset.subject;
    const ev = e.target.closest("[data-event]");
    if (ev && ev.getAttribute("href") === "#contact" && !message.value) {
      message.value = `Hello, I'd like more information about "${ev.dataset.event}".`;
    }
  });

  /* ---------- Forms ---------- */
  function wireForm(form, { subject: subj, okMsg }) {
    const status = $(".form-status", form);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      let ok = true;
      $$("[required]", form).forEach((f) => {
        const bad = !f.value.trim() || (f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value));
        f.classList.toggle("invalid", bad);
        if (bad) ok = false;
      });
      if (!ok) { status.className = "form-status err"; status.textContent = "Please fill in the highlighted fields."; return; }

      const data = Object.fromEntries(new FormData(form));
      const title = typeof subj === "function" ? subj(data) : subj;
      const btn = $("button[type=submit]", form);
      btn.disabled = true;
      try {
        if (S.formEndpoint) {
          const res = await fetch(S.formEndpoint, {
            method: "POST",
            headers: { Accept: "application/json", "Content-Type": "application/json" },
            body: JSON.stringify({ _subject: title, ...data }),
          });
          if (!res.ok) throw new Error("send failed");
        } else {
          const body = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join("\n");
          window.location.href = `mailto:${S.email}?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
        }
        form.reset();
        status.className = "form-status ok";
        status.textContent = okMsg(data);
      } catch {
        status.className = "form-status err";
        status.textContent = `Sorry, something went wrong. Please email us at ${S.email}.`;
      } finally {
        btn.disabled = false;
      }
    });
    form.addEventListener("input", (e) => e.target.classList.remove("invalid"));
  }
  wireForm($("#contact-form"), {
    subject: (d) => `Website: ${d.subject}`,
    okMsg: (d) => d.subject === "Prayer request" ? "Thank you. Our prayer team is standing with you." : "Thank you! We'll get back to you within two working days.",
  });
  wireForm($("#newsletter-form"), { subject: "Newsletter subscription", okMsg: () => "You're subscribed. God bless you!" });

  /* ---------- Header menu & active link ---------- */
  const toggle = $(".nav-toggle");
  const setNav = (open) => {
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", open);
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  toggle.addEventListener("click", () => setNav(!document.body.classList.contains("nav-open")));
  $$("#main-nav a").forEach((a) => a.addEventListener("click", () => setNav(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setNav(false); });

  const navLinks = $$("#main-nav a[href^='#']:not(.btn)");
  const sectionObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${en.target.id}`));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("main > section[id]").forEach((s) => sectionObs.observe(s));

  /* ---------- Reveal on scroll ---------- */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      const bar = $("#project-bar", en.target);
      if (bar) bar.style.width = bar.dataset.pct + "%";
      revealObs.unobserve(en.target);
    });
  }, { threshold: 0.12 });
  $$(".reveal").forEach((el) => revealObs.observe(el));
})();
