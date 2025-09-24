// SimVen • Capacita+ — PWA (Lite)
const tutorOut = () => document.getElementById("tutor-output");
function say(msg){ if(tutorOut()) tutorOut().innerHTML = msg; }

const tubes = [
  { id:"hemocultura", color:"#7f5539", name:"Frasco Hemocultura", aditivo:"Não possui", param:"Microbiologia (bactérias/fungos)" },
  { id:"azul", color:"#60a5fa", name:"Tubo Azul (Citrato)", aditivo:"Citrato de sódio", param:"Coagulação (TP, TTPa)" },
  { id:"vermelho-amarelo", color:"#f87171", name:"Tubo Vermelho/Amarelo (Soro)", aditivo:"Ativador / Gel", param:"Bioquímica, Sorologia, Hormônios" },
  { id:"verde", color:"#34d399", name:"Tubo Verde (Heparina)", aditivo:"Heparina", param:"Bioquímica/Plasma, Eletrólitos" },
  { id:"roxo", color:"#a78bfa", name:"Tubo Roxo (EDTA)", aditivo:"EDTA", param:"Hematologia" },
  { id:"cinza", color:"#9ca3af", name:"Tubo Cinza (Fluoreto/EDTA)", aditivo:"Fluoreto + EDTA", param:"Glicose e Lactato" },
];
const correctOrder = tubes.map(t=>t.id);

const examMap = {
  "hemocultura": ["Hemocultura (aeróbios/anaeróbios)"],
  "azul": ["TP (Pro trombina)","TTPa","Fibrinogênio","D-dímero"],
  "vermelho-amarelo": ["TGO/AST","TGP/ALT","Bilirrubinas","Hormônios","Sorologias","Ferritina"],
  "verde": ["Eletrólitos (Na, K, Cl)","Gasometria*","Amônia"],
  "roxo": ["Hemograma","Tipagem sanguínea","HbA1c"],
  "cinza": ["Glicemia","Lactato"]
};

// ---------- Router ----------
const routes = {
  "/": homeView,
  "/sequencia": sequenceView,
  "/tubos-param": mappingView,
  "/venopuncao": venoView,
  "/gasometria": gasoView,
  "/veias": veinsView,
  "/erros": errorsView,
  "/sobre": aboutView
};
function mount(html){ document.getElementById("app").innerHTML = html; }
function route(){ const h = location.hash.replace("#","") || "/"; (routes[h]||homeView)(); }
window.addEventListener("hashchange", route);
window.addEventListener("load", async ()=>{
  route();
  if("serviceWorker" in navigator){ try{ await navigator.serviceWorker.register("/sw.js"); }catch(e){} }
});

// ---------- Helpers ----------
function tubeBadge(t){ return `<span class="badge" style="border-color:${t.color}33;background:${t.color}15">${t.name}</span>`; }

// ---------- Views ----------
function homeView(){
  mount(`
    <section class="card grid cols-2">
      <div>
        <h2>SimVen • Modo Lite</h2>
        <p>Interações simplificadas com linhas pré-definidas (dropdowns). Ideal para validação institucional.</p>
        <div class="notice small"><b>Por que a ordem importa?</b> Evita contaminação cruzada de aditivos.</div>
        <div class="list" style="margin-top:.5rem">${tubes.map(t=>tubeBadge(t)).join(" ")}</div>
        <div style="margin-top:1rem"><a class="button" href="#/sequencia">Começar pela Sequência</a></div>
      </div>
      <div class="card">
        <h3>Valores de Referência — Resumo</h3>
        <div class="small">Obtidos de populações saudáveis; ~2,5% acima e ~2,5% abaixo. Interpretar clinicamente.</div>
        <ul class="small">
          <li>Glicemia jejum: 70–99 mg/dL</li>
          <li>Hb (F): 12–16 g/dL • Hb (M): 14–18 g/dL</li>
          <li>Na: 136–145 mEq/L • K: 3,5–5,0 mEq/L</li>
        </ul>
      </div>
    </section>
  `);
  say("Bem-vindo(a)! Use o menu para navegar.");
}

