export class Tutor {
  advise(r){
    const tips = [];
    if (!r.antisepsis) tips.push('Realize antissepsia adequada antes da punção.');
    if (!r.tourniquet) tips.push('Aplique o garrote para aumentar o enchimento venoso.');
    if (r.angle < 10 || r.angle > 25) tips.push('Ajuste o ângulo entre 10° e 25° (0° paralelo, 90° perpendicular).');
    if (r.status.toLowerCase().includes('arterial')) tips.push('Punção arterial: retire, comprima e reavalie outro sítio.');
    if (r.status.toLowerCase().includes('extravas')) tips.push('Extravasamento/hematoma: interrompa, comprima e troque o sítio.');
    if (r.attempts >= 2) tips.push('Múltiplas tentativas: reavalie veia e calibre.');
    if (tips.length === 0) tips.push('Boa execução! Revise fixação e monitoramento do sítio.');
    let level = 'Satisfatório'; if (r.score<60) level='Insuficiente'; else if (r.score<80) level='Parcialmente satisfatório';
    return `<div><b>IA Tutor:</b> ${level}</div><ul>${tips.map(t=>`<li>${t}</li>`).join('')}</ul>`;
  }
}
