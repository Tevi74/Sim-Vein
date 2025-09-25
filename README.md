# PPA SimVein — Simulador de Coleta (Capacita+)

Simulador didático para fixação de conhecimentos em coleta venosa:
- Ficha de paciente e verificação de identidade
- Solicitação médica → dedução dos tubos necessários
- Biossegurança (pré/durante/pós)
- Seleção de dispositivo
- **Cronômetro de garrote (≤ 60s)**
- **Validação de ângulo de punção (30–45°)**
- **Sequência de coleta (drag & drop)**
- **Quebra-cabeça Tubo ↔ Aplicação**
- Tabelas informativas (hematologia, bioquímica, coagulação, sorologia/hormônios)
- **Tutor IA híbrido** (regras locais + OpenAI opcional)
- PWA (manifest + service worker) para uso offline básico
2. Abra `index.html` no navegador (ou publique em GitHub → Vercel).
3. Em **Configurações** (ícone ⚙️), você pode:
   - Ativar/desativar áudios.
   - Colar sua **OpenAI API key** (opcional) para habilitar o Tutor IA online.

## Tutor IA (opcional)
- Híbrido: regras locais dão feedback imediato; se você inserir `OPENAI_API_KEY`, o Tutor responde explicações curtas (80–120 palavras).
- A chave é salva **apenas no seu navegador** (localStorage). Não faça commit.

## Deploy (GitHub → Vercel)
- Suba este repositório no GitHub.
- Em Vercel: **Add New Project → Import Git Repository** → Deploy (projeto estático).
- PWA simples já habilitada (`sw.js`).

## Créditos
Desenvolvido por **HarasTech** • harastech@outlook.com
Co-brand: **Capacita+**

## Como usar
1. Garanta esta estrutura:
