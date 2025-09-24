# SimVein — Página AR Didática para Coleta de Sangue (Análise Clínica)

Experiência web didática e responsiva para alunos de Análises Clínicas, com **AR (Realidade Aumentada) opcional**, **mapa corporal com veias clicáveis**, **sequência correta de tubos**, **parâmetros/ aditivos e exames por tubo** e **tabela de valores de referência**. Inclui **tutor IA (stub)** e modo de estudo/quiz.

> **Aviso importante**: Conteúdo para **fins educacionais**. Intervalos de referência **variam por faixa etária, sexo, método/kit e laboratório**. **Siga sempre o POP/POE da sua instituição** e as notas do **laboratório local**.

---

## 🎯 Objetivos

* Fixar a **ordem correta de coleta** e o **porquê** de cada passo.
* Visualizar **aditivos**, **exames indicados** e **riscos de contaminação cruzada**.
* Consultar uma **tabela didática** de valores de referência (Convencional ↔ SI) e entender seus limites.
* Explorar **veias** mais utilizadas via **mapa corporal** (hotspots clicáveis) e **AR**.
* Interagir com um **Tutor IA (stub)** para dúvidas conceituais (sem chaves expostas no front‑end).

---

## 👩‍🏫 Conteúdo Didático (base do app)

### Ordem correta de coleta (evita contaminação por aditivos)

1. **Frasco de Hemocultura**
   **Parâmetro:** microbiologia (bactérias/fungos).
   **Função:** coleta estéril para cultura antes de qualquer aditivo.

2. **Tubo Azul (Citrato de Sódio)**
   **Parâmetro:** coagulação (TP/TTPA).
   **Função:** citrato inativa cálcio; precisa **relação sangue\:aditivo adequada (9:1)**.

3. **Tubo Amarelo/Vermelho (Ativador de Coágulo ± Gel)**
   **Parâmetro:** bioquímica, sorologia, hormônios.
   **Função:** ativador acelera coagulação; **gel separador** cria barreira soro/células.

4. **Tubo Verde (Heparina)**
   **Parâmetro:** bioquímica e eletrólitos; **plasma**.
   **Função:** heparina bloqueia cascata da coagulação.

5. **Tubo Roxo/Lilás (EDTA)**
   **Parâmetro:** hematologia.
   **Função:** EDTA quelante de cálcio; **preserva morfologia celular** (hemograma, etc.).

6. **Tubo Cinza (Fluoreto de Sódio + EDTA)**
   **Parâmetro:** glicemia, lactato, testes que exigem **inibição da glicólise**.
   **Função:** fluoreto inibe glicólise; EDTA mantém integridade celular.

> **Observação**: Em rotinas específicas (p.ex., gasometria arterial com heparina balanceada), siga **protocolos próprios** e **material dedicado**.

### Parâmetros analíticos por tubo

* **Hemocultura**
  **Aditivo:** meios de cultura / resinas.
  **Exames:** culturas aeróbias/anaeróbias.

* **Azul (Citrato de Sódio)**
  **Aditivo:** citrato (anticoagulante).
  **Exames:** TP, TTPa e outros testes de coagulação.

* **Amarelo/Vermelho (Ativador ± Gel)**
  **Aditivo:** ativador de coágulo (± gel separador).
  **Exames:** bioquímica e sorologia (ex.: ureia, colesterol, triglicerídeos, VDRL, marcadores de hepatite), hormônios.

* **Verde (Heparina)**
  **Aditivo:** heparina (anticoagulante).
  **Exames:** bioquímica especializada, eletrólitos e **gasometria (plasma heparinizado)** quando aplicável.

* **Roxo/Lilás (EDTA)**
  **Aditivo:** EDTA.
  **Exames:** hematologia (hemograma, contagens, morfologia).

* **Cinza (Fluoreto + EDTA)**
  **Aditivo:** fluoreto (inibe glicólise) + EDTA.
  **Exames:** glicose, lactato (plasma).

---

## 🧪 Valores de Referência — explicação

* **O que são:** Intervalos estatísticos esperados em uma população **saudável** para um **método específico**.
* **Variabilidade:** Faixa etária, sexo, condições fisiológicas, **tipo de amostra**, **método/kit**, unidade e **laboratório**.
* **Uso correto:** Compare sempre com os **intervalos do seu laboratório** (aparecem no laudo). Alguns analitos seguem **diretrizes clínicas** (ex.: alvos individualizados para LDL; **HDL: valores mais altos costumam ser desejáveis**).

A planilha abaixo (CSV) será lida pela página para renderizar uma **tabela responsiva** com busca e filtro. Você pode **editar/estender** conforme sua disciplina.

**Arquivo:** `public/data/reference-values.csv`

