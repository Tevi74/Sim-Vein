export class SimEngine {
  constructor(canvas){
    this.cv = canvas; this.ct = canvas.getContext('2d');
    this.state = {
      skin: 1.0, tone: 1.0, gauge: 20, angle: 15,
      tourniquet:false, antisepsis:false, attempts:0, status:'aguardando', score:0
    };
    this.veins = this._makeVeins();
    this._draw();
  }
  _makeVeins(){
    const v = [];
    for(let i=0;i<4;i++){
      v.push({
        x: 160 + i*180,
        y: 220 + Math.sin(i*0.9)*20,
        d: 6 + (i%2?2:0),
        depth: 6 + i*2,
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
    this.state = { ...this.state, tourniquet:false, antisepsis:false, attempts:0, status:'aguardando', score:0 };
    this.veins = this._makeVeins();
    this._draw();
  }
  tryPuncture(pt){
    this.state.attempts++;
    const hit = this.veins.map(v=>({v,dist:Math.hypot(pt.x-v.x, pt.y-v.y)})).sort((a,b)=>a.dist-b.dist)[0];
    const target = hit.v;
    const angleOK = this.state.angle>=10 && this.state.angle<=25;
    const depthOK = (target.depth * this.state.skin) <= 12;
    const toneBoost = this.state.tourniquet ? 1.2 : 1.0;
    const calib = this.state.gauge;

    const base = Math.max(0, 1 - (hit.dist/90));
    let p = base * toneBoost;
    if (!this.state.antisepsis) p *= 0.7;
    if (!angleOK) p *= 0.65;
    if (!depthOK) p *= 0.6;
    if (calib<=18 && target.d < 7) p *= 0.7;

    const success = Math.random() < p;
    if (success){
      this.state.status = `Sucesso em ${target.name}`;
      let score = 100;
      if (!this.state.antisepsis) score -= 30;
      if (!this.state.tourniquet) score -= 10;
      if (!angleOK) score -= 15;
      if (!depthOK) score -= 10;
      if (calib<=18 && target.d < 7) score -= 10;
      score -= Math.max(0, (this.state.attempts-1)*10);
      this.state.score = Math.max(0, score);
    } else {
      const arterial = Math.random() < 0.05;
      const extravas = Math.random() < 0.25;
      if (arterial) this.state.status = 'Punção arterial — retirar, comprimir e reavaliar';
      else if (extravas) this.state.status = 'Extravasamento/Hematoma — interromper e comprimir';
      else this.state.status = 'Falha — reavaliar vaso, ângulo e calibre';
      this.state.score = Math.max(0, 70 - (this.state.attempts*10));
    }
    this._draw();
  }
  getReport(){
    const s = this.state;
    return { tourniquet:s.tourniquet, antisepsis:s.antisepsis, attempts:s.attempts,
      status:s.status, angle:s.angle, gauge:s.gauge, score:s.score };
  }

  _draw(){
    const ct = this.ct; const w=this.cv.width, h=this.cv.height;
    ct.clearRect(0,0,w,h);

    // fundo leve
    ct.fillStyle = '#f0f4f8'; ct.fillRect(0,0,w,h);

    // braço
    ct.fillStyle = '#ffd7b3';
    ct.strokeStyle = '#d39b76'; ct.lineWidth = 2;
    ct.beginPath();
    if (ct.roundRect) ct.roundRect(60,120,760,180,30); else ct.rect(60,120,760,180);
    ct.fill(); ct.stroke();

    // garrote
    if(this.state.tourniquet){
      ct.fillStyle = '#0d3b66';
      ct.fillRect(70,180,22,60);
    }

    // região antisséptica
    if(this.state.antisepsis){
      ct.fillStyle = 'rgba(27,153,139,0.14)';
      ct.beginPath();
      if (ct.roundRect) ct.roundRect(120,150,720,120,20); else ct.rect(120,150,720,120);
      ct.fill();
    }

    // veias
    for(const v of this.veins){
      const d = v.d * this.state.tone;
      ct.fillStyle = '#2b72ff';
      ct.beginPath();
      ct.ellipse(v.x, v.y, 46, 14, 0, 0, Math.PI*2);
      ct.fill();

      ct.fillStyle = '#08203a';
      ct.font = '12px system-ui';
      ct.fillText(`${v.name} (Ø ${d.toFixed(1)}mm)`, v.x-54, v.y-18);
    }

    // mostrador de ângulo
    ct.save();
    ct.translate(760, 90);
    ct.strokeStyle = '#0d1b2a'; ct.lineWidth = 2;
    ct.beginPath(); ct.arc(0,0,34,0,Math.PI*2); ct.stroke();
    const a = (this.state.angle-90) * Math.PI/180;
    ct.beginPath(); ct.moveTo(0,0); ct.lineTo(Math.cos(a)*32, Math.sin(a)*32); ct.stroke();
    ct.fillStyle = '#0d1b2a'; ct.font='12px system-ui'; ct.textAlign='center';
    ct.fillText(`${this.state.angle}°`, 0, 50);
    ct.restore();
  }
}
