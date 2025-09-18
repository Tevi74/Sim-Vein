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
  refTable: document.getElementById('refTable')
};

// =======================
// Tubos e Exames (CORRETOS)
// =======================

// Ordem CLSI
const ORDER = [
  'hemocultura',
  'azul',
  'vermelho/amarelo',
  'verde',
  'roxo',
  'cinza'
];

const TUBES = {
  hemocultura: {
    nome: 'Frasco de Hemocultura',
    cor: 'Frasco específico',
    aditivo: 'Meio de cultura',
    usos: 'Análise microbiológica (hemocultura)',
    key: 'hemocultura'
  },
  azul: {
    nome: 'Azul claro',
    cor: 'Azul claro',
    aditivo: 'Citrato de sódio',
    usos: 'Coagulação (TP, TTPa, INR)',
    key: 'azul'
  },
  vermelho: {
    nome: 'Vermelho',
    cor: 'Vermelho',
    aditivo: 'Ativador de coágulo (± gel)',
    usos: 'Soro: bioquímica, sorologia, hormônios',
    key: 'vermelho'
  },
  amarelo: {
    nome: 'Amarelo',
    cor: 'Amarelo',
    aditivo: 'Ativador + gel separador',
    usos: 'Soro: bioquímica/sorologia (melhor separação)',
    key: 'amarelo'
  },
  verde: {
    nome: 'Verde',
    cor: 'Verde',
    aditivo: 'Heparina',
    usos: 'Bioquímica em plasma (eletrólitos, etc.)',
    key: 'verde'
  },
  roxo: {
    nome: 'Roxo/Lilás',
    cor: 'Roxo/Lilás',
    aditivo: 'EDTA',
    usos: 'Hematologia (hemograma, morfologia celular)',
    key: 'roxo'
  },
  cinza: {
    nome: 'Cinza',
    cor: 'Cinza',
    aditivo: 'Fluoreto de sódio + EDTA',
    usos: 'Glicose e lactato (inibe glicólise)',
    key: 'cinza'
  }
};

// Exames → tubo recomendado
const EXAMS = {
  glicose:       { nome: 'Glicose',                 recomendado: 'cinza' },
  hemograma:     { nome: 'Hemograma',               recomendado: 'roxo' },
  coagulacao:    { nome: 'Coagulação (TP/TTPa)',    recomendado: 'azul' },
  bioquimica:    { nome: 'Bioquímica (soro)',       recomendado: 'vermelho/amarelo' },
  eletrólitos:   { nome: 'Eletrólitos',             recomendado: 'verde' },
  sorologia:     { nome: 'Sorologia',               recomendado: 'vermelho/amarelo' },
  hormonios:     { nome: 'Hormônios',               recomendado: 'vermelho/amarelo' },
  lactato:       { nome: 'Lactato',                 recomendado: 'cinza' },
  hba1c:         { nome: 'HbA1c',                   recomendado: 'roxo' },
  hemocultura:   { nome: 'Hemocultura',             recomendado: 'hemocultura' }
};

// Valores de referência (sintéticos, podem variar por laboratório)
const REF_RANGES = [
  { parametro: 'Glicemia (jejum)', valor: '70–99 mg/dL', tubo: 'Cinza (Fluoreto + EDTA)' },
  { parametro: 'Sódio (Na⁺)', valor: '135–145 mEq/L', tubo: 'Verde (Heparina) — plasma' },
  { parametro: 'Potássio (K⁺)', valor: '3,5–5,0 mEq/L', tubo: 'Verde (Heparina) — plasma' },
  { parametro: 'Hemoglobina (H):', valor: '13,5 – 18,0 g/dL', tubo: 'Roxo (EDTA)' },
  { parametro: 'Hemoglobina (M):', valor: '11,5 – 14,9 g/dL', tubo: 'Roxo (EDTA)' },
  { parametro: 'Hematócrito (H):', valor: '40 – 54 %', tubo: 'Roxo (EDTA)' },
  { parametro: 'Hematócrito (M):', valor: '35,3 – 46,1 %', tubo: 'Roxo (EDTA)' }
];

