import { useState, useEffect } from "react";
import {
  LayoutDashboard, Users, ShoppingCart, Package, Wallet,
  Calculator, Plus, Search, X, Check, Clock, AlertTriangle,
  TrendingUp, Trash2, Download, BarChart2, DollarSign, Eye,
  Ruler, Image, Paperclip, Zap, List, ArrowRight, Wrench, ClipboardCheck
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, ReferenceLine
} from "recharts";

// ── STORAGE ──────────────────────────────────────────────────
const KEYS = { leads:"wb:leads", orders:"wb:orders", inventory:"wb:inventory",
  payments:"wb:payments", kpi:"wb:kpi", measurements:"wb:measurements", installations:"wb:installations" };
const load=(key,fb)=>{try{const v=localStorage.getItem(key);return v?JSON.parse(v):fb;}catch{return fb;}};
const save=(key,data)=>{try{localStorage.setItem(key,JSON.stringify(data));}catch{}};

// ── DEKEL BANDS [code, op, profile, min_m2, max_m2, price/m2] ─
const DB=[
  ["12.011.0200","sliding_2_track","klil_7000",0.6,1.0,1864.5],
  ["12.011.0210","sliding_2_track","klil_7000",1.0,2.0,1661.1],
  ["12.011.0220","sliding_2_track","klil_7000",2.0,3.0,1491.6],
  ["12.011.0230","sliding_2_track","klil_7000",3.0,4.0,1367.3],
  ["12.051.0410","sliding_2_track","klil_7000",4.0,6.0,1615.9],
  ["12.011.0260","sliding_2_track","klil_9000",0.6,1.0,2271.3],
  ["12.011.0265","sliding_2_track","klil_9000",1.0,2.0,1954.9],
  ["12.011.0270","sliding_2_track","klil_9000",2.0,3.0,1762.8],
  ["12.011.0275","sliding_2_track","klil_9000",3.0,4.0,1548.1],
  ["12.011.0280","sliding_2_track","klil_9000",4.0,5.0,1412.5],
  ["12.011.0285","sliding_2_track","klil_9000",5.0,7.0,1276.9],
  ["12.011.0300","sliding_2_track","klil_1700",0.6,1.0,1717.6],
  ["12.011.0310","sliding_2_track","klil_1700",1.0,2.0,1423.8],
  ["12.011.0320","sliding_2_track","klil_1700",2.0,2.5,1322.1],
  ["12.011.0340","sliding_2_track","klil_7300",0.6,1.0,2678.1],
  ["12.011.0345","sliding_2_track","klil_7300",1.0,2.0,2373.0],
  ["12.011.0350","sliding_2_track","klil_7300",2.0,3.0,2147.0],
  ["12.011.0355","sliding_2_track","klil_7300",3.0,4.0,1943.6],
  ["12.012.0010","sliding_multi_sash","klil_7000",1.0,2.0,2293.9],
  ["12.012.0020","sliding_multi_sash","klil_7000",2.0,3.0,2045.3],
  ["12.012.0030","sliding_multi_sash","klil_7000",3.0,4.5,1875.8],
  ["12.012.0100","sliding_multi_sash","klil_9000",1.0,2.0,1536.8],
  ["12.012.0110","sliding_multi_sash","klil_9000",2.0,3.0,1469.0],
  ["12.012.0120","sliding_multi_sash","klil_9000",3.0,5.0,1356.0],
  ["12.012.0300","sliding_multi_sash","klil_7300",1.0,2.0,1943.6],
  ["12.012.0310","sliding_multi_sash","klil_7300",2.0,3.0,1785.4],
  ["12.012.0320","sliding_multi_sash","klil_7300",3.0,5.0,1638.5],
  ["12.013.0450","pocket_sliding","klil_7000",0.6,1.0,3729.0],
  ["12.013.0455","pocket_sliding","klil_7000",1.0,1.6,3616.0],
  ["12.013.0460","pocket_sliding","klil_7000",1.6,2.6,3503.0],
  ["12.013.0465","pocket_sliding","klil_7300",0.6,1.0,3842.0],
  ["12.013.0470","pocket_sliding","klil_7300",1.0,1.6,3672.5],
  ["12.013.0475","pocket_sliding","klil_7300",1.6,2.6,3559.5],
  ["12.014.0400","casement_or_tilt_turn","klil_4500",0.6,1.0,2113.1],
  ["12.014.0410","casement_or_tilt_turn","klil_4500",1.0,2.0,2079.2],
  ["12.014.0650","casement_or_tilt_turn","klil_4500",0.6,1.0,2689.4],
  ["12.014.0660","casement_or_tilt_turn","klil_4500",1.0,2.0,2474.7],
  ["12.014.0450","casement_or_tilt_turn","klil_5500",0.6,1.0,2565.1],
  ["12.014.0460","casement_or_tilt_turn","klil_5500",1.0,2.0,2226.1],
  ["12.014.0500","casement_or_tilt_turn","klil_4300",0.6,1.0,2406.9],
  ["12.016.0330","tilt_or_fixed","klil_4500",0.0,0.5,1661.1],
  ["12.016.0340","tilt_or_fixed","klil_4500",0.5,1.0,1808.0],
  ["12.016.0350","tilt_or_fixed","klil_4500",1.0,1.5,1909.7],
  ["12.016.0610","tilt_or_fixed","klil_4500",1.0,2.0,1932.3],
  ["12.016.0620","tilt_or_fixed","klil_4500",2.0,3.0,2418.2],
  ["12.016.0400","tilt_or_fixed","klil_5500",0.0,0.6,1977.5],
  ["12.016.0410","tilt_or_fixed","klil_5500",0.6,1.0,2203.5],
  ["12.016.0420","tilt_or_fixed","klil_5500",1.0,1.8,2689.4],
  ["12.016.0360","tilt_or_fixed","klil_4300",0.0,0.6,1898.4],
  ["12.016.0370","tilt_or_fixed","klil_4350",0.6,1.0,1988.8],
  ["12.016.0380","tilt_or_fixed","klil_4350",1.0,1.5,2282.6],
];

// Dekel glass addons (per m²)
const DG=[
  {id:"none",name:"Стандарт (в базе)",price:0,code:"-"},
  {id:"triplex_38",name:"Триплекс 3+3 PVB 0.38",price:72.3,code:"12.111.0011"},
  {id:"triplex_76",name:"Триплекс 4+4 PVB 0.76",price:197.8,code:"12.111.0051"},
  {id:"insul_4",name:"Стеклопакет 4+6+4",price:89.3,code:"12.111.0161"},
  {id:"insul_5",name:"Стеклопакет 5+6+5",price:170.6,code:"12.111.0163"},
  {id:"tempered",name:"Закалённое 6мм",price:93.8,code:"12.111.0211"},
  {id:"tinted",name:"Тонированное 6мм",price:42.9,code:"12.111.0231"},
];

// Screen (per unit)
const DS=[
  {id:"none",name:"Без сетки",price:0,code:"-"},
  {id:"std",name:"Сетка стандарт",price:565,code:"12.110.0100"},
  {id:"eco",name:"Сетка эконом",price:452,code:"12.110.0110"},
  {id:"roll",name:"Сетка рулонная",price:362,code:"12.110.0120"},
];

// Shutters — dekelPrice per m², marketFactor brings to real market level, motor per unit
// Dekel 2022×1.13 is ~35-40% below market for rollers → marketFactor=1.38 default
const DSHT=[
  {id:"none",   name:"Без роллет",              dekelM2:0,    motor:0,    marketFactor:1.0,  code:"-"},
  {id:"roll_pvc_manual",  name:"Роллет PVC ручной",          dekelM2:735,  motor:0,    marketFactor:1.38, code:"12.101.1600"},
  {id:"roll_alum_manual", name:"Роллет алюм. ручной",        dekelM2:915,  motor:0,    marketFactor:1.38, code:"12.101.1611"},
  {id:"roll_alum_motor",  name:"Роллет алюм. + мотор",       dekelM2:915,  motor:622,  marketFactor:1.38, code:"12.101.1611+12.101.2000"},
  {id:"roll_alum_motor_rf",name:"Роллет алюм. мотор + пульт",dekelM2:915,  motor:1085, marketFactor:1.38, code:"12.101.1611+12.101.2060"},
  {id:"slide_pvc_1",      name:"Тришс PVC 1-крыло",          dekelM2:802,  motor:0,    marketFactor:1.35, code:"12.101.1200"},
  {id:"slide_pvc_2",      name:"Тришс PVC 2-крыла",          dekelM2:1017, motor:0,    marketFactor:1.35, code:"12.101.1250"},
];
// Helper: get actual shutter price per m² after market correction
const shutterM2=(opt,mf)=>opt.dekelM2*(mf??opt.marketFactor);

// Op types UI
const OPS=[
  {id:"sliding_2_track",name:"Хаза 2-трек",profiles:["klil_7000","klil_9000","klil_1700","klil_7300"]},
  {id:"sliding_multi_sash",name:"Хаза 3-4 трека",profiles:["klil_7000","klil_9000","klil_7300"]},
  {id:"pocket_sliding",name:"Карман (כיס)",profiles:["klil_7000","klil_7300"]},
  {id:"casement_or_tilt_turn",name:"Поворотно-откидное",profiles:["klil_4500","klil_5500","klil_4300"]},
  {id:"tilt_or_fixed",name:"Kipp / Глухое",profiles:["klil_4500","klil_5500","klil_4300","klil_4350"]},
];
const PNAMES={klil_7000:"Клиль 7000",klil_9000:"Клиль 9000 (термо)",klil_1700:"Клиль 1700 (эконом)",
  klil_7300:"Клиль 7300 (Slim)",klil_4500:"Клиль 4500",klil_5500:"Клиль 5500 (премиум)",
  klil_4300:"Клиль 4300",klil_4350:"Клиль 4350"};

// Map measurement opening type → dekel op
const OT2OP={
  "Хаза 2-трек":"sliding_2_track","Хаза 3-трек":"sliding_multi_sash",
  "Поворотно-откидное":"casement_or_tilt_turn","Откидное":"tilt_or_fixed",
  "Глухое":"tilt_or_fixed","Карман (кис)":"pocket_sliding",
  "Бельгийское":"sliding_multi_sash","Дверь хаза":"sliding_2_track",
  "Дверь поворот":"casement_or_tilt_turn"
};
const OP2PROF={sliding_2_track:"klil_7000",sliding_multi_sash:"klil_7000",
  pocket_sliding:"klil_7000",casement_or_tilt_turn:"klil_4500",tilt_or_fixed:"klil_4500"};

// Dekel lookup
const dekelLookup=(op,profile,areaSqm)=>{
  const a=Math.max(areaSqm,0.6);
  const match=DB.find(b=>b[1]===op&&b[2]===profile&&a>=b[3]&&a<b[4]);
  if(match)return{price:match[5],code:match[0]};
  const all=DB.filter(b=>b[1]===op&&b[2]===profile).sort((a,b)=>a[3]-b[3]);
  if(!all.length)return null;
  return{price:all[all.length-1][5],code:all[all.length-1][0]};
};

// ── INIT DATA ────────────────────────────────────────────────
const IL=[
  {id:1,name:"Давид Коэн",phone:"052-111-2233",city:"Тель-Авив",type:"Частный",windows:4,status:"Замер назначен",date:"2025-03-12",source:"Google Ads",value:12000,notes:""},
  {id:2,name:"Строй-Проект ЛТД",phone:"054-222-3344",city:"Ришон",type:"Подрядчик",windows:24,status:"КП отправлено",date:"2025-03-10",source:"Рекомендация",value:85000,notes:""},
  {id:3,name:"Ирина Леви",phone:"050-333-4455",city:"Хайфа",type:"Частный",windows:6,status:"Новый лид",date:"2025-03-14",source:"Google Maps",value:18000,notes:""},
];
const IO=[
  {id:"WB-001",client:"АрхиМастер",windows:40,total:140000,paid:56000,status:"В производстве",created:"2025-03-06",delivery:"2025-03-25",city:"Иерусалим",progress:60},
  {id:"WB-002",client:"Давид Коэн",windows:4,total:12000,paid:4800,status:"Ожидает материалов",created:"2025-03-12",delivery:"2025-03-28",city:"Тель-Авив",progress:10},
  {id:"WB-003",client:"Ноам Шапиро",windows:8,total:28000,paid:28000,status:"Завершён",created:"2025-02-20",delivery:"2025-03-05",city:"Петах-Тиква",progress:100},
];
const II=[
  {id:1,name:"Профиль Alumil S67",unit:"м.п.",qty:340,minQty:100,price:28,category:"Профиль"},
  {id:2,name:"Профиль Gutmann MT70",unit:"м.п.",qty:80,minQty:100,price:35,category:"Профиль"},
  {id:3,name:"Стеклопакет 4-12-4",unit:"кв.м.",qty:45,minQty:20,price:120,category:"Стекло"},
  {id:4,name:"Стеклопакет 4-16-4 энерго",unit:"кв.м.",qty:12,minQty:20,price:165,category:"Стекло"},
  {id:5,name:"Ручка Hoppe",unit:"шт.",qty:87,minQty:30,price:45,category:"Фурнитура"},
  {id:6,name:"Петля Siegenia",unit:"пар",qty:54,minQty:30,price:85,category:"Фурнитура"},
  {id:7,name:"Уплотнитель EPDM",unit:"рул.",qty:8,minQty:5,price:220,category:"Материалы"},
  {id:8,name:"Пена монтажная Soudal",unit:"шт.",qty:6,minQty:10,price:38,category:"Материалы"},
];
const IP=[
  {id:1,order:"WB-001",client:"АрхиМастер",type:"Предоплата",amount:56000,date:"2025-03-07",method:"Банк",status:"Получен"},
  {id:2,order:"WB-002",client:"Давид Коэн",type:"Предоплата",amount:4800,date:"2025-03-13",method:"Наличные",status:"Получен"},
  {id:3,order:"WB-003",client:"Ноам Шапиро",type:"Финальный",amount:28000,date:"2025-03-05",method:"Банк",status:"Получен"},
  {id:4,order:"WB-001",client:"АрхиМастер",type:"Финальный",amount:84000,date:"2025-03-25",method:"Банк",status:"Ожидается"},
];
const IK=[
  {month:"Янв",leads:8,measures:4,orders:2,revenue:28000,cogs:17000,opex:19000,adSpend:4000},
  {month:"Фев",leads:12,measures:6,orders:3,revenue:46000,cogs:28000,opex:19200,adSpend:4000},
  {month:"Мар",leads:18,measures:9,orders:5,revenue:180000,cogs:108000,opex:19400,adSpend:4500},
];
const IM=[
  {id:1,client:"Давид Коэн",phone:"052-111-2233",address:"ул. Дизенгоф 45, Тель-Авив",
   date:"2025-03-15",specialist:"Алекс",status:"Выполнен",
   openings:[
     {id:101,room:"Гостиная",width:180,height:140,type:"Хаза 2-трек",qty:1,notes:""},
     {id:102,room:"Кухня",width:90,height:90,type:"Поворотно-откидное",qty:1,notes:""},
   ],
   wallType:"Железобетон",floor:"3",crane:false,demolition:true,installNotes:"Демонтаж включён.",files:[]}
];

const CHECKLIST_STEPS=[
  "הגעה לאתר ובדיקת מידות סופיות",
  "פירוק חלונות ישנים (אם נדרש)",
  "ניקוי פתחים והכנת משטחים",
  "התקנת מסגרות ופרופילים",
  "הרכבת זגוגיות / יחידות זיגוג",
  "התקנת ידיות ואביזרים",
  "בדיקת פתיחה ונעילה לכל חלון",
  "אטימה ומילוי פגמים",
  "התקנת תריסים / רשתות (אם יש)",
  "ניקיון סופי ובדיקת איכות",
  "הסבר לבעל הדירה",
];
const II_INST=[];

// ── TOKENS ───────────────────────────────────────────────────
const D={bg:"#090E1A",surface:"#0F1729",card:"#131D30",border:"#1E2D45",
  text:"#E8EDF5",muted:"#4A607A",accent:"#2563EB",accentLight:"#3B82F6",
  green:"#10B981",yellow:"#F59E0B",red:"#EF4444",purple:"#8B5CF6",teal:"#14B8A6"};
const SC={"Новый лид":"#3B82F6","Замер назначен":"#8B5CF6","КП отправлено":"#F59E0B",
  "Follow-up":"#EC4899","Закрыт (выиграли)":"#10B981","Закрыт (проиграли)":"#EF4444",
  "Ожидает материалов":"#F59E0B","В производстве":"#3B82F6","Монтаж":"#8B5CF6","Завершён":"#10B981",
  "Получен":"#10B981","Ожидается":"#F59E0B","Запланирован":"#8B5CF6","Выполнен":"#3B82F6","Утверждён":"#10B981"};
