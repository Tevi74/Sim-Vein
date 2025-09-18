import { SimEngine } from './sim/engine.js';
import { Tutor } from './ia/tutor.js';

const els = {
  canvas: document.getElementById('simCanvas'),
  profileSel: document.getElementById('profileSel'),
  skinSel: document.getElementById('skinSel'),
  toneSel: document.getElementById('toneSel'),
  gaugeSel: document.getElementById('gaugeSel'),
  angleRange: document.getElementById('angleRange'),
  angleOut: document.getElementById('angleOut'),
  tourniquetBtn: document.getElementById('tourniquetBtn'),
  antisepsisBtn: document.getElementById('antisepsisBtn'),
  resetBtn: document.getElementById('resetBtn'),
  report: document.getElementById('report'),
  tutor: document.getElementById('tutor'),
  examSel: document.getElementById('examSel'),
  tubeSel: document.getElementById('tubeSel'),
  tubeInfo: document.getElementById('tubeInfo'),
  orderList: document.getElementById('orderList'),
};

// ===== Dados dos tubos e exames =====
const ORDER = ['hemocultura','azul','vermelho/amarelo','verde','roxo','cinza'];
const TUBES = {
  'hemocultura': { nome:'Hemocultura', cor:'sem cor/tampa própria', aditivo:'Meio de cultura', usos:'Análise microbiológica', obs:'Sempre primeiro', key:'hemocultura' },
  'azul': { nome:'Azul claro', cor:'Azul claro', aditivo:'Citrato de sódio', usos:'TP, TTPa (coagulação)', key:'azul' },
  'vermelho': { nome:'Vermelho', cor:'Vermelho', aditivo:'Ativador de coágulo', usos:'Soro: bioquímica/sorologia', key:'vermelho' },
  'amarelo': { nome:'Amarelo', cor:'Amarelo', aditivo:'Ativador + gel separador', usos:'Soro: bioquímica/sorologia', key:'amarelo' },
  'verde': { nome:'Verde', cor:'Verde', aditivo:'Heparina', usos:'Bioquímica específica (plasma)', key:'verde' },
  'roxo': { nome:'Roxo', cor:'Roxo', aditivo:'EDTA', usos:'Hemograma, HbA1c', key:'roxo' },
  'cinza': { nome:'Cinza', cor:'Cinza', aditivo:'Fluoreto + EDTA', usos:'Glicose, lactato', key:'cinza' }
};
const EXAMS = {
  glicose:       { nome:'Glicose', recomendado:'cinza' },
  hemograma:     { nome:'Hemograma', recomendado:'roxo' },
  coagulacao:    { nome:'Coagulação (TP/TTPa)', recomendado:'azul' },
  bioquimica:    { nome:'Bioquímica', recomendado:'vermelho/amarelo' },
  hemocultura:   { nome:'Hemocultura', recomendado:'hemocultura' }
};

// Montar lista de ordem de coleta
function renderOrder() {
  els.orderList.innerHTML = '';
  ORDER.forEach(k => {
    const li = document.createElement('li');
    li.textContent = k === 'vermelho/amarelo'
      ? 'Vermelho/Amarelo (ativador ± gel) — soro'
      : (TUBES[k]?.nome || 'Hemocultura');
    els.orderList.appendChild(li);
  });
}

// ===== Simulador / Tutor =====
const sim = new SimEngine(els.canvas);
const tutor = new Tutor();
const RECO_MIN = 10, RECO_MAX = 25;

