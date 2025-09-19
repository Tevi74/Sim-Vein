import { SimEngine } from './sim/engine.js';
import { Tutor } from './ia/tutor.js';

const $ = id => document.getElementById(id);

const els = {
  canvas: $('simCanvas'),
  profileSel: $('profileSel'),
  skinSel: $('skinSel'),
  toneSel: $('toneSel'),
  gaugeSel: $('gaugeSel'),
  angleRange: $('angleRange'),
  angleOut: $('angleOut'),
  tourniquetBtn: $('tourniquetBtn'),
  antisepsisBtn: $('antisepsisBtn'),
  resetBtn: $('resetBtn'),
  // nova toolbar
  tTourniquetBtn: $('tTourniquetBtn'),
  tAntisepsisBtn: $('tAntisepsisBtn'),
  tResetBtn: $('tResetBtn'),
  report: $('report'),
  tutor: $('tutor'),
  examSel: $('examSel'),
  tubeSel: $('tubeSel'),
  tubeInfo: $('tubeInfo'),
  orderList: $('orderList'),
  refTable: $('refTable'),
  // ficha
  patientBtn: $('patientBtn'),
  patientModal: $('patientModal'),
  modalClose: $('modalClose'),
  modalSave: $('modalSave'),
  modalCancel: $('modalCancel'),
  pNome: $('pNome'),
  pIdade: $('pIdade'),
  pSexo: $('pSexo'),
  pBraco: $('pBraco'),
  pAlergias: $('pAlergias'),
  pObs: $('pObs'),
  exportBtn: $('exportBtn')
};

// ===== constantes (mesmas do seu app anterior) =====
const ORDER = [ 'hemocultura','azul','vermelho/amarelo','verde','roxo','cinza' ];
const TUBES = {
  hemocultura:{nome:'Frasco de Hemocultura',cor:'Frasco específico',aditivo:'Meio de cultura',usos:'Análise microbiológica',key:'hemocultura'},
  azul:{nome:'Azul claro',cor:'Azul claro',aditivo:'Citrato de sódio',usos:'Coagulação (TP, TTPa, INR)',key:'azul'},
  vermelho:{nome:'Vermelho',cor:'Vermelho',aditivo:'Ativador de coágulo (± gel)',usos:'Soro: bioquímica, sorologia, hormônios',key:'vermelho'},
  amarelo:{nome:'Amarelo',cor:'Amarelo',aditivo:'Ativador + gel separador',usos:'Soro: bioquímica/sorologia',key:'amarelo'},
  verde:{nome:'Verde',cor:'Verde',aditivo:'Heparina',usos:'Bioquímica em plasma (eletrólitos, etc.)',key:'verde'},
  roxo:{nome:'Roxo/Lilás',cor:'Roxo/Lilás',aditivo:'EDTA',usos:'Hematologia (hemograma, morfologia celular)',key:'roxo'},
  cinza:{nome:'Cinza',cor:'Cinza',aditivo:'Fluoreto de sódio + EDTA',usos:'Glicose e lactato',key:'cinza'}
};
const EXAMS = {
  glicose:{nome:'Glicose',recomendado:'cinza'},
  hemograma:{nome:'Hemograma',recomendado:'roxo'},
  coagulacao:{nome:'Coagulação (TP/TTPa)',recomendado:'azul'},
  bioquimica:{nome:'Bioquímica (soro)',recomendado:'vermelho/amarelo'},
  eletrólitos:{nome:'Eletrólitos',recomendado:'verde'},
  sorologia:{nome:'Sorologia',recomendado:'vermelho/amarelo'},
  hormonios:{nome:'Hormônios',recomendado:'vermelho/amarelo'},
  lactato:{nome:'Lactato',recomendado:'cinza'},
  hba1c:{nome:'HbA1c',recomendado:'roxo'},
  hemocultura:{nome:'Hemocultura',recomendado:'hemocultura'}
};
const REF_RANGES = [
  { parametro:'Glicemia (jejum)', valor:'70–99 mg/dL', tubo:'Cinza (Fluoreto + EDTA)' },
  { parametro:'Sódio (Na⁺)', valor:'135–145 mEq/L', tubo:'Verde (Heparina) — plasma' },
  { parametro:'Potássio (K⁺)', valor:'3,5–5,0 mEq/L', tubo:'Verde (Heparina) — plasma' },
  { parametro:'Hemoglobina (H)', valor:'13,5–18,0 g/dL', tubo:'Roxo (EDTA)' },
  { parametro:'Hemoglobina (M)', valor:'11,5–14,9 g/dL', tubo:'Roxo (EDTA)' },
  { parametro:'Hematócrito (H)', valor:'40–54 %', tubo:'Roxo (EDTA)' },
  { parametro:'Hematócrito (M)', valor:'35,3–46,1 %', tubo:'Roxo (EDTA)' },
];
const INVERT = {
  hemocultura:'Conforme fabricante (não agitar).',
  azul:'3–4 inversões.',
  vermelho:'5 inversões (se ativador).',
  amarelo:'5 inversões.',
  verde:'8–10 inversões.',
  roxo:'8–10 inversões.',
  cinza:'8–10 inversões.'
};