const LST=["Новый лид","Замер назначен","КП отправлено","Follow-up","Закрыт (выиграли)","Закрыт (проиграли)"];
const OST=["Ожидает материалов","В производстве","Монтаж","Завершён"];
const MST=["Запланирован","Выполнен","Утверждён"];
const MOP_T=["Хаза 2-трек","Хаза 3-трек","Поворотно-откидное","Откидное","Глухое","Карман (кис)","Бельгийское","Дверь хаза","Дверь поворот"];
const WT=["Железобетон","Кирпич","Газобетон","Блоки","Дерево","Другое"];
const PM={"Ожидает материалов":10,"В производстве":50,"Монтаж":85,"Завершён":100};
const fmt=n=>"₪"+Math.round(n).toLocaleString("ru-RU");
const fmtSize=b=>b<1024?b+"B":b<1048576?(b/1024).toFixed(1)+"KB":(b/1048576).toFixed(1)+"MB";
const fileIcon=t=>{if(!t)return"📎";if(t.startsWith("image/"))return"🖼️";if(t==="application/pdf")return"📄";if(t.includes("dwg")||t.includes("dxf"))return"📐";return"📎";};
const dlFile=f=>{const a=document.createElement("a");a.href=f.data;a.download=f.name;a.click();};
const exportCSV=(headers,rows,fn)=>{const csv=[headers,...rows].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");const a=document.createElement("a");a.href="data:text/csv;charset=utf-8,\uFEFF"+encodeURIComponent(csv);a.download=fn;a.click();};

// ── UI ATOMS ─────────────────────────────────────────────────
const Badge=({status})=>(<span style={{background:(SC[status]||D.muted)+"22",color:SC[status]||D.muted,
  border:`1px solid ${(SC[status]||D.muted)}44`,padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{status}</span>);

const Btn=({children,onClick,variant="primary",small,disabled,style:s})=>{
  const v={primary:{background:"linear-gradient(135deg,#2563EB,#1D4ED8)",color:"#fff",border:"none"},
    success:{background:D.green+"20",color:D.green,border:`1px solid ${D.green}40`},
    danger:{background:D.red+"18",color:D.red,border:`1px solid ${D.red}35`},
    ghost:{background:D.card,color:D.muted,border:`1px solid ${D.border}`},
    teal:{background:D.teal+"20",color:D.teal,border:`1px solid ${D.teal}40`},
    yellow:{background:D.yellow+"20",color:D.yellow,border:`1px solid ${D.yellow}40`},
  };
  return(<button onClick={onClick} disabled={disabled} style={{...v[variant],borderRadius:8,
    padding:small?"5px 11px":"8px 16px",fontSize:small?11:13,fontWeight:700,
    cursor:disabled?"not-allowed":"pointer",display:"inline-flex",alignItems:"center",
    gap:5,opacity:disabled?0.5:1,...s}}>{children}</button>);
};
const Inp=({label,...p})=>(<div style={{marginBottom:12}}>
  {label&&<div style={{fontSize:10,fontWeight:700,color:D.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.05em"}}>{label}</div>}
  <input {...p} style={{width:"100%",background:D.bg,border:`1px solid ${D.border}`,borderRadius:8,
    padding:"8px 12px",color:D.text,fontSize:13,outline:"none",boxSizing:"border-box",...p.style}}/>
</div>);
const Sel=({label,options,...p})=>(<div style={{marginBottom:12}}>
  {label&&<div style={{fontSize:10,fontWeight:700,color:D.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.05em"}}>{label}</div>}
  <select {...p} style={{width:"100%",background:D.bg,border:`1px solid ${D.border}`,borderRadius:8,
    padding:"8px 12px",color:D.text,fontSize:13,outline:"none",boxSizing:"border-box"}}>
    {options.map(o=>typeof o==="string"?<option key={o} value={o} style={{background:D.card}}>{o}</option>
      :<option key={o.value} value={o.value} style={{background:D.card}}>{o.label}</option>)}
  </select>
</div>);
const Txa=({label,...p})=>(<div style={{marginBottom:12}}>
  {label&&<div style={{fontSize:10,fontWeight:700,color:D.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.05em"}}>{label}</div>}
  <textarea {...p} rows={3} style={{width:"100%",background:D.bg,border:`1px solid ${D.border}`,borderRadius:8,
    padding:"8px 12px",color:D.text,fontSize:13,outline:"none",boxSizing:"border-box",resize:"vertical",fontFamily:"inherit",...p.style}}/>
</div>);
const PBar=({value,color=D.accent})=>(<div style={{background:D.border,borderRadius:4,height:5}}>
  <div style={{width:`${Math.min(value,100)}%`,height:"100%",background:color,borderRadius:4,transition:"width 0.5s"}}/>
</div>);
const Modal=({title,onClose,children,wide})=>(
  <div style={{position:"fixed",inset:0,background:"#000000BB",zIndex:1000,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:20,overflowY:"auto"}}>
    <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:16,padding:28,width:wide?780:480,maxWidth:"95vw",marginTop:20,marginBottom:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{fontSize:16,fontWeight:800,color:D.text}}>{title}</div>
        <button onClick={onClose} style={{background:D.border,border:"none",borderRadius:8,padding:"4px 8px",cursor:"pointer",color:D.muted,fontSize:16}}>✕</button>
      </div>
      {children}
    </div>
  </div>
);
const TT=({active,payload,label})=>{
  if(!active||!payload?.length)return null;
  return(<div style={{background:D.bg,border:`1px solid ${D.border}`,borderRadius:8,padding:"10px 14px",fontSize:12}}>
    <div style={{fontWeight:800,color:D.text,marginBottom:6}}>{label}</div>
    {payload.map((p,i)=><div key={i} style={{color:p.color}}>{p.name}: <b>{typeof p.value==="number"&&p.value>999?fmt(p.value):p.value}</b></div>)}
  </div>);
};
const KCard=({icon:Icon,label,value,sub,color,trend,target})=>{
  const ratio=target?Math.min((typeof value==="string"?parseFloat(value.replace(/[^0-9.]/g,"")):value)/target,1.5):null;
  return(<div style={{background:`linear-gradient(135deg,${D.card},${D.surface})`,border:`1px solid ${D.border}`,
    borderRadius:14,padding:"18px 20px",display:"flex",flexDirection:"column",gap:8}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
      <div style={{background:color+"20",borderRadius:10,padding:8,display:"inline-flex"}}><Icon size={17} color={color}/></div>
      {trend!=null&&<span style={{fontSize:11,color:trend>=0?D.green:D.red,fontWeight:700}}>{trend>=0?"↑":"↓"}{Math.abs(trend)}%</span>}
    </div>
    <div style={{fontSize:26,fontWeight:900,color:D.text,letterSpacing:"-0.04em"}}>{value}</div>
    <div style={{fontSize:11,color:D.muted,fontWeight:600}}>{label}</div>
    {sub&&<div style={{fontSize:11,color:D.muted+"99"}}>{sub}</div>}
    {ratio!=null&&<div style={{background:D.border,borderRadius:4,height:3}}>
      <div style={{width:`${ratio*100}%`,height:"100%",borderRadius:4,background:ratio>=1?D.green:ratio>0.7?D.yellow:D.red}}/>
    </div>}
  </div>);
};
const SH=({title,color=D.teal})=>(<div style={{fontSize:11,fontWeight:800,color,textTransform:"uppercase",
  marginBottom:10,paddingBottom:6,borderBottom:`1px solid ${D.border}`,marginTop:8}}>{title}</div>);

// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════
function Dashboard({leads,orders,payments,inventory,kpi,measurements,installations}){
  // ── Real financials ──
  const totalPaid=payments.filter(p=>p.status==="Получен").reduce((s,p)=>s+p.amount,0);
  const totalPending=payments.filter(p=>p.status==="Ожидается").reduce((s,p)=>s+p.amount,0);
  const totalContracted=orders.reduce((s,o)=>s+o.total,0);
  const activeOrders=orders.filter(o=>o.status!=="Завершён");
  const completedOrders=orders.filter(o=>o.status==="Завершён");
  const avgDeal=orders.length>0?Math.round(totalContracted/orders.length):0;

  // ── Funnel ──
  const fLeads=leads.length;
  const fMeasured=measurements.length;
  const fOrders=orders.length;
  const fCompleted=completedOrders.length;
  const convLM=fLeads>0?Math.round(fMeasured/fLeads*100):0;
  const convMO=fMeasured>0?Math.round(fOrders/fMeasured*100):0;
  const convLO=fLeads>0?Math.round(fOrders/fLeads*100):0;

  // ── Pipeline value (leads with value) ──
  const pipeline=leads.filter(l=>!["Закрыт (выиграли)","Закрыт (проиграли)"].includes(l.status))
    .reduce((s,l)=>s+(l.value||0),0);

  // ── Status breakdown ──
  const pie=[
    {name:"Новый",value:leads.filter(l=>l.status==="Новый лид").length,c:D.accentLight},
    {name:"Замер",value:leads.filter(l=>l.status==="Замер назначен").length,c:D.purple},
    {name:"КП",value:leads.filter(l=>l.status==="КП отправлено").length,c:D.yellow},
    {name:"Follow-up",value:leads.filter(l=>l.status==="Follow-up").length,c:"#EC4899"},
    {name:"Выиграли",value:leads.filter(l=>l.status==="Закрыт (выиграли)").length,c:D.green},
  ].filter(d=>d.value>0);

  // ── Monthly revenue from real orders (by created date) ──
  const monthMap={};
  orders.forEach(o=>{
    const m=o.created?.slice(0,7)||"";
    if(!m)return;
    if(!monthMap[m])monthMap[m]={month:m.slice(5),revenue:0,paid:0,count:0};
    monthMap[m].revenue+=o.total;
    monthMap[m].paid+=o.paid;
    monthMap[m].count++;
  });
  const revenueChart=Object.values(monthMap).sort((a,b)=>a.month.localeCompare(b.month)).slice(-6);

  const lowStock=inventory.filter(i=>i.qty<i.minQty).length;
  const pending=payments.filter(p=>p.status==="Ожидается");
  const pendInst=installations.filter(i=>i.status==="Запланирован"||i.status==="В процессе").length;

  return(<div>
    <div style={{marginBottom:22}}>
      <div style={{fontSize:22,fontWeight:900,color:D.text}}>Dashboard</div>
      <div style={{fontSize:13,color:D.muted,marginTop:2}}>Реальные данные из системы</div>
    </div>

    {/* Top KPIs */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
      <KCard icon={DollarSign} label="Получено ₪" value={fmt(totalPaid)} color={D.green} sub={`Ожидается ещё ${fmt(totalPending)}`}/>
      <KCard icon={ShoppingCart} label="В работе" value={activeOrders.length} color={D.accentLight} sub={`Сумма ${fmt(activeOrders.reduce((s,o)=>s+o.total,0))}`}/>
      <KCard icon={TrendingUp} label="Pipeline" value={fmt(pipeline)} color={D.purple} sub={`${leads.filter(l=>!["Закрыт (выиграли)","Закрыт (проиграли)"].includes(l.status)).length} лидов в работе`}/>
      <KCard icon={Users} label="Ср. чек" value={fmt(avgDeal)} color={D.yellow} sub={`${orders.length} заказов всего`}/>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16,marginBottom:16}}>
      {/* Revenue chart */}
      <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,padding:20}}>
        <div style={{fontSize:12,fontWeight:800,color:D.muted,marginBottom:14}}>📈 ВЫРУЧКА ПО МЕСЯЦАМ (реальные заказы)</div>
        {revenueChart.length>0?(
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={revenueChart} barGap={3}>
              <XAxis dataKey="month" stroke={D.muted} tick={{fontSize:11,fill:D.muted}}/>
              <YAxis stroke={D.muted} tick={{fontSize:10,fill:D.muted}} tickFormatter={v=>"₪"+v/1000+"k"}/>
              <Tooltip content={<TT/>}/>
              <Bar dataKey="revenue" name="КП сумма" fill={D.accentLight+"90"} radius={[4,4,0,0]}/>
              <Bar dataKey="paid" name="Получено" fill={D.green} radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        ):(
          <div style={{height:180,display:"flex",alignItems:"center",justifyContent:"center",color:D.muted,fontSize:13}}>
            Заказы появятся здесь после добавления
          </div>
        )}
      </div>

      {/* Funnel */}
      <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,padding:20}}>
        <div style={{fontSize:12,fontWeight:800,color:D.muted,marginBottom:16}}>🎯 ВОРОНКА КОНВЕРСИИ</div>
        {[
          {label:"Лидов всего",value:fLeads,color:D.accentLight,max:fLeads},
          {label:"Замеров",value:fMeasured,color:D.purple,max:fLeads},
          {label:"Заказов",value:fOrders,color:D.yellow,max:fLeads},
          {label:"Завершено",value:fCompleted,color:D.green,max:fLeads},
        ].map(({label,value,color,max})=>(
          <div key={label} style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:11,color:D.muted}}>{label}</span>
              <span style={{fontSize:12,fontWeight:800,color}}>{value}</span>
            </div>
            <div style={{background:D.surface,borderRadius:4,height:6}}>
              <div style={{width:max>0?`${value/max*100}%`:"0%",height:"100%",borderRadius:4,background:color,transition:"width 0.4s"}}/>
            </div>
          </div>
        ))}
        <div style={{borderTop:`1px solid ${D.border}`,paddingTop:12,marginTop:4,display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[
            ["Лид→Замер",convLM+"%",D.purple],
            ["Замер→Заказ",convMO+"%",D.yellow],
            ["Лид→Заказ",convLO+"%",D.green],
            ["Ср. чек",fmt(avgDeal),D.accentLight],
          ].map(([l,v,c])=>(
            <div key={l} style={{background:D.surface,borderRadius:8,padding:"7px 10px",textAlign:"center"}}>
              <div style={{fontSize:9,color:D.muted,fontWeight:700,marginBottom:2,textTransform:"uppercase"}}>{l}</div>
              <div style={{fontSize:14,fontWeight:900,color:c}}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:16}}>
      {/* Lead statuses */}
      <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,padding:20}}>
        <div style={{fontSize:12,fontWeight:800,color:D.muted,marginBottom:12}}>👥 ЛИДЫ ПО СТАТУСАМ</div>
        {pie.length>0?(
          <>
            <ResponsiveContainer width="100%" height={110}>
              <PieChart><Pie data={pie} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value">
                {pie.map((d,i)=><Cell key={i} fill={d.c}/>)}
              </Pie><Tooltip content={<TT/>}/></PieChart>
            </ResponsiveContainer>
            <div style={{display:"flex",flexWrap:"wrap",gap:"3px 8px",marginTop:6}}>
              {pie.map((d,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:D.muted}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:d.c}}/>{d.name} {d.value}
              </div>))}
            </div>
          </>
        ):<div style={{color:D.muted,fontSize:12,textAlign:"center",paddingTop:20}}>Нет лидов</div>}
      </div>

      {/* Active orders */}
      <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,padding:20}}>
        <div style={{fontSize:12,fontWeight:800,color:D.muted,marginBottom:12}}>📦 АКТИВНЫЕ ЗАКАЗЫ</div>
        {activeOrders.length===0&&<div style={{color:D.muted,fontSize:12}}>Нет активных заказов</div>}
        {activeOrders.slice(0,5).map(o=>(
          <div key={o.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${D.border}`}}>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:D.text}}>{o.client}</div>
              <div style={{fontSize:10,color:D.muted}}>{o.id} · {o.windows} окон</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:12,fontWeight:700,color:D.green}}>{fmt(o.paid)}</div>
              <div style={{fontSize:10,color:D.muted}}>из {fmt(o.total)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Right column: pending payments + alerts */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {pending.length>0&&(<div style={{background:D.card,border:`1px solid ${D.yellow}30`,borderRadius:14,padding:16}}>
          <div style={{fontSize:12,fontWeight:800,color:D.muted,marginBottom:10}}>💰 ОЖИДАЮТСЯ ПЛАТЕЖИ</div>
          {pending.slice(0,3).map(p=>(<div key={p.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${D.border}`}}>
            <div style={{fontSize:11,color:D.text}}>{p.client}</div>
            <div style={{fontSize:12,fontWeight:800,color:D.yellow}}>{fmt(p.amount)}</div>
          </div>))}
          <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
            <span style={{fontSize:11,color:D.muted}}>Итого</span>
            <span style={{fontSize:14,fontWeight:900,color:D.yellow}}>{fmt(totalPending)}</span>
          </div>
        </div>)}
        <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,padding:16}}>
          <div style={{fontSize:12,fontWeight:800,color:D.muted,marginBottom:10}}>🔔 СТАТУС</div>
          {[
            [lowStock>0,`📦 ${lowStock} позиций мало на складе`,D.yellow],
            [pendInst>0,`🔧 ${pendInst} монтажей в работе`,D.purple],
            [totalPending>0,`💰 ${fmt(totalPending)} ожидается`,D.green],
            [leads.filter(l=>l.status==="Новый лид").length>0,
              `👤 ${leads.filter(l=>l.status==="Новый лид").length} новых лидов`,D.accentLight],
          ].filter(([cond])=>cond).map(([,text,color],i)=>(
            <div key={i} style={{fontSize:11,color,fontWeight:700,marginBottom:5}}>• {text}</div>
          ))}
          {[lowStock,pendInst,totalPending,leads.filter(l=>l.status==="Новый лид").length].every(v=>!v)&&
            <div style={{fontSize:11,color:D.green}}>✓ Всё в порядке</div>}
        </div>
      </div>
    </div>
  </div>);
}

