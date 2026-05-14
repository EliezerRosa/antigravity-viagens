// ─── SEARCH SERVICES ─────────────────────────────────────────────────────────
function getFlightServices(f) {
  const sky = isoToSky(f.iso);
  return [
    { name:"Google Flights", icon:"🔍", color:"#4285F4", hint:"Calendário de preços + alertas", url:`https://www.google.com/travel/flights?hl=pt-BR&q=voos+${f.from}+${f.to}+${f.iso}` },
    { name:"Skyscanner", icon:"✈", color:"#00B0FF", hint:"Comparador global", url:`https://www.skyscanner.com.br/transporte/voos/${f.from.toLowerCase()}/${f.to.toLowerCase()}/${sky}/` },
    { name:"Kayak", icon:"🛫", color:"#FF690F", hint:"Melhor custo/benefício", url:`https://www.kayak.com.br/flights/${f.from}-${f.to}/${f.iso}` },
    { name:"Decolar", icon:"🇧🇷", color:"#6DB33F", hint:"Parcelamento em reais", url:`https://www.decolar.com/shop/flights/results/ONE_WAY/${f.from}/${f.to}/${f.iso}/1/0/0` },
    { name:"MaxMilhas", icon:"⭐", color:"#FFC107", hint:"Pagar com milhas", url:`https://www.maxmilhas.com.br/passagens-aereas/busca/${f.from}/${f.to}/${f.iso}` },
    { name:"Melhores Destinos", icon:"💎", color:"#E91E63", hint:"Promoções e dicas", url:`https://www.melhoresdestinos.com.br/passagens-aereas` },
    { name:"123Milhas", icon:"🎫", color:"#8BC34A", hint:"Milhas e pacotes", url:`https://123milhas.com/v2/busca?de=${f.from}&para=${f.to}&ida=${f.iso}` },
    { name:"Viajanet", icon:"🌎", color:"#00BCD4", hint:"Ofertas exclusivas", url:`https://www.viajanet.com.br/passagens-aereas/${f.from}/${f.to}/${f.iso}` },
  ];
}
function getHotelServices(h) {
  const city=encodeURIComponent(h.city), cin=h.checkin_iso, cout=h.checkout_iso;
  const [cy,cm,cd]=cin.split("-"), [coy,com,cod]=cout.split("-");
  return [
    { name:"Google Hotels", icon:"🔍", color:"#4285F4", hint:"Mapa + avaliações", url:`https://www.google.com/travel/hotels?hl=pt-BR&q=hoteis+${city}&dates=${cin},${cout}` },
    { name:"Booking.com", icon:"🏨", color:"#003580", hint:"Maior acervo global", url:`https://www.booking.com/searchresults.pt-br.html?ss=${city}&checkin_year=${cy}&checkin_month=${parseInt(cm)}&checkin_monthday=${parseInt(cd)}&checkout_year=${coy}&checkout_month=${parseInt(com)}&checkout_monthday=${parseInt(cod)}&no_rooms=1&group_adults=1` },
    { name:"Trivago", icon:"📊", color:"#E7472A", hint:"Comparador de tarifas", url:`https://www.trivago.com.br/?query=${city}&checkin=${cin}&checkout=${cout}` },
    { name:"Decolar", icon:"🇧🇷", color:"#6DB33F", hint:"Pacote voo + hotel", url:`https://www.decolar.com/shop/hotels/list/${city}/${cin}/${cout}/1` },
    { name:"Expedia", icon:"💼", color:"#00355F", hint:"Descontos para membros", url:`https://www.expedia.com.br/Hotel-Search?destination=${city}&startDate=${cm}%2F${cd}%2F${cy}&endDate=${com}%2F${cod}%2F${coy}` },
    { name:"Hotels.com", icon:"🛏️", color:"#D32F2F", hint:"Diária grátis a cada 10", url:`https://br.hotels.com/search.do?q-destination=${city}&q-check-in=${cin}&q-check-out=${cout}` },
    { name:"Airbnb", icon:"🏠", color:"#FF5A5F", hint:"Casas e experiências", url:`https://www.airbnb.com.br/s/${city}/homes?checkin=${cin}&checkout=${cout}` },
    { name:"TripAdvisor", icon:"🦉", color:"#00AF87", hint:"Reviews detalhados", url:`https://www.tripadvisor.com.br/Search?q=${city}` },
  ];
}

