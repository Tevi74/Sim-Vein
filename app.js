import { SimEngine } from './sim/engine.js';
import { Tutor } from './ia/tutor.js';

const els = {
  canvas: document.getElementById('simCanvas'),
  skinSel: document.getElementById('skinSel'),
  toneSel: document.getElementById('toneSel'),
  gaugeSel: document.getElementById('gaugeSel'),
  angleRange: document.getElementById('angleRange'),
  angleOut: document.getElementById('angleOut'),
  tourniquetBtn: document.getElementById('tourniquetBtn'),
  antisepsisBtn: document.getElementById('antisepsisBtn'),
  resetBtn: document.getElementById('resetBtn'),
  report: document.getElementById('report'),
  tutor: document.getElementById('tutor')
};

const sim = new SimEngine(els.canvas);
const tutor = new Tutor();

const RECO_MIN = 10, RECO_MAX = 25;

function refreshAngleOut(v){
  els.angleOut.textContent = `${v}° — 0° = paralelo à pele, 90° = perpendicular. Recomendado: ${RECO_MIN}°–${RECO_MAX}°.`;
}
function refreshReport(){
  const r = sim.getReport();
  els.report.innerHTML = `
    <div><b>Garrote:</b> ${r.tourniquet ? '<span class="badge good">ok</span>' : '<span class="badge warn">faltando</span>'}</div>
    <div><b>Antissepsia:</b> ${r.antisepsis ? '<span class="badge good">ok</span>' : '<span class="badge warn">faltando</span>'}</div>
    <div><b>Ângulo:</b> ${r.angle}°</div>
    <div><b>Cateter:</b> ${r.gauge}G</div>
    <div><b>Tentativas:</b> ${r.attempts}</div>
    <div><b>Status:</b> ${r.status}</div>
    <hr/><div><b>Pontuação:</b> ${r.score}/100</div>
  `;
  els.tutor.innerHTML = tutor.advise(r);
}

// UI bindings
els.tourniquetBtn.onclick = () => { sim.applyTourniquet(); refreshReport(); };
els.antisepsisBtn.onclick = () => { sim.doAntisepsis(); refreshReport(); };
els.resetBtn.onclick = () => { sim.reset(); refreshReport(); refreshAngleOut(sim.state.angle); };
els.angleRange.oninput = (e) => { const v = parseInt(e.target.value,10); sim.setAngle(v); refreshAngleOut(v); refreshReport(); };
els.gaugeSel.onchange = (e) => { sim.setGauge(parseInt(e.target.value,10)); refreshReport(); };
els.skinSel.onchange = (e) => { sim.setSkin(parseFloat(e.target.value)); refreshReport(); };
els.toneSel.onchange = (e) => { sim.setTone(parseFloat(e.target.value)); refreshReport(); };

// canvas click → tentativa
els.canvas.addEventListener('click', (ev)=>{
  const rect = els.canvas.getBoundingClientRect();
  const x = (ev.clientX - rect.left) * (els.canvas.width/rect.width);
  const y = (ev.clientY - rect.top) * (els.canvas.height/rect.height);
  sim.tryPuncture({x,y});
  refreshReport();
});

// init
sim.reset();
refreshReport();
refreshAngleOut(sim.state.angle);

  