// ═══════════════════════════════════════════════════════════════
// LEADS
// ═══════════════════════════════════════════════════════════════
function Leads({leads,setLeads}){
  const [search,setSearch]=useState("");
  const [filter,setFilter]=useState("Все");
  const [modal,setModal]=useState(false);
  const [edit,setEdit]=useState(null);
  const [form,setForm]=useState({name:"",phone:"",city:"",type:"Частный",windows:"1",source:"Google Ads",status:"Новый лид",value:"",notes:""});
  const filtered=leads.filter(l=>(filter==="Все"||l.status===filter)&&(l.name.toLowerCase().includes(search.toLowerCase())||l.phone.includes(search)));
  const openAdd=()=>{setEdit(null);setForm({name:"",phone:"",city:"",type:"Частный",windows:"1",source:"Google Ads",status:"Новый лид",value:"",notes:""});setModal(true);};
  const openEdit=l=>{setEdit(l.id);setForm({...l,windows:String(l.windows),value:String(l.value)});setModal(true);};
  const submit=()=>{
    if(!form.name||!form.phone)return;
    const data={...form,windows:+form.windows||1,value:+form.value||0,date:new Date().toISOString().split("T")[0]};
    if(edit)setLeads(p=>p.map(l=>l.id===edit?{...data,id:edit}:l));
    else setLeads(p=>[...p,{...data,id:Date.now()}]);
    setModal(false);
  };
  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
      <div><div style={{fontSize:22,fontWeight:900,color:D.text}}>CRM · Лиды</div>
        <div style={{fontSize:13,color:D.muted}}>{leads.length} в базе</div></div>
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={()=>exportCSV(["Имя","Телефон","Город","Статус","Сумма","Дата"],leads.map(l=>[l.name,l.phone,l.city,l.status,l.value,l.date]),"лиды.csv")} variant="ghost"><Download size={13}/> CSV</Btn>
        <Btn onClick={openAdd}><Plus size={13}/> Новый лид</Btn>
      </div>
    </div>
    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
      <div style={{position:"relative",flex:1,minWidth:200}}>
        <Search size={12} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:D.muted}}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Поиск..."
          style={{width:"100%",background:D.card,border:`1px solid ${D.border}`,borderRadius:8,padding:"8px 10px 8px 30px",color:D.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
      </div>
      {["Все","Новый лид","Замер назначен","КП отправлено","Закрыт (выиграли)"].map(s=>(
        <button key={s} onClick={()=>setFilter(s)} style={{padding:"6px 12px",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer",
          border:`1px solid ${filter===s?D.accent:D.border}`,background:filter===s?D.accent+"20":"transparent",color:filter===s?D.accentLight:D.muted}}>
          {s==="Все"?`Все (${leads.length})`:s}</button>
      ))}
    </div>
    <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,overflow:"hidden"}}>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1.2fr 1fr 1.2fr 1fr 64px",padding:"8px 14px",background:D.surface,gap:10}}>
        {["Клиент","Телефон","Город","Статус","Сумма",""].map((h,i)=>(
          <div key={i} style={{fontSize:9,fontWeight:800,color:D.muted,textTransform:"uppercase"}}>{h}</div>))}
      </div>
      {filtered.length===0&&<div style={{padding:40,textAlign:"center",color:D.muted}}>Нет лидов</div>}
      {filtered.map((l,i)=>(
        <div key={l.id} style={{display:"grid",gridTemplateColumns:"2fr 1.2fr 1fr 1.2fr 1fr 64px",
          padding:"10px 14px",gap:10,alignItems:"center",background:i%2===0?D.card:D.surface,borderTop:`1px solid ${D.border}`}}>
          <div><div style={{fontSize:13,fontWeight:700,color:D.text}}>{l.name}</div>
            <div style={{fontSize:10,color:D.muted}}>{l.type} · {l.source} · {l.date}</div></div>
          <div style={{fontSize:12,color:D.muted}}>{l.phone}</div>
          <div style={{fontSize:12,color:D.muted}}>{l.city}</div>
          <select value={l.status} onChange={e=>setLeads(p=>p.map(x=>x.id===l.id?{...x,status:e.target.value}:x))}
            style={{background:(SC[l.status]||D.muted)+"18",color:SC[l.status]||D.muted,
              border:`1px solid ${(SC[l.status]||D.muted)}40`,borderRadius:6,padding:"3px 6px",fontSize:11,fontWeight:700,cursor:"pointer"}}>
            {LST.map(s=><option key={s} value={s} style={{background:D.card,color:D.text}}>{s}</option>)}
          </select>
          <div style={{fontSize:13,fontWeight:700,color:D.green}}>{fmt(l.value)}</div>
          <div style={{display:"flex",gap:4}}>
            <button onClick={()=>openEdit(l)} style={{background:"none",border:"none",cursor:"pointer",color:D.muted,padding:4}}><Eye size={13}/></button>
            <button onClick={()=>setLeads(p=>p.filter(x=>x.id!==l.id))} style={{background:"none",border:"none",cursor:"pointer",color:D.muted,padding:4}}><Trash2 size={13}/></button>
          </div>
        </div>
      ))}
    </div>
    {modal&&(<Modal title={edit?"✏️ Редактировать":"➕ Новый лид"} onClose={()=>setModal(false)}>
      <Inp label="Имя *" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/>
      <Inp label="Телефон *" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Inp label="Город" value={form.city} onChange={e=>setForm(p=>({...p,city:e.target.value}))}/>
        <Inp label="Кол-во окон" value={form.windows} onChange={e=>setForm(p=>({...p,windows:e.target.value}))} type="number"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Sel label="Тип" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} options={["Частный","Подрядчик","Архитектор"]}/>
        <Sel label="Источник" value={form.source} onChange={e=>setForm(p=>({...p,source:e.target.value}))} options={["Google Ads","Google Maps","Рекомендация","Instagram","Архитектор","Прораб"]}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Sel label="Статус" value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))} options={LST}/>
        <Inp label="Оценка ₪" value={form.value} onChange={e=>setForm(p=>({...p,value:e.target.value}))} type="number"/>
      </div>
      <Inp label="Заметки" value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}/>
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={submit}><Check size={13}/> {edit?"Сохранить":"Добавить"}</Btn>
        <Btn onClick={()=>setModal(false)} variant="ghost">Отмена</Btn>
      </div>
    </Modal>)}
  </div>);
}

// ═══════════════════════════════════════════════════════════════
// MEASUREMENTS
// ═══════════════════════════════════════════════════════════════
// Lead status pipeline helper
const MSTATUS_TO_LSTATUS={"Запланирован":"Замер назначен","Выполнен":"КП отправлено","Утверждён":"Follow-up"};

function Measurements({measurements,setMeasurements,onOpenCalc,leads,setLeads}){
  const [modal,setModal]=useState(false);
  const [viewM,setViewM]=useState(null);
  const [editId,setEditId]=useState(null);
  const ef=()=>({client:"",phone:"",address:"",date:new Date().toISOString().split("T")[0],
    specialist:"",status:"Запланирован",leadId:"",
    openings:[{id:Date.now(),room:"",width:"",height:"",type:"Хаза 2-трек",qty:1,notes:""}],
    wallType:"Железобетон",floor:"1",crane:false,demolition:false,installNotes:"",files:[]});
  const [form,setForm]=useState(ef());
  const openAdd=()=>{setEditId(null);setForm(ef());setModal(true);};
  const openEdit=m=>{setEditId(m.id);setForm({...m,openings:m.openings.map(o=>({...o})),files:m.files.map(f=>({...f}))});setModal(true);};
  const addRow=()=>setForm(f=>({...f,openings:[...f.openings,{id:Date.now(),room:"",width:"",height:"",type:"Хаза 2-трек",qty:1,notes:""}]}));
  const delRow=id=>setForm(f=>({...f,openings:f.openings.filter(o=>o.id!==id)}));
  const updRow=(id,k,v)=>setForm(f=>({...f,openings:f.openings.map(o=>o.id===id?{...o,[k]:v}:o)}));
  const pickFiles=e=>{
    Array.from(e.target.files).forEach(file=>{
      const r=new FileReader();
      r.onload=ev=>setForm(f=>({...f,files:[...f.files,{id:Date.now()+Math.random(),name:file.name,type:file.type,size:file.size,data:ev.target.result,isImage:file.type.startsWith("image/")}]}));
      r.readAsDataURL(file);
    });e.target.value="";
  };
  const syncLeadStatus=(leadId,mStatus)=>{
    const ls=MSTATUS_TO_LSTATUS[mStatus];
    if(leadId&&ls)setLeads(p=>p.map(l=>l.id===leadId?{...l,status:ls}:l));
  };
  const submit=()=>{
    if(!form.client)return;
    const rec={...form,id:editId||Date.now()};
    if(editId)setMeasurements(p=>p.map(m=>m.id===editId?rec:m));
    else setMeasurements(p=>[...p,rec]);
    syncLeadStatus(form.leadId,form.status);
    setModal(false);
  };
  const changeMStatus=(m,newStatus)=>{
    setMeasurements(p=>p.map(x=>x.id===m.id?{...x,status:newStatus}:x));
    syncLeadStatus(m.leadId,newStatus);
  };
  const totalArea=m=>m.openings.reduce((s,o)=>s+(parseFloat(o.width)||0)/100*(parseFloat(o.height)||0)/100*(parseInt(o.qty)||1),0);

  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
      <div><div style={{fontSize:22,fontWeight:900,color:D.text}}>Замеры</div>
        <div style={{fontSize:13,color:D.muted}}>{measurements.length} замеров</div></div>
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={()=>exportCSV(["Клиент","Адрес","Дата","Статус","м²"],measurements.map(m=>[m.client,m.address,m.date,m.status,totalArea(m).toFixed(2)]),"замеры.csv")} variant="ghost"><Download size={13}/> CSV</Btn>
        <Btn onClick={openAdd}><Plus size={13}/> Новый замер</Btn>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}}>
      <KCard icon={Clock} label="Запланировано" value={measurements.filter(m=>m.status==="Запланирован").length} color={D.purple}/>
      <KCard icon={Ruler} label="Выполнено" value={measurements.filter(m=>m.status==="Выполнен").length} color={D.accentLight}/>
      <KCard icon={Check} label="Утверждено" value={measurements.filter(m=>m.status==="Утверждён").length} color={D.green}/>
    </div>
    {measurements.length===0&&<div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,padding:40,textAlign:"center",color:D.muted}}>Нет замеров</div>}
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {measurements.map(m=>{
        const area=totalArea(m);
        return(<div key={m.id} style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,padding:"16px 20px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <div style={{background:D.teal+"20",borderRadius:10,padding:10,marginTop:2}}><Ruler size={16} color={D.teal}/></div>
              <div>
                <div style={{fontSize:15,fontWeight:800,color:D.text}}>{m.client}</div>
                <div style={{fontSize:11,color:D.muted,marginTop:2}}>{m.address}</div>
                <div style={{display:"flex",gap:10,marginTop:6,flexWrap:"wrap"}}>
                  <span style={{fontSize:11,color:D.muted}}>📅 {m.date}</span>
                  {m.specialist&&<span style={{fontSize:11,color:D.muted}}>👤 {m.specialist}</span>}
                  <span style={{fontSize:11,color:D.muted}}>🪟 {m.openings.length} проёмов</span>
                  <span style={{fontSize:11,color:D.green,fontWeight:700}}>📐 {area.toFixed(2)} м²</span>
                  {m.files.length>0&&<span style={{fontSize:11,color:D.muted}}>📎 {m.files.length} файлов</span>}
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",justifyContent:"flex-end"}}>
              <select value={m.status} onChange={e=>changeMStatus(m,e.target.value)}
                style={{background:(SC[m.status]||D.muted)+"18",color:SC[m.status]||D.muted,
                  border:`1px solid ${(SC[m.status]||D.muted)}40`,borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:700,cursor:"pointer"}}>
                {MST.map(s=><option key={s} value={s} style={{background:D.card,color:D.text}}>{s}</option>)}
              </select>
              <Btn onClick={()=>onOpenCalc(m)} variant="yellow" small><Calculator size={12}/> В калькулятор</Btn>
              <Btn onClick={()=>setViewM(m)} variant="ghost" small><Eye size={12}/></Btn>
              <button onClick={()=>openEdit(m)} style={{background:"none",border:"none",cursor:"pointer",color:D.muted,padding:4}}>✏️</button>
              <button onClick={()=>setMeasurements(p=>p.filter(x=>x.id!==m.id))} style={{background:"none",border:"none",cursor:"pointer",color:D.muted,padding:4}}><Trash2 size={13}/></button>
            </div>
          </div>
          {m.openings.length>0&&(<div style={{marginTop:12,background:D.surface,borderRadius:8,overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"1.5fr 80px 80px 1.5fr 50px 1fr",padding:"5px 10px",gap:8}}>
              {["Помещение","Ш (см)","В (см)","Тип","Кол","Заметки"].map((h,i)=>(<div key={i} style={{fontSize:9,fontWeight:800,color:D.muted,textTransform:"uppercase"}}>{h}</div>))}
            </div>
            {m.openings.map((o,i)=>(<div key={o.id} style={{display:"grid",gridTemplateColumns:"1.5fr 80px 80px 1.5fr 50px 1fr",
              padding:"6px 10px",gap:8,borderTop:`1px solid ${D.border}`,background:i%2===0?D.card+"80":D.surface}}>
              <div style={{fontSize:12,fontWeight:600,color:D.text}}>{o.room||"—"}</div>
              <div style={{fontSize:12,fontWeight:700,color:D.accentLight}}>{o.width}</div>
              <div style={{fontSize:12,fontWeight:700,color:D.accentLight}}>{o.height}</div>
              <div style={{fontSize:11,color:D.muted}}>{o.type}</div>
              <div style={{fontSize:12,fontWeight:700,color:D.text,textAlign:"center"}}>{o.qty}</div>
              <div style={{fontSize:11,color:D.muted}}>{o.notes||"—"}</div>
            </div>))}
          </div>)}
        </div>);
      })}
    </div>
    {/* VIEW MODAL */}
    {viewM&&(<Modal title={`📐 Замер — ${viewM.client}`} onClose={()=>setViewM(null)} wide>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        <div><div style={{fontSize:14,fontWeight:700,color:D.text}}>{viewM.client}</div>
          <div style={{fontSize:12,color:D.muted}}>{viewM.phone}</div>
          <div style={{fontSize:12,color:D.muted}}>{viewM.address}</div></div>
        <div><div style={{fontSize:12,color:D.muted}}>Дата: <b style={{color:D.text}}>{viewM.date}</b></div>
          <div style={{fontSize:12,color:D.muted}}>Специалист: <b style={{color:D.text}}>{viewM.specialist||"—"}</b></div>
          <div style={{fontSize:12,color:D.muted}}>Стена: <b style={{color:D.text}}>{viewM.wallType}</b> · Этаж: <b style={{color:D.text}}>{viewM.floor}</b></div>
          <div style={{marginTop:6,display:"flex",gap:8}}>
            {viewM.crane&&<span style={{background:D.yellow+"20",color:D.yellow,fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:6}}>🏗️ Кран</span>}
            {viewM.demolition&&<span style={{background:D.red+"20",color:D.red,fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:6}}>🔨 Демонтаж</span>}
            <Badge status={viewM.status}/>
          </div>
        </div>
      </div>
      {viewM.installNotes&&<div style={{background:D.surface,borderRadius:8,padding:12,marginBottom:16,fontSize:12,color:D.muted}}><b style={{color:D.text}}>Заметки:</b> {viewM.installNotes}</div>}
      <div style={{background:D.surface,borderRadius:8,overflow:"hidden",marginBottom:16}}>
        <div style={{display:"grid",gridTemplateColumns:"1.5fr 70px 70px 60px 1.5fr 50px",padding:"6px 12px",gap:8}}>
          {["Помещение","Ш","В","м²","Тип","Кол"].map((h,i)=>(<div key={i} style={{fontSize:9,fontWeight:800,color:D.muted,textTransform:"uppercase"}}>{h}</div>))}
        </div>
        {viewM.openings.map((o,i)=>{const a=(parseFloat(o.width)||0)/100*(parseFloat(o.height)||0)/100*(parseInt(o.qty)||1);return(
          <div key={o.id} style={{display:"grid",gridTemplateColumns:"1.5fr 70px 70px 60px 1.5fr 50px",
            padding:"8px 12px",gap:8,borderTop:`1px solid ${D.border}`,background:i%2===0?D.card+"80":D.surface}}>
            <div style={{fontSize:12,fontWeight:600,color:D.text}}>{o.room||"—"}</div>
            <div style={{fontSize:12,fontWeight:700,color:D.accentLight}}>{o.width}</div>
            <div style={{fontSize:12,fontWeight:700,color:D.accentLight}}>{o.height}</div>
            <div style={{fontSize:12,color:D.green,fontWeight:700}}>{a.toFixed(2)}</div>
            <div style={{fontSize:11,color:D.muted}}>{o.type}</div>
            <div style={{fontSize:13,fontWeight:700,color:D.text,textAlign:"center"}}>{o.qty}</div>
          </div>);})}
        <div style={{padding:"8px 12px",borderTop:`1px solid ${D.border}`,display:"flex",justifyContent:"flex-end",gap:20}}>
          <span style={{fontSize:12,color:D.muted}}>Итого:</span>
          <span style={{fontSize:13,fontWeight:800,color:D.green}}>{totalArea(viewM).toFixed(2)} м²</span>
        </div>
      </div>
      {viewM.files.length>0&&(<>
        <div style={{fontSize:11,fontWeight:800,color:D.muted,textTransform:"uppercase",marginBottom:10}}>Файлы и чертежи</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
          {viewM.files.map(f=>(<div key={f.id} style={{background:D.surface,border:`1px solid ${D.border}`,borderRadius:10,overflow:"hidden",width:f.isImage?120:190}}>
            {f.isImage?<img src={f.data} alt={f.name} style={{width:120,height:90,objectFit:"cover",display:"block"}}/>
              :<div style={{padding:"10px 12px",display:"flex",gap:8,alignItems:"center"}}>
                <span style={{fontSize:22}}>{fileIcon(f.type)}</span>
                <div><div style={{fontSize:11,fontWeight:700,color:D.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:120}}>{f.name}</div>
                  <div style={{fontSize:10,color:D.muted}}>{fmtSize(f.size)}</div></div>
              </div>}
            <div style={{padding:"4px 8px",borderTop:`1px solid ${D.border}`}}>
              <button onClick={()=>dlFile(f)} style={{background:"none",border:"none",cursor:"pointer",color:D.accentLight,fontSize:10,fontWeight:700}}><Download size={10}/> Скачать</button>
            </div>
          </div>))}
        </div>
      </>)}
      <div style={{marginTop:16}}><Btn onClick={()=>{onOpenCalc(viewM);setViewM(null);}} variant="yellow"><Calculator size={13}/> Открыть в калькуляторе</Btn></div>
    </Modal>)}
    {/* EDIT/ADD */}
    {modal&&(<Modal title={editId?"✏️ Редактировать":"📐 Новый замер"} onClose={()=>setModal(false)} wide>
      <SH title="👤 Клиент и объект"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Inp label="Имя клиента *" value={form.client} onChange={e=>setForm(f=>({...f,client:e.target.value}))}/>
        <Inp label="Телефон" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/>
      </div>
      <Inp label="Адрес объекта" value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
        <Inp label="Дата" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} type="date"/>
        <Inp label="Специалист" value={form.specialist} onChange={e=>setForm(f=>({...f,specialist:e.target.value}))}/>
        <Sel label="Статус" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} options={MST}/>
      </div>
      {leads.length>0&&(<div style={{marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:700,color:D.muted,marginBottom:4,textTransform:"uppercase"}}>Привязать к лиду (авто-статус)</div>
        <select value={form.leadId} onChange={e=>{
          const lead=leads.find(l=>l.id===+e.target.value);
          setForm(f=>({...f,leadId:e.target.value?+e.target.value:"",
            client:lead?lead.name:f.client,phone:lead?lead.phone:f.phone}));
        }} style={{width:"100%",background:D.bg,border:`1px solid ${D.border}`,borderRadius:8,padding:"8px 12px",color:D.text,fontSize:13,outline:"none"}}>
          <option value="" style={{background:D.card}}>— без привязки —</option>
          {leads.filter(l=>!["Закрыт (выиграли)","Закрыт (проиграли)"].includes(l.status)).map(l=>(
            <option key={l.id} value={l.id} style={{background:D.card}}>{l.name} · {l.phone} · {l.status}</option>
          ))}
        </select>
        {form.leadId&&<div style={{fontSize:10,color:D.teal,marginTop:4}}>✓ При сохранении статус лида обновится автоматически</div>}
      </div>)}
      <SH title="🪟 Проёмы"/>
      <div style={{background:D.surface,borderRadius:10,overflow:"hidden",marginBottom:10}}>
        <div style={{display:"grid",gridTemplateColumns:"1.4fr 72px 72px 1.4fr 50px 1fr 28px",padding:"6px 10px",gap:8,background:D.bg}}>
          {["Помещение","Ш (см)","В (см)","Тип","Кол","Заметки",""].map((h,i)=>(<div key={i} style={{fontSize:9,fontWeight:800,color:D.muted,textTransform:"uppercase"}}>{h}</div>))}
        </div>
        {form.openings.map((o,i)=>(<div key={o.id} style={{display:"grid",gridTemplateColumns:"1.4fr 72px 72px 1.4fr 50px 1fr 28px",
          padding:"6px 10px",gap:8,borderTop:`1px solid ${D.border}`,background:i%2===0?D.card+"60":D.surface,alignItems:"center"}}>
          <input value={o.room} onChange={e=>updRow(o.id,"room",e.target.value)} placeholder="Гостиная..." style={{background:"transparent",border:`1px solid ${D.border}`,borderRadius:5,padding:"4px 6px",color:D.text,fontSize:12,outline:"none",width:"100%"}}/>
          <input type="number" value={o.width} onChange={e=>updRow(o.id,"width",e.target.value)} placeholder="120" style={{background:"transparent",border:`1px solid ${D.border}`,borderRadius:5,padding:"4px 6px",color:D.accentLight,fontSize:12,fontWeight:700,outline:"none",width:"100%",textAlign:"center"}}/>
          <input type="number" value={o.height} onChange={e=>updRow(o.id,"height",e.target.value)} placeholder="140" style={{background:"transparent",border:`1px solid ${D.border}`,borderRadius:5,padding:"4px 6px",color:D.accentLight,fontSize:12,fontWeight:700,outline:"none",width:"100%",textAlign:"center"}}/>
          <select value={o.type} onChange={e=>updRow(o.id,"type",e.target.value)} style={{background:D.bg,border:`1px solid ${D.border}`,borderRadius:5,padding:"4px 6px",color:D.text,fontSize:11,outline:"none",width:"100%"}}>
            {MOP_T.map(t=><option key={t} value={t} style={{background:D.card}}>{t}</option>)}
          </select>
          <input type="number" value={o.qty} min={1} onChange={e=>updRow(o.id,"qty",+e.target.value||1)} style={{background:"transparent",border:`1px solid ${D.border}`,borderRadius:5,padding:"4px 6px",color:D.text,fontSize:12,outline:"none",width:"100%",textAlign:"center"}}/>
          <input value={o.notes} onChange={e=>updRow(o.id,"notes",e.target.value)} placeholder="Заметка..." style={{background:"transparent",border:`1px solid ${D.border}`,borderRadius:5,padding:"4px 6px",color:D.muted,fontSize:11,outline:"none",width:"100%"}}/>
          <button onClick={()=>delRow(o.id)} disabled={form.openings.length===1} style={{background:"none",border:"none",cursor:"pointer",color:D.red,padding:2,opacity:form.openings.length===1?0.3:1}}><X size={13}/></button>
        </div>))}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
        <Btn onClick={addRow} variant="ghost" small><Plus size={12}/> Добавить проём</Btn>
        <div style={{fontSize:12,color:D.muted}}>
          {form.openings.some(o=>o.width&&o.height)&&<><b style={{color:D.green}}>{form.openings.reduce((s,o)=>s+(parseFloat(o.width)||0)/100*(parseFloat(o.height)||0)/100*(parseInt(o.qty)||1),0).toFixed(2)} м²</b></>}
        </div>
      </div>
      <SH title="🔧 Монтаж"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
        <Sel label="Тип стены" value={form.wallType} onChange={e=>setForm(f=>({...f,wallType:e.target.value}))} options={WT}/>
        <Inp label="Этаж" value={form.floor} onChange={e=>setForm(f=>({...f,floor:e.target.value}))}/>
        <div style={{marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,color:D.muted,marginBottom:8,textTransform:"uppercase"}}>Доп. работы</div>
          <label style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",marginBottom:6}}>
            <input type="checkbox" checked={form.demolition} onChange={e=>setForm(f=>({...f,demolition:e.target.checked}))} style={{accentColor:D.accent,width:15,height:15}}/>
            <span style={{fontSize:12,color:D.text}}>🔨 Демонтаж</span>
          </label>
          <label style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer"}}>
            <input type="checkbox" checked={form.crane} onChange={e=>setForm(f=>({...f,crane:e.target.checked}))} style={{accentColor:D.accent,width:15,height:15}}/>
            <span style={{fontSize:12,color:D.text}}>🏗️ Кран</span>
          </label>
        </div>
      </div>
      <Txa label="Заметки по монтажу" value={form.installNotes} onChange={e=>setForm(f=>({...f,installNotes:e.target.value}))}/>
      <SH title="📎 Фото и файлы"/>
      <div style={{background:D.surface,border:`2px dashed ${D.border}`,borderRadius:12,padding:"12px 18px",marginBottom:10,textAlign:"center"}}>
        <div style={{fontSize:12,color:D.muted,marginBottom:8}}>Фото, PDF, DWG, DXF, AutoCAD и любые другие форматы</div>
        <Btn variant="teal" onClick={()=>{const fi=document.createElement("input");fi.type="file";fi.multiple=true;fi.accept="image/*,.pdf,.dwg,.dxf,.rvt,.skp,.ifc";fi.onchange=pickFiles;fi.click();}}><Paperclip size={13}/> Прикрепить файлы</Btn>
      </div>
      {form.files.length>0&&(<div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:10}}>
        {form.files.map(f=>(<div key={f.id} style={{position:"relative",background:D.surface,border:`1px solid ${D.border}`,borderRadius:10,overflow:"hidden",width:f.isImage?100:180}}>
          {f.isImage?<img src={f.data} alt={f.name} style={{width:100,height:75,objectFit:"cover",display:"block"}}/>
            :<div style={{padding:"8px 10px",display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:20}}>{fileIcon(f.type)}</span>
              <div style={{overflow:"hidden"}}><div style={{fontSize:11,color:D.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.name}</div>
                <div style={{fontSize:10,color:D.muted}}>{fmtSize(f.size)}</div></div>
            </div>}
          <button onClick={()=>setForm(f2=>({...f2,files:f2.files.filter(x=>x.id!==f.id)}))} style={{position:"absolute",top:4,right:4,background:"#00000088",border:"none",borderRadius:"50%",width:18,height:18,cursor:"pointer",color:"#fff",fontSize:10}}>✕</button>
        </div>))}
      </div>)}
      <div style={{display:"flex",gap:8,marginTop:8,paddingTop:14,borderTop:`1px solid ${D.border}`}}>
        <Btn onClick={submit}><Check size={13}/> {editId?"Сохранить":"Создать"}</Btn>
        <Btn onClick={()=>setModal(false)} variant="ghost">Отмена</Btn>
      </div>
    </Modal>)}
  </div>);
}