function sequenceView(){
  const opts = tubes.map(t=>`<option value="${t.id}">${t.name}</option>`).join("");
  const rows = Array.from({length:6}).map((_,i)=>`
    <tr>
      <td><b>${i+1}º</b></td>
      <td>
        <select class="tubeSel" data-i="${i}">
          <option value="">Selecione...</option>${opts}
        </select>
      </td>
      <td><div id="hint-${i}" class="small">—</div></td>
    </tr>`).join("");
  mount(`
    <section class="card">
      <h2>Sequência de Coleta</h2>
      <p class="small">Selecione o tubo correto em cada linha e clique em Validar.</p>
      <div class="notice small">Hemocultura → Citrato → Soro → Heparina → EDTA → Fluoreto/EDTA.</div>
      <table class="table"><thead><tr><th>Ordem</th><th>Tubo</th><th>Feedback</th></tr></thead><tbody>${rows}</tbody></table>
      <div style="display:flex;gap:.5rem;margin-top:.75rem">
        <button class="button" id="btnVal">Validar</button>
        <button class="button secondary" id="btnRe">Reiniciar</button>
      </div>
    </section>`);
  document.getElementById("btnVal").onclick = validateOrder;
  document.getElementById("btnRe").onclick = ()=>{
    document.querySelectorAll(".tubeSel").forEach(s=>s.value="");
    document.querySelectorAll("[id^=hint-]").forEach(h=>h.textContent="—");
    say("Reiniciado.");
  };
}
function validateOrder(){
  const chosen = Array.from(document.querySelectorAll(".tubeSel")).map(s=>s.value || null);
  let all = chosen.every(v=>v); let ok = 0;
  chosen.forEach((val,i)=>{
    const hint = document.getElementById(`hint-${i}`); if(!val){ hint.textContent="Escolha um tubo."; return; }
    const expect = correctOrder[i];
    if(val===expect){ hint.innerHTML="✔️ Correto"; ok++; }
    else{ const name = tubes.find(t=>t.id===expect).name; hint.innerHTML=`❌ Esperado: <b>${name}</b>`; }
  });
  if(all){ say(ok===6 ? "Perfeito! Sequência 100% correta. ✅" : `Você acertou ${ok}/6. Revise e tente novamente.`); }
  else{ say("Complete todas as linhas antes de validar."); }
}

function mappingView(){
  const tubeOpts = tubes.map(t=>`<option value="${t.id}">${t.name}</option>`).join("");
  const examOpts = [...new Set(Object.values(examMap).flat())].map(e=>`<option value="${e}">${e}</option>`).join("");
  const rows = Array.from({length:5}).map((_,i)=>`
    <tr>
      <td><select class="tubeX" data-i="${i}"><option value="">Tubo...</option>${tubeOpts}</select></td>
      <td><select class="examX" data-i="${i}"><option value="">Exame...</option>${examOpts}</select></td>
      <td><div id="mx-${i}" class="small">—</div></td>
    </tr>`).join("");
  mount(`
    <section class="card">
      <h2>Tubos × Parâmetros</h2>
      <p class="small">Escolha um tubo e um exame. Clique em Validar.</p>
      <table class="table"><thead><tr><th>Tubo</th><th>Exame</th><th>Feedback</th></tr></thead><tbody>${rows}</tbody></table>
      <div style="display:flex;gap:.5rem;margin-top:.75rem">
        <button class="button" id="btnValMap">Validar</button>
        <button class="button secondary" id="btnReMap">Reiniciar</button>
      </div>
    </section>`);
  document.getElementById("btnValMap").onclick = validateMap;
  document.getElementById("btnReMap").onclick = ()=>{
    document.querySelectorAll(".tubeX,.examX").forEach(s=>s.value="");
    document.querySelectorAll("[id^=mx-]").forEach(h=>h.textContent="—");
    say("Reiniciado.");
  };
}
function validateMap(){
  const tubeSel = Array.from(document.querySelectorAll(".tubeX"));
  const examSel = Array.from(document.querySelectorAll(".examX"));
  let score = 0, total = tubeSel.length;
  for(let i=0;i<total;i++){
    const t = tubeSel[i].value; const e = examSel[i].value; const hint = document.getElementById(`mx-${i}`);
    if(!t || !e){ hint.textContent="Complete a linha."; continue; }
    const ok = (examMap[t]||[]).includes(e);
    hint.innerHTML = ok ? "✔️ Compatível" : "❌ Incompatível com este tubo";
    if(ok) score++;
  }
  say(`Compatíveis: ${score}/${total}.`);
}

