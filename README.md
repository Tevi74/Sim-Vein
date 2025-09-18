# Sim-Vein — PWA Simulador de Punção Venosa

Este repositório contém um **Progressive Web App (PWA)** educacional para treinar os passos básicos da **punção venosa periférica**.

⚠️ **Aviso:** uso exclusivamente **didático**. Não substitui treinamento clínico supervisionado.

---

## 📂 Estrutura
sim-vein/
├─ index.html # Página principal
├─ styles.css # Estilos globais
├─ app.js # Lógica do app
├─ sim/engine.js # Motor de simulação
├─ ia/tutor.js # IA Tutor (feedback por regras)
├─ sw.js # Service Worker (offline)
├─ manifest.webmanifest
└─ assets/
├─ icon-192.png
├─ icon-512.png
└─ logo.svg

---

## 🚀 Como rodar
1. Crie o repositório no GitHub com o nome **`sim-vein`** (sem acentos/espaços).
2. Adicione os arquivos conforme a estrutura acima.
3. Vá em **Settings → Pages** e publique a partir da branch `main` no diretório raiz.
4. Acesse a URL que o GitHub Pages fornecerá.
5. Você pode instalar o app no celular (PWA) e usar **offline**.

---

## ✨ Funcionalidades
- Seleção de parâmetros (pele, tônus venoso, calibre do cateter, ângulo).
- Simulação simplificada com veias paramétricas.
- Relatório de desempenho (tentativas, intercorrências, pontuação).
- **IA Tutor** com dicas baseadas em regras.
- Suporte **offline** via Service Worker.

---

## 📅 Roadmap
- Casos adicionais (idoso, pediátrico, obeso).
- Relatórios exportáveis (PDF/JSON).
- Painel do professor (turmas e métricas).
- IA generativa para debriefing textual.

---

## 📜 Licença
Livre para fins acadêmicos e educacionais.
