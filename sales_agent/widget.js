/* KitFire site assistant — Blaze v2 (S160, 2026-07-12)
   Marcus v2 pattern: live AI free-text via Supabase edge function kitfire-chat,
   graceful static fallback if the endpoint is down. Disclosed AI by design.
   Include before </body>: <script src="/sales_agent/widget.js" defer></script>
   v1 (S113) talked to /api/chat on Vercel — dead since the GitHub Pages move. */
(function () {
  var API = "https://obwjlqrzshdglrccsbtl.supabase.co/functions/v1/kitfire-chat";
  var OPEN = "I'm Blaze — KitFire's AI, not a canned chat script. Fair warning: you're testing the product right now. We build assistants like me for our clients. What's eating your week?";
  var FALLBACK = "Connection hiccup on my end — but the five-minute form right on this page reaches a human within 24 hours. Or email ops-techive@kitfire.ai.";
  var STARTERS = ["What does it cost?", "What do I actually get?", "Show me real work"];

  var CSS = "#kfw{position:fixed;bottom:22px;right:22px;z-index:9999;font-family:'Inter',-apple-system,'Segoe UI',sans-serif}" +
    "#kfw .bub{width:58px;height:58px;border-radius:50%;background:linear-gradient(135deg,#ff8a1e,#ff3d2e);border:none;cursor:pointer;box-shadow:0 6px 24px rgba(255,110,30,.45);font-size:26px;transition:transform .2s}" +
    "#kfw .bub:hover{transform:scale(1.08)}" +
    "#kfw .box{display:none;flex-direction:column;width:350px;max-width:92vw;height:480px;max-height:76vh;background:#111116;border:1px solid rgba(255,255,255,.12);border-radius:16px;overflow:hidden;box-shadow:0 12px 48px rgba(0,0,0,.55)}" +
    "#kfw.open .box{display:flex}#kfw.open .bub{display:none}" +
    "#kfw .hd{padding:12px 14px;background:#1b1b24;font-size:.85rem;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,.08)}" +
    "#kfw .hd b{color:#ff8a1e}#kfw .hd button{background:none;border:none;color:#a7a3ad;cursor:pointer;font-size:16px}" +
    "#kfw .log{flex:1;overflow-y:auto;padding:12px;font-size:.9rem;line-height:1.5;color:#f4f1ee}" +
    "#kfw .m{margin:0 0 10px;padding:9px 12px;border-radius:12px;max-width:88%;white-space:pre-wrap}" +
    "#kfw .ai{background:#1e1e26;color:#f4f1ee}#kfw .me{background:#2a1608;color:#ffd9b8;margin-left:auto}" +
    "#kfw .typing{color:#a7a3ad;font-style:italic}" +
    "#kfw .chips{display:flex;flex-wrap:wrap;gap:8px;padding:0 12px 10px}" +
    "#kfw .chip{border:1px solid rgba(255,138,30,.45);border-radius:999px;background:transparent;color:#ffb27a;font:inherit;font-size:.82rem;padding:7px 14px;cursor:pointer;transition:background .2s}" +
    "#kfw .chip:hover{background:rgba(255,138,30,.14)}" +
    "#kfw form{display:flex;border-top:1px solid rgba(255,255,255,.1)}" +
    "#kfw input{flex:1;background:#15151c;border:none;color:#f4f1ee;padding:12px;font-size:.9rem;outline:none;font-family:inherit}" +
    "#kfw form button{background:linear-gradient(135deg,#ff8a1e,#ff3d2e);border:none;color:#fff;font-weight:700;padding:0 16px;cursor:pointer;font-family:inherit}";

  var style = document.createElement("style"); style.textContent = CSS; document.head.appendChild(style);
  var el = document.createElement("div"); el.id = "kfw";
  el.innerHTML = '<button class="bub" aria-label="Chat with Blaze, KitFire\'s AI assistant">🔥</button>' +
    '<div class="box" role="dialog" aria-label="Blaze, KitFire\'s AI assistant">' +
    '<div class="hd"><span><b>Blaze</b> · KitFire\'s AI (yes, really)</span><button aria-label="Close chat">✕</button></div>' +
    '<div class="log"></div><div class="chips"></div>' +
    '<form><input placeholder="Type it straight — I can take it" maxlength="600" aria-label="Your message"/><button aria-label="Send">→</button></form></div>';
  document.body.appendChild(el);

  var log = el.querySelector(".log"), form = el.querySelector("form"),
      inp = el.querySelector("input"), chips = el.querySelector(".chips");
  var hist = [];

  function add(t, cls) {
    var d = document.createElement("div"); d.className = "m " + cls; d.textContent = t;
    log.appendChild(d); log.scrollTop = log.scrollHeight; return d;
  }

  function renderChips() {
    chips.innerHTML = "";
    STARTERS.forEach(function (q) {
      var b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = q;
      b.onclick = function () { send(q); };
      chips.appendChild(b);
    });
  }

  function send(v) {
    chips.innerHTML = "";
    add(v, "me"); hist.push({ role: "user", content: v });
    inp.value = ""; inp.disabled = true;
    var t = add("Blaze is typing…", "ai typing");
    var ctrl = ("AbortController" in window) ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 20000) : null;
    fetch(API, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: hist.slice(-12) }),
      signal: ctrl ? ctrl.signal : undefined
    })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) {
        if (timer) clearTimeout(timer);
        t.remove();
        if (!d.reply) throw new Error("empty");
        hist.push({ role: "assistant", content: d.reply });
        add(d.reply, "ai");
      })
      .catch(function () {
        if (timer) clearTimeout(timer);
        t.remove();
        add(FALLBACK, "ai");
      })
      .then(function () { inp.disabled = false; inp.focus(); });
  }

  el.querySelector(".bub").onclick = function () {
    el.classList.add("open");
    if (!hist.length) { add(OPEN, "ai"); hist.push({ role: "assistant", content: OPEN }); renderChips(); }
    inp.focus();
  };
  el.querySelector(".hd button").onclick = function () { el.classList.remove("open"); };
  form.onsubmit = function (e) {
    e.preventDefault(); var v = inp.value.trim(); if (!v) return;
    send(v);
  };
})();
