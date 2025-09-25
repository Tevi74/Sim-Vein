(function(){
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));

  const tabsBtns = $$('.nav .btn');
  const tabsSections = $$('.tab');
  function showTab(id){
    tabsSections.forEach(el=>el.classList.toggle('active', el.id==='tab-'+id));
    tabsBtns.forEach(b=>b.classList.toggle('active', b.dataset.tab===id));
  }
  tabsBtns.forEach(b=>b.addEventListener('click',()=>showTab(b.dataset.tab)));
  document.addEventListener('DOMContentLoaded',()=>{
    if (!document.querySelector('#tab-sequencia').classList.contains('active')) showTab('sequencia');
  });

  const dlg = document.querySelector('#settings');
  const btnSettings = document.querySelector('#btn-settings');
  const btnSaveSettings = document.querySelector('#save-settings');
  const btnCloseSettings = document.querySelector('#close-settings');
  if (btnSettings) btnSettings.addEventListener('click',()=>dlg.showModal());
  if (btnCloseSettings) btnCloseSettings.addEventListener('click',()=>dlg.close());
  if (btnSaveSettings) btnSaveSettings.addEventListener('click',()=>dlg.close());

  const ambient = document.querySelector('#audio-ambiente');
  const toggleAmb = document.querySelector('#toggle-ambiente');
  if (ambient) ambient.volume = 0.35;
  if (ambient && toggleAmb){
    toggleAmb.addEventListener('change',()=>{
      if (toggleAmb.checked){ ambient.play().catch(()=>{}); ambient.muted=false; }
      else { ambient.pause(); ambient.muted=true; }
    });
  }

  let fxEl = new Audio();
  let fxBtn = null;
  document.addEventListener('click',e=>{
    const btn = e.target.closest('button[data-audio]');
    if (!btn) return;
    const src = btn.getAttribute('data-audio');
    if (fxBtn === btn && !fxEl.paused){
      fxEl.pause(); fxEl.currentTime = 0;
      btn.textContent = '▶ ' + btn.textContent.replace(/^(\▶|⏸)\s*/,'');
      fxBtn = null;
      return;
    }
    if (!fxEl.paused){ fxEl.pause(); fxEl.currentTime = 0; }
    fxEl = new Audio(src);
    fxEl.play().catch(()=>{});
    if (fxBtn) fxBtn.textContent = '▶ ' + fxBtn.textContent.replace(/^(\▶|⏸)\s*/,'');
    btn.textContent = '⏸ ' + btn.textContent.replace(/^(\▶|⏸)\s*/,'');
    fxBtn = btn;
    fxEl.onended = ()=>{
      if (fxBtn){ fxBtn.textContent = '▶ ' + fxBtn.textContent.replace(/^(\▶|⏸)\s*/,''); fxBtn=null; }
    };
  });

  const startBtn = document.querySelector('#garrote-start');
  const stopBtn = document.querySelector('#garrote-stop');
  const timerEl = document.querySelector('#garrote-timer');
  const alertEl = document.querySelector('#garrote-alert');
  let t0=null, tick=null;
  function fmt(n){const m=Math.floor(n/60), s=Math.floor(n%60); return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');}
  if (startBtn && stopBtn && timerEl){
    startBtn.addEventListener('click',()=>{
      if (tick) return;
      if (alertEl) alertEl.hidden=true;
      t0 = Date.now();
      stopBtn.disabled=false;
      tick = setInterval(()=>{
        const secs=(Date.now()-t0)/1000;
        timerEl.textContent = fmt(secs);
        if (secs>60 && alertEl) alertEl.hidden=false;
      },200);
    });
    stopBtn.addEventListener('click',()=>{
      clearInterval(tick); tick=null; stopBtn.disabled=true;
    });
  }

  const angle = document.querySelector('#angle');
  const angleVal = document.querySelector('#angle-val');
  const angleFb = document.querySelector('#angle-feedback');
  if (angle){
    const upd=()=>{
      const v=Number(angle.value);
      if (angleVal) angleVal.textContent=v+'°';
      if (angleFb){
        const ok = v>=30 && v<=45;
        angleFb.textContent = ok ? 'Correto (30–45°)' : 'Ajuste para 30–45°';
        angleFb.style.borderColor = ok ? 'rgba(18,184,134,.6)' : 'rgba(255,255,255,.2)';
      }
    };
    angle.addEventListener('input',upd); upd();
  }

  const sky = document.querySelector('#sky');
  const panel = document.querySelector('#hotspot-panel');
  const hsTitle = document.querySelector('#hs-title');
  const hsText = document.querySelector('#hs-text');
  document.querySelectorAll('.hotspot').forEach(h=>{
    h.addEventListener('click',()=>{
      if (hsTitle) hsTitle.textContent = h.getAttribute('data-title')||'';
      if (hsText) hsText.textContent = h.getAttribute('data-text')||'';
      if (panel) panel.hidden=false;
    });
  });
  const img360 = document.querySelector('#arm360');
  const missing360 = document.querySelector('#missing360');
  if (img360){
    img360.addEventListener('error',()=>{ if(missing360) missing360.hidden=false; });
    img360.addEventListener('load',()=>{ if(missing360) missing360.hidden=true; if(sky) sky.setAttribute('src','#arm360'); });
  }

  const examesBox = document.querySelector('#exames');
  const deduzidos = document.querySelector('#deduzidos');
  const btnDeduzir = document.querySelector('#btn-deduzir');
  if (btnDeduzir && examesBox && deduzidos){
    btnDeduzir.addEventListener('click',()=>{
      const ex = Array.from(examesBox.querySelectorAll('input:checked')).map(i=>i.value);
      const tubos = new Set();
      if (ex.includes('Hemocultura')) tubos.add('Hemocultura');
      if (ex.some(v=>/TP|TTPa/.test(v))) tubos.add('Citrato');
      if (ex.includes('VHS')) tubos.add('VHS');
      if (ex.some(v=>/Hemograma/.test(v))) tubos.add('EDTA');
      if (ex.some(v=>/Glicose/.test(v))) tubos.add('Fluoreto');
      if (ex.some(v=>/Eletrólitos|Bioquímica|Sorologia|Hormônios/.test(v))) tubos.add('Soro');
      if (ex.some(v=>/Eletrólitos|Bioquímica/.test(v))) tubos.add('Heparina');
      deduzidos.textContent = Array.from(tubos).join(' • ') || 'Nenhum selecionado';
    });
  }

  const bank = document.querySelector('#tube-bank');
  const drop = document.querySelector('#tube-drop');
  const feedback = document.querySelector('#quiz-feedback');
  const btnValidate = document.querySelector('#btn-validate');
  const btnReset = document.querySelector('#btn-reset');
  function dragSetup(img){
    img.addEventListener('dragstart',e=>{
      e.dataTransfer.setData('text/plain', img.dataset.id);
    });
  }
  document.querySelectorAll('.tube').forEach(d=>dragSetup(d));
  if (drop){
    drop.addEventListener('dragover',e=>{e.preventDefault(); drop.classList.add('empty');});
    drop.addEventListener('dragleave',()=>drop.classList.remove('empty'));
    drop.addEventListener('drop',e=>{
      e.preventDefault();
      drop.classList.remove('empty');
      const id = e.dataTransfer.getData('text/plain');
      const el = document.querySelector('.tube[data-id="'+id+'"]');
      if (el) drop.appendChild(el);
    });
  }
  if (bank){
    bank.addEventListener('dragover',e=>e.preventDefault());
    bank.addEventListener('drop',e=>{
      e.preventDefault();
      const id = e.dataTransfer.getData('text/plain');
      const el = document.querySelector('.tube[data-id="'+id+'"]');
      if (el) bank.appendChild(el);
    });
  }
  function currentOrder(){
    return Array.from(drop.querySelectorAll('.tube')).map(t=>t.dataset.id);
  }
  function expectedOrder(){
    const all=['1-hemocultura','2-citrato','3-vhs','4-soro','5-heparina','6-edta','7-fluoreto'];
    const present = all.filter(id=>document.querySelector('.tube[data-id="'+id+'"]'));
    return present;
  }
  if (btnValidate){
    btnValidate.addEventListener('click',()=>{
      const now=currentOrder();
      const goal=expectedOrder();
      const ok = now.length===goal.length && now.every((v,i)=>v===goal[i]);
      if (feedback){
        feedback.textContent = ok ? 'Sequência correta!' : 'Sequência incorreta. Tente novamente.';
        feedback.classList.toggle('ok',ok);
        feedback.classList.toggle('bad',!ok);
      }
    });
  }
  if (btnReset){
    btnReset.addEventListener('click',()=>{
      Array.from(drop.querySelectorAll('.tube')).forEach(t=>bank.appendChild(t));
      if (feedback){ feedback.textContent=''; feedback.classList.remove('ok','bad'); }
    });
  }

  const left = document.querySelector('#puzzle-left');
  const right = document.querySelector('#puzzle-right');
  if (left && right){
    left.querySelectorAll('.piece').forEach(p=>{
      p.addEventListener('dragstart',e=>{
        e.dataTransfer.setData('text/plain', p.dataset.key);
      });
    });
    right.querySelectorAll('.slot').forEach(s=>{
      s.addEventListener('dragover',e=>e.preventDefault());
      s.addEventListener('drop',e=>{
        e.preventDefault();
        const key=e.dataTransfer.getData('text/plain');
        if (s.dataset.accept===key){
          s.classList.add('correct');
          const piece = left.querySelector('.piece[data-key="'+key+'"]');
          if (piece){ s.textContent = s.textContent; piece.remove(); }
        } else {
          s.classList.add('hover');
          setTimeout(()=>s.classList.remove('hover'),400);
        }
      });
    });
  }

  const relato = document.querySelector('#relato');
  const btnRelato = document.querySelector('#btn-gerar-relato');
  if (btnRelato && relato){
    btnRelato.addEventListener('click',()=>{
      const nome = document.querySelector('[name="nome"]')?.value||'—';
      const nasc = document.querySelector('[name="nasc"]')?.value||'—';
      const sexo = document.querySelector('[name="sexo"]')?.value||'—';
      const alergias = document.querySelector('[name="alergias"]')?.value||'—';
      const bios = Array.from(document.querySelectorAll('.check input[type="checkbox"][data-score]')).filter(i=>i.checked).length;
      const biosTotal = document.querySelectorAll('.check input[type="checkbox"][data-score]').length;
      const seqOk = document.querySelector('#quiz-feedback')?.classList.contains('ok') ? 'Correta' : 'Não validada/corrigida';
      const html = [
        '<div class="box">',
        '<h3>Resumo do Caso</h3>',
        '<p><b>Paciente:</b> '+nome+' • <b>Nasc.:</b> '+nasc+' • <b>Sexo:</b> '+sexo+'</p>',
        '<p><b>Alergias:</b> '+alergias+'</p>',
        '<p><b>Biossegurança:</b> '+bios+'/'+biosTotal+' marcadas</p>',
        '<p><b>Sequência de tubos:</b> '+seqOk+'</p>',
        '</div>'
      ].join('');
      relato.innerHTML = html;
    });
  }

  const tutorFeed = document.querySelector('#tutor-feed');
  const tutorAsk = document.querySelector('#tutor-ask');
  const tutorInput = document.querySelector('#tutor-input');
  const tutorCorrigir = document.querySelector('#tutor-corrigir');
  function pushTutor(role,text){
    if (!tutorFeed) return;
    const msg=document.createElement('div');
    msg.style.marginBottom='8px';
    msg.innerHTML = '<b>'+role+':</b> '+text;
    tutorFeed.appendChild(msg);
    tutorFeed.scrollTop = tutorFeed.scrollHeight;
  }
  if (tutorAsk && tutorInput){
    tutorAsk.addEventListener('click',()=>{
      const q=tutorInput.value.trim();
      if(!q) return;
      pushTutor('Você', q);
      const a='Ok. Considerarei sua pergunta no contexto do simulador.';
      pushTutor('Tutor', a);
      tutorInput.value='';
    });
  }
  if (tutorCorrigir){
    tutorCorrigir.addEventListener('click',()=>{
      const now = Array.from(document.querySelectorAll('#tube-drop .tube')).map(t=>t.dataset.id);
      const goal = (function(){const all=['1-hemocultura','2-citrato','3-vhs','4-soro','5-heparina','6-edta','7-fluoreto'];return all.filter(id=>document.querySelector('.tube[data-id="'+id+'"]'));})();
      if (!now.length){ pushTutor('Tutor','Arraste os tubos para a área e clique em Validar.'); return; }
      const dicas=[];
      if (now[0]!=='1-hemocultura' && document.querySelector('.tube[data-id="1-hemocultura"]')) dicas.push('Hemocultura primeiro.');
      if (now.indexOf('2-citrato')>now.indexOf('4-soro')) dicas.push('Citrato deve vir antes de Soro.');
      if (now.indexOf('6-edta')<now.indexOf('4-soro')) dicas.push('Soro antes de EDTA.');
      if (!dicas.length) pushTutor('Tutor','Sequência parece correta ou quase correta.');
      else pushTutor('Tutor', dicas.join(' '));
    });
  }
})();