function openSearchModal(type, idx) {
  let m = document.getElementById('search-modal');
  if(m) m.remove();
  
  const services = type === 'voo' ? getFlightServices(flightState[idx]) : getHotelServices(hotelState[idx]);
  const btnType = type === 'voo' ? 'openAllFlightServices(' + idx + ')' : 'openAllHotelServices(' + idx + ')';
  
  const rows = services.map(s => `
    <a href="${s.url}" target="_blank" class="search-link" style="background:${hex(s.color,0.07)};border:1px solid ${hex(s.color,0.25)}">
      <span style="font-size:17px;width:22px;text-align:center">${s.icon}</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:600;color:${s.color}">${s.name}</div>
        <div style="font-size:10px;color:#6A8A9A;margin-top:1px">${s.hint}</div>
      </div>
      <span style="font-size:14px;color:${hex(s.color,0.6)}">→</span>
    </a>`).join("");
    
  m = document.createElement('div');
  m.id = 'search-modal';
  m.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,25,35,0.85);backdrop-filter:blur(4px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px";
  
  m.innerHTML = `
    <div style="background:#1E3040;border:1px solid rgba(74,171,189,0.4);border-radius:16px;padding:24px;width:100%;max-width:400px;max-height:80vh;overflow-y:auto;box-shadow:0 10px 40px rgba(0,0,0,0.5);position:relative">
      <button onclick="document.getElementById('search-modal').remove()" style="position:absolute;top:16px;right:16px;background:none;border:none;color:#8A9BAB;font-size:20px;cursor:pointer;padding:8px">✕</button>
      <div style="font-size:11px;letter-spacing:2px;color:#4AABBD;margin-bottom:16px;font-weight:600">🔎 BUSCAR MELHOR PREÇO — ${services.length} SERVIÇOS</div>
      <button class="open-all-btn" onclick="${btnType}; document.getElementById('search-modal').remove()" style="margin-bottom:12px">🚀 Abrir Todos os ${services.length} Serviços</button>
      ${rows}
    </div>
  `;
  document.body.appendChild(m);
}

function openAllFlightServices(idx) {
  if(idx!==undefined) getFlightServices(flightState[idx]).forEach(s => window.open(s.url,'_blank'));
}
function openAllHotelServices(idx) {
  if(idx!==undefined) getHotelServices(hotelState[idx]).forEach(s => window.open(s.url,'_blank'));
}

// ─── ROUTE CHIPS ─────────────────────────────────────────────────────────────
const cities = ["VIX","GRU","CWB","SSA","MCZ"];
document.getElementById("route-chips").innerHTML = cities.map((c,i)=>
  `<span class="chip" style="background:${hex(cityColors[c],0.2)};border:1px solid ${hex(cityColors[c],0.4)};color:${cityColors[c]}">${c}${i<4?" →":""}</span>`
).join("");

// ─── TAB SWITCH ──────────────────────────────────────────────────────────────
function switchTab(n) { activeTab=n; document.querySelectorAll(".tab-btn").forEach((b,i)=>b.classList.toggle("active",i===n)); render(); }

function render() {
  const c=document.getElementById("content");
  if(activeTab===0) c.innerHTML=renderFlights();
  if(activeTab===1) c.innerHTML=renderHotels();
  if(activeTab===2) c.innerHTML=renderDiary();
  if(activeTab===3) c.innerHTML=renderExpenses();
  if(activeTab===4) c.innerHTML=renderAI();

  const undoBtn = document.getElementById("btn-undo-import");
  if(undoBtn) {
    undoBtn.style.display = localStorage.getItem('viagem-brasil-undo') ? 'inline-block' : 'none';
  }
}

