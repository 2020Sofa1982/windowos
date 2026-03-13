import { useState, useEffect } from "react";
import {
  LayoutDashboard, Users, ShoppingCart, Package, Wallet,
  Calculator, Plus, Search, X, Check, Clock, AlertTriangle,
  TrendingUp, Trash2, Download, BarChart2,
  ArrowUpRight, ArrowDownRight, DollarSign, Eye, Bell
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, ReferenceLine
} from "recharts";

// ── LOCAL STORAGE ────────────────────────────────────────────
const KEYS = {
  leads: "wb:leads", orders: "wb:orders",
  inventory: "wb:inventory", payments: "wb:payments", kpi: "wb:kpi"
};
const load = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
};
const save = (key, data) => {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
};

// ── INITIAL DATA ─────────────────────────────────────────────
const INIT_LEADS = [
  { id: 1, name: "Давид Коэн", phone: "052-111-2233", city: "Тель-Авив", type: "Частный", windows: 4, status: "Замер назначен", date: "2025-03-12", source: "Google Ads", value: 12000, notes: "" },
  { id: 2, name: "Строй-Проект ЛТД", phone: "054-222-3344", city: "Ришон ле-Цион", type: "Подрядчик", windows: 24, status: "КП отправлено", date: "2025-03-10", source: "Рекомендация", value: 85000, notes: "" },
  { id: 3, name: "Ирина Леви", phone: "050-333-4455", city: "Хайфа", type: "Частный", windows: 6, status: "Новый лид", date: "2025-03-14", source: "Google Maps", value: 18000, notes: "" },
];
const INIT_ORDERS = [
  { id: "WB-001", client: "АрхиМастер", windows: 40, total: 140000, paid: 56000, status: "В производстве", created: "2025-03-06", delivery: "2025-03-25", city: "Иерусалим", progress: 60, notes: "" },
  { id: "WB-002", client: "Давид Коэн", windows: 4, total: 12000, paid: 4800, status: "Ожидает материалов", created: "2025-03-12", delivery: "2025-03-28", city: "Тель-Авив", progress: 10, notes: "" },
  { id: "WB-003", client: "Ноам Шапиро", windows: 8, total: 28000, paid: 28000, status: "Завершён", created: "2025-02-20", delivery: "2025-03-05", city: "Петах-Тиква", progress: 100, notes: "" },
];
const INIT_INVENTORY = [
  { id: 1, name: "Профиль Alumil S67", unit: "м.п.", qty: 340, minQty: 100, price: 28, category: "Профиль" },
  { id: 2, name: "Профиль Gutmann MT70", unit: "м.п.", qty: 80, minQty: 100, price: 35, category: "Профиль" },
  { id: 3, name: "Стеклопакет 4-12-4 стандарт", unit: "кв.м.", qty: 45, minQty: 20, price: 120, category: "Стекло" },
  { id: 4, name: "Стеклопакет 4-16-4 энерго", unit: "кв.м.", qty: 12, minQty: 20, price: 165, category: "Стекло" },
  { id: 5, name: "Ручка Hoppe", unit: "шт.", qty: 87, minQty: 30, price: 45, category: "Фурнитура" },
  { id: 6, name: "Петля Siegenia", unit: "пар", qty: 54, minQty: 30, price: 85, category: "Фурнитура" },
  { id: 7, name: "Уплотнитель EPDM", unit: "рул.", qty: 8, minQty: 5, price: 220, category: "Материалы" },
  { id: 8, name: "Пена монтажная Soudal", unit: "шт.", qty: 6, minQty: 10, price: 38, category: "Материалы" },
];
const INIT_PAYMENTS = [
  { id: 1, order: "WB-001", client: "АрхиМастер", type: "Предоплата", amount: 56000, date: "2025-03-07", method: "Банк", status: "Получен" },
  { id: 2, order: "WB-002", client: "Давид Коэн", type: "Предоплата", amount: 4800, date: "2025-03-13", method: "Наличные", status: "Получен" },
  { id: 3, order: "WB-003", client: "Ноам Шапиро", type: "Финальный", amount: 28000, date: "2025-03-05", method: "Банк", status: "Получен" },
  { id: 4, order: "WB-001", client: "АрхиМастер", type: "Финальный", amount: 84000, date: "2025-03-25", method: "Банк", status: "Ожидается" },
];
const INIT_KPI = [
  { month: "Янв", leads: 8, measures: 4, orders: 2, revenue: 28000, cogs: 17000, opex: 19000, adSpend: 4000 },
  { month: "Фев", leads: 12, measures: 6, orders: 3, revenue: 46000, cogs: 28000, opex: 19200, adSpend: 4000 },
  { month: "Мар", leads: 18, measures: 9, orders: 5, revenue: 180000, cogs: 108000, opex: 19400, adSpend: 4500 },
];

// ── TOKENS ───────────────────────────────────────────────────
const D = {
  bg: "#090E1A", surface: "#0F1729", card: "#131D30", border: "#1E2D45",
  text: "#E8EDF5", muted: "#4A607A", accent: "#2563EB", accentLight: "#3B82F6",
  green: "#10B981", yellow: "#F59E0B", red: "#EF4444", purple: "#8B5CF6",
};
const STATUS_COLOR = {
  "Новый лид": "#3B82F6", "Замер назначен": "#8B5CF6", "КП отправлено": "#F59E0B",
  "Follow-up": "#EC4899", "Закрыт (выиграли)": "#10B981", "Закрыт (проиграли)": "#EF4444",
  "Ожидает материалов": "#F59E0B", "В производстве": "#3B82F6", "Монтаж": "#8B5CF6", "Завершён": "#10B981",
  "Получен": "#10B981", "Ожидается": "#F59E0B",
};
const LEAD_STATUSES = ["Новый лид","Замер назначен","КП отправлено","Follow-up","Закрыт (выиграли)","Закрыт (проиграли)"];
const ORDER_STATUSES = ["Ожидает материалов","В производстве","Монтаж","Завершён"];
const PROGRESS_MAP = {"Ожидает материалов":10,"В производстве":50,"Монтаж":85,"Завершён":100};
const fmt = n => "₪" + Math.round(n).toLocaleString("ru-RU");
const pct = n => (n*100).toFixed(1)+"%";

// ── UI ATOMS ─────────────────────────────────────────────────
const Badge = ({ status }) => (
  <span style={{ background:(STATUS_COLOR[status]||D.muted)+"22", color:STATUS_COLOR[status]||D.muted,
    border:`1px solid ${(STATUS_COLOR[status]||D.muted)}44`, padding:"2px 10px",
    borderRadius:20, fontSize:11, fontWeight:700, whiteSpace:"nowrap" }}>{status}</span>
);

const Btn = ({ children, onClick, variant="primary", small, disabled, style:s }) => {
  const v = {
    primary: { background:"linear-gradient(135deg,#2563EB,#1D4ED8)", color:"#fff", border:"none" },
    success: { background:D.green+"20", color:D.green, border:`1px solid ${D.green}40` },
    danger:  { background:D.red+"18", color:D.red, border:`1px solid ${D.red}35` },
    ghost:   { background:D.card, color:D.muted, border:`1px solid ${D.border}` },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...v[variant], borderRadius:8,
      padding:small?"5px 11px":"8px 16px", fontSize:small?11:13, fontWeight:700,
      cursor:disabled?"not-allowed":"pointer", display:"inline-flex", alignItems:"center",
      gap:5, opacity:disabled?0.5:1, ...s }}>{children}</button>
  );
};