// ===== helpers UI =====
function renderOrder(){
  els.orderList.innerHTML = '';
  ORDER.forEach(k=>{
    const li = document.createElement('li');
    li.textContent = (k==='vermelho/amarelo') ? 'Tubo de soro — Vermelho/Amarelo (ativador ± gel)' : TUBES[k].nome;
    els.orderList.appendChild(li);
  });
}
function renderRefTable(){
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
    const recTxt = (rec==='vermelho/amarelo') ? 'Vermelho/Amarelo (soro)' : TUBES[rec].nome;
    html += `<div><b>Exame:</b> ${EXAMS[exam].nome} — <span class="pill">tubo recomendado: ${recTxt}</span></div>`;
  }
  if (tube) {
    let nome, ad, uso;
    if (tube==='vermelho/amarelo'){ nome='Vermelho/Amarelo (soro)'; ad='Ativador ± gel separador'; uso='Bioquímica/Sorologia'; }
    else { const t=TUBES[tube]; nome=t.nome; ad=t.aditivo; uso=t.usos; }
    const inv = INVERT[tube] ? ` <span class="pill" title="Recomendação típica (varia por fabricante)">${INVERT[tube]}</span>` : '';
    html += `<div><b>Tubo selecionado:</b> ${nome} — <span class="pill">${ad}</span> <span class="pill">${uso}</span>${inv}</div>`;
  }
  if (!html) html = 'Selecione o exame e o tubo para ver as recomendações.';
  els.tubeInfo.innerHTML = html;
}
function correctnessBadge(){
  const exam = els.examSel.value, tube = els.tubeSel.value;
  if (!exam || !tube) return '';
  const rec = EXAMS[exam].recomendado;
  const ok = (rec===tube) || (rec==='vermelho/amarelo' && (tube==='vermelho'||tube==='amarelo'||tube==='vermelho/amarelo'));
  return ok ? '<span class="badge good">tubo adequado</span>' : '<span class="badge warn">tubo não recomendado</span>';
}

// ===== Simulador / Tutor =====
const sim = new SimEngine(els.canvas);
const tutor = new Tutor();
const RECO_MIN = 10, RECO_MAX = 25;

function refreshAngleOut(v){
  els.angleOut.textContent = `${v}° — 0° = paralelo à pele, 90° = perpendicular. Recomendado: ${RECO_MIN}°–${RECO_MAX}°.`;
}
function refreshReport(){
  const r = sim.getReport();
  const p = sim.state.patient || {};
  els.report.innerHTML = `
    <div><b>Paciente:</b> ${p.nome || '—'} ${p.idade?`(${p.idade}a)`:''} ${p.sexo||''} ${p.braco?`• Braço: ${p.braco}`:''} ${p.alergias?`• Alergias: ${p.alergias}`:''}</div>
    <div><b>Perfil:</b> ${sim.state.profileLabel || '—'}</div>
    <div><b>Garrote:</b> ${r.tourniquet ? '<span class="badge good">ok</span>' : '<span class="badge warn">faltando</span>'}</div>
    <div><b>Antissepsia:</b> ${r.antisepsis ? '<span class="badge good">ok</span>' : '<span class="badge warn">faltando</span>'}</div>
    <div><b>Ângulo:</b> ${r.angle}°</div>
    <div><b>Cateter:</b> ${r.gauge}G</div>
    <div><b>Tentativas:</b> ${r.attempts}</div>
    <div><b>Status:</b> ${r.status}</div>
    <hr/>
    <div><b>Coleta:</b> Exame: ${els.examSel.value || '-'} | Tubo: ${els.tubeSel.value || '-'} ${correctnessBadge()}</div>
    ${p.obs? `<div class="muted">Obs.: ${p.obs}</div>` : ''}
    <hr/>
    <div><b>Pontuação:</b> ${r.score}/100</div>
  `;
  els.tutor.innerHTML = tutor.advise(r);
}

