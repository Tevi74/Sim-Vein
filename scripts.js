// Navegação entre abas
const tabs = document.querySelectorAll('.tab');
const navButtons = document.querySelectorAll('.nav .btn[data-tab]');
navButtons.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    tabs.forEach(t=>t.classList.remove('active'));
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
  });
});

// Áudio ambiente + botões de áudio opcionais
const audioAmb = document.getElementById('audio-ambiente');
document.querySelectorAll('.audio-controls [data-audio]').forEach(b=>{
  b.addEventListener('click', ()=>{
    const src = b.getAttribute('data-audio');
    const a = new Audio(src);
    a.play().catch(()=>{});
  });
});

// Configurações (API key e áudio ambiente)
const dlg = document.getElementById('settings');
document.getElementById('btn-settings').onclick = ()=> dlg.showModal();
document.getElementById('close-settings').onclick = ()=> dlg.close();
document.getElementById('save-settings').onclick = ()=>{
  const key = document.getElementById('openai-key').value.trim();
  const amb = document.getElementById('toggle-ambiente').checked;
  if(key) localStorage.setItem('OPENAI_API_KEY', key); else localStorage.removeItem('OPENAI_API_KEY');
  localStorage.setItem('AMB', amb ? '1':'0');
  if(amb){ audioAmb.volume = 0.2; audioAmb.play().catch(()=>{}); } else { audioAmb.pause(); }
  dlg.close();
};
// Restaurar prefs
(function(){
  const amb = localStorage.getItem('AMB') === '1';
  document.getElementById('toggle-ambiente').checked = amb;
  if(amb){ audioAmb.volume = 0.2; audioAmb.play().catch(()=>{}); }
  const key = localStorage.getItem('OPENAI_API_KEY') || '';
  document.getElementById('openai-key').value = key;
})();

// Banner se arm-360 ausente
const img360 = document.getElementById('arm360');
const banner = document.getElementById('banner');
if(img360){
  img360.addEventListener('error', ()=>{
    banner.textContent = '⚠️ Imagem 360 ausente. Coloque public/assets/arm-360.jpg (equiretangular 2:1).';
    banner.hidden = false;
    document.getElementById('missing360')?.removeAttribute('hidden');
    document.getElementById('sky')?.setAttribute('visible','false');
  });
}

// Hotspots (mostrar painel)
const hsPanel = document.getElementById('hotspot-panel');
const hsTitle = document.getElementById('hs-title');
const hsText = document.getElementById('hs-text');
const scene = document.querySelector('a-scene');
if(scene){
  scene.addEventListener('loaded', ()=>{
    const spots = scene.el.querySelectorAll('.hotspot');
    spots.forEach(h => h.addEventListener('click', e=>{
      const el = e.target;
      hsTitle.textContent = el.dataset.title || 'Veia';
      hsText.textContent = el.dataset.text || '';
      hsPanel.hidden = false;
    }));
  });
}

// Salvar ficha de paciente (simples)
document.getElementById('btn-salvar-paciente')?.addEventListener('click', ()=>{
  const data = Object.fromEntries(new FormData(document.getElementById('form-paciente')).entries());
  localStorage.setItem('FICHA_PACIENTE', JSON.stringify(data));
  alert('✅ Ficha salva (local).');
});

// Deduzir tubos pela solicitação
const mapaTubos = {
  'Hemocultura': 'Hemocultura',
  'TP/TTPa': 'Citrato',
  'Hemograma': 'EDTA',
  'Glicose': 'Fluoreto',
  'Eletrólitos': 'Heparina',
  'Sorologia/Hormônios': 'Soro'
};
document.getElementById('btn-deduzir')?.addEventListener('click', ()=>{
  const checks = document.querySelectorAll('#exames input:checked');
  const tubos = new Set();
  checks.forEach(c=>{
    const t = mapaTubos[c.value];
    if(t) tubos.add(t);
  });
  const out = Array.from(tubos).join(' • ');
  const el = document.getElementById('deduzidos');
  el.textContent = out ? `Tubos necessários: ${out}` : 'Nenhum exame selecionado.';
});

// Cronômetro de garrote
let garroteInterval = null, sec=0;
function fmt(s){const m=Math.floor(s/60);const r=(s%60);return `${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}`;}
const tmr = document.getElementById('garrote-timer');
const alertG = document.getElementById('garrote-alert');
document.getElementById('garrote-start')?.addEventListener('click', ()=>{
  if(garroteInterval) return;
  sec=0; tmr.textContent = '00:00'; alertG.hidden = true;
  garroteInterval = setInterval(()=>{
    sec++; tmr.textContent = fmt(sec);
    if(sec>60) alertG.hidden = false;
  }, 1000);
  document.getElementById('garrote-stop').disabled = false;
});
document.getElementById('garrote-stop')?.addEventListener('click', ()=>{
  clearInterval(garroteInterval); garroteInterval=null;
  document.getElementById('garrote-stop').disabled = true;
});

// Validação de ângulo (30–45°)
const angle = document.getElementById('angle');
const angleVal = document.getElementById('angle-val');
const angleFb = document.getElementById('angle-feedback');
if(angle){
  const checkAngle = ()=>{
    const v = +angle.value;
    angleVal.textContent = `${v}°`;
    if(v>=30 && v<=45){ angleFb.textContent = '✅ Correto (30–45°)'; angleFb.style.borderColor = 'rgba(18,184,134,.6)'; }
    else { angleFb.textContent = '⚠️ Fora do ideal (30–45°)'; angleFb.style.borderColor = 'rgba(224,49,49,.6)'; }
  };
  angle.addEventListener('input', checkAngle);
  checkAngle();
}

