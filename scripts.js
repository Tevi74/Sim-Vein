// Navegação entre abas
const tabs = document.querySelectorAll('.tab');
const navButtons = document.querySelectorAll('.nav .btn[data-tab]');

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active de todas as abas e botões
        tabs.forEach(t => t.classList.remove('active'));
        navButtons.forEach(b => b.classList.remove('active'));
        
        // Adiciona active na aba e botão clicado
        document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
        btn.classList.add('active');
    });
});

// Áudio ambiente + botões de áudio opcionais
const audioAmb = document.getElementById('audio-ambiente');
document.querySelectorAll('.audio-controls [data-audio]').forEach(b => {
    b.addEventListener('click', () => {
        const src = b.getAttribute('data-audio');
        const a = new Audio(src);
        a.volume = 0.7;
        a.play().catch(() => {});
    });
});

// Configurações (API key e áudio ambiente)
const dlg = document.getElementById('settings');
document.getElementById('btn-settings').addEventListener('click', () => dlg.showModal());
document.getElementById('close-settings').addEventListener('click', () => dlg.close());
document.getElementById('save-settings').addEventListener('click', () => {
    const key = document.getElementById('openai-key').value.trim();
    const amb = document.getElementById('toggle-ambiente').checked;
    const assistantId = document.getElementById('assistant-id').value.trim();
    
    if (key) localStorage.setItem('OPENAI_API_KEY', key); 
    else localStorage.removeItem('OPENAI_API_KEY');
    
    if (assistantId) localStorage.setItem('OPENAI_ASSISTANT_ID', assistantId);
    else localStorage.removeItem('OPENAI_ASSISTANT_ID');
    
    localStorage.setItem('AMB', amb ? '1' : '0');
    
    if (amb) { 
        audioAmb.volume = 0.2; 
        audioAmb.play().catch(() => {}); 
    } else { 
        audioAmb.pause(); 
    }
    dlg.close();
});

// Restaurar prefs
(function() {
    const amb = localStorage.getItem('AMB') === '1';
    document.getElementById('toggle-ambiente').checked = amb;
    if (amb) { 
        audioAmb.volume = 0.2; 
        audioAmb.play().catch(() => {}); 
    }
    
    const key = localStorage.getItem('OPENAI_API_KEY') || '';
    document.getElementById('openai-key').value = key;
    
    const assistantId = localStorage.getItem('OPENAI_ASSISTANT_ID') || '';
    document.getElementById('assistant-id').value = assistantId;
})();

// Banner se arm-360 ausente - CORRIGIDO CAMINHO
const img360 = document.getElementById('arm360');
const banner = document.getElementById('banner');
if (img360) {
    img360.addEventListener('error', () => {
        banner.textContent = '⚠️ Imagem 360 ausente. Coloque assets/arm-360.jpg (equiretangular 2:1).';
        banner.hidden = false;
        document.getElementById('missing360')?.removeAttribute('hidden');
        document.getElementById('sky')?.setAttribute('visible', 'false');
    });
    
    // Verificar se a imagem carregou corretamente
    img360.addEventListener('load', () => {
        banner.hidden = true;
        document.getElementById('missing360')?.setAttribute('hidden', 'true');
    });
}

// Hotspots (mostrar painel) - CORRIGIDO
const hsPanel = document.getElementById('hotspot-panel');
const hsTitle = document.getElementById('hs-title');
const hsText = document.getElementById('hs-text');
const scene = document.querySelector('a-scene');

if (scene) {
    scene.addEventListener('loaded', () => {
        const spots = scene.querySelectorAll('.hotspot');
        spots.forEach(h => {
            h.addEventListener('click', e => {
                const el = e.target;
                hsTitle.textContent = el.dataset.title || 'Veia';
                hsText.textContent = el.dataset.text || '';
                hsPanel.hidden = false;
                
                // Auto-esconder após 5 segundos
                setTimeout(() => {
                    hsPanel.hidden = true;
                }, 5000);
            });
        });
    });
}

