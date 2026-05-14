// ─── ORGANIC ─────────────────────────────────────────────────────────────────
function renderOrganic() {
  return `<p class="section-hint" style="line-height:1.6">🌿 Pontos de abastecimento orgânico em cada cidade</p>` +
    organic.map(o => `
      <div class="org-card">
        <div>
          <div style="font-size:11px;letter-spacing:2px;color:#6B9E78;text-transform:uppercase;margin-bottom:4px;font-weight:600">${o.emoji} ${o.city}</div>
          <div style="font-size:16px;color:#F0E6D0;margin-bottom:4px;font-weight:500">${o.name}</div>
          ${o.sector?`<div style="font-size:12px;color:#8A9BAB;margin-bottom:8px">${o.sector}</div>`:""}
          ${o.phone?`<a href="tel:${o.phone}" class="link-btn" style="background:rgba(107,158,120,0.15);border:1px solid rgba(107,158,120,0.3);color:#6B9E78">📞 ${o.phone}</a>`:""}
        </div>
        <a href="${o.maps}" target="_blank" class="link-btn" style="background:rgba(107,158,120,0.12);border:1px solid rgba(107,158,120,0.25);color:#6B9E78;white-space:nowrap">📍 Maps</a>
      </div>`).join("");
}

// ─── EXPENSES (ENHANCED) ─────────────────────────────────────────────────────
const catColors = { 1:"#D4875C", 2:"#4AABBD", 3:"#6B9E78", 4:"#8A9BAB" };
const customColorPool = ["#E091D4","#FFB347","#7EC8E3","#C5E17A","#FF8A80","#B39DDB","#80CBC4","#FFAB91"];

function getFlightSubItems() {
  const opts = aiState.flightOptions || [];
  return flights.map((f, i) => {
    const opt = opts.find(o => parseInt(o.trecho) === i);
    const fs = flightState[i];
    const price = opt ? parseFloat(opt.preco) || 0 : 0;
    const airline = fs.airline || (opt ? opt.companhia : f.airlines[0]) || "—";
    return { label:`${f.from} → ${f.to}`, date:f.date, detail:airline, value:price, confirmed:fs.confirmed };
  });
}

function getHotelSubItems() {
  return hotels.map((h, i) => {
    const hs = hotelState[i];
    const total = parseFloat(hs.totalValue) || 0;
    const nights = Math.round((new Date(h.checkout_iso) - new Date(h.checkin_iso)) / 86400000);
    return { label:`${h.emoji} ${h.city}`, date:`${h.checkin}→${h.checkout}`, detail:`${nights}n`, value:total, confirmed:hs.confirmed };
  });
}

function getAutoEstimate(catId) {
  if (catId === 1) { const s = getFlightSubItems().reduce((a,b) => a+b.value, 0); return s > 0 ? s : null; }
  if (catId === 2) { const s = getHotelSubItems().reduce((a,b) => a+b.value, 0); return s > 0 ? s : null; }
  return null;
}

function renderDonut(segments) {
  const total = segments.reduce((s,g) => s+g.value, 0);
  if (total === 0) return "";
  const cx=75, cy=75, r=52, sw=22, circ=2*Math.PI*r;
  let off=0;
  const arcs = segments.filter(s=>s.value>0).map(seg => {
    const d = (seg.value/total)*circ, g = circ-d, o = off; off += d;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${seg.color}" stroke-width="${sw}" stroke-dasharray="${d} ${g}" stroke-dashoffset="${-o}" stroke-linecap="round" style="transition:all .6s"/>`;
  }).join("");
  const legend = segments.filter(s=>s.value>0).map(seg => {
    const pct = ((seg.value/total)*100).toFixed(0);
    return `<div class="donut-legend-row"><span class="donut-dot" style="background:${seg.color}"></span><span class="donut-label">${seg.label}</span><span class="donut-pct">${pct}%</span></div>`;
  }).join("");
  return `<div class="donut-wrap">
    <div class="donut-svg-wrap"><svg width="150" height="150" viewBox="0 0 150 150" style="transform:rotate(-90deg)"><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="${sw}"/>${arcs}</svg>
      <div class="donut-center"><div style="font-size:9px;color:#8A9BAB;letter-spacing:1px">TOTAL</div><div style="font-size:15px;font-weight:700;color:#F0E6D0">R$ ${fmtBR(total)}</div></div>
    </div><div class="donut-legend">${legend}</div></div>`;
}