function venoView(){
  mount(`
    <section class="card">
      <h2>Venopunção — Quiz Rápido</h2>
      <p class="small">Caso padrão: adulto, veia mediana cubital visível.</p>
      <div class="grid cols-2">
        <div>
          <label>Dispositivo:</label>
          <select id="v-dev">
            <option value="">Selecione...</option>
            <option>Agulha + sistema a vácuo</option>
            <option>Scalp (borboleta)</option>
            <option>Jelco (cateter IV)</option>
          </select>
        </div>
        <div>
          <label>Ângulo da agulha:</label>
          <select id="v-ang">
            <option value="">Selecione...</option>
            <option>15°–30°</option>
            <option>30°–45°</option>
            <option>60°</option>
          </select>
        </div>
      </div>
      <div style="margin-top:.75rem"><button class="button" id="v-validate">Validar</button></div>
    </section>`);
  document.getElementById("v-validate").onclick = ()=>{
    const d = document.getElementById("v-dev").value;
    const a = document.getElementById("v-ang").value;
    let ok = (d==="Agulha + sistema a vácuo") + (a==="15°–30°");
    say(ok===2 ? "✔️ Correto para o caso padrão." : "❌ Revise: agulha + vácuo e 15°–30°.");
  };
}

function gasoView(){
  mount(`
    <section class="card">
      <h2>Gasometria Arterial — Quiz</h2>
      <p class="small">Punção radial.</p>
      <div class="grid cols-2">
        <div>
          <label>Ângulo da agulha:</label>
          <select id="g-ang"><option value="">Selecione...</option><option>30°–45°</option><option>15°–30°</option><option>60°</option></select>
        </div>
        <div>
          <label>Seringa:</label>
          <select id="g-ser"><option value="">Selecione...</option><option>Heparinizada estéril</option><option>Comum sem heparina</option></select>
        </div>
      </div>
      <div style="margin-top:.75rem"><button class="button" id="g-val">Validar</button></div>
      <div class="notice small" style="margin-top:.75rem">Teste de Allen obrigatório antes da punção radial. Comprimir 5–10 min após coleta.</div>
    </section>`);
  document.getElementById("g-val").onclick = ()=>{
    const ok = (document.getElementById("g-ang").value==="30°–45°") &&
               (document.getElementById("g-ser").value==="Heparinizada estéril");
    say(ok ? "✔️ Correto para punção radial." : "❌ Revise: 30°–45° e seringa heparinizada.");
  };
}

function veinsView(){
  mount(`
    <section class="card">
      <h2>Mapa de Veias — Didático</h2>
      <p class="small">Destaques: mediana cubital, basílica, cefálica.</p>
      <div class="list">
        <button class="button secondary" onclick="say('Mediana cubital: 1ª escolha; boa fixação, menor dor.')">Mediana cubital</button>
        <button class="button secondary" onclick="say('Basílica: mais móvel; atenção a estruturas adjacentes.')">Basílica</button>
        <button class="button secondary" onclick="say('Cefálica: alternativa útil; calibre por vezes menor.')">Cefálica</button>
      </div>
    </section>`);
}

function errorsView(){
  mount(`
    <section class="card">
      <h2>Erros Comuns (com imagens)</h2>
      <div class="error-grid">
        ${errorCard("/public/images/erro-hemolise.png","Hemólise","Aspiração vigorosa/agitação → hemólise. Solução: aspiração suave e inversão delicada dos tubos com aditivo.")}
        ${errorCard("/public/images/erro-coagulo.png","Coágulo no tubo","Mistura insuficiente em tubos com anticoagulante. Solução: inversões suaves logo após a coleta.")}
        ${errorCard("/public/images/erro-rotulo.png","Rotulagem incorreta","Risco crítico de identificação. Solução: rotular imediatamente após a coleta, à beira-leito.")}
        ${errorCard("/public/images/erro-sem-tubo.png","Falta do tubo correto","Sequência/seleção incorreta. Solução: checklist pré-coleta e ordem padrão.")}
        ${errorCard("/public/images/erro-veia.png","Veia estourada / extravasamento","Ângulo/pressão inadequados. Solução: 15°–30°, estabilização adequada, evitar múltiplas tentativas.")}
      </div>
    </section>`);
  say("Analise cada erro, identifique a causa e a correção recomendada.");
}
function errorCard(src,title,cap){
  return `
    <figure class="error-card">
      <img src="${src}" alt="${title}">
      <figcaption class="cap"><b>${title}:</b> <span class="small">${cap}</span></figcaption>
    </figure>`;
}

function aboutView(){
  mount(`
    <section class="card">
      <h2>Sobre</h2>
      <p class="small">SimVen • Capacita+ — PWA educacional gamificado. Não substitui protocolos institucionais.</p>
    </section>`);
}