// Salvar ficha de paciente (melhorado)
document.getElementById('btn-salvar-paciente')?.addEventListener('click', () => {
    const form = document.getElementById('form-paciente');
    const data = Object.fromEntries(new FormData(form).entries());
    
    // Validação básica
    if (!data.nome || !data.nasc) {
        alert('⚠️ Preencha nome e data de nascimento.');
        return;
    }
    
    localStorage.setItem('FICHA_PACIENTE', JSON.stringify(data));
    
    // Feedback visual
    const btn = document.getElementById('btn-salvar-paciente');
    const originalText = btn.textContent;
    btn.textContent = '✅ Salvo!';
    btn.style.background = 'var(--ok)';
    
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
    }, 2000);
});

// Deduzir tubos pela solicitação - CORRIGIDO (VHS adicionado)
const mapaTubos = {
    'Hemocultura': 'Hemocultura',
    'TP/TTPa': 'Citrato (Azul)',
    'Hemograma': 'EDTA (Roxo)',
    'Glicose': 'Fluoreto (Cinza)',
    'Eletrólitos': 'Heparina (Verde)',
    'Sorologia/Hormônios': 'Soro (Vermelho/Amarelo)',
    'VHS': 'VHS (Preto)'
};

document.getElementById('btn-deduzir')?.addEventListener('click', () => {
    const checks = document.querySelectorAll('#exames input:checked');
    const tubos = new Set();
    
    checks.forEach(c => {
        const t = mapaTubos[c.value];
        if (t) tubos.add(t);
    });
    
    const out = Array.from(tubos).join(' • ');
    const el = document.getElementById('deduzidos');
    
    if (out) {
        el.textContent = `Tubos necessários: ${out}`;
        el.style.display = 'block';
    } else {
        el.textContent = 'Nenhum exame selecionado.';
        el.style.display = 'none';
    }
    
    // Mostrar/ocultar tubo VHS baseado na seleção
    const vhsChecked = Array.from(checks).some(c => c.value === 'VHS');
    document.querySelector('.tube-vhs').style.display = vhsChecked ? 'block' : 'none';
});

// Cronômetro de garrote - MELHORADO
let garroteInterval = null, sec = 0;