function refreshAngleOut(v){
  els.angleOut.textContent = `${v}° — 0° = paralelo à pele, 90° = perpendicular. Recomendado: ${RECO_MIN}°–${RECO_MAX}°.`;
}
function tubeAdvice(){
  const exam = els.examSel.value;
  const tube = els.tubeSel.value;
  let html = '';
  if (exam) {
    const rec = EXAMS[exam].recomendado;
    const recTxt = (rec==='vermelho/amarelo') ? 'Vermelho/Amarelo' : (TUBES[rec]?.nome || 'Hemocultura');
    html += `<div><b>Exame:</b> ${EXAMS[exam].nome} — <span class="pill">tubo recomendado: ${recTxt}</span></div>`;
  }
  if (tube) {
    const info = (tube==='vermelho' || tube==='amarelo') ? TUBES[tube] : TUBES[tube];
    const nome = tube==='vermelho/amarelo' ? 'Vermelho/Amarelo' : info?.nome || '';
    const aditivo = tube==='vermelho/amarelo' ? 'Ativador ± gel separador' : info?.aditivo || '';
    const usos = tube==='vermelho/amarelo' ? 'Soro: bioquímica/sorologia' : info?.usos || '';
    html += `<div><b>Tubo selecionado:</b> ${nome} — <span class="pill">${aditivo}</span> <span class="pill">${usos}</span></div>`;
  }
  if (!html) html = 'Selecione o exame e o tubo para ver as recomendações.';
  els.tubeInfo.innerHTML = html;
}
function correctnessBadge() {
  const exam = els.examSel.value;
  const tube = els.tubeSel.value;
  if (!exam || !tube) return '';
  const rec = EXAMS[exam].recomendado;
  const ok = (rec === tube) || (rec==='vermelho/amarelo' && (tube==='vermelho' || tube==='amarelo'));
  return ok ? '<span class="badge good">tubo adequado</span>' : '<span class="badge warn">tubo não recomendado</span>';
}

function refreshReport(){
  const r = sim.getReport();
  els.report.innerHTML = `
    <div><b>Perfil:</b> ${sim.state.profileLabel}</div>
    <div><b>Garrote:</b> ${r.tourniquet ? '<span class="badge good">ok</span>' : '<span class="badge warn">faltando</span>'}</div>
    <div><b>Antissepsia:</b> ${r.antisepsis ? '<span class="badge good">ok</span>' : '<span class="badge warn">faltando</span>'}</div>
    <div><b>Ângulo:</b> ${r.angle}°</div>
    <div><b>Cateter:</b> ${r.gauge}G</div>
    <div><b>Tentativas:</b> ${r.attempts}</div>
    <div><b>Status:</b> ${r.status}</div>
    <hr/>
    <div><b>Coleta:</b> Exame: ${els.examSel.value || '-'} | Tubo: ${els.tubeSel.value || '-'} ${correctnessBadge()}</div>
    <hr/>
    <div><b>Pontuação:</b> ${r.score}/100</div>
  `;
  els.tutor.innerHTML = tutor.advise(r);
}

// ===== Eventos =====
els.profileSel.onchange = () => {
  sim.applyProfile(els.profileSel.value);
  // Ajusta pele/tônus sugeridos pelo perfil selecio­nado
  els.skinSel.value = String(sim.state.skin);
  els.toneSel.value = String(sim.state.tone);
  refreshReport();
};
els.tourniquetBtn.onclick = () => { sim.applyTourniquet(); refreshReport(); };
els.antisepsisBtn.onclick = () => { sim.doAntisepsis(); refreshReport(); };
els.resetBtn.onclick = () => { sim.reset(); refreshReport(); refreshAngleOut(sim.state.angle); };
els.angleRange.oninput = (e) => { const v = parseInt(e.target.value,10); sim.setAngle(v); refreshAngleOut(v); refreshReport(); };
els.gaugeSel.onchange = (e) => { sim.setGauge(parseInt(e.target.value,10)); refreshReport(); };
els.skinSel.onchange = (e) => { sim.setSkin(parseFloat(e.target.value)); refreshReport(); };
els.toneSel.onchange = (e) => { sim.setTone(parseFloat(e.target.value)); refreshReport(); };

els.examSel.onchange = () => { // auto-sugerir tubo
  const v = els.examSel.value;
  if (!v) { tubeAdvice(); refreshReport(); return; }
  const rec = EXAMS[v].recomendado;
  if (rec === 'vermelho/amarelo') {
    // não força escolha entre vermelho/amarelo, só informa
  } else {
    els.tubeSel.value = rec;
  }
  tubeAdvice();
  refreshReport();
};
els.tubeSel.onchange = () => { tubeAdvice(); refreshReport(); };

// Canvas → tentativa
els.canvas.addEventListener('click', (ev)=>{
  const rect = els.canvas.getBoundingClientRect();
  const x = (ev.clientX - rect.left) * (els.canvas.width/rect.width);
  const y = (ev.clientY - rect.top) * (els.canvas.height/rect.height);
  sim.tryPuncture({x,y});
  refreshReport();
});

// Init
renderOrder();
sim.applyProfile('adulto');
sim.reset();
refreshReport();
refreshAngleOut(sim.state.angle);
tubeAdvice();
