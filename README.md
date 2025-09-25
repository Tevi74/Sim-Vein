# Sim-Lab (SimVein) • Deploy Vercel

Este repositório contém um PWA estático (HTML, CSS, JS) para o **SimVein • Simulador de Coleta**.

---

## 🚀 Estrutura do Projeto
/
├── index.html
├── styles.css
├── scripts.js
├── sw.js
├── manifest.webmanifest
├── /public
│ ├── /assets
│ │ ├── /branding
│ │ │ └── logos, avatar-tutor, etc.
│ │ ├── /tubes
│ │ │ └── imagens dos tubos
│ │ └── arm-360.jpg
│ ├── /audio (⚠️ ver nota abaixo)
│ │ └── mp3 de narrações e sons


---

## ⚠️ Importante sobre pastas

- Na Vercel, **arquivos dentro de `/public` ficam disponíveis direto na raiz**.  
  Exemplo:  
  `public/assets/branding/logo-sim.png` → acessível em `/assets/branding/logo-sim.png`  
  `public/audio/audio-ambiente.mp3` → acessível em `/audio/audio-ambiente.mp3`

👉 **Verifique se sua pasta está nomeada `audio` (singular)**, pois no `index.html` você referencia `audio/...`.  
Se o nome for `audios/`, renomeie a pasta para `audio/`.

---

## 🌐 Deploy na Vercel

1. Faça login em [Vercel](https://vercel.com) e importe este repositório.
2. Em **Project Settings**:
   - Framework Preset → **Other**
   - Build Command → (deixe vazio)
   - Output Directory → **.** (ou vazio)
3. Deploy 🎉

---

## 🔧 Arquivo `vercel.json`

Na raiz do projeto, adicione este arquivo para garantir fallback do SPA e servir corretamente os arquivos:

```json
{
  "builds": [
    { "src": "index.html", "use": "@vercel/static" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
