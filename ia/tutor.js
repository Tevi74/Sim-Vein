// IA Tutor (offline): feedback por regras + prompts para futura LLM
export class Tutor {
  /**
   * Gera aconselhamento imediato (HTML) apenas por regras locais.
   * Use dentro do app (rende no <div id="tutor">).
   * @param {Object} r - relatório vindo do SimEngine
   * @returns {string} HTML
   */
  advise(r) {
    const tips = [];

    // Regras essenciais
    if (!r.antisepsis) tips.push('Realize antissepsia adequada antes da punção.');
    if (!r.tourniquet) tips.push('Aplique o garrote para aumentar o tônus/enchimento venoso.');
    if (r.angle < 10 || r.angle > 25) tips.push('Ajuste o ângulo entre 10° e 25° para reduzir falhas.');
    if (r.status.toLowerCase().includes('arterial')) tips.push('Punção arterial: retire, comprima e reavalie outro sítio.');
    if (r.status.toLowerCase().includes('extravas')) tips.push('Extravasamento/hematoma: interrompa, comprima e troque o sítio.');
    if (r.attempts >= 2) tips.push('Múltiplas tentativas: reavalie seleção de veia e calibre do cateter.');

    // Mensagem neutra quando tudo vai bem
    if (tips.length === 0) {
      tips.push('Boa execução! Revise fixação e monitoramento do sítio de punção.');
    }

    // Classificação simples por score
    let level = 'Satisfatório';
    if (r.score < 60) level = 'Insuficiente';
    else if (r.score < 80) level = 'Parcialmente satisfatório';

    return `
      <div><b>IA Tutor:</b> ${level}</div>
      <ul>${tips.map(t => `<li>${t}</li>`).join('')}</ul>
    `;
  }

  /**
   * Prompts estruturados para uso futuro com LLM (opcional/online).
   * Não é chamado no MVP, mas deixa pronto para integrar um endpoint.
   * @param {Object} r - relatório vindo do SimEngine
   * @returns {{system:string,user:string}} prompts
   */
  buildPrompts(r) {
    const system = [
      'Você é um preceptor de punção venosa periférica.',
      'Objetivo: dar feedback conciso, clinicamente orientado e didático.',
      'Não forneça condutas reais para pacientes. O contexto é simulado e educacional.',
      'Siga a rubrica: assépsia (30%), técnica (40%), escolha do material (15%), tempo/erros (15%).',
      'Aponte 2–4 melhorias prioritárias. Evite jargão excessivo.',
    ].join(' ');

    const statusTags = [
      r.antisepsis ? 'assepsia_ok' : 'assepsia_faltando',
      r.tourniquet ? 'garrote_ok' : 'garrote_faltando',
      (r.angle >= 10 && r.angle <= 25) ? 'angulo_ok' : 'angulo_ajustar',
      `cateter_${r.gauge}G`,
      `tentativas_${r.attempts}`,
      `status:${r.status}`
    ].join(' | ');

    const user = [
      `Relatório:`,
      `- Ângulo: ${r.angle}°`,
      `- Cateter: ${r.gauge}G`,
      `- Assépsia: ${r.antisepsis ? 'sim' : 'não'}`,
      `- Garrote: ${r.tourniquet ? 'sim' : 'não'}`,
      `- Tentativas: ${r.attempts}`,
      `- Status: ${r.status}`,
      `- Score: ${r.score}/100`,
      ``,
      `Tags: ${statusTags}`,
      ``,
      `Tarefa: gere um debriefing curto (até 120 palavras) com:`,
      `1) síntese do desempenho (1 frase)`,
      `2) 3 ações de melhoria objetivas`,
      `3) observação sobre segurança (quando aplicável: arterial/extravasamento)`,
      `4) lembrete final de que é simulação educacional`,
    ].join('\n');

    return { system, user };
  }

  /**
   * Exemplo de integração futura (não usado no MVP).
   * Você poderia chamar um endpoint e passar buildPrompts(r).
   * @param {Object} r
   * @returns {Promise<string>} texto debriefing
   */
  async generateDebriefWithLLM(r) {
    // Exemplo ilustrativo (não funcional no GitHub Pages)
    // const { system, user } = this.buildPrompts(r);
    // const resp = await fetch('https://sua-api-llm.exemplo/debrief', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ system, user })
    // });
    // const data = await resp.json();
    // return data.text || '';
    return ''; // placeholder no MVP
  }
}