function fmt(s) {
    const m = Math.floor(s / 60);
    const r = (s % 60);
    return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

const tmr = document.getElementById('garrote-timer');
const alertG = document.getElementById('garrote-alert');
const startBtn = document.getElementById('garrote-start');
const stopBtn = document.getElementById('garrote-stop');

startBtn?.addEventListener('click', () => {
    if (garroteInterval) return;
    
    sec = 0; 
    tmr.textContent = '00:00'; 
    alertG.hidden = true;
    tmr.style.color = '';
    
    garroteInterval = setInterval(() => {
        sec++; 
        tmr.textContent = fmt(sec);
        
        if (sec > 60) {
            alertG.hidden = false;
            tmr.style.color = 'var(--bad)';
        } else if (sec > 45) {
            tmr.style.color = 'var(--warn)';
        }
    }, 1000);
    
    stopBtn.disabled = false;
    startBtn.disabled = true;
});

stopBtn?.addEventListener('click', () => {
    clearInterval(garroteInterval); 
    garroteInterval = null;
    stopBtn.disabled = true;
    startBtn.disabled = false;
});

// Validação de ângulo (30–45°) - MELHORADO
const angle = document.getElementById('angle');
const angleVal = document.getElementById('angle-val');
const angleFb = document.getElementById('angle-feedback');

if (angle) {
    const checkAngle = () => {
        const v = +angle.value;
        angleVal.textContent = `${v}°`;
        
        if (v >= 30 && v <= 45) {
            angleFb.textContent = '✅ Correto (30–45°)';
            angleFb.style.background = 'rgba(18,184,134,.1)';
            angleFb.style.borderColor = 'var(--ok)';
            angleFb.style.color = 'var(--ok)';
        } else {
            angleFb.textContent = '⚠️ Fora do ideal (30–45°)';
            angleFb.style.background = 'rgba(224,49,49,.1)';
            angleFb.style.borderColor = 'var(--bad)';
            angleFb.style.color = 'var(--bad)';
        }
    };
    
    angle.addEventListener('input', checkAngle);
    checkAngle(); // Verificação inicial
}

// Sequência de coleta (drag & drop) - CORRIGIDA ORDEM
const bank = document.getElementById('tube-bank');
const drop = document.getElementById('tube-drop');
const btnValidate = document.getElementById('btn-validate');
const btnReset = document.getElementById('btn-reset');
const feedback = document.getElementById('quiz-feedback');

// ORDEM CORRIGIDA - sequência real de coleta
const correctOrder = [
    '1-hemocultura', 
    '2-citrato', 
    '3-vhs',       // VHS antes do soro (se presente)
    '4-soro', 
    '5-heparina', 
    '6-edta', 
    '7-fluoreto'
];

let dragItem = null;

function handleDragStart(e) { 
    dragItem = e.target; 
    e.dataTransfer.setData('text/plain', e.target.dataset.id);
}

function handleDragOver(e) { 
    e.preventDefault(); 
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) { 
    e.preventDefault(); 
    e.currentTarget.classList.remove('drag-over');
    
    if (dragItem) { 
        // Verificar se está dropando no banco ou na área de drop
        if (e.currentTarget === drop) {
            e.currentTarget.appendChild(dragItem);
        } else {
            bank.appendChild(dragItem);
        }
        dragItem = null; 
    }
}

// Configurar drag and drop
document.querySelectorAll('.tube').forEach(t => {
    t.addEventListener('dragstart', handleDragStart);
    t.addEventListener('dragend', () => {
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    });
});

[bank, drop].forEach(box => {
    box.addEventListener('dragover', handleDragOver);
    box.addEventListener('dragleave', handleDragLeave);
    box.addEventListener('drop', handleDrop);
});

btnReset?.addEventListener('click', () => {
    feedback.textContent = ''; 
    feedback.className = 'feedback';
    Array.from(drop.querySelectorAll('.tube')).forEach(p => bank.appendChild(p));
    drop.classList.remove('empty');
});

btnValidate?.addEventListener('click', () => {
    const placed = Array.from(drop.querySelectorAll('.tube')).map(t => t.dataset.id);
    
    // Filtrar apenas tubos que deveriam estar presentes
    const expectedOrder = correctOrder.filter(id => {
        if (id === '3-vhs') {
            return document.querySelector('.tube-vhs').style.display !== 'none';
        }
        return true;
    });
    
    if (placed.length !== expectedOrder.length) {
        feedback.textContent = `Ainda faltam tubos. Complete a sequência (${expectedOrder.length} tubos).`; 
        feedback.className = 'feedback bad'; 
        return;
    }
    
    const ok = placed.every((id, i) => id === expectedOrder[i]);
    
    if (ok) { 
        feedback.textContent = '🎉 Perfeito! Ordem correta da coleta.'; 
        feedback.className = 'feedback ok'; 
    } else {
        const idx = placed.findIndex((id, i) => id !== expectedOrder[i]);
        feedback.textContent = `Verifique a posição ${idx + 1}. A ordem está incorreta.`; 
        feedback.className = 'feedback bad';
    }
});

// Quebra-cabeça Tubo ↔ Aplicação - CORRIGIDO
const pieces = document.querySelectorAll('.piece');
const slots = document.querySelectorAll('.slot');
let dragging = null;

pieces.forEach(p => {
    p.addEventListener('dragstart', (e) => {
        dragging = p;
        e.dataTransfer.setData('text/plain', p.dataset.key);
        p.classList.add('dragging');
    });
    
    p.addEventListener('dragend', () => {
        dragging = null;
        p.classList.remove('dragging');
    });
});

slots.forEach(s => {
    s.addEventListener('dragover', e => {
        e.preventDefault();
        s.classList.add('hover');
    });
    
    s.addEventListener('dragleave', () => {
        s.classList.remove('hover');
    });
    
    s.addEventListener('drop', e => {
        e.preventDefault();
        s.classList.remove('hover');
        
        if (!dragging) return;
        
        if (s.dataset.accept === dragging.dataset.key) {
            s.classList.add('correct');
            s.innerHTML = s.textContent + ' <span style="color:var(--ok)">✓</span>';
            dragging.setAttribute('draggable', 'false');
            dragging.classList.add('correct');
            dragging.style.opacity = '0.6';
        } else {
            s.classList.add('incorrect');
            setTimeout(() => s.classList.remove('incorrect'), 1000);
        }
        
        dragging = null;
        
        // Verificar se todas estão corretas
        checkPuzzleCompletion();
    });
});

function checkPuzzleCompletion() {
    const correctPieces = document.querySelectorAll('.piece.correct');
    if (correctPieces.length === pieces.length) {
        setTimeout(() => {
            alert('🎉 Parabéns! Todas as associações estão corretas!');
        }, 500);
    }
}

// Relatório (soma simples de indicadores) - MELHORADO
document.getElementById('btn-gerar-relato')?.addEventListener('click', () => {
    const ficha = JSON.parse(localStorage.getItem('FICHA_PACIENTE') || '{}');
    const bioChecks = document.querySelectorAll('#tab-biosseg input[type=checkbox]:checked').length;
    const angleScore = (angle && +angle.value >= 30 && +angle.value <= 45) ? 1 : 0;
    const garroteScore = (sec > 0 && sec <= 60 && !garroteInterval) ? 1 : 0;
    
    // Verificar sequência
    const placed = Array.from(drop.querySelectorAll('.tube')).map(t => t.dataset.id);
    const expectedOrder = correctOrder.filter(id => id !== '3-vhs' || document.querySelector('.tube-vhs').style.display !== 'none');
    const sequenceScore = placed.length === expectedOrder.length && 
                         placed.every((id, i) => id === expectedOrder[i]) ? 1 : 0;
    
    const totalScore = bioChecks + angleScore + garroteScore + sequenceScore;
    const maxScore = 9 + 2; // 9 biosseg + ângulo + garrote + sequência
    
    const relato = `
    <div class="relatorio">
        <h3>📊 Relatório de Desempenho</h3>
        <p><b>Paciente:</b> ${ficha.nome || '-'} (${ficha.nasc || '-'})</p>
        <p><b>Biossegurança:</b> ${bioChecks}/9 itens</p>
        <p><b>Ângulo de punção:</b> ${angleScore ? '✅ Correto' : '❌ Fora do ideal'}</p>
        <p><b>Tempo de garrote:</b> ${garroteScore ? '✅ Adequado' : '❌ Excedido'}</p>
        <p><b>Sequência de coleta:</b> ${sequenceScore ? '✅ Correta' : '❌ Incorreta'}</p>
        <p><b>Pontuação geral:</b> ${totalScore}/${maxScore}</p>
        <hr>
        <small><i>*Relatório didático. Não substitui prática supervisionada.*</i></small>
    </div>`;
    
    document.getElementById('relato').innerHTML = relato;
});

// Tutor IA - CORRIGIDO E MELHORADO
const tutorFeed = document.getElementById('tutor-feed');
const tutorInput = document.getElementById('tutor-input');
const tutorAsk = document.getElementById('tutor-ask');
const tutorCorrigir = document.getElementById('tutor-corrigir');

function addTutorMessage(message, isUser = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `tutor-msg ${isUser ? 'user' : 'assistant'}`;
    msgDiv.innerHTML = `<strong>${isUser ? 'Você' : 'Tutor'}:</strong> ${message}`;
    msgDiv.style.padding = '8px';
    msgDiv.style.margin = '4px 0';
    msgDiv.style.background = isUser ? 'rgba(108,99,255,.1)' : 'rgba(46,196,182,.1)';
    msgDiv.style.borderRadius = '8px';
    
    tutorFeed.appendChild(msgDiv);
    tutorFeed.scrollTop = tutorFeed.scrollHeight;
}

async function tutorExplain(question, context = {}) {
    // Respostas locais para questões comuns
    const respostasLocais = {
        'sequencia': 'A ordem correta é: 1) Hemocultura, 2) Citrato (azul), 3) VHS (se solicitado), 4) Soro (vermelho), 5) Heparina (verde), 6) EDTA (roxo), 7) Fluoreto (cinza).',
        'ângulo': 'O ângulo ideal é 30-45°. Menor que 30° pode não penetrar a veia, maior que 45° pode transfixar.',
        'garrote': 'O garrote deve ser aplicado por no máximo 60 segundos para evitar hemólise.',
        'biossegurança': 'Lembre-se: EPIs completos, antissepsia rigorosa, descarte adequado de perfuro-cortantes.'
    };
    
    // Tentar match com respostas locais
    const perguntaLower = question.toLowerCase();
    for (const [key, resposta] of Object.entries(respostasLocais)) {
        if (perguntaLower.includes(key)) {
            return resposta;
        }
    }
    
    // OpenAI opcional
    const key = localStorage.getItem('OPENAI_API_KEY');
    if (!key) {
        return '💡 Dica: Configure uma API key nas configurações (⚙️) para respostas mais detalhadas.';
    }
    
    try {
        const resp = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'Você é um tutor especializado em coleta venosa. Seja conciso (máximo 100 palavras), técnico mas acessível. Foque em procedimentos seguros.'
                    },
                    {
                        role: 'user',
                        content: `Pergunta: ${question}\nContexto: ${JSON.stringify(context)}`
                    }
                ],
                temperature: 0.3,
                max_tokens: 200
            })
        });
        
        if (!resp.ok) throw new Error('Erro na API');
        
        const data = await resp.json();
        return data?.choices?.[0]?.message?.content?.trim() || 'Sem resposta da IA.';
    } catch (e) {
        return '⚠️ Erro de conexão. Verifique sua API key.';
    }
}

