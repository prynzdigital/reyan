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
  const TAB_FOR = { home: "home", live: "live", sermons: "sermons", podcast: "podcast" };
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

  /* ---------- Install prompt ---------- */
  const banner = $("#install-banner"), tile = $("#install-tile"), hint = $("#install-hint"), installBtn = $("#install-btn");
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
  const mobile = window.matchMedia("(max-width: 768px)").matches;
  let deferred = null;

  function showInstall() {
    tile.hidden = false;
    if (mobile && !store.get("installDismissed")) setTimeout(() => { banner.hidden = false; }, 2500);
  }
  async function install() {
    if (deferred) {
      deferred.prompt();
      await deferred.userChoice.catch(() => {});
      deferred = null;
      banner.hidden = true;
      tile.hidden = true;
    } else if (isIOS) {
      hint.textContent = "Tap the Share button, then “Add to Home Screen”.";
      banner.hidden = false;
      installBtn.hidden = true;
    }
  }
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e; showInstall(); });
  window.addEventListener("appinstalled", () => { banner.hidden = true; tile.hidden = true; });
  if (isIOS && !isStandalone) {
    showInstall();
    hint.textContent = "Tap Share, then “Add to Home Screen”.";
    installBtn.hidden = true;
  }
  installBtn.addEventListener("click", install);
  tile.addEventListener("click", () => { closeSheet(); install(); });
  $("#install-close").addEventListener("click", () => { banner.hidden = true; store.set("installDismissed", "1"); });

  /* ---------- Offline support ---------- */
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
})();