const Input = ({ label, ...p }) => (
  <div style={{ marginBottom:12 }}>
    {label && <div style={{fontSize:10,fontWeight:700,color:D.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.05em"}}>{label}</div>}
    <input {...p} style={{ width:"100%", background:D.bg, border:`1px solid ${D.border}`, borderRadius:8,
      padding:"8px 12px", color:D.text, fontSize:13, outline:"none", boxSizing:"border-box", ...p.style }} />
  </div>
);

const Sel = ({ label, options, ...p }) => (
  <div style={{ marginBottom:12 }}>
    {label && <div style={{fontSize:10,fontWeight:700,color:D.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.05em"}}>{label}</div>}
    <select {...p} style={{ width:"100%", background:D.bg, border:`1px solid ${D.border}`, borderRadius:8,
      padding:"8px 12px", color:D.text, fontSize:13, outline:"none", boxSizing:"border-box" }}>
      {options.map(o => <option key={o} value={o} style={{background:D.card}}>{o}</option>)}
    </select>
  </div>
);

const ProgressBar = ({ value, color=D.accent }) => (
  <div style={{background:D.border,borderRadius:4,height:5,minWidth:80}}>
    <div style={{width:`${Math.min(value,100)}%`,height:"100%",background:color,borderRadius:4,transition:"width 0.5s"}}/>
  </div>
);

const Modal = ({ title, onClose, children }) => (
  <div style={{position:"fixed",inset:0,background:"#000000BB",zIndex:1000,
    display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
    <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:16,
      padding:28,width:480,maxHeight:"90vh",overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{fontSize:16,fontWeight:800,color:D.text}}>{title}</div>
        <button onClick={onClose} style={{background:D.border,border:"none",borderRadius:8,
          padding:"4px 8px",cursor:"pointer",color:D.muted,fontSize:16}}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const TT = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{background:D.bg,border:`1px solid ${D.border}`,borderRadius:8,padding:"10px 14px",fontSize:12}}>
      <div style={{fontWeight:800,color:D.text,marginBottom:6}}>{label}</div>
      {payload.map((p,i)=><div key={i} style={{color:p.color}}>{p.name}: <b>{typeof p.value==="number"&&p.value>999?fmt(p.value):p.value}</b></div>)}
    </div>
  );
};

const KpiCard = ({ icon:Icon, label, value, sub, color, trend, target }) => {
  const ratio = target ? Math.min((typeof value==="string"?parseFloat(value.replace(/[^0-9.]/g,"")):value)/target,1.5) : null;
  return (
    <div style={{background:`linear-gradient(135deg,${D.card},${D.surface})`,border:`1px solid ${D.border}`,
      borderRadius:14,padding:"18px 20px",display:"flex",flexDirection:"column",gap:8}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{background:color+"20",borderRadius:10,padding:8,display:"inline-flex"}}><Icon size={17} color={color}/></div>
        {trend!=null&&<span style={{fontSize:11,color:trend>=0?D.green:D.red,fontWeight:700}}>
          {trend>=0?"↑":"↓"}{Math.abs(trend)}%</span>}
      </div>
      <div style={{fontSize:26,fontWeight:900,color:D.text,letterSpacing:"-0.04em"}}>{value}</div>
      <div style={{fontSize:11,color:D.muted,fontWeight:600}}>{label}</div>
      {sub&&<div style={{fontSize:11,color:D.muted+"99"}}>{sub}</div>}
      {ratio!=null&&<div style={{background:D.border,borderRadius:4,height:3}}>
        <div style={{width:`${ratio*100}%`,height:"100%",borderRadius:4,
          background:ratio>=1?D.green:ratio>0.7?D.yellow:D.red,transition:"width 0.5s"}}/>
      </div>}
    </div>
  );
};

// ── EXPORT CSV ───────────────────────────────────────────────
const exportCSV = (headers, rows, filename) => {
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(csv);
  a.download = filename; a.click();
};

// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════
function Dashboard({ leads, orders, payments, inventory, kpi }) {
  const totalPaid = payments.filter(p=>p.status==="Получен").reduce((s,p)=>s+p.amount,0);
  const totalRevenue = orders.reduce((s,o)=>s+o.total,0);
  const activeOrders = orders.filter(o=>o.status!=="Завершён").length;
  const newLeads = leads.filter(l=>l.status==="Новый лид").length;
  const lowStock = inventory.filter(i=>i.qty<i.minQty).length;
  const pending = payments.filter(p=>p.status==="Ожидается");

  const pieData = [
    {name:"Новый",value:leads.filter(l=>l.status==="Новый лид").length,c:D.accentLight},
    {name:"Замер",value:leads.filter(l=>l.status==="Замер назначен").length,c:D.purple},
    {name:"КП",value:leads.filter(l=>l.status==="КП отправлено").length,c:D.yellow},
    {name:"Выиграли",value:leads.filter(l=>l.status==="Закрыт (выиграли)").length,c:D.green},
  ];

  return (
    <div>
      <div style={{marginBottom:22}}>
        <div style={{fontSize:22,fontWeight:900,color:D.text}}>Dashboard</div>
        <div style={{fontSize:13,color:D.muted,marginTop:2}}>Общая картина бизнеса в реальном времени</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
        <KpiCard icon={Users} label="Новых лидов" value={newLeads} color={D.accentLight} trend={24} sub="Требуют обработки" target={5}/>
        <KpiCard icon={ShoppingCart} label="Активных заказов" value={activeOrders} color={D.purple} sub={`Всего ${orders.length}`}/>
        <KpiCard icon={DollarSign} label="Получено" value={fmt(totalPaid)} color={D.green} sub={`из ${fmt(totalRevenue)}`}/>
        <KpiCard icon={AlertTriangle} label="Мало на складе" value={lowStock} color={D.yellow} sub="позиций ниже минимума"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16,marginBottom:16}}>
        <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,padding:20}}>
          <div style={{fontSize:12,fontWeight:800,color:D.muted,marginBottom:14}}>📈 ВЫРУЧКА И ПРИБЫЛЬ</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={kpi.map(d=>({month:d.month,"Выручка":d.revenue,"EBITDA":d.revenue-d.cogs-d.opex}))} barGap={3}>
              <XAxis dataKey="month" stroke={D.muted} tick={{fontSize:11,fill:D.muted}}/>
              <YAxis stroke={D.muted} tick={{fontSize:10,fill:D.muted}} tickFormatter={v=>"₪"+v/1000+"k"}/>
              <Tooltip content={<TT/>}/>
              <Bar dataKey="Выручка" fill={D.accentLight+"90"} radius={[4,4,0,0]}/>
              <Bar dataKey="EBITDA" fill={D.green} radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,padding:20}}>
          <div style={{fontSize:12,fontWeight:800,color:D.muted,marginBottom:14}}>🎯 ВОРОНКА</div>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={62} dataKey="value">
              {pieData.map((d,i)=><Cell key={i} fill={d.c}/>)}
            </Pie><Tooltip content={<TT/>}/></PieChart>
          </ResponsiveContainer>
          <div style={{display:"flex",flexWrap:"wrap",gap:"3px 10px",marginTop:4}}>
            {pieData.map((d,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:D.muted}}>
                <div style={{width:6,height:6,borderRadius:2,background:d.c}}/>{d.name}: <b style={{color:D.text}}>{d.value}</b>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,padding:20}}>
          <div style={{fontSize:12,fontWeight:800,color:D.muted,marginBottom:12}}>🏭 АКТИВНЫЕ ЗАКАЗЫ</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {orders.filter(o=>o.status!=="Завершён").map(o=>(
              <div key={o.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",
                background:D.surface,borderRadius:10,border:`1px solid ${D.border}`}}>
                <div style={{fontSize:11,fontWeight:800,color:D.accentLight,minWidth:55}}>{o.id}</div>
                <div style={{flex:1,fontSize:12,fontWeight:600,color:D.text}}>{o.client}</div>
                <Badge status={o.status}/>
                <div style={{minWidth:80}}><ProgressBar value={o.progress} color={o.progress===100?D.green:D.accent}/></div>
                <div style={{fontSize:12,fontWeight:700,color:D.text,minWidth:65,textAlign:"right"}}>{fmt(o.total)}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,padding:20}}>
          <div style={{fontSize:12,fontWeight:800,color:D.muted,marginBottom:12}}>⚡ ОЖИДАЕМЫЕ ПЛАТЕЖИ</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {pending.length===0
              ? <div style={{color:D.muted,fontSize:13,textAlign:"center",padding:20}}>✅ Нет ожидаемых платежей</div>
              : pending.map(p=>(
                <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",
                  background:D.yellow+"10",borderRadius:10,border:`1px solid ${D.yellow}30`}}>
                  <Clock size={13} color={D.yellow}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:D.text}}>{p.client}</div>
                    <div style={{fontSize:10,color:D.muted}}>{p.type} · {p.date}</div>
                  </div>
                  <div style={{fontSize:14,fontWeight:800,color:D.yellow}}>{fmt(p.amount)}</div>
                </div>
              ))}
          </div>
          {pending.length>0&&<div style={{borderTop:`1px solid ${D.border}`,marginTop:14,paddingTop:14,
            display:"flex",justifyContent:"space-between"}}>
            <span style={{fontSize:12,color:D.muted}}>Итого ожидается</span>
            <span style={{fontSize:16,fontWeight:800,color:D.yellow}}>{fmt(pending.reduce((s,p)=>s+p.amount,0))}</span>
          </div>}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LEADS
