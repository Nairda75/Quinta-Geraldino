/* Quinta Geraldino — comportamento partilhado */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.remove("no-js");

  var WA = "351916604527";
  window.QG = { WA: WA, lang: "pt" };

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------- Idioma PT / EN ---------- */
  function applyLang(lang) {
    window.QG.lang = lang;
    doc.lang = lang === "en" ? "en" : "pt-PT";
    document.querySelectorAll("[data-en]").forEach(function (el) {
      if (el.dataset.pt === undefined) el.dataset.pt = el.innerHTML;
      el.innerHTML = lang === "en" ? el.dataset.en : el.dataset.pt;
    });
    document.querySelectorAll("[data-en-ph]").forEach(function (el) {
      if (el.dataset.ptPh === undefined) el.dataset.ptPh = el.getAttribute("placeholder") || "";
      el.setAttribute("placeholder", lang === "en" ? el.dataset.enPh : el.dataset.ptPh);
    });
    document.querySelectorAll("[data-en-aria]").forEach(function (el) {
      if (el.dataset.ptAria === undefined) el.dataset.ptAria = el.getAttribute("aria-label") || "";
      el.setAttribute("aria-label", lang === "en" ? el.dataset.enAria : el.dataset.ptAria);
    });
    document.querySelectorAll("[data-en-alt]").forEach(function (el) {
      if (el.dataset.ptAlt === undefined) el.dataset.ptAlt = el.getAttribute("alt") || "";
      el.setAttribute("alt", lang === "en" ? el.dataset.enAlt : el.dataset.ptAlt);
    });
    var t = doc.dataset[lang === "en" ? "titleEn" : "titlePt"];
    if (t) document.title = t;
    document.querySelectorAll(".lang button").forEach(function (b) {
      b.setAttribute("aria-pressed", b.dataset.lang === lang ? "true" : "false");
    });
    document.querySelectorAll("[data-wa]").forEach(setWaLink);
    document.dispatchEvent(new CustomEvent("qg:lang", { detail: lang }));
  }
  function setWaLink(a) {
    var msg = window.QG.lang === "en" ? a.dataset.waEn : a.dataset.wa;
    a.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg);
  }
  doc.dataset.titlePt = document.title;
  var saved = store("qg-lang");
  var initial = saved === "en" ? "en" : "pt"; // português por defeito; o visitante pode mudar para EN
  applyLang(initial);
  document.querySelectorAll(".lang button").forEach(function (b) {
    b.addEventListener("click", function () { store("qg-lang", b.dataset.lang); applyLang(b.dataset.lang); });
  });

  /* ---------- Cabeçalho e menu móvel ---------- */
  var header = document.querySelector(".site-header");
  if (header && document.body.classList.contains("page-home")) {
    var waF = document.querySelector(".wa-float");
    var onScroll = function () { var past = window.scrollY > window.innerHeight * 0.6; header.classList.toggle("solid", past); if (waF) waF.classList.toggle("hidden", !past); };
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
  }
  var menu = document.querySelector(".mobile-menu");
  var openBtn = document.querySelector(".menu-btn");
  var closeBtn = document.querySelector(".close-btn");
  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle("open", open);
    openBtn.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
    if (open) closeBtn.focus(); else openBtn.focus();
  }
  if (openBtn) openBtn.addEventListener("click", function () { setMenu(true); });
  if (closeBtn) closeBtn.addEventListener("click", function () { setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menu && menu.classList.contains("open")) setMenu(false); });

  /* ---------- Hero: capítulos do dia ---------- */
  var hero = document.querySelector(".hero");
  if (hero) {
    var slides = hero.querySelectorAll(".hero-slide");
    var chapters = hero.querySelectorAll(".hero-chapters button");
    var idx = 0, timer = null, DUR = 6500;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function show(i) {
      idx = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle("active", k === idx); });
      chapters.forEach(function (c, k) {
        c.classList.remove("active"); void c.offsetWidth;
        c.classList.toggle("active", k === idx);
        c.setAttribute("aria-current", k === idx ? "true" : "false");
      });
      // pré-carregar a seguinte
      var next = slides[(idx + 1) % slides.length].querySelector("img");
      if (next && next.loading === "lazy") next.loading = "eager";
      schedule();
    }
    function schedule() { clearTimeout(timer); if (!reduce && !hero.classList.contains("paused")) timer = setTimeout(function () { show(idx + 1); }, DUR); }
    chapters.forEach(function (c, k) { c.addEventListener("click", function () { show(k); }); });
    hero.style.setProperty("--dur", DUR + "ms");
    document.addEventListener("visibilitychange", function () { if (document.hidden) clearTimeout(timer); else schedule(); });
    if (reduce) hero.classList.add("paused");
    show(0);
  }

  /* ---------- Um dia na Quinta ---------- */
  var steps = document.querySelectorAll(".day-step");
  var dayImgs = document.querySelectorAll(".day-media img");
  if (steps.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var i = +en.target.dataset.i;
        steps.forEach(function (s, k) { s.classList.toggle("on", k === i); });
        dayImgs.forEach(function (im, k) { im.classList.toggle("on", k === i); });
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    steps.forEach(function (s) { io.observe(s); });
  } else steps.forEach(function (s) { s.classList.add("on"); });

  /* ---------- Lista de eventos com pré-visualização ---------- */
  var list = document.querySelector(".events-list");
  var prev = document.querySelector(".events-preview");
  if (list && prev && window.matchMedia("(hover: hover)").matches) {
    var pimg = prev.querySelector("img");
    list.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("mouseenter", function () { pimg.src = a.dataset.img; prev.classList.add("on"); });
      a.addEventListener("mouseleave", function () { prev.classList.remove("on"); });
    });
    list.addEventListener("mousemove", function (e) { prev.style.left = (e.clientX + 170) + "px"; prev.style.top = e.clientY + "px"; });
  }

  /* ---------- Subnavegação ativa (eventos) ---------- */
  var sublinks = document.querySelectorAll(".subnav a");
  if (sublinks.length && "IntersectionObserver" in window) {
    var map = {};
    sublinks.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { sublinks.forEach(function (a) { a.classList.remove("on"); }); var a = map[en.target.id]; if (a) { a.classList.add("on"); a.scrollIntoView({ block: "nearest", inline: "center" }); } }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) so.observe(s); });
  }

  /* ---------- Revelação discreta de imagens ---------- */
  var rv = document.querySelectorAll(".reveal");
  if (rv.length && "IntersectionObserver" in window) {
    var ro = new IntersectionObserver(function (entries) { entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); ro.unobserve(en.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
    rv.forEach(function (el) { ro.observe(el); });
  } else rv.forEach(function (el) { el.classList.add("in"); });

  /* ---------- Galeria: filtros e visualizador ---------- */
  var grid = document.querySelector(".masonry");
  var lb = document.querySelector(".lightbox");
  if (grid && lb) {
    var items = Array.prototype.slice.call(grid.querySelectorAll("button"));
    var filters = document.querySelectorAll(".filters button");
    var lbImg = lb.querySelector("img"), lbCount = lb.querySelector(".lb-count");
    var visible = items, cur = 0, lastFocus = null;
    filters.forEach(function (f) {
      f.addEventListener("click", function () {
        var c = f.dataset.filter;
        filters.forEach(function (x) { x.setAttribute("aria-pressed", x === f ? "true" : "false"); });
        items.forEach(function (it) { it.classList.toggle("hide", c !== "all" && it.dataset.cat !== c); });
        visible = items.filter(function (it) { return !it.classList.contains("hide"); });
      });
    });
    function open(i) {
      cur = (i + visible.length) % visible.length;
      var it = visible[cur];
      lbImg.src = it.dataset.full;
      lbImg.alt = it.querySelector("img").alt;
      lbCount.textContent = (cur + 1) + " / " + visible.length;
      [cur + 1, cur - 1].forEach(function (k) { var n = visible[(k + visible.length) % visible.length]; if (n) { var p = new Image(); p.src = n.dataset.full; } });
    }
    items.forEach(function (it) {
      it.addEventListener("click", function () {
        lastFocus = it; open(visible.indexOf(it));
        lb.classList.add("open"); document.body.style.overflow = "hidden";
        lb.querySelector(".lb-close").focus();
      });
    });
    function close() { lb.classList.remove("open"); document.body.style.overflow = ""; lbImg.removeAttribute("src"); if (lastFocus) lastFocus.focus(); }
    lb.querySelector(".lb-close").addEventListener("click", close);
    lb.querySelector(".lb-prev").addEventListener("click", function () { open(cur - 1); });
    lb.querySelector(".lb-next").addEventListener("click", function () { open(cur + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") open(cur - 1);
      else if (e.key === "ArrowRight") open(cur + 1);
      else if (e.key === "Tab") { // manter o foco dentro do visualizador
        var b = lb.querySelectorAll("button"), f0 = b[0], fl = b[b.length - 1];
        if (e.shiftKey && document.activeElement === f0) { e.preventDefault(); fl.focus(); }
        else if (!e.shiftKey && document.activeElement === fl) { e.preventDefault(); f0.focus(); }
      }
    });
    var sx = null;
    lb.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) open(cur + (dx < 0 ? 1 : -1)); sx = null; });
  }

  /* ---------- Ano no rodapé ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
