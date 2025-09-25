(function(){
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));

  const tabBtns = $$('.nav .btn');
  const sections = $$('.tab');
  function showTab(id){
    sections.forEach(el=>el.classList.toggle('active', el.id==='tab-'+id));
    tabBtns.forEach(b=>b.classList.toggle('active', b.dataset.tab===id));
  }
  tabBtns.forEach(b=>b.addEventListener('click',()=>showTab(b.dataset.tab)));
  $('#welcome-start')?.addEventListener('click',()=>showTab('sequencia'));

  const dlg = $('#settings');
  $('#btn-settings')?.addEventListener('click',()=>dlg.showModal());
  $('#close-settings')?.addEventListener('click',()=>dlg.close());
  $('#save-settings')?.addEventListener('click',()=>dlg.close());

  const ambient = $('#audio-ambiente');
  const toggleAmb = $('#toggle-ambiente');
  if (ambient) ambient.volume = 0.35;
  if (toggleAmb && ambient){
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
      fxBtn = null; return;
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

  const startBtn = $('#garrote-start');
  const stopBtn = $('#garrote-stop');
  const timerEl = $('#garrote-timer');
  const alertEl = $('#garrote-alert');
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

  const angle = $('#angle');
  const angleVal = $('#angle-val');
  const angleFb = $('#angle-feedback');
  if (angle){
    const upd=()=>{
      const v=Number(angle.value);
      if (angleVal) angleVal.textContent=v+'°';
      if (angleFb){
        const ok = v>=30 && v<=45;
        angleFb.textContent = ok ? 'Correto (30–45°)' : 'Ajuste para 30–45°';
      }
    };
    angle.addEventListener('input',upd); upd();
  }

  const sky = $('#sky');
  const panel = $('#hotspot-panel');
  const hsTitle = $('#hs-title');
  const hsText = $('#hs-text');
  $$('.hotspot').forEach(h=>{
    h.addEventListener('click',()=>{
      if (hsTitle) hsTitle.textContent = h.getAttribute('data-title')||'';
      if (hsText) hsText.textContent = h.getAttribute('data-text')||'';
      if (panel) panel.hidden=false;
    });
  });
  const img360 = $('#arm360');
  const missing360 = $('#missing360');
  if (img360){
    img360.addEventListener('error',()=>{ if(missing360) missing360.hidden=false; });
    img360.addEventListener('load',()=>{ if(missing360) missing360.hidden=true; if(sky) sky.setAttribute('src','#arm360'); });
  }

  const examesBox = $('#exames');
  const deduzidos = $('#deduzidos');
  const btnDeduzir = $('#btn-deduzir');
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

  const bank = $('#tube-bank');
  const drop = $('#tube-drop');
  const feedback = $('#quiz-feedback');
  const btnValidate = $('#btn-validate');
  const btnReset = $('#btn-reset');
  function dragSetup(img){
    img.addEventListener('dragstart',e=>{
      e.dataTransfer.setData('text/plain', img.dataset.id);
    });
  }
  $$('.tube').forEach(d=>dragSetup(d));
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
  btnValidate?.addEventListener('click',()=>{
    const now=currentOrder();
    const goal=expectedOrder();
    const ok = now.length===goal.length && now.every((v,i)=>v===goal[i]);
    if (feedback){
      feedback.textContent = ok ? 'Sequência correta!' : 'Sequência incorreta. Tente novamente.';
      feedback.classList.toggle('ok',ok);
      feedback.classList.toggle('bad',!ok);
    }
  });
  btnReset?.addEventListener('click',()=>{
    Array.from(drop.querySelectorAll('.tube')).forEach(t=>bank.appendChild(t));
    if (feedback){ feedback.textContent=''; feedback.classList.remove('ok','bad'); }
  });

  const left = $('#puzzle-left');
  const right = $('#puzzle-right');
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

  const relato = $('#relato');
  $('#btn-gerar-relato')?.addEventListener('click',()=>{
    const g = n => document.querySelector('[name="'+n+'"]')?.value||'—';
    const bios = Array.from(document.querySelectorAll('.check input[type="checkbox"][data-score]')).filter(i=>i.checked).length;
    const biosTotal = document.querySelectorAll('.check input[type="checkbox"][data-score]').length;
    const seqOk = $('#quiz-feedback')?.classList.contains('ok') ? 'Correta' : 'Não validada/corrigida';
    const html = [
      '<div class="box">',
      '<h3>Resumo do Caso</h3>',
      '<p><b>Paciente:</b> '+g('nome')+' • <b>Nasc.:</b> '+g('nasc')+' • <b>Sexo:</b> '+g('sexo')+'</p>',
      '<p><b>Mãe:</b> '+g('mae')+' • <b>Documento:</b> '+g('doc')+'</p>',
      '<p><b>Unidade:</b> '+g('unidade')+' • <b>Amostra:</b> '+g('amostra')+'</p>',
      '<p><b>Exames (descrição):</b> '+g('exames-desc')+' • <b>Coleta:</b> '+g('datahora')+'</p>',
      '<p><b>Alergias:</b> '+g('alergias')+'</p>',
      '<p><b>Biossegurança:</b> '+bios+'/'+biosTotal+' marcadas</p>',
      '<p><b>Sequência de tubos:</b> '+seqOk+'</p>',
      '</div>'
    ].join('');
    relato.innerHTML = html;
  });

  const tutorFeed = $('#tutor-feed');
  const tutorAsk = $('#tutor-ask');
  const tutorInput = $('#tutor-input');
  const tutorCorrigir = $('#tutor-corrigir');
  function pushTutor(role,text){
    if (!tutorFeed) return;
    const msg=document.createElement('div');
    msg.style.marginBottom='8px';
    msg.innerHTML = '<b>'+role+':</b> '+text;
    tutorFeed.appendChild(msg);
    tutorFeed.scrollTop = tutorFeed.scrollHeight;
  }
  const quiz = [
    {q:'Ordem correta dos tubos:', a:'hemocultura>citrato>soro>heparina>edta>fluoreto'},
    {q:'Ângulo de punção recomendado:', a:'30-45'},
    {q:'Tempo máximo de garrote:', a:'60'}
  ];
  let qi=0;
  pushTutor('Tutor','Digite "quiz" para iniciar perguntas rápidas.');
  tutorAsk?.addEventListener('click',()=>{
    const text=tutorInput.value.trim();
    if(!text) return;
    pushTutor('Você', text);
    if (text.toLowerCase()==='quiz'){
      qi=0;
      pushTutor('Tutor', quiz[qi].q);
    } else if (qi<quiz.length){
      const ans=text.toLowerCase().replace(/\s+/g,'');
      const ok=ans.includes(quiz[qi].a.replace(/\s+/g,''));
      pushTutor('Tutor', ok ? 'Certo!' : 'Revise esse ponto.');
      qi++;
      if (qi<quiz.length) pushTutor('Tutor', quiz[qi].q);
      else pushTutor('Tutor','Fim do quiz.');
    } else {
      pushTutor('Tutor','Ok, registrado.');
    }
    tutorInput.value='';
  });
  tutorCorrigir?.addEventListener('click',()=>{
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
})();

  
     
 