// ─── FLIGHTS ─────────────────────────────────────────────────────────────────
function renderFlights() {
  let html = `<p class="section-hint">TOQUE ✔ PARA CONFIRMAR · ✏️ PARA EDITAR · 🚀 PARA ABRIR TODOS OS SERVIÇOS</p>`;
  
  flightState.forEach((fs, i) => {
    const fromC = cityColors[fs.from] || "#8A9BAB";
    const toC = cityColors[fs.to] || "#8A9BAB";
    const tags = fs.confirmed && fs.number ? `<span class="inline-tag">${esc(fs.airline)} ${esc(fs.number)}</span>` : "";
    const time = [
      fs.confirmed && fs.departure ? `⬆ ${esc(fs.departure)}` : "",
      fs.confirmed && fs.arrival ? `⬇ ${esc(fs.arrival)}` : "",
      fs.confirmed && fs.seat ? `💺 ${esc(fs.seat)}` : "",
      !fs.confirmed && fs.airlines ? fs.airlines.join(" · ") : "",
      fs.note ? `<span style="color:#D4875C">★ ${esc(fs.note)}</span>` : ""
    ].filter(Boolean).join(" &nbsp;");

    let body = "";
    if (fs.expanded) {
      const airlinesList = fs.airlines || ["LATAM", "GOL", "Azul"];
      const airlBtns = airlinesList.map(a => {
        const ai = airlineInfo[a] || { color: "#8A9BAB", site: "#", phone: "" };
        const sel = fs.airline === a;
        return `<button class="airline-btn" onclick="setFlightAirline(${i},'${a}')"
          style="border-color:${sel ? ai.color : "rgba(255,255,255,0.12)"};background:${sel ? hex(ai.color,0.13) : "rgba(255,255,255,0.04)"};color:${sel ? ai.color : "#8A9BAB"};${sel ? "font-weight:bold" : ""}">${a}</button>`;
      }).join("");
      
      let airlLinks = "";
      if (fs.airline) { 
        const ai = airlineInfo[fs.airline] || { color: "#8A9BAB", site: "#", phone: "" };
        airlLinks = `<div class="links-row"><a href="${ai.site}" target="_blank" class="link-btn" style="background:${hex(ai.color,0.13)};border:1px solid ${hex(ai.color,0.33)};color:${ai.color}">🌐 ${fs.airline}</a><a href="tel:${ai.phone}" class="link-btn" style="background:rgba(74,171,189,0.1);border:1px solid rgba(74,171,189,0.25);color:#4AABBD">📞 ${ai.phone}</a></div>`;
      }

      const flds = [
        ["number", "Número do Voo", "ex: LA3042"],
        ["departure", "Partida", "ex: 06:30"],
        ["arrival", "Chegada", "ex: 08:15"],
        ["seat", "Assento", "ex: 14A"],
        ["terminal", "Terminal", "ex: T2"],
        ["obs", "Observações", "ex: check-in online"]
      ];
      
      const idealFlds = `<div class="grid-2" style="margin-bottom:12px"><div><label class="field-label">⏰ HORÁRIO IDEAL PARTIDA</label><input class="field-input" value="${esc(fs.idealDep||'')}" placeholder="ex: após 07:00" onchange="setFlightField(${i},'idealDep',this.value)"></div><div><label class="field-label">⏰ HORÁRIO IDEAL CHEGADA</label><input class="field-input" value="${esc(fs.idealArr||'')}" placeholder="ex: antes das 12:00" onchange="setFlightField(${i},'idealArr',this.value)"></div></div>`;
      
      const editBaseFlds = `<div style="border-top:1px solid rgba(255,255,255,0.06);margin:14px 0 10px"></div><span class="section-title">EDITAR TRECHO</span>
        <div class="grid-2" style="margin-bottom:12px">
          <div><label class="field-label">ORIGEM (SIGLA)</label><input class="field-input" value="${esc(fs.from||'')}" placeholder="ex: GRU" onchange="setFlightField(${i},'from',this.value.toUpperCase())"></div>
          <div><label class="field-label">DESTINO (SIGLA)</label><input class="field-input" value="${esc(fs.to||'')}" placeholder="ex: CWB" onchange="setFlightField(${i},'to',this.value.toUpperCase())"></div>
          <div><label class="field-label">DATA FORMATADA</label><input class="field-input" value="${esc(fs.date||'')}" placeholder="ex: 20/06" onchange="setFlightField(${i},'date',this.value)"></div>
          <div><label class="field-label">DATA ISO (PARA BUSCAS)</label><input class="field-input" type="date" value="${esc(fs.iso||'')}" onchange="setFlightField(${i},'iso',this.value)"></div>
        </div>`;

      body = `<div class="card-body">
        ${editBaseFlds}
        <div style="display:flex;gap:10px;margin-bottom:14px">
          <details ${!fs.airline ? 'open' : ''} style="flex:1;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:12px;background:rgba(255,255,255,0.02)">
            <summary style="font-size:11px;letter-spacing:1px;color:#D4875C;font-weight:600;cursor:pointer;outline:none;user-select:none">
              COMPANHIA AÉREA ${fs.airline ? `<span style="color:#6B9E78;margin-left:6px">✅ ${fs.airline}</span>` : ''}
            </summary>
            <div style="margin-top:12px">
              <div class="airline-btns">${airlBtns}</div>${airlLinks}
            </div>
          </details>
          <button onclick="openSearchModal('voo', ${i})" title="Pesquisar Preços" style="padding:0 16px;border-radius:10px;background:rgba(74,171,189,0.1);border:1px solid rgba(74,171,189,0.3);color:#4AABBD;font-size:22px;cursor:pointer;transition:all 0.2s">🔎</button>
        </div>
        ${idealFlds}
        <div style="border-top:1px solid rgba(255,255,255,0.06);margin:10px 0 14px"></div>
        <span class="section-title">DADOS DO VOO CONFIRMADO</span>
        <div class="grid-2">
          ${flds.map(([k,l,p])=>`<div><label class="field-label">${l.toUpperCase()}</label><input class="field-input" value="${esc(fs[k]||'')}" placeholder="${p}" onchange="setFlightField(${i},'${k}',this.value)"></div>`).join("")}
          <div style="grid-column: span 1">
            <label class="field-label" style="color:#6B9E78">CUSTO TOTAL (R$)</label>
            <input class="field-input" style="font-size:16px;font-weight:bold;color:#6B9E78" value="${fs.price ? fmtBR(fs.price) : ''}" placeholder="0,00" 
              oninput="this.value = maskCurrency(this.value);" onchange="setFlightField(${i},'price',parseCurrency(this.value))">
          </div>
          <div style="grid-column: span 1">
            <label class="field-label" style="color:#D4875C">VALOR JÁ PAGO (R$)</label>
            <input class="field-input" style="font-size:16px;font-weight:bold;color:#D4875C" value="${fs.paid ? fmtBR(fs.paid) : ''}" placeholder="0,00" 
              oninput="this.value = maskCurrency(this.value);" onchange="setFlightField(${i},'paid',parseCurrency(this.value))">
          </div>
        </div>
        <div style="margin-top: 16px; text-align: right;">
          <button onclick="deleteFlight(${i})" style="background:rgba(232,0,61,0.1);border:1px solid rgba(232,0,61,0.3);color:#E8003D;padding:6px 12px;border-radius:6px;font-size:11px;cursor:pointer">🗑️ Excluir Voo</button>
        </div>
      </div>`;
    }

    html += `<div class="card${fs.confirmed ? " confirmed" : ""}" data-idx="${i}">
      <div class="card-header">
        <button class="btn-confirm${fs.confirmed ? " on" : ""}" onclick="toggleFlightConfirm(${i})">${fs.confirmed ? "✅" : "🔲"}</button>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:3px">
            <span class="tag" style="background:${hex(fromC,0.2)};color:${fromC}">${fs.from || '?'}</span>
            <span style="color:#D4875C;font-size:13px">→</span>
            <span class="tag" style="background:${hex(toC,0.2)};color:${toC}">${fs.to || '?'}</span>${tags}
          </div>
          <div style="font-size:11px;color:#6A8A9A"><span style="color:#D4875C;font-weight:600">${fs.date || '?'}</span>&nbsp;&nbsp;${time}</div>
        </div>
        <button class="btn-expand" onclick="toggleFlightExpand(${i})">${fs.expanded ? "▲" : "✏️"}</button>
      </div>${body}</div>`;
  });

  html += `<button onclick="addFlight()" style="width:100%;margin-bottom:20px;padding:12px;background:rgba(255,255,255,0.05);border:1px dashed rgba(255,255,255,0.2);color:#8A9BAB;border-radius:12px;cursor:pointer;font-weight:600">+ Adicionar Novo Trecho</button>`;

  html += `<div class="quicklinks"><div style="font-size:10px;color:#7A9BAB;letter-spacing:2px;margin-bottom:10px">ACESSO RÁPIDO</div><div style="display:flex;gap:8px;flex-wrap:wrap">
    <a href="https://www.google.com/travel/flights?hl=pt-BR" target="_blank" class="link-btn" style="background:rgba(66,133,244,0.13);border:1px solid rgba(66,133,244,0.35);color:#4285F4;font-weight:bold">🔍 Google Flights</a>
    ${Object.entries(airlineInfo).map(([n,ai])=>`<a href="${ai.site}" target="_blank" class="link-btn" style="background:${hex(ai.color,0.1)};border:1px solid ${hex(ai.color,0.27)};color:${ai.color}">🌐 ${n}</a>`).join("")}</div></div>`;
  return html;
}

