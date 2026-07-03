/* KitFire site agent widget — "The Negotiator" (Voss seat, deployed S113)
   Drop into the fable page before </body>: <script src="/sales_agent/widget.js" defer></script>
   Talks to /api/chat (api_chat.js). Disclosed AI by design. */
(function () {
  const CSS = `#kfw{position:fixed;bottom:22px;right:22px;z-index:9999;font-family:inherit}
#kfw .bub{width:58px;height:58px;border-radius:50%;background:linear-gradient(135deg,#ff6a00,#ff9e40);border:none;cursor:pointer;box-shadow:0 6px 24px rgba(255,106,0,.4);font-size:26px}
#kfw .box{display:none;flex-direction:column;width:340px;max-width:92vw;height:460px;background:#111;border:1px solid rgba(255,255,255,.14);border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.5)}
#kfw.open .box{display:flex}#kfw.open .bub{display:none}
#kfw .hd{padding:12px 14px;background:#1a1a1a;font-size:.85rem;display:flex;justify-content:space-between;align-items:center}
#kfw .hd b{color:#ff9e40}#kfw .hd button{background:none;border:none;color:#888;cursor:pointer;font-size:16px}
#kfw .log{flex:1;overflow-y:auto;padding:12px;font-size:.9rem;line-height:1.45}
#kfw .m{margin:0 0 10px;padding:9px 12px;border-radius:12px;max-width:88%;white-space:pre-wrap}
#kfw .ai{background:#1e1e1e;color:#eee}#kfw .me{background:#2a1608;color:#ffd9b8;margin-left:auto}
#kfw form{display:flex;border-top:1px solid rgba(255,255,255,.1)}
#kfw input{flex:1;background:#161616;border:none;color:#eee;padding:12px;font-size:.9rem;outline:none}
#kfw form button{background:#ff6a00;border:none;color:#1a0d05;font-weight:700;padding:0 16px;cursor:pointer}`;
  const OPEN = "I'm Blaze — KitFire's AI, not a chat script. Fair warning: you're testing the product right now. What's eating your week?";
  const style = document.createElement("style"); style.textContent = CSS; document.head.appendChild(style);
  const el = document.createElement("div"); el.id = "kfw";
  el.innerHTML = `<button class="bub" aria-label="Chat with Blaze, KitFire's AI guide">🔥</button>
<div class="box"><div class="hd"><span><b>Blaze</b> · KitFire's AI guide (yes, really)</span><button aria-label="close">✕</button></div>
<div class="log"></div><form><input placeholder="Type it straight — I can take it" maxlength="2000"/><button>→</button></form></div>`;
  document.body.appendChild(el);
  const log = el.querySelector(".log"), form = el.querySelector("form"), inp = el.querySelector("input");
  const hist = [];
  const add = (t, cls) => { const d = document.createElement("div"); d.className = "m " + cls; d.textContent = t; log.appendChild(d); log.scrollTop = log.scrollHeight; };
  el.querySelector(".bub").onclick = () => { el.classList.add("open"); if (!hist.length) { add(OPEN, "ai"); hist.push({ role: "assistant", content: OPEN }); } inp.focus(); };
  el.querySelector(".hd button").onclick = () => el.classList.remove("open");
  form.onsubmit = async (e) => {
    e.preventDefault(); const t = inp.value.trim(); if (!t) return;
    add(t, "me"); hist.push({ role: "user", content: t }); inp.value = ""; inp.disabled = true;
    try {
      const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: hist }) });
      const { reply } = await r.json();
      add(reply || "…", "ai"); hist.push({ role: "assistant", content: reply || "…" });
    } catch {
      add("Connection hiccup — even we have bad days (we publish ours). ceo@kitfire.ai works too.", "ai");
    }
    inp.disabled = false; inp.focus();
  };
})();