function renderSubItems(items) {
  if (!items.some(it => it.value > 0)) return "";
  return `<div class="exp-subs">${items.map(it =>
    `<div class="exp-sub"><div class="exp-sub-left"><span style="font-size:10px;color:${it.confirmed?'#6B9E78':'#5A6A7A'}">${it.confirmed?'✅':'⬜'}</span><span class="exp-sub-label">${it.label}</span><span class="exp-sub-meta">${it.date}</span><span class="exp-sub-meta">${it.detail}</span></div><span class="exp-sub-val" style="color:${it.value>0?'#D4875C':'#5A6A7A'}">${it.value>0?'R$ '+fmtBR(it.value):'—'}</span></div>`
  ).join("")}</div>`;
}

function renderExpenses() {
  const flightSubs = getFlightSubItems(), hotelSubs = getHotelSubItems();
  // Build items with auto-estimates
  const items = expState.map(e => {
    const auto = getAutoEstimate(e.id);
    return { ...e, displayEst: auto !== null ? auto : e.estimated, isAuto: auto !== null && auto !== e.estimated };
  });
  const allItems = [
    ...items,
    ...customExpenses.map((c,i) => ({ ...c, displayEst: c.estimated||0, isAuto:false, isCustom:true, color:customColorPool[i%customColorPool.length] }))
  ];
  const totalEst = allItems.reduce((s,e) => s+(e.displayEst||0), 0);
  const totalPaid = allItems.reduce((s,e) => s+(parseFloat(e.paid)||0), 0);
  const totalDiff = totalEst - totalPaid;
  const pct = totalEst > 0 ? Math.min((totalPaid/totalEst)*100, 100) : 0;

  // Donut
  const donut = renderDonut(allItems.filter(e=>(e.displayEst||0)>0).map(e => ({
    label: e.category, value: e.displayEst, color: e.color || catColors[e.id] || "#8A9BAB"
  })));

  // Cards
  const cards = allItems.map((e, idx) => {
    const est = e.displayEst||0, paid = parseFloat(e.paid)||0, diff = est-paid, hp = e.paid!==""&&e.paid!==undefined&&e.paid!=="";
    const color = e.color || catColors[e.id] || "#8A9BAB";
    const dH = hp ? `<div class="exp-diff" style="background:${diff>=0?"rgba(107,158,120,0.15)":"rgba(180,80,80,0.15)"};color:${diff>=0?"#6B9E78":"#E07070"};border:1px solid ${diff>=0?"rgba(107,158,120,0.3)":"rgba(180,80,80,0.3)"}">${diff>=0?"−":"+"} R$ ${fmtBR(Math.abs(diff))}</div>` : "";
    const autoBadge = e.isAuto ? `<span class="exp-auto-badge">SYNC</span>` : "";
    const removeBtn = e.isCustom ? `<button onclick="removeCustomExpense('${e.id}')" class="exp-remove-btn" title="Remover">✕</button>` : "";
    let subs = "";
    if (e.id === 1) subs = renderSubItems(flightSubs);
    if (e.id === 2) subs = renderSubItems(hotelSubs);
    const handler = e.isCustom ? `oninput="setCustomExpPaid('${e.id}',this.value)"` : `oninput="setExpPaid(${idx},this.value)"`;
    return `<div class="exp-card" style="border-left:3px solid ${color}"><div class="exp-row"><div style="flex:1"><div style="display:flex;align-items:center;gap:6px">\
<span style="font-size:13px;color:#E8DFC8;font-weight:600">${e.category}</span>${autoBadge}${removeBtn}</div>\
<div style="font-size:11px;color:#6A8A9A;margin-top:2px">${e.item}</div></div>\
<div style="text-align:right"><div style="font-size:10px;color:#8A9BAB;letter-spacing:.5px">Estimado</div>\
<div style="font-size:16px;color:${color};font-weight:700">R$ ${fmtBR(est)}</div></div></div>\
${subs}<div class="exp-input-row"><div style="flex:1"><input type="number" class="field-input" placeholder="Valor pago (R$)" value="${esc(e.paid||'')}" ${handler} style="padding:8px 12px;font-size:13px"></div>${dH}</div></div>`;
  }).join("");

  // Add button
  const addBtn = `<button onclick="showAddExpenseForm()" class="exp-add-btn">+ Adicionar Gasto Personalizado</button>`;
  const addForm = `<div id="add-exp-form" style="display:none" class="exp-add-form">
    <div style="font-size:11px;letter-spacing:2px;color:#D4875C;margin-bottom:12px;font-weight:600">NOVO GASTO</div>
    <div class="grid-2" style="margin-bottom:8px"><div><label class="field-label">CATEGORIA</label>
    <select id="new-exp-cat" class="field-input"><option>🎫 Passeios</option><option>🛡️ Seguro Viagem</option><option>🎁 Souvenirs</option><option>📱 Comunicação</option><option>💊 Saúde</option><option>👕 Vestuário</option><option>📋 Outros</option></select></div>
    <div><label class="field-label">DESCRIÇÃO</label><input id="new-exp-item" class="field-input" placeholder="ex: Ingressos museu"></div></div>
    <div class="grid-2" style="margin-bottom:12px"><div><label class="field-label">VALOR ESTIMADO (R$)</label><input id="new-exp-est" class="field-input" type="number" placeholder="ex: 500"></div>
    <div><label class="field-label">VALOR PAGO (R$)</label><input id="new-exp-paid" class="field-input" type="number" placeholder="0"></div></div>
    <div style="display:flex;gap:8px"><button onclick="hideAddExpenseForm()" style="flex:1;padding:10px;background:transparent;border:1px solid rgba(255,255,255,0.15);color:#8A9BAB;border-radius:8px;cursor:pointer;font-family:Inter,sans-serif">Cancelar</button>
    <button onclick="confirmAddExpense()" style="flex:1;padding:10px;background:#6B9E78;border:none;color:#fff;border-radius:8px;cursor:pointer;font-weight:600;font-family:Inter,sans-serif">Adicionar</button></div></div>`;

  // Progress
  const prog = totalPaid > 0 ? `<div id="progress-wrap"><div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:12px;color:#8A9BAB">Execução do orçamento</span><span style="font-size:13px;color:#4AABBD;font-weight:600">${pct.toFixed(1)}%</span></div><div id="progress-bar-bg"><div id="progress-bar" style="width:${pct}%"></div></div></div>` : "";
  // Summary
  const rows = [["Orçamento Total",totalEst,"#D4875C"],["Pago até agora",totalPaid,"#4AABBD"],["Saldo Restante",totalDiff,totalDiff>=0?"#6B9E78":"#E07070"]].map(([l,v,c])=>`<div class="totals-row"><span style="font-size:13px;color:#8A9BAB">${l}</span><span style="font-size:16px;font-weight:600;color:${c}">R$ ${fmtBR(v)}</span></div>`).join("");

  return `<p class="section-hint">Orçamento sincronizado automaticamente com voos e hotéis confirmados</p>
    ${donut}${cards}${addBtn}${addForm}
    <div id="totals-box"><div style="font-size:11px;letter-spacing:2px;color:#D4875C;text-transform:uppercase;margin-bottom:14px;font-weight:600">Resumo Financeiro</div>${rows}${prog}</div>`;
}

