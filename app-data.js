// ─── STATIC DATA ─────────────────────────────────────────────────────────────
const GEMINI_KEY = "AIzaSyDJ2VOhpAVo9LqiJQi332-_J3L-tR0IXBw";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

const airlineInfo = {
  LATAM: { color:"#E8003D", site:"https://www.latamairlines.com/br/pt", phone:"0300 115 7000" },
  GOL:   { color:"#FF6600", site:"https://www.voegol.com.br",           phone:"0300 115 2121" },
  Azul:  { color:"#1A6EBD", site:"https://www.voeazul.com.br",          phone:"4003-1118" },
};
const cityColors = { VIX:"#6B9E78", GRU:"#7B8FA1", CWB:"#5D7A8A", SSA:"#D4875C", MCZ:"#4AABBD" };

const flights = [
  { date:"20/06", from:"VIX", to:"GRU", airlines:["LATAM","GOL"],  note:"", iso:"2026-06-20" },
  { date:"23/06", from:"GRU", to:"CWB", airlines:["Azul","GOL","LATAM"], note:"Azul R$199!", iso:"2026-06-23" },
  { date:"04/07", from:"CWB", to:"SSA", airlines:["GOL"],          note:"Voo Direto Único (sáb)", iso:"2026-07-04" },
  { date:"05/07", from:"SSA", to:"MCZ", airlines:["GOL","Azul"],   note:"", iso:"2026-07-05" },
  { date:"12/07", from:"MCZ", to:"SSA", airlines:["GOL","Azul"],   note:"", iso:"2026-07-12" },
  { date:"14/07", from:"SSA", to:"VIX", airlines:["GOL"],          note:"", iso:"2026-07-14" },
];

const hotels = [
  { city:"Curitiba", name:"Slaviero Centro",       phone:"(41) 3017-1000", maps:"https://maps.google.com/?q=Slaviero+Centro+Curitiba",        site:"https://www.slavierohoteis.com.br",    emoji:"🌲", color:"#5D7A8A", checkin:"23/06", checkout:"04/07", checkin_iso:"2026-06-23", checkout_iso:"2026-07-04" },
  { city:"Salvador", name:"Hotel Pituba Praiamar", phone:"(71) 3248-3933", maps:"https://maps.google.com/?q=Hotel+Pituba+Praiamar+Salvador",  site:"https://www.praiamar.com.br",          emoji:"🌊", color:"#D4875C", checkin:"04/07", checkout:"05/07", checkin_iso:"2026-07-04", checkout_iso:"2026-07-05" },
  { city:"Maceió",   name:"Hotel Brisa Praia",     phone:"(82) 2123-4800", maps:"https://maps.google.com/?q=Hotel+Brisa+Praia+Maceio",        site:"https://www.hotelbrisapraia.com.br",   emoji:"🏖️", color:"#4AABBD", checkin:"05/07", checkout:"12/07", checkin_iso:"2026-07-05", checkout_iso:"2026-07-12" },
];

const organic = [
  { city:"Curitiba", name:"Mercado Municipal",      sector:"Setor Orgânico", phone:null,              maps:"https://maps.google.com/?q=Mercado+Municipal+Curitiba",       emoji:"🌲" },
  { city:"Salvador", name:"Mundo Verde Pituba",     sector:"",               phone:"(71) 3345-0010",  maps:"https://maps.google.com/?q=Mundo+Verde+Pituba+Salvador",      emoji:"🌊" },
  { city:"Maceió",   name:"Grão de Trigo Ponta Verde", sector:"",            phone:"(82) 3327-3774",  maps:"https://maps.google.com/?q=Grao+de+Trigo+Ponta+Verde+Maceio", emoji:"🏖️" },
];

const expenses = [
  { id:1, category:"✈️ Aéreo",      item:"6 Trechos Diretos (pesquisado)", estimated:3143 },
  { id:2, category:"🏨 Hotel",       item:"19 noites (custo-benefício)",    estimated:2795 },
  { id:3, category:"🥗 Alimentação", item:"Diária Orgânicos (25 dias)",     estimated:3750 },
  { id:4, category:"🚗 Transporte",  item:"Uber/Táxi (25 dias)",            estimated:1500 },
];

