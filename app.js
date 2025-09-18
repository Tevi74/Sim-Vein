import { SimEngine } from './sim/engine.js';
import { Tutor } from './ia/tutor.js';

// pega os elementos do DOM
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
  tutor: document.getElementById('tutor')
};

// inicializa simulador e tutor
const sim = new SimEngine(els.canvas);
const tutor = new Tutor();

// atualiza relatório
function refreshReport() {
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

// eventos dos botões e inputs
els.tourniquetBtn.onclick = () => { sim.applyTourniquet(); refreshReport(); };
els.antisepsisBtn.onclick = () => { sim.doAntisepsis(); refreshReport(); };
els.resetBtn.onclick = () => { sim.reset(); refreshReport(); };
els.angleRange.oninput = (e) => { sim.setAngle(parseInt(e.target.value,10)); refreshReport(); };
els.gaugeSel.onchange = (e) => { sim.setGauge(parseInt(e.target.value,10)); refreshReport(); };
els.skinSel.onchange = (e) => { sim.setSkin(parseFloat(e.target.value)); refreshReport(); };
els.toneSel.onchange = (e) => { sim.setTone(parseFloat(e.target.value)); refreshReport(); };

// clique no canvas tenta a punção
els.canvas.addEventListener('click', (ev)=>{
  const rect = els.canvas.getBoundingClientRect();
  const x = (ev.clientX - rect.left) * (els.canvas.width/rect.width);
  const y = (ev.clientY - rect.top) * (els.canvas.height/rect.height);
  sim.tryPuncture({x,y});
  refreshReport();
});

// inicia
sim.reset();
refreshReport();