// ═══════════════════════════════════════════════════════════════
// CALCULATOR — QUICK + DETAILED (Dekel)
// ═══════════════════════════════════════════════════════════════
function printKP(client,calced,saleTotal,margin,split,extras){
  const pay1=Math.round(saleTotal*split/100);
  const pay2=saleTotal-pay1;
  const date=new Date().toLocaleDateString("he-IL");
  const validItems=calced.filter(c=>c.valid);
  const rows=validItems.map((c,i)=>{
    const linePrice=Math.round(c.totalCost/c.qty*(1+margin/100))*c.qty;
    const unitPrice=Math.round(c.totalCost/c.qty*(1+margin/100));
    const glassName=c.glass!=="none"?(DG.find(g=>g.id===c.glass)?.name||""):"";
    const screenOpt=DS.find(s=>s.id===c.screen)||DS[0];
    const shutterOpt=DSHT.find(s=>s.id===c.shutter)||DSHT[0];
    // Window row
    const winPrice=Math.round((c.baseDekel+c.glassAddon)*c.install/c.qty*(1+margin/100));
    const winTotal=winPrice*c.qty;
    let html=`<tr>
      <td style="text-align:center">${i+1}</td>
      <td><b>${c.name}</b>${glassName?`<br/><span class="sub">זכוכית: ${glassName}</span>`:""}
      <br/><span class="sub">${OPS.find(o=>o.id===c.op)?.name||c.op} · ${PNAMES[c.profile]||c.profile}</span></td>
      <td style="text-align:center">${c.w}×${c.h} ס"מ</td>
      <td style="text-align:center">${c.area.toFixed(2)} מ"ר</td>
      <td style="text-align:center">${c.qty}</td>
      <td style="text-align:left;font-weight:700">₪${winPrice.toLocaleString("he-IL")}</td>
      <td style="text-align:left;font-weight:800;color:#1d4ed8">₪${winTotal.toLocaleString("he-IL")}</td>
    </tr>`;
    // Screen sub-row
    if(c.screen!=="none"){
      const sp=Math.round(screenOpt.price*(1+margin/100));
      html+=`<tr style="background:#f0fdf4">
        <td></td>
        <td style="padding-right:24px"><span style="color:#16a34a">↳ ${screenOpt.name}</span></td>
        <td colspan="2"></td><td style="text-align:center">${c.qty}</td>
        <td style="color:#16a34a">₪${sp.toLocaleString("he-IL")}</td>
        <td style="color:#16a34a;font-weight:700">₪${(sp*c.qty).toLocaleString("he-IL")}</td>
      </tr>`;
    }
    // Shutter sub-row
    if(c.shutter!=="none"){
      const shp=Math.round((shutterOpt.priceM2*c.billArea+shutterOpt.motor*c.qty)*(1+margin/100));
      html+=`<tr style="background:#fffbeb">
        <td></td>
        <td style="padding-right:24px"><span style="color:#d97706">↳ ${shutterOpt.name}</span></td>
        <td style="text-align:center">${c.w}×${c.h} ס"מ</td>
        <td style="text-align:center">${c.area.toFixed(2)} מ"ר</td>
        <td style="text-align:center">${c.qty}</td>
        <td style="color:#d97706">—</td>
        <td style="color:#d97706;font-weight:700">₪${shp.toLocaleString("he-IL")}</td>
      </tr>`;
    }
    return html;
  }).join("");

  const html=`<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="UTF-8"/>
  <title>הצעת מחיר – ${client}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Arial',sans-serif;direction:rtl;color:#1e293b;background:#fff;padding:36px;font-size:13px}
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:18px;border-bottom:3px solid #2563eb}
    .logo{font-size:24px;font-weight:900;color:#2563eb;letter-spacing:-0.04em}
    .logo-sub{font-size:12px;color:#64748b;margin-top:3px}
    .meta{text-align:left;font-size:12px;color:#64748b;line-height:1.8}
    .meta b{color:#1e293b;font-size:14px}
    .client-box{background:#f1f5f9;border-right:4px solid #2563eb;border-radius:6px;padding:12px 16px;margin-bottom:22px;font-size:14px}
    .client-box b{font-size:16px;color:#1e293b}
    h2{font-size:14px;font-weight:800;color:#1e293b;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.04em}
    table{width:100%;border-collapse:collapse;margin-bottom:24px;font-size:13px}
    th{background:#1e293b;color:#fff;padding:9px 12px;text-align:right;font-size:11px}
    th:nth-child(3),th:nth-child(4),th:nth-child(5){text-align:center}
    td{padding:9px 12px;border-bottom:1px solid #e2e8f0;vertical-align:middle}
    tr:nth-child(even) td{background:#f8fafc}
    .sub{font-size:11px;color:#64748b;font-weight:400}
    .total-section{display:flex;justify-content:flex-start;margin-bottom:24px}
    .total-box{border:2px solid #2563eb;border-radius:10px;padding:16px 24px;min-width:280px}
    .total-row{display:flex;justify-content:space-between;gap:40px;margin-bottom:6px;font-size:13px;color:#64748b}
    .grand-total{display:flex;justify-content:space-between;gap:40px;padding-top:10px;border-top:2px solid #1e293b;margin-top:8px}
    .grand-total .label{font-size:15px;font-weight:800;color:#1e293b}
    .grand-total .val{font-size:20px;font-weight:900;color:#2563eb}
    .payments{background:linear-gradient(135deg,#1d4ed8,#1e3a8a);color:#fff;border-radius:12px;padding:22px;margin-bottom:24px}
    .payments h3{font-size:13px;font-weight:700;margin-bottom:14px;opacity:0.85}
    .pay-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    .pay-box{background:rgba(255,255,255,0.15);border-radius:8px;padding:14px;text-align:center}
    .pay-box .amount{font-size:22px;font-weight:900}
    .pay-box .label{font-size:12px;opacity:0.75;margin-top:5px;line-height:1.5}
    .terms{font-size:11px;color:#94a3b8;background:#f8fafc;border-radius:8px;padding:12px 16px;margin-bottom:20px;line-height:1.8}
    .terms b{color:#475569}
    .footer{font-size:11px;color:#94a3b8;text-align:center;padding-top:16px;border-top:1px solid #e2e8f0}
    @media print{body{padding:20px}.pay-grid{grid-template-columns:1fr 1fr}}
  </style></head><body>
  <div class="header">
    <div>
      <div class="logo">🏭 חלונות אלומיניום</div>
      <div class="logo-sub">ייצור והתקנה של חלונות ודלתות אלומיניום</div>
    </div>
    <div class="meta">
      <div>תאריך: <b>${date}</b></div>
      <div>הצעת מחיר מספר: <b>QT-${Date.now().toString().slice(-6)}</b></div>
    </div>
  </div>

  <div class="client-box">
    הצעת מחיר עבור: <b>${client}</b>
  </div>

  <h2>פירוט הצעת המחיר</h2>
  <table>
    <thead><tr>
      <th style="text-align:center;width:36px">#</th>
      <th>תיאור המוצר</th>
      <th style="text-align:center">מידות</th>
      <th style="text-align:center">שטח</th>
      <th style="text-align:center">כמות</th>
      <th>מחיר ליחידה</th>
      <th>סה"כ</th>
    </tr></thead>
    <tbody>${rows}
    ${extras&&extras.demolition?`<tr style="background:#fef9c3"><td></td><td colspan="4"><b>🔨 פירוק חלונות ישנים</b></td><td>—</td><td style="font-weight:700;color:#b45309">₪${Math.round(extras.demolitionPrice*(1+margin/100)).toLocaleString("he-IL")}</td></tr>`:""}
    ${extras&&extras.crane?`<tr style="background:#fef9c3"><td></td><td colspan="4"><b>🏗️ עבודה עם מנוף</b></td><td>—</td><td style="font-weight:700;color:#b45309">₪${Math.round(extras.cranePrice*(1+margin/100)).toLocaleString("he-IL")}</td></tr>`:""}
    ${extras&&extras.highFloorPrice>0?`<tr style="background:#fef9c3"><td></td><td colspan="4"><b>🏢 תוספת קומה גבוהה (קומה ${extras.floor})</b></td><td>—</td><td style="font-weight:700;color:#b45309">₪${Math.round(extras.highFloorPrice*(1+margin/100)).toLocaleString("he-IL")}</td></tr>`:""}
    </tbody>
  </table>

  <div class="total-section">
    <div class="total-box">
      <div class="grand-total">
        <span class="label">סה"כ לתשלום</span>
        <span class="val">₪${saleTotal.toLocaleString("he-IL")}</span>
      </div>
      <div style="font-size:11px;color:#64748b;margin-top:6px;text-align:left">כולל מע"מ לפי חוק</div>
    </div>
  </div>

  <div class="payments">
    <h3>תנאי תשלום</h3>
    <div class="pay-grid">
      <div class="pay-box">
        <div class="amount">₪${pay1.toLocaleString("he-IL")}</div>
        <div class="label">${split}% מקדמה<br/>בעת חתימת ההסכם</div>
      </div>
      <div class="pay-box">
        <div class="amount">₪${pay2.toLocaleString("he-IL")}</div>
        <div class="label">${100-split}% יתרה<br/>בסיום ההתקנה</div>
      </div>
    </div>
  </div>

  <div class="terms">
    <b>תנאים כלליים:</b><br/>
    • הצעה זו בתוקף ל-30 יום מתאריך הפקתה<br/>
    • המחירים כוללים חומרים, ייצור והתקנה<br/>
    • אחריות על המוצרים: 5 שנים<br/>
    • זמן אספקה והתקנה: כ-14–21 יום ממועד אישור ההזמנה ותשלום המקדמה
  </div>

  <div class="footer">WindowOS · הצעה זו הופקה באופן אוטומטי · ${date}</div>
  </body></html>`;
  const w=window.open("","_blank","width=900,height=750");
  w.document.write(html);w.document.close();
  setTimeout(()=>w.print(),500);
}

function newItem(name,op,profile,w,h,qty){
  return{id:Date.now()+Math.random(),name:name||"Окно",op:op||"sliding_2_track",
    profile:profile||"klil_7000",w:w||120,h:h||140,qty:qty||1,
    glass:"none",screen:"none",shutter:"none",install:1.10};
}