```
Exame,Unidades_convencionais,Unidades_SI
Ácido fólico,"1,8 a 9 ng/mL","4,1 a 20,4 nmol/L"
Ácido úrico,"3 a 7 mg/dL","178,5 a 416,5 µmol/L"
ACTH,"10 a 60 pg/mL","2,2 a 13,2 pmol/L"
Albumina,"3,5 a 5,5 g/dL","35 a 55 g/L"
Aldosterona,"Em pé: 7 a 20 ng/dL; Deitado: 2 a 5 ng/dL","Em pé: 194 a 554 pmol/L; Deitado: 55 a 138 pmol/L"
Alfa-1 antitripsina,"150 a 350 mg/dL","27,6 a 64,5 µmol/L"
Alfafetoproteína,"0 a 10 ng/dL","0 a 10 pg/L"
Amilase,"25 a 125 U/L","0,42 a 2,1 µkat/L"
ALT (TGP),"10 a 40 U/L","0,17 a 0,68 µkat/L"
AST (TGO),"10 a 40 U/L","0,17 a 0,68 µkat/L"
Amônia,"40 a 70 µg/dL","23,5 a 41,1 µmol/L"
Anti-TPO,"< 35 UI/mL","< 35 kUI/L"
Bilirrubina Total,"0,1 a 1,2 mg/dL","1,7 a 20,5 µmol/L"
CA 19-9,"< 37 U/mL","< 220 kU/L"
CA 125,"< 35 U/mL","< 120 kU/L"
Cálcio,"8,6 a 10,2 mg/dL","2,2 a 2,6 mmol/L"
Cálcio ionizado,"4,5 a 4,9 mg/dL","1,12 a 1,23 mmol/L"
Capacidade total de ligação do ferro,"250 a 310 µg/dL","44,8 a 55,5 µmol/L"
CEA,"< 5 ng/mL","< 16,5 nmol/L"
Cloreto,"98 a 106 mEq/L","98 a 106 mmol/L"
Colesterol HDL,"Mulheres: < 50 mg/dL; Homens: < 40 mg/dL","Mulheres: < 1,3 mmol/L; Homens: < 1 mmol/L"
Colesterol LDL,"Ótimo: < 100 mg/dL; Quase ideal: 100 a 129 mg/dL; Moderado alto: 130 a 159 mg/dL; Alto: 160 a 189 mg/dL; Muito alto: > 189 mg/dL","Ótimo: < 2,6 mmol/L; Quase ideal: 2,6 a 3,3 mmol/L; Moderado alto: 3,4 a 4,1 mmol/L; Alto: 4,1 a 4,9 mmol/L; Muito alto: > 4,9 mmol/L"
Colesterol Total,"Desejável: < 200 mg/dL; Moderado alto: 200 a 239 mg/dL; Alto: > 239 mg/dL","Desejável: < 5,2 mmol/L; Moderado alto: 5,2 a 6,2 mmol/L; Alto: > 6,2 mmol/L"
Complemento,"C3: 100 a 233 mg/dL; C4: 14 a 48 mg/dL; CH50: 110 a 190 U/mL","C3: 1 a 2,3 g/L; C4: 0,1 a 0,5 g/L; CH50: -"
Cortisol,"6 a 23 µg/dL","138 a 690 nmol/L"
CK (Creatina Quinase),"Homens: 55 a 170 U/L; Mulheres: 30 a 135 U/L","Homens: 0,92 a 2,83 µkat/L; Mulheres: 0,5 a 2,25 µkat/L"
Creatinina,"0,7 a 1,3 mg/dL","61,9 a 115 µmol/L"
D-dímero,"< 0,5 µg/mL ou < 0,5 mg/L","< 3 nmol/L"
DHEA-S,"Mulheres: 35 a 430 µg/dL; Homens: 80 a 560 µg/dL","Mulheres: 1,21 a 14,9 µmol/L; Homens: 2,76 a 19,3 µmol/L"
Enzima conversora de angiotensina,"8 a 53 U/L","—"
Estradiol (E2),"Fase folicular: 30 a 120 pg/mL","Fase folicular: 110 a 441 pmol/L"
Ferritina,"Mulheres: 24 a 307 ng/mL; Homens: 24 a 336 ng/mL","Mulheres: 54 a 690 pmol/L; Homens: 54 a 755 pmol/L"
Ferro,"50 a 150 µg/dL","9 a 27 µmol/L"
Fosfatase alcalina,"30 a 120 U/L","—"
Fósforo,"3 a 4,5 mg/dL","0,97 a 1,45 mmol/L"
Glicemia em jejum,"70 a 99 mg/dL","3,9 a 5,5 mmol/L"
Hematócrito,"Mulheres: 37 a 47%; Homens: 42 a 50%","—"
Hemoglobina,"Mulheres: 12 a 16 g/dL; Homens: 14 a 18 g/dL","Mulheres: 120 a 160 g/L; Homens: 140 a 180 g/L"
Hemoglobina A1C (HbA1c),"4 a 5,6%","20,2 a 37,7 mmol/mol"
```