function setExpPaid(i,v) { expState[i].paid=v; saveState(); if(activeTab===3) document.getElementById("content").innerHTML=renderExpenses(); }
function setCustomExpPaid(id,v) { const c=customExpenses.find(e=>e.id===id); if(c){c.paid=v;saveState();if(activeTab===3)document.getElementById("content").innerHTML=renderExpenses();} }
function showAddExpenseForm() { const f=document.getElementById("add-exp-form"); if(f) f.style.display="block"; }
function hideAddExpenseForm() { const f=document.getElementById("add-exp-form"); if(f) f.style.display="none"; }
function confirmAddExpense() {
  const cat=document.getElementById("new-exp-cat")?.value||"📋 Outros";
  const item=document.getElementById("new-exp-item")?.value||"Novo gasto";
  const est=parseFloat(document.getElementById("new-exp-est")?.value)||0;
  const paid=document.getElementById("new-exp-paid")?.value||"";
  customExpenses.push({ id:"cust_"+Date.now(), category:cat, item:item, estimated:est, paid:paid });
  saveState(); render(); showToast("✅ Gasto adicionado!");
}
function removeCustomExpense(id) {
  customExpenses = customExpenses.filter(e => e.id !== id);
  saveState(); render(); showToast("🗑️ Gasto removido.");
}

