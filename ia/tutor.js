// IA Tutor (offline): feedback por regras + chat de intenções + prompts (futuro)
export class Tutor {
  advise(r) {
    const tips = [];
    if (!r.antisepsis) tips.push('Realize antissepsia adequada antes da punção.');
    if (!r.tourniquet) tips.push('Aplique o garrote para aumentar o tônus/enchimento venoso.');
    if (r.angle < 10 || r.angle > 25) tips.push('Ajuste o ângulo entre 10° e 25° para reduzir falhas.');
    if (r.status.toLowerCase().includes('arterial')) tips.push('Punção arterial: retire, comprima e reavalie outro sítio.');
    if (r.status.toLowerCase().includes('extravas')) tips.push('Extravasamento/hematoma: interrompa, comprima e troque o sítio.');
    if (r.attempts >= 2) tips.push('Múltiplas tentativas: reavalie seleção de veia e calibre do cateter.');
    if (tips.length === 0) tips.push('Boa execução! Revise fixação e monitoramento do sítio de punção.');

    let level = 'Satisfatório';
    if (r.score < 60) level = 'Insuficiente';
    else if (r.score < 80) level = 'Parcialmente satisfatório';

    return `
      <div><b>IA Tutor:</b> ${level}</div>
      <ul>${tips.map(t => `<li>${t}</li>`).join('')}</ul>
    `;
  }

  // Intenções simples por palavras-chave (pt/variações)
  chatReply(userText, r){
    const q = userText.toLowerCase();

    // Dúvidas frequentes → respostas curtas, objetivas e alinhadas ao estado atual (r)
    if (/(assepsia|antissepsia|asepsia)/.test(q)){
      return r.antisepsis
        ? 'Assépsia já realizada. Mantenha técnica limpa e evite tocar no sítio antes da punção.'
        : 'Antes da punção, faça antissepsia adequada do sítio e aguarde a secagem. Isso reduz contaminação e melhora a pontuação.';
    }

    if (/(garrote|torniquete|tourniquet)/.test(q)){
      return r.tourniquet
        ? 'Garrote está aplicado. Não esqueça de removê-lo após confirmar o retorno e estabilizar o cateter.'
        : 'Aplique o garrote acima do sítio para aumentar o enchimento venoso e facilitar a punção.';
    }

    if (/(angulo|ângulo|inclinacao|inclinação)/.test(q)){
      if (r.angle < 10 || r.angle > 25) {
        return `Ajuste o ângulo entre 10° e 25°. Seu ângulo atual é ${r.angle}°.`;
      }
      return `Ângulo atual ${r.angle}°. Você está dentro da faixa recomendada (10°–25°).`;
    }

    if (/(calibre|cateter|gauge|agulha)/.test(q)){
      const msgBase = `Calibre atual: ${r.gauge}G. Em veias finas, evite calibres grandes (≤18G).`;
      if (r.gauge <= 18) return msgBase + ' Considere 20–22G se a veia for pequena.';
      return msgBase + ' Ajuste conforme diâmetro e finalidade clínica simulada.';
    }

    if (/(falha|errei|nao deu|não deu|deu errado)/.test(q)){
      return 'Se falhou, reavalie: 1) assépsia, 2) garrote, 3) ângulo 10°–25°, 4) calibre adequado à veia. Tente outro sítio se houver múltiplas tentativas.';
    }

    if (/(extravas|hematoma)/.test(q)){
      return 'Extravasamento/hematoma: interrompa a punção, faça compressão local suave e reavalie novo sítio em outro local.';
    }

    if (/(arterial|sangue vivo|latejante)/.test(q)){
      return 'Sinal de punção arterial: retire imediatamente, faça compressão firme e reavalie um novo sítio venoso.';
    }

    if (/(como usar|ajuda|help|tutor|dica|dicas)/.test(q)){
      return 'Ajuste Pele/Tônus, escolha o calibre e ângulo. Aplique garrote, faça antissepsia e clique na veia. Veja o relatório e refine com as dicas do Tutor.';
    }

    // Fallback: responder usando o estado e rubrica
    const base = [];
    if (!r.antisepsis) base.push('faça antissepsia');
    if (!r.tourniquet) base.push('aplique o garrote');
    if (r.angle < 10 || r.angle > 25) base.push('ajuste o ângulo (10°–25°)');
    const tail = base.length ? ' Recomendo: ' + base.join(', ') + '.' : ' Execução adequada até aqui.';

    return `Estou aqui para orientar sua técnica. Status: ${r.status}. Pontuação: ${r.score}/100.` + tail;
  }

  // Prompts para integração futura com LLM (não usados no MVP)
  buildPrompts(r) {
    const system = [
      'Você é um preceptor de punção venosa periférica.',
      'Objetivo: dar feedback conciso, clínico e didático.',
      'Contexto simulado/educacional; não é orientação para paciente real.',
      'Rubrica: assepsia (30%), técnica (40%), material (15%), tempo/erros (15%).'
    ].join(' ');
    const user = [
      `Ângulo=${r.angle}°, Cateter=${r.gauge}G, Assépsia=${r.antisepsis}, Garrote=${r.tourniquet}, Tentativas=${r.attempts}`,
      `Status=${r.status}, Score=${r.score}`
    ].join('\n');
    return { system, user };
  }
}
