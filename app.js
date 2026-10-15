/* Mobile app shell: tab bar, "More" sheet, install prompt and offline support. */
(function () {
  "use strict";
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
  };
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  if (isStandalone) document.documentElement.classList.add("standalone");

  /* ---------- More sheet ---------- */
  const sheet = $("#more-sheet"), backdrop = $("#sheet-backdrop"), moreBtn = $("#more-btn");
  let lastFocus = null;
  function openSheet() {
    lastFocus = document.activeElement;
    backdrop.hidden = false;
    requestAnimationFrame(() => document.body.classList.add("sheet-open"));
    sheet.setAttribute("aria-hidden", "false");
    $("#sheet-close").focus({ preventScroll: true });
  }
  function closeSheet() {
    document.body.classList.remove("sheet-open");
    sheet.setAttribute("aria-hidden", "true");
    setTimeout(() => { backdrop.hidden = true; }, 300);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  moreBtn.addEventListener("click", openSheet);
  backdrop.addEventListener("click", closeSheet);
  $("#sheet-close").addEventListener("click", closeSheet);
  $$(".sheet-grid a").forEach((a) => a.addEventListener("click", closeSheet));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && document.body.classList.contains("sheet-open")) closeSheet(); });

  // Swipe down on the sheet to dismiss
  let startY = null;
  sheet.addEventListener("touchstart", (e) => { startY = e.touches[0].clientY; }, { passive: true });
  sheet.addEventListener("touchmove", (e) => {
    if (startY === null) return;
    const dy = Math.max(0, e.touches[0].clientY - startY);
    sheet.style.transform = `translateY(${dy}px)`;
  }, { passive: true });
  sheet.addEventListener("touchend", (e) => {
    const dy = e.changedTouches[0].clientY - (startY ?? 0);
    sheet.style.transform = "";
    startY = null;
    if (dy > 90) closeSheet();
  });

  // Social links inside the sheet mirror the contact section
  const socials = $("#socials");
  if (socials) $("#sheet-socials").innerHTML = socials.innerHTML;

  /* ---------- Tab bar: highlight the current section ---------- */
  const TAB_FOR = { home: "home", live: "live", podcast: "podcast", events: "events" };
  const tabs = $$(".tab");
  const setTab = (name) => tabs.forEach((t) => {
    const on = t.dataset.tab === name;
    t.classList.toggle("active", on);
    if (t.tagName === "A") on ? t.setAttribute("aria-current", "page") : t.removeAttribute("aria-current");
  });
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) setTab(TAB_FOR[en.target.id] || "more"); });
  }, { rootMargin: "-40% 0px -55% 0px" });
  $$("main > section[id]").forEach((s) => spy.observe(s));

  /* ---------- Docked mini player ---------- */
  const player = $("#player");
  new MutationObserver(() => document.body.classList.toggle("has-player", !player.hidden))
    .observe(player, { attributes: true, attributeFilter: ["hidden"] });

  /* ---------- Install ("Add to Home Screen") ---------- */
  const banner = $("#install-banner"), tile = $("#install-tile"), installBtn = $("#install-btn");
  const guide = $("#install-guide"), steps = $("#install-steps"), guideTitle = $("#install-guide-title");
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = /android/i.test(ua);
  const inApp = /FBAN|FBAV|Instagram|Line\/|Twitter|TikTok|Snapchat|MicroMessenger|; wv\)/i.test(ua);
  const isSamsung = /SamsungBrowser/i.test(ua);
  const isFirefox = /Firefox|FxiOS/i.test(ua);
  const mobile = window.matchMedia("(max-width: 768px)").matches;
  let deferred = null, installAsked = false;

  // Step-by-step help for browsers that don't offer a one-tap install prompt.
  const SHARE_ICON = '<svg class="inline-ico" viewBox="0 0 24 24"><path d="M12 2 7.5 6.5l1.4 1.4L11 5.8V15h2V5.8l2.1 2.1 1.4-1.4zM5 10v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10h-3v2h1v8H7v-8h1v-2z"/></svg>';
  const DOTS_ICON = '<svg class="inline-ico" viewBox="0 0 24 24"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>';
  function guideFor() {
    if (location.protocol === "file:") return {
      title: "Put the website online first",
      steps: ["The app can only be installed from the live website (an <b>https://</b> address), not from a file on this computer.", "Publish the site (e.g. GitHub Pages), then open that link on your phone."],
    };
    if (inApp) return {
      title: "Open in your browser",
      steps: [`This page is open inside another app, which can't install apps.`, `Tap ${DOTS_ICON} or ${SHARE_ICON} at the top and choose <b>Open in browser</b> (Chrome or Safari).`, "Then tap <b>Install App</b> again."],
      copy: true,
    };
    if (isIOS) return {
      title: "Add to your iPhone",
      steps: [`Tap the <b>Share</b> button ${SHARE_ICON} in the browser bar${/CriOS|FxiOS|EdgiOS/i.test(ua) ? " (top right)" : " (bottom of the screen)"}.`, "Scroll down and tap <b>Add to Home Screen</b>.", "Tap <b>Add</b>. The app now appears on your home screen."],
    };
    if (isSamsung) return {
      title: "Add to your phone",
      steps: ["Tap the <b>☰ menu</b> at the bottom right.", "Tap <b>Add page to</b> → <b>Home screen</b>.", "Tap <b>Add</b>."],
    };
    if (isAndroid) return {
      title: "Add to your phone",
      steps: [`Tap the <b>menu</b> ${DOTS_ICON} at the top right of ${isFirefox ? "Firefox" : "Chrome"}.`, "Tap <b>Install app</b> or <b>Add to Home screen</b>.", "Tap <b>Install</b> to confirm."],
    };
    return {
      title: "Install on this computer",
      steps: ["Click the <b>install icon</b> at the right end of the address bar (Chrome / Edge).", `Or open the browser menu ${DOTS_ICON} → <b>Install Richard Engmann Ministries</b>.`],
    };
  }
  function openGuide() {
    const g = guideFor();
    guideTitle.textContent = g.title;
    steps.innerHTML = g.steps.map((t) => `<li><span>${t}</span></li>`).join("");
    $("#install-copy").hidden = !g.copy;
    guide.hidden = false;
    requestAnimationFrame(() => guide.classList.add("open"));
  }
  function closeGuide() {
    guide.classList.remove("open");
    setTimeout(() => { guide.hidden = true; }, 250);
  }
  guide.addEventListener("click", (e) => { if (e.target === guide || e.target.closest("[data-close-guide]")) closeGuide(); });
  $("#install-copy").addEventListener("click", async (e) => {
    try { await navigator.clipboard.writeText(location.href.split("#")[0]); e.currentTarget.textContent = "Link copied ✓"; }
    catch { e.currentTarget.textContent = location.href.split("#")[0]; }
  });

  async function install() {
    installAsked = true;
    banner.hidden = true;
    if (deferred) {
      deferred.prompt();
      const choice = await deferred.userChoice.catch(() => null);
      deferred = null;
      if (choice && choice.outcome === "accepted") tile.hidden = true;
      return;
    }
    openGuide();
  }

  // The Install tile is always available until the app is installed.
  if (!isStandalone) {
    tile.hidden = false;
    if (mobile && !store.get("installDismissed")) setTimeout(() => { if (!installAsked) banner.hidden = false; }, 3000);
  }
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e; });
  window.addEventListener("appinstalled", () => { banner.hidden = true; tile.hidden = true; closeGuide(); });
  installBtn.addEventListener("click", install);
  tile.addEventListener("click", () => { closeSheet(); setTimeout(install, 200); });
  $("#install-close").addEventListener("click", () => { banner.hidden = true; store.set("installDismissed", "1"); });

  /* ---------- Offline support ---------- */
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js", { updateViaCache: "none" })
        .then((reg) => { swReg = reg; })
        .catch(() => {});
    });
    // A new version of the app took over: reload once to show it
    // (skipped on the very first install, when there was no previous version).
    const hadController = !!navigator.serviceWorker.controller;
    let reloading = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!hadController || reloading) return;
      reloading = true;
      refresh();
    });
  }

  /* ---------- Keep the installed app up to date ----------
     Installed apps stay open in the background, so check for a newer version of the
     site whenever the app is reopened (and every few minutes while open), then reload. */
  let swReg = null;
  const WATCHED = ["./", "site-data.js", "script.js", "app.js", "styles.css", "mobile.css"];
  const fingerprint = () => Promise.all(WATCHED.map((u) =>
    fetch(u, { method: "HEAD", cache: "no-store" })
      .then((r) => r.headers.get("etag") || r.headers.get("last-modified") || "")
      .catch(() => null)
  )).then((tags) => (tags.includes(null) ? null : tags.join("|")));

  function busy() {
    const audio = $("#audio");
    if (audio && !audio.paused) return true;                          // podcast playing
    if ($$("form input, form textarea").some((f) => f.value && f.type !== "checkbox" && f.type !== "radio" && f.type !== "number")) return true;
    if (document.body.classList.contains("sheet-open") || !$("#install-guide").hidden) return true;
    return !!$(".live-player iframe");                                // watching the live stream
  }
  function refresh() {
    if (busy()) { pending = true; return; }
    window.location.reload();
  }
  let baseline = null, pending = false, hiddenAt = 0;
  if (location.protocol.startsWith("http")) {
    window.addEventListener("load", () => fingerprint().then((f) => { baseline = f; }));
    async function checkForUpdate() {
      if (!navigator.onLine) return;
      if (swReg) swReg.update().catch(() => {});
      const now = await fingerprint();
      if (now && baseline && now !== baseline) refresh();
      else if (now && !baseline) baseline = now;
    }
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { hiddenAt = Date.now(); return; }
      if (pending && !busy()) { window.location.reload(); return; }
      if (Date.now() - hiddenAt > 30 * 1000) checkForUpdate();
    });
    setInterval(() => { if (!document.hidden) checkForUpdate(); }, 5 * 60 * 1000);
    window.addEventListener("online", checkForUpdate);
  }
})();