// ─── AI TAB ──────────────────────────────────────────────────────────────────
function renderAI() {
  const mode = aiState.mode || "flight";
  const modeBtn = (m,lbl,icon) => `<button onclick="setAIMode('${m}')" style="flex:1;padding:10px;border-radius:10px;border:1px solid ${mode===m?'rgba(212,135,92,0.5)':'rgba(255,255,255,0.1)'};background:${mode===m?'rgba(212,135,92,0.15)':'rgba(255,255,255,0.04)'};color:${mode===m?'#D4875C':'#8A9BAB'};cursor:pointer;font-family:Inter,sans-serif;font-size:13px;font-weight:${mode===m?'600':'400'};transition:all 0.2s">${icon} ${lbl}</button>`;

  const searchResults = aiState.searchResults || "";
  let searchHTML = "";
  if(searchResults) {
    let applyBtn = "";
    if(aiState.applyAction) {
      applyBtn = `<button onclick="applyAIAction()" style="width:100%;padding:10px;margin-bottom:12px;background:#6B9E78;border:none;color:#fff;border-radius:8px;cursor:pointer;font-weight:600;font-size:13px;box-shadow:0 4px 10px rgba(107,158,120,0.3)">✅ Aplicar ao Trecho (Auto-preencher)</button>`;
    }
    searchHTML = `<div class="ai-result" style="margin-bottom:16px">
      <div style="font-size:10px;letter-spacing:2px;color:#4AABBD;margin-bottom:12px;font-weight:600">🔍 RESULTADOS DA BUSCA AUTOMÁTICA</div>
      ${applyBtn}
      <div style="white-space:pre-wrap;font-size:13px;color:#F0E6D0;line-height:1.5">${searchResults}</div>
    </div>`;
  }
  let optionsHTML = "";
  const opts = mode==="flight" ? (aiState.flightOptions||[]) : (aiState.hotelOptions||[]);
  if(mode==="flight") {
    const trechoOpts = flights.map((f,i)=>`<option value="${i}">${f.from}→${f.to} ${f.date}</option>`).join("");
    optionsHTML = opts.map((o,i)=>`<div class="ai-option" style="position:relative">
      <div style="grid-column:1/-1;margin-bottom:4px"><label class="field-label">TRECHO</label><select class="field-input" onchange="setAIOpt(${i},'trecho',this.value)">${trechoOpts.replace(`value="${o.trecho||0}"`,`value="${o.trecho||0}" selected`)}</select></div>
      <div><label class="field-label">SERVIÇO</label><input class="field-input" value="${esc(o.servico||'')}" placeholder="ex: Google Flights" oninput="setAIOpt(${i},'servico',this.value)"></div>
      <div><label class="field-label">COMPANHIA</label><input class="field-input" value="${esc(o.companhia||'')}" placeholder="ex: LATAM" oninput="setAIOpt(${i},'companhia',this.value)"></div>
      <div><label class="field-label">PREÇO (R$)</label><input class="field-input" type="number" value="${esc(o.preco||'')}" placeholder="ex: 450" oninput="setAIOpt(${i},'preco',this.value)"></div>
      <div><label class="field-label">PARTIDA</label><input class="field-input" value="${esc(o.partida||'')}" placeholder="ex: 06:30" oninput="setAIOpt(${i},'partida',this.value)"></div>
      <div><label class="field-label">CHEGADA</label><input class="field-input" value="${esc(o.chegada||'')}" placeholder="ex: 08:15" oninput="setAIOpt(${i},'chegada',this.value)"></div>
      <div><label class="field-label">ESCALAS</label><input class="field-input" value="${esc(o.escalas||'')}" placeholder="0=direto" oninput="setAIOpt(${i},'escalas',this.value)"></div>
      <button class="option-remove" onclick="removeAIOpt(${i})">✕</button>
    </div>`).join("");
  } else {
    optionsHTML = opts.map((o,i)=>`<div class="ai-option" style="position:relative">
      <div><label class="field-label">CIDADE</label><input class="field-input" value="${esc(o.cidade||'')}" placeholder="ex: Curitiba" oninput="setAIOpt(${i},'cidade',this.value)"></div>
      <div><label class="field-label">HOTEL</label><input class="field-input" value="${esc(o.hotel||'')}" placeholder="ex: Slaviero Centro" oninput="setAIOpt(${i},'hotel',this.value)"></div>
      <div><label class="field-label">PREÇO/NOITE (R$)</label><input class="field-input" type="number" value="${esc(o.precoNoite||'')}" placeholder="ex: 280" oninput="setAIOpt(${i},'precoNoite',this.value)"></div>
      <div><label class="field-label">AVALIAÇÃO</label><input class="field-input" value="${esc(o.avaliacao||'')}" placeholder="ex: 8.5" oninput="setAIOpt(${i},'avaliacao',this.value)"></div>
      <div><label class="field-label">SERVIÇO</label><input class="field-input" value="${esc(o.servico||'')}" placeholder="ex: Booking" oninput="setAIOpt(${i},'servico',this.value)"></div>
      <div><label class="field-label">OBSERVAÇÕES</label><input class="field-input" value="${esc(o.obs||'')}" placeholder="café incluso, piscina" oninput="setAIOpt(${i},'obs',this.value)"></div>
      <button class="option-remove" onclick="removeAIOpt(${i})">✕</button>
    </div>`).join("");
  }

  const resultHTML = aiState.lastResult ? `<div class="ai-result"><div style="font-size:10px;letter-spacing:2px;color:#D4875C;margin-bottom:8px;font-weight:600">🤖 ANÁLISE DO GEMINI PRO</div>${aiState.lastResult}</div>` : "";

  return `
    <div class="ai-glass">
      <div style="text-align:center;margin-bottom:16px">
        <div style="font-size:28px;margin-bottom:6px">🤖</div>
        <div style="font-size:18px;font-weight:600;color:#F0E6D0;margin-bottom:4px">Assistente de Viagem IA</div>
        <div style="font-size:12px;color:#8A9BAB">Gemini Pro + Google Search · Busca e analisa automaticamente</div>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:16px">${modeBtn("flight","Voos","✈️")}${modeBtn("hotel","Hotéis","🏨")}</div>

      <div style="background:rgba(74,171,189,0.08);border:1px solid rgba(74,171,189,0.2);border-radius:14px;padding:16px;margin-bottom:16px">
        <div style="font-size:11px;letter-spacing:2px;color:#4AABBD;margin-bottom:10px;font-weight:600">🔍 BUSCA AUTOMÁTICA COM IA</div>
        <div style="margin-bottom:12px">
          <label style="font-size:11px;color:#8A9BAB;margin-bottom:6px;display:block">O que pesquisar?</label>
          <select id="ai-segment-selector" style="width:100%;padding:10px;background:rgba(15,25,35,0.8);border:1px solid rgba(74,171,189,0.3);color:#F0E6D0;border-radius:8px;font-family:Inter,sans-serif;font-size:14px;outline:none">
            <option value="all">Todos os ${mode==="flight"?"Voos":"Hotéis"}</option>
            ${mode==="flight" 
              ? flights.map((f,i)=>`<option value="${i}">Voo ${i+1}: ${f.from} → ${f.to} (${f.date})</option>`).join("")
              : hotels.map((h,i)=>`<option value="${i}">Hotel: ${h.city} (${h.checkin} → ${h.checkout})</option>`).join("")
            }
          </select>
        </div>
        <div style="font-size:12px;color:#8A9BAB;margin-bottom:12px;line-height:1.6">
          O Gemini pesquisa na web em tempo real e extrai os melhores preços e horários.
        </div>
        <button class="ai-btn" id="ai-search-btn" onclick="autoSearchWithGemini()" style="background:linear-gradient(135deg,#4AABBD,#2A8A9D);margin-bottom:0">
          🔍 Iniciar Busca na Web
        </button>
        <div id="search-progress" style="margin-top:10px;font-size:12px;color:#4AABBD;display:none"></div>
      </div>

      ${searchHTML}

      <div style="border-top:1px solid rgba(255,255,255,0.06);margin:8px 0 16px"></div>
      <div style="font-size:11px;color:#7A9BAB;letter-spacing:1px;margin-bottom:10px;font-weight:500">
        📝 OPÇÕES MANUAIS (${opts.length})
      </div>
      ${optionsHTML}
      <button onclick="addAIOpt()" style="width:100%;padding:10px;border-radius:10px;border:1px dashed rgba(107,158,120,0.4);background:rgba(107,158,120,0.05);color:#6B9E78;cursor:pointer;font-family:Inter,sans-serif;font-size:12px;margin-bottom:16px;transition:all 0.2s;font-weight:500">+ Adicionar opcao manualmente</button>
      <button class="ai-btn" id="ai-analyze-btn" onclick="analyzeWithGemini()" ${opts.length<2?'disabled title="Adicione pelo menos 2 opcoes"':''}>
        🤖 Analisar Opcoes Manuais com Gemini
      </button>
      ${resultHTML}
    </div>`;
}