// ─── STATE ───────────────────────────────────────────────────────────────────
const STORAGE_KEY = "viagem-brasil-v3";
const defaultFS = () => flights.map(() => ({ confirmed:false, expanded:false, airline:"", number:"", departure:"", arrival:"", seat:"", terminal:"", obs:"", idealDep:"", idealArr:"" }));
const defaultHS = () => hotels.map(() => ({ confirmed:false, expanded:false, code:"", checkinTime:"", checkoutTime:"", room:"", diaria:"", totalValue:"", paid:"", payMethod:"", payStatus:"", obs:"" }));
const defaultES = () => expenses.map(e => ({ ...e, paid:"" }));
const defaultAI = () => ({ flightOptions:[], hotelOptions:[], lastResult:"", mode:"flight" });

let activeTab = 0, flightState = defaultFS(), hotelState = defaultHS(), expState = defaultES(), aiState = defaultAI(), customExpenses = [];

// ─── PERSISTENCE ─────────────────────────────────────────────────────────────
function saveState() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ flightState, hotelState, expState, aiState, customExpenses })); } catch(e){} }
function loadState() {
  try {
    const d = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!d) return;
    if (d.flightState?.length === flights.length) flightState = d.flightState;
    if (d.hotelState?.length === hotels.length) hotelState = d.hotelState;
    if (d.expState?.length === expenses.length) expState = d.expState;
    if (d.aiState) aiState = d.aiState;
    if (d.customExpenses) customExpenses = d.customExpenses;
  } catch(e){}
}
function exportData() {
  const b = new Blob([JSON.stringify({ flightState, hotelState, expState, aiState, customExpenses },null,2)],{type:"application/json"});
  const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "viagem-brasil-backup.json"; a.click();
}
let pendingImportData = null;

function importData() {
  const inp = document.createElement("input"); inp.type="file"; inp.accept=".json";
  inp.onchange = e => { 
    const f = e.target.files[0]; if(!f) return; 
    const r = new FileReader();
    r.onload = ev => { 
      try { 
        pendingImportData = JSON.parse(ev.target.result);
        if(!pendingImportData) throw new Error();
        renderImportModal();
      } catch(err) { 
        showToast("❌ Arquivo inválido."); 
      }
    }; 
    r.readAsText(f); 
  }; 
  inp.click();
}

function renderImportModal() {
  let m = document.getElementById("import-modal");
  if(m) m.remove();
  
  const d = pendingImportData;
  const fOpts = flights.map((f,i) => `
    <label style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:13px;color:#F0E6D0;cursor:pointer">
      <input type="checkbox" id="imp-f-${i}" checked>
      Voo: ${f.from} → ${f.to} (${f.date})
    </label>
  `).join("");

  const hOpts = hotels.map((h,i) => `
    <label style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:13px;color:#F0E6D0;cursor:pointer">
      <input type="checkbox" id="imp-h-${i}" checked>
      Hotel: ${h.city} (${h.checkin} → ${h.checkout})
    </label>
  `).join("");

  const eOpts = `<label style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:13px;color:#F0E6D0;cursor:pointer"><input type="checkbox" id="imp-e" checked> Despesas</label>`;
  const aOpts = `<label style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:13px;color:#F0E6D0;cursor:pointer"><input type="checkbox" id="imp-a" checked> Pesquisas do Assistente IA</label>`;

  m = document.createElement("div");
  m.id = "import-modal";
  m.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,25,35,0.85);backdrop-filter:blur(4px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px";
  
  m.innerHTML = `
    <div style="background:#1E3040;border:1px solid rgba(212,135,92,0.4);border-radius:16px;padding:24px;width:100%;max-width:400px;max-height:80vh;overflow-y:auto;box-shadow:0 10px 40px rgba(0,0,0,0.5)">
      <div style="font-size:16px;font-weight:600;color:#D4875C;margin-bottom:16px">Selecione o que deseja importar:</div>
      <div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.1)">
        <div style="font-size:11px;color:#8A9BAB;margin-bottom:8px;letter-spacing:1px">TRECHOS (VOOS)</div>
        ${fOpts}
      </div>
      <div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.1)">
        <div style="font-size:11px;color:#8A9BAB;margin-bottom:8px;letter-spacing:1px">HOTÉIS</div>
        ${hOpts}
      </div>
      <div style="margin-bottom:16px">
        <div style="font-size:11px;color:#8A9BAB;margin-bottom:8px;letter-spacing:1px">OUTROS DADOS</div>
        ${eOpts}${aOpts}
      </div>
      <div style="display:flex;gap:12px">
        <button onclick="document.getElementById('import-modal').remove()" style="flex:1;padding:10px;background:transparent;border:1px solid rgba(255,255,255,0.2);color:#8A9BAB;border-radius:8px;cursor:pointer">Cancelar</button>
        <button onclick="confirmImport()" style="flex:1;padding:10px;background:#6B9E78;border:none;color:#fff;border-radius:8px;cursor:pointer;font-weight:600">Importar</button>
      </div>
    </div>
  `;
  document.body.appendChild(m);
}