function Calc({preload,setPreload,setOrders,orders,leads,setLeads}){
  const [tab,setTab]=useState("quick");
  const [items,setItems]=useState([newItem("Окно 1")]);
  const [client,setClient]=useState("");
  const [margin,setMargin]=useState(40);
  const [split,setSplit]=useState(40);
  const [shutterFactor,setShutterFactor]=useState(1.38);
  // Extras from measurement
  const [extras,setExtras]=useState({demolition:false,crane:false,floor:"1",wallType:"Железобетон",
    demolitionPrice:800,cranePrice:1200,highFloorPrice:0});

  // Load from measurement
  useEffect(()=>{
    if(!preload)return;
    setClient(preload.client||"");
    const newItems=preload.openings.filter(o=>o.width&&o.height).map(o=>{
      const op=OT2OP[o.type]||"sliding_2_track";
      const profile=OP2PROF[op]||"klil_7000";
      return newItem(o.room||o.type,op,profile,parseFloat(o.width)||120,parseFloat(o.height)||140,parseInt(o.qty)||1);
    });
    if(newItems.length)setItems(newItems);
    // Pull extras from measurement
    const floor=parseInt(preload.floor)||1;
    const highFloorPrice=floor>=5?800*Math.max(0,floor-4):floor>=3?400:0;
    setExtras({
      demolition:!!preload.demolition,
      crane:!!preload.crane,
      floor:preload.floor||"1",
      wallType:preload.wallType||"Железобетон",
      demolitionPrice:800,
      cranePrice:1200,
      highFloorPrice,
    });
    setPreload(null);
  },[preload]);

  const upd=(id,k,v)=>setItems(p=>p.map(x=>x.id===id?{...x,[k]:v}:x));
  const addItem=()=>setItems(p=>[...p,newItem(`Окно ${p.length+1}`)]);

  // Calc costs per item
  const calcItem=(it)=>{
    const area=(it.w*it.h)/10000;
    const billArea=Math.max(area,0.6)*it.qty;
    const lookup=dekelLookup(it.op,it.profile,Math.max(area,0.6));
    if(!lookup)return{...it,area,billArea,baseDekel:0,glassAddon:0,screenAddon:0,shutterAddon:0,unitCost:0,totalCost:0,code:"—",valid:false};
    const glassOpt=DG.find(g=>g.id===it.glass)||DG[0];
    const screenOpt=DS.find(s=>s.id===it.screen)||DS[0];
    const shutterOpt=DSHT.find(s=>s.id===it.shutter)||DSHT[0];
    const baseDekel=lookup.price*billArea;
    const glassAddon=glassOpt.price*billArea;
    const screenAddon=screenOpt.price*it.qty;
    const shutterAddon=(shutterM2(shutterOpt,shutterFactor)*Math.max(area,0.6)*it.qty+shutterOpt.motor*it.qty);
    const totalCost=(baseDekel+glassAddon+screenAddon+shutterAddon)*it.install;
    return{...it,area,billArea,baseDekel,glassAddon,screenAddon,shutterAddon,totalCost,code:lookup.code,shutterOpt,valid:true};
  };
  const calced=items.map(calcItem);
  const itemsCost=calced.reduce((s,c)=>s+c.totalCost,0);
  const extrasCost=(extras.demolition?extras.demolitionPrice:0)+(extras.crane?extras.cranePrice:0)+extras.highFloorPrice;
  const totalCost=itemsCost+extrasCost;
  const saleTotal=Math.round(totalCost*(1+margin/100));
  const profit=saleTotal-totalCost;
  const pay1=Math.round(saleTotal*split/100);
  const pay2=saleTotal-pay1;

  const createOrder=()=>{
    if(!client)return alert("Укажи имя клиента");
    const id="WB-"+String(orders.length+1).padStart(3,"0");
    setOrders(p=>[...p,{id,client,city:"",windows:items.reduce((s,i)=>s+i.qty,0),total:saleTotal,paid:0,
      status:"Ожидает материалов",progress:10,created:new Date().toISOString().split("T")[0],delivery:""}]);
    // Auto-update lead: status → "Закрыт (выиграли)", value → actual price
    setLeads(p=>p.map(l=>l.name===client?{...l,status:"Закрыт (выиграли)",value:saleTotal}:l));
    alert(`Заказ ${id} создан! Лид обновлён.`);
  };

  const ProfileSel=({it})=>{
    const op=OPS.find(o=>o.id===it.op)||OPS[0];
    return(<select value={it.profile} onChange={e=>upd(it.id,"profile",e.target.value)}
      style={{width:"100%",background:D.bg,border:`1px solid ${D.border}`,borderRadius:5,padding:"4px 6px",color:D.text,fontSize:11,outline:"none"}}>
      {op.profiles.map(p=><option key={p} value={p} style={{background:D.card}}>{PNAMES[p]||p}</option>)}
    </select>);
  };

  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
      <div><div style={{fontSize:22,fontWeight:900,color:D.text}}>Калькулятор КП</div>
        <div style={{fontSize:13,color:D.muted}}>Dekel 2022 × 1.13 (цены 2026)</div></div>
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={()=>printKP(client,calced,saleTotal,margin,split,extras)} variant="success"><Download size={13}/> PDF КП</Btn>
        <Btn onClick={()=>exportCSV(["Позиция","Ш","В","м²","Тип","Профиль","Стекло","Кол","Код","Себест.","Цена"],
          calced.map(c=>[c.name,c.w,c.h,c.area.toFixed(2),c.op,c.profile,c.glass,c.qty,c.code,Math.round(c.totalCost),Math.round(c.totalCost*(1+margin/100))]),"кп.csv")} variant="ghost"><Download size={13}/> CSV</Btn>
        <Btn onClick={addItem}><Plus size={13}/> Добавить окно</Btn>
      </div>
    </div>

    {/* Tabs */}
    <div style={{display:"flex",gap:2,marginBottom:20,background:D.surface,borderRadius:10,padding:4,width:"fit-content"}}>
      {[["quick","⚡ Быстрый",""],["detailed","📋 Детальный (Dekel)",""]].map(([id,label])=>(
        <button key={id} onClick={()=>setTab(id)} style={{padding:"8px 20px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,
          background:tab===id?"linear-gradient(135deg,#2563EB,#1D4ED8)":"transparent",color:tab===id?"#fff":D.muted}}>{label}</button>
      ))}
    </div>

    {/* Client + source info */}
    {preload===null&&client&&(
      <div style={{background:D.teal+"15",border:`1px solid ${D.teal}40`,borderRadius:10,padding:"10px 16px",marginBottom:16,fontSize:12,color:D.teal,display:"flex",alignItems:"center",gap:8}}>
        <ArrowRight size={13}/> Загружено из замера: <b>{client}</b> · {items.length} проёмов
      </div>
    )}

    <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:16}}>
      {/* LEFT: items */}
      <div>
        <div style={{marginBottom:12}}>
          <Inp label="Клиент / объект" value={client} onChange={e=>setClient(e.target.value)} placeholder="Имя клиента или адрес объекта" style={{marginBottom:0}}/>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {calced.map((it,idx)=>(
            <div key={it.id} style={{background:D.card,border:`1px solid ${it.valid?D.border:D.red+"60"}`,borderRadius:14,overflow:"hidden"}}>
              <div style={{background:D.surface,padding:"8px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <div style={{background:D.accent+"30",borderRadius:6,padding:"1px 8px",fontSize:11,fontWeight:800,color:D.accentLight}}>#{idx+1}</div>
                  <input value={it.name} onChange={e=>upd(it.id,"name",e.target.value)}
                    style={{background:"transparent",border:"none",color:D.text,fontSize:13,fontWeight:700,outline:"none",width:140}}/>
                </div>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <span style={{fontSize:15,fontWeight:900,color:D.green}}>{it.valid?fmt(Math.round(it.totalCost*(1+margin/100))*it.qty):"—"}</span>
                  <button onClick={()=>setItems(p=>p.filter(x=>x.id!==it.id))} style={{background:"none",border:"none",cursor:"pointer",color:D.muted}}><X size={13}/></button>
                </div>
              </div>
              <div style={{padding:14,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
                {/* Col 1: Size + qty */}
                <div>
                  <div style={{fontSize:10,color:D.muted,fontWeight:700,textTransform:"uppercase",marginBottom:6}}>Размеры (см)</div>
                  <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:8}}>
                    <input type="number" value={it.w} onChange={e=>upd(it.id,"w",+e.target.value||1)}
                      style={{width:55,background:D.bg,border:`1px solid ${D.border}`,borderRadius:6,padding:"5px",color:D.text,fontSize:13,fontWeight:700,outline:"none",textAlign:"center"}}/>
                    <span style={{color:D.muted,fontSize:13}}>×</span>
                    <input type="number" value={it.h} onChange={e=>upd(it.id,"h",+e.target.value||1)}
                      style={{width:55,background:D.bg,border:`1px solid ${D.border}`,borderRadius:6,padding:"5px",color:D.text,fontSize:13,fontWeight:700,outline:"none",textAlign:"center"}}/>
                  </div>
                  <div style={{fontSize:11,color:D.muted}}>Площадь: <b style={{color:D.text}}>{it.area.toFixed(2)} м²</b></div>
                  <div style={{fontSize:11,color:it.area<0.6?D.yellow:D.muted,marginTop:2}}>
                    {it.area<0.6?"⚠️ мин. 0.6 м² (биллинг)":"Биллинг: "+Math.max(it.area,0.6).toFixed(2)+" м²"}
                  </div>
                  <div style={{marginTop:8,display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:11,color:D.muted}}>Кол:</span>
                    <button onClick={()=>upd(it.id,"qty",Math.max(1,it.qty-1))} style={{background:D.border,border:"none",borderRadius:5,width:22,height:22,color:D.text,cursor:"pointer",fontWeight:800}}>−</button>
                    <span style={{fontSize:14,fontWeight:800,color:D.text,minWidth:22,textAlign:"center"}}>{it.qty}</span>
                    <button onClick={()=>upd(it.id,"qty",it.qty+1)} style={{background:D.border,border:"none",borderRadius:5,width:22,height:22,color:D.text,cursor:"pointer",fontWeight:800}}>+</button>
                  </div>
                </div>
                {/* Col 2: Config */}
                <div>
                  <div style={{fontSize:10,color:D.muted,fontWeight:700,textTransform:"uppercase",marginBottom:6}}>Конфигурация</div>
                  <div style={{marginBottom:5}}>
                    <div style={{fontSize:9,color:D.muted,marginBottom:2}}>Тип окна</div>
                    <select value={it.op} onChange={e=>{const op=OPS.find(o=>o.id===e.target.value)||OPS[0];upd(it.id,"op",e.target.value);upd(it.id,"profile",op.profiles[0]);}}
                      style={{width:"100%",background:D.bg,border:`1px solid ${D.border}`,borderRadius:5,padding:"4px 6px",color:D.text,fontSize:11,outline:"none"}}>
                      {OPS.map(o=><option key={o.id} value={o.id} style={{background:D.card}}>{o.name}</option>)}
                    </select>
                  </div>
                  <div style={{marginBottom:5}}>
                    <div style={{fontSize:9,color:D.muted,marginBottom:2}}>Профиль</div>
                    <ProfileSel it={it}/>
                  </div>
                  <div style={{marginBottom:5}}>
                    <div style={{fontSize:9,color:D.muted,marginBottom:2}}>Стекло (доплата)</div>
                    <select value={it.glass} onChange={e=>upd(it.id,"glass",e.target.value)}
                      style={{width:"100%",background:D.bg,border:`1px solid ${D.border}`,borderRadius:5,padding:"4px 6px",color:D.text,fontSize:11,outline:"none"}}>
                      {DG.map(g=><option key={g.id} value={g.id} style={{background:D.card}}>{g.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{fontSize:9,color:D.muted,marginBottom:2}}>Москитная сетка</div>
                    <select value={it.screen} onChange={e=>upd(it.id,"screen",e.target.value)}
                      style={{width:"100%",background:D.bg,border:`1px solid ${D.border}`,borderRadius:5,padding:"4px 6px",color:D.text,fontSize:11,outline:"none"}}>
                      {DS.map(s=><option key={s.id} value={s.id} style={{background:D.card}}>{s.name}</option>)}
                    </select>
                  </div>
                  <div style={{marginTop:5}}>
                    <div style={{fontSize:9,color:D.muted,marginBottom:2}}>Роллет / тришс</div>
                    <select value={it.shutter} onChange={e=>upd(it.id,"shutter",e.target.value)}
                      style={{width:"100%",background:D.bg,border:`1px solid ${D.border}`,borderRadius:5,padding:"4px 6px",color:it.shutter!=="none"?D.yellow:D.muted,fontSize:11,outline:"none",fontWeight:it.shutter!=="none"?700:400}}>
                      {DSHT.map(s=><option key={s.id} value={s.id} style={{background:D.card,color:D.text}}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
                {/* Col 3: Breakdown */}
                <div>
                  <div style={{fontSize:10,color:D.muted,fontWeight:700,textTransform:"uppercase",marginBottom:6}}>
                    {tab==="detailed"?"Детальный расчёт":"Итог по позиции"}
                  </div>
                  {tab==="detailed"&&it.valid&&(
                    <>
                      {[["База Dekel",fmt(Math.round(it.baseDekel)),"code",it.code],
                        it.glassAddon>0&&["Стекло",fmt(Math.round(it.glassAddon)),"",""],
                        it.screenAddon>0&&["Сетка",fmt(Math.round(it.screenAddon)),"",""],
                        it.shutterAddon>0&&["Роллет",fmt(Math.round(it.shutterAddon)),"",""],
                        ["× монтаж",`×${it.install.toFixed(2)}`,"",''],
                      ].filter(Boolean).map((r,i)=>(
                        <div key={i} style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                          <span style={{fontSize:11,color:D.muted}}>{r[0]}</span>
                          <span style={{fontSize:11,color:D.text,fontWeight:600}}>{r[1]}</span>
                        </div>
                      ))}
                      {it.code!=="—"&&<div style={{background:D.accent+"15",borderRadius:5,padding:"3px 6px",fontSize:9,color:D.accentLight,marginTop:4,fontFamily:"monospace"}}>{it.code}</div>}
                    </>
                  )}
                  {!it.valid&&<div style={{fontSize:11,color:D.red}}>⚠️ Нет данных Dekel для этого профиля и площади</div>}
                  {it.valid&&(
                    <div style={{marginTop:6,padding:"8px",background:D.surface,borderRadius:8}}>
                      <div style={{fontSize:10,color:D.muted}}>Себест. за 1 шт</div>
                      <div style={{fontSize:13,fontWeight:800,color:D.text}}>{fmt(Math.round(it.totalCost/it.qty))}</div>
                      <div style={{fontSize:10,color:D.muted,marginTop:4}}>Монтаж</div>
                      <input type="range" min={1.0} max={1.3} step={0.01} value={it.install}
                        onChange={e=>upd(it.id,"install",+e.target.value)}
                        style={{width:"100%",accentColor:D.accent,margin:"3px 0"}}/>
                      <div style={{fontSize:10,color:D.muted,display:"flex",justifyContent:"space-between"}}>
                        <span>×1.00</span><b style={{color:D.accentLight}}>×{it.install.toFixed(2)}</b><span>×1.30</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: summary */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>

        {/* Extras / Surcharges */}
        <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,padding:16}}>
          <div style={{fontSize:10,fontWeight:800,color:D.muted,textTransform:"uppercase",marginBottom:10}}>
            Доплаты
            {extrasCost>0&&<span style={{marginLeft:8,color:D.yellow,fontWeight:900}}>{fmt(Math.round(extrasCost))}</span>}
          </div>
          {/* Demolition */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:12,color:extras.demolition?D.text:D.muted}}>
              <input type="checkbox" checked={extras.demolition} onChange={e=>setExtras(p=>({...p,demolition:e.target.checked}))} style={{accentColor:D.accent}}/>
              🔨 Демонтаж
            </label>
            {extras.demolition&&<input type="number" value={extras.demolitionPrice}
              onChange={e=>setExtras(p=>({...p,demolitionPrice:+e.target.value||0}))}
              style={{width:75,background:D.bg,border:`1px solid ${D.border}`,borderRadius:6,padding:"3px 6px",color:D.yellow,fontSize:12,fontWeight:700,outline:"none",textAlign:"right"}}/>}
          </div>
          {/* Crane */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:12,color:extras.crane?D.text:D.muted}}>
              <input type="checkbox" checked={extras.crane} onChange={e=>setExtras(p=>({...p,crane:e.target.checked}))} style={{accentColor:D.accent}}/>
              🏗️ Кран
            </label>
            {extras.crane&&<input type="number" value={extras.cranePrice}
              onChange={e=>setExtras(p=>({...p,cranePrice:+e.target.value||0}))}
              style={{width:75,background:D.bg,border:`1px solid ${D.border}`,borderRadius:6,padding:"3px 6px",color:D.yellow,fontSize:12,fontWeight:700,outline:"none",textAlign:"right"}}/>}
          </div>
          {/* Floor surcharge */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <label style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:D.muted}}>
              🏢 Этаж
            </label>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <input type="number" value={extras.floor} min={1} max={50}
                onChange={e=>{const fl=parseInt(e.target.value)||1;
                  const hp=fl>=5?800*Math.max(0,fl-4):fl>=3?400:0;
                  setExtras(p=>({...p,floor:String(fl),highFloorPrice:hp}));}}
                style={{width:50,background:D.bg,border:`1px solid ${D.border}`,borderRadius:6,padding:"3px 6px",color:D.text,fontSize:12,fontWeight:700,outline:"none",textAlign:"center"}}/>
              {extras.highFloorPrice>0&&<span style={{fontSize:11,color:D.yellow,fontWeight:700}}>+{fmt(extras.highFloorPrice)}</span>}
            </div>
          </div>
          {/* Wall type — info only */}
          {extras.wallType&&<div style={{fontSize:10,color:D.muted,marginTop:4}}>🧱 {extras.wallType}</div>}
        </div>

        {/* Shutter market factor */}
        {calced.some(c=>c.shutter!=="none")&&(
          <div style={{background:D.card,border:`1px solid ${D.yellow}40`,borderRadius:14,padding:16}}>
            <div style={{fontSize:10,fontWeight:800,color:D.yellow,textTransform:"uppercase",marginBottom:8}}>
              Коэфф. роллет (рынок vs Dekel)
            </div>
            <input type="range" min={1.0} max={2.0} step={0.01} value={shutterFactor}
              onChange={e=>setShutterFactor(+e.target.value)}
              style={{width:"100%",accentColor:D.yellow,marginBottom:4}}/>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:D.muted}}>
              <span>×1.00</span>
              <div style={{textAlign:"center"}}>
                <b style={{color:D.yellow,fontSize:15}}>×{shutterFactor.toFixed(2)}</b>
                <div style={{fontSize:9,color:D.muted}}>Рекомендовано ×1.38</div>
              </div>
              <span>×2.00</span>
            </div>
          </div>
        )}

        {/* Margin */}
        <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,padding:16}}>
          <div style={{fontSize:10,fontWeight:800,color:D.muted,textTransform:"uppercase",marginBottom:10}}>Маржа %</div>
          <input type="range" min={15} max={80} value={margin} onChange={e=>setMargin(+e.target.value)} style={{width:"100%",accentColor:D.accent,marginBottom:4}}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:D.muted}}>
            <span>15%</span><b style={{color:D.accentLight,fontSize:14}}>{margin}%</b><span>80%</span>
          </div>
        </div>
        {/* Totals */}
        <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,padding:16}}>
          {[["Окна (себест.)",fmt(Math.round(itemsCost)),D.muted],
            extrasCost>0&&["Доплаты",fmt(Math.round(extrasCost)),D.yellow],
            ["Итого себест.",fmt(Math.round(totalCost)),D.muted],
            ["Цена продажи",fmt(saleTotal),D.text],
            ["Прибыль",fmt(Math.round(profit)),D.green],
            ["Маржа",saleTotal>0?Math.round(profit/saleTotal*100)+"%":"—",D.green],
          ].filter(Boolean).map(([l,v,c])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <span style={{fontSize:11,color:D.muted}}>{l}</span>
              <span style={{fontSize:13,fontWeight:700,color:c}}>{v}</span>
            </div>
          ))}
        </div>
        {/* Payment split */}
        <div style={{background:"linear-gradient(135deg,#1D4ED8,#1E3A8A)",borderRadius:14,padding:16}}>
          <div style={{fontSize:11,fontWeight:800,color:"#93C5FD",marginBottom:8}}>ИТОГО КП</div>
          <div style={{fontSize:28,fontWeight:900,color:"#fff",letterSpacing:"-0.04em"}}>{fmt(saleTotal)}</div>
          <div style={{fontSize:11,color:"#93C5FD",marginTop:2}}>{items.reduce((s,i)=>s+i.qty,0)} позиций</div>
          {/* Split slider */}
          <div style={{marginTop:12,marginBottom:4}}>
            <div style={{fontSize:10,color:"#93C5FD",marginBottom:4}}>Разбивка оплаты: {split}% / {100-split}%</div>
            <input type="range" min={10} max={90} step={5} value={split} onChange={e=>setSplit(+e.target.value)}
              style={{width:"100%",accentColor:"#93C5FD"}}/>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#93C5FD44",marginTop:2}}>
              <span>10%</span><span>50%</span><span>90%</span>
            </div>
          </div>
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <div style={{flex:1,background:"#ffffff18",borderRadius:8,padding:"8px",textAlign:"center"}}>
              <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>{fmt(pay1)}</div>
              <div style={{fontSize:9,color:"#93C5FD"}}>Предоплата {split}%</div>
            </div>
            <div style={{flex:1,background:"#ffffff18",borderRadius:8,padding:"8px",textAlign:"center"}}>
              <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>{fmt(pay2)}</div>
              <div style={{fontSize:9,color:"#93C5FD"}}>При монтаже {100-split}%</div>
            </div>
          </div>
        </div>
        {/* Create order */}
        <Btn onClick={createOrder} variant="success" style={{width:"100%",justifyContent:"center"}}>
          <ShoppingCart size={14}/> Создать заказ
        </Btn>
        {tab==="detailed"&&(
          <div style={{background:D.surface,border:`1px solid ${D.border}`,borderRadius:10,padding:12}}>
            <div style={{fontSize:10,fontWeight:800,color:D.muted,textTransform:"uppercase",marginBottom:8}}>3 сценария</div>
            {[["Пессимизм ×1.10",Math.round(totalCost/1.13*1.10*(1+margin/100))],
              ["База ×1.13",saleTotal],
              ["Оптимизм ×1.17",Math.round(totalCost/1.13*1.17*(1+margin/100))],
            ].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:11,color:D.muted}}>{l}</span>
                <span style={{fontSize:12,fontWeight:700,color:D.text}}>{fmt(v)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    {/* BOM — Bill of Materials */}
    {calced.some(c=>c.valid)&&(<div style={{marginTop:24}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:14,fontWeight:800,color:D.text}}>📦 BOM — Список материалов</div>
        <Btn onClick={()=>{
          const rows=[];
          let totalProf=0,totalGlass=0,totalSeals=0;
          calced.filter(c=>c.valid).forEach(c=>{
            const profM=(2*(c.w+c.h)/100*1.15*c.qty).toFixed(2);
            const glassM2=(c.area*c.qty).toFixed(2);
            const sealM=(2*(c.w+c.h)/100*c.qty).toFixed(2);
            totalProf+=parseFloat(profM);totalGlass+=parseFloat(glassM2);totalSeals+=parseFloat(sealM);
            rows.push([c.name,PNAMES[c.profile]||c.profile,profM+" м.п.",glassM2+" м²",sealM+" м.п.",
              c.screen!=="none"?c.qty+"шт":"—",c.shutter!=="none"?glassM2+" м²":"—"]);
          });
          rows.push(["ИТОГО","","","","","",""]);
          exportCSV(["Позиция","Профиль","Профиль (м.п.)","Стекло (м²)","Уплотнитель (м.п.)","Сетка (шт)","Роллет (м²)"],rows,"BOM.csv");
        }} variant="ghost"><Download size={13}/> CSV</Btn>
      </div>
      <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"1.5fr 1.5fr 1fr 1fr 1fr 1fr 1fr",padding:"7px 14px",background:D.surface,gap:10}}>
          {["Позиция","Профиль","Профиль м.п.","Стекло м²","Уплотнитель","Сетки","Роллеты"].map((h,i)=>(
            <div key={i} style={{fontSize:9,fontWeight:800,color:D.muted,textTransform:"uppercase"}}>{h}</div>
          ))}
        </div>
        {calced.filter(c=>c.valid).map((c,i)=>{
          const profM=(2*(c.w+c.h)/100*1.15*c.qty).toFixed(2);
          const glassM2=(c.area*c.qty).toFixed(2);
          const sealM=(2*(c.w+c.h)/100*c.qty).toFixed(2);
          const screenOpt=DS.find(s=>s.id===c.screen)||DS[0];
          const shutterOpt=DSHT.find(s=>s.id===c.shutter)||DSHT[0];
          return(<div key={c.id} style={{display:"grid",gridTemplateColumns:"1.5fr 1.5fr 1fr 1fr 1fr 1fr 1fr",
            padding:"9px 14px",gap:10,borderTop:`1px solid ${D.border}`,background:i%2===0?D.card:D.surface,alignItems:"center"}}>
            <div style={{fontSize:12,fontWeight:700,color:D.text}}>{c.name}<div style={{fontSize:10,color:D.muted}}>{c.qty} шт</div></div>
            <div style={{fontSize:11,color:D.muted}}>{PNAMES[c.profile]||c.profile}</div>
            <div style={{fontSize:12,fontWeight:700,color:D.accentLight}}>{profM} м.п.</div>
            <div style={{fontSize:12,fontWeight:700,color:D.teal}}>{glassM2} м²</div>
            <div style={{fontSize:12,color:D.muted}}>{sealM} м.п.</div>
            <div style={{fontSize:11,color:c.screen!=="none"?D.green:D.muted}}>{c.screen!=="none"?`${c.qty} шт (${screenOpt.name})`:"—"}</div>
            <div style={{fontSize:11,color:c.shutter!=="none"?D.yellow:D.muted}}>{c.shutter!=="none"?`${glassM2} м² (${shutterOpt.name})`:"—"}</div>
          </div>);
        })}
        {/* Totals row */}
        {(()=>{
          const tp=calced.filter(c=>c.valid).reduce((s,c)=>s+2*(c.w+c.h)/100*1.15*c.qty,0);
          const tg=calced.filter(c=>c.valid).reduce((s,c)=>s+c.area*c.qty,0);
          const ts=calced.filter(c=>c.valid).reduce((s,c)=>s+2*(c.w+c.h)/100*c.qty,0);
          const tsc=calced.filter(c=>c.valid&&c.screen!=="none").reduce((s,c)=>s+c.qty,0);
          const tsh=calced.filter(c=>c.valid&&c.shutter!=="none").reduce((s,c)=>s+c.area*c.qty,0);
          return(<div style={{display:"grid",gridTemplateColumns:"1.5fr 1.5fr 1fr 1fr 1fr 1fr 1fr",
            padding:"9px 14px",gap:10,borderTop:`2px solid ${D.border}`,background:D.surface}}>
            <div style={{fontSize:11,fontWeight:800,color:D.text,gridColumn:"span 2"}}>ИТОГО</div>
            <div style={{fontSize:13,fontWeight:800,color:D.accentLight}}>{tp.toFixed(1)} м.п.</div>
            <div style={{fontSize:13,fontWeight:800,color:D.teal}}>{tg.toFixed(2)} м²</div>
            <div style={{fontSize:12,fontWeight:700,color:D.muted}}>{ts.toFixed(1)} м.п.</div>
            <div style={{fontSize:12,fontWeight:700,color:D.green}}>{tsc>0?`${tsc} шт`:"—"}</div>
            <div style={{fontSize:12,fontWeight:700,color:D.yellow}}>{tsh>0?`${tsh.toFixed(2)} м²`:"—"}</div>
          </div>);
        })()}
      </div>
    </div>)}
  </div>);
}
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// PRINT ACT (תעודת גמר)
// ═══════════════════════════════════════════════════════════════
function printAct(inst,order){
  const date=new Date().toLocaleDateString("he-IL");
  const checks=inst.checklist||[];
  const rows=CHECKLIST_STEPS.map((s,i)=>`<tr>
    <td style="text-align:center;width:32px">${checks[i]?'<span style="color:#16a34a;font-size:16px">✓</span>':'<span style="color:#dc2626;font-size:16px">✗</span>'}</td>
    <td>${s}</td>
    <td style="text-align:center;color:${checks[i]?"#16a34a":"#dc2626"};font-weight:700">${checks[i]?"בוצע":"לא בוצע"}</td>
  </tr>`).join("");
  const html=`<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="UTF-8"/>
  <title>תעודת גמר – ${inst.client}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Arial',sans-serif;direction:rtl;color:#1e293b;background:#fff;padding:36px;font-size:13px}
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:18px;border-bottom:3px solid #2563eb}
    .logo{font-size:22px;font-weight:900;color:#2563eb}
    .logo-sub{font-size:11px;color:#64748b;margin-top:3px}
    .meta{text-align:left;font-size:12px;color:#64748b;line-height:1.9}
    h2{font-size:13px;font-weight:800;color:#1e293b;background:#f1f5f9;border-right:4px solid #2563eb;padding:8px 14px;border-radius:4px;margin-bottom:14px}
    .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:22px}
    .info-box{border:1px solid #e2e8f0;border-radius:8px;padding:14px}
    .info-box label{font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;display:block;margin-bottom:4px}
    .info-box b{font-size:14px;color:#1e293b}
    table{width:100%;border-collapse:collapse;margin-bottom:22px}
    th{background:#1e293b;color:#fff;padding:8px 12px;text-align:right;font-size:11px}
    td{padding:9px 12px;border-bottom:1px solid #e2e8f0}
    tr:nth-child(even) td{background:#f8fafc}
    .sign-section{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-top:30px}
    .sign-box{border-top:2px solid #1e293b;padding-top:10px;text-align:center;font-size:12px;color:#64748b}
    .footer{font-size:10px;color:#94a3b8;text-align:center;padding-top:16px;border-top:1px solid #e2e8f0;margin-top:24px}
    .stamp{width:80px;height:80px;border:3px solid #2563eb;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 10px;color:#2563eb;font-size:11px;font-weight:800;text-align:center;line-height:1.3}
    @media print{body{padding:20px}}
  </style></head><body>
  <div class="header">
    <div><div class="logo">🏭 חלונות אלומיניום</div>
      <div class="logo-sub">ייצור והתקנה של חלונות ודלתות אלומיניום</div></div>
    <div class="meta">
      <div><b style="font-size:16px">תעודת גמר</b></div>
      <div>מספר: <b>${inst.id||"ACT-"+Date.now().toString().slice(-6)}</b></div>
      <div>תאריך: <b>${inst.completedDate||date}</b></div>
    </div>
  </div>
  <div class="info-grid">
    <div class="info-box"><label>לקוח</label><b>${inst.client}</b><div style="font-size:12px;color:#64748b;margin-top:3px">${inst.address||""}</div></div>
    <div class="info-box"><label>הזמנה</label><b>${inst.orderId||"—"}</b>
      <div style="font-size:12px;color:#64748b;margin-top:3px">מתקין: ${inst.specialist||"—"} · ${inst.completedDate||date}</div></div>
    ${order?`<div class="info-box"><label>סכום הזמנה</label><b style="color:#2563eb">₪${order.total?.toLocaleString("he-IL")||"—"}</b></div>`:""}
    ${order?`<div class="info-box"><label>חלונות שהותקנו</label><b>${order.windows||"—"} יחידות</b></div>`:""}
  </div>
  <h2>רשימת בדיקות התקנה</h2>
  <table>
    <thead><tr><th style="width:40px;text-align:center">✓</th><th>פעולה</th><th style="text-align:center">סטטוס</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  ${inst.notes?`<div style="background:#f8fafc;border-radius:8px;padding:14px;margin-bottom:22px;font-size:13px">
    <b>הערות:</b> ${inst.notes}</div>`:""}
  <div class="sign-section">
    <div class="sign-box">
      <div style="height:50px"></div>
      <div>חתימת המתקין</div>
      <div style="margin-top:4px;font-weight:700">${inst.specialist||"___________"}</div>
    </div>
    <div class="sign-box">
      <div style="height:50px"></div>
      <div>חתימת הלקוח לאישור קבלת העבודה</div>
      <div style="margin-top:4px;font-weight:700">${inst.client}</div>
    </div>
  </div>
  <div class="footer">WindowOS · תעודה זו מהווה אישור לביצוע העבודה · ${date}</div>
  </body></html>`;
  const w=window.open("","_blank","width=860,height=700");
  w.document.write(html);w.document.close();
  setTimeout(()=>w.print(),500);
}