function toggleFlightConfirm(i) { flightState[i].confirmed = !flightState[i].confirmed; flightState[i].expanded = flightState[i].confirmed; saveState(); render(); }
function toggleFlightExpand(i) { flightState[i].expanded = !flightState[i].expanded; render(); }
function setFlightField(i, k, v) { flightState[i][k] = v; saveState(); render(); }
function setFlightAirline(i, a) { flightState[i].airline = flightState[i].airline === a ? "" : a; saveState(); render(); }
function addFlight() {
  flightState.push({ id: Date.now(), from:"", to:"", date:"", iso:"", airlines:["LATAM","GOL","Azul"], confirmed:false, expanded:true, airline:"", number:"", departure:"", arrival:"", seat:"", terminal:"", obs:"", idealDep:"", idealArr:"", price:"" });
  saveState(); render();
}
function deleteFlight(i) {
  if(!confirm("Tem certeza que deseja excluir este voo?")) return;
  flightState.splice(i, 1);
  saveState(); render();
}

// ─── HOTELS ──────────────────────────────────────────────────────────────────
const payColors={Pago:"#6B9E78",Pendente:"#D4875C",Parcial:"#4AABBD"};
function renderHotels() {
  let html = `<p class="section-hint">TOQUE ✔ PARA CONFIRMAR · ✏️ PARA EDITAR RESERVA</p>`;
  hotelState.forEach((hs, i) => {
    const pc = payColors[hs.payStatus] || "#8A9BAB";
    const badge = hs.payStatus ? `<span style="font-size:10px;padding:1px 8px;border-radius:10px;background:${hex(pc,0.13)};color:${pc};border:1px solid ${hex(pc,0.27)}">${hs.payStatus}</span>` : "";
    const sum = [hs.code ? `🔑 ${esc(hs.code)}` : "", hs.totalValue ? `R$ ${fmtBR(hs.totalValue)}` : ""].filter(Boolean).join("  ·  ");
    const hColor = hs.color || "#5D7A8A";
    
    let body = "";
    if (hs.expanded) {
      const payBtns = ["Pago","Parcial","Pendente"].map(s => {
        const c = payColors[s], sel = hs.payStatus === s;
        return `<button class="pay-btn" onclick="setHotelPayStatus(${i},'${s}')" style="border-color:${sel?hex(c,0.6):hex(c,0.27)};background:${sel?hex(c,0.13):"rgba(255,255,255,0.04)"};color:${sel?c:"#6A8A9A"}">${s}</button>`;
      }).join("");

      const flds = [
        ["code", "Código de Reserva", "ex: HTBR-4821"],
        ["room", "Tipo de Quarto", "ex: Standard Duplo"],
        ["checkinTime", "Horário Check-in", "ex: 14:00"],
        ["checkoutTime", "Horário Check-out", "ex: 12:00"]
      ];

      const editBaseFlds = `<div style="border-top:1px solid rgba(255,255,255,0.06);margin:14px 0 10px"></div><span class="section-title">EDITAR HOTEL</span>
        <div class="grid-2" style="margin-bottom:12px">
          <div><label class="field-label">CIDADE</label><input class="field-input" value="${esc(hs.city||'')}" placeholder="ex: Curitiba" onchange="setHotelField(${i},'city',this.value)"></div>
          <div><label class="field-label">NOME DO HOTEL</label><input class="field-input" value="${esc(hs.name||'')}" placeholder="ex: Hotel X" onchange="setHotelField(${i},'name',this.value)"></div>
          <div><label class="field-label">DATA CHECK-IN</label><input class="field-input" type="date" value="${esc(hs.checkin_iso||'')}" onchange="setHotelField(${i},'checkin_iso',this.value)"></div>
          <div><label class="field-label">DATA CHECK-OUT</label><input class="field-input" type="date" value="${esc(hs.checkout_iso||'')}" onchange="setHotelField(${i},'checkout_iso',this.value)"></div>
        </div>`;

      body = `<div class="card-body">
        ${editBaseFlds}
        <button onclick="openSearchModal('hotel', ${i})" style="width:100%;padding:12px;margin:4px 0 14px;border-radius:10px;background:rgba(74,171,189,0.1);border:1px solid rgba(74,171,189,0.3);color:#4AABBD;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;font-family:Inter,sans-serif">🔎 Pesquisar Preços (Agregadores)</button>
        <div style="border-top:1px solid rgba(255,255,255,0.06);margin:4px 0 14px"></div>
        <span class="section-title">DADOS DA RESERVA</span>
        <div class="grid-2" style="margin-bottom:12px">
          ${flds.map(([k,l,p]) => `<div><label class="field-label">${l.toUpperCase()}</label><input class="field-input" value="${esc(hs[k]||'')}" placeholder="${p}" onchange="setHotelField(${i},'${k}',this.value)"></div>`).join("")}
          <div>
            <label class="field-label">VALOR DA DIÁRIA (R$)</label>
            <input class="field-input" value="${hs.diaria ? fmtBR(hs.diaria) : ''}" placeholder="0,00" oninput="this.value = maskCurrency(this.value);" onchange="setHotelField(${i},'diaria',parseCurrency(this.value))">
          </div>
          <div>
            <label class="field-label" style="color:#6B9E78;font-weight:bold">VALOR TOTAL (R$)</label>
            <input class="field-input" style="color:#6B9E78;font-weight:bold" value="${hs.totalValue ? fmtBR(hs.totalValue) : ''}" placeholder="0,00" oninput="this.value = maskCurrency(this.value);" onchange="setHotelField(${i},'totalValue',parseCurrency(this.value))">
          </div>
        </div>
        <span class="section-title">PAGAMENTO</span>
        <div class="grid-2" style="margin-bottom:10px">
          <div><label class="field-label">FORMA DE PAGAMENTO</label><input class="field-input" value="${esc(hs.payMethod||'')}" placeholder="ex: Cartão / PIX" onchange="setHotelField(${i},'payMethod',this.value)"></div>
          <div><label class="field-label" style="color:#D4875C;font-weight:bold">VALOR PAGO (R$)</label><input class="field-input" style="color:#D4875C;font-weight:bold" value="${hs.paid ? fmtBR(hs.paid) : ''}" placeholder="0,00" oninput="this.value = maskCurrency(this.value);" onchange="setHotelField(${i},'paid',parseCurrency(this.value))"></div>
        </div>
        <div class="pay-btns">${payBtns}</div>
        <div><label class="field-label">OBSERVAÇÕES</label><input class="field-input" value="${esc(hs.obs||'')}" placeholder="ex: café incluso, cancelamento grátis" onchange="setHotelField(${i},'obs',this.value)"></div>
        <div style="margin-top: 16px; text-align: right;">
          <button onclick="deleteHotel(${i})" style="background:rgba(232,0,61,0.1);border:1px solid rgba(232,0,61,0.3);color:#E8003D;padding:6px 12px;border-radius:6px;font-size:11px;cursor:pointer">🗑️ Excluir Hotel</button>
        </div>
      </div>`;
    }
    html += `<div class="card" data-idx="${i}" style="background:${hs.confirmed ? hex(hColor,0.05) : "rgba(255,255,255,0.04)"};border-color:${hs.confirmed ? hex(hColor,0.33) : "rgba(255,255,255,0.08)"}">
      <div class="card-header">
        <button class="btn-confirm${hs.confirmed ? " on" : ""}" onclick="toggleHotelConfirm(${i})" style="${hs.confirmed ? `background:${hex(hColor,0.2)};border-color:${hColor}` : ""}">${hs.confirmed ? "✅" : "🔲"}</button>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:3px">
            <span style="font-size:11px;color:${hColor};letter-spacing:1px;text-transform:uppercase;font-weight:600">${hs.emoji||'🏨'} ${hs.city||'?'}</span>${badge}
          </div>
          <div style="font-size:15px;color:#F0E6D0;margin-bottom:3px;font-weight:500">${hs.name||'Nome do Hotel'}</div>
          <div style="font-size:11px;color:#6A8A9A">📅 ${hs.checkin_iso||'?'} → ${hs.checkout_iso||'?'}${sum ? `&nbsp;&nbsp;<span style="color:#D4875C">${sum}</span>` : ""}</div>
        </div>
        <button class="btn-expand" onclick="toggleHotelExpand(${i})">${hs.expanded ? "▲" : "✏️"}</button>
      </div>${body}</div>`;
  });

  html += `<button onclick="addHotel()" style="width:100%;margin-bottom:20px;padding:12px;background:rgba(255,255,255,0.05);border:1px dashed rgba(255,255,255,0.2);color:#8A9BAB;border-radius:12px;cursor:pointer;font-weight:600">+ Adicionar Novo Hotel</button>`;

  return html;
}

function toggleHotelConfirm(i) { hotelState[i].confirmed = !hotelState[i].confirmed; hotelState[i].expanded = hotelState[i].confirmed; saveState(); render(); }
function toggleHotelExpand(i) { hotelState[i].expanded = !hotelState[i].expanded; render(); }
function setHotelField(i, k, v) { hotelState[i][k] = v; saveState(); render(); }
function setHotelPayStatus(i, s) { hotelState[i].payStatus = hotelState[i].payStatus === s ? "" : s; saveState(); render(); }
function addHotel() {
  hotelState.push({ id: Date.now(), city:"", name:"", emoji:"🏨", color:"#5D7A8A", checkin_iso:"", checkout_iso:"", confirmed:false, expanded:true, code:"", checkinTime:"", checkoutTime:"", room:"", diaria:"", totalValue:"", paid:"", payMethod:"", payStatus:"", obs:"" });
  saveState(); render();
}
function deleteHotel(i) {
  if(!confirm("Tem certeza que deseja excluir este hotel?")) return;
  hotelState.splice(i, 1);
  saveState(); render();
}