function confirmImport() {
  const d = pendingImportData;
  if(!d) return;

  let snapshot = { flightState: {}, hotelState: {}, expState: null, aiState: null };
  let hasChanges = false;

  // Import selected flights
  if(d.flightState?.length === flights.length) {
    for(let i=0; i<flights.length; i++) {
      if(document.getElementById(`imp-f-${i}`)?.checked) {
        snapshot.flightState[i] = JSON.parse(JSON.stringify(flightState[i]));
        flightState[i] = d.flightState[i];
        hasChanges = true;
      }
    }
  }

  // Import selected hotels
  if(d.hotelState?.length === hotels.length) {
    for(let i=0; i<hotels.length; i++) {
      if(document.getElementById(`imp-h-${i}`)?.checked) {
        snapshot.hotelState[i] = JSON.parse(JSON.stringify(hotelState[i]));
        hotelState[i] = d.hotelState[i];
        hasChanges = true;
      }
    }
  }

  // Import expenses
  if(document.getElementById('imp-e')?.checked && d.expState?.length === expenses.length) {
    snapshot.expState = JSON.parse(JSON.stringify(expState));
    expState = d.expState;
    hasChanges = true;
  }

  // Import AI state
  if(document.getElementById('imp-a')?.checked && d.aiState) {
    snapshot.aiState = JSON.parse(JSON.stringify(aiState));
    aiState = d.aiState;
    hasChanges = true;
  }

  if (hasChanges) {
    localStorage.setItem('viagem-brasil-undo', JSON.stringify(snapshot));
  }

  saveState();
  render();
  document.getElementById("import-modal").remove();
  pendingImportData = null;
  showToast("✅ Importação concluída! (Pode ser desfeita)");
}