// ═══════════════════════════════════════════════════════════════
function Leads({ leads, setLeads }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Все");
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({name:"",phone:"",city:"",type:"Частный",windows:"1",source:"Google Ads",status:"Новый лид",value:"",notes:""});

  const filtered = leads.filter(l=>(filter==="Все"||l.status===filter)&&
    (l.name.toLowerCase().includes(search.toLowerCase())||l.phone.includes(search)));

  const openAdd = () => { setEdit(null); setForm({name:"",phone:"",city:"",type:"Частный",windows:"1",source:"Google Ads",status:"Новый лид",value:"",notes:""}); setModal(true); };
  const openEdit = l => { setEdit(l.id); setForm({...l,windows:String(l.windows),value:String(l.value)}); setModal(true); };
  const submit = () => {
    if (!form.name||!form.phone) return;
    const data = {...form,windows:+form.windows||1,value:+form.value||0,date:new Date().toISOString().split("T")[0]};
    if (edit) setLeads(p=>p.map(l=>l.id===edit?{...data,id:edit}:l));
    else setLeads(p=>[...p,{...data,id:Date.now()}]);
    setModal(false);
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div>
          <div style={{fontSize:22,fontWeight:900,color:D.text}}>CRM · Лиды</div>
          <div style={{fontSize:13,color:D.muted,marginTop:2}}>{leads.length} в базе</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={()=>exportCSV(["Имя","Телефон","Город","Тип","Окон","Статус","Источник","Сумма","Дата"],
            leads.map(l=>[l.name,l.phone,l.city,l.type,l.windows,l.status,l.source,l.value,l.date]),"лиды.csv")} variant="ghost">
            <Download size={13}/> Экспорт CSV
          </Btn>
          <Btn onClick={openAdd}><Plus size={13}/> Новый лид</Btn>
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:1,minWidth:200}}>
          <Search size={12} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:D.muted}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Поиск по имени или телефону..."
            style={{width:"100%",background:D.card,border:`1px solid ${D.border}`,borderRadius:8,
              padding:"8px 10px 8px 30px",color:D.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
        </div>
        {["Все","Новый лид","Замер назначен","КП отправлено","Закрыт (выиграли)"].map(s=>(
          <button key={s} onClick={()=>setFilter(s)} style={{padding:"6px 12px",borderRadius:8,fontSize:11,fontWeight:700,
            cursor:"pointer",border:`1px solid ${filter===s?D.accent:D.border}`,
            background:filter===s?D.accent+"20":"transparent",color:filter===s?D.accentLight:D.muted}}>
            {s==="Все"?`Все (${leads.length})`:s}
          </button>
        ))}
      </div>
      <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1.2fr 1fr 0.8fr 1.2fr 1fr 64px",
          padding:"8px 14px",background:D.surface,gap:10}}>
          {["Клиент","Телефон","Город","Окон","Статус","Сумма",""].map((h,i)=>(
            <div key={i} style={{fontSize:9,fontWeight:800,color:D.muted,textTransform:"uppercase",letterSpacing:"0.06em"}}>{h}</div>
          ))}
        </div>
        {filtered.length===0&&<div style={{padding:40,textAlign:"center",color:D.muted}}>Нет лидов</div>}
        {filtered.map((l,i)=>(
          <div key={l.id} style={{display:"grid",gridTemplateColumns:"2fr 1.2fr 1fr 0.8fr 1.2fr 1fr 64px",
            padding:"10px 14px",gap:10,alignItems:"center",
            background:i%2===0?D.card:D.surface,borderTop:`1px solid ${D.border}`}}>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:D.text}}>{l.name}</div>
              <div style={{fontSize:10,color:D.muted,marginTop:1}}>{l.type} · {l.source} · {l.date}</div>
            </div>
            <div style={{fontSize:12,color:D.muted}}>{l.phone}</div>
            <div style={{fontSize:12,color:D.muted}}>{l.city}</div>
            <div style={{fontSize:13,fontWeight:700,color:D.text,textAlign:"center"}}>{l.windows}</div>
            <select value={l.status} onChange={e=>setLeads(p=>p.map(x=>x.id===l.id?{...x,status:e.target.value}:x))}
              style={{background:(STATUS_COLOR[l.status]||D.muted)+"18",color:STATUS_COLOR[l.status]||D.muted,
                border:`1px solid ${(STATUS_COLOR[l.status]||D.muted)}40`,borderRadius:6,
                padding:"3px 6px",fontSize:11,fontWeight:700,cursor:"pointer"}}>
              {LEAD_STATUSES.map(s=><option key={s} value={s} style={{background:D.card,color:D.text}}>{s}</option>)}
            </select>
            <div style={{fontSize:13,fontWeight:700,color:D.green}}>{fmt(l.value)}</div>
            <div style={{display:"flex",gap:4}}>
              <button onClick={()=>openEdit(l)} style={{background:"none",border:"none",cursor:"pointer",color:D.muted,padding:4}}><Eye size={13}/></button>
              <button onClick={()=>setLeads(p=>p.filter(x=>x.id!==l.id))} style={{background:"none",border:"none",cursor:"pointer",color:D.muted,padding:4}}><Trash2 size={13}/></button>
            </div>
          </div>
        ))}
      </div>
      {modal&&(
        <Modal title={edit?"✏️ Редактировать лид":"➕ Новый лид"} onClose={()=>setModal(false)}>
          <Input label="Имя *" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Имя клиента"/>
          <Input label="Телефон *" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} placeholder="052-000-0000"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Input label="Город" value={form.city} onChange={e=>setForm(p=>({...p,city:e.target.value}))}/>
            <Input label="Кол-во окон" value={form.windows} onChange={e=>setForm(p=>({...p,windows:e.target.value}))} type="number"/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Sel label="Тип" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} options={["Частный","Подрядчик","Архитектор"]}/>
            <Sel label="Источник" value={form.source} onChange={e=>setForm(p=>({...p,source:e.target.value}))} options={["Google Ads","Google Maps","Рекомендация","Instagram","Архитектор","Прораб"]}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Sel label="Статус" value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))} options={LEAD_STATUSES}/>
            <Input label="Оценка ₪" value={form.value} onChange={e=>setForm(p=>({...p,value:e.target.value}))} type="number"/>
          </div>
          <Input label="Заметки" value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Дополнительная информация..."/>
          <div style={{display:"flex",gap:8,marginTop:4}}>
            <Btn onClick={submit}><Check size={13}/> {edit?"Сохранить":"Добавить"}</Btn>
            <Btn onClick={()=>setModal(false)} variant="ghost">Отмена</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ORDERS
