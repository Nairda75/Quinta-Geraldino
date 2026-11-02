/* Quinta Geraldino — animações (GSAP + ScrollTrigger + Lenis no computador).
   Tudo respeita "reduzir movimento" do sistema. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var body = document.body;

  /* ---------- Transições entre páginas (alternativa sem View Transitions) ---------- */
  var veil = document.createElement("div"); veil.className = "page-veil"; body.appendChild(veil);
  var nativeVT = "onpagereveal" in window;
  if (!nativeVT && !reduce) {
    body.classList.add("entering");
    requestAnimationFrame(function () { requestAnimationFrame(function () { body.classList.remove("entering"); }); });
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
      var url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname || !/\.html$|\/$/.test(url.pathname)) return;
      e.preventDefault(); body.classList.add("leaving");
      setTimeout(function () { location.href = a.href; }, 320);
    });
    window.addEventListener("pageshow", function (e) { if (e.persisted) body.classList.remove("leaving"); });
  }

  /* ---------- Cabeçalho: esconde ao descer, mostra ao subir; barra móvel ---------- */
  var header = document.querySelector(".site-header");
  var dock = document.querySelector(".dock");
  var aerial = document.querySelector(".aerial");
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY, dy = y - lastY;
    var heroEnd = aerial ? aerial.offsetTop + aerial.offsetHeight - window.innerHeight * 0.6 : 120;
    var past = y > heroEnd;
    if (header) {
      if (y < 80 || dy < -4) header.classList.remove("away");
      else if (dy > 6 && y > 300 && !document.querySelector(".mobile-menu.open")) header.classList.add("away");
      if (aerial) header.classList.toggle("solid", past);
    }
    body.classList.toggle("past-hero", past);
    if (dock) dock.classList.toggle("show", aerial ? past : y > 160);
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---------- Botão grande: brilho que segue o dedo/rato e efeito magnético ---------- */
  document.querySelectorAll(".btn--big").forEach(function (b) {
    b.addEventListener("pointermove", function (e) {
      var r = b.getBoundingClientRect();
      b.style.setProperty("--mx", (e.clientX - r.left) + "px"); b.style.setProperty("--my", (e.clientY - r.top) + "px");
      if (finePointer && !reduce && window.gsap) gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.18, y: (e.clientY - r.top - r.height / 2) * 0.3, duration: 0.4, ease: "power3.out" });
    });
    b.addEventListener("pointerleave", function () { if (window.gsap) gsap.to(b, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, .4)" }); });
  });

  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add("js-anim");

  /* ---------- Scroll suave no computador ---------- */
  if (finePointer && window.Lenis) {
    var lenis = new Lenis({ duration: 1.15, smoothWheel: true, anchors: { offset: -80 } });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- Títulos: palavras sobem uma a uma ---------- */
  function split(el) {
    if (el.dataset.split === "1") return;
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (t) {
      var frag = document.createDocumentFragment();
      t.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var w = document.createElement("span"); w.className = "w";
        var i = document.createElement("span"); i.className = "wi"; i.textContent = part;
        w.appendChild(i); frag.appendChild(w);
      });
      t.parentNode.replaceChild(frag, t);
    });
    el.dataset.split = "1";
  }
  var heads = gsap.utils.toArray("main h1, main h2, .final-cta h2").filter(function (h) { return !h.closest(".aerial") || h.closest(".aerial-intro"); });
  heads.forEach(function (h) {
    split(h);
    var inHero = !!h.closest(".aerial-intro, .page-hero");
    gsap.from(h.querySelectorAll(".wi"), {
      yPercent: 115, rotate: 4, duration: 1.1, ease: "expo.out", stagger: 0.06, delay: inHero ? 0.15 : 0,
      scrollTrigger: inHero ? null : { trigger: h, start: "top 88%", once: true }
    });
  });
  // ao mudar de idioma o texto é reposto: volta a dividir sem animar
  document.addEventListener("qg:lang", function () {
    heads.forEach(function (h) { h.dataset.split = "0"; split(h); gsap.set(h.querySelectorAll(".wi"), { yPercent: 0, rotate: 0 }); });
  });

  /* ---------- Entrada do topo das páginas interiores e da vista aérea ---------- */
  gsap.from(".page-hero .lead, .page-hero .crumb, .aerial-intro .lead, .aerial-intro .btn", { y: 24, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.12, delay: 0.45 });
  gsap.from(".site-header .wrap > *", { y: -20, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.08, delay: 0.1 });

  /* ---------- Imagens: abrem como uma cortina e assentam ---------- */
  gsap.utils.toArray(".intro figure img, .space .imgs img, .evt .pics img, .extras img, .reveillon .pics img, .day-step img.m, .where .real-map").forEach(function (img, i) {
    gsap.fromTo(img, { clipPath: "inset(14% 10% 14% 10% round 4px)", scale: 1.12, opacity: 0.4 },
      { clipPath: "inset(0% 0% 0% 0% round 2px)", scale: 1, opacity: 1, duration: 1.4, ease: "expo.out",
        scrollTrigger: { trigger: img, start: "top 90%", once: true } });
  });

  /* ---------- Paralaxe suave em imagens grandes e faixas ---------- */
  gsap.utils.toArray(".band > img, .cinema .cin-slide img, .cinema video").forEach(function (el) {
    gsap.fromTo(el, { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
  });
  gsap.utils.toArray(".evt .pics img:nth-child(2), .space .imgs img:nth-child(2)").forEach(function (el) {
    gsap.to(el, { yPercent: -12, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
  });

  /* ---------- Textos e listas: entram em cascata ---------- */
  var groups = [".lead:not(.page-hero .lead):not(.aerial-intro .lead)", ".intro p:not(.lead)", ".space ul", ".evt ul", ".extras > div", ".steps li", ".contact-list li", ".events-list li", ".facts .fact", ".hours", ".trust > *", ".review", ".panel", ".filters", ".subnav a", ".final-cta p", ".final-cta .btn--big", ".footer-top > div", ".tag", ".day-step p"];
  groups.forEach(function (sel) {
    ScrollTrigger.batch(sel, {
      start: "top 92%", once: true,
      onEnter: function (els) { gsap.fromTo(els, { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", stagger: 0.08, overwrite: true }); }
    });
  });

  /* ---------- Contadores (500 convidados, 1 evento, 3 espaços) ---------- */
  gsap.utils.toArray("[data-count]").forEach(function (el) {
    var end = +el.dataset.count, o = { v: 0 };
    gsap.to(o, { v: end, duration: end > 50 ? 2.2 : 1.2, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 90%", once: true },
      onUpdate: function () { el.textContent = Math.round(o.v); } });
  });

  /* ---------- Galeria: fotografias entram em cascata ---------- */
  ScrollTrigger.batch(".masonry button", {
    start: "top 95%", once: true,
    onEnter: function (els) { gsap.fromTo(els, { y: 40, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "power3.out", stagger: 0.06 }); }
  });

  /* ---------- Faixa final: fundo respira ---------- */
  gsap.utils.toArray(".final-cta").forEach(function (s) {
    gsap.fromTo(s, { backgroundColor: "#343e2f" }, { backgroundColor: "#283024", ease: "none", scrollTrigger: { trigger: s, start: "top bottom", end: "center center", scrub: true } });
  });

  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
