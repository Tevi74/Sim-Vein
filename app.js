import { SimEngine } from './sim/engine.js';
import { Tutor } from './ia/tutor.js';

const els = {
  canvas: document.getElementById('simCanvas'),
  skinSel: document.getElementById('skinSel'),
  toneSel: document.getElementById('toneSel'),
  gaugeSel: document.getElementById('gaugeSel'),
  angleRange: document.getElementById('angleRange'),
  tourniquetBtn: document.getElementById('tourniquetBtn'),
  antisepsisBtn: document.getElementById('antisepsisBtn'),
  resetBtn: document.getElementById('resetBtn'),
  report: document.getElementById('report'),
  tutor: document.getElementById('tutor'),
  chatFab: document.getElementById('chatFab'),
  chatPanel: document.getElementById('chatPanel'),
  chatClose: document.getElementById('chatClose'),
  chatMessages: document.getElementById('chatMessages'),
  chatForm: document.getElementById('chatForm'),
  chatInput: document.getElementById('chatInput'),
  installBtn: document.getElementById('installBtn')
};

const sim = new SimEngine(els.canvas);
const tutor = new Tutor();

function refreshReport(){
  const r = sim.getReport();
  els.report.innerHTML = `
    <div><b>Garrote:</b> ${r.tourniquet ? '<span class="badge good">ok</span>' : '<span class="badge warn">faltando</span>'}</div>
    <div><b>Antissepsia:</b> ${r.antisepsis ? '<span class="badge good">ok</span>' : '<span class="badge warn">faltando</span>'}</div>
    <div><b>Ângulo:</b> ${r.angle}°</div>
    <div><b>Cateter:</b> ${r.gauge}G</div>
    <div><b>Tentativas:</b> ${r.attempts}</div>
    <div><b>Status:</b> ${r.status}</div>
    <hr/>
    <div><b>Pontuação:</b> ${r.score}/100</div>
  `;
  els.tutor.innerHTML = tutor.advise(r);
}

// Controles
els.tourniquetBtn.onclick = () => { sim.applyTourniquet(); refreshReport(); };
els.antisepsisBtn.onclick = () => { sim.doAntisepsis(); refreshReport(); };
els.resetBtn.onclick = () => { sim.reset(); refreshReport(); };
els.angleRange.oninput = (e) => { sim.setAngle(parseInt(e.target.value,10)); refreshReport(); };
els.gaugeSel.onchange = (e) => { sim.setGauge(parseInt(e.target.value,10)); refreshReport(); };
els.skinSel.onchange = (e) => { sim.setSkin(parseFloat(e.target.value)); refreshReport(); };
els.toneSel.onchange = (e) => { sim.setTone(parseFloat(e.target.value)); refreshReport(); };

// Canvas → tentativa
els.canvas.addEventListener('click', (ev)=>{
  const rect = els.canvas.getBoundingClientRect();
  const x = (ev.clientX - rect.left) * (els.canvas.width/rect.width);
  const y = (ev.clientY - rect.top) * (els.canvas.height/rect.height);
  sim.tryPuncture({x,y});
  refreshReport();
});

// ===== Chat Tutor (100% offline) =====
function pushMsg(text, from='bot'){
  const el = document.createElement('div');
  el.className = `chat-msg ${from}`;
  el.innerText = text;
  els.chatMessages.appendChild(el);
  els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
}

function openChat(){
  els.chatPanel.classList.add('open');
  if (!els.chatMessages.dataset.greeted){
    pushMsg('Olá! Sou o Tutor do Sim-Vein. Posso ajudar com técnica, assepsia, ângulo, seleção de cateter e intercorrências. Faça sua pergunta.', 'bot');
    els.chatMessages.dataset.greeted = '1';
  }
  els.chatInput.focus();
}
function closeChat(){ els.chatPanel.classList.remove('open'); }

els.chatFab.onclick = openChat;
els.chatClose.onclick = closeChat;

els.chatForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const text = (els.chatInput.value || '').trim();
  if (!text) return;
  pushMsg(text, 'user');
  els.chatInput.value = '';

  // resposta baseada no relatório atual + intenção por palavras-chave
  const r = sim.getReport();
  const reply = tutor.chatReply(text, r);
  pushMsg(reply, 'bot');
});

// Init
sim.reset();
refreshReport();