// ═══════════════════════════════════════════════════════════════
function Orders({ orders, setOrders, setPayments }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({client:"",city:"",windows:"1",total:"",delivery:"",notes:""});

  const addOrder = () => {
    if (!form.client||!form.total) return;
    const id = "WB-"+String(orders.length+1).padStart(3,"0");
    setOrders(p=>[...p,{...form,id,windows:+form.windows||1,total:+form.total,paid:0,
      status:"Ожидает материалов",progress:10,created:new Date().toISOString().split("T")[0]}]);
    setModal(false);
    setForm({client:"",city:"",windows:"1",total:"",delivery:"",notes:""});
  };

  const updateStatus = (id,status) =>
    setOrders(p=>p.map(o=>o.id===id?{...o,status,progress:PROGRESS_MAP[status]||o.progress}:o));

  const addPayment = (o) => {
    const amount = o.total - o.paid;
    if (amount<=0) return;
    setPayments(p=>[...p,{id:Date.now(),order:o.id,client:o.client,type:"Финальный",
      amount,date:new Date().toISOString().split("T")[0],method:"Банк",status:"Ожидается"}]);
    setOrders(p=>p.map(x=>x.id===o.id?{...x,paid:o.total}:x));
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div>
          <div style={{fontSize:22,fontWeight:900,color:D.text}}>Заказы</div>
          <div style={{fontSize:13,color:D.muted,marginTop:2}}>{orders.length} заказов</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={()=>exportCSV(["ID","Клиент","Город","Окон","Сумма","Оплачено","Остаток","Статус","Создан","Сдача"],
            orders.map(o=>[o.id,o.client,o.city,o.windows,o.total,o.paid,o.total-o.paid,o.status,o.created,o.delivery]),"заказы.csv")} variant="ghost">
            <Download size={13}/> Экспорт CSV
          </Btn>
          <Btn onClick={()=>setModal(true)}><Plus size={13}/> Новый заказ</Btn>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {orders.map(o=>{
          const debt=o.total-o.paid;
          return (
            <div key={o.id} style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,padding:"18px 20px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                <div style={{display:"flex",gap:12,alignItems:"center"}}>
                  <div style={{background:D.accent+"20",border:`1px solid ${D.accent}40`,borderRadius:8,
                    padding:"3px 10px",fontSize:11,fontWeight:800,color:D.accentLight}}>{o.id}</div>
                  <div>
                    <div style={{fontSize:15,fontWeight:800,color:D.text}}>{o.client}</div>
                    <div style={{fontSize:11,color:D.muted,marginTop:2}}>{o.city} · {o.windows} окон · Сдача: {o.delivery}</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  {o.status!=="Завершён"&&debt>0&&<Btn onClick={()=>addPayment(o)} variant="success" small><Plus size={11}/> Платёж</Btn>}
                  <select value={o.status} onChange={e=>updateStatus(o.id,e.target.value)}
                    style={{background:(STATUS_COLOR[o.status]||D.muted)+"18",color:STATUS_COLOR[o.status]||D.muted,
                      border:`1px solid ${(STATUS_COLOR[o.status]||D.muted)}40`,borderRadius:8,
                      padding:"5px 10px",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                    {ORDER_STATUSES.map(s=><option key={s} value={s} style={{background:D.card,color:D.text}}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 2fr",gap:16,alignItems:"center"}}>
                {[["Сумма",fmt(o.total),D.text],["Получено",fmt(o.paid),D.green],["Остаток",fmt(debt),debt>0?D.yellow:D.green]].map(([l,v,c])=>(
                  <div key={l}>
                    <div style={{fontSize:9,color:D.muted,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>{l}</div>
                    <div style={{fontSize:18,fontWeight:800,color:c}}>{v}</div>
                  </div>
                ))}
                <div>
                  <div style={{fontSize:9,color:D.muted,fontWeight:700,textTransform:"uppercase",marginBottom:6}}>Прогресс {o.progress}%</div>
                  <ProgressBar value={o.progress} color={o.progress===100?D.green:o.progress>50?D.purple:D.accent}/>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {modal&&(
        <Modal title="📦 Новый заказ" onClose={()=>setModal(false)}>
          <Input label="Клиент *" value={form.client} onChange={e=>setForm(p=>({...p,client:e.target.value}))}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Input label="Город" value={form.city} onChange={e=>setForm(p=>({...p,city:e.target.value}))}/>
            <Input label="Кол-во окон" value={form.windows} onChange={e=>setForm(p=>({...p,windows:e.target.value}))} type="number"/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Input label="Сумма ₪ *" value={form.total} onChange={e=>setForm(p=>({...p,total:e.target.value}))} type="number"/>
            <Input label="Дата сдачи" value={form.delivery} onChange={e=>setForm(p=>({...p,delivery:e.target.value}))} type="date"/>
          </div>
          {form.total&&<div style={{background:D.surface,borderRadius:8,padding:12,marginBottom:12,fontSize:12,color:D.muted}}>
            Предоплата 40%: <b style={{color:D.green}}>{fmt(+form.total*0.4)}</b> · Остаток: <b style={{color:D.yellow}}>{fmt(+form.total*0.6)}</b>
          </div>}
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={addOrder}><Check size={13}/> Создать</Btn>
            <Btn onClick={()=>setModal(false)} variant="ghost">Отмена</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// INVENTORY
// ═══════════════════════════════════════════════════════════════
function Inventory({ inventory, setInventory }) {
  const low = inventory.filter(i=>i.qty<i.minQty);
  const cats = [...new Set(inventory.map(i=>i.category))];
  const upd = (id,delta) => setInventory(p=>p.map(i=>i.id===id?{...i,qty:Math.max(0,i.qty+delta)}:i));

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div>
          <div style={{fontSize:22,fontWeight:900,color:D.text}}>Склад</div>
          <div style={{fontSize:13,color:D.muted,marginTop:2}}>
            {inventory.length} позиций {low.length>0&&<span style={{color:D.yellow}}>· ⚠️ {low.length} нужно закупить</span>}
          </div>
        </div>
        <Btn onClick={()=>exportCSV(["Наименование","Категория","Ед.","Количество","Минимум","Цена"],
          inventory.map(i=>[i.name,i.category,i.unit,i.qty,i.minQty,i.price]),"склад.csv")} variant="ghost">
          <Download size={13}/> Экспорт CSV
        </Btn>
      </div>
      {low.length>0&&(
        <div style={{background:D.yellow+"15",border:`1px solid ${D.yellow}40`,borderRadius:12,padding:"12px 16px",marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:800,color:D.yellow,marginBottom:6}}>⚠️ ТРЕБУЕТСЯ ЗАКУПКА</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {low.map(i=><span key={i.id} style={{background:D.yellow+"20",border:`1px solid ${D.yellow}40`,
              borderRadius:6,padding:"2px 8px",fontSize:11,color:D.yellow,fontWeight:700}}>
              {i.name}: {i.qty}/{i.minQty} {i.unit}</span>)}
          </div>
        </div>
      )}
      {cats.map(cat=>(
        <div key={cat} style={{marginBottom:18}}>
          <div style={{fontSize:10,fontWeight:800,color:D.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>📦 {cat}</div>
          <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"3fr 1fr 1fr 1fr 1fr auto",padding:"7px 14px",background:D.surface,gap:10}}>
              {["Наименование","Ед.","На складе","Минимум","Цена",""].map((h,i)=>(
                <div key={i} style={{fontSize:9,fontWeight:800,color:D.muted,textTransform:"uppercase"}}>{h}</div>
              ))}
            </div>
            {inventory.filter(i=>i.category===cat).map((item,idx)=>{
              const isLow=item.qty<item.minQty;
              return (
                <div key={item.id} style={{display:"grid",gridTemplateColumns:"3fr 1fr 1fr 1fr 1fr auto",
                  padding:"10px 14px",gap:10,alignItems:"center",
                  background:idx%2===0?D.card:D.surface,borderTop:`1px solid ${D.border}`}}>
                  <div style={{fontSize:13,fontWeight:600,color:D.text}}>{item.name}</div>
                  <div style={{fontSize:12,color:D.muted}}>{item.unit}</div>
                  <div style={{fontSize:14,fontWeight:800,color:isLow?D.red:D.green}}>{item.qty}{isLow?" ⚠️":""}</div>
                  <div style={{fontSize:13,color:D.muted}}>{item.minQty}</div>
                  <div style={{fontSize:13,color:D.text}}>{fmt(item.price)}</div>
                  <div style={{display:"flex",gap:4}}>
                    <button onClick={()=>upd(item.id,-1)} style={{background:D.red+"18",border:`1px solid ${D.red}35`,borderRadius:5,padding:"2px 8px",color:D.red,cursor:"pointer",fontSize:13,fontWeight:800}}>−</button>
                    <button onClick={()=>upd(item.id,10)} style={{background:D.green+"18",border:`1px solid ${D.green}35`,borderRadius:5,padding:"2px 7px",color:D.green,cursor:"pointer",fontSize:11,fontWeight:800}}>+10</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAYMENTS
// ═══════════════════════════════════════════════════════════════
function Payments({ payments, setPayments }) {
  const received = payments.filter(p=>p.status==="Получен").reduce((s,p)=>s+p.amount,0);
  const pending = payments.filter(p=>p.status==="Ожидается").reduce((s,p)=>s+p.amount,0);

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div>
          <div style={{fontSize:22,fontWeight:900,color:D.text}}>Касса</div>
          <div style={{fontSize:13,color:D.muted,marginTop:2}}>{payments.length} транзакций</div>
        </div>
        <Btn onClick={()=>exportCSV(["Заказ","Клиент","Тип","Сумма","Дата","Способ","Статус"],
          payments.map(p=>[p.order,p.client,p.type,p.amount,p.date,p.method,p.status]),"касса.csv")} variant="ghost">
          <Download size={13}/> Экспорт CSV
        </Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}}>
        <KpiCard icon={Check} label="Получено" value={fmt(received)} color={D.green}/>
        <KpiCard icon={Clock} label="Ожидается" value={fmt(pending)} color={D.yellow}/>
        <KpiCard icon={DollarSign} label="Всего платежей" value={payments.length} color={D.accentLight} sub="транзакций"/>
      </div>
      <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1.5fr 1fr 1fr 1fr 1fr auto",
          padding:"8px 14px",background:D.surface,gap:10}}>
          {["Заказ","Клиент","Тип","Сумма","Дата","Статус",""].map((h,i)=>(
            <div key={i} style={{fontSize:9,fontWeight:800,color:D.muted,textTransform:"uppercase"}}>{h}</div>
          ))}
        </div>
        {payments.map((p,i)=>(
          <div key={p.id} style={{display:"grid",gridTemplateColumns:"1fr 1.5fr 1fr 1fr 1fr 1fr auto",
            padding:"11px 14px",gap:10,alignItems:"center",
            background:i%2===0?D.card:D.surface,borderTop:`1px solid ${D.border}`}}>
            <div style={{fontSize:12,fontWeight:800,color:D.accentLight}}>{p.order}</div>
            <div style={{fontSize:13,fontWeight:600,color:D.text}}>{p.client}</div>
            <div style={{fontSize:11,color:D.muted}}>{p.type}</div>
            <div style={{fontSize:14,fontWeight:800,color:D.text}}>{fmt(p.amount)}</div>
            <div style={{fontSize:11,color:D.muted}}>{p.date}</div>
            <Badge status={p.status}/>
            {p.status==="Ожидается"
              ? <Btn onClick={()=>setPayments(prev=>prev.map(x=>x.id===p.id?{...x,status:"Получен"}:x))} variant="success" small><Check size={11}/> Получен</Btn>
              : <div style={{width:72}}/>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// KPI
// ═══════════════════════════════════════════════════════════════
function KPI({ kpi, setKpi }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({month:"Апр",leads:"",measures:"",orders:"",revenue:"",cogs:"",opex:"",adSpend:""});
  const last = kpi[kpi.length-1]||{revenue:0,cogs:0,opex:0,leads:0,measures:0,orders:0,adSpend:0};
  const ebitda = last.revenue-last.cogs-last.opex;

  const addMonth = () => {
    if (!form.month) return;
    setKpi(p=>[...p,{month:form.month,leads:+form.leads||0,measures:+form.measures||0,orders:+form.orders||0,
      revenue:+form.revenue||0,cogs:+form.cogs||0,opex:+form.opex||0,adSpend:+form.adSpend||0}]);
    setModal(false);
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div>
          <div style={{fontSize:22,fontWeight:900,color:D.text}}>KPI Dashboard</div>
          <div style={{fontSize:13,color:D.muted,marginTop:2}}>Ежемесячная аналитика</div>
        </div>
        <Btn onClick={()=>setModal(true)}><Plus size={13}/> Добавить месяц</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
        <KpiCard icon={Users} label="Лидов (посл. мес.)" value={last.leads} color={D.accentLight} target={20}/>
        <KpiCard icon={ShoppingCart} label="Заказов" value={last.orders} color={D.purple} target={6}/>
        <KpiCard icon={DollarSign} label="Выручка" value={fmt(last.revenue)} color={D.green}/>
        <KpiCard icon={TrendingUp} label="EBITDA" value={fmt(ebitda)} color={ebitda>=0?D.green:D.red}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16,marginBottom:16}}>
        <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,padding:20}}>
          <div style={{fontSize:12,fontWeight:800,color:D.muted,marginBottom:14}}>💹 ВЫРУЧКА / EBITDA</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={kpi.map(d=>({month:d.month,"Выручка":d.revenue,"EBITDA":d.revenue-d.cogs-d.opex}))} barGap={3}>
              <XAxis dataKey="month" stroke={D.muted} tick={{fontSize:11,fill:D.muted}}/>
              <YAxis stroke={D.muted} tick={{fontSize:10,fill:D.muted}} tickFormatter={v=>"₪"+v/1000+"k"}/>
              <Tooltip content={<TT/>}/>
              <ReferenceLine y={0} stroke={D.red} strokeDasharray="4 4"/>
              <Bar dataKey="Выручка" fill={D.accentLight+"80"} radius={[3,3,0,0]}/>
              <Bar dataKey="EBITDA" fill={D.green} radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,padding:20}}>
          <div style={{fontSize:12,fontWeight:800,color:D.muted,marginBottom:14}}>📈 ДИНАМИКА ЛИДОВ</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={kpi}>
              <XAxis dataKey="month" stroke={D.muted} tick={{fontSize:11,fill:D.muted}}/>
              <YAxis stroke={D.muted} tick={{fontSize:11,fill:D.muted}}/>
              <Tooltip content={<TT/>}/>
              <Line dataKey="leads" name="Лиды" stroke={D.accentLight} strokeWidth={2} dot={{r:3}}/>
              <Line dataKey="orders" name="Заказы" stroke={D.green} strokeWidth={2} dot={{r:3}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",padding:"8px 14px",background:D.surface,gap:10}}>
          {["Месяц","Лиды","Замеры","Заказы","Выручка","Себест.","OPEX","EBITDA"].map((h,i)=>(
            <div key={i} style={{fontSize:9,fontWeight:800,color:D.muted,textTransform:"uppercase"}}>{h}</div>
          ))}
        </div>
        {kpi.map((d,i)=>{
          const e=d.revenue-d.cogs-d.opex;
          return (
            <div key={i} style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",
              padding:"10px 14px",gap:10,background:i%2===0?D.card:D.surface,borderTop:`1px solid ${D.border}`}}>
              <div style={{fontSize:13,fontWeight:800,color:D.text}}>{d.month}</div>
              {[d.leads,d.measures,d.orders].map((v,ci)=><div key={ci} style={{fontSize:13,fontWeight:700,color:D.text}}>{v}</div>)}
              {[d.revenue,d.cogs,d.opex].map((v,ci)=><div key={ci} style={{fontSize:12,color:D.muted}}>{fmt(v)}</div>)}
              <div style={{fontSize:13,fontWeight:800,color:e>=0?D.green:D.red}}>{fmt(e)}</div>
            </div>
          );
        })}
      </div>
      {modal&&(
        <Modal title="📅 Добавить месяц" onClose={()=>setModal(false)}>
          <Sel label="Месяц" value={form.month} onChange={e=>setForm(p=>({...p,month:e.target.value}))}
            options={["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"]}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Input label="Лидов" value={form.leads} onChange={e=>setForm(p=>({...p,leads:e.target.value}))} type="number"/>
            <Input label="Замеров" value={form.measures} onChange={e=>setForm(p=>({...p,measures:e.target.value}))} type="number"/>
            <Input label="Заказов" value={form.orders} onChange={e=>setForm(p=>({...p,orders:e.target.value}))} type="number"/>
            <Input label="Выручка ₪" value={form.revenue} onChange={e=>setForm(p=>({...p,revenue:e.target.value}))} type="number"/>
            <Input label="Себестоимость ₪" value={form.cogs} onChange={e=>setForm(p=>({...p,cogs:e.target.value}))} type="number"/>
            <Input label="OPEX ₪" value={form.opex} onChange={e=>setForm(p=>({...p,opex:e.target.value}))} type="number"/>
            <Input label="Реклама ₪" value={form.adSpend} onChange={e=>setForm(p=>({...p,adSpend:e.target.value}))} type="number"/>
          </div>
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={addMonth}><Check size={13}/> Добавить</Btn>
            <Btn onClick={()=>setModal(false)} variant="ghost">Отмена</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CALCULATOR
// ═══════════════════════════════════════════════════════════════
const PROFILES=[{id:"alumil",name:"Alumil S67",price:180},{id:"gutmann",name:"Gutmann MT70",price:230},{id:"reynolds",name:"Reynolds 600",price:210}];
const GLASS=[{id:"std",name:"4-12-4 Стандарт",price:120},{id:"energy",name:"4-16-4 Энерго",price:165},{id:"triple",name:"4-12-4-12-4 Тройной",price:240}];
const HW=[{id:"basic",name:"Hoppe (базовая)",price:180},{id:"prem",name:"Siegenia (премиум)",price:320},{id:"roto",name:"Roto (люкс)",price:480}];
const TYPES=[{id:"fixed",name:"Глухое",labor:200},{id:"casement",name:"Открывающееся",labor:350},{id:"tilt",name:"Поворотно-откидное",labor:420}];

function Calc() {
  const [items,setItems]=useState([{id:1,name:"Окно 1",w:120,h:140,type:"tilt",profile:"alumil",glass:"energy",hw:"basic",qty:1,mosquito:false,sill:false}]);
  const [margin,setMargin]=useState(45);
  const [client,setClient]=useState({name:"",phone:""});
  const upd=(id,k,v)=>setItems(p=>p.map(x=>x.id===id?{...x,[k]:v}:x));

  const costs=items.map(it=>{
    const pr=PROFILES.find(p=>p.id===it.profile),gl=GLASS.find(g=>g.id===it.glass),hw=HW.find(h=>h.id===it.hw),tp=TYPES.find(t=>t.id===it.type);
    const perim=2*(it.w+it.h)/100,area=(it.w*it.h)/10000;
    const unit=perim*(pr?.price||0)+area*(gl?.price||0)+(hw?.price||0)+(tp?.labor||0)+(it.mosquito?120:0)+(it.sill?180:0);
    return {...it,unit,total:unit*it.qty};
  });
  const costTotal=costs.reduce((s,c)=>s+c.total,0);
  const saleTotal=Math.round(costTotal*(1+margin/100));
  const profit=saleTotal-costTotal;

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div>
          <div style={{fontSize:22,fontWeight:900,color:D.text}}>Калькулятор КП</div>
          <div style={{fontSize:13,color:D.muted,marginTop:2}}>Автоматический расчёт стоимости</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={()=>exportCSV(["Позиция","W","H","Тип","Профиль","Стекло","Кол","Себест.","Цена"],
            costs.map(c=>[c.name,c.w,c.h,c.type,c.profile,c.glass,c.qty,Math.round(c.unit),Math.round(c.unit*(1+margin/100))]),"расчёт.csv")} variant="ghost">
            <Download size={13}/> Экспорт CSV
          </Btn>
          <Btn onClick={()=>setItems(p=>[...p,{id:Date.now(),name:`Окно ${p.length+1}`,w:100,h:120,type:"tilt",profile:"alumil",glass:"std",hw:"basic",qty:1,mosquito:false,sill:false}])}><Plus size={13}/> Добавить окно</Btn>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:16}}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {costs.map((it,idx)=>(
            <div key={it.id} style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,overflow:"hidden"}}>
              <div style={{background:D.surface,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <div style={{background:D.accent+"30",borderRadius:6,padding:"1px 8px",fontSize:11,fontWeight:800,color:D.accentLight}}>#{idx+1}</div>
                  <input value={it.name} onChange={e=>upd(it.id,"name",e.target.value)}
                    style={{background:"transparent",border:"none",color:D.text,fontSize:14,fontWeight:700,outline:"none",width:130}}/>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontSize:16,fontWeight:900,color:D.green}}>{fmt(Math.round(it.unit*(1+margin/100))*it.qty)}</span>
                  <button onClick={()=>setItems(p=>p.filter(x=>x.id!==it.id))} style={{background:"none",border:"none",cursor:"pointer",color:D.muted}}><X size={13}/></button>
                </div>
              </div>
              <div style={{padding:14,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
                <div>
                  <div style={{fontSize:10,color:D.muted,fontWeight:700,textTransform:"uppercase",marginBottom:6}}>Размеры (см)</div>
                  <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:8}}>
                    <input type="number" value={it.w} onChange={e=>upd(it.id,"w",+e.target.value)}
                      style={{width:58,background:D.bg,border:`1px solid ${D.border}`,borderRadius:6,padding:"5px",color:D.text,fontSize:13,fontWeight:700,outline:"none",textAlign:"center"}}/>
                    <span style={{color:D.muted}}>×</span>
                    <input type="number" value={it.h} onChange={e=>upd(it.id,"h",+e.target.value)}
                      style={{width:58,background:D.bg,border:`1px solid ${D.border}`,borderRadius:6,padding:"5px",color:D.text,fontSize:13,fontWeight:700,outline:"none",textAlign:"center"}}/>
                  </div>
                  <div style={{fontSize:11,color:D.muted}}>Площадь: <b style={{color:D.text}}>{((it.w*it.h)/10000).toFixed(2)} м²</b></div>
                  <div style={{marginTop:8,display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:11,color:D.muted}}>Кол:</span>
                    <button onClick={()=>upd(it.id,"qty",Math.max(1,it.qty-1))} style={{background:D.border,border:"none",borderRadius:5,width:24,height:24,color:D.text,cursor:"pointer",fontWeight:800}}>−</button>
                    <span style={{fontSize:14,fontWeight:800,color:D.text,minWidth:20,textAlign:"center"}}>{it.qty}</span>
                    <button onClick={()=>upd(it.id,"qty",it.qty+1)} style={{background:D.border,border:"none",borderRadius:5,width:24,height:24,color:D.text,cursor:"pointer",fontWeight:800}}>+</button>
                  </div>
                </div>
                <div>
                  <div style={{fontSize:10,color:D.muted,fontWeight:700,textTransform:"uppercase",marginBottom:6}}>Конфигурация</div>
                  {[["Тип","type",TYPES],["Профиль","profile",PROFILES],["Стекло","glass",GLASS],["Фурнитура","hw",HW]].map(([l,k,opts])=>(
                    <div key={k} style={{marginBottom:5}}>
                      <div style={{fontSize:9,color:D.muted,marginBottom:2}}>{l}</div>
                      <select value={it[k]} onChange={e=>upd(it.id,k,e.target.value)}
                        style={{width:"100%",background:D.bg,border:`1px solid ${D.border}`,borderRadius:5,padding:"4px 6px",color:D.text,fontSize:11,outline:"none"}}>
                        {opts.map(o=><option key={o.id} value={o.id} style={{background:D.card}}>{o.name}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{fontSize:10,color:D.muted,fontWeight:700,textTransform:"uppercase",marginBottom:6}}>Расчёт (за 1 шт)</div>
                  {[["Профиль",Math.round(2*(it.w+it.h)/100*(PROFILES.find(p=>p.id===it.profile)?.price||0))],
                    ["Стекло",Math.round((it.w*it.h)/10000*(GLASS.find(g=>g.id===it.glass)?.price||0))],
                    ["Фурнитура",HW.find(h=>h.id===it.hw)?.price||0],
                    ["Монтаж",TYPES.find(t=>t.id===it.type)?.labor||0],
                  ].map(([l,v])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:11,color:D.muted}}>{l}</span>
                      <span style={{fontSize:11,color:D.text,fontWeight:600}}>{fmt(v)}</span>
                    </div>
                  ))}
                  <div style={{borderTop:`1px solid ${D.border}`,paddingTop:6,marginTop:4}}>
                    {[["Москитная сетка","mosquito",120],["Подоконник","sill",180]].map(([l,k,p])=>(
                      <label key={k} style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer",marginBottom:3}}>
                        <input type="checkbox" checked={it[k]} onChange={e=>upd(it.id,k,e.target.checked)} style={{accentColor:D.accent}}/>
                        <span style={{fontSize:11,color:D.muted,flex:1}}>{l}</span>
                        <span style={{fontSize:11,color:D.text}}>+{fmt(p)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:12,padding:16}}>
            <div style={{fontSize:10,fontWeight:800,color:D.muted,textTransform:"uppercase",marginBottom:10}}>👤 Клиент</div>
            <Input label="Имя" value={client.name} onChange={e=>setClient(p=>({...p,name:e.target.value}))} placeholder="Имя клиента"/>
            <Input label="Телефон" value={client.phone} onChange={e=>setClient(p=>({...p,phone:e.target.value}))} placeholder="052-000-0000"/>
          </div>
          <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:12,padding:16}}>
            <div style={{fontSize:10,fontWeight:800,color:D.muted,textTransform:"uppercase",marginBottom:10}}>💰 Наценка: {margin}%</div>
            <input type="range" min={20} max={100} value={margin} onChange={e=>setMargin(+e.target.value)} style={{width:"100%",accentColor:D.accent}}/>
            <div style={{borderTop:`1px solid ${D.border}`,paddingTop:12,marginTop:12,display:"flex",flexDirection:"column",gap:6}}>
              {[["Себестоимость",fmt(costTotal),D.muted],["Цена клиенту",fmt(saleTotal),D.green],["Прибыль",fmt(profit),profit>0?D.green:D.red]].map(([l,v,c])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontSize:12,color:D.muted}}>{l}</span>
                  <span style={{fontSize:13,fontWeight:700,color:c}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{background:"linear-gradient(135deg,#1D4ED8,#1E3A8A)",borderRadius:12,padding:16}}>
            <div style={{fontSize:11,fontWeight:800,color:"#93C5FD",marginBottom:8}}>ИТОГО КП</div>
            <div style={{fontSize:30,fontWeight:900,color:"#fff",letterSpacing:"-0.04em"}}>{fmt(saleTotal)}</div>
            <div style={{fontSize:11,color:"#93C5FD",marginTop:4}}>{items.reduce((s,i)=>s+i.qty,0)} окон · маржа {saleTotal>0?Math.round(profit/saleTotal*100):0}%</div>
            <div style={{display:"flex",gap:8,marginTop:12}}>
              {[["40%",0.4,"Предоплата"],["60%",0.6,"При монтаже"]].map(([pct,r,l])=>(
                <div key={l} style={{flex:1,background:"#ffffff18",borderRadius:8,padding:"8px",textAlign:"center"}}>
                  <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>{fmt(Math.round(saleTotal*r))}</div>
                  <div style={{fontSize:9,color:"#93C5FD"}}>{l} {pct}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
const PAGES = [
  {id:"dashboard",icon:LayoutDashboard,label:"Dashboard"},
  {id:"leads",icon:Users,label:"Лиды / CRM"},
  {id:"orders",icon:ShoppingCart,label:"Заказы"},
  {id:"inventory",icon:Package,label:"Склад"},
  {id:"payments",icon:Wallet,label:"Касса"},
  {id:"kpi",icon:BarChart2,label:"KPI"},
  {id:"calc",icon:Calculator,label:"Калькулятор"},
];

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [leads, setLeads] = useState(() => load(KEYS.leads, INIT_LEADS));
  const [orders, setOrders] = useState(() => load(KEYS.orders, INIT_ORDERS));
  const [inventory, setInventory] = useState(() => load(KEYS.inventory, INIT_INVENTORY));
  const [payments, setPayments] = useState(() => load(KEYS.payments, INIT_PAYMENTS));
  const [kpi, setKpi] = useState(() => load(KEYS.kpi, INIT_KPI));
  const [saved, setSaved] = useState(true);

  // Auto-save
  useEffect(() => { setSaved(false); save(KEYS.leads, leads); setTimeout(()=>setSaved(true),600); }, [leads]);
  useEffect(() => { save(KEYS.orders, orders); }, [orders]);
  useEffect(() => { save(KEYS.inventory, inventory); }, [inventory]);
  useEffect(() => { save(KEYS.payments, payments); }, [payments]);
  useEffect(() => { save(KEYS.kpi, kpi); }, [kpi]);

  const alerts = [
    leads.filter(l=>l.status==="Новый лид").length > 0 && leads.filter(l=>l.status==="Новый лид").length,
    inventory.filter(i=>i.qty<i.minQty).length > 0 && inventory.filter(i=>i.qty<i.minQty).length,
    payments.filter(p=>p.status==="Ожидается").length > 0 && payments.filter(p=>p.status==="Ожидается").length,
  ];

  return (
    <div style={{display:"flex",height:"100vh",background:D.bg,fontFamily:"'Segoe UI',Arial,sans-serif",overflow:"hidden"}}>
      {/* SIDEBAR */}
      <div style={{width:210,background:D.surface,borderRight:`1px solid ${D.border}`,display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"16px 14px 12px",borderBottom:`1px solid ${D.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:34,height:34,background:"linear-gradient(135deg,#2563EB,#1D4ED8)",borderRadius:10,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🏭</div>
            <div>
              <div style={{fontSize:13,fontWeight:900,color:D.text,letterSpacing:"-0.02em"}}>WindowOS</div>
              <div style={{display:"flex",alignItems:"center",gap:4,marginTop:1}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:saved?D.green:D.yellow}}/>
                <span style={{fontSize:9,color:D.muted,fontWeight:600}}>{saved?"Сохранено":"Сохраняю..."}</span>
              </div>
            </div>
          </div>
        </div>
        <nav style={{flex:1,padding:"8px 6px"}}>
          {PAGES.map(({id,icon:Icon,label},pi)=>{
            const active=page===id;
            const badge=alerts[pi-1];
            return (
              <button key={id} onClick={()=>setPage(id)} style={{display:"flex",alignItems:"center",gap:9,
                width:"100%",padding:"8px 10px",borderRadius:9,marginBottom:2,cursor:"pointer",border:"none",
                background:active?"linear-gradient(135deg,#2563EB18,#1D4ED808)":"transparent",
                borderLeft:active?`3px solid ${D.accent}`:"3px solid transparent",
                color:active?D.accentLight:D.muted}}>
                <Icon size={14}/>
                <span style={{fontSize:12,fontWeight:active?700:500,flex:1}}>{label}</span>
                {badge>0&&<span style={{background:D.yellow+"30",color:D.yellow,fontSize:9,fontWeight:800,borderRadius:10,padding:"1px 5px"}}>{badge}</span>}
              </button>
            );
          })}
        </nav>
        <div style={{padding:"8px",borderTop:`1px solid ${D.border}`}}>
          {[
            leads.filter(l=>l.status==="Новый лид").length>0&&`👤 ${leads.filter(l=>l.status==="Новый лид").length} новых лидов`,
            inventory.filter(i=>i.qty<i.minQty).length>0&&`📦 ${inventory.filter(i=>i.qty<i.minQty).length} позиций мало`,
            payments.filter(p=>p.status==="Ожидается").length>0&&`💰 ${payments.filter(p=>p.status==="Ожидается").length} платежей ожидается`,
          ].filter(Boolean).map((a,i)=>(
            <div key={i} style={{background:D.yellow+"12",border:`1px solid ${D.yellow}25`,borderRadius:7,
              padding:"4px 8px",marginBottom:3,fontSize:9,fontWeight:700,color:D.yellow}}>{a}</div>
          ))}
        </div>
        <div style={{padding:"8px 14px 10px",fontSize:9,color:D.muted+"55",borderTop:`1px solid ${D.border}`}}>
          Window Business OS v2.0 🇮🇱
        </div>
      </div>
      {/* MAIN */}
      <div style={{flex:1,overflowY:"auto",padding:"22px 24px"}}>
        {page==="dashboard"&&<Dashboard leads={leads} orders={orders} payments={payments} inventory={inventory} kpi={kpi}/>}
        {page==="leads"&&<Leads leads={leads} setLeads={setLeads}/>}
        {page==="orders"&&<Orders orders={orders} setOrders={setOrders} setPayments={setPayments}/>}
        {page==="inventory"&&<Inventory inventory={inventory} setInventory={setInventory}/>}
        {page==="payments"&&<Payments payments={payments} setPayments={setPayments}/>}
        {page==="kpi"&&<KPI kpi={kpi} setKpi={setKpi}/>}
        {page==="calc"&&<Calc/>}
      </div>
    </div>
  );
}
