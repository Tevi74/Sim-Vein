(function(){
  const $=s=>document.querySelector(s);
  const $$=s=>Array.from(document.querySelectorAll(s));

  if('serviceWorker' in navigator){
    window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
  }

  function showTab(id){
    $$('.tab').forEach(el=>el.classList.toggle('active',el.id==='tab-'+id));
    $$('.nav .btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===id));
  }
  $$('.nav .btn').forEach(b=>b.addEventListener('click',()=>showTab(b.dataset.tab)));
  $('#welcome-start')?.addEventListener('click',()=>showTab('sequencia'));

  const dlg=$('#settings');
  $('#btn-settings')?.addEventListener('click',()=>dlg.showModal());
  $('#close-settings')?.addEventListener('click',()=>dlg.close());

  const ambient=$('#audio-ambiente');
  const toggleAmb=$('#toggle-ambiente');
  const ambientVol=$('#ambient-vol');

  function loadPrefs(){
    const on=localStorage.getItem('amb_on');
    const vol=localStorage.getItem('amb_vol');
    if(toggleAmb) toggleAmb.checked=on==='1';
    if(ambientVol&&vol) ambientVol.value=vol;
    applyAmbient();
  }
  function applyAmbient(){
    if(!ambient) return;
    ambient.volume=(ambientVol?ambientVol.value:35)/100;
    if(toggleAmb&&toggleAmb.checked){ambient.muted=false;ambient.play().catch(()=>{});}else{ambient.pause();ambient.muted=true;}
  }
  toggleAmb?.addEventListener('change',applyAmbient);
  ambientVol?.addEventListener('input',applyAmbient);
  $('#save-settings')?.addEventListener('click',()=>{
    localStorage.setItem('amb_on',toggleAmb?.checked?'1':'0');
    if(ambientVol) localStorage.setItem('amb_vol',ambientVol.value);
    dlg.close();
  });
  loadPrefs();

  let fxEl=new Audio();
  let fxBtn=null;
  document.addEventListener('click',e=>{
    const btn=e.target.closest('button[data-audio]');
    if(!btn) return;
    const label=btn.textContent.replace(/^(\▶|⏸)\s*/,'');
    const src=btn.getAttribute('data-audio');
    if(fxBtn===btn&&!fxEl.paused){
      fxEl.pause();fxEl.currentTime=0;btn.textContent='▶ '+label;fxBtn=null;return;
    }
    if(!fxEl.paused){fxEl.pause();fxEl.currentTime=0;}
    fxEl=new Audio(src);
    fxEl.play().catch(()=>{});
    if(fxBtn) fxBtn.textContent='▶ '+fxBtn.textContent.replace(/^(\▶|⏸)\s*/,'');
    btn.textContent='⏸ '+label;fxBtn=btn;
    fxEl.onended=()=>{if(fxBtn){fxBtn.textContent='▶ '+label;fxBtn=null;}};
  });

  const examesBox=$('#exames');
  const deduzidos=$('#deduzidos');
  $('#btn-deduzir')?.addEventListener('click',()=>{
    const ex=Array.from(examesBox.querySelectorAll('input:checked')).map(i=>i.value);
    const tubos=[];
    if(ex.includes('Hemocultura')) tubos.push('Hemocultura');
    tubos.push('Citrato','Soro','Heparina','EDTA','Fluoreto');
    if(ex.includes('VHS')) tubos.push('VHS');
    deduzidos.textContent=tubos.join(' • ');
  });

  const bank=$('#tube-bank');
  const drop=$('#tube-drop');
  const feedback=$('#quiz-feedback');
  const btnValidate=$('#btn-validate');
  const btnReset=$('#btn-reset');

  function dragSetup(img){img.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',img.dataset.id);});}
  $$('.tube').forEach(d=>dragSetup(d));

  if(drop){
    drop.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('empty');});
    drop.addEventListener('dragleave',()=>drop.classList.remove('empty'));
    drop.addEventListener('drop',e=>{
      e.preventDefault();drop.classList.remove('empty');
      const id=e.dataTransfer.getData('text/plain');
      const el=document.querySelector('.tube[data-id="'+id+'"]');
      if(el) drop.appendChild(el);
    });
  }
  if(bank){
    bank.addEventListener('dragover',e=>e.preventDefault());
    bank.addEventListener('drop',e=>{
      e.preventDefault();
      const id=e.dataTransfer.getData('text/plain');
      const el=document.querySelector('.tube[data-id="'+id+'"]');
      if(el) bank.appendChild(el);
    });
  }

  function idNum(id){const m=/^(\d+)-/.exec(id||'');return m?Number(m[1]):NaN;}
  function currentOrderFiltered(){
    const allowed=new Set([1,2,4,5,6,7]);
    return Array.from(drop.querySelectorAll('.tube')).map(t=>idNum(t.dataset.id)).filter(n=>allowed.has(n));
  }
  function hasTube(n){return Array.from(drop.querySelectorAll('.tube')).some(t=>idNum(t.dataset.id)===n);}
  function expectedSeq(){return hasTube(1)?[1,2,4,5,6,7]:[2,4,5,6,7];}

  btnValidate?.addEventListener('click',()=>{
    const now=currentOrderFiltered();
    const goal=expectedSeq();
    const ok=now.length===goal.length&&now.every((v,i)=>v===goal[i]);
    feedback.textContent=ok?'Sequência correta!':'Sequência incorreta. Tente novamente.';
    feedback.classList.toggle('ok',ok);
    feedback.classList.toggle('bad',!ok);
  });
  btnReset?.addEventListener('click',()=>{
    Array.from(drop.querySelectorAll('.tube')).forEach(t=>bank.appendChild(t));
    feedback.textContent='';feedback.classList.remove('ok','bad');
  });

  const left=$('#puzzle-left');
  const right=$('#puzzle-right');
  if(left&&right){
    left.querySelectorAll('.piece').forEach(p=>{
      p.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',p.dataset.key);});
    });
    right.querySelectorAll('.slot').forEach(s=>{
      s.addEventListener('dragover',e=>e.preventDefault());
      s.addEventListener('drop',e=>{
        e.preventDefault();
        const key=e.dataTransfer.getData('text/plain');
        if(s.dataset.accept===key){
          s.classList.add('correct');
          const piece=left.querySelector('.piece[data-key="'+key+'"]');
          if(piece) piece.remove();
        }else{
          s.classList.add('hover');
          setTimeout(()=>s.classList.remove('hover'),400);
        }
      });
    });
  }

  const relato=$('#relato');
  $('#btn-gerar-relato')?.addEventListener('click',()=>{
    const g=n=>document.querySelector('[name="'+n+'"]')?.value||'—';
    const bios=Array.from(document.querySelectorAll('.check input[type="checkbox"][data-score]')).filter(i=>i.checked).length;
    const biosTotal=document.querySelectorAll('.check input[type="checkbox"][data-score]').length;
    const seqOk=$('#quiz-feedback')?.classList.contains('ok')?'Correta':'Não validada/corrigida';
    relato.innerHTML=[
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
  });

  const tutorFeed=$('#tutor-feed');
  const tutorAsk=$('#tutor-ask');
  const tutorInput=$('#tutor-input');
  const tutorCorrigir=$('#tutor-corrigir');
  function pushTutor(role,text){
    const msg=document.createElement('div');
    msg.style.marginBottom='8px';
    msg.innerHTML='<b>'+role+':</b> '+text;
    tutorFeed.appendChild(msg);
    tutorFeed.scrollTop=tutorFeed.scrollHeight;
  }
  pushTutor('Tutor','Digite "quiz" para iniciar, ou clique em "Corrigir sequência".');

  const quiz=[
    {q:'Ordem dos tubos sem hemocultura?',a:'citrato>soro>heparina>edta>fluoreto'},
    {q:'Ordem com hemocultura?',a:'hemocultura>citrato>soro>heparina>edta>fluoreto'},
    {q:'Ângulo de punção recomendado (°)?',a:'30-45'},
    {q:'Tempo máximo de garrote (s)?',a:'60'}
  ];
  let qi=-1;
  function tutorSend(){
    const text=tutorInput.value.trim();
    if(!text) return;
    pushTutor('Você',text);
    if(text.toLowerCase()==='quiz'){qi=0;pushTutor('Tutor',quiz[qi].q);}
    else if(qi>=0&&qi<quiz.length){
      const ans=text.toLowerCase().replace(/\s+/g,'');
      const ok=ans.includes(quiz[qi].a.replace(/\s+/g,''));
      pushTutor('Tutor',ok?'Certo!':'Revise esse ponto.');
      qi++;
      if(qi<quiz.length) pushTutor('Tutor',quiz[qi].q); else {pushTutor('Tutor','Fim do quiz.');qi=-1;}
    }else{
      pushTutor('Tutor','Ok.');
    }
    tutorInput.value='';
  }
  tutorAsk?.addEventListener('click',tutorSend);
  tutorInput?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();tutorSend();}});

  tutorCorrigir?.addEventListener('click',()=>{
    const cur=currentOrderFiltered();
    const withHemo=cur[0]===1;
    const goal=withHemo?[1,2,4,5,6,7]:[2,4,5,6,7];
    const ok=cur.length===goal.length&&cur.every((v,i)=>v===goal[i]);
    if(ok){pushTutor('Tutor','Sequência correta.');return;}
    const dicas=[];
    const pos=n=>cur.indexOf(n);
    if(withHemo&&pos(1)!==0) dicas.push('Se houver hemocultura, ela deve vir primeiro.');
    if(pos(2)>pos(4)&&pos(2)!==-1&&pos(4)!==-1) dicas.push('Citrato deve vir antes de Soro.');
    if(pos(4)>pos(5)&&pos(5)!==-1) dicas.push('Soro deve vir antes de Heparina.');
    if(pos(5)>pos(6)&&pos(6)!==-1) dicas.push('Heparina deve vir antes de EDTA.');
    if(pos(6)>pos(7)&&pos(7)!==-1) dicas.push('EDTA deve vir antes de Fluoreto.');
    pushTutor('Tutor',dicas.length?dicas.join(' '):'Reorganize e valide novamente.');
  });

  const gasoQuiz=[
    {q:'Qual é o local mais utilizado para coleta de gasometria arterial?',opts:['Veia jugular','Artéria radial','Veia cefálica','Artéria femoral'],a:1},
    {q:'O que o valor de pCO₂ na gasometria arterial representa?',opts:['Oxigenação sanguínea','Ventilação pulmonar','Capacidade de transporte de O₂','Metabolismo hepático'],a:1},
    {q:'pH 7,25 / pCO₂ 60 / HCO₃⁻ 24. Distúrbio?',opts:['Acidose metabólica','Acidose respiratória','Alcalose respiratória','Alcalose metabólica'],a:1},
    {q:'pH 7,50 / pCO₂ 30 / HCO₃⁻ 24. Distúrbio?',opts:['Acidose metabólica','Alcalose respiratória','Acidose respiratória','Alcalose metabólica'],a:1},
    {q:'Em qual situação a gasometria arterial é mais indicada?',opts:['Avaliar perfil lipídico','Monitorar ventilação mecânica','Diagnosticar anemia ferropriva','Avaliar função hepática'],a:1}
  ];
  const gqQ=$('#gq-q');
  const gqOps=$('#gq-options');
  const gqNext=$('#gq-next');
  const gqFb=$('#gq-feedback');
  let gqI=0,gqSel=-1,gqScore=0;
  function renderGaso(){
    const item=gasoQuiz[gqI];
    gqQ.textContent='Q'+(gqI+1)+': '+item.q;
    gqOps.innerHTML='';gqSel=-1;gqFb.textContent='';
    item.opts.forEach((t,i)=>{
      const b=document.createElement('button');
      b.className='btn ghost';
      b.style.color='#e6f0ff';
      b.textContent=String.fromCharCode(97+i)+') '+t;
      b.style.textAlign='left';
      b.addEventListener('click',()=>{
        gqSel=i;
        gqOps.querySelectorAll('button').forEach(x=>x.classList.remove('active'));
        b.classList.add('active');
        const ok=i===item.a;
        gqFb.textContent=ok?'Correta':'Incorreta';
        gqFb.classList.toggle('ok',ok);
        gqFb.classList.toggle('bad',!ok);
        if(ok) gqScore++;
      });
      gqOps.appendChild(b);
    });
  }
  if(gqQ&&gqOps&&gqNext&&gqFb){
    renderGaso();
    gqNext.addEventListener('click',()=>{
      if(gqI<gasoQuiz.length-1){gqI++;renderGaso();}
      else{gqQ.textContent='Fim do quiz. Pontuação: '+gqScore+'/'+gasoQuiz.length;gqOps.innerHTML='';gqNext.disabled=true;}
    });
  }

  const gasoCases=[
    {t:'DPOC em exacerbação',v:{pH:'7,28',pCO2:'70',HCO3:'26',pO2:'58',Sat:'86%'},r:'Acidose respiratória descompensada',exp:'pH baixo; pCO₂ alto; HCO₃⁻ normal.'},
    {t:'Cetoacidose diabética',v:{pH:'7,15',pCO2:'28',HCO3:'10',pO2:'95',Sat:'98%'},r:'Acidose metabólica com compensação respiratória',exp:'pH baixo; HCO₃⁻ baixo; pCO₂ baixo.'},
    {t:'Crise de ansiedade',v:{pH:'7,55',pCO2:'25',HCO3:'24',pO2:'100',Sat:'99%'},r:'Alcalose respiratória aguda',exp:'pH alto; pCO₂ baixo; HCO₃⁻ normal.'},
    {t:'Sepse grave',v:{pH:'7,20',pCO2:'30',HCO3:'14',pO2:'60',Sat:'85%'},r:'Acidose metabólica com hipoxemia',exp:'HCO₃⁻ baixo; pO₂ reduzido.'},
    {t:'Vômitos prolongados',v:{pH:'7,52',pCO2:'46',HCO3:'34',pO2:'95',Sat:'97%'},r:'Alcalose metabólica com compensação respiratória',exp:'HCO₃⁻ alto; pCO₂ alto.'}
  ];
  const gasoCasesEl=$('#gaso-cases');
  if(gasoCasesEl){
    gasoCases.forEach((c,idx)=>{
      const d=document.createElement('details');
      const s=document.createElement('summary');
      s.textContent=(idx+1)+'. '+c.t+' — pH '+c.v.pH+' | pCO₂ '+c.v.pCO2+' | HCO₃⁻ '+c.v.HCO3+' | pO₂ '+c.v.pO2+' | Sat '+c.v.Sat;
      d.appendChild(s);
      const p=document.createElement('p');
      p.innerHTML='<b>Resposta:</b> '+c.r+'<br><b>Raciocínio:</b> '+c.exp;
      d.appendChild(p);
      gasoCasesEl.appendChild(d);
    });
  }

  const hemiQuiz=[
    {q:'Qual anticoagulante é indicado para hemograma (CBC)?',opts:['Citrato','Heparina','EDTA','Fluoreto'],a:2},
    {q:'Aumento de eosinófilos sugere com mais frequência:',opts:['Infecção bacteriana','Reação alérgica ou parasitose','Hemólise intravascular','Doença hepática'],a:1},
    {q:'Blastos circulantes em esfregaço periférico sugerem:',opts:['Deficiência de ferro','Leucemia aguda','Anemia hemolítica autoimune','Plaquetopenia por consumo'],a:1},
    {q:'Plaquetas participam principalmente de:',opts:['Transporte de O₂','Resposta imune humoral','Coagulação primária','Equilíbrio ácido-básico'],a:2},
    {q:'LDH e bilirrubina indireta elevadas com Hb baixa sugerem:',opts:['Colestase','Hemólise','Hipotireoidismo','Hipercolesterolemia'],a:1}
  ];
  const hqQ=$('#hq-q');
  const hqOps=$('#hq-options');
  const hqNext=$('#hq-next');
  const hqFb=$('#hq-feedback');
  let hqI=0,hqScore=0;
  function renderHemi(){
    const item=hemiQuiz[hqI];
    hqQ.textContent='Q'+(hqI+1)+': '+item.q;
    hqOps.innerHTML='';hqFb.textContent='';
    item.opts.forEach((t,i)=>{
      const b=document.createElement('button');
      b.className='btn ghost';
      b.style.color='#e6f0ff';
      b.textContent=String.fromCharCode(97+i)+') '+t;
      b.style.textAlign='left';
      b.addEventListener('click',()=>{
        const ok=i===item.a;
        hqFb.textContent=ok?'Correta':'Incorreta';
        hqFb.classList.toggle('ok',ok);
        hqFb.classList.toggle('bad',!ok);
        if(ok) hqScore++;
        hqOps.querySelectorAll('button').forEach(x=>x.disabled=true);
      });
      hqOps.appendChild(b);
    });
  }
  if(hqQ&&hqOps&&hqNext&&hqFb){
    renderHemi();
    hqNext.addEventListener('click',()=>{
      if(hqI<hemiQuiz.length-1){hqI++;renderHemi();}
      else{hqQ.textContent='Fim do quiz. Pontuação: '+hqScore+'/'+hemiQuiz.length;hqOps.innerHTML='';hqNext.disabled=true;}
    });
  }

  const hemiCases=[
    {t:'Anemia ferropriva',v:'Hb 9,2 g/dL; VCM 72 fL; HCM 24 pg; RDW ↑; Ferritina baixa.',r:'Anemia microcítica hipocrômica por deficiência de ferro.',exp:'VCM/HCM baixos e ferritina baixa são típicos.'},
    {t:'Leucemia linfoblástica aguda',v:'Leucócitos 45.000/µL; Blastos no sangue; Plaquetas 70.000/µL.',r:'LLA provável.',exp:'Presença de blastos periféricos e plaquetopenia.'},
    {t:'Trombocitopenia imune',v:'Plaquetas 22.000/µL; Hb e leucócitos normais.',r:'PTI provável.',exp:'Plaquetopenia isolada com séries preservadas.'},
    {t:'Reação alérgica',v:'Eosinófilos 9%; IgE elevada.',r:'Eosinofilia por alergia.',exp:'Eosinofilia e IgE alta sugerem alergia/parasitas.'},
    {t:'Hemólise',v:'Hb 10 g/dL; Bilirrubina indireta ↑; LDH ↑; Haptoglobina baixa.',r:'Anemia hemolítica.',exp:'Marcadores de destruição de hemácias.'}
  ];
  const hemiCasesEl=$('#hemi-cases');
  if(hemiCasesEl){
    hemiCases.forEach((c,idx)=>{
      const d=document.createElement('details');
      const s=document.createElement('summary');
      s.textContent=(idx+1)+'. '+c.t+' — '+c.v;
      d.appendChild(s);
      const p=document.createElement('p');
      p.innerHTML='<b>Resposta:</b> '+c.r+'<br><b>Raciocínio:</b> '+c.exp;
      d.appendChild(p);
      hemiCasesEl.appendChild(d);
    });
  }

  const glossGroups=[
    {g:'Hemato-Imune',items:[
      {k:'Eritrócito',v:'Célula anucleada repleta de hemoglobina, responsável pelo transporte de oxigênio dos pulmões aos tecidos e de dióxido de carbono no sentido oposto. Vida média ~120 dias; alterações de forma e volume auxiliam no diagnóstico de anemias.'},
      {k:'Hemoglobina',v:'Metaloproteína com ferro capaz de ligar O₂ e CO₂. Concentração baixa define anemias; variantes estruturais caracterizam hemoglobinopatias.'},
      {k:'Plaquetas (trombócitos)',v:'Fragmentos citoplasmáticos de megacariócitos. Essenciais na hemostasia primária (adesão, ativação, agregação).'},
      {k:'Neutrófilos',v:'Defesa contra bactérias por fagocitose e explosão respiratória. Neutrofilia sugere infecção/inflamação; neutropenia aumenta risco infeccioso.'},
      {k:'Linfócitos T',v:'Imunidade celular; CD4+ coordenam respostas; CD8+ promovem citotoxicidade.'},
      {k:'Linfócitos B',v:'Imunidade humoral com produção de anticorpos após diferenciação em plasmócitos.'},
      {k:'Eosinófilos',v:'Atuam em parasitoses e alergias; grânulos com proteínas citotóxicas.'},
      {k:'Basófilos',v:'Reações de hipersensibilidade imediata; liberação de histamina e heparina.'},
      {k:'Blastos',v:'Precursores hematopoéticos imaturos; circulação periférica sugere leucemia aguda.'}
    ]},
    {g:'Bioquímica Clínica',items:[
      {k:'Creatinina',v:'Estimador da filtração glomerular; elevações indicam disfunção renal.'},
      {k:'Ureia',v:'Produto do metabolismo proteico; aumenta em insuficiência renal, catabolismo e desidratação.'},
      {k:'TGO (AST)',v:'Transaminase de fígado, músculo e coração; eleva-se em hepatite e lesão muscular.'},
      {k:'TGP (ALT)',v:'Transaminase mais específica do fígado; aumento sugere dano hepatocelular.'},
      {k:'Bilirrubina',v:'Pigmento do heme; indireta alta sugere hemólise/defeito de conjugação, direta alta sugere colestase.'},
      {k:'Colesterol LDL',v:'Principal lipoproteína aterogênica; alvo terapêutico cardiovascular.'},
      {k:'Colesterol HDL',v:'Retorno do colesterol; níveis maiores são protetores.'},
      {k:'Troponina',v:'Marcador de necrose miocárdica; diagnóstico de síndrome coronariana aguda.'},
      {k:'Triglicerídeos',v:'Gorduras circulantes; níveis altos associam-se a risco cardiometabólico e pancreatite.'}
    ]},
    {g:'Gasometria',items:[
      {k:'pH',v:'Acidez do sangue; baixo = acidose, alto = alcalose.'},
      {k:'pCO₂',v:'Componente respiratório; aumento causa acidose respiratória, queda causa alcalose respiratória.'},
      {k:'HCO₃⁻',v:'Componente metabólico/renal; baixo em acidose metabólica, alto em alcalose metabólica.'},
      {k:'pO₂',v:'Oxigenação arterial.'},
      {k:'SatO₂',v:'Percentual de hemoglobina saturada por oxigênio.'}
    ]},
    {g:'Coleta e Dispositivos',items:[
      {k:'Punção venosa',v:'Acesso periférico com sistema a vácuo ou seringa para coleta.'},
      {k:'Punção arterial',v:'Coleta na artéria radial para gasometria com seringa heparinizada e compressão rigorosa.'},
      {k:'Torniquete/garrote',v:'Aplicação breve para turgência venosa; tempo prolongado causa hemoconcentração.'},
      {k:'Assepsia',v:'Fricção com antisséptico antes da punção.'},
      {k:'Ordem de coleta',v:'Citrato → Soro → Heparina → EDTA → Fluoreto; com Hemocultura no início quando prescrita.'},
      {k:'Seringa',v:'Aspirar sangue quando indicado; uso inadequado aumenta hemólise.'},
      {k:'Agulha scalp',v:'Agulha com asas, útil em veias frágeis e pediatria.'},
      {k:'Jelco (PIV)',v:'Cateter venoso periférico flexível para infusão e coletas iniciais.'},
      {k:'Vacutainer',v:'Sistema fechado com tubos a vácuo, padrão laboratorial.'},
      {k:'Capilar',v:'Coletas capilares e hematócrito.'},
      {k:'Sonda arterial heparinizada',v:'Dispositivo para gasometria arterial com anticoagulação adequada.'}
    ]}
  ];
  const glossWrap=$('#tutor-gloss-groups');
  const tp=$('#tutor-pop');
  const tpTitle=$('#tp-title');
  const tpText=$('#tp-text');
  const tpClose=$('#tp-close');

  function renderGloss(){
    if(!glossWrap) return;
    glossWrap.innerHTML='';
    glossGroups.forEach(group=>{
      const box=document.createElement('div');
      box.className='box';
      const h=document.createElement('h4');
      h.textContent=group.g;
      box.appendChild(h);
      const grid=document.createElement('div');
      grid.style.display='grid';
      grid.style.gridTemplateColumns='repeat(auto-fill,minmax(240px,1fr))';
      grid.style.gap='10px';
      group.items.forEach(item=>{
        const card=document.createElement('button');
        card.className='card';
        card.style.justifyContent='flex-start';
        card.style.textAlign='left';
        card.style.color='#e6f0ff';
        card.innerHTML='<span>'+item.k+'</span>';
        card.addEventListener('click',()=>{
          tpTitle.textContent=item.k;
          tpText.innerHTML='<p style="line-height:1.6;margin:0">'+item.v+'</p>';
          tp.showModal();
        });
        grid.appendChild(card);
      });
      box.appendChild(grid);
      glossWrap.appendChild(box);
    });
  }
  renderGloss();
  tpClose?.addEventListener('click',()=>tp.close());
})();
