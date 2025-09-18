// Simulação 2D leve com veias paramétricas e regras simples
export class SimEngine {
  constructor(canvas){
    this.cv = canvas; this.ct = canvas.getContext('2d');
    // Estado do caso
    this.state = {
      skin: 1.0,    // espessura relativa da pele
      tone: 1.0,    // tônus venoso
      gauge: 20,    // G selecionado
      angle: 15,    // ângulo em graus
      tourniquet:false,
      antisepsis:false,
      attempts:0,
      status:'aguardando',
      score:0
    };
    this.veins = this._makeVeins();
    this._draw();
  }

  _makeVeins(){
    // Cria 4 "veias" com posições e diâmetros base
    const v = [];
    for(let i=0;i<4;i++){
      v.push({
        x: 140 + i*180,
        y: 220 + Math.sin(i*0.9)*20,
        d: 6 + (i%2?2:0),   // diâmetro base (mm aprox. simbólico)
        depth: 6 + i*2,     // profundidade em px (simbólico)
        name: ['Metacarpal','Cefálica','Basílica','Mediana'][i]
      });
    }
    return v;
  }

  setSkin(v){ this.state.skin = v; this._draw(); }
  setTone(v){ this.state.tone = v; this._draw(); }
  setGauge(g){ this.state.gauge = g; }
  setAngle(a){ this.state.angle = a; this._draw(); }

  applyTourniquet(){ this.state.tourniquet = true; this._draw(); }
  doAntisepsis(){ this.state.antisepsis = true; this._draw(); }

  reset(){
    this.state.tourniquet=false;
    this.state.antisepsis=false;
    this.state.attempts=0;
    this.state.status='aguardando';
    this.state.score=0;
    this.veins = this._makeVeins();
    this._draw();
  }

  tryPuncture(pt){
    this.state.attempts++;
    // Encontrar veia mais próxima
    const hit = this.veins.map(v=>({v,dist:Math.hypot(pt.x-v.x, pt.y-v.y)}))
                          .sort((a,b)=>a.dist-b.dist)[0];
    const target = hit.v;

    // Regras simples
    const angleOK = this.state.angle>=10 && this.state.angle<=25;
    const depthOK = (target.depth * this.state.skin) <= 12; // muito profundo = difícil
    const toneBoost = this.state.tourniquet ? 1.2 : 1.0;
    const calib = this.state.gauge; // menor = mais fino

    // prob de sucesso baseia-se em proximidade + condições
    const base = Math.max(0, 1 - (hit.dist/90));
    let p = base * toneBoost;
    if (!this.state.antisepsis) p *= 0.7; // penaliza
    if (!angleOK) p *= 0.65;
    if (!depthOK) p *= 0.6;
    if (calib<=18 && target.d < 7) p *= 0.7; // cateter grosso em veia fina

    const success = Math.random() < p;

    if (success){
      this.state.status = `Sucesso em ${target.name}`;
      // pontuação: 100 menos penalidades
      let score = 100;
      if (!this.state.antisepsis) score -= 30;
      if (!this.state.tourniquet) score -= 10;
      if (!angleOK) score -= 15;
      if (!depthOK) score -= 10;
      if (calib<=18 && target.d < 7) score -= 10;
      score -= Math.max(0, (this.state.attempts-1)*10);
      this.state.score = Math.max(0, score);
    } else {
      // intercorrências
      const arterial = Math.random() < 0.05;
      const extravas = Math.random() < 0.25;
      if (arterial) this.state.status = 'Punção arterial — reconhecer e interromper';
      else if (extravas) this.state.status = 'Extravasamento/Hematoma — compressão local';
      else this.state.status = 'Falha — reavaliar vaso, ângulo e calibre';
      this.state.score = Math.max(0, 70 - (this.state.attempts*10));
    }
    this._draw();
  }

  getReport(){
    const s = this.state;
    return {
      tourniquet: s.tourniquet,
      antisepsis: s.antisepsis,
      attempts: s.attempts,
      status: s.status,
      angle: s.angle,
      gauge: s.gauge,
      score: s.score
    }
  }

  _draw(){
    const ct = this.ct; const w=this.cv.width, h=this.cv.height;
    ct.clearRect(0,0,w,h);

    // Fundo
    ct.fillStyle = '#f3f7fb'; ct.fillRect(0,0,w,h);

    // Braço (simplificado)
    ct.fillStyle = '#ffd7b3';
    ct.strokeStyle = '#d39b76';
    ct.lineWidth = 2;
    if (!ct.roundRect) {
      // fallback para browsers antigos
      ct.beginPath();
      ct.rect(60,120,760,180);
    } else {
      ct.beginPath();
      ct.roundRect(60,120,760,180,30);
    }
    ct.fill(); ct.stroke();

    // Garrote
    if(this.state.tourniquet){
      ct.fillStyle = '#0d3b66';
      ct.fillRect(70,180,20,60);
    }

    // Antissepsia (halo)
    if(this.state.antisepsis){
      ct.fillStyle = 'rgba(27,153,139,0.12)';
      if (!ct.roundRect) {
        ct.fillRect(120,150,720,120);
      } else {
        ct.beginPath();
        ct.roundRect(120,150,720,120,20);
        ct.fill();
      }
    }

    // Veias
    for(const v of this.veins){
      const d = v.d * this.state.tone; // distensão por tônus
      ct.fillStyle = '#2b72ff';
      ct.beginPath();
      ct.ellipse(v.x, v.y, 38, 12, 0, 0, Math.PI*2);
      ct.fill();

      // marcação
      ct.fillStyle = '#08203a';
      ct.font = '12px system-ui';
      ct.fillText(`${v.name} (Ø ${d.toFixed(1)}mm)`, v.x-48, v.y-18);
    }

    // Indicador de ângulo
    ct.save();
    ct.translate(760, 90);
    ct.strokeStyle = '#0d1b2a';
    ct.lineWidth = 2;
    ct.beginPath(); ct.arc(0,0,34,0,Math.PI*2); ct.stroke();
    ct.beginPath(); ct.moveTo(0,0);
    const a = (this.state.angle-90) * Math.PI/180; // ponteiro
    ct.lineTo(Math.cos(a)*32, Math.sin(a)*32); ct.stroke();
    ct.fillStyle = '#0d1b2a'; ct.font='12px system-ui';
    ct.fillText(`${this.state.angle}°`, -12, 48);
    ct.restore();
  }
}