// =======================
// UI helpers
// =======================
function renderOrder() {
  els.orderList.innerHTML = '';
  ORDER.forEach(k => {
    const li = document.createElement('li');
    if (k === 'vermelho/amarelo') {
      li.textContent = 'Tubo de soro — Vermelho/Amarelo (ativador ± gel)';
    } else {
      li.textContent = TUBES[k].nome;
    }
    els.orderList.appendChild(li);
  });
}

function renderRefTable() {
  els.refTable.innerHTML = `
    <tr><th>Parâmetro</th><th>Valores de referência*</th><th>Tubo</th></tr>
    ${REF_RANGES.map(r=>`<tr><td>${r.parametro}</td><td>${r.valor}</td><td>${r.tubo}</td></tr>`).join('')}
  `;
}

function tubeAdvice(){
  const exam = els.examSel.value;
  const tube = els.tubeSel.value;
  let html = '';

  if (exam) {
    const rec = EXAMS[exam].recomendado;
    const recTxt = (rec === 'vermelho/amarelo')
      ? 'Vermelho/Amarelo (soro)'
      : TUBES[rec].nome;
    html += `<div><b>Exame:</b> ${EXAMS[exam].nome} — <span class="pill">tubo recomendado: ${recTxt}</span></div>`;
  }

  if (tube) {
    let nome = ''; let aditivo = ''; let usos = '';
    if (tube === 'vermelho/amarelo') {
      nome = 'Vermelho/Amarelo (soro)';
      aditivo = 'Ativador de coágulo ± gel separador';
      usos = 'Bioquímica/Sorologia (soro)';
    } else {
      const info = TUBES[tube];
      nome = info.nome; aditivo = info.aditivo; usos = info.usos;
    }
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
  const ok = (rec === tube) || (rec === 'vermelho/amarelo' && (tube === 'vermelho' || tube === 'amarelo' || tube === 'vermelho/amarelo'));
  return ok
    ? '<span class="badge good">tubo adequado</span>'
    : '<span class="badge warn">tubo não recomendado</span>';
}

// =======================
// Simulador / Tutor
// =======================
const sim = new SimEngine(els.canvas);
const tutor = new Tutor();
const RECO_MIN = 10, RECO_MAX = 25;

function refreshAngleOut(v){
  els.angleOut.textContent = `${v}° — 0° = paralelo à pele, 90° = perpendicular. Recomendado: ${RECO_MIN}°–${RECO_MAX}°.`;
}

function refreshReport(){
  const r = sim.getReport();
  els.report.innerHTML = `
    <div><b>Perfil:</b> ${sim.state.profileLabel || '—'}</div>
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

// =======================
// Eventos
// =======================
els.profileSel.addEventListener('change', () => {
  sim.applyProfile(els.profileSel.value);
  els.skinSel.value = String(sim.state.skin);
  els.toneSel.value = String(sim.state.tone);
  refreshReport();
});

els.tourniquetBtn.onclick = () => { sim.applyTourniquet(); refreshReport(); };
els.antisepsisBtn.onclick = () => { sim.doAntisepsis(); refreshReport(); };
els.resetBtn.onclick = () => { sim.reset(); refreshReport(); refreshAngleOut(sim.state.angle); };

els.angleRange.oninput = (e) => {
  const v = parseInt(e.target.value,10);
  sim.setAngle(v);
  refreshAngleOut(v);
  refreshReport();
};

els.gaugeSel.onchange = (e) => { sim.setGauge(parseInt(e.target.value,10)); refreshReport(); };
els.skinSel.onchange  = (e) => { sim.setSkin(parseFloat(e.target.value));   refreshReport(); };
els.toneSel.onchange  = (e) => { sim.setTone(parseFloat(e.target.value));   refreshReport(); };

els.examSel.onchange = () => {
  const v = els.examSel.value;
  if (!v) { tubeAdvice(); refreshReport(); return; }
  const rec = EXAMS[v].recomendado;
  // Para soro (vermelho/amarelo), não forçamos entre vermelho ou amarelo.
  if (rec !== 'vermelho/amarelo') els.tubeSel.value = rec;
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

// =======================
// Inicialização
// =======================
renderOrder();
renderRefTable();
sim.applyProfile('adulto');
sim.reset();
refreshReport();
refreshAngleOut(sim.state.angle);
tubeAdvice();

 