// ===== Ficha do paciente / PDF (igual versão anterior) =====
function openModal(){ els.patientModal.classList.add('open'); els.patientModal.setAttribute('aria-hidden','false'); }
function closeModal(){ els.patientModal.classList.remove('open'); els.patientModal.setAttribute('aria-hidden','true'); }
els.patientBtn.onclick = openModal; els.modalClose.onclick = closeModal; els.modalCancel.onclick = closeModal;
els.modalSave.onclick = () => {
  sim.state.patient = {
    nome: els.pNome.value.trim(),
    idade: els.pIdade.value ? parseInt(els.pIdade.value,10) : undefined,
    sexo: els.pSexo.value || undefined,
    braco: els.pBraco.value || undefined,
    alergias: els.pAlergias.value.trim() || undefined,
    obs: els.pObs.value.trim() || undefined
  };
  closeModal(); refreshReport();
};
els.exportBtn.onclick = () => {
  const r = sim.getReport(); const p = sim.state.patient || {};
  const html = `
  <html><head><meta charset="utf-8"><title>Relatório — Sim-Vein</title>
  <style>body{font:14px/1.4 system-ui,-apple-system,Segoe UI,Roboto;margin:24px;color:#0d1b2a}h1{font-size:18px;margin:0 0 8px}.sec{margin:12px 0;padding:12px;border:1px solid #e1e8f0;border-radius:10px}</style>
  </head><body>
  <h1>Relatório — Sim-Vein</h1>
  <div class="sec"><b>Paciente:</b> ${p.nome||'—'} ${p.idade?`(${p.idade}a)`:''} ${p.sexo||''} ${p.braco?`• Braço: ${p.braco}`:''} ${p.alergias?`• Alergias: ${p.alergias}`:''} ${p.obs?`<div><small>Obs.: ${p.obs}</small></div>`:''}</div>
  <div class="sec">Perfil: ${sim.state.profileLabel||'—'} | Ângulo: ${r.angle}° | Cateter: ${r.gauge}G<br/>Garrote: ${r.tourniquet?'ok':'faltando'} • Antissepsia: ${r.antisepsis?'ok':'faltando'}<br/>Tentativas: ${r.attempts} • Status: ${r.status}</div>
  <div class="sec">Coleta: Exame ${els.examSel.value||'-'} | Tubo ${els.tubeSel.value||'-'}</div>
  <div class="sec">Pontuação: ${r.score}/100</div>
  <div class="sec"><small>Ângulo venoso recomendado: 10°–25°. Ordem (CLSI): Hemocultura → Azul → Vermelho/Amarelo → Verde → Roxo → Cinza.</small></div>
  <script>window.print();</script></body></html>`;
  const w = window.open('', '_blank'); w.document.write(html); w.document.close();
};

// ===== Eventos principais =====
els.profileSel.addEventListener('change', () => { sim.applyProfile(els.profileSel.value); els.skinSel.value=String(sim.state.skin); els.toneSel.value=String(sim.state.tone); refreshReport(); });
['tourniquetBtn','tTourniquetBtn'].forEach(id => $(id).onclick = () => { sim.applyTourniquet(); refreshReport(); });
['antisepsisBtn','tAntisepsisBtn'].forEach(id => $(id).onclick = () => { sim.doAntisepsis(); refreshReport(); });
['resetBtn','tResetBtn'].forEach(id => $(id).onclick = () => { sim.reset(); refreshReport(); refreshAngleOut(sim.state.angle); });
els.angleRange.oninput = (e) => { const v=parseInt(e.target.value,10); sim.setAngle(v); refreshAngleOut(v); refreshReport(); };
els.gaugeSel.onchange = (e) => { sim.setGauge(parseInt(e.target.value,10)); refreshReport(); };
els.skinSel.onchange  = (e) => { sim.setSkin(parseFloat(e.target.value)); refreshReport(); };
els.toneSel.onchange  = (e) => { sim.setTone(parseFloat(e.target.value)); refreshReport(); };
els.examSel.onchange = () => { const v=els.examSel.value; if(!v){tubeAdvice();refreshReport();return;} const rec=EXAMS[v].recomendado; if(rec!=='vermelho/amarelo') els.tubeSel.value=rec; tubeAdvice(); refreshReport(); };
els.tubeSel.onchange = () => { tubeAdvice(); refreshReport(); };
els.canvas.addEventListener('click', (ev)=>{ const r=els.canvas.getBoundingClientRect(); const x=(ev.clientX-r.left)*(els.canvas.width/r.width); const y=(ev.clientY-r.top)*(els.canvas.height/r.height); sim.tryPuncture({x,y}); refreshReport(); });

// ===== Init =====
function renderOrder(){ els.orderList.innerHTML=''; ORDER.forEach(k=>{ const li=document.createElement('li'); li.textContent=(k==='vermelho/amarelo')?'Tubo de soro — Vermelho/Amarelo (ativador ± gel)':TUBES[k].nome; els.orderList.appendChild(li); }); }
renderOrder();
function renderRefTable(){ els.refTable.innerHTML=`<tr><th>Parâmetro</th><th>Valores de referência*</th><th>Tubo</th></tr>${REF_RANGES.map(r=>`<tr><td>${r.parametro}</td><td>${r.valor}</td><td>${r.tubo}</td></tr>`).join('')}`; }
renderRefTable();
sim.applyProfile('adulto'); sim.reset(); refreshReport(); refreshAngleOut(sim.state.angle); tubeAdvice();
