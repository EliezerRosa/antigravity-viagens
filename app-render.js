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

function searchPanel(services, type, isOpen=true) {
  const rows = services.map(s => `
    <a href="${s.url}" target="_blank" class="search-link" style="background:${hex(s.color,0.07)};border:1px solid ${hex(s.color,0.25)}">
      <span style="font-size:17px;width:22px;text-align:center">${s.icon}</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:600;color:${s.color}">${s.name}</div>
        <div style="font-size:10px;color:#6A8A9A;margin-top:1px">${s.hint}</div>
      </div>
      <span style="font-size:14px;color:${hex(s.color,0.6)}">→</span>
    </a>`).join("");
  return `<details ${isOpen ? 'open' : ''} style="margin-bottom:14px;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:12px;background:rgba(255,255,255,0.02)">
    <summary style="font-size:10px;letter-spacing:2px;color:#7A9BAB;cursor:pointer;outline:none;user-select:none;font-weight:600">
      🔎 BUSCAR MELHOR PREÇO — ${services.length} SERVIÇOS GRATUITOS
    </summary>
    <div style="margin-top:12px">
      <button class="open-all-btn" onclick="openAll${type==='voo'?'Flight':'Hotel'}Services(event)">🚀 Abrir Todos os ${services.length} Serviços de Uma Vez</button>
      ${rows}
    </div>
  </details>`;
}

function openAllFlightServices(e) {
  const idx = e.target.closest('.card')?.dataset?.idx;
  if(idx!==undefined) getFlightServices(flights[idx]).forEach(s => window.open(s.url,'_blank'));
}
function openAllHotelServices(e) {
  const idx = e.target.closest('.card')?.dataset?.idx;
  if(idx!==undefined) getHotelServices(hotels[idx]).forEach(s => window.open(s.url,'_blank'));
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
  if(activeTab===2) c.innerHTML=renderOrganic();
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
  flights.forEach((f,i) => {
    const fs=flightState[i], fromC=cityColors[f.from], toC=cityColors[f.to];
    const tags = fs.confirmed&&fs.number ? `<span class="inline-tag">${esc(fs.airline)} ${esc(fs.number)}</span>` : "";
    const time = [
      fs.confirmed&&fs.departure?`⬆ ${esc(fs.departure)}`:"",
      fs.confirmed&&fs.arrival?`⬇ ${esc(fs.arrival)}`:"",
      fs.confirmed&&fs.seat?`💺 ${esc(fs.seat)}`:"",
      !fs.confirmed?f.airlines.join(" · "):"",
      f.note?`<span style="color:#D4875C">★ ${esc(f.note)}</span>`:""
    ].filter(Boolean).join(" &nbsp;");

    let body = "";
    if(fs.expanded) {
      const airlBtns = f.airlines.map(a => {
        const ai=airlineInfo[a], sel=fs.airline===a;
        return `<button class="airline-btn" onclick="setFlightAirline(${i},'${a}')"
          style="border-color:${sel?ai.color:"rgba(255,255,255,0.12)"};background:${sel?hex(ai.color,0.13):"rgba(255,255,255,0.04)"};color:${sel?ai.color:"#8A9BAB"};${sel?"font-weight:bold":""}">${a}</button>`;
      }).join("");
      let airlLinks = "";
      if(fs.airline) { const ai=airlineInfo[fs.airline];
        airlLinks = `<div class="links-row"><a href="${ai.site}" target="_blank" class="link-btn" style="background:${hex(ai.color,0.13)};border:1px solid ${hex(ai.color,0.33)};color:${ai.color}">🌐 ${fs.airline}</a><a href="tel:${ai.phone}" class="link-btn" style="background:rgba(74,171,189,0.1);border:1px solid rgba(74,171,189,0.25);color:#4AABBD">📞 ${ai.phone}</a></div>`;
      }
      const flds = [["number","Número do Voo","ex: LA3042"],["departure","Partida","ex: 06:30"],["arrival","Chegada","ex: 08:15"],["seat","Assento","ex: 14A"],["terminal","Terminal","ex: T2"],["obs","Observações","ex: check-in online"]];
      const idealFlds = `<div class="grid-2" style="margin-bottom:12px"><div><label class="field-label">⏰ HORÁRIO IDEAL PARTIDA</label><input class="field-input" value="${esc(fs.idealDep||'')}" placeholder="ex: após 07:00" oninput="setFlightField(${i},'idealDep',this.value)"></div><div><label class="field-label">⏰ HORÁRIO IDEAL CHEGADA</label><input class="field-input" value="${esc(fs.idealArr||'')}" placeholder="ex: antes das 12:00" oninput="setFlightField(${i},'idealArr',this.value)"></div></div>`;
      body = `<div class="card-body">
        <details ${!fs.airline ? 'open' : ''} style="margin-bottom:14px;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:12px;background:rgba(255,255,255,0.02)">
          <summary style="font-size:11px;letter-spacing:1px;color:#D4875C;font-weight:600;cursor:pointer;outline:none;user-select:none">
            COMPANHIA AÉREA ${fs.airline ? `<span style="color:#6B9E78;margin-left:6px">✅ ${fs.airline}</span>` : ''}
          </summary>
          <div style="margin-top:12px">
            <div class="airline-btns">${airlBtns}</div>${airlLinks}
          </div>
        </details>
        ${idealFlds}
        ${searchPanel(getFlightServices(f),"voo", !fs.confirmed)}
        <div style="border-top:1px solid rgba(255,255,255,0.06);margin:10px 0 14px"></div>
        <span class="section-title">DADOS DO VOO CONFIRMADO</span>
        <div class="grid-2">${flds.map(([k,l,p])=>`<div><label class="field-label">${l.toUpperCase()}</label><input class="field-input" value="${esc(fs[k])}" placeholder="${p}" oninput="setFlightField(${i},'${k}',this.value)"></div>`).join("")}</div>
      </div>`;
    }
    html += `<div class="card${fs.confirmed?" confirmed":""}" data-idx="${i}">
      <div class="card-header">
        <button class="btn-confirm${fs.confirmed?" on":""}" onclick="toggleFlightConfirm(${i})">${fs.confirmed?"✅":"🔲"}</button>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:3px">
            <span class="tag" style="background:${hex(fromC,0.2)};color:${fromC}">${f.from}</span>
            <span style="color:#D4875C;font-size:13px">→</span>
            <span class="tag" style="background:${hex(toC,0.2)};color:${toC}">${f.to}</span>${tags}
          </div>
          <div style="font-size:11px;color:#6A8A9A"><span style="color:#D4875C;font-weight:600">${f.date}</span>&nbsp;&nbsp;${time}</div>
        </div>
        <button class="btn-expand" onclick="toggleFlightExpand(${i})">${fs.expanded?"▲":"✏️"}</button>
      </div>${body}</div>`;
  });
  html += `<div class="quicklinks"><div style="font-size:10px;color:#7A9BAB;letter-spacing:2px;margin-bottom:10px">ACESSO RÁPIDO</div><div style="display:flex;gap:8px;flex-wrap:wrap">
    <a href="https://www.google.com/travel/flights?hl=pt-BR" target="_blank" class="link-btn" style="background:rgba(66,133,244,0.13);border:1px solid rgba(66,133,244,0.35);color:#4285F4;font-weight:bold">🔍 Google Flights</a>
    ${Object.entries(airlineInfo).map(([n,ai])=>`<a href="${ai.site}" target="_blank" class="link-btn" style="background:${hex(ai.color,0.1)};border:1px solid ${hex(ai.color,0.27)};color:${ai.color}">🌐 ${n}</a>`).join("")}</div></div>`;
  return html;
}

