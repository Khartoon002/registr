"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type BotSettings = {
  themeDefault?: "original"|"whatsapp"|"facebook"|"tiktok"|"youtube"|"snapchat"|"instagram"|"telegram";
  lockUntilQuickForm?: boolean;
  quickForm?: {
    title?: string;
    submitText?: string;
    fields?: { key:string; label:string; type:"text"|"tel"|"email"; required?:boolean }[];
  };
  contactsVCF?: { name:string; phone:string }[];
  copy?: { intro?:string; countryPrompt?:string; paymentNote?:string };
  countryBanks?: Record<string,{ label:string; bank:string; number:string; name:string }>;
};

export default function ChatBotClient({
  bot, flow
}:{
  bot: { id:string; title:string; slug:string; welcomeMessage:string; settings:BotSettings|null };
  flow: any[];
}) {
  const S = bot.settings || {};
  const [locked, setLocked] = useState(!!S.lockUntilQuickForm);
  const [msgs, setMsgs] = useState<{ id:string; role:'bot'|'user'; html:string }[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [remaining, setRemaining] = useState<number|null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMsgs([
      { id: crypto.randomUUID(), role:'bot', html:`<b>${escapeHTML(bot.title)}</b>` },
      { id: crypto.randomUUID(), role:'bot', html: escapeHTML(bot.welcomeMessage || S.copy?.intro || "Welcome!") },
      ...(S.lockUntilQuickForm ? [{ id: crypto.randomUUID(), role: "bot" as const, html: QuickFormHTML(S.quickForm) }] : [])
    ]);
  }, []); // eslint-disable-line

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior:'smooth' });
  }, [msgs]);

  function pushBot(html:string){ setMsgs(m => [...m, { id:crypto.randomUUID(), role:'bot', html }]); }
  function pushUser(html:string){ setMsgs(m => [...m, { id:crypto.randomUUID(), role:'user', html }]); }

  function typingThen(cb:()=>void, ms=900){
    setBusy(true);
    const id = crypto.randomUUID();
    setMsgs(m=>[...m, { id, role:'bot', html:'<em>Typing…</em>' }]);
    setTimeout(()=>{ setMsgs(m=>m.filter(x=>x.id!==id)); setBusy(false); cb(); }, ms);
  }

  // delegate clicks/submit inside chat
  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;

    function onClick(ev: MouseEvent){
      const t = ev.target as HTMLElement;
      if (t.closest("[data-save-vcf]")) {
        saveVCF(S.contactsVCF || []);
        typingThen(()=> pushBot(Card("Next Step", `<p>Tell me your <b>country</b> to get payment details.</p>`)));
      }
      const cbtn = t.closest("button[data-country]") as HTMLButtonElement | null;
      if (cbtn){
        const c = (cbtn.dataset.country || "").toLowerCase();
        pushUser(cbtn.dataset.country || "");
        const acct = findCountry(S.countryBanks||{}, c);
        typingThen(()=>{
          if (acct) {
            pushBot(BankCard(acct, S.copy?.paymentNote));
            startCountdown();
          } else {
            pushBot(Card("Country Not Found", `<p>Please reply with your country name.</p>`));
          }
        });
      }
    }

    function onSubmit(ev: Event){
      const form = ev.target as HTMLFormElement;
      if (!form || form.id !== "quickForm") return;
      ev.preventDefault();
      setLocked(false);
      form.remove();
      typingThen(()=>{
        pushBot(Card("Save our contacts", `<button data-save-vcf class="px-3 py-2 rounded-lg bg-emerald-500 text-black font-semibold">Click to Save</button>`));
      });
    }

    el.addEventListener("click", onClick);
    el.addEventListener("submit", onSubmit as any);
    return () => {
      el.removeEventListener("click", onClick);
      el.removeEventListener("submit", onSubmit as any);
    };
  }, [S]);

  function onSend(e: React.FormEvent){
    e.preventDefault();
    if (!input.trim() || busy || locked) return;
    const text = input.trim();
    setInput("");
    pushUser(escapeHTML(text));

    typingThen(()=>{
      const acct = findCountry(S.countryBanks||{}, text.toLowerCase());
      if (acct) {
        pushBot(BankCard(acct, S.copy?.paymentNote));
        startCountdown();
        return;
      }
      // fallback: show steps from flow (very simple)
      if (flow && flow.length){
        for (const step of flow){
          if (step.type === "botText") pushBot(step.html);
          if (step.type === "card")   pushBot(Card(step.title, step.html));
        }
      } else {
        pushBot(Card("Help", `<p>Say: <i>Nigeria</i>, <i>Ghana</i>… to get payment details.</p>`));
      }
    });
  }

  function startCountdown(){
    const end = Date.now() + 20*60*1000;
    const int = setInterval(()=>{
      const left = end - Date.now();
      if (left <= 0){ clearInterval(int); setRemaining(0); }
      else setRemaining(left);
    }, 1000);
  }

  return (
    <div className="min-h-screen text-white bg-gradient-to-b from-neutral-900 to-neutral-950">
      <header className="sticky top-0 z-10 backdrop-blur border-b border-white/10 bg-black/30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 shadow-lg" />
          <div className="font-bold">{bot.title}</div>
          <a className="ml-auto underline" href={`/bots/${bot.slug}`}>Permalink</a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4">
        <div ref={chatRef} className="py-6 space-y-3 min-h-[calc(100vh-180px)]" aria-live="polite">
          {msgs.map(m=>(
            <div key={m.id} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}>
              {m.role==='bot' && <div className="w-8 h-8 rounded-lg bg-neutral-900/70 mr-2" />}
              <div
                className={`max-w-[90%] rounded-2xl border shadow-xl text-sm leading-relaxed px-3 py-2 ${m.role==='bot'?'bg-white/10 border-white/10':'bg-emerald-500/20 border-emerald-400/30'}`}
                dangerouslySetInnerHTML={{ __html: m.html }}
              />
            </div>
          ))}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-black/50 backdrop-blur border-t border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <form onSubmit={onSend} className="flex gap-2">
            <input
              value={input}
              onChange={e=>setInput(e.target.value)}
              placeholder={locked ? "Fill the form above…" : (busy ? "Typing…" : "Type and press Enter…")}
              disabled={locked || busy}
              className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none placeholder:text-white/40 disabled:opacity-60"
            />
            <button className="px-4 py-2 rounded-xl font-semibold bg-emerald-500 text-black disabled:opacity-60" disabled={locked||busy||!input.trim()}>
              Send
            </button>
          </form>
        </div>
      </footer>

      {remaining !== null && (
        <div className="fixed left-4 top-1/2 -translate-y-1/2 bg-black/70 backdrop-blur border border-white/10 rounded-xl shadow-2xl p-3 w-44">
          <div className="font-semibold">Time left</div>
          <div className="text-lg tabular-nums mt-1">{fmtMMSS(Math.max(0, remaining))}</div>
          <div className="text-xs opacity-70 mt-1">Complete payment to proceed</div>
        </div>
      )}
    </div>
  );
}