tutorAsk?.addEventListener('click', async () => {
    const question = tutorInput.value.trim();
    if (!question) return;
    
    addTutorMessage(question, true);
    tutorInput.value = '';
    
    const response = await tutorExplain(question);
    addTutorMessage(response, false);
});

tutorInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        tutorAsk.click();
    }
});

tutorCorrigir?.addEventListener('click', () => {
    addTutorMessage('Analisando seu desempenho atual...', false);
    
    setTimeout(() => {
        const dicas = [
            '✅ Verifique se todos os EPIs estão marcados na biossegurança',
            '📋 Confirme a ordem dos tubos na sequência de coleta',
            '⏱️ Lembre-se do tempo máximo de 60s para o garrote',
            '📐 Ajuste o ângulo para entre 30-45°'
        ];
        
        const dicaAleatoria = dicas[Math.floor(Math.random() * dicas.length)];
        addTutorMessage(dicaAleatoria, false);
    }, 1000);
});

// Mensagem de boas-vindas do tutor
setTimeout(() => {
    addTutorMessage('Olá! Sou seu tutor virtual. Posso ajudar com dúvidas sobre coleta venosa, sequência de tubos, biossegurança e mais. Pergunte-me algo!', false);
}, 2000);

// Inicialização final
document.addEventListener('DOMContentLoaded', () => {
    console.log('PPA SimVein carregado com sucesso!');
});