function setAIMode(m) { aiState.mode=m; saveState(); render(); }
function addAIOpt() {
  const key = aiState.mode==="flight"?"flightOptions":"hotelOptions";
  if(!aiState[key]) aiState[key]=[];
  aiState[key].push(aiState.mode==="flight"?{trecho:"0",servico:"",companhia:"",preco:"",partida:"",chegada:"",escalas:""}:{cidade:"",hotel:"",precoNoite:"",avaliacao:"",servico:"",obs:""});
  saveState(); render();
}
function removeAIOpt(i) {
  const key=aiState.mode==="flight"?"flightOptions":"hotelOptions";
  aiState[key].splice(i,1); saveState(); render();
}
function setAIOpt(i,k,v) {
  const key=aiState.mode==="flight"?"flightOptions":"hotelOptions";
  aiState[key][i][k]=v; saveState();
}

// ─── GEMINI SEARCH HELPER (one call at a time) ──────────────────────────────
async function geminiSearch(promptText, asJson=false) {
  const reqBody = {
    contents: [{ parts: [{ text: promptText }] }],
    tools: [{ google_search: {} }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 2048 }
  };
  
  // A API Gemini não suporta google_search e responseMimeType="application/json" simultaneamente.
  // O prompt já pede um JSON estrito, o regex do autoSearch fará o parse seguro.

  var resp = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reqBody)
  });
  if (!resp.ok) {
     const errBody = await resp.text();
     throw new Error("HTTP " + resp.status + " " + errBody);
  }
  var data = await resp.json();
  var text = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
  return text || "Sem dados retornados.";
}

