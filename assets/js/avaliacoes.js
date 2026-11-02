/* Avaliações: mostra as avaliações aprovadas (assets/data/avaliacoes.json)
   e envia novas avaliações com fotografias pelo Netlify Forms (moderadas antes de publicar). */
(function () {
  "use strict";
  var list = document.getElementById("reviews"), empty = document.getElementById("reviews-empty");
  var star = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8L12 2.8Z"/></svg>';
  var data = [];
  function esc(s) { return String(s || "").replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function render() {
    var en = window.QG && window.QG.lang === "en";
    list.innerHTML = "";
    empty.hidden = data.length > 0;
    data.forEach(function (r) {
      var el = document.createElement("article"); el.className = "review";
      var stars = ""; for (var i = 0; i < 5; i++) stars += '<span style="opacity:' + (i < r.estrelas ? 1 : 0.25) + '">' + star + "</span>";
      var pics = (r.fotos || []).map(function (f) { return '<img src="' + esc(f) + '" alt="' + esc((en ? "Photo by " : "Fotografia de ") + r.nome) + '" loading="lazy">'; }).join("");
      el.innerHTML = '<header><div><div class="who">' + esc(r.nome) + '</div><div class="meta">' + esc(en && r.evento_en ? r.evento_en : r.evento) + (r.quando ? ", " + esc(r.quando) : "") + '</div></div><div class="stars" aria-label="' + r.estrelas + ' / 5">' + stars + "</div></header>" +
        "<p>" + esc(en && r.texto_en ? r.texto_en : r.texto) + "</p>" +
        (pics ? '<div class="pics">' + pics + "</div>" : "") +
        (r.resposta ? '<div class="reply"><strong>' + (en ? "Reply from the Quinta" : "Resposta da Quinta") + ":</strong> " + esc(en && r.resposta_en ? r.resposta_en : r.resposta) + "</div>" : "");
      list.appendChild(el);
    });
  }
  fetch("assets/data/avaliacoes.json", { cache: "no-cache" })
    .then(function (r) { return r.ok ? r.json() : []; })
    .then(function (d) { data = Array.isArray(d) ? d.filter(function (r) { return r && r.nome && r.texto; }) : []; render(); })
    .catch(function () { data = []; render(); });
  document.addEventListener("qg:lang", render);

  /* ---------- Formulário ---------- */
  var form = document.getElementById("review-form"); if (!form) return;
  var input = document.getElementById("a-fotos"), previews = document.getElementById("previews"), upload = document.getElementById("upload");
  var errEl = document.getElementById("review-error"), done = document.getElementById("review-done");
  var photos = [];
  function T(pt, en) { return window.QG && window.QG.lang === "en" ? en : pt; }

  // reduz cada fotografia para ~1600 px antes de enviar (mais rápido no telemóvel)
  function shrink(file) {
    return new Promise(function (resolve) {
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        var max = 1600, w = img.naturalWidth, h = img.naturalHeight, k = Math.min(1, max / Math.max(w, h));
        var c = document.createElement("canvas"); c.width = Math.round(w * k); c.height = Math.round(h * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        c.toBlob(function (b) { URL.revokeObjectURL(url); resolve(b ? new File([b], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" }) : file); }, "image/jpeg", 0.82);
      };
      img.onerror = function () { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    });
  }
  function addFiles(files) {
    var slots = 3 - photos.length;
    Array.prototype.slice.call(files, 0, slots).forEach(function (f) {
      if (!/^image\//.test(f.type)) return;
      shrink(f).then(function (s) {
        if (!s) return; photos.push(s);
        var im = document.createElement("img"); im.alt = ""; im.src = URL.createObjectURL(s); previews.appendChild(im);
      });
    });
  }
  input.addEventListener("change", function () { addFiles(input.files); input.value = ""; });
  ["dragenter", "dragover"].forEach(function (ev) { upload.addEventListener(ev, function (e) { e.preventDefault(); upload.classList.add("drag"); }); });
  ["dragleave", "drop"].forEach(function (ev) { upload.addEventListener(ev, function (e) { e.preventDefault(); upload.classList.remove("drag"); }); });
  upload.addEventListener("drop", function (e) { addFiles(e.dataTransfer.files); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var fd = new FormData(form), bad = null;
    if (!fd.get("estrelas")) bad = T("Escolha uma nota de 1 a 5 estrelas.", "Choose a rating from 1 to 5 stars.");
    else if (!String(fd.get("nome")).trim()) bad = T("Indique o nome que deve aparecer.", "Enter the name that should appear.");
    else if (!/^\S+@\S+\.\S+$/.test(String(fd.get("email")))) bad = T("Indique um email válido. Não é publicado.", "Enter a valid email. It is not published.");
    else if (!fd.get("evento")) bad = T("Escolha o tipo de evento.", "Choose the type of event.");
    else if (String(fd.get("comentario")).trim().length < 20) bad = T("Conte-nos um pouco mais (pelo menos 20 caracteres).", "Tell us a little more (at least 20 characters).");
    else if (!fd.get("autorizacao")) bad = T("Para publicar precisamos da sua autorização.", "We need your permission to publish.");
    if (bad) { errEl.textContent = bad; errEl.hidden = false; return; }
    errEl.hidden = true;
    ["foto1", "foto2", "foto3"].forEach(function (k, i) { fd.delete(k); if (photos[i]) fd.append(k, photos[i]); });
    var btn = form.querySelector("button[type=submit]"); btn.disabled = true; btn.style.opacity = ".6";
    fetch("/", { method: "POST", body: fd })
      .then(function (r) { if (!r.ok) throw new Error(r.status); form.hidden = true; done.hidden = false; done.scrollIntoView({ behavior: "smooth", block: "center" }); })
      .catch(function () { errEl.textContent = T("Não foi possível enviar agora. Verifique a ligação à internet e tente outra vez.", "We couldn't send it right now. Check your internet connection and try again."); errEl.hidden = false; })
      .then(function () { btn.disabled = false; btn.style.opacity = ""; });
  });
  if (/enviado=1/.test(location.search)) { form.hidden = true; done.hidden = false; }
})();
