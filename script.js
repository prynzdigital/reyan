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
    clock: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 10.4 3.5 2.1-.8 1.3L11 13V7h2z"/></svg>',
    pin: '<svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>',
    cal: '<svg viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V9h14z"/></svg>',
  };
  const SOCIAL_ICONS = {
    youtube: '<path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.7 15.1V8.9L15.5 12z"/>',
    facebook: '<path d="M14 8V6c0-.8.2-1.3 1.4-1.3H17V1.2C16.7 1.1 15.6 1 14.4 1 11.8 1 10 2.6 10 5.5V8H7v3.6h3V23h4V11.6h3l.5-3.6z"/>',
    instagram: '<path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zM17.3 5.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zM12 2c-2.7 0-3 0-4.1.1C4.3 2.2 2.2 4.3 2.1 7.9 2 9 2 9.3 2 12s0 3 .1 4.1c.1 3.6 2.2 5.7 5.8 5.8 1.1.1 1.4.1 4.1.1s3 0 4.1-.1c3.6-.1 5.7-2.2 5.8-5.8.1-1.1.1-1.4.1-4.1s0-3-.1-4.1c-.1-3.6-2.2-5.7-5.8-5.8C15 2 14.7 2 12 2zm0 1.8c2.7 0 3 0 4 .1 2.7.1 3.9 1.4 4 4 .1 1 .1 1.3.1 4s0 3-.1 4c-.1 2.6-1.3 3.9-4 4-1 .1-1.3.1-4 .1s-3 0-4-.1c-2.7-.1-3.9-1.4-4-4-.1-1-.1-1.3-.1-4s0-3 .1-4c.1-2.6 1.3-3.9 4-4 1-.1 1.3-.1 4-.1z"/>',
    tiktok: '<path d="M16.6 2h-3.4v13.4a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.1a6.4 6.4 0 1 0 5.4 6.3V8.6a8 8 0 0 0 4.4 1.4V6.6a4.5 4.5 0 0 1-4.4-4.6z"/>',
    x: '<path d="M17.8 2h3.4l-7.4 8.5L22.5 22h-6.8l-5.3-7-6.1 7H.9l7.9-9L.5 2h7l4.8 6.4zm-1.2 18h1.9L7.5 4H5.5z"/>',
  };

  /* ---------- Simple text bindings & links ---------- */
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
    givingLink: S.links?.givingLink,
    emailLink: S.email ? `mailto:${S.email}` : "",
    phoneLink: S.phone ? `tel:${S.phone.replace(/[^\d+]/g, "")}` : "",
  };
  $$("[data-href]").forEach((el) => {
    const v = hrefs[el.dataset.href];
    if (v) el.href = v;
    if (v && v.startsWith("#")) { el.removeAttribute("target"); el.removeAttribute("rel"); }
  });

  $("#year").textContent = new Date().getFullYear();

  /* ---------- Socials ---------- */
  const socials = $("#socials");
  Object.entries(S.socials || {}).forEach(([k, url]) => {
    if (!url || !SOCIAL_ICONS[k]) return;
    socials.insertAdjacentHTML("beforeend",
      `<a href="${esc(url)}" target="_blank" rel="noopener" aria-label="${esc(k)}"><svg viewBox="0 0 24 24">${SOCIAL_ICONS[k]}</svg></a>`);
  });

  /* ---------- Service times ---------- */
  const services = S.services || [];
  $("#service-times").innerHTML = services.map((s) => `
    <div class="time-item">${ICON.clock}
      <div><strong>${esc(s.name)}</strong><span>${DAYS[s.day]}s · ${fmtTime(s.time)} · ${esc(s.note || "")}</span></div>
    </div>`).join("");
  $("#footer-times").innerHTML = services.map((s) =>
    `<p><strong>${DAYS[s.day]}</strong> — ${esc(s.name)}, ${fmtTime(s.time)}</p>`).join("");

  /* ---------- Next service / live status ---------- */
  function serviceWindow(s, from) {
    const [h, m] = s.time.split(":").map(Number);
    const start = new Date(from);
    start.setHours(h, m, 0, 0);
    start.setDate(start.getDate() + ((s.day - start.getDay() + 7) % 7));
    const end = new Date(start.getTime() + (s.durationMins || 90) * 60000);
    // If this week's slot is fully past, roll to next week
    if (end <= from) { start.setDate(start.getDate() + 7); end.setDate(end.getDate() + 7); }
    return { s, start, end };
  }
  function nextService(now) {
    // Also consider a service that started yesterday and is still running
    const yesterday = new Date(now.getTime() - 86400000);
    const all = services.flatMap((s) => [serviceWindow(s, now), serviceWindow(s, yesterday)]);
    const live = all.find((w) => w.start <= now && now < w.end);
    if (live) return { live: true, ...live };
    return { live: false, ...all.filter((w) => w.start > now).sort((a, b) => a.start - b.start)[0] };
  }

  const cd = $("#countdown");
  function tick() {
    if (!services.length) return;
    const now = new Date();
    const n = nextService(now);
    const status = $("#hero-status");
    $("#live-badge-text").textContent = n.live ? "LIVE NOW" : "LIVE STREAM";
    $$(".live-dot").forEach((d) => d.classList.toggle("on", n.live));
    if (n.live) {
      status.textContent = `Live now: ${n.s.name}`;
      cd.classList.add("is-live");
      $(".countdown-label", cd).innerHTML = `<a href="#live" class="btn btn-gold btn-sm">● We're live — join now</a>`;
      return;
    }
    cd.classList.remove("is-live");
    $(".countdown-label", cd).textContent = `Next: ${n.s.name}`;
    status.textContent = `${n.s.name} · ${DAYS[n.start.getDay()]} ${fmtTime(n.s.time)}`;
    let diff = Math.max(0, Math.floor((n.start - now) / 1000));
    const parts = { d: Math.floor(diff / 86400), h: Math.floor((diff % 86400) / 3600), m: Math.floor((diff % 3600) / 60), s: diff % 60 };
    Object.entries(parts).forEach(([k, v]) => { $(`[data-cd="${k}"]`, cd).textContent = String(v).padStart(2, "0"); });
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- Verse of the day ---------- */
  if (S.verses?.length) {
    const dayIndex = Math.floor(Date.now() / 86400000) % S.verses.length;
    const v = S.verses[dayIndex];
    $("#verse-text").textContent = `“${v.text}”`;
    $("#verse-ref").textContent = v.ref;
  }

  /* ---------- Weekly message ---------- */
  if (S.weeklyMessage) {
    $("#weekly-title").textContent = S.weeklyMessage.title;
    $("#weekly-desc").textContent = S.weeklyMessage.desc;
  }

  /* ---------- Live player (loads YouTube only when clicked) ---------- */
  const poster = $("#live-poster");
  poster.addEventListener("click", () => {
    const id = S.youtube?.channelId;
    if (!id) {
      $("#poster-sub").textContent = "Live stream not connected yet — add your YouTube channel ID in site-data.js. Opening the channel instead…";
      window.open(channelUrl, "_blank", "noopener");
      return;
    }
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/live_stream?channel=${encodeURIComponent(id)}&autoplay=1`;
    iframe.title = "Richard Engmann Ministries live stream";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    $("#live-player").replaceChildren(iframe);
  });

  /* ---------- Sermons ---------- */
  const sermons = S.sermons || [];
  const gradients = [
    "linear-gradient(135deg,#7a2e12,#e0b354)", "linear-gradient(135deg,#1f2c4a,#5a78dc)",
    "linear-gradient(135deg,#0f3b3a,#3fb39a)", "linear-gradient(135deg,#3b1f4a,#b06ad6)",
    "linear-gradient(135deg,#2a1a0f,#c9772e)", "linear-gradient(135deg,#0f1729,#4b6cb7)",
  ];
  const series = ["All", ...new Set(sermons.map((s) => s.series))];
  $("#sermon-filters").innerHTML = series.map((s, i) =>
    `<button role="tab" aria-selected="${i === 0}" class="${i === 0 ? "active" : ""}" data-series="${esc(s)}">${esc(s)}</button>`).join("");
  $("#sermon-grid").innerHTML = sermons.map((s, i) => {
    const url = s.youtubeId ? `https://www.youtube.com/watch?v=${encodeURIComponent(s.youtubeId)}` : channelUrl;
    const bg = s.youtubeId
      ? `background-image:url('https://i.ytimg.com/vi/${encodeURIComponent(s.youtubeId)}/hqdefault.jpg')`
      : `background:${gradients[i % gradients.length]}`;
    return `
      <article class="sermon-card reveal" data-series="${esc(s.series)}">
        <a class="sermon-thumb" href="${esc(url)}" target="_blank" rel="noopener" style="${bg}" aria-label="Watch ${esc(s.title)}">
          ${s.youtubeId ? "" : `<span class="thumb-word">${esc(s.word || s.title)}</span>`}
          <span class="thumb-tag">${esc(s.series)}</span>
          <span class="thumb-play">${ICON.play}</span>
        </a>
        <div class="sermon-body">
          <h3>${esc(s.title)}</h3>
          <div class="ref">${esc(s.ref)}</div>
          <p>${esc(s.desc)}</p>
          <div class="sermon-meta"><span>${fmtDate(s.date)}</span><span>${esc(s.length)}</span></div>
        </div>
      </article>`;
  }).join("");
  $("#sermon-filters").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    $$("#sermon-filters button").forEach((x) => { x.classList.toggle("active", x === b); x.setAttribute("aria-selected", x === b); });
    $$(".sermon-card").forEach((c) => c.classList.toggle("hide", b.dataset.series !== "All" && c.dataset.series !== b.dataset.series));
  });

  /* ---------- Podcast ---------- */
  const eps = S.podcast || [];
  const total = eps.length;
  $("#episode-list").innerHTML = eps.map((ep, i) => `
    <li class="episode" data-i="${i}">
      <span class="ep-num">${String(total - i).padStart(2, "0")}</span>
      <div class="ep-info">
        <h4>${esc(ep.title)}</h4>
        <p>${esc(ep.desc)}</p>
        <span class="ep-meta">${fmtDate(ep.date)} · ${esc(ep.length)}</span>
      </div>
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

  /* ---------- Mission project ---------- */
  const p = S.project;
  if (p) {
    const money = (n) => p.currency + Number(n).toLocaleString();
    const pct = Math.min(100, Math.round((p.raised / p.goal) * 100));
    $("#project-title").textContent = p.title;
    $("#project-desc").textContent = p.desc;
    $("#project-raised").textContent = money(p.raised);
    $("#project-goal").textContent = `${money(p.goal)} (${pct}%)`;
    $("#project-progress").setAttribute("aria-valuenow", pct);
    $("#project-bar").dataset.pct = pct;
  }

  /* ---------- Events ---------- */
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcoming = (S.events || []).filter((e) => parseDate(e.date) >= today).sort((a, b) => parseDate(a.date) - parseDate(b.date));
  $("#event-list").innerHTML = upcoming.length ? upcoming.map((ev) => {
    const d = parseDate(ev.date);
    return `
      <article class="event reveal">
        <div class="event-date"><span class="m">${MONTHS[d.getMonth()]}</span><span class="d">${d.getDate()}</span></div>
        <div class="event-info">
          <h3>${esc(ev.title)}</h3>
          <p>${esc(ev.desc)}</p>
          <div class="event-tags">
            <span>${ICON.cal}${DAYS[d.getDay()]}, ${d.getFullYear()}</span>
            <span>${ICON.clock}${esc(ev.time)}</span>
            <span>${ICON.pin}${esc(ev.place)}</span>
          </div>
        </div>
        <a href="#contact" class="btn btn-outline btn-sm" data-event="${esc(ev.title)}">${esc(ev.cta || "Learn more")}</a>
      </article>`;
  }).join("") : `<p class="center">New events will be announced soon. Subscribe below to hear first.</p>`;
  $("#event-list").addEventListener("click", (e) => {
    const a = e.target.closest("[data-event]"); if (!a) return;
    const msg = $("#contact-form textarea");
    if (msg && !msg.value) msg.value = `Hello, I'd like to ${a.textContent.trim().toLowerCase()} for "${a.dataset.event}".`;
  });

  /* ---------- Testimonies slider ---------- */
  const tms = S.testimonies || [];
  const track = $("#testimony-track"), dots = $("#slider-dots");
  track.innerHTML = tms.map((t) => `
    <figure class="testimony">
      <span class="q-mark" aria-hidden="true">“</span>
      <p>${esc(t.text)}</p>
      <figcaption class="who"><span class="avatar">${esc(t.name.charAt(0))}</span><span><strong>${esc(t.name)}</strong><small>${esc(t.place)}</small></span></figcaption>
    </figure>`).join("");
  dots.innerHTML = tms.map((_, i) => `<button role="tab" aria-label="Testimony ${i + 1}" class="${i === 0 ? "active" : ""}"></button>`).join("");
  let slide = 0, timer;
  const go = (i) => {
    slide = (i + tms.length) % tms.length;
    track.style.transform = `translateX(-${slide * 100}%)`;
    $$("button", dots).forEach((d, j) => d.classList.toggle("active", j === slide));
  };
  const auto = () => { clearInterval(timer); timer = setInterval(() => go(slide + 1), 7000); };
  dots.addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; go($$("button", dots).indexOf(b)); auto(); });
  if (tms.length > 1) auto();

  /* ---------- Give widget ---------- */
  let amount = 50, freq = "once";
  const cur = S.project?.currency || "$";
  const giveBtn = $("#give-btn"), impactEl = $("#give-impact"), custom = $("#amt-custom");
  function updateGive() {
    const label = `${cur}${amount.toLocaleString()}`;
    giveBtn.textContent = amount > 0 ? `Give ${label}${freq === "monthly" ? " / month" : ""}` : "Give now";
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

  /* ---------- Forms ---------- */
  function wireForm(form, { subject, okMsg }) {
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
      const subj = typeof subject === "function" ? subject(data) : subject;
      const btn = $("button[type=submit]", form);
      btn.disabled = true;
      try {
        if (S.formEndpoint) {
          const res = await fetch(S.formEndpoint, {
            method: "POST",
            headers: { Accept: "application/json", "Content-Type": "application/json" },
            body: JSON.stringify({ _subject: subj, ...data }),
          });
          if (!res.ok) throw new Error("send failed");
        } else {
          const body = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join("\n");
          window.location.href = `mailto:${S.email}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
        }
        form.reset();
        status.className = "form-status ok";
        status.textContent = okMsg;
      } catch {
        status.className = "form-status err";
        status.textContent = `Sorry, something went wrong. Please email us at ${S.email}.`;
      } finally {
        btn.disabled = false;
      }
    });
    form.addEventListener("input", (e) => e.target.classList.remove("invalid"));
  }
  wireForm($("#prayer-form"), { subject: (d) => `Prayer request — ${d.topic}`, okMsg: "🙏 Thank you. Our prayer team is standing with you." });
  wireForm($("#contact-form"), { subject: (d) => `Website: ${d.subject}`, okMsg: "Thank you! We'll get back to you within two working days." });
  wireForm($("#newsletter-form"), { subject: "Devotional subscription", okMsg: "You're in! Look out for Monday's devotional." });

  /* ---------- Header, nav & active section ---------- */
  const header = $(".site-header"), toggle = $(".nav-toggle");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 30);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  const setNav = (open) => {
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", open);
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  toggle.addEventListener("click", () => setNav(!document.body.classList.contains("nav-open")));
  $$("#main-nav a").forEach((a) => a.addEventListener("click", () => setNav(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setNav(false); });
  document.addEventListener("click", (e) => {
    if (document.body.classList.contains("nav-open") && !e.target.closest("#main-nav, .nav-toggle")) setNav(false);
  });

  const navLinks = $$("#main-nav a[href^='#']");
  const sectionObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${en.target.id}`));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  navLinks.forEach((a) => { const s = $(a.getAttribute("href")); if (s) sectionObs.observe(s); });

  /* ---------- Reveal, counters & progress ---------- */
  function countUp(el) {
    const target = +el.dataset.count, suffix = el.dataset.suffix || "";
    const start = performance.now(), dur = 1600;
    const step = (t) => {
      const k = Math.min(1, (t - start) / dur), eased = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(target * eased).toLocaleString() + suffix;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      $$("[data-count]", en.target).forEach(countUp);
      const bar = $("#project-bar", en.target);
      if (bar) bar.style.width = bar.dataset.pct + "%";
      revealObs.unobserve(en.target);
    });
  }, { threshold: 0.12 });
  $$(".reveal").forEach((el) => revealObs.observe(el));
})();