// ─── AUTO SEARCH: searches each segment individually ─────────────────────────
async function autoSearchWithGemini() {
  var btn = document.getElementById("ai-search-btn");
  var prog = document.getElementById("search-progress");
  var sel = document.getElementById("ai-segment-selector").value;
  btn.disabled = true;
  prog.style.display = "block";
  var mode = aiState.mode;
  var results = [];
  aiState.applyAction = null;

  try {
    if (mode === "flight") {
      var toSearch = sel === "all" ? flights.map((_, i) => i) : [parseInt(sel)];
      for (var k = 0; k < toSearch.length; k++) {
        var i = toSearch[k];
        var f = flights[i];
        var fs = flightState[i];
        prog.textContent = "Buscando " + f.from + " -> " + f.to + " (" + (k+1) + "/" + toSearch.length + ")...";
        btn.textContent = prog.textContent;

        if (sel !== "all") {
          var q = "Pesquise passagens " + f.from + " para " + f.to + " dia " + f.iso + " voo DIRETO sem escala. Selecione a melhor opção baseando-se no CUSTO TOTAL (tarifa do voo + taxas de embarque + taxa de bagagem para embarque).\nREGRA CRÍTICA: Responda EXCLUSIVAMENTE com o objeto JSON. Não inclua NENHUM texto explicativo, avisos ou justificativas. Se não encontrar dados exatos, forneça uma estimativa ou 'A verificar'.\nFormato OBRIGATÓRIO: {\"companhia\":\"GOL ou LATAM ou Azul\",\"preco\":\"ex: 450\",\"partida\":\"ex: 10:00\",\"chegada\":\"ex: 11:30\",\"obs\":\"ex: Valor já inclui taxas e bagagem.\"}";
          var r = await geminiSearch(q, true);
          try {
            var match = r.match(/\{[\s\S]*\}/);
            if(!match) throw new Error("No JSON found");
            var data = JSON.parse(match[0]);
            results.push("✈️ " + f.from + " -> " + f.to + "\nMelhor Voo Encontrado:\nCompanhia: " + data.companhia + "\nPreço: R$ " + data.preco + "\nHorário: " + data.partida + " - " + data.chegada + "\nObs: " + data.obs);
            aiState.applyAction = { type: 'flight', index: i, data: data };
          } catch(e) {
            results.push("✈️ " + f.from + " -> " + f.to + "\nErro ao ler JSON: " + r);
          }
        } else {
          var ideal = "";
          if (fs.idealDep) ideal += " Horario ideal partida: " + fs.idealDep + ".";
          if (fs.idealArr) ideal += " Horario ideal chegada: " + fs.idealArr + ".";
          var q = "Preco de passagem aerea " + f.from + " para " + f.to + " dia " + f.iso +
            " voo DIRETO Brasil. Companhias: " + f.airlines.join(", ") + "." + ideal +
            " Informe a melhor opção pelo CUSTO TOTAL, somando a tarifa base, taxas de embarque e custo da bagagem para embarque. Liste: companhia, horario, preco total em R$ e observação.";
          var r = await geminiSearch(q, false);
          results.push("✈️ " + f.from + " -> " + f.to + "\n" + r);
        }
        if (k < toSearch.length - 1) await new Promise(function(ok){ setTimeout(ok, 2000); });
      }
    } else {
      var toSearch = sel === "all" ? hotels.map((_, i) => i) : [parseInt(sel)];
      for (var k = 0; k < toSearch.length; k++) {
        var j = toSearch[k];
        var h = hotels[j];
        var nights = Math.round((new Date(h.checkout_iso) - new Date(h.checkin_iso)) / 86400000);
        prog.textContent = "Buscando hotel em " + h.city + " (" + (k+1) + "/" + toSearch.length + ")...";
        btn.textContent = prog.textContent;

        if (sel !== "all") {
           var q2 = "Melhor hotel custo-beneficio em " + h.city + " checkin " + h.checkin_iso + " checkout " + h.checkout_iso + ".\nREGRA CRÍTICA: Responda EXCLUSIVAMENTE com o objeto JSON. Não inclua NENHUM texto explicativo. Se não achar dados exatos, use estimativas.\nFormato OBRIGATÓRIO: {\"hotel\":\"\",\"precoNoite\":\"\",\"total\":\"\",\"room\":\"\",\"obs\":\"\"}";
           var r2 = await geminiSearch(q2, true);
           try {
             var match2 = r2.match(/\{[\s\S]*\}/);
             if(!match2) throw new Error("No JSON found");
             var data2 = JSON.parse(match2[0]);
             results.push("🏨 " + h.city + "\nHotel Encontrado: " + data2.hotel + "\nDiária: R$ " + data2.precoNoite + "\nTotal: R$ " + data2.total + "\nQuarto: " + data2.room + "\nObs: " + data2.obs);
             aiState.applyAction = { type: 'hotel', index: j, data: data2 };
           } catch(e) {
             results.push("🏨 " + h.city + "\nErro ao ler JSON: " + r2);
           }
        } else {
           var q2 = "Top 5 hoteis custo-beneficio em " + h.city + " Brasil checkin " + h.checkin_iso + " checkout " + h.checkout_iso + ". Para cada: nome, preco/noite R$, total R$.";
           var r2 = await geminiSearch(q2, false);
           results.push("🏨 " + h.city + "\n" + r2);
        }
        if (k < toSearch.length - 1) await new Promise(function(ok){ setTimeout(ok, 2000); });
      }
    }

    aiState.searchResults = results.join("\n\n---\n\n");
    saveState();
    render();
    showToast("Busca automatica concluida!");
  } catch(err) {
    aiState.searchResults = "Erro geral: " + err.message;
    saveState(); render();
    showToast("Erro na busca.");
  }
}