function toggleFlightConfirm(i){flightState[i].confirmed=!flightState[i].confirmed;flightState[i].expanded=flightState[i].confirmed;saveState();render();}
function toggleFlightExpand(i){flightState[i].expanded=!flightState[i].expanded;render();}
function setFlightField(i,k,v){flightState[i][k]=v;saveState();}
function setFlightAirline(i,a){flightState[i].airline=flightState[i].airline===a?"":a;saveState();render();}

// ─── HOTELS ──────────────────────────────────────────────────────────────────
const payColors={Pago:"#6B9E78",Pendente:"#D4875C",Parcial:"#4AABBD"};
function renderHotels() {
  let html = `<p class="section-hint">TOQUE ✔ PARA CONFIRMAR · ✏️ PARA EDITAR RESERVA</p>`;
  hotels.forEach((h,i) => {
    const hs=hotelState[i], pc=payColors[hs.payStatus]||"#8A9BAB";
    const badge = hs.payStatus?`<span style="font-size:10px;padding:1px 8px;border-radius:10px;background:${hex(pc,0.13)};color:${pc};border:1px solid ${hex(pc,0.27)}">${hs.payStatus}</span>`:"";
    const sum = [hs.code?`🔑 ${esc(hs.code)}`:"",hs.totalValue?`R$ ${esc(hs.totalValue)}`:""].filter(Boolean).join("  ·  ");
    let body = "";
    if(hs.expanded) {
      const flds=[["code","Código de Reserva","ex: HTBR-4821"],["room","Tipo de Quarto","ex: Standard Duplo"],["checkinTime","Horário Check-in","ex: 14:00"],["checkoutTime","Horário Check-out","ex: 12:00"],["diaria","Valor da Diária","ex: R$ 320"],["totalValue","Valor Total","ex: R$ 2.880"]];
      const payF=[["payMethod","Forma de Pagamento","ex: Cartão / PIX"],["paid","Valor Pago","ex: R$ 1.440"]];
      const payBtns=["Pago","Parcial","Pendente"].map(s=>{const c=payColors[s],sel=hs.payStatus===s;return`<button class="pay-btn" onclick="setHotelPayStatus(${i},'${s}')" style="border-color:${sel?hex(c,0.6):hex(c,0.27)};background:${sel?hex(c,0.13):"rgba(255,255,255,0.04)"};color:${sel?c:"#6A8A9A"}">${s}</button>`;}).join("");
      body = `<div class="card-body">
        <div class="links-row">
          <a href="${h.site}" target="_blank" class="link-btn" style="background:${hex(h.color,0.13)};border:1px solid ${hex(h.color,0.33)};color:${h.color}">🌐 Site</a>
          <a href="tel:${h.phone}" class="link-btn" style="background:rgba(74,171,189,0.1);border:1px solid rgba(74,171,189,0.25);color:#4AABBD">📞 ${h.phone}</a>
          <a href="${h.maps}" target="_blank" class="link-btn" style="background:rgba(212,135,92,0.12);border:1px solid rgba(212,135,92,0.3);color:#D4875C">📍 Maps</a>
        </div>
        <div style="border-top:1px solid rgba(255,255,255,0.06);margin:4px 0 14px"></div>
        ${searchPanel(getHotelServices(h),"hotel", !hs.confirmed)}
        <div style="border-top:1px solid rgba(255,255,255,0.06);margin:4px 0 14px"></div>
        <span class="section-title">DADOS DA RESERVA</span>
        <div class="grid-2" style="margin-bottom:12px">${flds.map(([k,l,p])=>`<div><label class="field-label">${l.toUpperCase()}</label><input class="field-input" value="${esc(hs[k])}" placeholder="${p}" oninput="setHotelField(${i},'${k}',this.value)"></div>`).join("")}</div>
        <span class="section-title">PAGAMENTO</span>
        <div class="grid-2" style="margin-bottom:10px">${payF.map(([k,l,p])=>`<div><label class="field-label">${l.toUpperCase()}</label><input class="field-input" value="${esc(hs[k])}" placeholder="${p}" oninput="setHotelField(${i},'${k}',this.value)"></div>`).join("")}</div>
        <div class="pay-btns">${payBtns}</div>
        <div><label class="field-label">OBSERVAÇÕES</label><input class="field-input" value="${esc(hs.obs)}" placeholder="ex: café incluso, cancelamento grátis" oninput="setHotelField(${i},'obs',this.value)"></div>
      </div>`;
    }
    html += `<div class="card" data-idx="${i}" style="background:${hs.confirmed?hex(h.color,0.05):"rgba(255,255,255,0.04)"};border-color:${hs.confirmed?hex(h.color,0.33):"rgba(255,255,255,0.08)"}">
      <div class="card-header">
        <button class="btn-confirm${hs.confirmed?" on":""}" onclick="toggleHotelConfirm(${i})" style="${hs.confirmed?`background:${hex(h.color,0.2)};border-color:${h.color}`:""}">${hs.confirmed?"✅":"🔲"}</button>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:3px">
            <span style="font-size:11px;color:${h.color};letter-spacing:1px;text-transform:uppercase;font-weight:600">${h.emoji} ${h.city}</span>${badge}
          </div>
          <div style="font-size:15px;color:#F0E6D0;margin-bottom:3px;font-weight:500">${h.name}</div>
          <div style="font-size:11px;color:#6A8A9A">📅 ${h.checkin} → ${h.checkout}${sum?`&nbsp;&nbsp;<span style="color:#D4875C">${sum}</span>`:""}</div>
        </div>
        <button class="btn-expand" onclick="toggleHotelExpand(${i})">${hs.expanded?"▲":"✏️"}</button>
      </div>${body}</div>`;
  });
  return html;
}

function toggleHotelConfirm(i){hotelState[i].confirmed=!hotelState[i].confirmed;hotelState[i].expanded=hotelState[i].confirmed;saveState();render();}
function toggleHotelExpand(i){hotelState[i].expanded=!hotelState[i].expanded;render();}
function setHotelField(i,k,v){hotelState[i][k]=v;saveState();}
function setHotelPayStatus(i,s){hotelState[i].payStatus=hotelState[i].payStatus===s?"":s;saveState();render();}