// Sequência de coleta (drag & drop)
const bank = document.getElementById('tube-bank');
const drop = document.getElementById('tube-drop');
const btnValidate = document.getElementById('btn-validate');
const btnReset = document.getElementById('btn-reset');
const feedback = document.getElementById('quiz-feedback');

const correctOrder = [
  '1-hemocultura','2-citrato','3-soro','4-heparina','5-edta','6-fluoreto'
];

let dragItem = null;
function handleDragStart(e){ dragItem = e.target; }
function handleDragOver(e){ e.preventDefault(); }
function handleDrop(e){ e.preventDefault(); if(dragItem){ e.currentTarget.appendChild(dragItem); dragItem = null; }}
document.querySelectorAll('.tube').forEach(t=> t.addEventListener('dragstart', handleDragStart));
[bank, drop].forEach(box=>{ box.addEventListener('dragover', handleDragOver); box.addEventListener('drop', handleDrop); });

btnReset?.addEventListener('click', ()=>{
  feedback.textContent = ''; feedback.className = 'feedback';
  Array.from(drop.querySelectorAll('.tube')).forEach(p=>bank.appendChild(p));
});
btnValidate?.addEventListener('click', ()=>{
  const placed = Array.from(drop.querySelectorAll('.tube')).map(t=>t.dataset.id);
  if(placed.length !== correctOrder.length){
    feedback.textContent = 'Ainda faltam tubos. Complete a sequência.'; feedback.className = 'feedback bad'; return;
  }
  const ok = placed.every((id, i)=> id === correctOrder[i]);
  if(ok){ feedback.textContent = 'Perfeito! Ordem correta.'; feedback.className = 'feedback ok'; }
  else {
    const idx = placed.findIndex((id, i)=> id !== correctOrder[i]);
    feedback.textContent = `Verifique a posição ${idx+1}.`; feedback.className = 'feedback bad';
  }
});

// Quebra-cabeça Tubo ↔ Aplicação
const pieces = document.querySelectorAll('.piece');
const slots = document.querySelectorAll('.slot');
let dragging = null;
pieces.forEach(p=>{
  p.addEventListener('dragstart', ()=> dragging = p);
});
slots.forEach(s=>{
  s.addEventListener('dragover', e=> e.preventDefault());
  s.addEventListener('drop', e=>{
    e.preventDefault();
    if(!dragging) return;
    if(s.dataset.accept === dragging.dataset.key){
      s.classList.add('ok'); s.textContent = s.textContent + ' ✓';
      dragging.setAttribute('draggable','false');
      dragging.classList.add('ok');
      s.appendChild(document.createComment(dragging.dataset.key));
    } else {
      s.classList.add('bad');
      setTimeout(()=> s.classList.remove('bad'), 800);
    }
    dragging = null;
  });
});

// Relatório (soma simples de indicadores)
document.getElementById('btn-gerar-relato')?.addEventListener('click', ()=>{
  const ficha = JSON.parse(localStorage.getItem('FICHA_PACIENTE')||'{}');
  const bioChecks = document.querySelectorAll('#tab-biosseg input[type=checkbox]:checked').length;
  const angleScore = (angle && +angle.value>=30 && +angle.value<=45) ? 1 : 0;
  const garroteScore = (sec<=60 && !garroteInterval) ? 1 : 0; // parou antes de 60s
  const relato = `
  <b>Paciente:</b> ${ficha.nome||'-'} (${ficha.nasc||'-'})<br/>
  <b>Biossegurança (itens marcados):</b> ${bioChecks}<br/>
  <b>Garrote ok:</b> ${garroteScore?'Sim':'Não'} • <b>Ângulo ok:</b> ${angleScore?'Sim':'Não'}<br/>
  <i>*Relatório didático. Não substitui prática supervisionada.</i>`;
  document.getElementById('relato').innerHTML = relato;
});

// Tutor IA (híbrido): stub local + opcional OpenAI
async function tutorExplain(question, context){
  // 1) Regras locais rápidas (exemplo)
  if(context?.type === 'sequencia' && context?.mistakeIndex >= 0){
    const idx = context.mistakeIndex + 1;
    return `A posição ${idx} está incorreta. Lembre que a ordem evita contaminação cruzada de aditivos: hemocultura → citrato (azul) → soro → heparina (verde) → EDTA (roxo) → fluoreto (cinza).`;
  }
  // 2) OpenAI opcional
  const key = localStorage.getItem('OPENAI_API_KEY');
  if(!key) return 'Dica: sem IA online configurada. Vá em ⚙️ e insira a OpenAI API key para explicações detalhadas.';
  try{
    const resp = await fetch('https://api.openai.com/v1/chat/completions',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`},
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {role:'system', content: 'Você é um tutor de coleta venosa. Explique em 80–120 palavras, linguagem simples, destacando o porquê e como corrigir, sem prescrever tratamento.'},
          {role:'user', content: `Pergunta/erro: ${question}\nContexto: ${JSON.stringify(context)}`}
        ],
        temperature: 0.3
      })
    });
    const data = await resp.json();
    return data?.choices?.[0]?.message?.content?.trim() || 'Sem resposta da IA.';
  }catch(e){
    return 'Não foi possível contactar a IA agora.';
  }
}