// ═══════════════════════════════════════════════════════════════
// INSTALLATION MODULE
// ═══════════════════════════════════════════════════════════════
function Installation({installations,setInstallations,orders}){
  const [modal,setModal]=useState(false);
  const [viewId,setViewId]=useState(null);
  const ef=()=>({client:"",phone:"",address:"",orderId:"",specialist:"",
    scheduledDate:new Date().toISOString().split("T")[0],completedDate:"",
    status:"Запланирован",checklist:CHECKLIST_STEPS.map(()=>false),
    notes:"",photosBefore:[],photosAfter:[]});
  const [form,setForm]=useState(ef());
  const [editId,setEditId]=useState(null);

  const openAdd=()=>{setEditId(null);setForm(ef());setModal(true);};
  const openEdit=i=>{setEditId(i.id);setForm({...i,checklist:[...i.checklist],photosBefore:[...i.photosBefore],photosAfter:[...i.photosAfter]});setModal(true);};
  const submit=()=>{
    if(!form.client)return;
    const rec={...form,id:editId||Date.now()};
    if(editId)setInstallations(p=>p.map(x=>x.id===editId?rec:x));
    else setInstallations(p=>[...p,rec]);
    setModal(false);
  };
  const toggleCheck=(i)=>setForm(f=>({...f,checklist:f.checklist.map((v,idx)=>idx===i?!v:v)}));
  const pickPhotos=(e,field)=>{
    Array.from(e.target.files).forEach(file=>{
      const r=new FileReader();
      r.onload=ev=>setForm(f=>({...f,[field]:[...f[field],{id:Date.now()+Math.random(),name:file.name,data:ev.target.result}]}));
      r.readAsDataURL(file);
    });e.target.value="";
  };
  const doneCount=inst=>inst.checklist.filter(Boolean).length;
  const linked=inst=>{
    if(inst.orderId)return orders.find(o=>o.id===inst.orderId);
    return orders.find(o=>o.client===inst.client);
  };
  const viewInst=installations.find(x=>x.id===viewId);

  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
      <div><div style={{fontSize:22,fontWeight:900,color:D.text}}>Монтаж</div>
        <div style={{fontSize:13,color:D.muted}}>{installations.length} объектов</div></div>
      <Btn onClick={openAdd}><Plus size={13}/> Новый монтаж</Btn>
    </div>
    {/* Stats */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
      <KCard icon={Clock} label="Запланировано" value={installations.filter(i=>i.status==="Запланирован").length} color={D.purple}/>
      <KCard icon={Wrench} label="В процессе" value={installations.filter(i=>i.status==="В процессе").length} color={D.accentLight}/>
      <KCard icon={Check} label="Завершено" value={installations.filter(i=>i.status==="Завершён").length} color={D.green}/>
      <KCard icon={ClipboardCheck} label="Актов выдано" value={installations.filter(i=>i.status==="Завершён").length} color={D.teal}/>
    </div>
    {installations.length===0&&<div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,padding:40,textAlign:"center",color:D.muted}}>Нет монтажей. Нажми «Новый монтаж» чтобы начать.</div>}
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {installations.map(inst=>{
        const done=doneCount(inst);
        const total=CHECKLIST_STEPS.length;
        const pct=Math.round(done/total*100);
        const ord=linked(inst);
        return(<div key={inst.id} style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,padding:"16px 18px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div>
              <div style={{fontSize:15,fontWeight:800,color:D.text}}>{inst.client}</div>
              <div style={{fontSize:11,color:D.muted,marginTop:2}}>{inst.address} · 📅 {inst.scheduledDate} · 👤 {inst.specialist||"—"}</div>
              {ord&&<div style={{fontSize:11,color:D.accentLight,marginTop:2}}>🔗 {ord.id} · {fmt(ord.total)}</div>}
            </div>
            <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
              <select value={inst.status} onChange={e=>setInstallations(p=>p.map(x=>x.id===inst.id?{...x,status:e.target.value}:x))}
                style={{background:(SC[inst.status]||D.muted)+"18",color:SC[inst.status]||D.muted,
                  border:`1px solid ${(SC[inst.status]||D.muted)}40`,borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:700,cursor:"pointer"}}>
                {["Запланирован","В процессе","Завершён"].map(s=><option key={s} value={s} style={{background:D.card,color:D.text}}>{s}</option>)}
              </select>
              <Btn onClick={()=>setViewId(inst.id)} variant="teal" small><Eye size={12}/> Чек-лист</Btn>
              <Btn onClick={()=>printAct(inst,ord)} variant="success" small><Download size={12}/> Акт PDF</Btn>
              <button onClick={()=>openEdit(inst)} style={{background:"none",border:"none",cursor:"pointer",color:D.muted,padding:4}}>✏️</button>
              <button onClick={()=>setInstallations(p=>p.filter(x=>x.id!==inst.id))} style={{background:"none",border:"none",cursor:"pointer",color:D.muted,padding:4}}><Trash2 size={13}/></button>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:12,alignItems:"center"}}>
            <div>
              <div style={{fontSize:9,fontWeight:700,color:D.muted,marginBottom:5,textTransform:"uppercase"}}>Чек-лист {done}/{total}</div>
              <PBar value={pct} color={pct===100?D.green:D.purple}/>
            </div>
            <div style={{fontSize:11,color:D.muted}}>📸 до: {inst.photosBefore.length} · после: {inst.photosAfter.length}</div>
            <div style={{fontSize:11,color:D.muted}}>{inst.completedDate?`✅ ${inst.completedDate}`:"Не завершён"}</div>
          </div>
        </div>);
      })}
    </div>

    {/* VIEW / CHECKLIST MODAL */}
    {viewInst&&(<Modal title={`📋 ${viewInst.client} — Чек-лист`} onClose={()=>setViewId(null)} wide>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        <div>
          <div style={{fontSize:11,fontWeight:800,color:D.muted,textTransform:"uppercase",marginBottom:10}}>Шаги установки ({doneCount(viewInst)}/{CHECKLIST_STEPS.length})</div>
          {CHECKLIST_STEPS.map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:`1px solid ${D.border}`}}>
              <div style={{width:18,height:18,borderRadius:4,background:viewInst.checklist[i]?D.green:D.surface,
                border:`2px solid ${viewInst.checklist[i]?D.green:D.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {viewInst.checklist[i]&&<Check size={11} color="#fff"/>}
              </div>
              <span style={{fontSize:12,color:viewInst.checklist[i]?D.text:D.muted}}>{s}</span>
            </div>
          ))}
        </div>
        <div>
          <div style={{fontSize:11,fontWeight:800,color:D.muted,textTransform:"uppercase",marginBottom:10}}>Фото до установки ({viewInst.photosBefore.length})</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16}}>
            {viewInst.photosBefore.map(p=>(<img key={p.id} src={p.data} alt={p.name} style={{width:80,height:60,objectFit:"cover",borderRadius:6,border:`1px solid ${D.border}`}}/>))}
            {viewInst.photosBefore.length===0&&<div style={{fontSize:11,color:D.muted}}>Нет фото</div>}
          </div>
          <div style={{fontSize:11,fontWeight:800,color:D.muted,textTransform:"uppercase",marginBottom:10}}>Фото после установки ({viewInst.photosAfter.length})</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {viewInst.photosAfter.map(p=>(<img key={p.id} src={p.data} alt={p.name} style={{width:80,height:60,objectFit:"cover",borderRadius:6,border:`1px solid ${D.border}`}}/>))}
            {viewInst.photosAfter.length===0&&<div style={{fontSize:11,color:D.muted}}>Нет фото</div>}
          </div>
          {viewInst.notes&&<div style={{marginTop:14,background:D.surface,borderRadius:8,padding:12,fontSize:12,color:D.muted}}><b style={{color:D.text}}>Заметки:</b> {viewInst.notes}</div>}
          <div style={{marginTop:16,display:"flex",gap:8}}>
            <Btn onClick={()=>printAct(viewInst,linked(viewInst))} variant="success"><Download size={13}/> Акт PDF</Btn>
          </div>
        </div>
      </div>
    </Modal>)}

    {/* ADD/EDIT MODAL */}
    {modal&&(<Modal title={editId?"✏️ Редактировать монтаж":"🔧 Новый монтаж"} onClose={()=>setModal(false)} wide>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Inp label="Клиент *" value={form.client} onChange={e=>setForm(p=>({...p,client:e.target.value}))}/>
        <Inp label="Телефон" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))}/>
      </div>
      <Inp label="Адрес объекта" value={form.address} onChange={e=>setForm(p=>({...p,address:e.target.value}))}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
        <div style={{marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,color:D.muted,marginBottom:4,textTransform:"uppercase"}}>Привязать заказ</div>
          <select value={form.orderId} onChange={e=>{
            const ord=orders.find(o=>o.id===e.target.value);
            setForm(p=>({...p,orderId:e.target.value,client:ord?ord.client:p.client}));
          }} style={{width:"100%",background:D.bg,border:`1px solid ${D.border}`,borderRadius:8,padding:"8px 12px",color:D.text,fontSize:13,outline:"none"}}>
            <option value="" style={{background:D.card}}>— без привязки —</option>
            {orders.map(o=><option key={o.id} value={o.id} style={{background:D.card}}>{o.id} · {o.client}</option>)}
          </select>
        </div>
        <Inp label="Дата монтажа" value={form.scheduledDate} onChange={e=>setForm(p=>({...p,scheduledDate:e.target.value}))} type="date"/>
        <Inp label="Специалист" value={form.specialist} onChange={e=>setForm(p=>({...p,specialist:e.target.value}))}/>
      </div>
      {/* Checklist */}
      <div style={{marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:700,color:D.muted,textTransform:"uppercase",marginBottom:8}}>Чек-лист ({form.checklist.filter(Boolean).length}/{CHECKLIST_STEPS.length})</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
          {CHECKLIST_STEPS.map((s,i)=>(
            <label key={i} style={{display:"flex",alignItems:"center",gap:7,padding:"5px 8px",borderRadius:6,
              cursor:"pointer",background:form.checklist[i]?D.green+"15":D.surface,border:`1px solid ${form.checklist[i]?D.green+"40":D.border}`}}>
              <input type="checkbox" checked={form.checklist[i]} onChange={()=>toggleCheck(i)} style={{accentColor:D.green}}/>
              <span style={{fontSize:11,color:form.checklist[i]?D.text:D.muted}}>{s}</span>
            </label>
          ))}
        </div>
      </div>
      {/* Photos */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <div>
          <div style={{fontSize:10,fontWeight:700,color:D.muted,textTransform:"uppercase",marginBottom:6}}>Фото ДО ({form.photosBefore.length})</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:6}}>
            {form.photosBefore.map(p=>(<img key={p.id} src={p.data} alt="" style={{width:56,height:44,objectFit:"cover",borderRadius:5}}/>))}
          </div>
          <label style={{display:"inline-flex",alignItems:"center",gap:5,background:D.surface,border:`1px dashed ${D.border}`,borderRadius:7,padding:"5px 10px",cursor:"pointer",fontSize:11,color:D.muted}}>
            <Image size={12}/> Добавить
            <input type="file" accept="image/*" multiple style={{display:"none"}} onChange={e=>pickPhotos(e,"photosBefore")}/>
          </label>
        </div>
        <div>
          <div style={{fontSize:10,fontWeight:700,color:D.muted,textTransform:"uppercase",marginBottom:6}}>Фото ПОСЛЕ ({form.photosAfter.length})</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:6}}>
            {form.photosAfter.map(p=>(<img key={p.id} src={p.data} alt="" style={{width:56,height:44,objectFit:"cover",borderRadius:5}}/>))}
          </div>
          <label style={{display:"inline-flex",alignItems:"center",gap:5,background:D.surface,border:`1px dashed ${D.border}`,borderRadius:7,padding:"5px 10px",cursor:"pointer",fontSize:11,color:D.muted}}>
            <Image size={12}/> Добавить
            <input type="file" accept="image/*" multiple style={{display:"none"}} onChange={e=>pickPhotos(e,"photosAfter")}/>
          </label>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
        <Inp label="Дата завершения" value={form.completedDate} onChange={e=>setForm(p=>({...p,completedDate:e.target.value}))} type="date"/>
        <Sel label="Статус" value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))} options={["Запланирован","В процессе","Завершён"]}/>
      </div>
      <Inp label="Заметки / Замечания" value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}/>
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={submit}><Check size={13}/> {editId?"Сохранить":"Создать"}</Btn>
        <Btn onClick={()=>setModal(false)} variant="ghost">Отмена</Btn>
      </div>
    </Modal>)}
  </div>);
}

// ═══════════════════════════════════════════════════════════════
// ORDERS (with P&L)
// ═══════════════════════════════════════════════════════════════
function Orders({orders,setOrders,setPayments}){
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({client:"",city:"",windows:"1",total:"",delivery:""});
  const [plModal,setPlModal]=useState(null); // orderId with P&L open
  const [plData,setPlData]=useState({}); // {orderId: {materialsCost,laborCost,extrasCost,notes}}

  const addOrder=()=>{
    if(!form.client||!form.total)return;
    const id="WB-"+String(orders.length+1).padStart(3,"0");
    setOrders(p=>[...p,{...form,id,windows:+form.windows||1,total:+form.total,paid:0,
      status:"Ожидает материалов",progress:10,created:new Date().toISOString().split("T")[0]}]);
    setModal(false);setForm({client:"",city:"",windows:"1",total:"",delivery:""});
  };
  const updStatus=(id,status)=>setOrders(p=>p.map(o=>o.id===id?{...o,status,progress:PM[status]||o.progress}:o));
  const addPay=o=>{
    const amount=o.total-o.paid;if(amount<=0)return;
    setPayments(p=>[...p,{id:Date.now(),order:o.id,client:o.client,type:"Финальный",
      amount,date:new Date().toISOString().split("T")[0],method:"Банк",status:"Ожидается"}]);
    setOrders(p=>p.map(x=>x.id===o.id?{...x,paid:o.total}:x));
  };
  const getPl=(id)=>plData[id]||{materialsCost:"",laborCost:"",extrasCost:"",notes:""};
  const setPl=(id,k,v)=>setPlData(p=>({...p,[id]:{...getPl(id),[k]:v}}));

  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
      <div><div style={{fontSize:22,fontWeight:900,color:D.text}}>Заказы</div>
        <div style={{fontSize:13,color:D.muted}}>{orders.length} заказов</div></div>
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={()=>exportCSV(["ID","Клиент","Сумма","Оплачено","Статус"],orders.map(o=>[o.id,o.client,o.total,o.paid,o.status]),"заказы.csv")} variant="ghost"><Download size={13}/> CSV</Btn>
        <Btn onClick={()=>setModal(true)}><Plus size={13}/> Новый заказ</Btn>
      </div>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {orders.map(o=>{
        const debt=o.total-o.paid;
        const pl=getPl(o.id);
        const matC=+pl.materialsCost||0;
        const labC=+pl.laborCost||0;
        const extC=+pl.extrasCost||0;
        const totalCost=matC+labC+extC;
        const profit=o.paid-totalCost;
        const margin=o.paid>0?Math.round(profit/o.paid*100):0;
        const hasPl=matC>0||labC>0||extC>0;
        return(<div key={o.id} style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,padding:"18px 20px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
            <div style={{display:"flex",gap:12,alignItems:"center"}}>
              <div style={{background:D.accent+"20",border:`1px solid ${D.accent}40`,borderRadius:8,padding:"3px 10px",fontSize:11,fontWeight:800,color:D.accentLight}}>{o.id}</div>
              <div><div style={{fontSize:15,fontWeight:800,color:D.text}}>{o.client}</div>
                <div style={{fontSize:11,color:D.muted}}>{o.city} · {o.windows} окон · Сдача: {o.delivery}</div></div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              {o.status!=="Завершён"&&debt>0&&<Btn onClick={()=>addPay(o)} variant="success" small><Plus size={11}/> Платёж</Btn>}
              <Btn onClick={()=>setPlModal(plModal===o.id?null:o.id)} variant={hasPl?"teal":"ghost"} small>
                <BarChart2 size={11}/> P&L
              </Btn>
              <select value={o.status} onChange={e=>updStatus(o.id,e.target.value)}
                style={{background:(SC[o.status]||D.muted)+"18",color:SC[o.status]||D.muted,
                  border:`1px solid ${(SC[o.status]||D.muted)}40`,borderRadius:8,padding:"5px 10px",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                {OST.map(s=><option key={s} value={s} style={{background:D.card,color:D.text}}>{s}</option>)}
              </select>
            </div>
          </div>
          {/* Financials row */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 2fr",gap:16,alignItems:"center"}}>
            {[["Сумма КП",fmt(o.total),D.text],["Получено",fmt(o.paid),D.green],["Остаток",fmt(debt),debt>0?D.yellow:D.green]].map(([l,v,c])=>(
              <div key={l}><div style={{fontSize:9,color:D.muted,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>{l}</div>
                <div style={{fontSize:18,fontWeight:800,color:c}}>{v}</div></div>
            ))}
            <div><div style={{fontSize:9,color:D.muted,fontWeight:700,textTransform:"uppercase",marginBottom:6}}>Прогресс {o.progress}%</div>
              <PBar value={o.progress} color={o.progress===100?D.green:o.progress>50?D.purple:D.accent}/></div>
          </div>
          {/* P&L Panel */}
          {plModal===o.id&&(<div style={{marginTop:16,borderTop:`1px solid ${D.border}`,paddingTop:16}}>
            <div style={{fontSize:11,fontWeight:800,color:D.muted,textTransform:"uppercase",marginBottom:12}}>📊 P&L — Реальные затраты</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12,marginBottom:14}}>
              {[["💰 Материалы ₪","materialsCost"],["👷 Труд / субподряд ₪","laborCost"],["🔧 Доп. расходы ₪","extrasCost"]].map(([l,k])=>(
                <div key={k}>
                  <div style={{fontSize:10,color:D.muted,fontWeight:700,marginBottom:4,textTransform:"uppercase"}}>{l}</div>
                  <input type="number" value={pl[k]} onChange={e=>setPl(o.id,k,e.target.value)} placeholder="0"
                    style={{width:"100%",background:D.bg,border:`1px solid ${D.border}`,borderRadius:8,padding:"7px 10px",color:D.text,fontSize:13,fontWeight:700,outline:"none"}}/>
                </div>
              ))}
              <div style={{background:hasPl?(profit>=0?D.green+"15":D.red+"15"):D.surface,
                border:`1px solid ${hasPl?(profit>=0?D.green:D.red)+"40":D.border}`,
                borderRadius:10,padding:"10px 12px",display:"flex",flexDirection:"column",justifyContent:"center"}}>
                <div style={{fontSize:9,color:D.muted,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Прибыль (факт)</div>
                <div style={{fontSize:20,fontWeight:900,color:hasPl?(profit>=0?D.green:D.red):D.muted}}>{hasPl?fmt(profit):"—"}</div>
                {hasPl&&<div style={{fontSize:11,color:D.muted,marginTop:2}}>Маржа {margin}%</div>}
              </div>
            </div>
            {hasPl&&totalCost>0&&(<div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:12}}>
              {[["Выручка",fmt(o.paid),D.text],
                ["Материалы",fmt(matC),D.muted],
                ["Труд",fmt(labC),D.muted],
                ["Прочее",fmt(extC),D.muted],
                ["Себест. итого",fmt(totalCost),D.yellow],
              ].map(([l,v,c])=>(
                <div key={l} style={{background:D.surface,borderRadius:8,padding:"8px 10px",textAlign:"center"}}>
                  <div style={{fontSize:9,color:D.muted,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>{l}</div>
                  <div style={{fontSize:13,fontWeight:800,color:c}}>{v}</div>
                </div>
              ))}
            </div>)}
            <input placeholder="Заметки по затратам..." value={pl.notes} onChange={e=>setPl(o.id,"notes",e.target.value)}
              style={{width:"100%",background:D.bg,border:`1px solid ${D.border}`,borderRadius:8,padding:"7px 12px",color:D.text,fontSize:12,outline:"none",boxSizing:"border-box"}}/>
          </div>)}
        </div>);
      })}
    </div>
    {modal&&(<Modal title="📦 Новый заказ" onClose={()=>setModal(false)}>
      <Inp label="Клиент *" value={form.client} onChange={e=>setForm(p=>({...p,client:e.target.value}))}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Inp label="Город" value={form.city} onChange={e=>setForm(p=>({...p,city:e.target.value}))}/>
        <Inp label="Кол-во окон" value={form.windows} onChange={e=>setForm(p=>({...p,windows:e.target.value}))} type="number"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Inp label="Сумма ₪ *" value={form.total} onChange={e=>setForm(p=>({...p,total:e.target.value}))} type="number"/>
        <Inp label="Дата сдачи" value={form.delivery} onChange={e=>setForm(p=>({...p,delivery:e.target.value}))} type="date"/>
      </div>
      {form.total&&<div style={{background:D.surface,borderRadius:8,padding:12,marginBottom:12,fontSize:12,color:D.muted}}>
        Предоплата 40%: <b style={{color:D.green}}>{fmt(+form.total*0.4)}</b> · Остаток: <b style={{color:D.yellow}}>{fmt(+form.total*0.6)}</b>
      </div>}
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={addOrder}><Check size={13}/> Создать</Btn>
        <Btn onClick={()=>setModal(false)} variant="ghost">Отмена</Btn>
      </div>
    </Modal>)}
  </div>);
}

// ═══════════════════════════════════════════════════════════════
// INVENTORY
// ═══════════════════════════════════════════════════════════════
function Inventory({inventory,setInventory}){
  const low=inventory.filter(i=>i.qty<i.minQty);
  const cats=[...new Set(inventory.map(i=>i.category))];
  const upd=(id,d)=>setInventory(p=>p.map(i=>i.id===id?{...i,qty:Math.max(0,i.qty+d)}:i));
  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
      <div><div style={{fontSize:22,fontWeight:900,color:D.text}}>Склад</div>
        <div style={{fontSize:13,color:D.muted}}>{inventory.length} позиций {low.length>0&&<span style={{color:D.yellow}}>· ⚠️ {low.length} нужно закупить</span>}</div></div>
      <Btn onClick={()=>exportCSV(["Наименование","Ед.","Кол","Мин","Цена"],inventory.map(i=>[i.name,i.unit,i.qty,i.minQty,i.price]),"склад.csv")} variant="ghost"><Download size={13}/> CSV</Btn>
    </div>
    {low.length>0&&(<div style={{background:D.yellow+"15",border:`1px solid ${D.yellow}40`,borderRadius:12,padding:"12px 16px",marginBottom:16}}>
      <div style={{fontSize:11,fontWeight:800,color:D.yellow,marginBottom:6}}>⚠️ ТРЕБУЕТСЯ ЗАКУПКА</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
        {low.map(i=><span key={i.id} style={{background:D.yellow+"20",border:`1px solid ${D.yellow}40`,borderRadius:6,padding:"2px 8px",fontSize:11,color:D.yellow,fontWeight:700}}>{i.name}: {i.qty}/{i.minQty}</span>)}
      </div>
    </div>)}
    {cats.map(cat=>(<div key={cat} style={{marginBottom:18}}>
      <div style={{fontSize:11,fontWeight:800,color:D.muted,textTransform:"uppercase",marginBottom:8}}>{cat}</div>
      <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:12,overflow:"hidden"}}>
        {inventory.filter(i=>i.category===cat).map((i,idx,arr)=>(
          <div key={i.id} style={{display:"grid",gridTemplateColumns:"2.5fr 1fr 1.5fr 1fr 80px",
            padding:"10px 16px",gap:10,alignItems:"center",background:idx%2===0?D.card:D.surface,
            borderBottom:idx<arr.length-1?`1px solid ${D.border}`:"none"}}>
            <div style={{fontSize:13,fontWeight:600,color:i.qty<i.minQty?D.yellow:D.text}}>{i.name}</div>
            <div style={{fontSize:11,color:D.muted}}>{i.unit}</div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <button onClick={()=>upd(i.id,-1)} style={{background:D.border,border:"none",borderRadius:5,width:22,height:22,cursor:"pointer",color:D.text,fontWeight:800}}>−</button>
              <span style={{fontSize:14,fontWeight:800,color:i.qty<i.minQty?D.yellow:D.green,minWidth:30,textAlign:"center"}}>{i.qty}</span>
              <button onClick={()=>upd(i.id,1)} style={{background:D.border,border:"none",borderRadius:5,width:22,height:22,cursor:"pointer",color:D.text,fontWeight:800}}>+</button>
              <span style={{fontSize:10,color:D.muted}}>/ {i.minQty}</span>
            </div>
            <div style={{fontSize:12,color:D.muted}}>{fmt(i.price)}</div>
            <div style={{fontSize:12,fontWeight:700,color:D.text}}>{fmt(i.qty*i.price)}</div>
          </div>
        ))}
      </div>
    </div>))}
  </div>);
}

// ═══════════════════════════════════════════════════════════════
// PAYMENTS
// ═══════════════════════════════════════════════════════════════
function Payments({payments,setPayments}){
  const rcv=payments.filter(p=>p.status==="Получен").reduce((s,p)=>s+p.amount,0);
  const pnd=payments.filter(p=>p.status==="Ожидается").reduce((s,p)=>s+p.amount,0);
  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
      <div><div style={{fontSize:22,fontWeight:900,color:D.text}}>Касса</div>
        <div style={{fontSize:13,color:D.muted}}>{payments.length} транзакций</div></div>
      <Btn onClick={()=>exportCSV(["Заказ","Клиент","Тип","Сумма","Дата","Статус"],payments.map(p=>[p.order,p.client,p.type,p.amount,p.date,p.status]),"касса.csv")} variant="ghost"><Download size={13}/> CSV</Btn>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}}>
      <KCard icon={Check} label="Получено" value={fmt(rcv)} color={D.green}/>
      <KCard icon={Clock} label="Ожидается" value={fmt(pnd)} color={D.yellow}/>
      <KCard icon={DollarSign} label="Транзакций" value={payments.length} color={D.accentLight}/>
    </div>
    <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,overflow:"hidden"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1.5fr 1fr 1fr 1fr 1fr auto",padding:"8px 14px",background:D.surface,gap:10}}>
        {["Заказ","Клиент","Тип","Сумма","Дата","Статус",""].map((h,i)=>(<div key={i} style={{fontSize:9,fontWeight:800,color:D.muted,textTransform:"uppercase"}}>{h}</div>))}
      </div>
      {payments.map((p,i)=>(
        <div key={p.id} style={{display:"grid",gridTemplateColumns:"1fr 1.5fr 1fr 1fr 1fr 1fr auto",
          padding:"11px 14px",gap:10,alignItems:"center",background:i%2===0?D.card:D.surface,borderTop:`1px solid ${D.border}`}}>
          <div style={{fontSize:12,fontWeight:800,color:D.accentLight}}>{p.order}</div>
          <div style={{fontSize:13,color:D.text}}>{p.client}</div>
          <div style={{fontSize:11,color:D.muted}}>{p.type}</div>
          <div style={{fontSize:14,fontWeight:800,color:D.text}}>{fmt(p.amount)}</div>
          <div style={{fontSize:11,color:D.muted}}>{p.date}</div>
          <Badge status={p.status}/>
          {p.status==="Ожидается"
            ?<Btn onClick={()=>setPayments(prev=>prev.map(x=>x.id===p.id?{...x,status:"Получен"}:x))} variant="success" small><Check size={11}/> Получен</Btn>
            :<div style={{width:72}}/>}
        </div>
      ))}
    </div>
  </div>);
}

// ═══════════════════════════════════════════════════════════════
// KPI
// ═══════════════════════════════════════════════════════════════
function KPI({kpi,setKpi,leads,measurements,orders,payments}){
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({month:"Апр",leads:"",measures:"",orders:"",revenue:"",cogs:"",opex:"",adSpend:""});

  // ── Real funnel stats ──
  const fLeads=leads.length;
  const fMeasured=measurements.length;
  const fOrders=orders.length;
  const fWon=leads.filter(l=>l.status==="Закрыт (выиграли)").length;
  const fLost=leads.filter(l=>l.status==="Закрыт (проиграли)").length;
  const convLM=fLeads>0?(fMeasured/fLeads*100).toFixed(0):0;
  const convMO=fMeasured>0?(fOrders/fMeasured*100).toFixed(0):0;
  const convLO=fLeads>0?(fOrders/fLeads*100).toFixed(0):0;
  const winRate=fWon+fLost>0?(fWon/(fWon+fLost)*100).toFixed(0):0;

  // ── Real revenue ──
  const totalPaid=payments.filter(p=>p.status==="Получен").reduce((s,p)=>s+p.amount,0);
  const totalContracted=orders.reduce((s,o)=>s+o.total,0);
  const avgDeal=orders.length>0?Math.round(totalContracted/orders.length):0;

  // ── Source breakdown ──
  const srcMap={};
  leads.forEach(l=>{srcMap[l.source]=(srcMap[l.source]||0)+1;});
  const sources=Object.entries(srcMap).sort((a,b)=>b[1]-a[1]);

  const last=kpi[kpi.length-1]||{revenue:0,cogs:0,opex:0,leads:0,measures:0,orders:0};
  const ebitda=last.revenue-last.cogs-last.opex;
  const addMonth=()=>{
    if(!form.month)return;
    setKpi(p=>[...p,{month:form.month,leads:+form.leads||0,measures:+form.measures||0,
      orders:+form.orders||0,revenue:+form.revenue||0,cogs:+form.cogs||0,opex:+form.opex||0,adSpend:+form.adSpend||0}]);
    setModal(false);
  };

  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
      <div><div style={{fontSize:22,fontWeight:900,color:D.text}}>KPI & Аналитика</div>
        <div style={{fontSize:13,color:D.muted}}>Реальные данные + история</div></div>
      <Btn onClick={()=>setModal(true)}><Plus size={13}/> Добавить месяц</Btn>
    </div>

    {/* Real-time KPIs */}
    <div style={{background:D.card,border:`1px solid ${D.accentLight}30`,borderRadius:14,padding:16,marginBottom:20}}>
      <div style={{fontSize:11,fontWeight:800,color:D.accentLight,textTransform:"uppercase",marginBottom:14}}>
        📊 Реальные показатели (из системы)
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
        <KCard icon={Users} label="Лидов всего" value={fLeads} color={D.accentLight}/>
        <KCard icon={Ruler} label="Замеров" value={fMeasured} color={D.purple}/>
        <KCard icon={ShoppingCart} label="Заказов" value={fOrders} color={D.yellow}/>
        <KCard icon={DollarSign} label="Получено" value={fmt(totalPaid)} color={D.green}/>
      </div>
    </div>

    {/* Funnel conversion */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
      <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,padding:20}}>
        <div style={{fontSize:12,fontWeight:800,color:D.muted,marginBottom:16}}>🎯 ВОРОНКА КОНВЕРСИИ</div>
        {[
          {label:"Лиды",value:fLeads,color:D.accentLight},
          {label:"Замеры",value:fMeasured,color:D.purple},
          {label:"Заказы",value:fOrders,color:D.yellow},
          {label:"Закрыто (выиграли)",value:fWon,color:D.green},
        ].map(({label,value,color})=>(
          <div key={label} style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
              <span style={{fontSize:12,color:D.muted}}>{label}</span>
              <span style={{fontSize:14,fontWeight:900,color}}>{value}</span>
            </div>
            <div style={{background:D.surface,borderRadius:6,height:10,overflow:"hidden"}}>
              <div style={{width:fLeads>0?`${value/fLeads*100}%`:"0%",height:"100%",
                background:`linear-gradient(90deg,${color},${color}88)`,borderRadius:6,transition:"width 0.5s"}}/>
            </div>
          </div>
        ))}
        {/* Conversion rates */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:8}}>
          {[
            ["Лид→Замер",convLM+"%",D.purple],
            ["Замер→Заказ",convMO+"%",D.yellow],
            ["Лид→Заказ",convLO+"%",D.green],
            ["Win Rate",winRate+"%",D.teal],
          ].map(([l,v,c])=>(
            <div key={l} style={{background:D.surface,borderRadius:8,padding:"8px 6px",textAlign:"center"}}>
              <div style={{fontSize:18,fontWeight:900,color:c}}>{v}</div>
              <div style={{fontSize:9,color:D.muted,fontWeight:700,marginTop:2,textTransform:"uppercase"}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {/* Avg deal + pipeline */}
        <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,padding:16}}>
          <div style={{fontSize:12,fontWeight:800,color:D.muted,marginBottom:12}}>💰 ФИНАНСЫ</div>
          {[
            ["Средний чек",fmt(avgDeal),D.yellow],
            ["Контрактов",fmt(totalContracted),D.text],
            ["Получено",fmt(totalPaid),D.green],
            ["Ожидается",fmt(totalContracted-totalPaid),D.yellow],
          ].map(([l,v,c])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <span style={{fontSize:11,color:D.muted}}>{l}</span>
              <span style={{fontSize:13,fontWeight:800,color:c}}>{v}</span>
            </div>
          ))}
        </div>

        {/* Source breakdown */}
        {sources.length>0&&(<div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,padding:16}}>
          <div style={{fontSize:12,fontWeight:800,color:D.muted,marginBottom:12}}>📣 ИСТОЧНИКИ ЛИДОВ</div>
          {sources.slice(0,5).map(([src,cnt])=>(
            <div key={src} style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                <span style={{fontSize:11,color:D.muted}}>{src}</span>
                <span style={{fontSize:11,fontWeight:700,color:D.text}}>{cnt} ({fLeads>0?Math.round(cnt/fLeads*100):0}%)</span>
              </div>
              <div style={{background:D.surface,borderRadius:3,height:4}}>
                <div style={{width:`${fLeads>0?cnt/fLeads*100:0}%`,height:"100%",borderRadius:3,background:D.accentLight}}/>
              </div>
            </div>
          ))}
        </div>)}
      </div>
    </div>

    {/* Historical KPI chart */}
    {kpi.length>0&&(<>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16,marginBottom:16}}>
        <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,padding:20}}>
          <div style={{fontSize:12,fontWeight:800,color:D.muted,marginBottom:14}}>💹 ИСТОРИЯ: ВЫРУЧКА / EBITDA</div>
          <ResponsiveContainer width="100%" height={180}>
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
          <div style={{fontSize:12,fontWeight:800,color:D.muted,marginBottom:14}}>📈 ИСТОРИЯ: ЛИДЫ / ЗАКАЗЫ</div>
          <ResponsiveContainer width="100%" height={180}>
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
          {["Месяц","Лиды","Замеры","Заказы","Выручка","Себест.","OPEX","EBITDA"].map((h,i)=>(<div key={i} style={{fontSize:9,fontWeight:800,color:D.muted,textTransform:"uppercase"}}>{h}</div>))}
        </div>
        {kpi.map((d,i)=>{const e=d.revenue-d.cogs-d.opex;return(
          <div key={i} style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",padding:"10px 14px",gap:10,
            background:i%2===0?D.card:D.surface,borderTop:`1px solid ${D.border}`}}>
            <div style={{fontSize:13,fontWeight:800,color:D.text}}>{d.month}</div>
            {[d.leads,d.measures,d.orders].map((v,ci)=><div key={ci} style={{fontSize:13,fontWeight:700,color:D.text}}>{v}</div>)}
            {[d.revenue,d.cogs,d.opex].map((v,ci)=><div key={ci} style={{fontSize:12,color:D.muted}}>{fmt(v)}</div>)}
            <div style={{fontSize:13,fontWeight:800,color:e>=0?D.green:D.red}}>{fmt(e)}</div>
          </div>
        );})}
      </div>
    </>)}

    {modal&&(<Modal title="📅 Добавить месяц" onClose={()=>setModal(false)}>
      <Sel label="Месяц" value={form.month} onChange={e=>setForm(p=>({...p,month:e.target.value}))} options={["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"]}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Inp label="Лидов" value={form.leads} onChange={e=>setForm(p=>({...p,leads:e.target.value}))} type="number"/>
        <Inp label="Замеров" value={form.measures} onChange={e=>setForm(p=>({...p,measures:e.target.value}))} type="number"/>
        <Inp label="Заказов" value={form.orders} onChange={e=>setForm(p=>({...p,orders:e.target.value}))} type="number"/>
        <Inp label="Выручка ₪" value={form.revenue} onChange={e=>setForm(p=>({...p,revenue:e.target.value}))} type="number"/>
        <Inp label="Себестоимость ₪" value={form.cogs} onChange={e=>setForm(p=>({...p,cogs:e.target.value}))} type="number"/>
        <Inp label="OPEX ₪" value={form.opex} onChange={e=>setForm(p=>({...p,opex:e.target.value}))} type="number"/>
      </div>
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={addMonth}><Check size={13}/> Добавить</Btn>
        <Btn onClick={()=>setModal(false)} variant="ghost">Отмена</Btn>
      </div>
    </Modal>)}
  </div>);
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
const PAGES=[
  {id:"dashboard",icon:LayoutDashboard,label:"Dashboard"},
  {id:"leads",icon:Users,label:"Лиды / CRM"},
  {id:"measurements",icon:Ruler,label:"Замеры"},
  {id:"orders",icon:ShoppingCart,label:"Заказы"},
  {id:"installation",icon:Wrench,label:"Монтаж"},
  {id:"inventory",icon:Package,label:"Склад"},
  {id:"payments",icon:Wallet,label:"Касса"},
  {id:"kpi",icon:BarChart2,label:"KPI"},
  {id:"calc",icon:Calculator,label:"Калькулятор"},
];

export default function App(){
  const [page,setPage]=useState("dashboard");
  const [leads,setLeads]=useState(()=>load(KEYS.leads,IL));
  const [measurements,setMeasurements]=useState(()=>load(KEYS.measurements,IM));
  const [orders,setOrders]=useState(()=>load(KEYS.orders,IO));
  const [inventory,setInventory]=useState(()=>load(KEYS.inventory,II));
  const [payments,setPayments]=useState(()=>load(KEYS.payments,IP));
  const [kpi,setKpi]=useState(()=>load(KEYS.kpi,IK));
  const [saved,setSaved]=useState(true);
  const [calcPreload,setCalcPreload]=useState(null);

  const [installations,setInstallations]=useState(()=>load(KEYS.installations,II_INST));

  useEffect(()=>{setSaved(false);save(KEYS.leads,leads);setTimeout(()=>setSaved(true),600);},[leads]);
  useEffect(()=>{save(KEYS.measurements,measurements);},[measurements]);
  useEffect(()=>{save(KEYS.orders,orders);},[orders]);
  useEffect(()=>{save(KEYS.installations,installations);},[installations]);
  useEffect(()=>{save(KEYS.inventory,inventory);},[inventory]);
  useEffect(()=>{save(KEYS.payments,payments);},[payments]);
  useEffect(()=>{save(KEYS.kpi,kpi);},[kpi]);

  const openCalc=(measurement)=>{setCalcPreload(measurement);setPage("calc");};

  const pendM=measurements.filter(m=>m.status==="Запланирован").length;
  const pendInst=installations.filter(i=>i.status==="Запланирован"||i.status==="В процессе").length;
  const alerts=[
    leads.filter(l=>l.status==="Новый лид").length,
    pendM,null,
    pendInst,
    inventory.filter(i=>i.qty<i.minQty).length,
    payments.filter(p=>p.status==="Ожидается").length,
    null,null,null
  ];

  return(<div style={{display:"flex",height:"100vh",background:D.bg,fontFamily:"'Segoe UI',Arial,sans-serif",overflow:"hidden"}}>
    {/* SIDEBAR */}
    <div style={{width:210,background:D.surface,borderRight:`1px solid ${D.border}`,display:"flex",flexDirection:"column",flexShrink:0}}>
      <div style={{padding:"16px 14px 12px",borderBottom:`1px solid ${D.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,background:"linear-gradient(135deg,#2563EB,#1D4ED8)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🏭</div>
          <div>
            <div style={{fontSize:13,fontWeight:900,color:D.text}}>WindowOS</div>
            <div style={{display:"flex",alignItems:"center",gap:4,marginTop:1}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:saved?D.green:D.yellow}}/>
              <span style={{fontSize:9,color:D.muted,fontWeight:600}}>{saved?"Сохранено":"Сохраняю..."}</span>
            </div>
          </div>
        </div>
      </div>
      <nav style={{flex:1,padding:"8px 6px"}}>
        {PAGES.map(({id,icon:Icon,label},pi)=>{
          const active=page===id;const badge=alerts[pi];
          return(<button key={id} onClick={()=>setPage(id)} style={{display:"flex",alignItems:"center",gap:9,
            width:"100%",padding:"8px 10px",borderRadius:9,marginBottom:2,cursor:"pointer",border:"none",
            background:active?"linear-gradient(135deg,#2563EB18,#1D4ED808)":"transparent",
            borderLeft:active?`3px solid ${D.accent}`:"3px solid transparent",color:active?D.accentLight:D.muted}}>
            <Icon size={14}/>
            <span style={{fontSize:12,fontWeight:active?700:500,flex:1}}>{label}</span>
            {badge>0&&<span style={{background:D.yellow+"30",color:D.yellow,fontSize:9,fontWeight:800,borderRadius:10,padding:"1px 5px"}}>{badge}</span>}
          </button>);
        })}
      </nav>
      <div style={{padding:"8px",borderTop:`1px solid ${D.border}`}}>
        {[
          leads.filter(l=>l.status==="Новый лид").length>0&&[`👤 ${leads.filter(l=>l.status==="Новый лид").length} новых лидов`,"leads"],
          pendM>0&&[`📐 ${pendM} замеров ждут`,"measurements"],
          pendInst>0&&[`🔧 ${pendInst} монтажей активно`,"installation"],
          inventory.filter(i=>i.qty<i.minQty).length>0&&[`📦 нужна закупка`,"inventory"],
          payments.filter(p=>p.status==="Ожидается").length>0&&[`💰 ожидаются платежи`,"payments"],
        ].filter(Boolean).map(([a,pg],i)=>(<button key={i} onClick={()=>setPage(pg)} style={{display:"block",width:"100%",textAlign:"left",background:D.yellow+"12",border:`1px solid ${D.yellow}25`,borderRadius:7,padding:"5px 8px",marginBottom:3,fontSize:9,fontWeight:700,color:D.yellow,cursor:"pointer",transition:"background 0.15s"}}
          onMouseEnter={e=>e.currentTarget.style.background=D.yellow+"28"}
          onMouseLeave={e=>e.currentTarget.style.background=D.yellow+"12"}>{a} →</button>))}
      </div>
      <div style={{padding:"8px 14px 10px",fontSize:9,color:D.muted+"55",borderTop:`1px solid ${D.border}`}}>Window Business OS v3.6 🇮🇱</div>
    </div>
    {/* MAIN */}
    <div style={{flex:1,overflowY:"auto",padding:"22px 24px"}}>
      {page==="dashboard"&&<Dashboard leads={leads} orders={orders} payments={payments} inventory={inventory} kpi={kpi} measurements={measurements} installations={installations}/>}
      {page==="leads"&&<Leads leads={leads} setLeads={setLeads}/>}
      {page==="measurements"&&<Measurements measurements={measurements} setMeasurements={setMeasurements} onOpenCalc={openCalc} leads={leads} setLeads={setLeads}/>}
      {page==="orders"&&<Orders orders={orders} setOrders={setOrders} setPayments={setPayments}/>}
      {page==="installation"&&<Installation installations={installations} setInstallations={setInstallations} orders={orders}/>}
      {page==="inventory"&&<Inventory inventory={inventory} setInventory={setInventory}/>}
      {page==="payments"&&<Payments payments={payments} setPayments={setPayments}/>}
      {page==="kpi"&&<KPI kpi={kpi} setKpi={setKpi} leads={leads} measurements={measurements} orders={orders} payments={payments}/>}
      {page==="calc"&&<Calc preload={calcPreload} setPreload={setCalcPreload} orders={orders} setOrders={setOrders} leads={leads} setLeads={setLeads}/>}
    </div>
  </div>);
}