function renderUndoModal() {
  const snapStr = localStorage.getItem('viagem-brasil-undo');
  if(!snapStr) return;
  const snapshot = JSON.parse(snapStr);

  let m = document.getElementById("undo-modal");
  if(m) m.remove();

  let fOpts = "", hOpts = "", eOpts = "", aOpts = "";

  if(snapshot.flightState) {
    Object.keys(snapshot.flightState).forEach(i => {
      fOpts += `<label style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:13px;color:#F0E6D0;cursor:pointer"><input type="checkbox" id="undo-f-${i}" checked> Voo: ${flights[i].from} → ${flights[i].to}</label>`;
    });
  }

  if(snapshot.hotelState) {
    Object.keys(snapshot.hotelState).forEach(i => {
      hOpts += `<label style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:13px;color:#F0E6D0;cursor:pointer"><input type="checkbox" id="undo-h-${i}" checked> Hotel: ${hotels[i].city}</label>`;
    });
  }

  if(snapshot.expState) eOpts = `<label style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:13px;color:#F0E6D0;cursor:pointer"><input type="checkbox" id="undo-e" checked> Despesas</label>`;
  if(snapshot.aiState) aOpts = `<label style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:13px;color:#F0E6D0;cursor:pointer"><input type="checkbox" id="undo-a" checked> Pesquisas do Assistente IA</label>`;

  m = document.createElement("div");
  m.id = "undo-modal";
  m.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,25,35,0.85);backdrop-filter:blur(4px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px";
  
  m.innerHTML = `
    <div style="background:#1E3040;border:1px solid rgba(212,135,92,0.4);border-radius:16px;padding:24px;width:100%;max-width:400px;max-height:80vh;overflow-y:auto;box-shadow:0 10px 40px rgba(0,0,0,0.5)">
      <div style="font-size:16px;font-weight:600;color:#D4875C;margin-bottom:16px">⏪ Desfazer Importação</div>
      <div style="font-size:13px;color:#8A9BAB;margin-bottom:16px">Selecione quais itens você deseja reverter para o estado anterior:</div>
      ${fOpts ? `<div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.1)"><div style="font-size:11px;color:#8A9BAB;margin-bottom:8px;letter-spacing:1px">TRECHOS (VOOS)</div>${fOpts}</div>` : ''}
      ${hOpts ? `<div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.1)"><div style="font-size:11px;color:#8A9BAB;margin-bottom:8px;letter-spacing:1px">HOTÉIS</div>${hOpts}</div>` : ''}
      ${eOpts||aOpts ? `<div style="margin-bottom:16px"><div style="font-size:11px;color:#8A9BAB;margin-bottom:8px;letter-spacing:1px">OUTROS DADOS</div>${eOpts}${aOpts}</div>` : ''}
      <div style="display:flex;gap:12px">
        <button onclick="document.getElementById('undo-modal').remove()" style="flex:1;padding:10px;background:transparent;border:1px solid rgba(255,255,255,0.2);color:#8A9BAB;border-radius:8px;cursor:pointer">Cancelar</button>
        <button onclick="confirmUndo()" style="flex:1;padding:10px;background:#D4875C;border:none;color:#fff;border-radius:8px;cursor:pointer;font-weight:600">Reverter Selecionados</button>
      </div>
    </div>
  `;
  document.body.appendChild(m);
}

function confirmUndo() {
  const snapStr = localStorage.getItem('viagem-brasil-undo');
  if(!snapStr) return;
  let snapshot = JSON.parse(snapStr);
  let revertedAny = false;

  if(snapshot.flightState) {
    Object.keys(snapshot.flightState).forEach(i => {
      if(document.getElementById(`undo-f-${i}`)?.checked) {
        flightState[i] = snapshot.flightState[i];
        delete snapshot.flightState[i];
        revertedAny = true;
      }
    });
    if(Object.keys(snapshot.flightState).length === 0) delete snapshot.flightState;
  }

  if(snapshot.hotelState) {
    Object.keys(snapshot.hotelState).forEach(i => {
      if(document.getElementById(`undo-h-${i}`)?.checked) {
        hotelState[i] = snapshot.hotelState[i];
        delete snapshot.hotelState[i];
        revertedAny = true;
      }
    });
    if(Object.keys(snapshot.hotelState).length === 0) delete snapshot.hotelState;
  }

  if(snapshot.expState && document.getElementById('undo-e')?.checked) {
    expState = snapshot.expState;
    delete snapshot.expState;
    revertedAny = true;
  }

  if(snapshot.aiState && document.getElementById('undo-a')?.checked) {
    aiState = snapshot.aiState;
    delete snapshot.aiState;
    revertedAny = true;
  }

  if(Object.keys(snapshot).length === 0 || (!snapshot.flightState && !snapshot.hotelState && !snapshot.expState && !snapshot.aiState)) {
    localStorage.removeItem('viagem-brasil-undo');
  } else if (revertedAny) {
    localStorage.setItem('viagem-brasil-undo', JSON.stringify(snapshot));
  }

  saveState();
  render();
  document.getElementById("undo-modal").remove();
  if(revertedAny) showToast("⏪ Importação revertida com sucesso!");
}

function resetData() {
  if(!confirm("Apagar todos os dados?")) return;
  flightState=defaultFS(); hotelState=defaultHS(); expState=defaultES(); aiState=defaultAI(); customExpenses=[];
  localStorage.removeItem(STORAGE_KEY); render(); showToast("🗑️ Dados apagados.");
}
function showToast(msg) {
  let t=document.getElementById("toast");
  if(!t){t=document.createElement("div");t.id="toast";document.body.appendChild(t);}
  t.textContent=msg;
  t.style.cssText="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1E3040;border:1px solid rgba(212,135,92,0.4);color:#E8DFC8;padding:10px 20px;border-radius:20px;font-size:13px;z-index:999;transition:opacity 0.4s;opacity:1;font-family:Inter,sans-serif";
  clearTimeout(t._timer); t._timer=setTimeout(()=>{t.style.opacity="0";},2200);
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const hex=(c,a)=>{const r=parseInt(c.slice(1,3),16),g=parseInt(c.slice(3,5),16),b=parseInt(c.slice(5,7),16);return`rgba(${r},${g},${b},${a})`};
const fmtBR=n=>n.toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const isoToSky=iso=>iso.replace(/-/g,"").slice(2);