/* ===== helpers ===== */

function QuickFormHTML(qf: BotSettings["quickForm"]){
  const fields = qf?.fields?.length ? qf.fields : [
    { key:'fullName', label:'Full Name', type:'text', required:true },
    { key:'phone', label:'Phone', type:'tel', required:true },
    { key:'gmail', label:'Gmail', type:'email', required:false }
  ];
  return `<div class="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
    <div class="px-3 py-2 font-semibold bg-white/10">${escapeHTML(qf?.title || 'Quick Start')}</div>
    <div class="px-3 py-3">
      <form id="quickForm" class="grid gap-3">
        ${fields.map(f => `
          <div>
            <label class="text-sm font-semibold">${escapeHTML(f.label)}</label>
            <input name="${escapeHTML(f.key)}" type="${escapeHTML(f.type)}" class="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none" ${f.required?'required':''}/>
          </div>
        `).join('')}
        <button class="mt-2 px-3 py-2 rounded-lg bg-emerald-500 text-black font-semibold">${escapeHTML(qf?.submitText || 'Continue')}</button>
      </form>
    </div>
  </div>`;
}

function BankCard(acct: { label:string; bank:string; number:string; name:string }, note?:string){
  return Card(`Payment — ${escapeHTML(acct.label)}`, `
    <ul class="space-y-1 opacity-90">
      <li><b>Account Name:</b> ${escapeHTML(acct.name)}</li>
      <li><b>Bank:</b> ${escapeHTML(acct.bank)}</li>
      <li><b>Account Number:</b> <code class="font-semibold">${escapeHTML(acct.number)}</code></li>
    </ul>
    ${note ? `<p class="mt-2 opacity-80">${escapeHTML(note)}</p>`:''}
    <div class="mt-3 flex gap-2 flex-wrap">
      ${['Nigeria','Ghana','Kenya','South Africa'].map(c=>`<button data-country="${c}" class="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">${c}</button>`).join('')}
    </div>
  `);
}

function Card(title:string, bodyHTML:string){
  return `<div class="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
    <div class="px-3 py-2 font-semibold bg-white/10">${escapeHTML(title)}</div>
    <div class="px-3 py-3">${bodyHTML}</div>
  </div>`;
}

function saveVCF(list: {name:string; phone:string}[]){
  if (!list.length) return alert("No contacts configured.");
  const parts: string[] = [];
  for (const c of list){
    parts.push('BEGIN:VCARD','VERSION:3.0',`N:${c.name};;;;`,`FN:${c.name}`,`TEL;TYPE=CELL:${c.phone}`,'END:VCARD');
  }
  const vcf = parts.join('\n');
  const blob = new Blob([vcf], { type:'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'magnus-contacts.vcf';
  document.body.appendChild(a); a.click();
  setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 1200);
}

function findCountry(map: NonNullable<BotSettings["countryBanks"]>, raw:string){
  const key = raw.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu,"").replace(/[^a-z]/g,"");
  for (const k of Object.keys(map||{})){
    if (key.includes(k)) return map[k];
  }
  return null;
}

function escapeHTML(s:string){ return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]!)); }
function fmtMMSS(ms:number){ const s=Math.floor(ms/1000); const mm=String(Math.floor(s/60)).padStart(2,'0'); const ss=String(s%60).padStart(2,'0'); return `${mm}:${ss}`; }