function applyAIAction() {
  const a = aiState.applyAction;
  if(!a) return;
  if(a.type === 'flight') {
    const fs = flightState[a.index];
    fs.confirmed = true;
    fs.expanded = true;
    fs.airline = a.data.companhia;
    fs.departure = a.data.partida;
    fs.arrival = a.data.chegada;
    fs.obs = a.data.obs;
  } else {
    const hs = hotelState[a.index];
    hs.confirmed = true;
    hs.expanded = true;
    hs.diaria = a.data.precoNoite;
    hs.totalValue = a.data.total;
    hs.room = a.data.room;
    hs.obs = a.data.obs;
  }
  aiState.applyAction = null;
  saveState();
  render();
  showToast("✅ Trecho atualizado com sucesso!");
}

// ─── MANUAL GEMINI ANALYSIS ──────────────────────────────────────────────────
async function analyzeWithGemini() {
  const btn = document.getElementById("ai-analyze-btn");
  btn.disabled=true; btn.innerHTML="⏳ Analisando com Gemini Pro...";

  const mode = aiState.mode;
  let prompt = "";

  if(mode==="flight") {
    const idealTimes = flights.map((f,i) => {
      const fs=flightState[i];
      return f.from+"->"+f.to+" ("+f.date+"): partida="+( fs.idealDep||"qualquer")+", chegada="+(fs.idealArr||"qualquer");
    }).join("\n");
    const options = (aiState.flightOptions||[]).map((o,i) => {
      const f=flights[o.trecho||0];
      return "Opcao "+(i+1)+": "+f.from+"->"+f.to+" "+f.date+" | "+o.servico+" | "+o.companhia+" | R$ "+o.preco+" | "+o.partida+"-"+o.chegada+" | Escalas: "+o.escalas;
    }).join("\n");
    prompt = "Analise estas opcoes de VOO no Brasil. Recomende as melhores por custo-beneficio. Preferencia FORTE por voos diretos.\n\nHorarios ideais:\n"+idealTimes+"\n\nOpcoes:\n"+options+"\n\nResponda em pt-BR com emojis. RECOMENDACAO, RANKING, DICA, ALERTAS.";
  } else {
    const options = (aiState.hotelOptions||[]).map((o,i) =>
      "Opcao "+(i+1)+": "+o.cidade+" | "+o.hotel+" | R$ "+o.precoNoite+"/noite | Avaliacao: "+o.avaliacao+" | "+o.servico+" | "+o.obs
    ).join("\n");
    const stays = hotels.map(h => h.city+": "+h.checkin+"->"+h.checkout+" (ref: "+h.name+")").join("\n");
    prompt = "Analise estas opcoes de HOTEL no Brasil por custo-beneficio.\n\nEstadias:\n"+stays+"\n\nOpcoes:\n"+options+"\n\nResponda em pt-BR com emojis. RECOMENDACAO, RANKING, ECONOMIA, DICA.";
  }

  try {
    const resp = await fetch(GEMINI_URL, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ contents:[{parts:[{text:prompt}]}], generationConfig:{temperature:0.7,maxOutputTokens:2048} })
    });
    if(!resp.ok) throw new Error("HTTP " + resp.status);
    const data = await resp.json();
    aiState.lastResult = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text || "Sem resposta.";
    saveState(); render(); showToast("Analise concluida!");
  } catch(err) {
    aiState.lastResult = "Erro: " + err.message;
    saveState(); render(); showToast("Erro na analise.");
  }
}

// ─── PWA SERVICE WORKER ──────────────────────────────────────────────────────
if('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then(function(){console.log('SW registered')}).catch(function(e){console.log('SW failed',e)});
}

var deferredPrompt;
window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault(); deferredPrompt = e;
  var banner = document.getElementById('install-banner');
  if(banner) { banner.style.display = 'block'; banner.onclick = function() { deferredPrompt.prompt(); banner.style.display='none'; }; }
});

// ─── INIT ────────────────────────────────────────────────────────────────────
loadState();
render();
