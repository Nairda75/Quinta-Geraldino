/* Agendamento de visitas — calendário com os horários indicados pela Quinta.
   Dias úteis: 9h–17h (última visita às 16h). Fins de semana: 9h–12h (última às 11h).
   O pedido é enviado pelo WhatsApp (ou email) e a Quinta confirma manualmente. */
(function () {
  "use strict";
  var WA = (window.QG && window.QG.WA) || "351916604527";
  var EMAIL = "geral@jalmeida.pt";
  var MONTHS_AHEAD = 4;

  var T = {
    pt: { months: ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"],
          dows: ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"],
          days: ["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"],
          chosen: function (d, h) { return "Visita marcada para <strong>" + d + "</strong>, às <strong>" + h + "</strong>."; },
          noDay: "Ainda não escolheu o dia e a hora.",
          noSlot: function (d) { return "Escolha uma hora para " + d + "."; },
          errSlot: "Escolha o dia e a hora da visita no calendário.",
          errName: "Indique o seu nome.", errTel: "Indique um telemóvel válido para podermos confirmar.", errTipo: "Escolha o tipo de evento.",
          types: { casamento: "Casamento", batizado: "Batizado", aniversario: "Aniversário", empresa: "Evento de empresa", outro: "Outro" },
          msg: function (f) {
            return "Olá! Gostava de agendar uma visita à Quinta Geraldino.\n\n" +
              "📅 Visita: " + f.dia + " às " + f.hora + "\n" +
              "👤 Nome: " + f.nome + "\n" +
              "📞 Telemóvel: " + f.tel + "\n" +
              "🎉 Evento: " + f.tipo +
              (f.data ? "\n🗓 Data do evento: " + f.data : "") +
              (f.conv ? "\n👥 Convidados (aprox.): " + f.conv : "") +
              (f.msg ? "\n\n" + f.msg : "") +
              "\n\nAguardo confirmação. Obrigado!";
          },
          subject: "Pedido de visita à Quinta Geraldino" },
    en: { months: ["January","February","March","April","May","June","July","August","September","October","November","December"],
          dows: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
          days: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
          chosen: function (d, h) { return "Visit on <strong>" + d + "</strong> at <strong>" + h + "</strong>."; },
          noDay: "No day or time chosen yet.",
          noSlot: function (d) { return "Choose a time for " + d + "."; },
          errSlot: "Choose the day and time of your visit in the calendar.",
          errName: "Please enter your name.", errTel: "Please enter a valid phone number so we can confirm.", errTipo: "Choose the type of event.",
          types: { casamento: "Wedding", batizado: "Christening", aniversario: "Birthday", empresa: "Corporate event", outro: "Other" },
          msg: function (f) {
            return "Hello! I would like to book a visit to Quinta Geraldino.\n\n" +
              "📅 Visit: " + f.dia + " at " + f.hora + "\n" +
              "👤 Name: " + f.nome + "\n" +
              "📞 Phone: " + f.tel + "\n" +
              "🎉 Event: " + f.tipo +
              (f.data ? "\n🗓 Event date: " + f.data : "") +
              (f.conv ? "\n👥 Guests (approx.): " + f.conv : "") +
              (f.msg ? "\n\n" + f.msg : "") +
              "\n\nLooking forward to your confirmation. Thank you!";
          },
          subject: "Visit request – Quinta Geraldino" }
  };
  function L() { return T[(window.QG && window.QG.lang) === "en" ? "en" : "pt"]; }

  var cal = document.getElementById("cal");
  var monthEl = document.getElementById("cal-month");
  var prevBtn = document.getElementById("cal-prev");
  var nextBtn = document.getElementById("cal-next");
  var slotsEl = document.getElementById("slots");
  var slotsEmpty = document.getElementById("slots-empty");
  var summary = document.getElementById("summary");
  var form = document.getElementById("visit-form");
  var errEl = document.getElementById("form-error");
  var okEl = document.getElementById("form-ok");
  var mailAlt = document.getElementById("mail-alt");

  var today = new Date(); today.setHours(0, 0, 0, 0);
  var first = new Date(today); first.setDate(first.getDate() + 1); // a partir de amanhã
  var last = new Date(today.getFullYear(), today.getMonth() + MONTHS_AHEAD + 1, 0);
  var view = new Date(first.getFullYear(), first.getMonth(), 1);
  var sel = { date: null, time: null };

  function slotsFor(d) {
    var dow = d.getDay();
    var hours = (dow === 0 || dow === 6) ? [9, 10, 11] : [9, 10, 11, 12, 13, 14, 15, 16];
    return hours.map(function (h) { return (h < 10 ? "0" : "") + h + ":00"; });
  }
  function fmtDay(d) { var l = L(); return l.days[d.getDay()] + ", " + d.getDate() + (l === T.en ? " " : " de ") + l.months[d.getMonth()]; }

  function renderCal() {
    var l = L();
    monthEl.textContent = l.months[view.getMonth()] + " " + view.getFullYear();
    cal.innerHTML = "";
    l.dows.forEach(function (w) { var s = document.createElement("span"); s.className = "dow"; s.textContent = w; s.setAttribute("aria-hidden", "true"); cal.appendChild(s); });
    var offset = (view.getDay() + 6) % 7;
    for (var i = 0; i < offset; i++) cal.appendChild(document.createElement("span"));
    var dim = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    for (var d = 1; d <= dim; d++) {
      var date = new Date(view.getFullYear(), view.getMonth(), d);
      var b = document.createElement("button");
      b.type = "button"; b.textContent = d;
      b.setAttribute("aria-label", fmtDay(date));
      if (date < first || date > last) b.disabled = true;
      if (date.getTime() === today.getTime()) b.classList.add("today");
      var on = sel.date && date.getTime() === sel.date.getTime();
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.addEventListener("click", (function (dt) { return function () { sel.date = dt; sel.time = null; renderCal(); renderSlots(); renderSummary(); }; })(date));
      cal.appendChild(b);
    }
    prevBtn.disabled = view <= new Date(first.getFullYear(), first.getMonth(), 1);
    nextBtn.disabled = view >= new Date(last.getFullYear(), last.getMonth(), 1);
  }
  function renderSlots() {
    slotsEl.innerHTML = "";
    if (!sel.date) { slotsEmpty.hidden = false; return; }
    slotsEmpty.hidden = true;
    slotsFor(sel.date).forEach(function (t) {
      var b = document.createElement("button");
      b.type = "button"; b.textContent = t;
      b.setAttribute("aria-pressed", sel.time === t ? "true" : "false");
      b.addEventListener("click", function () { sel.time = t; renderSlots(); renderSummary(); errEl.hidden = true; });
      slotsEl.appendChild(b);
    });
  }
  function renderSummary() {
    var l = L();
    if (!sel.date) { summary.className = "summary empty"; summary.innerHTML = l.noDay; return; }
    if (!sel.time) { summary.className = "summary empty"; summary.innerHTML = l.noSlot(fmtDay(sel.date)); return; }
    summary.className = "summary"; summary.innerHTML = l.chosen(fmtDay(sel.date), sel.time);
  }
  prevBtn.addEventListener("click", function () { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); renderCal(); });
  nextBtn.addEventListener("click", function () { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); renderCal(); });

  function collect() {
    var l = L(), v = function (id) { return document.getElementById(id).value.trim(); };
    var tipo = v("f-tipo");
    return { dia: sel.date ? fmtDay(sel.date) : "", hora: sel.time || "", nome: v("f-nome"), tel: v("f-tel"),
             tipo: tipo ? l.types[tipo] : "", data: v("f-data"), conv: v("f-conv"), msg: v("f-msg"), tipoKey: tipo };
  }
  function validate(f) {
    var l = L();
    if (!sel.date || !sel.time) return [l.errSlot, cal];
    if (!f.nome) return [l.errName, document.getElementById("f-nome")];
    if (f.tel.replace(/\D/g, "").length < 9) return [l.errTel, document.getElementById("f-tel")];
    if (!f.tipoKey) return [l.errTipo, document.getElementById("f-tipo")];
    return null;
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = collect(), bad = validate(f);
    if (bad) { errEl.textContent = bad[0]; errEl.hidden = false; okEl.hidden = true; (bad[1].querySelector ? (bad[1].querySelector("button:not(:disabled)") || bad[1]) : bad[1]).focus(); return; }
    errEl.hidden = true;
    window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(L().msg(f)), "_blank", "noopener");
    okEl.hidden = false;
  });
  mailAlt.addEventListener("click", function (e) {
    var f = collect(), bad = validate(f);
    if (bad) { e.preventDefault(); errEl.textContent = bad[0]; errEl.hidden = false; return; }
    mailAlt.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(L().subject) + "&body=" + encodeURIComponent(L().msg(f));
  });

  // Tipo de evento vindo da página Eventos (ex.: visitas.html?evento=casamento)
  var q = new URLSearchParams(location.search).get("evento");
  if (q && document.querySelector('#f-tipo option[value="' + q + '"]')) document.getElementById("f-tipo").value = q;

  document.addEventListener("qg:lang", function () { renderCal(); renderSlots(); renderSummary(); });
  renderCal(); renderSlots(); renderSummary();
})();
