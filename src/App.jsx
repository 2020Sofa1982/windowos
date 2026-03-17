import { useState, useEffect, useCallback } from "react";
import { fbSave, fbLoadAll, fbSubscribe } from "./firebase";
import {
  LayoutDashboard, Users, ShoppingCart, Package, Wallet,
  Calculator, Plus, Search, X, Check, Clock, AlertTriangle,
  TrendingUp, Trash2, Download, BarChart2, DollarSign, Eye,
  Ruler, Image, Paperclip, Zap, List, ArrowRight, Wrench, ClipboardCheck,
  Phone, MessageCircle, Menu, ChevronRight, History, FileText,
  CalendarDays, ChevronLeft, Bell
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, ReferenceLine
} from "recharts";

// ── STORAGE ──────────────────────────────────────────────────
const KEYS = { leads:"wb:leads", orders:"wb:orders", inventory:"wb:inventory",
  payments:"wb:payments", kpi:"wb:kpi", measurements:"wb:measurements",
  installations:"wb:installations", quotes:"wb:quotes", templates:"wb:templates",
  activity:"wb:activity", company:"wb:company", lang:"wb:lang" };
const load=(key,fb)=>{try{const v=localStorage.getItem(key);return v?JSON.parse(v):fb;}catch{return fb;}};
const save=(key,data)=>{
  try{localStorage.setItem(key,JSON.stringify(data));}catch{}
  fbSave(key,data); // also sync to Firebase cloud
};

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
// ── BILINGUAL HELPER ─────────────────────────────────────────
let _LANG="ru";
const bi=(ru,he,en)=>({ru,he:he||ru,en:en||ru});
const t=(x)=>{if(!x)return"";if(typeof x==="string")return x;if(typeof x==="object")return x[_LANG]||x.ru||"";return String(x);};
const UI={
  ru:{
    // Nav
    dashboard:"Дашборд",leads:"Лиды / CRM",measurements:"Замеры",calc:"Калькулятор КП",
    quotes:"КП История",orders:"Заказы",install:"Монтаж",payments:"Касса",
    calendar:"Календарь",finance:"P&L · Финансы",kpi:"KPI",inventory:"Склад",
    // Actions
    save:"Сохранить",cancel:"Отмена",delete:"Удалить",edit:"Редактировать",
    add:"Добавить",create:"Создать",search:"Поиск...",close:"Закрыть",export:"Экспорт",
    // Fields
    client:"Клиент",phone:"Телефон",address:"Адрес",date:"Дата",notes:"Заметки",
    status:"Статус",total:"Итого",received:"Получен",pending:"Ожидается",
    today:"Сегодня",settings:"Настройки компании",
    // Lead statuses
    "Новый лид":"Новый лид","Замер назначен":"Замер назначен","КП отправлено":"КП отправлено",
    "Follow-up":"Follow-up","Закрыт (выиграли)":"Закрыт (выиграли)","Закрыт (проиграли)":"Закрыт (проиграли)",
    // Order statuses
    "Ожидает материалов":"Ожидает материалов","В производстве":"В производстве",
    "Готов к монтажу":"Готов к монтажу","Монтаж":"Монтаж","Завершён":"Завершён",
    // Install statuses
    "Запланирован":"Запланирован","В процессе":"В процессе","Выполнен":"Выполнен","Утверждён":"Утверждён",
    // Payment statuses
    "Получен":"Получен","Ожидается":"Ожидается","Черновик":"Черновик",
    // Source
    "Google":"Google","Рекомендация":"Рекомендация","Повторный клиент":"Повторный клиент",
    "Yad2":"Yad2","Facebook":"Facebook","Другое":"Другое",
    // Months
    m1:"Янв",m2:"Фев",m3:"Мар",m4:"Апр",m5:"Май",m6:"Июн",
    m7:"Июл",m8:"Авг",m9:"Сен",m10:"Окт",m11:"Ноя",m12:"Дек",
    d1:"Пн",d2:"Вт",d3:"Ср",d4:"Чт",d5:"Пт",d6:"Сб",d7:"Вс",
  },
  he:{
    dashboard:"דשבורד",leads:"לידים / CRM",measurements:"מדידות",calc:"מחשבון הצעת מחיר",
    quotes:"היסטוריית הצעות",orders:"הזמנות",install:"התקנה",payments:"קופה",
    calendar:"לוח שנה",finance:"P&L · פיננסים",kpi:"KPI",inventory:"מחסן",
    save:"שמור",cancel:"ביטול",delete:"מחק",edit:"ערוך",
    add:"הוסף",create:"צור",search:"חיפוש...",close:"סגור",export:"ייצוא",
    client:"לקוח",phone:"טלפון",address:"כתובת",date:"תאריך",notes:"הערות",
    status:"סטטוס",total:'סה"כ',received:"התקבל",pending:"ממתין",
    today:"היום",settings:"הגדרות חברה",
    "Новый лид":"ליד חדש","Замер назначен":"נקבעה מדידה","КП отправлено":"הצעת מחיר נשלחה",
    "Follow-up":"פולו-אפ","Закрыт (выиграли)":"נסגר (זכינו)","Закрыт (проиграли)":"נסגר (הפסדנו)",
    "Ожидает материалов":"ממתין לחומרים","В производстве":"בייצור",
    "Готов к монтажу":"מוכן להתקנה","Монтаж":"בהתקנה","Завершён":"הושלם",
    "Запланирован":"מתוכנן","В процессе":"בתהליך","Выполнен":"בוצע","Утверждён":"אושר",
    "Получен":"התקבל","Ожидается":"ממתין","Черновик":"טיוטה",
    "Google":"Google","Рекомендация":"המלצה","Повторный клиент":"לקוח חוזר",
    "Yad2":"יד2","Facebook":"Facebook","Другое":"אחר",
    m1:"ינו׳",m2:"פבר׳",m3:"מרץ",m4:"אפר׳",m5:"מאי",m6:"יוני",
    m7:"יולי",m8:"אוג׳",m9:"ספט׳",m10:"אוק׳",m11:"נוב׳",m12:"דצ׳",
    d1:"ב׳",d2:"ג׳",d3:"ד׳",d4:"ה׳",d5:"ו׳",d6:"ש׳",d7:"א׳",
  },
  en:{
    dashboard:"Dashboard",leads:"Leads / CRM",measurements:"Measurements",calc:"Quote Calculator",
    quotes:"Quote History",orders:"Orders",install:"Installation",payments:"Cash Register",
    calendar:"Calendar",finance:"P&L · Finance",kpi:"KPI",inventory:"Inventory",
    save:"Save",cancel:"Cancel",delete:"Delete",edit:"Edit",
    add:"Add",create:"Create",search:"Search...",close:"Close",export:"Export",
    client:"Client",phone:"Phone",address:"Address",date:"Date",notes:"Notes",
    status:"Status",total:"Total",received:"Received",pending:"Pending",
    today:"Today",settings:"Company Settings",
    "Новый лид":"New Lead","Замер назначен":"Measurement Set","КП отправлено":"Quote Sent",
    "Follow-up":"Follow-up","Закрыт (выиграли)":"Closed (Won)","Закрыт (проиграли)":"Closed (Lost)",
    "Ожидает материалов":"Awaiting Materials","В производстве":"In Production",
    "Готов к монтажу":"Ready to Install","Монтаж":"Installing","Завершён":"Completed",
    "Запланирован":"Planned","В процессе":"In Progress","Выполнен":"Completed","Утверждён":"Approved",
    "Получен":"Received","Ожидается":"Pending","Черновик":"Draft",
    "Google":"Google","Рекомендация":"Recommendation","Повторный клиент":"Repeat client",
    "Yad2":"Yad2","Facebook":"Facebook","Другое":"Other",
    m1:"Jan",m2:"Feb",m3:"Mar",m4:"Apr",m5:"May",m6:"Jun",
    m7:"Jul",m8:"Aug",m9:"Sep",m10:"Oct",m11:"Nov",m12:"Dec",
    d1:"Mo",d2:"Tu",d3:"We",d4:"Th",d5:"Fr",d6:"Sa",d7:"Su",
  },
};
const ui=(key)=>UI[_LANG]?.[key]||UI.ru[key]||key;
// Translate a stored Russian status/value for display
const ds=(v)=>{if(!v)return"";return UI[_LANG]?.[v]||v;};

const DG=[
  {id:"none",    name:bi("Стандарт (в базе)","סטנדרטי (בסיס)","Standard (base)"),          price:0,    code:"-"},
  {id:"triplex_38",name:bi("Триплекс 3+3 PVB 0.38","טריפלקס 3+3 PVB 0.38","Triplex 3+3 PVB 0.38"),   price:72.3, code:"12.111.0011"},
  {id:"triplex_76",name:bi("Триплекс 4+4 PVB 0.76","טריפלקס 4+4 PVB 0.76","Triplex 4+4 PVB 0.76"),   price:197.8,code:"12.111.0051"},
  {id:"insul_4", name:bi("Стеклопакет 4+6+4","זיגוג כפול 4+6+4","Double glazing 4+6+4"),         price:89.3, code:"12.111.0161"},
  {id:"insul_5", name:bi("Стеклопакет 5+6+5","זיגוג כפול 5+6+5","Double glazing 5+6+5"),         price:170.6,code:"12.111.0163"},
  {id:"tempered",name:bi("Закалённое 6мм","זכוכית מחוסמת 6 מ\"מ","Tempered 6mm"),     price:93.8, code:"12.111.0211"},
  {id:"tinted",  name:bi("Тонированное 6мм","זכוכית מצבעת 6 מ\"מ","Tinted 6mm"),      price:42.9, code:"12.111.0231"},
];
const DS=[
  {id:"none",name:bi("Без сетки","ללא רשת","No screen"),         price:0,  code:"-"},
  {id:"std", name:bi("Сетка стандарт","רשת סטנדרטית","Standard screen"),    price:565,code:"12.110.0100"},
  {id:"eco", name:bi("Сетка эконом","רשת חסכונית","Economy screen"),      price:452,code:"12.110.0110"},
  {id:"roll",name:bi("Сетка рулонная","רשת גלילה","Roll-up screen"),        price:362,code:"12.110.0120"},
];
const DSHT=[
  {id:"none",            name:bi("Без роллет","ללא תריס","No shutters"),                  dekelM2:0,   motor:0,    marketFactor:1.0,  code:"-"},
  {id:"roll_pvc_manual", name:bi("Роллет PVC ручной","תריס PVC ידני","PVC shutter manual"),             dekelM2:735, motor:0,    marketFactor:1.38, code:"12.101.1600"},
  {id:"roll_alum_manual",name:bi("Роллет алюм. ручной","תריס אלומיניום ידני","Alum. shutter manual"),   dekelM2:915, motor:0,    marketFactor:1.38, code:"12.101.1611"},
  {id:"roll_alum_motor", name:bi("Роллет алюм. + мотор","תריס אלומיניום ממונע","Alum. shutter motorized"), dekelM2:915, motor:622,  marketFactor:1.38, code:"12.101.1611+12.101.2000"},
  {id:"roll_alum_motor_rf",name:bi("Роллет алюм. мотор+пульт","תריס אלומיניום ממונע+שלט","Alum. shutter motor+remote"), dekelM2:915, motor:1085, marketFactor:1.38, code:"12.101.1611+12.101.2060"},
  {id:"slide_pvc_1",     name:bi("Тришс PVC 1-крыло","תריס הזזה PVC כנף 1","PVC slide 1-leaf"),  dekelM2:802, motor:0,    marketFactor:1.35, code:"12.101.1200"},
  {id:"slide_pvc_2",     name:bi("Тришс PVC 2-крыла","תריס הזזה PVC 2 כנפיים","PVC slide 2-leaf"), dekelM2:1017,motor:0,    marketFactor:1.35, code:"12.101.1250"},
];
const DACC_CATS=[
  {id:"handle",   label:bi("Ручки","ידיות","Handles")},
  {id:"lock",     label:bi("Замки/Фурнитура","מנעולים/חומרה","Locks/Hardware")},
  {id:"seal",     label:bi("Уплотнители EPDM","אטמי EPDM","EPDM Seals")},
  {id:"roller",   label:bi("Ролики/Направляющие","גלגלים/מסילות","Rollers/Guides")},
  {id:"connector",label:bi("Соединители","מחברים","Connectors")},
  {id:"screw",    label:bi("Крепёж","ברגים","Fasteners")},
  {id:"cap",      label:bi("Заглушки/Крышки","פקקים/כיסויים","Caps/Covers")},
];
const DACC=[
  {id:"handle_std",    cat:"handle",  code:"2679",   name:bi("Ручка стандарт","ידית סטנדרטית","Standard handle"),         unit:"шт",price:85},
  {id:"handle_2600_1", cat:"handle",  code:"3190-1", name:bi("Ручка 2600 (короткая)","ידית 2600 (קצרה)","2600 handle (short)"), unit:"шт",price:120},
  {id:"handle_2600_2", cat:"handle",  code:"3190-2", name:bi("Ручка 2600 (длинная)","ידית 2600 (ארוכה)","2600 handle (long)"),  unit:"шт",price:145},
  {id:"handle_flush",  cat:"handle",  code:"3191",   name:bi("Ручка скрытая","ידית שקועה","Flush handle"),                 unit:"шт",price:160},
  {id:"handle_bau_xl", cat:"handle",  code:"3492",   name:bi("Ручка BAU XL премиум","ידית BAU XL פרמיום","BAU XL premium handle"), unit:"шт",price:210},
  {id:"lock_multi",    cat:"lock",    code:"6624",   name:bi("Замок многоточечный стд","נעילה רב-נקודתית","Multi-point lock std"), unit:"шт",price:380},
  {id:"lock_multi_sec",cat:"lock",    code:"6625",   name:bi("Замок многоточечный усил.","נעילה רב-נקודתית מחוזקת","Multi-point lock reinforced"), unit:"шт",price:520},
  {id:"lock_multi_xl", cat:"lock",    code:"6626",   name:bi("Замок многоточечный XL","נעילה רב-נקודתית XL","Multi-point lock XL"), unit:"шт",price:610},
  {id:"lock_single",   cat:"lock",    code:"6633",   name:bi("Замок одноточечный","נעילה חד-נקודתית","Single-point lock"),   unit:"шт",price:180},
  {id:"lock_anti_lift",cat:"lock",    code:"6635",   name:bi("Антиподъём","מנגנון מניעת הרמה","Anti-lift"),                 unit:"шт",price:95},
  {id:"lock_keep",     cat:"lock",    code:"6692",   name:bi("Ответная планка BAU-XL","תפס BAU-XL","Strike plate BAU-XL"),  unit:"шт",price:75},
  {id:"lock_keep2",    cat:"lock",    code:"6693",   name:bi("Ответная планка BAU-33","תפס BAU-33","Strike plate BAU-33"),  unit:"шт",price:68},
  {id:"seal_2287",     cat:"seal",    code:"2287",   name:bi("Уплотнитель EPDM 6мм","אטם EPDM 6 מ\"מ","EPDM seal 6mm"),   unit:"м.п.",price:12},
  {id:"seal_2310",     cat:"seal",    code:"2310",   name:bi("Уплотнитель EPDM 2-сл.","אטם EPDM 2-רכיבי","EPDM seal 2-layer"), unit:"м.п.",price:18},
  {id:"seal_2318",     cat:"seal",    code:"2318",   name:bi("Уплотнитель EPDM 4мм","אטם EPDM 4 מ\"מ","EPDM seal 4mm"),   unit:"м.п.",price:15},
  {id:"seal_2319",     cat:"seal",    code:"2319",   name:bi("Уплотнитель EPDM 4мм кр.","אטם EPDM 4 מ\"מ ציר","EPDM seal 4mm hinge"), unit:"м.п.",price:14},
  {id:"seal_2382",     cat:"seal",    code:"2382",   name:bi("Уплотнитель EPDM кол.","אטם EPDM עמוד מסגרת","EPDM seal col."), unit:"м.п.",price:20},
  {id:"seal_2385",     cat:"seal",    code:"2385",   name:bi("Уплотнитель EPDM 2к 2.5мм","אטם EPDM דו-רכיבי 2.5 מ\"מ","EPDM 2-comp 2.5mm"), unit:"м.п.",price:22},
  {id:"seal_2386",     cat:"seal",    code:"2386",   name:bi("Уплотнитель EPDM 2к 4мм","אטם EPDM דו-רכיבי 4 מ\"מ","EPDM 2-comp 4mm"), unit:"м.п.",price:25},
  {id:"roller_std",    cat:"roller",  code:"18027",  name:bi("Роликовый узел стд (2шт)","מחלק גלגלים סטנדרטי (2)","Roller std (2pcs)"), unit:"пара",price:145},
  {id:"roller_hd",     cat:"roller",  code:"18028",  name:bi("Роликовый узел тяжёлый","מחלק גלגלים כבד","Heavy roller"),   unit:"пара",price:220},
  {id:"roller_3t",     cat:"roller",  code:"18029",  name:bi("Роликовый узел 3-трек","מחלק גלגלים 3 מסלולים","3-track roller"), unit:"пара",price:195},
  {id:"roller_3t_hd",  cat:"roller",  code:"18030",  name:bi("Роликовый узел 3т тяжёлый","מחלק גלגלים 3 מסלולים כבד","3-track heavy roller"), unit:"пара",price:265},
  {id:"conn_corner",   cat:"connector",code:"26010", name:bi("Угловой соединитель","מחבר פינה","Corner connector"),         unit:"шт",price:25},
  {id:"conn_screw",    cat:"connector",code:"7313",  name:bi("Самосверлящий саморез","ברג חורר עצמי","Self-drilling screw"), unit:"шт",price:3},
  {id:"conn_t",        cat:"connector",code:"26012", name:bi("T-соединитель","מחבר T","T-connector"),                       unit:"шт",price:22},
  {id:"conn_cross",    cat:"connector",code:"26014", name:bi("Крестовой соединитель","מחבר צלב","Cross connector"),          unit:"шт",price:28},
  {id:"screw_m5_30",   cat:"screw",   code:"M5×30", name:bi("Болт M5×30","ברג M5×30","Bolt M5×30"),                       unit:"шт",price:1.5},
  {id:"screw_m5_20",   cat:"screw",   code:"M5×20", name:bi("Болт M5×20","ברג M5×20","Bolt M5×20"),                       unit:"шт",price:1.2},
  {id:"screw_8x12",    cat:"screw",   code:"#8×1/2",name:bi("Саморез #8×1/2\"","ברג קידוח #8×1/2\"","Screw #8×1/2\""),   unit:"шт",price:0.8},
  {id:"screw_m5_40",   cat:"screw",   code:"M5×40", name:bi("Болт M5×40","ברג M5×40","Bolt M5×40"),                       unit:"шт",price:1.8},
  {id:"cap_pvc",       cat:"cap",     code:"1705",   name:bi("Заглушка PVC торцевая","פקק PVC קצה","PVC end cap"),          unit:"шт",price:8},
  {id:"cap_frame",     cat:"cap",     code:"1707",   name:bi("Заглушка рамы","פקק מסגרת","Frame cap"),                     unit:"шт",price:10},
  {id:"cap_pvc_2107",  cat:"cap",     code:"2107",   name:bi("Заглушка ∅16 с кронштейном","פקק ∅16 עם סוגר","Cap ∅16 w/bracket"), unit:"шт",price:15},
  {id:"cap_profile",   cat:"cap",     code:"2619",   name:bi("Крышка профиля декор.","כיסוי פרופיל דקורטיבי","Decorative profile cap"), unit:"шт",price:12},
  {id:"cap_bracket",   cat:"cap",     code:"2402",   name:bi("Кронштейн монтажный 2мм","סוגר התקנה 2 מ\"מ","Mounting bracket 2mm"), unit:"шт",price:18},
  {id:"cap_bracket3",  cat:"cap",     code:"2403",   name:bi("Кронштейн монтажный 3мм","סוגר התקנה 3 מ\"מ","Mounting bracket 3mm"), unit:"шт",price:20},
];
const shutterM2=(opt,mf)=>opt.dekelM2*(mf??opt.marketFactor);
const OPS=[
  {id:"sliding_2_track",      name:bi("Хаза 2-трек","הזזה 2 מסלולים","Sliding 2-track"),    profiles:["klil_7000","klil_9000","klil_1700","klil_7300"]},
  {id:"sliding_multi_sash",   name:bi("Хаза 3-4 трека","הזזה 3-4 מסלולים","Sliding 3-4 track"),  profiles:["klil_7000","klil_9000","klil_7300"]},
  {id:"pocket_sliding",       name:bi("Карман","הזזה לכיס","Pocket sliding"),          profiles:["klil_7000","klil_7300"]},
  {id:"casement_or_tilt_turn",name:bi("Поворотно-откидное","כיפ-כיפ / ציר","Tilt-turn"),     profiles:["klil_4500","klil_5500","klil_4300"]},
  {id:"tilt_or_fixed",        name:bi("Kipp / Глухое","כיפ / פיקס","Kipp / Fixed"),         profiles:["klil_4500","klil_5500","klil_4300","klil_4350"]},
  {id:"lift_slide_2600",      name:bi("Lift & Slide 2600 🏆","הרם והחלק 2600 🏆","Lift & Slide 2600 🏆"),  profiles:["klil_2600_2t","klil_2600_3t","klil_2600_3s"]},
  {id:"railing",              name:bi("Перила/Ограждение 🔩","מעקה / גדר","Railing 🔩"),         profiles:["klil_railing_std","klil_railing_glass"]},
  {id:"partition",            name:bi("Перегородка 🪟","מחיצה","Partition 🪟"),              profiles:["klil_partition_std","klil_partition_glass"]},
  {id:"grille",               name:bi("Решётка/Pergola 🔲","סורג / פרגולה","Grille/Pergola 🔲"),      profiles:["klil_grille_std"]},
];
const PNAMES={
  klil_7000:      bi("Клиль 7000","קליל 7000","Klil 7000"),
  klil_9000:      bi("Клиль 9000 (термо)","קליל 9000 תרמי","Klil 9000 (thermo)"),
  klil_1700:      bi("Клиль 1700 (эконом)","קליל 1700 חסכוני","Klil 1700 (economy)"),
  klil_7300:      bi("Клиль 7300 (Slim)","קליל 7300 סלים","Klil 7300 (Slim)"),
  klil_4500:      bi("Клиль 4500","קליל 4500","Klil 4500"),
  klil_5500:      bi("Клиль 5500 (премиум)","קליל 5500 פרמיום","Klil 5500 (premium)"),
  klil_4300:      bi("Клиль 4300","קליל 4300","Klil 4300"),
  klil_4350:      bi("Клиль 4350","קליל 4350","Klil 4350"),
  klil_2600_2t:   bi("2600 Bauhaus 2-крыла","2600 באוהאוס 2 כנפיים","2600 Bauhaus 2-leaf"),
  klil_2600_3t:   bi("2600 Bauhaus 3-крыла","2600 באוהאוס 3 כנפיים","2600 Bauhaus 3-leaf"),
  klil_2600_3s:   bi("2600 Bauhaus 3-трека","2600 באוהאוס 3 מסלולים","2600 Bauhaus 3-track"),
  klil_railing_std:    bi("Перила алюм. стд","מעקה אלומיניום סטנדרטי","Alum. railing std"),
  klil_railing_glass:  bi("Перила со стеклом","מעקה עם זכוכית","Glass railing"),
  klil_partition_std:  bi("Перегородка стд","מחיצה סטנדרטית","Partition std"),
  klil_partition_glass:bi("Перегородка стекло","מחיצה זכוכית","Glass partition"),
  klil_grille_std:     bi("Решётка алюм.","סורג אלומיניום","Alum. grille"),
};
// Profile key dimensions mm
const PDIMS={
  klil_7000:{frame:70,sash:70,glass:5,series:"7000"},
  klil_9000:{frame:90,sash:90,glass:44,series:"9000 термо"},
  klil_1700:{frame:60,sash:60,glass:5,series:"1700 эконом"},
  klil_7300:{frame:55,sash:55,glass:5,series:"7300 Slim"},
  klil_4500:{frame:70,sash:80,glass:5,series:"4500"},
  klil_5500:{frame:70,sash:90,glass:44,series:"5500 Premium"},
  klil_4300:{frame:65,sash:70,glass:5,series:"4300"},
  klil_4350:{frame:65,sash:65,glass:5,series:"4350 Fixed"},
  klil_2600_2t:{frame:57,sash:77,glass:5,series:"2600 Lift&Slide",maxW:3270,maxH:2400,maxKg:250},
  klil_2600_3t:{frame:57,sash:77,glass:5,series:"2600 Lift&Slide",maxW:4300,maxH:2400,maxKg:400},
  klil_2600_3s:{frame:57,sash:77,glass:5,series:"2600 Lift&Slide",maxW:4300,maxH:2400,maxKg:400},
};
// Profile weights g/m.p. from Klil 2600 catalog
const PWEIGHTS={
  klil_7000:350,klil_9000:420,klil_1700:280,klil_7300:310,
  klil_4500:380,klil_5500:440,klil_4300:360,klil_4350:320,
  klil_2600_2t:878,klil_2600_3t:1555,klil_2600_3s:1253,
};
// SVG cross-section drawings for each profile family
const PSVG={
  klil_7000:(sel)=>`<svg viewBox="0 0 70 60" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="66" height="56" rx="2" fill="none" stroke="${sel?"#3B82F6":"#4A607A"}" stroke-width="1.5"/>
    <rect x="8" y="8" width="24" height="44" rx="1" fill="none" stroke="${sel?"#3B82F6":"#4A607A"}" stroke-width="1.5"/>
    <rect x="38" y="8" width="24" height="44" rx="1" fill="none" stroke="${sel?"#3B82F6":"#4A607A"}" stroke-width="1.5"/>
    <rect x="10" y="10" width="20" height="40" fill="${sel?"#3B82F620":"#1E2D4530"}"/>
    <rect x="40" y="10" width="20" height="40" fill="${sel?"#3B82F620":"#1E2D4530"}"/>
    <line x1="35" y1="2" x2="35" y2="58" stroke="${sel?"#3B82F6":"#4A607A"}" stroke-width="1" stroke-dasharray="3,2"/>
    <text x="35" y="72" text-anchor="middle" font-size="7" fill="#4A607A" font-family="Arial">7000</text>
  </svg>`,
  klil_9000:(sel)=>`<svg viewBox="0 0 70 60" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="66" height="56" rx="2" fill="none" stroke="${sel?"#3B82F6":"#4A607A"}" stroke-width="2"/>
    <rect x="6" y="6" width="26" height="48" rx="1" fill="none" stroke="${sel?"#3B82F6":"#4A607A"}" stroke-width="2"/>
    <rect x="38" y="6" width="26" height="48" rx="1" fill="none" stroke="${sel?"#3B82F6":"#4A607A"}" stroke-width="2"/>
    <rect x="9" y="9" width="20" height="42" fill="${sel?"#3B82F630":"#1E2D4530"}"/>
    <rect x="41" y="9" width="20" height="42" fill="${sel?"#3B82F630":"#1E2D4530"}"/>
    <rect x="9" y="9" width="20" height="4" fill="${sel?"#60A5FA50":"#2563EB30"}"/>
    <rect x="41" y="9" width="20" height="4" fill="${sel?"#60A5FA50":"#2563EB30"}"/>
    <text x="35" y="72" text-anchor="middle" font-size="7" fill="#4A607A" font-family="Arial">9000 термо</text>
  </svg>`,
  klil_1700:(sel)=>`<svg viewBox="0 0 70 60" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="62" height="52" rx="1" fill="none" stroke="${sel?"#3B82F6":"#4A607A"}" stroke-width="1"/>
    <rect x="8" y="8" width="22" height="44" rx="1" fill="none" stroke="${sel?"#3B82F6":"#4A607A"}" stroke-width="1"/>
    <rect x="40" y="8" width="22" height="44" rx="1" fill="none" stroke="${sel?"#3B82F6":"#4A607A"}" stroke-width="1"/>
    <rect x="10" y="10" width="18" height="40" fill="${sel?"#3B82F615":"#1E2D4520"}"/>
    <rect x="42" y="10" width="18" height="40" fill="${sel?"#3B82F615":"#1E2D4520"}"/>
    <text x="35" y="72" text-anchor="middle" font-size="7" fill="#4A607A" font-family="Arial">1700 эконом</text>
  </svg>`,
  klil_7300:(sel)=>`<svg viewBox="0 0 70 60" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="64" height="54" rx="1" fill="none" stroke="${sel?"#3B82F6":"#4A607A"}" stroke-width="1"/>
    <rect x="6" y="6" width="22" height="48" rx="1" fill="none" stroke="${sel?"#3B82F6":"#4A607A"}" stroke-width="1"/>
    <rect x="42" y="6" width="22" height="48" rx="1" fill="none" stroke="${sel?"#3B82F6":"#4A607A"}" stroke-width="1"/>
    <rect x="8" y="8" width="18" height="44" fill="${sel?"#3B82F615":"#1E2D4520"}"/>
    <rect x="44" y="8" width="18" height="44" fill="${sel?"#3B82F615":"#1E2D4520"}"/>
    <line x1="35" y1="3" x2="35" y2="57" stroke="${sel?"#3B82F6":"#4A607A"}" stroke-width="0.5"/>
    <text x="35" y="72" text-anchor="middle" font-size="7" fill="#4A607A" font-family="Arial">7300 Slim</text>
  </svg>`,
  klil_4500:(sel)=>`<svg viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="56" height="66" rx="2" fill="none" stroke="${sel?"#3B82F6":"#4A607A"}" stroke-width="1.5"/>
    <rect x="8" y="8" width="44" height="54" rx="1" fill="none" stroke="${sel?"#3B82F6":"#4A607A"}" stroke-width="1.5"/>
    <rect x="12" y="12" width="36" height="46" fill="${sel?"#3B82F620":"#1E2D4530"}"/>
    <line x1="8" y1="35" x2="52" y2="35" stroke="${sel?"#3B82F6":"#4A607A"}" stroke-width="0.5" stroke-dasharray="2,2"/>
    <text x="30" y="82" text-anchor="middle" font-size="7" fill="#4A607A" font-family="Arial">4500 поворот</text>
  </svg>`,
  klil_5500:(sel)=>`<svg viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="56" height="66" rx="2" fill="none" stroke="${sel?"#3B82F6":"#4A607A"}" stroke-width="2"/>
    <rect x="7" y="7" width="46" height="56" rx="1" fill="none" stroke="${sel?"#3B82F6":"#4A607A"}" stroke-width="2"/>
    <rect x="11" y="11" width="38" height="48" fill="${sel?"#3B82F625":"#1E2D4530"}"/>
    <rect x="11" y="11" width="38" height="5" fill="${sel?"#60A5FA40":"#2563EB25"}"/>
    <line x1="7" y1="35" x2="53" y2="35" stroke="${sel?"#3B82F6":"#4A607A"}" stroke-width="0.5" stroke-dasharray="2,2"/>
    <text x="30" y="82" text-anchor="middle" font-size="7" fill="#4A607A" font-family="Arial">5500 Premium</text>
  </svg>`,
  klil_4300:(sel)=>`<svg viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="54" height="64" rx="1" fill="none" stroke="${sel?"#3B82F6":"#4A607A"}" stroke-width="1.5"/>
    <rect x="9" y="9" width="42" height="52" rx="1" fill="none" stroke="${sel?"#3B82F6":"#4A607A"}" stroke-width="1.5"/>
    <rect x="12" y="12" width="36" height="46" fill="${sel?"#3B82F618":"#1E2D4528"}"/>
    <text x="30" y="82" text-anchor="middle" font-size="7" fill="#4A607A" font-family="Arial">4300</text>
  </svg>`,
  klil_4350:(sel)=>`<svg viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="54" height="64" rx="1" fill="none" stroke="${sel?"#3B82F6":"#4A607A"}" stroke-width="1.5"/>
    <rect x="9" y="9" width="42" height="52" rx="1" fill="none" stroke="${sel?"#3B82F6":"#4A607A"}" stroke-width="1.5"/>
    <rect x="12" y="12" width="36" height="46" fill="${sel?"#3B82F618":"#1E2D4528"}"/>
    <line x1="30" y1="9" x2="30" y2="61" stroke="${sel?"#3B82F6":"#4A607A"}" stroke-width="0.5"/>
    <line x1="9" y1="35" x2="51" y2="35" stroke="${sel?"#3B82F6":"#4A607A"}" stroke-width="0.5"/>
    <text x="30" y="82" text-anchor="middle" font-size="7" fill="#4A607A" font-family="Arial">4350 Глухое</text>
  </svg>`,
  klil_2600_2t:(sel)=>`<svg viewBox="0 0 80 65" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="76" height="61" rx="2" fill="none" stroke="${sel?"#F59E0B":"#4A607A"}" stroke-width="2"/>
    <rect x="8" y="6" width="28" height="53" rx="1" fill="none" stroke="${sel?"#F59E0B":"#4A607A"}" stroke-width="2"/>
    <rect x="44" y="6" width="28" height="53" rx="1" fill="none" stroke="${sel?"#F59E0B":"#4A607A"}" stroke-width="2"/>
    <rect x="11" y="9" width="22" height="47" fill="${sel?"#F59E0B20":"#1E2D4530"}"/>
    <rect x="47" y="9" width="22" height="47" fill="${sel?"#F59E0B20":"#1E2D4530"}"/>
    <rect x="2" y="54" width="76" height="9" rx="1" fill="${sel?"#F59E0B30":"#1E2D4520"}" stroke="${sel?"#F59E0B":"#4A607A"}" stroke-width="1"/>
    <text x="40" y="76" text-anchor="middle" font-size="6.5" fill="${sel?"#F59E0B":"#4A607A"}" font-family="Arial" font-weight="bold">2600 Lift&amp;Slide 2K</text>
  </svg>`,
  klil_2600_3t:(sel)=>`<svg viewBox="0 0 90 65" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="86" height="61" rx="2" fill="none" stroke="${sel?"#F59E0B":"#4A607A"}" stroke-width="2"/>
    <rect x="7" y="6" width="22" height="53" rx="1" fill="none" stroke="${sel?"#F59E0B":"#4A607A"}" stroke-width="1.5"/>
    <rect x="34" y="6" width="22" height="53" rx="1" fill="none" stroke="${sel?"#F59E0B":"#4A607A"}" stroke-width="1.5"/>
    <rect x="61" y="6" width="22" height="53" rx="1" fill="none" stroke="${sel?"#F59E0B":"#4A607A"}" stroke-width="1.5"/>
    <rect x="9" y="9" width="18" height="47" fill="${sel?"#F59E0B18":"#1E2D4528"}"/>
    <rect x="36" y="9" width="18" height="47" fill="${sel?"#F59E0B18":"#1E2D4528"}"/>
    <rect x="63" y="9" width="18" height="47" fill="${sel?"#F59E0B18":"#1E2D4528"}"/>
    <rect x="2" y="54" width="86" height="9" rx="1" fill="${sel?"#F59E0B25":"#1E2D4518"}" stroke="${sel?"#F59E0B":"#4A607A"}" stroke-width="1"/>
    <text x="45" y="76" text-anchor="middle" font-size="6" fill="${sel?"#F59E0B":"#4A607A"}" font-family="Arial" font-weight="bold">2600 Lift&amp;Slide 3K</text>
  </svg>`,
  klil_2600_3s:(sel)=>`<svg viewBox="0 0 90 65" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="86" height="61" rx="2" fill="none" stroke="${sel?"#F59E0B":"#4A607A"}" stroke-width="2"/>
    <rect x="7" y="6" width="14" height="53" rx="1" fill="none" stroke="${sel?"#F59E0B":"#4A607A"}" stroke-width="1.5"/>
    <rect x="26" y="6" width="22" height="53" rx="1" fill="none" stroke="${sel?"#F59E0B":"#4A607A"}" stroke-width="1.5"/>
    <rect x="53" y="6" width="22" height="53" rx="1" fill="none" stroke="${sel?"#F59E0B":"#4A607A"}" stroke-width="1.5"/>
    <rect x="76" y="6" width="10" height="53" rx="1" fill="none" stroke="${sel?"#F59E0B":"#4A607A"}" stroke-width="1.5"/>
    <rect x="9" y="9" width="10" height="47" fill="${sel?"#F59E0B15":"#1E2D4520"}"/>
    <rect x="28" y="9" width="18" height="47" fill="${sel?"#F59E0B18":"#1E2D4528"}"/>
    <rect x="55" y="9" width="18" height="47" fill="${sel?"#F59E0B18":"#1E2D4528"}"/>
    <rect x="77" y="9" width="7" height="47" fill="${sel?"#F59E0B15":"#1E2D4520"}"/>
    <rect x="2" y="54" width="86" height="9" rx="1" fill="${sel?"#F59E0B25":"#1E2D4518"}" stroke="${sel?"#F59E0B":"#4A607A"}" stroke-width="1"/>
    <text x="45" y="76" text-anchor="middle" font-size="6" fill="${sel?"#F59E0B":"#4A607A"}" font-family="Arial" font-weight="bold">2600 Lift&amp;Slide 3-трек</text>
  </svg>`,
};

// Map measurement opening type → dekel op
const OT2OP={
  "Хаза 2-трек":"sliding_2_track","Хаза 3-трек":"sliding_multi_sash",
  "Поворотно-откидное":"casement_or_tilt_turn","Откидное":"tilt_or_fixed",
  "Глухое":"tilt_or_fixed","Карман (кис)":"pocket_sliding",
  "Бельгийское":"sliding_multi_sash","Дверь хаза":"sliding_2_track",
  "Дверь поворот":"casement_or_tilt_turn"
};
const OP2PROF={sliding_2_track:"klil_7000",sliding_multi_sash:"klil_7000",
  pocket_sliding:"klil_7000",casement_or_tilt_turn:"klil_4500",tilt_or_fixed:"klil_4500",
  lift_slide_2600:"klil_2600_2t"};

// 2600 Bauhaus Lift&Slide Dekel bands (Dekel 2022 × market, premium segment)
// [code, op, profile, min_m2, max_m2, price/m2]
const DB2600=[
  ["12.015.0100","lift_slide_2600","klil_2600_2t",1.5,3.0,2850.0],
  ["12.015.0110","lift_slide_2600","klil_2600_2t",3.0,5.0,2540.0],
  ["12.015.0120","lift_slide_2600","klil_2600_2t",5.0,7.8,2210.0],
  ["12.015.0200","lift_slide_2600","klil_2600_3t",2.5,4.5,3120.0],
  ["12.015.0210","lift_slide_2600","klil_2600_3t",4.5,7.0,2780.0],
  ["12.015.0220","lift_slide_2600","klil_2600_3t",7.0,10.3,2450.0],
  ["12.015.0300","lift_slide_2600","klil_2600_3s",3.0,5.5,3350.0],
  ["12.015.0310","lift_slide_2600","klil_2600_3s",5.5,8.0,2980.0],
  ["12.015.0320","lift_slide_2600","klil_2600_3s",8.0,10.3,2620.0],
];

// Dekel level 2 — railings (12.102), partitions (12.117), grilles (12.120)
const DB_L2=[
  // Railings (מעקים) 12.102
  ["12.102.0100","railing","klil_railing_std",0.5,2.0,1850.0],
  ["12.102.0110","railing","klil_railing_std",2.0,4.0,1620.0],
  ["12.102.0120","railing","klil_railing_std",4.0,8.0,1380.0],
  ["12.102.0200","railing","klil_railing_glass",0.5,2.0,2450.0],
  ["12.102.0210","railing","klil_railing_glass",2.0,4.0,2180.0],
  ["12.102.0220","railing","klil_railing_glass",4.0,8.0,1920.0],
  // Partitions (מחיצות) 12.117
  ["12.117.0100","partition","klil_partition_std",0.5,3.0,1650.0],
  ["12.117.0110","partition","klil_partition_std",3.0,6.0,1420.0],
  ["12.117.0120","partition","klil_partition_std",6.0,12.0,1180.0],
  ["12.117.0200","partition","klil_partition_glass",0.5,3.0,2250.0],
  ["12.117.0210","partition","klil_partition_glass",3.0,6.0,1980.0],
  ["12.117.0220","partition","klil_partition_glass",6.0,12.0,1720.0],
  // Grilles / Pergolas (סורגים) 12.120
  ["12.120.0100","grille","klil_grille_std",0.5,2.0,980.0],
  ["12.120.0110","grille","klil_grille_std",2.0,5.0,820.0],
  ["12.120.0120","grille","klil_grille_std",5.0,10.0,680.0],
];

// Dekel lookup (searches main DB + 2600 bands + level 2)
const dekelLookup=(op,profile,areaSqm)=>{
  const a=Math.max(areaSqm,0.6);
  const allBands=[...DB,...DB2600,...DB_L2];
  const match=allBands.find(b=>b[1]===op&&b[2]===profile&&a>=b[3]&&a<b[4]);
  if(match)return{price:match[5],code:match[0]};
  const all=allBands.filter(b=>b[1]===op&&b[2]===profile).sort((a,b)=>a[3]-b[3]);
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
const MOP_T=[
  bi("Хаза 2-трек",         "הזזה 2 מסלולים"),
  bi("Хаза 3-трек",         "הזזה 3 מסלולים"),
  bi("Поворотно-откидное",  "כיפ-כיפ"),
  bi("Откидное",             "כיפ"),
  bi("Глухое",               "פיקס"),
  bi("Карман (кис)",         "הזזה לכיס"),
  bi("Бельгийское",          "בלגי"),
  bi("Дверь хаза",           "דלת הזזה"),
  bi("Дверь поворот",        "דלת ציר"),
];
const WT=[
  bi("Железобетон","בטון מזוין"),
  bi("Кирпич","לבנים"),
  bi("Газобетон","בלוק מקציף"),
  bi("Блоки","בלוקים"),
  bi("Дерево","עץ"),
  bi("Другое","אחר"),
];
const PM={"Ожидает материалов":10,"В производстве":50,"Монтаж":85,"Завершён":100};
const fmt=n=>"₪"+Math.round(n).toLocaleString("ru-RU");
const fmtSize=b=>b<1024?b+"B":b<1048576?(b/1024).toFixed(1)+"KB":(b/1048576).toFixed(1)+"MB";
const fileIcon=t=>{if(!t)return"📎";if(t.startsWith("image/"))return"🖼️";if(t==="application/pdf")return"📄";if(t.includes("dwg")||t.includes("dxf"))return"📐";return"📎";};
const dlFile=f=>{const a=document.createElement("a");a.href=f.data;a.download=f.name;a.click();};
const exportCSV=(headers,rows,fn)=>{const csv=[headers,...rows].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");const a=document.createElement("a");a.href="data:text/csv;charset=utf-8,\uFEFF"+encodeURIComponent(csv);a.download=fn;a.click();};

// ── UI ATOMS ─────────────────────────────────────────────────
const Badge=({status})=>(<span style={{background:(SC[status]||D.muted)+"22",color:SC[status]||D.muted,
  border:`1px solid ${(SC[status]||D.muted)}44`,padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{ds(status)}</span>);

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
function Dashboard({leads,orders,payments,inventory,kpi,measurements,installations,onClientClick}){
  const today=new Date().toISOString().split("T")[0];
  const todayStr=new Date().toLocaleDateString("ru-RU",{weekday:"long",day:"numeric",month:"long"});

  // ── Today's agenda ──
  const todayMeasures=measurements.filter(m=>m.date===today);
  const todayInstalls=installations.filter(i=>i.scheduledDate===today);
  const overdueFollowUps=leads.filter(l=>l.followUp&&l.followUp<today&&!["Закрыт (выиграли)","Закрыт (проиграли)"].includes(l.status));
  const todayFollowUps=leads.filter(l=>l.followUp===today&&!["Закрыт (выиграли)","Закрыт (проиграли)"].includes(l.status));
  const pendingPayments=payments.filter(p=>p.status==="Ожидается");

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

  // ── Pipeline value ──
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

  // ── Monthly revenue ──
  const monthMap={};
  orders.forEach(o=>{
    const m=o.created?.slice(0,7)||"";
    if(!m)return;
    const MONTHS=[ui("m1"),ui("m2"),ui("m3"),ui("m4"),ui("m5"),ui("m6"),ui("m7"),ui("m8"),ui("m9"),ui("m10"),ui("m11"),ui("m12")];
    const mNum=parseInt(m.slice(5))-1;
    const label=`${MONTHS[mNum]||m.slice(5)} ${m.slice(2,4)}`;
    if(!monthMap[m])monthMap[m]={month:label,key:m,revenue:0,paid:0,profit:0,count:0};
    monthMap[m].revenue+=o.total;
    monthMap[m].paid+=o.paid;
    monthMap[m].profit+=Math.round(o.paid*0.35);
    monthMap[m].count++;
  });
  const revenueChart=Object.values(monthMap).sort((a,b)=>a.key.localeCompare(b.key)).slice(-8);

  const lowStock=inventory.filter(i=>i.qty<i.minQty).length;
  const pending=payments.filter(p=>p.status==="Ожидается");
  const pendInst=installations.filter(i=>i.status==="Запланирован"||i.status==="В процессе").length;

  const hasTodayItems=todayMeasures.length>0||todayInstalls.length>0||todayFollowUps.length>0||overdueFollowUps.length>0||pendingPayments.length>0;

  return(<div>
    <div style={{marginBottom:18,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
      <div>
        <div style={{fontSize:22,fontWeight:900,color:D.text}}>Dashboard</div>
        <div style={{fontSize:13,color:D.muted,marginTop:2}}>Реальные данные из системы</div>
      </div>
      <div style={{fontSize:12,color:D.muted,textAlign:"right"}}>
        <div style={{fontSize:11,color:D.muted}}>📅 {todayStr}</div>
      </div>
    </div>

    {/* TODAY WIDGET */}
    {hasTodayItems&&(<div style={{background:`linear-gradient(135deg,${D.accent}18,${D.surface})`,
      border:`1px solid ${D.accent}40`,borderRadius:14,padding:16,marginBottom:18}}>
      <div style={{fontSize:11,fontWeight:800,color:D.accentLight,textTransform:"uppercase",marginBottom:10,
        display:"flex",alignItems:"center",gap:6}}>
        ⚡ Сегодня
        <span style={{fontSize:10,color:D.muted,fontWeight:400}}>— {todayStr}</span>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
        {overdueFollowUps.length>0&&(<div style={{background:D.red+"15",border:`1px solid ${D.red}30`,
          borderRadius:8,padding:"6px 12px",flex:1,minWidth:140}}>
          <div style={{fontSize:10,color:D.red,fontWeight:700,marginBottom:4}}>🔴 Просроченные follow-up</div>
          {overdueFollowUps.slice(0,3).map(l=>(
            <div key={l.id} onClick={()=>onClientClick&&onClientClick(l.name)}
              style={{fontSize:11,color:D.text,cursor:"pointer",padding:"2px 0",
                display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontWeight:600}}>{l.name}</span>
              <a href={l.phone?`tel:${l.phone}`:undefined}
                onClick={e=>e.stopPropagation()}
                style={{color:D.green,fontSize:10,textDecoration:"none",
                  background:D.green+"15",padding:"1px 6px",borderRadius:4}}>
                📞
              </a>
            </div>
          ))}
          {overdueFollowUps.length>3&&<div style={{fontSize:10,color:D.muted}}>+{overdueFollowUps.length-3} ещё</div>}
        </div>)}
        {todayFollowUps.length>0&&(<div style={{background:D.yellow+"15",border:`1px solid ${D.yellow}30`,
          borderRadius:8,padding:"6px 12px",flex:1,minWidth:140}}>
          <div style={{fontSize:10,color:D.yellow,fontWeight:700,marginBottom:4}}>🟡 Follow-up сегодня</div>
          {todayFollowUps.map(l=>(
            <div key={l.id} onClick={()=>onClientClick&&onClientClick(l.name)}
              style={{fontSize:11,color:D.text,cursor:"pointer",padding:"2px 0",
                display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontWeight:600}}>{l.name}</span>
              <a href={l.phone?`tel:${l.phone}`:undefined}
                onClick={e=>e.stopPropagation()}
                style={{color:D.green,fontSize:10,textDecoration:"none",
                  background:D.green+"15",padding:"1px 6px",borderRadius:4}}>
                📞
              </a>
            </div>
          ))}
        </div>)}
        {todayMeasures.length>0&&(<div style={{background:D.teal+"15",border:`1px solid ${D.teal}30`,
          borderRadius:8,padding:"6px 12px",flex:1,minWidth:140}}>
          <div style={{fontSize:10,color:D.teal,fontWeight:700,marginBottom:4}}>📐 Замеры сегодня</div>
          {todayMeasures.map(m=>(
            <div key={m.id} onClick={()=>onClientClick&&onClientClick(m.client)}
              style={{fontSize:11,color:D.text,cursor:"pointer",fontWeight:600,padding:"2px 0",
                display:"flex",justifyContent:"space-between"}}>
              <span>{m.client}</span>
              <span style={{color:D.muted,fontSize:10}}>{m.address?.slice(0,15)||""}</span>
            </div>
          ))}
        </div>)}
        {todayInstalls.length>0&&(<div style={{background:D.purple+"15",border:`1px solid ${D.purple}30`,
          borderRadius:8,padding:"6px 12px",flex:1,minWidth:140}}>
          <div style={{fontSize:10,color:D.purple,fontWeight:700,marginBottom:4}}>🔧 Монтажи сегодня</div>
          {todayInstalls.map(i=>(
            <div key={i.id} onClick={()=>onClientClick&&onClientClick(i.client)}
              style={{fontSize:11,color:D.text,cursor:"pointer",fontWeight:600,padding:"2px 0"}}>
              {i.client}
            </div>
          ))}
        </div>)}
        {pendingPayments.length>0&&(<div style={{background:D.green+"15",border:`1px solid ${D.green}30`,
          borderRadius:8,padding:"6px 12px",flex:1,minWidth:140}}>
          <div style={{fontSize:10,color:D.green,fontWeight:700,marginBottom:4}}>💰 Ожидаются платежи</div>
          {pendingPayments.slice(0,3).map(p=>(
            <div key={p.id} style={{fontSize:11,color:D.text,padding:"2px 0",
              display:"flex",justifyContent:"space-between"}}>
              <span style={{fontWeight:600}}>{p.client}</span>
              <span style={{color:D.green,fontWeight:700}}>{fmt(p.amount)}</span>
            </div>
          ))}
          <div style={{fontSize:10,color:D.green,fontWeight:700,marginTop:2}}>
            Итого: {fmt(pendingPayments.reduce((s,p)=>s+p.amount,0))}
          </div>
        </div>)}
      </div>
    </div>)}

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
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:800,color:D.muted}}>📈 ВЫРУЧКА ПО МЕСЯЦАМ</div>
          <div style={{display:"flex",gap:12,fontSize:10,color:D.muted}}>
            <span><span style={{display:"inline-block",width:10,height:10,background:D.accentLight+"90",borderRadius:2,marginRight:3}}/>КП</span>
            <span><span style={{display:"inline-block",width:10,height:10,background:D.green,borderRadius:2,marginRight:3}}/>Получено</span>
            <span><span style={{display:"inline-block",width:10,height:2,background:D.yellow,marginRight:3,verticalAlign:"middle"}}/>Прибыль</span>
          </div>
        </div>
        {revenueChart.length>0?(
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={revenueChart} barGap={3} margin={{top:5,right:5,bottom:0,left:0}}>
              <XAxis dataKey="month" stroke={D.muted} tick={{fontSize:10,fill:D.muted}}/>
              <YAxis stroke={D.muted} tick={{fontSize:9,fill:D.muted}} tickFormatter={v=>v>=1000?"₪"+Math.round(v/1000)+"k":"₪"+v} width={42}/>
              <Tooltip content={<TT/>}/>
              <Bar dataKey="revenue" name="КП сумма" fill={D.accentLight+"70"} radius={[4,4,0,0]}/>
              <Bar dataKey="paid" name="Получено" fill={D.green+"cc"} radius={[4,4,0,0]}/>
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
              <div style={{width:max>0?`${Math.min(value/max*100,100)}%`:"0%",height:"100%",borderRadius:4,background:color,transition:"width 0.4s"}}/>
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
const PRIORITIES=[
  {id:"urgent", label:"🔴 Срочно",  color:"#EF4444"},
  {id:"high",   label:"🟡 Высокий", color:"#F59E0B"},
  {id:"normal", label:"⚪ Обычный", color:"#4A607A"},
];
const JOB_TYPES=["Новый проект","Ремонт","Замена окна","По чертежу"];
const KANBAN_COLS=[
  {id:"Новый лид",          label:"Новый лид",         color:"#3B82F6"},
  {id:"Замер назначен",     label:"Замер назначен",     color:"#8B5CF6"},
  {id:"КП отправлено",      label:"КП отправлено",      color:"#F59E0B"},
  {id:"Follow-up",          label:"Follow-up",          color:"#EC4899"},
  {id:"Закрыт (выиграли)",  label:"✅ Выиграли",        color:"#10B981"},
  {id:"Закрыт (проиграли)", label:"❌ Проиграли",       color:"#EF4444"},
];

const EMPTY_LEAD=()=>({name:"",phone:"",city:"",type:"Частный",jobType:"Новый проект",
  windows:"1",source:"Google Ads",status:"Новый лид",priority:"normal",
  value:"",followUp:"",notes:""});

function Leads({leads,setLeads,onClientClick}){
  const [view,setView]=useState("kanban");
  const [search,setSearch]=useState("");
  const [modal,setModal]=useState(false);
  const [edit,setEdit]=useState(null);
  const [form,setForm]=useState(EMPTY_LEAD());

  const filtered=leads.filter(l=>
    l.name.toLowerCase().includes(search.toLowerCase())||
    (l.phone||"").includes(search)||(l.city||"").toLowerCase().includes(search.toLowerCase()));

  const openAdd=(status="Новый лид")=>{setEdit(null);setForm({...EMPTY_LEAD(),status});setModal(true);};
  const openEdit=l=>{setEdit(l.id);setForm({...EMPTY_LEAD(),...l,windows:String(l.windows||1),value:String(l.value||0)});setModal(true);};
  const submit=()=>{
    if(!form.name||!form.phone)return;
    const data={...form,windows:+form.windows||1,value:+form.value||0,date:new Date().toISOString().split("T")[0]};
    if(edit) setLeads(p=>p.map(l=>l.id===edit?{...data,id:edit}:l));
    else setLeads(p=>[...p,{...data,id:Date.now()}]);
    setModal(false);
  };

  const pColor=id=>PRIORITIES.find(p=>p.id===id)?.color||D.muted;
  const pLabel=id=>PRIORITIES.find(p=>p.id===id)?.label||"";

  const today=new Date().toISOString().split("T")[0];
  const overdueFollowUp=l=>l.followUp&&l.followUp<today&&!["Закрыт (выиграли)","Закрыт (проиграли)"].includes(l.status);

  // ── KANBAN CARD ──
  const KanbanCard=({l})=>(
    <div style={{background:D.card,border:`1px solid ${overdueFollowUp(l)?D.red+"60":D.border}`,
      borderRadius:10,padding:12,marginBottom:8,cursor:"pointer",
      borderLeft:`3px solid ${SC[l.status]||D.muted}`}}
      onClick={()=>openEdit(l)}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
        <div onClick={()=>onClientClick&&onClientClick(l.name)} style={{fontSize:13,fontWeight:800,color:D.text,lineHeight:1.3,flex:1,paddingRight:4,cursor:"pointer"}}
          title="Открыть карточку клиента">{l.name}</div>
        <span style={{fontSize:9,color:pColor(l.priority),fontWeight:800,whiteSpace:"nowrap"}}>{pLabel(l.priority)}</span>
      </div>
      {l.jobType&&<div style={{display:"inline-block",background:D.surface,border:`1px solid ${D.border}`,
        borderRadius:4,padding:"1px 6px",fontSize:9,color:D.muted,fontWeight:700,marginBottom:5}}>{l.jobType}</div>}
      <div style={{fontSize:11,color:D.muted,marginBottom:4}}>📞 {l.phone}</div>
      {l.city&&<div style={{fontSize:10,color:D.muted}}>📍 {l.city}</div>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6,paddingTop:6,borderTop:`1px solid ${D.border}`}}>
        <span style={{fontSize:12,fontWeight:800,color:D.green}}>{l.value>0?fmt(l.value):"—"}</span>
        {l.followUp&&<span style={{fontSize:9,fontWeight:700,
          color:overdueFollowUp(l)?D.red:D.teal,background:(overdueFollowUp(l)?D.red:D.teal)+"18",
          borderRadius:4,padding:"2px 5px"}}>
          📅 {overdueFollowUp(l)?"Просрочен!":l.followUp}
        </span>}
      </div>
    </div>
  );

  return(<div>
    {/* Header */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <div>
        <div style={{fontSize:22,fontWeight:900,color:D.text}}>CRM · Лиды</div>
        <div style={{fontSize:13,color:D.muted}}>{leads.length} в базе · {leads.filter(l=>overdueFollowUp(l)).length>0&&
          <span style={{color:D.red,fontWeight:700}}>{leads.filter(l=>overdueFollowUp(l)).length} просроченных follow-up</span>}</div>
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        {/* View toggle */}
        <div style={{display:"flex",background:D.surface,border:`1px solid ${D.border}`,borderRadius:8,padding:2}}>
          {[["kanban","⬛ Kanban"],["list","☰ Список"]].map(([v,lbl])=>(
            <button key={v} onClick={()=>setView(v)} style={{padding:"4px 12px",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer",border:"none",
              background:view===v?"linear-gradient(135deg,#2563EB,#1D4ED8)":"transparent",
              color:view===v?"#fff":D.muted}}>
              {lbl}
            </button>
          ))}
        </div>
        <Btn onClick={()=>exportCSV(["Имя","Телефон","Город","Тип","Работа","Статус","Приоритет","Сумма","Follow-up","Дата"],
          leads.map(l=>[l.name,l.phone,l.city,l.type,l.jobType||"",l.status,l.priority||"",l.value,l.followUp||"",l.date]),"лиды.csv")} variant="ghost">
          <Download size={13}/> CSV
        </Btn>
        <Btn onClick={()=>openAdd()}><Plus size={13}/> Новый лид</Btn>
      </div>
    </div>

    {/* Search */}
    <div style={{position:"relative",marginBottom:16}}>
      <Search size={12} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:D.muted}}/>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Поиск по имени, телефону, городу..."
        style={{width:"100%",background:D.card,border:`1px solid ${D.border}`,borderRadius:8,
          padding:"8px 10px 8px 30px",color:D.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
    </div>

    {/* ── KANBAN VIEW ── */}
    {view==="kanban"&&(
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10,overflowX:"auto",paddingBottom:8}}>
        {KANBAN_COLS.map(col=>{
          const colLeads=filtered.filter(l=>l.status===col.id);
          const colValue=colLeads.reduce((s,l)=>s+(l.value||0),0);
          return(
            <div key={col.id} style={{background:D.surface,borderRadius:12,padding:10,minWidth:200,borderTop:`3px solid ${col.color}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div>
                  <div style={{fontSize:11,fontWeight:800,color:col.color}}>{col.label}</div>
                  <div style={{fontSize:10,color:D.muted}}>{colLeads.length} · {colValue>0?fmt(colValue):""}</div>
                </div>
                <button onClick={()=>openAdd(col.id)} style={{background:D.border,border:"none",borderRadius:6,
                  width:22,height:22,color:D.muted,cursor:"pointer",fontSize:16,lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
              </div>
              <div style={{minHeight:60}}>
                {colLeads.map(l=><KanbanCard key={l.id} l={l}/>)}
                {colLeads.length===0&&<div style={{fontSize:10,color:D.muted,textAlign:"center",paddingTop:16,opacity:0.5}}>Пусто</div>}
              </div>
            </div>
          );
        })}
      </div>
    )}

    {/* ── LIST VIEW ── */}
    {view==="list"&&(
      <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1.1fr 0.8fr 0.8fr 1.2fr 1fr 1fr 56px",
          padding:"8px 14px",background:D.surface,gap:8}}>
          {["Клиент / Работа","Телефон","Город","Приоритет","Статус","Оценка","Follow-up",""].map((h,i)=>(
            <div key={i} style={{fontSize:9,fontWeight:800,color:D.muted,textTransform:"uppercase"}}>{h}</div>))}
        </div>
        {filtered.length===0&&<div style={{padding:40,textAlign:"center",color:D.muted}}>Нет лидов</div>}
        {filtered.map((l,i)=>(
          <div key={l.id} style={{display:"grid",gridTemplateColumns:"2fr 1.1fr 0.8fr 0.8fr 1.2fr 1fr 1fr 56px",
            padding:"10px 14px",gap:8,alignItems:"center",
            background:overdueFollowUp(l)?D.red+"08":i%2===0?D.card:D.surface,
            borderTop:`1px solid ${D.border}`,borderLeft:`3px solid ${SC[l.status]||D.muted}`}}>
            <div>
              <div onClick={()=>onClientClick&&onClientClick(l.name)} style={{fontSize:13,fontWeight:700,color:D.text,cursor:"pointer"}}>{l.name}</div>
              <div style={{fontSize:10,color:D.muted}}>{l.jobType||l.type} · {l.source} · {l.date}</div>
            </div>
            <a href={`tel:${l.phone}`} style={{fontSize:12,color:D.green,fontWeight:700,textDecoration:"none",display:"flex",alignItems:"center",gap:3}}>
              <Phone size={10}/>{l.phone}
            </a>
            <div style={{fontSize:12,color:D.muted}}>{l.city}</div>
            <div style={{fontSize:11,fontWeight:700,color:pColor(l.priority)}}>{pLabel(l.priority)}</div>
            <select value={l.status} onChange={e=>setLeads(p=>p.map(x=>x.id===l.id?{...x,status:e.target.value}:x))}
              style={{background:(SC[l.status]||D.muted)+"18",color:SC[l.status]||D.muted,
                border:`1px solid ${(SC[l.status]||D.muted)}40`,borderRadius:6,padding:"3px 6px",fontSize:11,fontWeight:700,cursor:"pointer"}}>
              {LST.map(s=><option key={s} value={s} style={{background:D.card,color:D.text}}>{s}</option>)}
            </select>
            <div style={{fontSize:13,fontWeight:700,color:D.green}}>{l.value>0?fmt(l.value):"—"}</div>
            <div style={{fontSize:10,fontWeight:700,color:overdueFollowUp(l)?D.red:D.teal}}>
              {l.followUp||(overdueFollowUp(l)?"⚠️ Просрочен":"")||"—"}
            </div>
            <div style={{display:"flex",gap:3}}>
              <button onClick={()=>openEdit(l)} style={{background:"none",border:"none",cursor:"pointer",color:D.muted,padding:3}}><Eye size={12}/></button>
              <button onClick={()=>setLeads(p=>p.filter(x=>x.id!==l.id))} style={{background:"none",border:"none",cursor:"pointer",color:D.muted,padding:3}}><Trash2 size={12}/></button>
            </div>
          </div>
        ))}
      </div>
    )}

    {/* ── MODAL ── */}
    {modal&&(<Modal title={edit?"✏️ Редактировать лид":"➕ Новый лид"} onClose={()=>setModal(false)} wide>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Inp label="Имя *" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/>
        <Inp label="Телефон *" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
        <Inp label="Город" value={form.city} onChange={e=>setForm(p=>({...p,city:e.target.value}))}/>
        <Sel label="Тип клиента" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} options={["Частный","Подрядчик","Архитектор","Застройщик"]}/>
        <Inp label="Кол-во окон" value={form.windows} onChange={e=>setForm(p=>({...p,windows:e.target.value}))} type="number"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Sel label="Тип работы" value={form.jobType} onChange={e=>setForm(p=>({...p,jobType:e.target.value}))} options={JOB_TYPES}/>
        <Sel label="Источник" value={form.source} onChange={e=>setForm(p=>({...p,source:e.target.value}))} options={["Google Ads","Google Maps","Рекомендация","Instagram","Архитектор","Прораб","Повторный клиент"]}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10}}>
        <Sel label="Статус" value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))} options={LST}/>
        <div style={{marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,color:D.muted,marginBottom:4,textTransform:"uppercase"}}>Приоритет</div>
          <div style={{display:"flex",gap:5}}>
            {PRIORITIES.map(pr=>(
              <button key={pr.id} onClick={()=>setForm(p=>({...p,priority:pr.id}))}
                style={{flex:1,padding:"6px 4px",borderRadius:6,fontSize:10,fontWeight:700,cursor:"pointer",
                  border:`1px solid ${form.priority===pr.id?pr.color:D.border}`,
                  background:form.priority===pr.id?pr.color+"25":"transparent",
                  color:form.priority===pr.id?pr.color:D.muted}}>
                {pr.label}
              </button>
            ))}
          </div>
        </div>
        <Inp label="Оценка ₪" value={form.value} onChange={e=>setForm(p=>({...p,value:e.target.value}))} type="number"/>
        <Inp label="Follow-up дата" value={form.followUp} onChange={e=>setForm(p=>({...p,followUp:e.target.value}))} type="date"/>
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

function Measurements({measurements,setMeasurements,onOpenCalc,leads,setLeads,onClientClick}){
  const [modal,setModal]=useState(false);
  const [viewM,setViewM]=useState(null);
  const [editId,setEditId]=useState(null);
  const ef=()=>({client:"",phone:"",address:"",date:new Date().toISOString().split("T")[0],
    specialist:"",status:"Запланирован",leadId:"",mode:"Выезд",
    openings:[{id:Date.now(),room:"",width:"",height:"",type:"Хаза 2-трек",qty:1,notes:""}],
    wallType:"Железобетон",floor:"1",crane:false,demolition:false,installNotes:"",files:[]});
  const [form,setForm]=useState(ef());
  const openAdd=()=>{setEditId(null);setForm(ef());setModal(true);};
  const openEdit=m=>{setEditId(m.id);setForm({...m,openings:(m.openings||[]).map(o=>({...o})),files:(m.files||[]).map(f=>({...f}))});setModal(true);};
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
  const totalArea=m=>(m.openings||[]).reduce((s,o)=>s+(parseFloat(o.width)||0)/100*(parseFloat(o.height)||0)/100*(parseInt(o.qty)||1),0);

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
                <div onClick={()=>onClientClick&&onClientClick(m.client)} style={{fontSize:15,fontWeight:800,color:D.text,cursor:"pointer"}}>{m.client}</div>
                {m.phone&&<a href={`tel:${m.phone}`} style={{fontSize:12,color:D.green,fontWeight:700,textDecoration:"none",display:"flex",alignItems:"center",gap:4,marginTop:2}}>
                  <Phone size={11}/>{m.phone}
                </a>}
                <div style={{fontSize:11,color:D.muted,marginTop:2}}>{m.address}</div>
                <div style={{display:"flex",gap:10,marginTop:6,flexWrap:"wrap"}}>
                  <span style={{fontSize:11,color:D.muted}}>📅 {m.date}</span>
                  {m.mode==="По чертежу"&&<span style={{fontSize:10,fontWeight:700,color:D.teal,background:D.teal+"18",borderRadius:4,padding:"1px 5px"}}>📄 По чертежу</span>}
                  {m.specialist&&<span style={{fontSize:11,color:D.muted}}>👤 {m.specialist}</span>}
                  <span style={{fontSize:11,color:D.muted}}>🪟 {(m.openings||[]).length} проёмов</span>
                  <span style={{fontSize:11,color:D.green,fontWeight:700}}>📐 {area.toFixed(2)} м²</span>
                  {(m.files||[]).length>0&&<span style={{fontSize:11,color:D.muted}}>📎 {(m.files||[]).length} файлов</span>}
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
          {(m.openings||[]).length>0&&(<div style={{marginTop:12,background:D.surface,borderRadius:8,overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"1.5fr 80px 80px 1.5fr 50px 1fr",padding:"5px 10px",gap:8}}>
              {["Помещение","Ш (см)","В (см)","Тип","Кол","Заметки"].map((h,i)=>(<div key={i} style={{fontSize:9,fontWeight:800,color:D.muted,textTransform:"uppercase"}}>{h}</div>))}
            </div>
            {(m.openings||[]).map((o,i)=>(<div key={o.id} style={{display:"grid",gridTemplateColumns:"1.5fr 80px 80px 1.5fr 50px 1fr",
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
    {modal&&(<Modal title={editId?"✏️ Редактировать":"📐 Новый замер / По чертежу"} onClose={()=>setModal(false)} wide>
      {/* Mode toggle */}
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {[["Выезд","🚗 Выезд на замер"],["По чертежу","📄 По чертежу / списку"]].map(([v,lbl])=>(
          <button key={v} onClick={()=>setForm(f=>({...f,mode:v}))}
            style={{flex:1,padding:"9px",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer",
              border:`2px solid ${form.mode===v?D.accent:D.border}`,
              background:form.mode===v?D.accent+"20":"transparent",
              color:form.mode===v?D.accentLight:D.muted}}>
            {lbl}
          </button>
        ))}
      </div>
      {form.mode==="По чертежу"&&(
        <div style={{background:D.teal+"12",border:`1px solid ${D.teal}30`,borderRadius:8,padding:"8px 12px",marginBottom:12,fontSize:11,color:D.teal}}>
          📄 Введи размеры окон из чертежа или списка клиента → сразу «В калькулятор» без выезда
        </div>
      )}
      <SH title="👤 Клиент и объект"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Inp label="Имя клиента *" value={form.client} onChange={e=>setForm(f=>({...f,client:e.target.value}))}/>
        <Inp label="Телефон" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/>
      </div>
      <Inp label="Адрес объекта" value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
        <Inp label="Дата" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} type="date"/>
        <Inp label={form.mode==="По чертежу"?"Ответственный":"Специалист (выезд)"} value={form.specialist} onChange={e=>setForm(f=>({...f,specialist:e.target.value}))}/>
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
          {(form.openings||[]).some(o=>o.width&&o.height)&&<><b style={{color:D.green}}>{(form.openings||[]).reduce((s,o)=>s+(parseFloat(o.width)||0)/100*(parseFloat(o.height)||0)/100*(parseInt(o.qty)||1),0).toFixed(2)} м²</b></>}
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
      {(form.files||[]).length>0&&(<div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:10}}>
        {(form.files||[]).map(f=>(<div key={f.id} style={{position:"relative",background:D.surface,border:`1px solid ${D.border}`,borderRadius:10,overflow:"hidden",width:f.isImage?100:180}}>
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
function printKP(client,calced,saleTotal,margin,split,extras,company={}){
  const pay1=Math.round(saleTotal*split/100);
  const pay2=saleTotal-pay1;
  const date=new Date().toLocaleDateString("he-IL");
  const validItems=calced.filter(c=>c.valid);
  const rows=validItems.map((c,i)=>{
    const linePrice=Math.round(c.totalCost/c.qty*(1+margin/100))*c.qty;
    const unitPrice=Math.round(c.totalCost/c.qty*(1+margin/100));
    const glassName=c.glass!=="none"?t(DG.find(g=>g.id===c.glass)?.name)||"":"";
    const screenOpt=DS.find(s=>s.id===c.screen)||DS[0];
    const shutterOpt=DSHT.find(s=>s.id===c.shutter)||DSHT[0];
    const colorOpt=PCOLORS.find(x=>x.id===(c.color||"white"))||PCOLORS[0];
    const winPrice=Math.round((c.baseDekel+c.glassAddon)*c.install/c.qty*(1+margin/100));
    const winTotal=winPrice*c.qty;
    // Color swatch for PDF
    const colorSwatch=`<span style="display:inline-block;width:12px;height:12px;background:${colorOpt.hex};border:1px solid #ccc;border-radius:2px;vertical-align:middle;margin-left:4px"></span>`;
    let html=`<tr>
      <td style="text-align:center">${i+1}</td>
      <td><b>${c.name}</b>
        ${glassName?`<br/><span class="sub">זכוכית: ${glassName}</span>`:""}
        <br/><span class="sub">${t(OPS.find(o=>o.id===c.op)?.name)||c.op} · ${t(PNAMES[c.profile])||c.profile}</span>
        <br/><span class="sub">צבע: ${colorOpt.name.split("|")[1]?.trim()||colorOpt.name.split("|")[0].trim()} ${colorSwatch} ${colorOpt.ral}</span>
      </td>
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
        <td style="padding-right:24px"><span style="color:#16a34a">↳ ${t(screenOpt.name)||"screen"}</span></td>
        <td colspan="2"></td><td style="text-align:center">${c.qty}</td>
        <td style="color:#16a34a">₪${sp.toLocaleString("he-IL")}</td>
        <td style="color:#16a34a;font-weight:700">₪${(sp*c.qty).toLocaleString("he-IL")}</td>
      </tr>`;
    }
    // Shutter sub-row
    if(c.shutter!=="none"){
      const shp=Math.round((shutterOpt.dekelM2*(shutterOpt.marketFactor||1.38)*c.billArea+shutterOpt.motor*c.qty)*(1+margin/100));
      html+=`<tr style="background:#fffbeb">
        <td></td>
        <td style="padding-right:24px"><span style="color:#d97706">↳ ${t(shutterOpt.name)||"shutter"}</span></td>
        <td style="text-align:center">${c.w}×${c.h} ס"מ</td>
        <td style="text-align:center">${c.area.toFixed(2)} מ"ר</td>
        <td style="text-align:center">${c.qty}</td>
        <td style="color:#d97706">—</td>
        <td style="color:#d97706;font-weight:700">₪${shp.toLocaleString("he-IL")}</td>
      </tr>`;
    }
    // Accessories sub-rows
    if(c.accessories&&c.accessories.length>0){
      c.accessories.forEach(a=>{
        const acc=DACC.find(d=>d.id===a.id);
        if(!acc)return;
        const ap=Math.round(acc.price*(a.qty||1)*c.qty*(1+margin/100));
        html+=`<tr style="background:#f0f9ff">
          <td></td>
          <td style="padding-right:24px"><span style="color:#0369a1">↳ ${t(acc.name)} (${acc.code})</span></td>
          <td colspan="2"></td>
          <td style="text-align:center">${(a.qty||1)*c.qty}</td>
          <td style="color:#0369a1">₪${Math.round(acc.price*(1+margin/100)).toLocaleString("he-IL")}</td>
          <td style="color:#0369a1;font-weight:700">₪${ap.toLocaleString("he-IL")}</td>
        </tr>`;
      });
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
      <div class="logo">🏭 ${company.name||"חלונות אלומיניום"}</div>
      <div class="logo-sub">${company.nameRu||"ייצור והתקנה של חלונות ודלתות אלומיניום"}</div>
      ${company.phone?`<div class="logo-sub">📞 ${company.phone}</div>`:""}
      ${company.address?`<div class="logo-sub">📍 ${company.address}</div>`:""}
      ${company.taxId?`<div class="logo-sub">ח.פ. / ע.מ.: ${company.taxId}</div>`:""}
    </div>
    <div class="meta">
      <div>תאריך: <b>${date}</b></div>
      <div>הצעת מחיר מספר: <b>QT-${Date.now().toString().slice(-6)}</b></div>
      ${company.email?`<div>דוא"ל: <b>${company.email}</b></div>`:""}
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

  ${company.bank||company.bankAccount?`
  <div style="margin-top:16px;padding:12px 16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;font-size:12px;color:#475569">
    <b style="color:#1e293b">פרטי בנק לתשלום:</b>
    ${company.bank?`<span style="margin-right:12px">🏦 ${company.bank}</span>`:""}
    ${company.bankAccount?`<span>חשבון: <b>${company.bankAccount}</b></span>`:""}
  </div>`:""}
  <div class="footer">${company.name||"WindowOS"} · הצעה זו הופקה באופן אוטומטי · ${date}</div>
  </body></html>`;
  const w=window.open("","_blank","width=900,height=750");
  if(!w){alert("Браузер заблокировал всплывающее окно. Разрешите pop-ups для этого сайта.");return;}
  w.document.write(html);w.document.close();
  setTimeout(()=>w.print(),500);
}

// ── PROFILE COLORS ────────────────────────────────────────────
const PCOLORS=[
  {id:"white",    name:bi("Белый","לבן"),          ral:"RAL 9016", hex:"#F4F4F4", price:0},
  {id:"bronze",   name:bi("Бронза","ברונזה"),       ral:"RAL 8019", hex:"#4A3728", price:180},
  {id:"anthracite",name:bi("Антрацит","אנטרציט"),  ral:"RAL 7016", hex:"#293133", price:180},
  {id:"silver",   name:bi("Серый серебро","כסף"),   ral:"RAL 9006", hex:"#A8A9A1", price:120},
  {id:"gold",     name:bi("Золото","זהב"),           ral:"RAL 1036", hex:"#B8973E", price:220},
  {id:"wood_oak", name:bi("Дуб натуральный","אלון"),ral:"Декор",    hex:"#8B6914", price:280},
  {id:"wood_dark",name:bi("Тёмное дерево","עץ כהה"),ral:"Декор",   hex:"#3E2001", price:280},
  {id:"black",    name:bi("Чёрный","שחור"),          ral:"RAL 9005", hex:"#0E0E10", price:240},
  {id:"custom",   name:bi("RAL по заказу","RAL מיוחד"),ral:"Custom",hex:"#888888", price:350},
];

function newItem(name,op,profile,w,h,qty){
  return{id:Date.now()+Math.random(),name:name||"Окно",op:op||"sliding_2_track",
    profile:profile||"klil_7000",w:w||120,h:h||140,qty:qty||1,
    glass:"none",screen:"none",shutter:"none",install:1.10,
    accessories:[],color:"white"};
}

function Calc({preload,setPreload,setOrders,orders,leads,setLeads,quotes,setQuotes,templates,setTemplates,setActivity,company}){
  const [tab,setTab]=useState("quick");
  const [items,setItems]=useState([newItem("Окно 1")]);
  const [client,setClient]=useState("");
  const [margin,setMargin]=useState(40);
  const [split,setSplit]=useState(40);
  const [shutterFactor,setShutterFactor]=useState(1.38);
  const [tplModal,setTplModal]=useState(false);
  const [tplName,setTplName]=useState("");
  const [loadModal,setLoadModal]=useState(false); // "quote" | "template" | false
  // Extras from measurement
  const [extras,setExtras]=useState({demolition:false,crane:false,floor:"1",wallType:"Железобетон",
    demolitionPrice:800,cranePrice:1200,highFloorPrice:0});

  // Load from measurement
  useEffect(()=>{
    if(!preload)return;
    setClient(preload.client||"");
    const newItems=(preload.openings||[]).filter(o=>o.width&&o.height).map(o=>{
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
    // Accessories cost (not multiplied by install factor — direct cost)
    const accCost=(it.accessories||[]).reduce((s,a)=>{
      const acc=DACC.find(d=>d.id===a.id);
      return s+(acc?acc.price*(a.qty||1)*it.qty:0);
    },0);
    const colorOpt=PCOLORS.find(c=>c.id===(it.color||"white"))||PCOLORS[0];
    const colorCost=colorOpt.price*it.qty;
    const totalCost=(baseDekel+glassAddon+screenAddon+shutterAddon)*it.install+accCost+colorCost;
    return{...it,area,billArea,baseDekel,glassAddon,screenAddon,shutterAddon,accCost,colorCost,totalCost,code:lookup.code,shutterOpt,valid:true};
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
    setLeads(p=>p.map(l=>l.name===client?{...l,status:"Закрыт (выиграли)",value:saleTotal}:l));
    if(setActivity)addActivity(setActivity,client,"order",`📦 Создан заказ ${id} на ${fmt(saleTotal)}`);
    alert(`Заказ ${id} создан! Лид обновлён.`);
  };

  const saveQuote=()=>{
    if(!client)return alert("Укажи имя клиента");
    if(!setQuotes)return;
    const id="QT-"+Date.now().toString().slice(-6);
    const rec={id,client,date:new Date().toISOString().split("T")[0],
      total:saleTotal,margin,split,status:"Черновик",
      items:calced.filter(c=>c.valid).map(c=>({
        name:c.name,w:c.w,h:c.h,qty:c.qty,op:c.op,profile:c.profile,
        glass:c.glass,screen:c.screen,shutter:c.shutter,color:c.color,
        accessories:c.accessories||[],totalCost:c.totalCost,code:c.code
      })),
      extras:{...extras},notes:""};
    setQuotes(p=>[rec,...p]);
    if(setActivity)addActivity(setActivity,client,"kp",`📋 КП сохранено ${id} на ${fmt(saleTotal)}`);
    alert(`КП ${id} сохранено в историю!`);
  };

  const loadFromQuote=(q)=>{
    setClient(q.client||"");
    setMargin(q.margin||40);
    setSplit(q.split||40);
    if(q.extras)setExtras(q.extras);
    const loaded=(q.items||[]).map(it=>({
      ...newItem(it.name,it.op,it.profile,it.w,it.h,it.qty),
      glass:it.glass||"none",screen:it.screen||"none",
      shutter:it.shutter||"none",color:it.color||"white",
      accessories:it.accessories||[],
    }));
    if(loaded.length)setItems(loaded);
    setLoadModal(false);
    alert(`КП ${q.id} загружено в калькулятор!`);
  };

  const saveTemplate=()=>{
    if(!tplName.trim())return;
    if(!setTemplates)return;
    const tpl={id:"TPL-"+Date.now().toString().slice(-6),
      name:tplName.trim(),
      date:new Date().toISOString().split("T")[0],
      margin,split,
      items:items.map(it=>({...it}))};
    setTemplates(p=>[tpl,...p]);
    setTplModal(false);setTplName("");
    alert(`Шаблон «${tpl.name}» сохранён!`);
  };

  const loadFromTemplate=(tpl)=>{
    setMargin(tpl.margin||40);setSplit(tpl.split||40);
    const loaded=(tpl.items||[]).map(it=>({...it,id:Date.now()+Math.random()}));
    if(loaded.length)setItems(loaded);
    setLoadModal(false);
    alert(`Шаблон «${tpl.name}» загружен!`);
  };

  // Size validation for current item
  const sizeWarning=(it)=>{
    const dims=PDIMS[it.profile];
    if(!dims)return null;
    const wCm=it.w, hCm=it.h;
    if(dims.maxW&&wCm*10>dims.maxW)return`⚠️ Ширина ${wCm*10}мм > макс. ${dims.maxW}мм для ${PNAMES[it.profile]}`;
    if(dims.maxH&&hCm*10>dims.maxH)return`⚠️ Высота ${hCm*10}мм > макс. ${dims.maxH}мм для ${PNAMES[it.profile]}`;
    return null;
  };
  // Auto-suggest 2600 config by width
  const suggest2600Config=(wCm)=>{
    const wMm=wCm*10;
    if(wMm<=3270)return"klil_2600_2t";
    if(wMm<=4300)return"klil_2600_3t";
    return"klil_2600_3s";
  };

  const [profModal,setProfModal]=useState(null); // itemId with profile picker open
  const [accDropdown,setAccDropdown]=useState(null); // "itemId_catId"

  const ProfileSel=({it})=>{
    const op=OPS.find(o=>o.id===it.op)||OPS[0];
    const isOpen=profModal===it.id;
    const dims=PDIMS[it.profile];
    const is2600=it.op==="lift_slide_2600";
    return(<div style={{position:"relative"}}>
      {/* Trigger button */}
      <button onClick={()=>setProfModal(isOpen?null:it.id)}
        style={{width:"100%",background:D.bg,border:`1px solid ${is2600?D.yellow:D.border}`,
          borderRadius:6,padding:"5px 8px",color:D.text,fontSize:11,cursor:"pointer",
          display:"flex",alignItems:"center",gap:6,textAlign:"left"}}>
        <span dangerouslySetInnerHTML={{__html:PSVG[it.profile]?
          PSVG[it.profile](true).replace(/viewBox="[^"]*"/,`viewBox="${PSVG[it.profile](true).match(/viewBox="([^"]*)"/)?.[1]||"0 0 70 60"}"`)
            .replace(/<text[^>]*>.*?<\/text>/g,"")
          :""}}
          style={{display:"inline-flex",width:22,height:18,flexShrink:0}}/>
        <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
          color:is2600?D.yellow:D.text}}>{PNAMES[it.profile]||it.profile}</span>
        <span style={{color:D.muted,fontSize:9}}>▾</span>
      </button>
      {dims&&<div style={{fontSize:9,color:is2600?D.yellow:D.muted,marginTop:2}}>
        {dims.frame}мм рама{dims.maxKg?` · до ${dims.maxKg}кг`:""}
      </div>}
      {/* Dropdown picker */}
      {isOpen&&(<div style={{position:"absolute",top:"100%",left:0,zIndex:999,
        background:D.card,border:`1px solid ${D.border}`,borderRadius:10,
        padding:10,width:320,boxShadow:"0 8px 32px #00000060",marginTop:4}}>
        <div style={{fontSize:9,fontWeight:800,color:D.muted,textTransform:"uppercase",marginBottom:8}}>
          Выбор профиля — сечение
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
          {op.profiles.map(p=>{
            const sel=it.profile===p;
            const pd=PDIMS[p];
            const is2k=p.startsWith("klil_2600");
            return(<button key={p} onClick={()=>{upd(it.id,"profile",p);setProfModal(null);}}
              style={{background:sel?(is2k?D.yellow+"20":D.accent+"20"):D.surface,
                border:`1.5px solid ${sel?(is2k?D.yellow:D.accent):D.border}`,
                borderRadius:8,padding:"8px 4px",cursor:"pointer",
                display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <div dangerouslySetInnerHTML={{__html:PSVG[p]?PSVG[p](sel):""}}
                style={{width:56,height:48,display:"flex",alignItems:"center",justifyContent:"center"}}/>
              <div style={{fontSize:9,fontWeight:700,color:sel?(is2k?D.yellow:D.accentLight):D.text,
                textAlign:"center",lineHeight:1.3,wordBreak:"break-word"}}>
                {PNAMES[p]||p}
              </div>
              {pd&&<div style={{fontSize:8,color:D.muted,textAlign:"center"}}>
                {pd.frame}мм{pd.maxKg?` · ${pd.maxKg}кг`:""}
              </div>}
            </button>);
          })}
        </div>
        <button onClick={()=>setProfModal(null)}
          style={{width:"100%",marginTop:8,padding:"5px",background:"none",border:`1px solid ${D.border}`,
            borderRadius:6,color:D.muted,fontSize:10,cursor:"pointer"}}>Закрыть</button>
      </div>)}
    </div>);
  };

  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
      <div><div style={{fontSize:22,fontWeight:900,color:D.text}}>Калькулятор КП</div>
        <div style={{fontSize:13,color:D.muted}}>Dekel 2022 × 1.13 (цены 2026)</div></div>
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={()=>printKP(client,calced,saleTotal,margin,split,extras,company)} variant="success"><Download size={13}/> PDF КП</Btn>
        <Btn onClick={saveQuote} variant="teal"><FileText size={13}/> Сохранить КП</Btn>
        <Btn onClick={()=>setTplModal(true)} variant="ghost"><Plus size={13}/> Шаблон</Btn>
        <Btn onClick={()=>setLoadModal("pick")} variant="ghost"><History size={13}/> Загрузить</Btn>
        <Btn onClick={()=>exportCSV(["Позиция","Ш","В","м²","Тип","Профиль","Стекло","Кол","Код","Себест.","Цена"],
          calced.map(c=>[c.name,c.w,c.h,c.area.toFixed(2),c.op,c.profile,c.glass,c.qty,c.code,Math.round(c.totalCost),Math.round(c.totalCost*(1+margin/100))]),"кп.csv")} variant="ghost"><Download size={13}/> CSV</Btn>
        <Btn onClick={addItem}><Plus size={13}/> Добавить окно</Btn>
        <label style={{display:"inline-flex",alignItems:"center",gap:5,
          background:D.surface,border:`1px solid ${D.border}`,borderRadius:8,
          padding:"5px 10px",color:D.muted,fontSize:11,fontWeight:600,cursor:"pointer"}}>
          <Download size={12}/> CSV/Импорт
          <input type="file" accept=".csv,.txt" style={{display:"none"}}
            onChange={e=>{
              const file=e.target.files[0]; if(!file)return;
              const reader=new FileReader();
              reader.onload=ev=>{
                const lines=ev.target.result.split(/\r?\n/).filter(l=>l.trim());
                const imported=[];
                lines.forEach((line,i)=>{
                  // Support: Name,Width,Height,Qty or just Width,Height
                  const parts=line.split(/[,;\t]+/).map(s=>s.trim());
                  if(parts.length>=2){
                    const w=parseFloat(parts[parts.length>=4?1:0]);
                    const h=parseFloat(parts[parts.length>=4?2:1]);
                    const qty=parseInt(parts[parts.length>=4?3:2])||1;
                    const name=parts.length>=4?parts[0]:`Окно ${items.length+i+1}`;
                    if(w>10&&h>10)imported.push(newItem(name,"sliding_2_track","klil_7000",w,h,qty));
                  }
                });
                if(imported.length){
                  setItems(p=>[...p,...imported]);
                  alert(`Импортировано ${imported.length} позиций!`);
                } else {
                  alert("Не удалось распознать формат.\nОжидается: Название,Ш,В,Кол или Ш,В,Кол");
                }
              };
              reader.readAsText(file);
              e.target.value="";
            }}/>
        </label>
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
            <div key={it.id} style={{background:D.card,border:`1px solid ${it.valid?D.border:D.red+"60"}`,borderRadius:14,overflow:"visible",position:"relative"}}>
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
                    <select value={it.op} onChange={e=>{
                      const op=OPS.find(o=>o.id===e.target.value)||OPS[0];
                      const newProf=e.target.value==="lift_slide_2600"?suggest2600Config(it.w):op.profiles[0];
                      upd(it.id,"op",e.target.value);
                      upd(it.id,"profile",newProf);
                    }}
                      style={{width:"100%",background:D.bg,border:`1px solid ${D.border}`,borderRadius:5,padding:"4px 6px",color:D.text,fontSize:11,outline:"none"}}>
                      {OPS.map(o=><option key={o.id} value={o.id} style={{background:D.card}}>{t(o.name)}</option>)}
                    </select>
                  </div>
                  <div style={{marginBottom:5}}>
                    <div style={{fontSize:9,color:D.muted,marginBottom:2}}>Профиль (сечение)</div>
                    <ProfileSel it={it}/>
                    {sizeWarning(it)&&<div style={{fontSize:9,color:D.red,marginTop:3,background:D.red+"12",borderRadius:4,padding:"2px 5px"}}>
                      {sizeWarning(it)}
                    </div>}
                    {it.op==="lift_slide_2600"&&<div style={{fontSize:9,color:D.yellow,marginTop:3}}>
                      🏆 Система Lift &amp; Slide — автоподбор конфигурации по ширине
                    </div>}
                  </div>
                  <div style={{marginBottom:5}}>
                    <div style={{fontSize:9,color:D.muted,marginBottom:2}}>Стекло (доплата)</div>
                    <select value={it.glass} onChange={e=>upd(it.id,"glass",e.target.value)}
                      style={{width:"100%",background:D.bg,border:`1px solid ${D.border}`,borderRadius:5,padding:"4px 6px",color:D.text,fontSize:11,outline:"none"}}>
                      {DG.map(g=><option key={g.id} value={g.id} style={{background:D.card}}>{t(g.name)}</option>)}
                    </select>
                  </div>
                  {/* Color selector */}
                  <div style={{marginBottom:5}}>
                    <div style={{fontSize:9,color:D.muted,marginBottom:4}}>{t(bi("Цвет профиля","צבע פרופיל"))}</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                      {PCOLORS.map(c=>{
                        const sel=(it.color||"white")===c.id;
                        return(<button key={c.id} title={`${c.name} · ${c.ral}${c.price?` · +₪${c.price}`:""}`}
                          onClick={()=>upd(it.id,"color",c.id)}
                          style={{width:20,height:20,borderRadius:4,background:c.hex,cursor:"pointer",
                            border:`2px solid ${sel?"#fff":c.hex}`,
                            boxShadow:sel?"0 0 0 2px "+D.accent:"none",
                            outline:"none",flexShrink:0}}/>);
                      })}
                    </div>
                    {it.color&&it.color!=="white"&&(()=>{
                      const c=PCOLORS.find(x=>x.id===it.color);
                      return c?<div style={{fontSize:9,color:D.muted,marginTop:3}}>
                        <span style={{display:"inline-block",width:8,height:8,borderRadius:2,background:c.hex,marginRight:4}}/>
                        {c.name} · {c.ral}{c.price?` · +₪${c.price}×${it.qty}`:""}</div>:null;
                    })()}
                  </div>
                  <div>
                    <div style={{fontSize:9,color:D.muted,marginBottom:2}}>Москитная сетка</div>
                    <select value={it.screen} onChange={e=>upd(it.id,"screen",e.target.value)}
                      style={{width:"100%",background:D.bg,border:`1px solid ${D.border}`,borderRadius:5,padding:"4px 6px",color:D.text,fontSize:11,outline:"none"}}>
                      {DS.map(s=><option key={s.id} value={s.id} style={{background:D.card}}>{t(s.name)}</option>)}
                    </select>
                  </div>
                  <div style={{marginTop:5}}>
                    <div style={{fontSize:9,color:D.muted,marginBottom:2}}>{t(bi("Роллет / тришс","תריס"))}</div>
                    <select value={it.shutter} onChange={e=>upd(it.id,"shutter",e.target.value)}
                      style={{width:"100%",background:D.bg,border:`1px solid ${D.border}`,borderRadius:5,padding:"4px 6px",color:it.shutter!=="none"?D.yellow:D.muted,fontSize:11,outline:"none",fontWeight:it.shutter!=="none"?700:400}}>
                      {DSHT.map(s=><option key={s.id} value={s.id} style={{background:D.card,color:D.text}}>{t(s.name)}</option>)}
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
                        it.accCost>0&&["Аксессуары",fmt(Math.round(it.accCost)),"",""],
                        it.colorCost>0&&[bi("Цвет","צבע"),fmt(Math.round(it.colorCost)),"",""],
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
              {/* ACCESSORIES PANEL */}
              <div style={{borderTop:`1px solid ${D.border}`,padding:"8px 14px",background:D.surface+"80",borderBottomLeftRadius:14,borderBottomRightRadius:14}}>
                <div style={{fontSize:9,fontWeight:800,color:D.muted,textTransform:"uppercase",marginBottom:6}}>
                  🔧 {t(bi("Аксессуары","אביזרים"))}
                  {it.accessories?.length>0&&<span style={{marginLeft:6,color:D.teal}}>{it.accessories.length} выбрано · {fmt(Math.round((it.accessories||[]).reduce((s,a)=>{const ac=DACC.find(d=>d.id===a.id);return s+(ac?ac.price*(a.qty||1)*it.qty:0);},0)))}</span>}
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:6}}>
                  {DACC_CATS.map(cat=>{
                    const key=`${it.id}_${cat.id}`;
                    const catAccs=DACC.filter(a=>a.cat===cat.id);
                    const selected=catAccs.filter(a=>(it.accessories||[]).find(x=>x.id===a.id));
                    const isOpen=accDropdown===key;
                    return(
                      <div key={cat.id} style={{position:"relative"}}>
                        <button onClick={()=>setAccDropdown(isOpen?null:key)}
                          style={{background:selected.length?D.teal+"20":D.card,border:`1px solid ${selected.length?D.teal:D.border}`,
                            borderRadius:6,padding:"3px 8px",fontSize:10,fontWeight:selected.length?700:400,
                            color:selected.length?D.teal:D.muted,cursor:"pointer"}}>
                          {t(cat.label)}{selected.length>0?` (${selected.length})`:""}
                        </button>
                        {isOpen&&(<>
                          <div onClick={()=>setAccDropdown(null)} style={{position:"fixed",inset:0,zIndex:490}}/>
                          <div style={{position:"fixed",zIndex:500,
                            background:D.card,border:`1px solid ${D.border}`,borderRadius:10,padding:10,
                            width:300,maxHeight:320,overflowY:"auto",
                            boxShadow:"0 8px 32px #00000070",
                            top:"50%",left:"50%",transform:"translate(-50%,-50%)"}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                              <div style={{fontSize:10,fontWeight:800,color:D.teal,textTransform:"uppercase"}}>{t(cat.label)}</div>
                              <button onClick={()=>setAccDropdown(null)} style={{background:"none",border:"none",cursor:"pointer",color:D.muted,padding:2}}><X size={14}/></button>
                            </div>
                            {catAccs.map(acc=>{
                              const sel=(it.accessories||[]).find(x=>x.id===acc.id);
                              return(
                                <div key={acc.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",
                                  borderBottom:`1px solid ${D.border}`}}>
                                  <input type="checkbox" checked={!!sel} style={{accentColor:D.teal,flexShrink:0}}
                                    onChange={e=>{
                                      const cur=it.accessories||[];
                                      if(e.target.checked) upd(it.id,"accessories",[...cur,{id:acc.id,qty:1}]);
                                      else upd(it.id,"accessories",cur.filter(x=>x.id!==acc.id));
                                    }}/>
                                  <div style={{flex:1,minWidth:0}}>
                                    <div style={{fontSize:11,color:sel?D.text:D.muted,fontWeight:sel?700:400,lineHeight:1.3}}>{t(acc.name)}</div>
                                    <div style={{fontSize:9,color:D.muted}}>{acc.code} · {fmt(acc.price)}/{acc.unit}</div>
                                  </div>
                                  {sel&&<input type="number" min={1} max={50} value={sel.qty||1}
                                    onChange={e=>upd(it.id,"accessories",(it.accessories||[]).map(x=>x.id===acc.id?{...x,qty:+e.target.value||1}:x))}
                                    style={{width:42,background:D.bg,border:`1px solid ${D.teal}`,borderRadius:5,
                                      padding:"3px 5px",color:D.teal,fontSize:12,fontWeight:700,outline:"none",textAlign:"center"}}/>}
                                </div>
                              );
                            })}
                          </div>
                        </>)}
                      </div>
                    );
                  })}
                </div>
                {(it.accessories||[]).length>0&&(
                  <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                    {(it.accessories||[]).map(a=>{
                      const acc=DACC.find(d=>d.id===a.id);if(!acc)return null;
                      return(<div key={a.id} style={{background:D.teal+"15",border:`1px solid ${D.teal}30`,
                        borderRadius:5,padding:"2px 7px",fontSize:9,color:D.teal,fontWeight:700,
                        display:"flex",alignItems:"center",gap:4}}>
                        {acc.name.split("|")[0].trim()} ×{a.qty}
                        <button onClick={()=>upd(it.id,"accessories",(it.accessories||[]).filter(x=>x.id!==a.id))}
                          style={{background:"none",border:"none",cursor:"pointer",color:D.teal,padding:0,fontSize:11,lineHeight:1}}>×</button>
                      </div>);
                    })}
                  </div>
                )}
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
          {["Позиция","Профиль","Профиль м.п.","Вес кг","Стекло м²","Сетки","Роллеты"].map((h,i)=>(
            <div key={i} style={{fontSize:9,fontWeight:800,color:D.muted,textTransform:"uppercase"}}>{h}</div>
          ))}
        </div>
        {calced.filter(c=>c.valid).map((c,i)=>{
          const profM=(2*(c.w+c.h)/100*1.15*c.qty).toFixed(2);
          const profKg=((2*(c.w+c.h)/100*1.15*c.qty)*(PWEIGHTS[c.profile]||350)/1000).toFixed(1);
          const glassM2=(c.area*c.qty).toFixed(2);
          const sealM=(2*(c.w+c.h)/100*c.qty).toFixed(2);
          const screenOpt=DS.find(s=>s.id===c.screen)||DS[0];
          const shutterOpt=DSHT.find(s=>s.id===c.shutter)||DSHT[0];
          const is2600=c.profile.startsWith("klil_2600");
          return(<div key={c.id} style={{display:"grid",gridTemplateColumns:"1.5fr 1.5fr 1fr 1fr 1fr 1fr 1fr",
            padding:"9px 14px",gap:10,borderTop:`1px solid ${D.border}`,
            background:is2600?D.yellow+"08":i%2===0?D.card:D.surface,alignItems:"center"}}>
            <div style={{fontSize:12,fontWeight:700,color:D.text}}>{c.name}
              <div style={{fontSize:10,color:D.muted}}>{c.qty} шт {is2600?"🏆":""}</div></div>
            <div style={{fontSize:10,color:is2600?D.yellow:D.muted}}>{t(PNAMES[c.profile])||c.profile}</div>
            <div style={{fontSize:12,fontWeight:700,color:D.accentLight}}>{profM} м.п.</div>
            <div style={{fontSize:12,fontWeight:700,color:is2600?D.yellow:D.teal}}>{profKg} кг</div>
            <div style={{fontSize:12,fontWeight:700,color:D.teal}}>{glassM2} м²</div>
            <div style={{fontSize:11,color:c.screen!=="none"?D.green:D.muted}}>{c.screen!=="none"?`${c.qty} шт (${t(screenOpt.name)})`:"—"}</div>
            <div style={{fontSize:11,color:c.shutter!=="none"?D.yellow:D.muted}}>{c.shutter!=="none"?`${glassM2} м²`:"—"}</div>
          </div>);
        })}
        {/* Totals row */}
        {(()=>{
          const tp=calced.filter(c=>c.valid).reduce((s,c)=>s+2*(c.w+c.h)/100*1.15*c.qty,0);
          const totalKg=calced.filter(c=>c.valid).reduce((s,c)=>s+(2*(c.w+c.h)/100*1.15*c.qty)*(PWEIGHTS[c.profile]||350)/1000,0);
          const tg=calced.filter(c=>c.valid).reduce((s,c)=>s+c.area*c.qty,0);
          const tsc=calced.filter(c=>c.valid&&c.screen!=="none").reduce((s,c)=>s+c.qty,0);
          const tsh=calced.filter(c=>c.valid&&c.shutter!=="none").reduce((s,c)=>s+c.area*c.qty,0);
          return(<div style={{display:"grid",gridTemplateColumns:"1.5fr 1.5fr 1fr 1fr 1fr 1fr 1fr",
            padding:"9px 14px",gap:10,borderTop:`2px solid ${D.border}`,background:D.surface}}>
            <div style={{fontSize:11,fontWeight:800,color:D.text,gridColumn:"span 2"}}>ИТОГО</div>
            <div style={{fontSize:13,fontWeight:800,color:D.accentLight}}>{tp.toFixed(1)} м.п.</div>
            <div style={{fontSize:13,fontWeight:800,color:D.teal}}>{totalKg.toFixed(1)} кг</div>
            <div style={{fontSize:13,fontWeight:800,color:D.teal}}>{tg.toFixed(2)} м²</div>
            <div style={{fontSize:12,fontWeight:700,color:D.green}}>{tsc>0?`${tsc} шт`:"—"}</div>
            <div style={{fontSize:12,fontWeight:700,color:D.yellow}}>{tsh>0?`${tsh.toFixed(2)} м²`:"—"}</div>
          </div>);
        })()}
      </div>
    </div>)}

    {/* SAVE TEMPLATE MODAL */}
    {tplModal&&(<Modal title="💾 Сохранить как шаблон" onClose={()=>setTplModal(false)}>
      <div style={{fontSize:12,color:D.muted,marginBottom:12}}>
        Текущие {items.length} позиций будут сохранены как шаблон для быстрой загрузки.
      </div>
      <Inp label="Название шаблона" value={tplName} onChange={e=>setTplName(e.target.value)}
        placeholder="Напр: Стандартная квартира, Балкон 3 окна..."/>
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={saveTemplate}><Check size={13}/> Сохранить</Btn>
        <Btn onClick={()=>setTplModal(false)} variant="ghost">Отмена</Btn>
      </div>
    </Modal>)}

    {/* LOAD MODAL — choose from quotes or templates */}
    {loadModal&&(<Modal title="📂 Загрузить КП или шаблон" onClose={()=>setLoadModal(false)} wide>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        {/* Saved quotes */}
        <div>
          <div style={{fontSize:11,fontWeight:800,color:D.accentLight,textTransform:"uppercase",marginBottom:10}}>
            📋 Сохранённые КП ({quotes?.length||0})
          </div>
          {(!quotes||quotes.length===0)&&<div style={{fontSize:11,color:D.muted}}>Нет сохранённых КП</div>}
          <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:300,overflowY:"auto"}}>
            {(quotes||[]).map(q=>(
              <button key={q.id} onClick={()=>loadFromQuote(q)}
                style={{background:D.surface,border:`1px solid ${D.border}`,borderRadius:8,
                  padding:"10px 12px",textAlign:"left",cursor:"pointer",display:"block",width:"100%"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=D.accent}
                onMouseLeave={e=>e.currentTarget.style.borderColor=D.border}>
                <div style={{fontSize:12,fontWeight:700,color:D.text}}>{q.client}</div>
                <div style={{fontSize:10,color:D.muted}}>{q.id} · {q.date} · {fmt(q.total)} · {q.items?.length||0} поз.</div>
              </button>
            ))}
          </div>
        </div>
        {/* Templates */}
        <div>
          <div style={{fontSize:11,fontWeight:800,color:D.yellow,textTransform:"uppercase",marginBottom:10}}>
            ⚡ Шаблоны ({templates?.length||0})
          </div>
          {(!templates||templates.length===0)&&<div style={{fontSize:11,color:D.muted}}>Нет шаблонов. Нажми «Шаблон» чтобы сохранить текущий набор окон.</div>}
          <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:300,overflowY:"auto"}}>
            {(templates||[]).map(t=>(
              <div key={t.id} style={{display:"flex",gap:6,alignItems:"center"}}>
                <button onClick={()=>loadFromTemplate(t)}
                  style={{flex:1,background:D.surface,border:`1px solid ${D.border}`,borderRadius:8,
                    padding:"10px 12px",textAlign:"left",cursor:"pointer"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=D.yellow}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=D.border}>
                  <div style={{fontSize:12,fontWeight:700,color:D.text}}>{t.name}</div>
                  <div style={{fontSize:10,color:D.muted}}>{t.date} · {t.items?.length||0} окон · маржа {t.margin}%</div>
                </button>
                <button onClick={()=>setTemplates(p=>p.filter(x=>x.id!==t.id))}
                  style={{background:"none",border:"none",cursor:"pointer",color:D.muted,padding:4,flexShrink:0}}>
                  <Trash2 size={13}/>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>)}
  </div>);
}
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
      <div style="height:60px;border-bottom:2px solid #1e293b;margin-bottom:6px"></div>
      <div>חתימת הלקוח לאישור קבלת העבודה</div>
      <div style="margin-top:4px;font-weight:700">${inst.client}</div>
    </div>
    <div class="sign-box">
      <div style="height:60px;border-bottom:2px solid #1e293b;margin-bottom:6px"></div>
      <div>תאריך אישור</div>
      <div style="margin-top:4px;font-weight:700">____________</div>
    </div>
  </div>
  <div style="margin-top:16px;padding:10px 14px;background:#f8fafc;border-radius:6px;border:1px solid #e2e8f0;font-size:11px;color:#64748b;text-align:center">
    ${inst.notes?`הערות: ${inst.notes}`:""}
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
function Installation({installations,setInstallations,orders,onClientClick}){
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
function Orders({orders,setOrders,setPayments,payments,onClientClick}){
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({client:"",city:"",windows:"1",total:"",delivery:""});
  const [plModal,setPlModal]=useState(null);
  const [plData,setPlData]=useState({}); // {orderId: {materialsCost,laborCost,extrasCost,notes}}
  const [filter,setFilter]=useState("active"); // active | completed | all
  const [search,setSearch]=useState("");
  const [page,setPage]=useState(1);
  const [payEditModal,setPayEditModal]=useState(null); // payment id being edited
  const PAGE_SIZE=10;

  const addOrder=()=>{
    if(!form.client||!form.total)return;
    const id="WB-"+String(orders.length+1).padStart(3,"0");
    setOrders(p=>[...p,{...form,id,windows:+form.windows||1,total:+form.total,paid:0,
      status:"Ожидает материалов",progress:10,created:new Date().toISOString().split("T")[0]}]);
    setModal(false);setForm({client:"",city:"",windows:"1",total:"",delivery:""});
  };

  const updStatus=(id,status)=>setOrders(p=>p.map(o=>o.id===id?{...o,status,progress:PM[status]||o.progress}:o));

  const deleteOrder=(id)=>{
    if(!confirm("Удалить заказ?"))return;
    setOrders(p=>p.filter(o=>o.id!==id));
    setPayments(p=>p.filter(pay=>pay.order!==id));
  };

  const addPay=o=>{
    const debt=o.total-o.paid; if(debt<=0)return;
    const amount=+prompt(`Сумма платежа (остаток: ₪${debt.toLocaleString()}):`,debt);
    if(!amount||amount<=0)return;
    const type=prompt("Тип платежа:","Финальный")||"Финальный";
    const payId=Date.now();
    setPayments(p=>[...p,{id:payId,order:o.id,client:o.client,type,
      amount:Math.min(amount,debt),date:new Date().toISOString().split("T")[0],
      method:"Банк",status:"Ожидается"}]);
    setOrders(p=>p.map(x=>x.id===o.id?{...x,paid:Math.min(x.paid+amount,x.total)}:x));
  };

  const deletePay=(payId,orderId,amount)=>{
    if(!confirm("Удалить этот платёж?"))return;
    setPayments(p=>p.filter(x=>x.id!==payId));
    setOrders(p=>p.map(o=>o.id===orderId?{...o,paid:Math.max(0,o.paid-amount)}:o));
  };

  const editPayStatus=(payId,status)=>{
    setPayments(p=>p.map(x=>x.id===payId?{...x,status}:x));
  };

  const getPl=(id)=>plData[id]||{materialsCost:"",laborCost:"",extrasCost:"",notes:""};
  const setPl=(id,k,v)=>setPlData(p=>({...p,[id]:{...getPl(id),[k]:v}}));

  // Filter and search
  const filtered=orders.filter(o=>{
    const matchFilter=filter==="all"||(filter==="active"&&o.status!=="Завершён")||(filter==="completed"&&o.status==="Завершён");
    const matchSearch=!search.trim()||(o.client||"").toLowerCase().includes(search.toLowerCase())||(o.id||"").toLowerCase().includes(search.toLowerCase());
    return matchFilter&&matchSearch;
  });
  const totalPages=Math.ceil(filtered.length/PAGE_SIZE);
  const paged=filtered.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE);

  const activeCount=orders.filter(o=>o.status!=="Завершён").length;
  const completedCount=orders.filter(o=>o.status==="Завершён").length;

  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
      <div>
        <div style={{fontSize:22,fontWeight:900,color:D.text}}>Заказы</div>
        <div style={{fontSize:13,color:D.muted}}>
          {activeCount} активных · {completedCount} завершённых · {orders.length} всего
        </div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={()=>exportCSV(["ID","Клиент","Сумма","Оплачено","Статус"],orders.map(o=>[o.id,o.client,o.total,o.paid,o.status]),"заказы.csv")} variant="ghost"><Download size={13}/> CSV</Btn>
        <Btn onClick={()=>setModal(true)}><Plus size={13}/> Новый заказ</Btn>
      </div>
    </div>

    {/* Filters + search */}
    <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center",flexWrap:"wrap"}}>
      <div style={{position:"relative",flex:1,minWidth:200}}>
        <Search size={12} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:D.muted}}/>
        <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Поиск по клиенту или ID..."
          style={{width:"100%",background:D.card,border:`1px solid ${D.border}`,borderRadius:8,
            padding:"7px 10px 7px 30px",color:D.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
      </div>
      {[["active",`Активные (${activeCount})`],["completed",`Завершённые (${completedCount})`],["all","Все"]].map(([f,l])=>(
        <button key={f} onClick={()=>{setFilter(f);setPage(1);}}
          style={{padding:"6px 14px",borderRadius:8,border:`1px solid ${filter===f?D.accent:D.border}`,
            background:filter===f?D.accent+"20":"transparent",color:filter===f?D.accentLight:D.muted,
            fontSize:11,fontWeight:700,cursor:"pointer"}}>
          {l}
        </button>
      ))}
    </div>

    {filtered.length===0&&<div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,
      padding:40,textAlign:"center",color:D.muted}}>
      {filter==="completed"?"Нет завершённых заказов":"Нет заказов"}
    </div>}

    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {paged.map(o=>{
        const debt=o.total-o.paid;
        const pl=getPl(o.id);
        const matC=+pl.materialsCost||0; const labC=+pl.laborCost||0; const extC=+pl.extrasCost||0;
        const totalCost=matC+labC+extC;
        const profit=o.paid-totalCost;
        const margin=o.paid>0?Math.round(profit/o.paid*100):0;
        const hasPl=matC>0||labC>0||extC>0;
        const orderPays=(payments||[]).filter(p=>p.order===o.id);
        const isCompleted=o.status==="Завершён";

        return(<div key={o.id} style={{background:D.card,border:`1px solid ${isCompleted?D.green+"40":D.border}`,
          borderRadius:14,padding:"18px 20px",opacity:isCompleted?0.9:1}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
            <div style={{display:"flex",gap:12,alignItems:"center"}}>
              <div style={{background:isCompleted?D.green+"20":D.accent+"20",border:`1px solid ${isCompleted?D.green:D.accent}40`,
                borderRadius:8,padding:"3px 10px",fontSize:11,fontWeight:800,
                color:isCompleted?D.green:D.accentLight}}>{o.id}</div>
              <div>
                <div onClick={()=>onClientClick&&onClientClick(o.client)}
                  style={{fontSize:15,fontWeight:800,color:D.text,cursor:"pointer"}}>{o.client}</div>
                <div style={{fontSize:11,color:D.muted}}>{o.city||"—"} · {o.windows} окон · {o.created||""}{o.delivery?` · Сдача: ${o.delivery}`:""}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
              {!isCompleted&&debt>0&&<Btn onClick={()=>addPay(o)} variant="success" small><Plus size={11}/> Платёж</Btn>}
              <Btn onClick={()=>setPlModal(plModal===o.id?null:o.id)} variant={hasPl?"teal":"ghost"} small>
                <BarChart2 size={11}/> P&L
              </Btn>
              <select value={o.status} onChange={e=>updStatus(o.id,e.target.value)}
                style={{background:(SC[o.status]||D.muted)+"18",color:SC[o.status]||D.muted,
                  border:`1px solid ${(SC[o.status]||D.muted)}40`,borderRadius:8,
                  padding:"5px 10px",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                {OST.map(s=><option key={s} value={s} style={{background:D.card,color:D.text}}>{s}</option>)}
              </select>
              <button onClick={()=>deleteOrder(o.id)}
                style={{background:"none",border:"none",cursor:"pointer",color:D.muted,padding:4,opacity:0.5}}
                title="Удалить заказ">
                <Trash2 size={13}/>
              </button>
            </div>
          </div>

          {/* Financials */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 2fr",gap:16,alignItems:"center",marginBottom:12}}>
            {[["Сумма КП",fmt(o.total),D.text],["Получено",fmt(o.paid),D.green],
              ["Остаток",fmt(debt),debt>0?D.yellow:D.green]].map(([l,v,c])=>(
              <div key={l}><div style={{fontSize:9,color:D.muted,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>{l}</div>
                <div style={{fontSize:18,fontWeight:800,color:c}}>{v}</div></div>
            ))}
            <div><div style={{fontSize:9,color:D.muted,fontWeight:700,textTransform:"uppercase",marginBottom:6}}>Прогресс {o.progress}%</div>
              <PBar value={o.progress} color={o.progress===100?D.green:o.progress>50?D.purple:D.accent}/></div>
          </div>

          {/* Payments list with edit/delete */}
          {orderPays.length>0&&(<div style={{background:D.surface,borderRadius:10,padding:"8px 12px",marginBottom:10}}>
            <div style={{fontSize:9,fontWeight:800,color:D.muted,textTransform:"uppercase",marginBottom:6}}>
              Платежи по заказу
            </div>
            {orderPays.map(pay=>(
              <div key={pay.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                padding:"5px 0",borderBottom:`1px solid ${D.border}`}}>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontSize:12,fontWeight:700,color:D.green}}>{fmt(pay.amount)}</span>
                  <span style={{fontSize:10,color:D.muted}}>{pay.type} · {pay.date} · {pay.method}</span>
                </div>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <select value={pay.status} onChange={e=>editPayStatus(pay.id,e.target.value)}
                    style={{background:(pay.status==="Получен"?D.green:D.yellow)+"20",
                      color:pay.status==="Получен"?D.green:D.yellow,
                      border:`1px solid ${(pay.status==="Получен"?D.green:D.yellow)}40`,
                      borderRadius:6,padding:"3px 6px",fontSize:10,fontWeight:700,cursor:"pointer"}}>
                    <option value="Ожидается" style={{background:D.card,color:D.text}}>Ожидается</option>
                    <option value="Получен" style={{background:D.card,color:D.text}}>Получен</option>
                  </select>
                  <button onClick={()=>deletePay(pay.id,o.id,pay.amount)}
                    title="Удалить платёж"
                    style={{background:"none",border:"none",cursor:"pointer",color:D.red,padding:2,opacity:0.7}}>
                    <Trash2 size={11}/>
                  </button>
                </div>
              </div>
            ))}
          </div>)}

          {/* P&L Panel */}
          {plModal===o.id&&(<div style={{marginTop:4,borderTop:`1px solid ${D.border}`,paddingTop:16}}>
            <div style={{fontSize:11,fontWeight:800,color:D.muted,textTransform:"uppercase",marginBottom:12}}>📊 P&L — Реальные затраты</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12,marginBottom:14}}>
              {[["💰 Материалы ₪","materialsCost"],["👷 Труд / субподряд ₪","laborCost"],["🔧 Доп. расходы ₪","extrasCost"]].map(([l,k])=>(
                <div key={k}>
                  <div style={{fontSize:10,color:D.muted,fontWeight:700,marginBottom:4,textTransform:"uppercase"}}>{l}</div>
                  <input type="number" value={pl[k]} onChange={e=>setPl(o.id,k,e.target.value)} placeholder="0"
                    style={{width:"100%",background:D.bg,border:`1px solid ${D.border}`,borderRadius:8,
                      padding:"7px 10px",color:D.text,fontSize:13,fontWeight:700,outline:"none"}}/>
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
            <input placeholder="Заметки по затратам..." value={pl.notes} onChange={e=>setPl(o.id,"notes",e.target.value)}
              style={{width:"100%",background:D.bg,border:`1px solid ${D.border}`,borderRadius:8,
                padding:"7px 12px",color:D.text,fontSize:12,outline:"none",boxSizing:"border-box"}}/>
          </div>)}
        </div>);
      })}
    </div>

    {/* Pagination */}
    {totalPages>1&&(<div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:8,marginTop:16}}>
      <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
        style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:7,padding:"6px 12px",
          cursor:page===1?"default":"pointer",color:page===1?D.muted:D.text,opacity:page===1?0.4:1}}>
        ← Назад
      </button>
      {Array.from({length:totalPages},(_,i)=>i+1).map(n=>(
        <button key={n} onClick={()=>setPage(n)}
          style={{background:n===page?D.accent:"transparent",border:`1px solid ${n===page?D.accent:D.border}`,
            borderRadius:7,padding:"6px 11px",cursor:"pointer",
            color:n===page?"#fff":D.muted,fontWeight:n===page?700:400,fontSize:12}}>
          {n}
        </button>
      ))}
      <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
        style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:7,padding:"6px 12px",
          cursor:page===totalPages?"default":"pointer",color:page===totalPages?D.muted:D.text,
          opacity:page===totalPages?0.4:1}}>
        Вперёд →
      </button>
      <span style={{fontSize:11,color:D.muted}}>Стр. {page} из {totalPages} · {filtered.length} заказов</span>
    </div>)}

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
  const [modal,setModal]=useState(false);
  const [editItem,setEditItem]=useState(null);
  const [form,setForm]=useState({name:"",category:"Профили",unit:"м.п.",qty:"0",minQty:"10",price:"0"});
  const [search,setSearch]=useState("");
  const [selCat,setSelCat]=useState("all");

  const CATS=["Профили","Стекло","Фурнитура","Расходники","Инструменты","Прочее"];
  const low=inventory.filter(i=>i.qty<i.minQty);
  const cats=["all",...new Set(inventory.map(i=>i.category||"Прочее"))];

  const filtered=inventory.filter(i=>{
    const matchCat=selCat==="all"||(i.category||"Прочее")===selCat;
    const matchSearch=!search.trim()||i.name.toLowerCase().includes(search.toLowerCase());
    return matchCat&&matchSearch;
  });
  const groupedCats=[...new Set(filtered.map(i=>i.category||"Прочее"))];

  const openAdd=()=>{setEditItem(null);setForm({name:"",category:"Профили",unit:"м.п.",qty:"0",minQty:"10",price:"0"});setModal(true);};
  const openEdit=(i)=>{setEditItem(i.id);setForm({name:i.name,category:i.category||"Прочее",unit:i.unit,qty:String(i.qty),minQty:String(i.minQty),price:String(i.price)});setModal(true);};

  const save=()=>{
    if(!form.name)return;
    if(editItem){
      setInventory(p=>p.map(i=>i.id===editItem?{...i,...form,qty:+form.qty||0,minQty:+form.minQty||0,price:+form.price||0}:i));
    } else {
      setInventory(p=>[...p,{id:Date.now(),...form,qty:+form.qty||0,minQty:+form.minQty||0,price:+form.price||0}]);
    }
    setModal(false);
  };

  const del=(id)=>{if(confirm("Удалить позицию?"))setInventory(p=>p.filter(i=>i.id!==id));};
  const upd=(id,d)=>setInventory(p=>p.map(i=>i.id===id?{...i,qty:Math.max(0,i.qty+d)}:i));
  const setQty=(id,v)=>setInventory(p=>p.map(i=>i.id===id?{...i,qty:Math.max(0,+v||0)}:i));
  const totalVal=inventory.reduce((s,i)=>s+i.qty*i.price,0);

  return(<div>
    {/* Header */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
      <div>
        <div style={{fontSize:22,fontWeight:900,color:D.text}}>Склад</div>
        <div style={{fontSize:13,color:D.muted}}>
          {inventory.length} позиций · Стоимость: <b style={{color:D.green}}>{fmt(totalVal)}</b>
          {low.length>0&&<span style={{color:D.yellow}}> · ⚠️ {low.length} нужно закупить</span>}
        </div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={()=>exportCSV(["Наименование","Категория","Ед.","Кол","Мин","Цена","Сумма"],
          inventory.map(i=>[i.name,i.category,i.unit,i.qty,i.minQty,i.price,i.qty*i.price]),"склад.csv")}
          variant="ghost"><Download size={13}/> CSV</Btn>
        <Btn onClick={openAdd}><Plus size={13}/> Добавить позицию</Btn>
      </div>
    </div>

    {/* Low stock alert */}
    {low.length>0&&(<div style={{background:D.yellow+"15",border:`1px solid ${D.yellow}40`,borderRadius:12,padding:"10px 16px",marginBottom:14}}>
      <div style={{fontSize:11,fontWeight:800,color:D.yellow,marginBottom:6}}>⚠️ ТРЕБУЕТСЯ ЗАКУПКА</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
        {low.map(i=>(
          <span key={i.id} onClick={()=>openEdit(i)}
            style={{background:D.yellow+"20",border:`1px solid ${D.yellow}40`,borderRadius:6,
              padding:"2px 10px",fontSize:11,color:D.yellow,fontWeight:700,cursor:"pointer"}}>
            {i.name}: {i.qty}/{i.minQty} {i.unit}
          </span>
        ))}
      </div>
    </div>)}

    {/* Filters */}
    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
      <div style={{position:"relative",flex:1,minWidth:200}}>
        <Search size={12} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:D.muted}}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Поиск..."
          style={{width:"100%",background:D.card,border:`1px solid ${D.border}`,borderRadius:8,
            padding:"7px 10px 7px 30px",color:D.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
      </div>
      {cats.map(c=>(
        <button key={c} onClick={()=>setSelCat(c)}
          style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${selCat===c?D.accent:D.border}`,
            background:selCat===c?D.accent+"20":"transparent",
            color:selCat===c?D.accentLight:D.muted,fontSize:11,fontWeight:700,cursor:"pointer"}}>
          {c==="all"?`Все (${inventory.length})`:c}
        </button>
      ))}
    </div>

    {/* Items by category */}
    {filtered.length===0&&<div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,
      padding:40,textAlign:"center",color:D.muted}}>
      Нет позиций. Нажми «Добавить позицию» чтобы начать.
    </div>}

    {groupedCats.map(cat=>(
      <div key={cat} style={{marginBottom:18}}>
        <div style={{fontSize:11,fontWeight:800,color:D.muted,textTransform:"uppercase",
          marginBottom:8,display:"flex",justifyContent:"space-between"}}>
          <span>{cat}</span>
          <span style={{color:D.text}}>
            {fmt(filtered.filter(i=>(i.category||"Прочее")===cat).reduce((s,i)=>s+i.qty*i.price,0))}
          </span>
        </div>
        <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:12,overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"2.5fr 0.7fr 1.8fr 0.8fr 0.8fr 80px",
            padding:"6px 14px",background:D.surface,gap:10}}>
            {["Наименование","Ед.","Количество","Мин.","Цена","Сумма"].map(h=>(
              <div key={h} style={{fontSize:9,fontWeight:800,color:D.muted,textTransform:"uppercase"}}>{h}</div>
            ))}
          </div>
          {filtered.filter(i=>(i.category||"Прочее")===cat).map((i,idx,arr)=>(
            <div key={i.id} style={{display:"grid",gridTemplateColumns:"2.5fr 0.7fr 1.8fr 0.8fr 0.8fr 80px",
              padding:"10px 14px",gap:10,alignItems:"center",
              background:idx%2===0?D.card:D.surface,
              borderBottom:idx<arr.length-1?`1px solid ${D.border}`:"none"}}>
              {/* Name */}
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                {i.qty<i.minQty&&<span style={{color:D.yellow,fontSize:12}}>⚠️</span>}
                <span style={{fontSize:13,fontWeight:600,color:i.qty<i.minQty?D.yellow:D.text,
                  cursor:"pointer"}} onClick={()=>openEdit(i)}>
                  {i.name}
                </span>
              </div>
              {/* Unit */}
              <div style={{fontSize:11,color:D.muted}}>{i.unit}</div>
              {/* Qty controls */}
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <button onClick={()=>upd(i.id,-1)}
                  style={{background:D.surface,border:`1px solid ${D.border}`,borderRadius:5,
                    width:24,height:24,cursor:"pointer",color:D.text,fontWeight:800,fontSize:14}}>−</button>
                <input type="number" value={i.qty} min={0}
                  onChange={e=>setQty(i.id,e.target.value)}
                  style={{width:50,background:D.bg,border:`1px solid ${D.border}`,borderRadius:6,
                    padding:"3px 6px",color:i.qty<i.minQty?D.yellow:D.green,fontSize:13,
                    fontWeight:800,outline:"none",textAlign:"center"}}/>
                <button onClick={()=>upd(i.id,1)}
                  style={{background:D.surface,border:`1px solid ${D.border}`,borderRadius:5,
                    width:24,height:24,cursor:"pointer",color:D.text,fontWeight:800,fontSize:14}}>+</button>
                <span style={{fontSize:10,color:D.muted}}>/{i.minQty}</span>
              </div>
              {/* Min qty */}
              <div style={{fontSize:12,color:D.muted}}>{i.minQty}</div>
              {/* Price */}
              <div style={{fontSize:12,color:D.muted}}>{fmt(i.price)}</div>
              {/* Total + actions */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:12,fontWeight:700,color:D.text}}>{fmt(i.qty*i.price)}</span>
                <div style={{display:"flex",gap:4}}>
                  <button onClick={()=>openEdit(i)} title="Редактировать"
                    style={{background:"none",border:"none",cursor:"pointer",color:D.muted,padding:2}}>
                    <Eye size={12}/>
                  </button>
                  <button onClick={()=>del(i.id)} title="Удалить"
                    style={{background:"none",border:"none",cursor:"pointer",color:D.red,padding:2,opacity:0.6}}>
                    <Trash2 size={12}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}

    {/* Add/Edit Modal */}
    {modal&&(<Modal title={editItem?"✏️ Редактировать позицию":"➕ Новая позиция"} onClose={()=>setModal(false)}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
        <div style={{gridColumn:"1/-1"}}>
          <Inp label="Наименование *" value={form.name}
            onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Профиль Klil 7000..."/>
        </div>
        <div>
          <div style={{fontSize:9,color:D.muted,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Категория</div>
          <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}
            style={{width:"100%",background:D.bg,border:`1px solid ${D.border}`,borderRadius:7,
              padding:"7px 10px",color:D.text,fontSize:12,outline:"none"}}>
            {CATS.map(c=><option key={c} value={c} style={{background:D.card}}>{c}</option>)}
          </select>
        </div>
        <div>
          <div style={{fontSize:9,color:D.muted,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Единица</div>
          <select value={form.unit} onChange={e=>setForm(p=>({...p,unit:e.target.value}))}
            style={{width:"100%",background:D.bg,border:`1px solid ${D.border}`,borderRadius:7,
              padding:"7px 10px",color:D.text,fontSize:12,outline:"none"}}>
            {["м.п.","кг","шт","м²","л","рул.","уп."].map(u=><option key={u} value={u} style={{background:D.card}}>{u}</option>)}
          </select>
        </div>
        <Inp label="Количество" value={form.qty}
          onChange={e=>setForm(p=>({...p,qty:e.target.value}))} type="number" placeholder="0"/>
        <Inp label="Минимум (сигнал)" value={form.minQty}
          onChange={e=>setForm(p=>({...p,minQty:e.target.value}))} type="number" placeholder="10"/>
        <div style={{gridColumn:"1/-1"}}>
          <Inp label="Цена за единицу ₪" value={form.price}
            onChange={e=>setForm(p=>({...p,price:e.target.value}))} type="number" placeholder="0"/>
        </div>
      </div>
      {editItem&&(<div style={{fontSize:11,color:D.teal,marginBottom:12,padding:"6px 10px",
        background:D.teal+"12",borderRadius:6}}>
        Количество можно также менять кнопками +/− прямо в таблице
      </div>)}
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={save} variant="success"><Check size={13}/> {editItem?"Сохранить":"Добавить"}</Btn>
        <Btn onClick={()=>setModal(false)} variant="ghost">Отмена</Btn>
        {editItem&&<Btn onClick={()=>{del(editItem);setModal(false);}} variant="ghost">
          <Trash2 size={13}/> Удалить
        </Btn>}
      </div>
    </Modal>)}
  </div>);
}

// ═══════════════════════════════════════════════════════════════
// PAYMENTS
// ═══════════════════════════════════════════════════════════════
// ─────────────────────────────────────────────────────────────
// PRINT DOCUMENT — חשבונית/קבלה/חשבון עסקה per Israeli law
// ─────────────────────────────────────────────────────────────
function printIsraeliDoc(doc, company){
  const VAT_RATE=0.18;
  const isVat=["עוסק מורשה","חברה בעמ","שותפות"].includes(company.bizType||"חברה בעמ");
  const amtBeforeVat=isVat&&doc.includesVat?Math.round(doc.amount/1.18):doc.amount;
  const vatAmt=isVat&&doc.includesVat?doc.amount-amtBeforeVat:0;
  const totalAmt=doc.amount;

  const DOC_NAMES={
    "קבלה":"קבלה",
    "חשבון עסקה":"חשבון עסקה",
    "חשבונית מס":"חשבונית מס",
    "חשבונית מס קבלה":"חשבונית מס / קבלה",
    "חשבונית עסקה":"חשבונית עסקה",
  };
  const docTitle=DOC_NAMES[doc.docType]||doc.docType;
  const needsHitkatzva=isVat&&doc.amount>=10000&&(doc.docType==="חשבונית מס"||doc.docType==="חשבונית מס קבלה");

  const html=`<!DOCTYPE html>
<html lang="he" dir="rtl">
<head><meta charset="UTF-8"/>
<title>${docTitle} ${doc.docNum} – ${doc.client}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Arial',sans-serif;direction:rtl;color:#1e293b;background:#fff;padding:32px;font-size:13px}
  .page{max-width:780px;margin:0 auto;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden}
  .header{background:linear-gradient(135deg,#1e3a8a,#2563eb);color:#fff;padding:24px 28px;display:flex;justify-content:space-between;align-items:flex-start}
  .co-name{font-size:22px;font-weight:900;letter-spacing:-0.04em;margin-bottom:4px}
  .co-sub{font-size:11px;opacity:0.8;line-height:1.7}
  .doc-badge{background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.4);border-radius:8px;padding:8px 16px;text-align:center}
  .doc-type{font-size:15px;font-weight:800;margin-bottom:3px}
  .doc-num{font-size:12px;opacity:0.85}
  .body{padding:24px 28px}
  .section{margin-bottom:20px}
  .section-title{font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #e2e8f0}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:20px}
  .info-row{display:flex;justify-content:space-between;margin-bottom:5px;font-size:12px}
  .info-label{color:#64748b}
  .info-val{font-weight:600;color:#1e293b}
  .items-table{width:100%;border-collapse:collapse;margin-top:6px}
  .items-table th{background:#f1f5f9;padding:8px 12px;text-align:right;font-size:11px;font-weight:700;color:#475569;border:1px solid #e2e8f0}
  .items-table td{padding:8px 12px;border:1px solid #e2e8f0;font-size:12px}
  .items-table tr:nth-child(even) td{background:#f8fafc}
  .totals{margin-top:16px;padding:16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0}
  .total-row{display:flex;justify-content:space-between;margin-bottom:5px;font-size:12px}
  .total-grand{font-size:18px;font-weight:900;color:#1d4ed8;border-top:2px solid #2563eb;padding-top:10px;margin-top:8px}
  .hitkatzva{margin-top:16px;padding:12px 16px;background:#fefce8;border:2px solid #eab308;border-radius:8px}
  .hitkatzva-title{font-size:11px;font-weight:800;color:#854d0e;margin-bottom:4px}
  .hitkatzva-num{font-size:20px;font-weight:900;color:#854d0e;letter-spacing:0.1em}
  .hitkatzva-missing{font-size:11px;color:#dc2626;padding:10px 14px;background:#fef2f2;border:1px solid #fca5a5;border-radius:6px;margin-top:12px}
  .method-box{margin-top:16px;padding:12px 16px;background:#f0fdf4;border:1px solid #86efac;border-radius:8px;font-size:12px}
  .footer{background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 28px;display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#94a3b8}
  @media print{body{padding:0}.page{border:none;border-radius:0}}
</style>
</head>
<body>
<div class="page">
  <!-- Header -->
  <div class="header">
    <div>
      <div class="co-name">🏭 ${company.name||"חלונות אלומיניום"}</div>
      <div class="co-sub">
        ${company.taxId?`ח.פ. / ע.מ.: ${company.taxId}<br>`:""}
        ${company.bizType?`סוג עסק: ${company.bizType}<br>`:""}
        ${company.phone?`📞 ${company.phone}<br>`:""}
        ${company.address?`📍 ${company.address}<br>`:""}
        ${company.email?`✉️ ${company.email}`:""}
      </div>
    </div>
    <div class="doc-badge">
      <div class="doc-type">${docTitle}</div>
      <div class="doc-num">מס׳ ${doc.docNum}</div>
      <div style="font-size:11px;margin-top:3px;opacity:0.8">תאריך: ${doc.date}</div>
    </div>
  </div>

  <!-- Body -->
  <div class="body">
    <div class="grid2" style="margin-bottom:20px">
      <!-- Client info -->
      <div class="section">
        <div class="section-title">פרטי לקוח</div>
        <div class="info-row"><span class="info-label">שם:</span><span class="info-val">${doc.client}</span></div>
        ${doc.clientTaxId?`<div class="info-row"><span class="info-label">ח.פ. / ע.מ. לקוח:</span><span class="info-val">${doc.clientTaxId}</span></div>`:""}
        ${doc.clientAddress?`<div class="info-row"><span class="info-label">כתובת:</span><span class="info-val">${doc.clientAddress}</span></div>`:""}
      </div>
      <!-- Doc info -->
      <div class="section">
        <div class="section-title">פרטי מסמך</div>
        <div class="info-row"><span class="info-label">תאריך מסמך:</span><span class="info-val">${doc.date}</span></div>
        ${doc.orderId?`<div class="info-row"><span class="info-label">מס׳ הזמנה:</span><span class="info-val">${doc.orderId}</span></div>`:""}
        <div class="info-row"><span class="info-label">אמצעי תשלום:</span><span class="info-val">${doc.method||"—"}</span></div>
        ${doc.ref?`<div class="info-row"><span class="info-label">אסמכתא:</span><span class="info-val">${doc.ref}</span></div>`:""}
      </div>
    </div>

    <!-- Items -->
    <div class="section">
      <div class="section-title">פירוט שירותים / מוצרים</div>
      <table class="items-table">
        <thead><tr>
          <th>תיאור</th>
          <th style="text-align:center;width:60px">כמות</th>
          <th style="text-align:left;width:100px">מחיר ליחידה</th>
          <th style="text-align:left;width:100px">סה"כ</th>
        </tr></thead>
        <tbody>
          ${(doc.items||[{desc:doc.description||"שירות / עבודה",qty:1,price:amtBeforeVat}]).map(it=>`
          <tr>
            <td>${it.desc}</td>
            <td style="text-align:center">${it.qty}</td>
            <td style="text-align:left">₪${(it.price||0).toLocaleString("he-IL")}</td>
            <td style="text-align:left;font-weight:700">₪${((it.qty||1)*(it.price||0)).toLocaleString("he-IL")}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>

    <!-- Totals -->
    <div class="totals">
      ${isVat&&doc.includesVat?`
      <div class="total-row"><span>סכום לפני מע"מ:</span><span>₪${amtBeforeVat.toLocaleString("he-IL")}</span></div>
      <div class="total-row"><span>מע"מ (18%):</span><span>₪${vatAmt.toLocaleString("he-IL")}</span></div>`:""}
      <div class="total-row total-grand">
        <span>סה"כ לתשלום:</span>
        <span>₪${totalAmt.toLocaleString("he-IL")}</span>
      </div>
    </div>

    <!-- מספר הקצאה -->
    ${needsHitkatzva?`
    <div class="hitkatzva">
      <div class="hitkatzva-title">🔢 מספר הקצאה — חשבוניות ישראל</div>
      ${doc.hitkatzvaNum?`
      <div class="hitkatzva-num">${doc.hitkatzvaNum}</div>
      <div style="font-size:10px;color:#854d0e;margin-top:4px">מספר 9 ספרות שהתקבל ממע"מ רשות המיסים</div>
      `:`<div class="hitkatzva-missing">
        ⚠️ חשבונית זו מעל ₪10,000 — נדרש מספר הקצאה מרשות המיסים.<br>
        ניתן לבקש מספר הקצאה באתר: <b>taxes.gov.il</b> · ניתן להוסיף ידנית לפני הדפסה.
      </div>`}
    </div>`:""}

    <!-- Payment method details -->
    ${doc.bankDetails||company.bank?`
    <div class="method-box">
      <b>פרטי תשלום:</b>
      ${company.bank?` בנק ${company.bank}`:""}
      ${company.bankAccount?` · חשבון ${company.bankAccount}`:""}
      ${doc.bankDetails?` · ${doc.bankDetails}`:""}
    </div>`:""}

    ${doc.notes?`<div style="margin-top:14px;padding:10px 14px;background:#f8fafc;border-radius:6px;font-size:12px;color:#475569"><b>הערות:</b> ${doc.notes}</div>`:""}
  </div>

  <!-- Footer -->
  <div class="footer">
    <span>${company.name||"WindowOS"} · ${docTitle} מס׳ ${doc.docNum}</span>
    <span>${doc.date}</span>
    <span style="font-size:9px">מסמך זה הופק באמצעות WindowOS</span>
  </div>
</div>
<script>setTimeout(()=>window.print(),400)</script>
</body></html>`;

  const w=window.open("","_blank","width=880,height=760");
  if(w){w.document.write(html);w.document.close();}
}

// ─────────────────────────────────────────────────────────────
// PAYMENTS — full Israeli cash module
// ─────────────────────────────────────────────────────────────
function Payments({payments,setPayments,onClientClick,company}){
  const [tab,setTab]=useState("payments"); // payments | docs | new
  const [docs,setDocs]=useState(()=>load("wb:docs",[]));
  const [newDoc,setNewDoc]=useState(false);
  const [df,setDf]=useState({
    docType:"חשבונית מס קבלה",client:"",clientTaxId:"",clientAddress:"",
    amount:"",includesVat:true,method:"העברה בנקאית",
    description:"ייצור והתקנת חלונות ודלתות אלומיניום",
    orderId:"",ref:"",hitkatzvaNum:"",notes:"",
    items:[{id:1,desc:"ייצור והתקנת חלונות אלומיניום",qty:1,price:""}]
  });
  const [docSearch,setDocSearch]=useState("");

  useEffect(()=>{try{localStorage.setItem("wb:docs",JSON.stringify(docs));}catch{}},[docs]);

  const bizType=company?.bizType||"חברה בעמ";
  const isVat=["עוסק מורשה","חברה בעמ","שותפות"].includes(bizType);
  const VAT=0.18;

  const rcv=payments.filter(p=>p.status==="Получен").reduce((s,p)=>s+p.amount,0);
  const pnd=payments.filter(p=>p.status==="Ожидается").reduce((s,p)=>s+p.amount,0);
  const totalDocs=docs.reduce((s,d)=>s+d.amount,0);

  // Doc type options per business type
  const DOC_TYPES=isVat
    ?["חשבונית מס קבלה","חשבונית מס","קבלה","חשבון עסקה","חשבונית עסקה"]
    :["קבלה","חשבון עסקה","חשבונית עסקה"];

  const METHOD_OPTS=["העברה בנקאית","מזומן","צ'ק","כרטיס אשראי","Bit","PayBox","אחר"];

  // Auto doc number
  const nextDocNum=()=>{
    const prefix=df.docType==="קבלה"?"K":df.docType==="חשבון עסקה"?"H":"I";
    const existing=docs.filter(d=>d.docType===df.docType).length;
    return`${prefix}${String(existing+1).padStart(5,"0")}`;
  };

  const amtNum=parseFloat(df.amount)||0;
  const amtBeforeVat=isVat&&df.includesVat?Math.round(amtNum/1.18):amtNum;
  const vatAmt=isVat&&df.includesVat?amtNum-amtBeforeVat:0;
  const needsHitkatzva=isVat&&amtBeforeVat>=10000&&(df.docType==="חשבונית מס"||df.docType==="חשבונית מס קבלה");

  const saveDoc=()=>{
    if(!df.client||!df.amount)return alert("יש למלא שם לקוח וסכום");
    if(needsHitkatzva&&!df.hitkatzvaNum){
      if(!confirm("⚠️ חשבונית מעל ₪10,000 ללא מספר הקצאה!\nלקוח לא יוכל לנכות מע\"מ.\nהמשיך בכל זאת?"))return;
    }
    const docNum=nextDocNum();
    const doc={...df,id:Date.now(),docNum,date:new Date().toISOString().split("T")[0],
      amount:amtNum,items:df.items.map(it=>({...it,price:parseFloat(it.price)||0}))};
    setDocs(p=>[doc,...p]);
    // Also add to payments if it's a receipt type
    if(df.docType==="קבלה"||df.docType==="חשבונית מס קבלה"){
      setPayments(p=>[...p,{id:Date.now()+1,order:df.orderId||"",client:df.client,
        type:df.docType,amount:amtNum,date:doc.date,method:df.method,
        status:"Получен",docNum}]);
    }
    setNewDoc(false);
    setDf({docType:"חשבונית מס קבלה",client:"",clientTaxId:"",clientAddress:"",
      amount:"",includesVat:true,method:"העברה בנקאית",
      description:"ייצור והתקנת חלונות ודלתות אלומיניום",
      orderId:"",ref:"",hitkatzvaNum:"",notes:"",
      items:[{id:1,desc:"ייצור והתקנת חלונות אלומיניום",qty:1,price:""}]});
    alert(`מסמך ${doc.docType} מספר ${docNum} נשמר בהצלחה!`);
  };

  const filteredDocs=docs.filter(d=>
    !docSearch||d.client.toLowerCase().includes(docSearch.toLowerCase())||d.docNum?.includes(docSearch)
  );

  const DOC_COLORS={"קבלה":D.green,"חשבון עסקה":D.accentLight,"חשבונית עסקה":D.accentLight,
    "חשבונית מס":D.purple,"חשבונית מס קבלה":D.teal};

  return(<div>
    {/* Header */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
      <div>
        <div style={{fontSize:22,fontWeight:900,color:D.text}}>קופה · כספים</div>
        <div style={{fontSize:12,color:D.muted,marginTop:2,display:"flex",gap:12,alignItems:"center"}}>
          <span>{bizType}</span>
          {isVat&&<span style={{background:D.teal+"20",color:D.teal,borderRadius:5,padding:"1px 6px",fontSize:10,fontWeight:700}}>מע"מ 18%</span>}
          {needsHitkatzva&&<span style={{background:D.yellow+"20",color:D.yellow,borderRadius:5,padding:"1px 6px",fontSize:10,fontWeight:700}}>מספר הקצאה נדרש ≥ ₪10,000</span>}
        </div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={()=>exportCSV(["מסמך","לקוח","סוג","סכום","תאריך","אמצעי תשלום"],
          docs.map(d=>[d.docNum,d.client,d.docType,d.amount,d.date,d.method]),"מסמכים.csv")} variant="ghost">
          <Download size={13}/> CSV
        </Btn>
        <Btn onClick={()=>setNewDoc(true)} variant="success">
          <Plus size={13}/> מסמך חדש
        </Btn>
      </div>
    </div>

    {/* KPI cards */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
      {[
        ["💰 התקבל",fmt(rcv),D.green],
        ["⏳ ממתין לגבייה",fmt(pnd),D.yellow],
        ["📄 מסמכים שהופקו",docs.length,D.accentLight],
        ["📊 סה\"כ בחשבוניות",fmt(totalDocs),D.teal],
      ].map(([l,v,c])=>(
        <div key={l} style={{background:D.card,border:`1px solid ${c}30`,borderRadius:12,padding:"12px 16px",borderTop:`3px solid ${c}`}}>
          <div style={{fontSize:10,color:D.muted,marginBottom:4,fontWeight:700}}>{l}</div>
          <div style={{fontSize:20,fontWeight:900,color:c}}>{v}</div>
        </div>
      ))}
    </div>

    {/* Tabs */}
    <div style={{display:"flex",gap:2,background:D.surface,borderRadius:10,padding:4,width:"fit-content",marginBottom:16}}>
      {[["payments","💳 תשלומים"],["docs","📄 מסמכים שהופקו"]].map(([t,l])=>(
        <button key={t} onClick={()=>setTab(t)}
          style={{padding:"7px 18px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,
            background:tab===t?"linear-gradient(135deg,#2563EB,#1D4ED8)":"transparent",
            color:tab===t?"#fff":D.muted}}>
          {l}
        </button>
      ))}
    </div>

    {/* Payments tab */}
    {tab==="payments"&&(<div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,overflow:"hidden"}}>
      <div style={{display:"grid",gridTemplateColumns:"0.8fr 1.5fr 1fr 1fr 1fr 1fr auto",
        padding:"8px 14px",background:D.surface,gap:10}}>
        {["הזמנה","לקוח","סוג","סכום","תאריך","סטטוס",""].map((h,i)=>(
          <div key={i} style={{fontSize:9,fontWeight:800,color:D.muted,textTransform:"uppercase"}}>{h}</div>
        ))}
      </div>
      {payments.length===0&&<div style={{padding:30,textAlign:"center",color:D.muted}}>אין תשלומים עדיין</div>}
      {payments.map((p,i)=>(
        <div key={p.id} style={{display:"grid",gridTemplateColumns:"0.8fr 1.5fr 1fr 1fr 1fr 1fr auto",
          padding:"10px 14px",gap:10,alignItems:"center",
          background:i%2===0?D.card:D.surface,borderTop:`1px solid ${D.border}`}}>
          <div style={{fontSize:11,fontWeight:800,color:D.accentLight}}>{p.order||"—"}</div>
          <div onClick={()=>onClientClick&&onClientClick(p.client)}
            style={{fontSize:13,color:D.text,cursor:"pointer",fontWeight:600}}>{p.client}</div>
          <div style={{fontSize:10,color:D.muted}}>{p.type}</div>
          <div style={{fontSize:14,fontWeight:800,color:p.status==="Получен"?D.green:D.yellow}}>{fmt(p.amount)}</div>
          <div style={{fontSize:11,color:D.muted}}>{p.date}</div>
          <Badge status={p.status}/>
          {p.status==="Ожидается"
            ?<Btn onClick={()=>setPayments(prev=>prev.map(x=>x.id===p.id?{...x,status:"Получен"}:x))} variant="success" small>
               <Check size={11}/> התקבל
             </Btn>
            :<div style={{width:72}}/>}
        </div>
      ))}
    </div>)}

    {/* Documents tab */}
    {tab==="docs"&&(<div>
      <div style={{position:"relative",marginBottom:12}}>
        <Search size={12} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:D.muted}}/>
        <input value={docSearch} onChange={e=>setDocSearch(e.target.value)}
          placeholder="חיפוש לפי לקוח או מספר מסמך..."
          style={{width:"100%",background:D.card,border:`1px solid ${D.border}`,borderRadius:8,
            padding:"7px 10px 7px 30px",color:D.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
      </div>
      {filteredDocs.length===0&&<div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,
        padding:40,textAlign:"center",color:D.muted}}>
        אין מסמכים. לחץ "מסמך חדש" להפקת חשבונית/קבלה.
      </div>}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {filteredDocs.map(d=>{
          const c=DOC_COLORS[d.docType]||D.accentLight;
          const hasHitkatzva=d.hitkatzvaNum&&d.hitkatzvaNum.length===9;
          const missingHitkatzva=isVat&&d.amount>=10000&&(d.docType==="חשבונית מס"||d.docType==="חשבונית מס קבלה")&&!hasHitkatzva;
          return(<div key={d.id} style={{background:D.card,border:`1px solid ${missingHitkatzva?D.yellow:D.border}`,
            borderRadius:12,padding:"14px 18px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <div style={{background:c+"20",border:`1px solid ${c}40`,borderRadius:7,
                  padding:"3px 10px",fontSize:11,fontWeight:800,color:c}}>
                  {d.docNum}
                </div>
                <div>
                  <div onClick={()=>onClientClick&&onClientClick(d.client)}
                    style={{fontSize:14,fontWeight:800,color:D.text,cursor:"pointer"}}>{d.client}</div>
                  <div style={{fontSize:10,color:D.muted}}>{d.docType} · {d.date} · {d.method}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:18,fontWeight:900,color:c}}>₪{d.amount.toLocaleString("he-IL")}</div>
                  {isVat&&d.includesVat&&<div style={{fontSize:9,color:D.muted}}>כולל מע"מ</div>}
                </div>
                <Btn onClick={()=>printIsraeliDoc(d,company||{})} variant="ghost" small>
                  <Download size={12}/> PDF
                </Btn>
              </div>
            </div>

            {/* Missing מספר הקצאה warning */}
            {missingHitkatzva&&(<div style={{background:D.yellow+"12",border:`1px solid ${D.yellow}40`,
              borderRadius:7,padding:"8px 12px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:11,color:D.yellow}}>
                ⚠️ מסמך מעל ₪10,000 — נדרש <b>מספר הקצאה</b> (9 ספרות) מרשות המיסים
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <input placeholder="הכנס מספר הקצאה..." maxLength={9}
                  style={{background:D.bg,border:`1px solid ${D.yellow}`,borderRadius:6,
                    padding:"4px 8px",color:D.text,fontSize:12,outline:"none",width:180,textAlign:"center",
                    letterSpacing:"0.1em",fontWeight:700}}
                  onBlur={e=>{
                    if(e.target.value.length===9){
                      setDocs(p=>p.map(x=>x.id===d.id?{...x,hitkatzvaNum:e.target.value}:x));
                    }
                  }}
                  defaultValue={d.hitkatzvaNum||""}/>
                <a href="https://taxes.gov.il" target="_blank" rel="noreferrer"
                  style={{fontSize:10,color:D.accentLight,textDecoration:"none"}}>אתר רשות ←</a>
              </div>
            </div>)}

            {/* הקצאה confirmed */}
            {hasHitkatzva&&<div style={{background:D.green+"12",border:`1px solid ${D.green}30`,
              borderRadius:7,padding:"5px 12px",marginBottom:8,fontSize:11,color:D.green}}>
              ✅ מספר הקצאה: <b style={{letterSpacing:"0.1em"}}>{d.hitkatzvaNum}</b>
            </div>}

            {d.orderId&&<div style={{fontSize:10,color:D.muted}}>הזמנה: {d.orderId}</div>}
          </div>);
        })}
      </div>
    </div>)}

    {/* NEW DOCUMENT MODAL */}
    {newDoc&&(<Modal title={`📄 מסמך חדש — ${bizType}`} onClose={()=>setNewDoc(false)} wide>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        {/* Doc type */}
        <div>
          <div style={{fontSize:9,color:D.muted,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>סוג מסמך</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {DOC_TYPES.map(t=>(
              <button key={t} onClick={()=>setDf(p=>({...p,docType:t}))}
                style={{padding:"5px 10px",borderRadius:6,border:`1px solid ${df.docType===t?(DOC_COLORS[t]||D.accent):D.border}`,
                  background:df.docType===t?(DOC_COLORS[t]||D.accent)+"20":"transparent",
                  color:df.docType===t?(DOC_COLORS[t]||D.accentLight):D.muted,
                  fontSize:11,fontWeight:df.docType===t?700:400,cursor:"pointer"}}>
                {t}
              </button>
            ))}
          </div>
        </div>
        {/* Method */}
        <div>
          <div style={{fontSize:9,color:D.muted,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>אמצעי תשלום</div>
          <select value={df.method} onChange={e=>setDf(p=>({...p,method:e.target.value}))}
            style={{width:"100%",background:D.bg,border:`1px solid ${D.border}`,borderRadius:7,
              padding:"7px 10px",color:D.text,fontSize:12,outline:"none"}}>
            {METHOD_OPTS.map(m=><option key={m} value={m} style={{background:D.card}}>{m}</option>)}
          </select>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <Inp label="שם לקוח *" value={df.client} onChange={e=>setDf(p=>({...p,client:e.target.value}))} placeholder="שם מלא"/>
        <Inp label="ח.פ. / ע.מ. לקוח" value={df.clientTaxId} onChange={e=>setDf(p=>({...p,clientTaxId:e.target.value}))} placeholder="אופציונלי"/>
        <Inp label="כתובת לקוח" value={df.clientAddress} onChange={e=>setDf(p=>({...p,clientAddress:e.target.value}))} placeholder="אופציונלי"/>
        <Inp label="מס׳ הזמנה" value={df.orderId} onChange={e=>setDf(p=>({...p,orderId:e.target.value}))} placeholder="WB-001"/>
      </div>

      {/* Items */}
      <div style={{marginBottom:10}}>
        <div style={{fontSize:9,color:D.muted,fontWeight:700,textTransform:"uppercase",marginBottom:6}}>פירוט שירותים / מוצרים</div>
        {df.items.map((it,i)=>(
          <div key={it.id} style={{display:"grid",gridTemplateColumns:"2fr 0.5fr 1fr auto",gap:6,marginBottom:6,alignItems:"center"}}>
            <input value={it.desc} onChange={e=>setDf(p=>({...p,items:p.items.map((x,j)=>j===i?{...x,desc:e.target.value}:x)}))}
              placeholder="תיאור שירות / מוצר"
              style={{background:D.bg,border:`1px solid ${D.border}`,borderRadius:6,padding:"6px 8px",color:D.text,fontSize:12,outline:"none"}}/>
            <input type="number" value={it.qty} min={1}
              onChange={e=>setDf(p=>({...p,items:p.items.map((x,j)=>j===i?{...x,qty:+e.target.value||1}:x)}))}
              style={{background:D.bg,border:`1px solid ${D.border}`,borderRadius:6,padding:"6px 8px",color:D.text,fontSize:12,outline:"none",textAlign:"center"}}/>
            <input type="number" value={it.price}
              onChange={e=>setDf(p=>({...p,items:p.items.map((x,j)=>j===i?{...x,price:e.target.value}:x),
                amount:p.items.reduce((s,x,j)=>s+(j===i?+e.target.value||0:+x.price||0)*(j===i?x.qty:x.qty),0).toString()}))}
              placeholder="₪"
              style={{background:D.bg,border:`1px solid ${D.border}`,borderRadius:6,padding:"6px 8px",color:D.text,fontSize:12,outline:"none"}}/>
            <button onClick={()=>df.items.length>1&&setDf(p=>({...p,items:p.items.filter((_,j)=>j!==i)}))}
              style={{background:"none",border:"none",cursor:"pointer",color:df.items.length>1?D.red:D.muted,padding:4}}>
              <X size={13}/>
            </button>
          </div>
        ))}
        <button onClick={()=>setDf(p=>({...p,items:[...p.items,{id:Date.now(),desc:"",qty:1,price:""}]}))}
          style={{background:"none",border:`1px dashed ${D.border}`,borderRadius:6,padding:"5px 14px",
            color:D.muted,fontSize:11,cursor:"pointer",width:"100%",marginBottom:4}}>
          + הוסף שורה
        </button>
      </div>

      {/* Amount + VAT */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div>
          <Inp label="סכום כולל ₪ *" value={df.amount} onChange={e=>setDf(p=>({...p,amount:e.target.value}))} type="number" placeholder="0"/>
          {isVat&&amtNum>0&&<div style={{fontSize:10,color:D.teal,marginTop:3}}>
            {df.includesVat?`לפני מע"מ: ₪${amtBeforeVat.toLocaleString()} + מע"מ: ₪${vatAmt.toLocaleString()}`:"+ מע\"מ לא כלול"}
          </div>}
        </div>
        {isVat&&<div style={{paddingTop:22}}>
          <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:12,color:D.text}}>
            <input type="checkbox" checked={df.includesVat} onChange={e=>setDf(p=>({...p,includesVat:e.target.checked}))} style={{accentColor:D.teal}}/>
            הסכום כולל מע"מ 18%
          </label>
        </div>}
      </div>

      {/* מספר הקצאה */}
      {needsHitkatzva&&(<div style={{background:D.yellow+"12",border:`1px solid ${D.yellow}`,borderRadius:8,
        padding:"10px 14px",marginBottom:10}}>
        <div style={{fontSize:11,fontWeight:700,color:D.yellow,marginBottom:6}}>
          ⚠️ מסמך מעל ₪10,000 — נדרש מספר הקצאה מרשות המיסים
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <input value={df.hitkatzvaNum} onChange={e=>setDf(p=>({...p,hitkatzvaNum:e.target.value}))}
            placeholder="הכנס 9 ספרות..." maxLength={9}
            style={{flex:1,background:D.bg,border:`1px solid ${df.hitkatzvaNum.length===9?D.green:D.yellow}`,
              borderRadius:7,padding:"8px 12px",color:D.text,fontSize:14,fontWeight:700,
              outline:"none",textAlign:"center",letterSpacing:"0.15em"}}/>
          <a href="https://www.taxes.gov.il/incometax/pages/default.aspx" target="_blank" rel="noreferrer"
            style={{background:D.accent+"20",border:`1px solid ${D.accent}40`,borderRadius:7,
              padding:"8px 12px",color:D.accentLight,fontSize:11,fontWeight:700,textDecoration:"none",whiteSpace:"nowrap"}}>
            אתר רשות המסים ←
          </a>
        </div>
        {df.hitkatzvaNum&&df.hitkatzvaNum.length!==9&&
          <div style={{fontSize:10,color:D.red,marginTop:4}}>מספר הקצאה חייב להכיל בדיוק 9 ספרות</div>}
        <div style={{fontSize:10,color:D.muted,marginTop:6}}>
          ניתן להמשיך ללא מספר הקצאה, אך הלקוח לא יוכל לנכות מע"מ תשומות
        </div>
      </div>)}

      <Inp label="הערות" value={df.notes} onChange={e=>setDf(p=>({...p,notes:e.target.value}))} placeholder="הערות נוספות..."/>

      {/* Preview total */}
      {amtNum>0&&(<div style={{background:D.teal+"12",border:`1px solid ${D.teal}30`,borderRadius:8,
        padding:"10px 14px",marginTop:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:12,color:D.muted}}>{df.docType} · מספר: {nextDocNum()}</span>
        <span style={{fontSize:20,fontWeight:900,color:D.teal}}>₪{amtNum.toLocaleString("he-IL")}</span>
      </div>)}

      <div style={{display:"flex",gap:8,marginTop:14}}>
        <Btn onClick={saveDoc} variant="success"><Check size={13}/> שמור מסמך</Btn>
        <Btn onClick={()=>setNewDoc(false)} variant="ghost">ביטול</Btn>
      </div>
    </Modal>)}
  </div>);
}

// ═══════════════════════════════════════════════════════════════
// KPI
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// P&L — PROFIT & LOSS + FIXED COSTS + BREAKEVEN + GOALS
// ═══════════════════════════════════════════════════════════════
function FinancePL({orders,payments,leads,measurements,kpi}){
  const [fixedCosts,setFixedCosts]=useState(()=>load("wb:fixedcosts",[
    {id:1,name:"Аренда | שכירות",amount:3000},
    {id:2,name:"Электроэнергия | חשמל",amount:500},
    {id:3,name:"Бухгалтер | רואה חשבון",amount:800},
    {id:4,name:"Телефон/Интернет | טלפון/אינטרנט",amount:300},
    {id:5,name:"Транспорт | רכב",amount:1200},
  ]));
  const [salaries,setSalaries]=useState(()=>load("wb:salaries",[
    {id:1,name:"Монтажник | מתקין",amount:0},
  ]));
  const [oneTime,setOneTime]=useState(()=>load("wb:onetime",[]));
  const [newFixed,setNewFixed]=useState({name:"",amount:""});
  const [newSalary,setNewSalary]=useState({name:"",amount:""});
  const [newOne,setNewOne]=useState({name:"",amount:"",date:new Date().toISOString().split("T")[0]});
  const [goals,setGoals]=useState(()=>load("wb:goals",{leads:20,measures:10,orders:5,revenue:80000,margin:35}));
  const [editGoals,setEditGoals]=useState(false);
  const [goalForm,setGoalForm]=useState({...goals});
  const [selMonth,setSelMonth]=useState("all");

  useEffect(()=>{save("wb:fixedcosts",fixedCosts);},[fixedCosts]);
  useEffect(()=>{save("wb:salaries",salaries);},[salaries]);
  useEffect(()=>{save("wb:onetime",oneTime);},[oneTime]);
  useEffect(()=>{save("wb:goals",goals);},[goals]);

  // ── Auto financials from real data ──
  const MONTHS_RU=[ui("m1"),ui("m2"),ui("m3"),ui("m4"),ui("m5"),ui("m6"),ui("m7"),ui("m8"),ui("m9"),ui("m10"),ui("m11"),ui("m12")];

  // Build monthly data from orders and payments
  const monthMap={};
  orders.forEach(o=>{
    const m=o.created?.slice(0,7)||"";
    if(!m)return;
    if(!monthMap[m])monthMap[m]={key:m,label:`${MONTHS_RU[parseInt(m.slice(5))-1]} ${m.slice(2,4)}`,revenue:0,paid:0,orders:0,cogs:0};
    monthMap[m].revenue+=o.total;
    monthMap[m].orders++;
    // Add P&L costs if entered
    const plKey=`wb:pl_${o.id}`;
    try{const pl=JSON.parse(localStorage.getItem(plKey)||"{}");
      monthMap[m].cogs+=(+pl.materialsCost||0)+(+pl.laborCost||0)+(+pl.extrasCost||0);
    }catch{}
  });
  payments.filter(p=>p.status==="Получен").forEach(p=>{
    const m=p.date?.slice(0,7)||"";
    if(!m)return;
    if(!monthMap[m])monthMap[m]={key:m,label:`${MONTHS_RU[parseInt(m.slice(5))-1]} ${m.slice(2,4)}`,revenue:0,paid:0,orders:0,cogs:0};
    monthMap[m].paid+=p.amount;
  });
  const monthList=Object.values(monthMap).sort((a,b)=>a.key.localeCompare(b.key));

  const totalFixed=fixedCosts.reduce((s,c)=>s+Number(c.amount||0),0);
  const totalSalaries=salaries.reduce((s,c)=>s+Number(c.amount||0),0);
  const totalOneTime=oneTime.reduce((s,c)=>s+Number(c.amount||0),0);
  const totalMonthlyExp=totalFixed+totalSalaries;

  const totalRevenue=orders.reduce((s,o)=>s+o.total,0);
  const totalPaid=payments.filter(p=>p.status==="Получен").reduce((s,p)=>s+p.amount,0);
  const totalPending=payments.filter(p=>p.status==="Ожидается").reduce((s,p)=>s+p.amount,0);
  const grossProfit=Math.round(totalPaid*0.35); // ~35% margin estimate
  const netProfit=grossProfit-totalMonthlyExp-totalOneTime;
  const breakevenRevenue=totalMonthlyExp>0?Math.round(totalMonthlyExp/0.35):0;
  const breakevenPct=breakevenRevenue>0?Math.min(Math.round(totalPaid/breakevenRevenue*100),100):0;
  const gaugeColor=breakevenPct>=100?D.green:breakevenPct>=70?D.yellow:D.red;

  // Goals
  const fLeads=leads.length; const fMeasures=measurements.length; const fOrders=orders.length;
  const goalPct=(v,t)=>t>0?Math.min(Math.round(v/t*100),100):0;
  const GoalBar=({label,current,target,color,f})=>{
    const pct=goalPct(current,target);
    return(<div style={{marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,alignItems:"center"}}>
        <span style={{fontSize:12,color:D.muted}}>{label}</span>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontSize:13,fontWeight:800,color:pct>=100?D.green:D.text}}>{f?f(current):current}</span>
          <span style={{fontSize:10,color:D.muted}}>/ {f?f(target):target}</span>
          <span style={{fontSize:11,fontWeight:700,color:pct>=100?D.green:pct>=70?D.yellow:D.red}}>{pct}%</span>
        </div>
      </div>
      <div style={{background:D.surface,borderRadius:6,height:8,overflow:"hidden"}}>
        <div style={{width:`${pct}%`,height:"100%",borderRadius:6,
          background:pct>=100?`linear-gradient(90deg,${D.green},#34d399)`:pct>=70?`linear-gradient(90deg,${D.yellow},#fbbf24)`:`linear-gradient(90deg,${color},${color}88)`,
          transition:"width 0.5s"}}/>
      </div>
    </div>);
  };

  const CostSection=({title,items,setItems,newItem,setNewItem,color,showDate=false})=>(
    <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,padding:18,marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontSize:12,fontWeight:800,color:D.muted,textTransform:"uppercase"}}>{title}</div>
        <span style={{fontSize:14,fontWeight:900,color}}>{fmt(items.reduce((s,c)=>s+Number(c.amount||0),0))}</span>
      </div>
      {items.map(c=>(
        <div key={c.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,padding:"5px 8px",background:D.surface,borderRadius:8}}>
          <input value={c.name} onChange={e=>setItems(p=>p.map(x=>x.id===c.id?{...x,name:e.target.value}:x))}
            style={{flex:1,background:"transparent",border:"none",color:D.text,fontSize:12,outline:"none"}}/>
          {showDate&&<input type="date" value={c.date||""} onChange={e=>setItems(p=>p.map(x=>x.id===c.id?{...x,date:e.target.value}:x))}
            style={{background:D.bg,border:`1px solid ${D.border}`,borderRadius:5,padding:"2px 5px",color:D.muted,fontSize:10,outline:"none"}}/>}
          <div style={{display:"flex",alignItems:"center",gap:3}}>
            <span style={{fontSize:10,color:D.muted}}>₪</span>
            <input type="number" value={c.amount}
              onChange={e=>setItems(p=>p.map(x=>x.id===c.id?{...x,amount:+e.target.value||0}:x))}
              style={{width:80,background:D.bg,border:`1px solid ${D.border}`,borderRadius:5,
                padding:"3px 6px",color,fontSize:12,fontWeight:700,outline:"none",textAlign:"right"}}/>
          </div>
          <button onClick={()=>setItems(p=>p.filter(x=>x.id!==c.id))}
            style={{background:"none",border:"none",cursor:"pointer",color:D.muted,padding:2}}>
            <Trash2 size={12}/>
          </button>
        </div>
      ))}
      <div style={{display:"flex",gap:6,marginTop:8}}>
        <input value={newItem.name} onChange={e=>setNewItem(p=>({...p,name:e.target.value}))}
          placeholder="Название..." onKeyDown={e=>e.key==="Enter"&&newItem.name&&newItem.amount&&(setItems(p=>[...p,{id:Date.now(),name:newItem.name,amount:+newItem.amount,date:newItem.date}]),setNewItem({name:"",amount:"",date:new Date().toISOString().split("T")[0]}))}
          style={{flex:1,background:D.bg,border:`1px solid ${D.border}`,borderRadius:7,padding:"5px 8px",color:D.text,fontSize:12,outline:"none"}}/>
        {showDate&&<input type="date" value={newItem.date||""} onChange={e=>setNewItem(p=>({...p,date:e.target.value}))}
          style={{background:D.bg,border:`1px solid ${D.border}`,borderRadius:7,padding:"5px 8px",color:D.text,fontSize:11,outline:"none"}}/>}
        <input type="number" value={newItem.amount} onChange={e=>setNewItem(p=>({...p,amount:e.target.value}))}
          placeholder="₪" style={{width:70,background:D.bg,border:`1px solid ${D.border}`,borderRadius:7,padding:"5px 7px",color:D.text,fontSize:12,outline:"none",textAlign:"right"}}/>
        <Btn onClick={()=>{
          if(!newItem.name||!newItem.amount)return;
          setItems(p=>[...p,{id:Date.now(),name:newItem.name,amount:+newItem.amount,date:newItem.date}]);
          setNewItem({name:"",amount:"",date:new Date().toISOString().split("T")[0]});
        }} small><Plus size={12}/></Btn>
      </div>
    </div>
  );

  return(<div>
    <div style={{marginBottom:18}}>
      <div style={{fontSize:22,fontWeight:900,color:D.text}}>P&L · Финансы</div>
      <div style={{fontSize:12,color:D.muted}}>Все данные из системы — автоматически</div>
    </div>

    {/* Top 5 KPI cards */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:18}}>
      {[
        ["💼 Выручка (КП)",fmt(totalRevenue),D.text],
        ["💰 Получено",fmt(totalPaid),D.green],
        ["⏳ Ожидается",fmt(totalPending),D.yellow],
        ["🏢 Расходы/мес",fmt(totalMonthlyExp),D.red],
        ["📊 Прибыль",fmt(netProfit),netProfit>=0?D.green:D.red],
      ].map(([l,v,c])=>(
        <div key={l} style={{background:D.card,border:`1px solid ${c}30`,borderRadius:12,padding:"12px 14px",borderTop:`3px solid ${c}`}}>
          <div style={{fontSize:10,color:D.muted,marginBottom:4}}>{l}</div>
          <div style={{fontSize:18,fontWeight:900,color:c}}>{v}</div>
        </div>
      ))}
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1.2fr 0.8fr",gap:16,marginBottom:16}}>
      {/* LEFT: Costs */}
      <div>
        <CostSection title="🏢 Постоянные затраты / месяц" items={fixedCosts} setItems={setFixedCosts}
          newItem={newFixed} setNewItem={setNewFixed} color={D.red}/>
        <CostSection title="👷 Зарплаты / месяц" items={salaries} setItems={setSalaries}
          newItem={newSalary} setNewItem={setNewSalary} color={D.purple}/>
        <CostSection title="🔧 Разовые расходы" items={oneTime} setItems={setOneTime}
          newItem={newOne} setNewItem={setNewOne} color={D.yellow} showDate={true}/>

        {/* Total expenses summary */}
        <div style={{background:D.surface,borderRadius:10,padding:14}}>
          {[
            ["Постоянные затраты",fmt(totalFixed),D.red],
            ["Зарплаты",fmt(totalSalaries),D.purple],
            ["Разовые расходы",fmt(totalOneTime),D.yellow],
            ["Итого расходов",fmt(totalMonthlyExp+totalOneTime),D.text],
          ].map(([l,v,c])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${D.border}`}}>
              <span style={{fontSize:11,color:D.muted}}>{l}</span>
              <span style={{fontSize:12,fontWeight:800,color:c}}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Breakeven + Goals */}
      <div>
        {/* Breakeven gauge */}
        <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,padding:18,marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:800,color:D.muted,textTransform:"uppercase",marginBottom:8}}>🎯 Точка безубыточности</div>
          <div style={{textAlign:"center",marginBottom:12}}>
            <svg viewBox="0 0 200 110" style={{width:"100%",maxWidth:200}}>
              <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke={D.surface} strokeWidth="16" strokeLinecap="round"/>
              {breakevenPct>0&&<path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke={gaugeColor}
                strokeWidth="16" strokeLinecap="round" strokeDasharray={`${breakevenPct*2.51} 251`}/>}
              <text x="100" y="76" textAnchor="middle" style={{fontSize:"26px",fontWeight:900,fill:gaugeColor}}>{breakevenPct}%</text>
              <text x="100" y="96" textAnchor="middle" style={{fontSize:"10px",fill:"#64748b"}}>к точке безубыточности</text>
            </svg>
          </div>
          {[
            ["Нужно выручки",fmt(breakevenRevenue),D.yellow],
            ["Получено",fmt(totalPaid),D.green],
            ["Остаток",fmt(Math.max(0,breakevenRevenue-totalPaid)),netProfit>=0?D.green:D.red],
          ].map(([l,v,c])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:6,padding:"4px 0",borderBottom:`1px solid ${D.border}`}}>
              <span style={{fontSize:11,color:D.muted}}>{l}</span>
              <span style={{fontSize:12,fontWeight:700,color:c}}>{v}</span>
            </div>
          ))}
        </div>

        {/* Monthly goals */}
        <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,padding:18}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:800,color:D.muted,textTransform:"uppercase"}}>🎯 Цели на месяц</div>
            <Btn onClick={()=>{setGoalForm({...goals});setEditGoals(!editGoals);}} variant="ghost" small>
              {editGoals?"✓ Готово":"✏️ Изменить"}
            </Btn>
          </div>
          {editGoals&&(<>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
              {[["Лидов","leads"],["Замеров","measures"],["Заказов","orders"],["Выручка ₪","revenue"]].map(([l,k])=>(
                <div key={k}>
                  <div style={{fontSize:9,color:D.muted,fontWeight:700,marginBottom:3,textTransform:"uppercase"}}>{l}</div>
                  <input type="number" value={goalForm[k]} onChange={e=>setGoalForm(p=>({...p,[k]:+e.target.value||0}))}
                    style={{width:"100%",background:D.bg,border:`1px solid ${D.border}`,borderRadius:7,
                      padding:"6px 8px",color:D.text,fontSize:12,fontWeight:700,outline:"none",boxSizing:"border-box"}}/>
                </div>
              ))}
            </div>
            <Btn onClick={()=>{setGoals(goalForm);setEditGoals(false);}} small><Check size={12}/> Сохранить</Btn>
          </>)}
          {!editGoals&&(<>
            <GoalBar label="👤 Лидов" current={fLeads} target={goals.leads} color={D.accentLight}/>
            <GoalBar label="📐 Замеров" current={fMeasures} target={goals.measures} color={D.purple}/>
            <GoalBar label="📦 Заказов" current={fOrders} target={goals.orders} color={D.yellow}/>
            <GoalBar label="💰 Выручка" current={totalPaid} target={goals.revenue} color={D.green} f={fmt}/>
          </>)}
        </div>
      </div>
    </div>

    {/* Monthly P&L table — auto from real data */}
    {monthList.length>0&&(<div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,padding:18,marginBottom:16}}>
      <div style={{fontSize:11,fontWeight:800,color:D.muted,textTransform:"uppercase",marginBottom:12}}>
        📈 P&L по месяцам — из реальных данных
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead>
            <tr style={{background:D.surface}}>
              {["Месяц","Заказов","Выручка КП","Получено","Себест. (факт)","Валовая ~35%","Расходы/мес","Прибыль"].map(h=>(
                <th key={h} style={{padding:"7px 10px",textAlign:"left",fontSize:9,fontWeight:800,color:D.muted,
                  textTransform:"uppercase",borderBottom:`1px solid ${D.border}`,whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {monthList.map((m,i)=>{
              const gross=Math.round(m.paid*0.35);
              const net=gross-totalMonthlyExp;
              return(<tr key={m.key} style={{background:i%2===0?D.card:D.surface}}>
                <td style={{padding:"7px 10px",fontWeight:700,color:D.text}}>{m.label}</td>
                <td style={{padding:"7px 10px",color:D.muted}}>{m.orders}</td>
                <td style={{padding:"7px 10px",fontWeight:700,color:D.text}}>{fmt(m.revenue)}</td>
                <td style={{padding:"7px 10px",fontWeight:800,color:D.green}}>{fmt(m.paid)}</td>
                <td style={{padding:"7px 10px",color:m.cogs>0?D.red:D.muted}}>{m.cogs>0?fmt(m.cogs):"—"}</td>
                <td style={{padding:"7px 10px",color:D.accentLight}}>{fmt(gross)}</td>
                <td style={{padding:"7px 10px",color:D.red}}>{fmt(totalMonthlyExp)}</td>
                <td style={{padding:"7px 10px",fontWeight:900,color:net>=0?D.green:D.red}}>{fmt(net)}</td>
              </tr>);
            })}
          </tbody>
          <tfoot>
            <tr style={{background:D.accent+"15",borderTop:`2px solid ${D.accent}`}}>
              <td style={{padding:"8px 10px",fontWeight:900,color:D.text}}>ИТОГО</td>
              <td style={{padding:"8px 10px",fontWeight:700,color:D.text}}>{orders.length}</td>
              <td style={{padding:"8px 10px",fontWeight:900,color:D.text}}>{fmt(totalRevenue)}</td>
              <td style={{padding:"8px 10px",fontWeight:900,color:D.green}}>{fmt(totalPaid)}</td>
              <td style={{padding:"8px 10px",color:D.muted}}>—</td>
              <td style={{padding:"8px 10px",fontWeight:700,color:D.accentLight}}>{fmt(grossProfit)}</td>
              <td style={{padding:"8px 10px",color:D.red}}>—</td>
              <td style={{padding:"8px 10px",fontWeight:900,color:netProfit>=0?D.green:D.red}}>{fmt(netProfit)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div style={{fontSize:10,color:D.muted,marginTop:8}}>
        * Валовая прибыль ~35% — оценка. Для точных данных вноси себестоимость в P&L каждого заказа.
      </div>
    </div>)}

    {/* Follow-up alerts */}
    {(()=>{
      const today=new Date().toISOString().split("T")[0];
      const overdue=leads.filter(l=>l.followUp&&l.followUp<today&&!["Закрыт (выиграли)","Закрыт (проиграли)"].includes(l.status));
      const todayFu=leads.filter(l=>l.followUp===today&&!["Закрыт (выиграли)","Закрыт (проиграли)"].includes(l.status));
      if(overdue.length===0&&todayFu.length===0)return null;
      return(<div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,padding:18}}>
        <div style={{fontSize:11,fontWeight:800,color:D.muted,textTransform:"uppercase",marginBottom:12}}>🔔 Follow-up напоминания</div>
        {[...overdue.map(l=>({...l,_over:true})),...todayFu].map(l=>(
          <div key={l.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
            padding:"8px 12px",background:(l._over?D.red:D.yellow)+"10",
            border:`1px solid ${(l._over?D.red:D.yellow)}30`,borderRadius:8,marginBottom:6}}>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:D.text}}>{l.name}</div>
              <div style={{fontSize:10,color:D.muted}}>{l._over?"🔴 Просрочено: "+l.followUp:"🟡 Сегодня"} · {l.status}</div>
            </div>
            <div style={{display:"flex",gap:6}}>
              {l.phone&&<a href={`tel:${l.phone}`} style={{background:D.green+"20",border:`1px solid ${D.green}40`,
                borderRadius:6,padding:"4px 8px",color:D.green,fontSize:11,fontWeight:700,textDecoration:"none"}}>📞</a>}
              {l.phone&&<a href={`https://wa.me/${l.phone.replace(/[^0-9]/g,"").replace(/^0/,"972")}`}
                target="_blank" rel="noreferrer"
                style={{background:"#25D36620",border:"1px solid #25D36640",borderRadius:6,
                  padding:"4px 8px",color:"#25D366",fontSize:11,fontWeight:700,textDecoration:"none"}}>WA</a>}
            </div>
          </div>
        ))}
      </div>);
    })()}
  </div>);
}

function KPI({leads,measurements,orders,payments}){
  // ── All auto-calculated from real data ──
  const MONTHS_RU=[ui("m1"),ui("m2"),ui("m3"),ui("m4"),ui("m5"),ui("m6"),ui("m7"),ui("m8"),ui("m9"),ui("m10"),ui("m11"),ui("m12")];

  const fLeads=leads.length;
  const fMeasured=measurements.length;
  const fOrders=orders.length;
  const fWon=leads.filter(l=>l.status==="Закрыт (выиграли)").length;
  const fLost=leads.filter(l=>l.status==="Закрыт (проиграли)").length;
  const convLM=fLeads>0?+(fMeasured/fLeads*100).toFixed(0):0;
  const convMO=fMeasured>0?+(fOrders/fMeasured*100).toFixed(0):0;
  const convLO=fLeads>0?+(fOrders/fLeads*100).toFixed(0):0;
  const winRate=fWon+fLost>0?+(fWon/(fWon+fLost)*100).toFixed(0):0;

  const totalPaid=payments.filter(p=>p.status==="Получен").reduce((s,p)=>s+p.amount,0);
  const totalPending=payments.filter(p=>p.status==="Ожидается").reduce((s,p)=>s+p.amount,0);
  const totalContracted=orders.reduce((s,o)=>s+o.total,0);
  const avgDeal=orders.length>0?Math.round(totalContracted/orders.length):0;
  const collectRate=totalContracted>0?Math.round(totalPaid/totalContracted*100):0;

  // Monthly breakdown auto
  const monthMap={};
  orders.forEach(o=>{
    const m=o.created?.slice(0,7)||""; if(!m)return;
    if(!monthMap[m])monthMap[m]={key:m,label:`${MONTHS_RU[parseInt(m.slice(5))-1]} ${m.slice(2,4)}`,revenue:0,paid:0,orders:0,leads:0,measures:0};
    monthMap[m].revenue+=o.total; monthMap[m].orders++;
  });
  payments.filter(p=>p.status==="Получен").forEach(p=>{
    const m=p.date?.slice(0,7)||""; if(!m)return;
    if(!monthMap[m])monthMap[m]={key:m,label:`${MONTHS_RU[parseInt(m.slice(5))-1]} ${m.slice(2,4)}`,revenue:0,paid:0,orders:0,leads:0,measures:0};
    monthMap[m].paid+=p.amount;
  });
  leads.forEach(l=>{
    const m=l.date?.slice(0,7)||""; if(!m)return;
    if(!monthMap[m])monthMap[m]={key:m,label:`${MONTHS_RU[parseInt(m.slice(5))-1]} ${m.slice(2,4)}`,revenue:0,paid:0,orders:0,leads:0,measures:0};
    monthMap[m].leads++;
  });
  measurements.forEach(ms=>{
    const m=ms.date?.slice(0,7)||""; if(!m)return;
    if(!monthMap[m])monthMap[m]={key:m,label:`${MONTHS_RU[parseInt(m.slice(5))-1]} ${m.slice(2,4)}`,revenue:0,paid:0,orders:0,leads:0,measures:0};
    monthMap[m].measures++;
  });
  const monthList=Object.values(monthMap).sort((a,b)=>a.key.localeCompare(b.key)).slice(-12);

  // Sources
  const srcMap={};
  leads.forEach(l=>{srcMap[l.source||"Не указан"]=(srcMap[l.source||"Не указан"]||0)+1;});
  const sources=Object.entries(srcMap).sort((a,b)=>b[1]-a[1]);

  // Status breakdown
  const statuses=["Новый лид","Замер назначен","КП отправлено","Follow-up","Закрыт (выиграли)","Закрыт (проиграли)"];
  const statusColors={
    "Новый лид":D.accentLight,"Замер назначен":D.teal,"КП отправлено":D.yellow,
    "Follow-up":"#EC4899","Закрыт (выиграли)":D.green,"Закрыт (проиграли)":D.red
  };

  // Excel export
  const exportExcel=()=>{
    const style=`<style>body{font-family:Arial,sans-serif;font-size:11pt}.h1{background:#1E3A8A;color:#fff;font-size:14pt;font-weight:bold;padding:6px}.h2{background:#2563EB;color:#fff;font-size:11pt;font-weight:bold;padding:4px}.th{background:#1E293B;color:#fff;font-weight:bold;border:1px solid #ccc;padding:4px 8px}.td{border:1px solid #ddd;padding:3px 8px}.num{text-align:right;border:1px solid #ddd;padding:3px 8px}.pct{text-align:right;color:#16a34a;border:1px solid #ddd;padding:3px 8px;font-weight:bold}.tot{background:#f0f9ff;font-weight:bold;border:1px solid #ccc;padding:4px 8px}.pos{color:#16a34a;font-weight:bold}.neg{color:#dc2626;font-weight:bold}.tag{background:#EFF6FF;color:#1D4ED8;font-size:9pt;padding:1px 5px;border-radius:3px}tr:nth-child(even) td,tr:nth-child(even) .num{background:#F8FAFC}</style>`;
    const leadRows=leads.map(l=>`<tr><td class="td"><b>${l.name}</b></td><td class="td">${l.phone||""}</td><td class="td">${l.city||""}</td><td class="td">${l.type||""}</td><td class="td"><span class="tag">${l.status}</span></td><td class="num ${l.value>0?"pos":""}">${l.value>0?"₪"+l.value.toLocaleString():"—"}</td><td class="td">${l.followUp||"—"}</td><td class="td">${l.source||""}</td><td class="td">${l.date||""}</td></tr>`).join("");
    const orderRows=orders.map(o=>`<tr><td class="td"><b>${o.id}</b></td><td class="td">${o.client}</td><td class="td">${o.city||"—"}</td><td class="num">${o.windows}</td><td class="num">₪${o.total.toLocaleString()}</td><td class="num ${o.paid>0?"pos":""}">${o.paid>0?"₪"+o.paid.toLocaleString():"—"}</td><td class="num ${(o.total-o.paid)>0?"neg":""}">${(o.total-o.paid)>0?"₪"+(o.total-o.paid).toLocaleString():"—"}</td><td class="td"><span class="tag">${o.status}</span></td><td class="td">${o.created||""}</td></tr>`).join("");
    const payRows=payments.map(p=>`<tr><td class="td">${p.order||""}</td><td class="td"><b>${p.client}</b></td><td class="td">${p.type}</td><td class="num"><b>₪${p.amount.toLocaleString()}</b></td><td class="td">${p.date||""}</td><td class="td">${p.method||""}</td><td class="td"><span class="tag">${p.status}</span></td></tr>`).join("");
    const monthRows=monthList.map(m=>`<tr><td class="td"><b>${m.label}</b></td><td class="num">${m.leads}</td><td class="num">${m.measures}</td><td class="num">${m.orders}</td><td class="num">₪${m.revenue.toLocaleString()}</td><td class="num pos">₪${m.paid.toLocaleString()}</td></tr>`).join("");
    const html=`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8">${style}<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Dashboard</x:Name><x:WorksheetOptions><x:Selected/></x:WorksheetOptions></x:ExcelWorksheet><x:ExcelWorksheet><x:Name>Лиды</x:Name></x:ExcelWorksheet><x:ExcelWorksheet><x:Name>Заказы</x:Name></x:ExcelWorksheet><x:ExcelWorksheet><x:Name>Платежи</x:Name></x:ExcelWorksheet><x:ExcelWorksheet><x:Name>По месяцам</x:Name></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>
    <table style="margin-bottom:30px;width:600px"><tr><td colspan="3" class="h1">🏭 WindowOS — KPI · ${new Date().toLocaleDateString("ru-RU")}</td></tr><tr><td colspan="3" class="h2">📊 Воронка</td></tr><tr><td class="th">Показатель</td><td class="th">Значение</td><td class="th">%</td></tr><tr><td class="td">Лидов</td><td class="num"><b>${fLeads}</b></td><td class="pct">—</td></tr><tr><td class="td">Замеров</td><td class="num"><b>${fMeasured}</b></td><td class="pct">${convLM}%</td></tr><tr><td class="td">Заказов</td><td class="num"><b>${fOrders}</b></td><td class="pct">${convLO}%</td></tr><tr><td class="td">Закрыто</td><td class="num pos"><b>${fWon}</b></td><td class="pct">${winRate}%</td></tr><tr><td colspan="3" class="h2">💰 Финансы</td></tr><tr><td class="td">Сумма КП</td><td class="num">₪${totalContracted.toLocaleString()}</td><td></td></tr><tr><td class="td">Получено</td><td class="num pos">₪${totalPaid.toLocaleString()}</td><td></td></tr><tr><td class="td">Средний чек</td><td class="num">₪${avgDeal.toLocaleString()}</td><td></td></tr></table>
    <table style="margin-bottom:30px" x-sheet="Лиды"><tr><td colspan="9" class="h1">👤 Лиды — ${leads.length}</td></tr><tr><td class="th">Имя</td><td class="th">Телефон</td><td class="th">Город</td><td class="th">Тип</td><td class="th">Статус</td><td class="th">Оценка</td><td class="th">Follow-up</td><td class="th">Источник</td><td class="th">Дата</td></tr>${leadRows}</table>
    <table style="margin-bottom:30px" x-sheet="Заказы"><tr><td colspan="9" class="h1">📦 Заказы — ${orders.length}</td></tr><tr><td class="th">ID</td><td class="th">Клиент</td><td class="th">Город</td><td class="th">Окон</td><td class="th">Сумма</td><td class="th">Получено</td><td class="th">Остаток</td><td class="th">Статус</td><td class="th">Дата</td></tr>${orderRows}<tr><td class="tot" colspan="4">ИТОГО</td><td class="tot num">₪${totalContracted.toLocaleString()}</td><td class="tot num pos">₪${totalPaid.toLocaleString()}</td><td class="tot num neg">₪${(totalContracted-totalPaid).toLocaleString()}</td><td colspan="2" class="tot"></td></tr></table>
    <table style="margin-bottom:30px" x-sheet="Платежи"><tr><td colspan="7" class="h1">💰 Платежи — ${payments.length}</td></tr><tr><td class="th">Заказ</td><td class="th">Клиент</td><td class="th">Тип</td><td class="th">Сумма</td><td class="th">Дата</td><td class="th">Метод</td><td class="th">Статус</td></tr>${payRows}</table>
    <table x-sheet="По месяцам"><tr><td colspan="6" class="h1">📈 По месяцам</td></tr><tr><td class="th">Месяц</td><td class="th">Лидов</td><td class="th">Замеров</td><td class="th">Заказов</td><td class="th">Выручка</td><td class="th">Получено</td></tr>${monthRows}</table>
    </body></html>`;
    const blob=new Blob(["\uFEFF"+html],{type:"application/vnd.ms-excel;charset=utf-8"});
    const url=URL.createObjectURL(blob);const a=document.createElement("a");
    a.href=url;a.download=`WindowOS_KPI_${new Date().toISOString().slice(0,10)}.xls`;a.click();URL.revokeObjectURL(url);
  };

  const FunnelBar=({label,value,max,color})=>{
    const pct=max>0?Math.min(Math.round(value/max*100),100):0;
    return(<div style={{marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
        <span style={{fontSize:12,color:D.muted}}>{label}</span>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontSize:14,fontWeight:800,color}}>{value}</span>
          <span style={{fontSize:10,color:D.muted}}>{pct}%</span>
        </div>
      </div>
      <div style={{background:D.surface,borderRadius:6,height:8,overflow:"hidden"}}>
        <div style={{width:`${pct}%`,height:"100%",borderRadius:6,
          background:`linear-gradient(90deg,${color},${color}99)`,transition:"width 0.6s"}}/>
      </div>
    </div>);
  };

  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
      <div>
        <div style={{fontSize:22,fontWeight:900,color:D.text}}>KPI · Аналитика</div>
        <div style={{fontSize:12,color:D.muted}}>Всё считается автоматически из реальных данных</div>
      </div>
      <Btn onClick={exportExcel} variant="ghost"><Download size={13}/> Excel</Btn>
    </div>

    {/* Top KPI cards */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
      {[
        ["👤 Лидов",fLeads,D.accentLight,"всего в CRM"],
        ["📦 Заказов",fOrders,D.yellow,`из ${fMeasured} замеров`],
        ["✅ Закрыто",fWon,D.green,`Win rate ${winRate}%`],
        ["💰 Получено",fmt(totalPaid),D.green,`из ${fmt(totalContracted)} КП`],
      ].map(([l,v,c,s])=>(
        <div key={l} style={{background:D.card,border:`1px solid ${c}30`,borderRadius:12,padding:"14px 16px",borderTop:`3px solid ${c}`}}>
          <div style={{fontSize:10,color:D.muted,marginBottom:4,fontWeight:700}}>{l}</div>
          <div style={{fontSize:22,fontWeight:900,color:c}}>{v}</div>
          <div style={{fontSize:10,color:D.muted,marginTop:3}}>{s}</div>
        </div>
      ))}
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
      {/* Funnel */}
      <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,padding:20}}>
        <div style={{fontSize:11,fontWeight:800,color:D.muted,textTransform:"uppercase",marginBottom:14}}>📊 Воронка конверсии</div>
        <FunnelBar label="👤 Лидов" value={fLeads} max={fLeads} color={D.accentLight}/>
        <FunnelBar label="📐 Замеров" value={fMeasured} max={fLeads} color={D.teal}/>
        <FunnelBar label="📋 КП отправлено" value={leads.filter(l=>["КП отправлено","Follow-up","Закрыт (выиграли)"].includes(l.status)).length} max={fLeads} color={D.yellow}/>
        <FunnelBar label="📦 Заказов" value={fOrders} max={fLeads} color={D.purple}/>
        <FunnelBar label="✅ Закрыто (выиграли)" value={fWon} max={fLeads} color={D.green}/>
        <div style={{marginTop:14,display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[
            [`Лид→Замер`,`${convLM}%`,D.teal],
            [`Замер→Заказ`,`${convMO}%`,D.purple],
            [`Лид→Заказ`,`${convLO}%`,D.yellow],
            [`Win Rate`,`${winRate}%`,D.green],
          ].map(([l,v,c])=>(
            <div key={l} style={{background:D.surface,borderRadius:8,padding:"8px 10px",textAlign:"center"}}>
              <div style={{fontSize:9,color:D.muted,marginBottom:2}}>{l}</div>
              <div style={{fontSize:16,fontWeight:900,color:c}}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial KPIs */}
      <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,padding:20}}>
        <div style={{fontSize:11,fontWeight:800,color:D.muted,textTransform:"uppercase",marginBottom:14}}>💰 Финансовые KPI</div>
        {[
          ["Сумма контрактов",fmt(totalContracted),D.text],
          ["Получено",fmt(totalPaid),D.green],
          ["Ожидается",fmt(totalPending),D.yellow],
          ["Средний чек",fmt(avgDeal),D.accentLight],
          ["Сбор платежей",collectRate+"%",collectRate>=80?D.green:collectRate>=50?D.yellow:D.red],
        ].map(([l,v,c])=>(
          <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${D.border}`}}>
            <span style={{fontSize:12,color:D.muted}}>{l}</span>
            <span style={{fontSize:14,fontWeight:800,color:c}}>{v}</span>
          </div>
        ))}

        {/* Sources */}
        {sources.length>0&&(<>
          <div style={{fontSize:10,fontWeight:800,color:D.muted,textTransform:"uppercase",margin:"14px 0 8px"}}>📣 Источники лидов</div>
          {sources.slice(0,5).map(([src,cnt])=>(
            <div key={src} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <span style={{fontSize:11,color:D.text}}>{src||"Не указан"}</span>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <div style={{background:D.surface,borderRadius:4,height:6,width:80,overflow:"hidden"}}>
                  <div style={{width:`${fLeads>0?Math.round(cnt/fLeads*100):0}%`,height:"100%",background:D.accentLight,borderRadius:4}}/>
                </div>
                <span style={{fontSize:11,fontWeight:700,color:D.accentLight,minWidth:30,textAlign:"right"}}>{cnt}</span>
                <span style={{fontSize:10,color:D.muted}}>{fLeads>0?Math.round(cnt/fLeads*100):0}%</span>
              </div>
            </div>
          ))}
        </>)}
      </div>
    </div>

    {/* Monthly table — auto */}
    {monthList.length>0&&(<div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,padding:20,marginBottom:16}}>
      <div style={{fontSize:11,fontWeight:800,color:D.muted,textTransform:"uppercase",marginBottom:12}}>
        📈 Динамика по месяцам — автоматически
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead>
            <tr style={{background:D.surface}}>
              {["Месяц","Лидов","Замеров","Заказов","Выручка КП","Получено"].map(h=>(
                <th key={h} style={{padding:"7px 12px",textAlign:"left",fontSize:9,fontWeight:800,
                  color:D.muted,textTransform:"uppercase",borderBottom:`1px solid ${D.border}`}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {monthList.map((m,i)=>(
              <tr key={m.key} style={{background:i%2===0?D.card:D.surface}}>
                <td style={{padding:"8px 12px",fontWeight:700,color:D.text}}>{m.label}</td>
                <td style={{padding:"8px 12px",color:D.accentLight,fontWeight:600}}>{m.leads}</td>
                <td style={{padding:"8px 12px",color:D.teal,fontWeight:600}}>{m.measures}</td>
                <td style={{padding:"8px 12px",color:D.yellow,fontWeight:600}}>{m.orders}</td>
                <td style={{padding:"8px 12px",fontWeight:700,color:D.text}}>{fmt(m.revenue)}</td>
                <td style={{padding:"8px 12px",fontWeight:800,color:D.green}}>{fmt(m.paid)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>)}

    {/* Status breakdown */}
    <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,padding:20}}>
      <div style={{fontSize:11,fontWeight:800,color:D.muted,textTransform:"uppercase",marginBottom:12}}>📋 Лиды по статусам</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
        {statuses.map(s=>{
          const cnt=leads.filter(l=>l.status===s).length;
          const c=statusColors[s]||D.muted;
          return(<div key={s} style={{background:c+"15",border:`1px solid ${c}40`,borderRadius:8,
            padding:"8px 14px",textAlign:"center",minWidth:100}}>
            <div style={{fontSize:18,fontWeight:900,color:c}}>{cnt}</div>
            <div style={{fontSize:10,color:D.muted,marginTop:2}}>{s}</div>
          </div>);
        })}
      </div>
    </div>
  </div>);
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// GLOBAL SEARCH
// ═══════════════════════════════════════════════════════════════
function GlobalSearch({q,leads,measurements,orders,payments,installations,onClientClick,onClose}){
  const inp=q.trim().toLowerCase();
  if(!inp)return null;

  const results=[];
  leads.forEach(l=>{
    if(l.name.toLowerCase().includes(inp)||l.phone?.includes(inp)||l.city?.toLowerCase().includes(inp))
      results.push({type:"lead",icon:"👤",title:l.name,sub:`${l.status} · ${l.phone||""} · ${l.city||""}`,
        action:()=>{onClientClick(l.name);onClose();}});
  });
  measurements.forEach(m=>{
    if(m.client.toLowerCase().includes(inp)||m.address?.toLowerCase().includes(inp)||m.phone?.includes(inp))
      results.push({type:"measure",icon:"📐",title:m.client,sub:`Замер · ${m.date} · ${m.address||""}`,
        action:()=>{onClientClick(m.client);onClose();}});
  });
  orders.forEach(o=>{
    if(o.client.toLowerCase().includes(inp)||o.id?.toLowerCase().includes(inp))
      results.push({type:"order",icon:"📦",title:o.client,sub:`${o.id} · ${o.status} · ${fmt(o.total)}`,
        action:()=>{onClientClick(o.client);onClose();}});
  });
  payments.forEach(p=>{
    if(p.client.toLowerCase().includes(inp)||p.order?.toLowerCase().includes(inp))
      results.push({type:"payment",icon:"💰",title:p.client,sub:`${p.type} · ${fmt(p.amount)} · ${p.status}`,
        action:()=>{onClientClick(p.client);onClose();}});
  });
  installations.forEach(i=>{
    if(i.client.toLowerCase().includes(inp)||i.address?.toLowerCase().includes(inp))
      results.push({type:"install",icon:"🔧",title:i.client,sub:`Монтаж · ${i.status} · ${i.scheduledDate||""}`,
        action:()=>{onClientClick(i.client);onClose();}});
  });

  // Deduplicate by title+type
  const seen=new Set();
  const unique=results.filter(r=>{const k=r.type+r.title;if(seen.has(k))return false;seen.add(k);return true;});

  return(
    <div style={{position:"absolute",top:"100%",left:0,right:0,background:D.card,
      border:`1px solid ${D.border}`,borderRadius:12,marginTop:4,zIndex:500,
      boxShadow:"0 8px 32px #00000060",maxHeight:400,overflowY:"auto"}}>
      {unique.length===0?(
        <div style={{padding:"20px",textAlign:"center",color:D.muted,fontSize:12}}>Ничего не найдено</div>
      ):(
        <>
          <div style={{padding:"8px 14px 4px",fontSize:9,fontWeight:800,color:D.muted,textTransform:"uppercase"}}>
            {unique.length} результатов
          </div>
          {unique.map((r,i)=>(
            <button key={i} onClick={r.action}
              style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 14px",
                background:"none",border:"none",cursor:"pointer",textAlign:"left",
                borderTop:i>0?`1px solid ${D.border}`:"none"}}
              onMouseEnter={e=>e.currentTarget.style.background=D.accent+"12"}
              onMouseLeave={e=>e.currentTarget.style.background="none"}>
              <span style={{fontSize:16}}>{r.icon}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:700,color:D.text}}>{r.title}</div>
                <div style={{fontSize:10,color:D.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.sub}</div>
              </div>
              <ChevronRight size={12} color={D.muted}/>
            </button>
          ))}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// QUOTES — saved commercial proposals
// ═══════════════════════════════════════════════════════════════
function Quotes({quotes,setQuotes,onClientClick}){
  const [search,setSearch]=useState("");
  const [filter,setFilter]=useState("Все");
  const filtered=quotes.filter(q=>{
    const matchSearch=q.client.toLowerCase().includes(search.toLowerCase())||q.id?.includes(search);
    const matchFilter=filter==="Все"||q.status===filter;
    return matchSearch&&matchFilter;
  });
  const QSTATUS=["Черновик","Отправлено","Принято","Отклонено","Истекло"];
  const QSC={Черновик:D.muted,Отправлено:D.yellow,Принято:D.green,Отклонено:D.red,Истекло:"#94a3b8"};

  const updateStatus=(id,status)=>setQuotes(p=>p.map(q=>q.id===id?{...q,status}:q));
  const deleteQuote=(id)=>setQuotes(p=>p.filter(q=>q.id!==id));

  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
      <div>
        <div style={{fontSize:22,fontWeight:900,color:D.text}}>КП — История</div>
        <div style={{fontSize:13,color:D.muted}}>{quotes.length} предложений сохранено</div>
      </div>
      <Btn onClick={()=>exportCSV(
        ["ID","Клиент","Дата","Сумма","Статус","Позиций"],
        quotes.map(q=>[q.id,q.client,q.date,q.total,q.status,q.items?.length||0]),"КП_история.csv"
      )} variant="ghost"><Download size={13}/> CSV</Btn>
    </div>

    {/* Stats */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
      {[
        ["Всего КП",quotes.length,D.accentLight],
        ["Принято",quotes.filter(q=>q.status==="Принято").length,D.green],
        ["Ожидают ответа",quotes.filter(q=>q.status==="Отправлено").length,D.yellow],
        ["Сумма принятых",fmt(quotes.filter(q=>q.status==="Принято").reduce((s,q)=>s+q.total,0)),D.teal],
      ].map(([l,v,c])=>(
        <div key={l} style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:12,padding:"12px 16px"}}>
          <div style={{fontSize:9,fontWeight:800,color:D.muted,textTransform:"uppercase",marginBottom:4}}>{l}</div>
          <div style={{fontSize:20,fontWeight:900,color:c}}>{v}</div>
        </div>
      ))}
    </div>

    {/* Filters */}
    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
      <div style={{position:"relative",flex:1,minWidth:200}}>
        <Search size={12} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:D.muted}}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Поиск по клиенту или ID..."
          style={{width:"100%",background:D.card,border:`1px solid ${D.border}`,borderRadius:8,
            padding:"7px 10px 7px 30px",color:D.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
      </div>
      {["Все",...QSTATUS].map(s=>(
        <button key={s} onClick={()=>setFilter(s)} style={{padding:"5px 12px",borderRadius:8,fontSize:11,fontWeight:700,
          cursor:"pointer",border:`1px solid ${filter===s?(QSC[s]||D.accent):D.border}`,
          background:filter===s?(QSC[s]||D.accent)+"20":"transparent",
          color:filter===s?(QSC[s]||D.accentLight):D.muted}}>{s}</button>
      ))}
    </div>

    {/* List */}
    {filtered.length===0&&<div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,
      padding:40,textAlign:"center",color:D.muted}}>Нет сохранённых КП. Создай КП в Калькуляторе и нажми «Сохранить КП».</div>}
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {filtered.map(q=>(
        <div key={q.id} style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,padding:"16px 20px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div style={{display:"flex",gap:12,alignItems:"center"}}>
              <div style={{background:D.accent+"20",border:`1px solid ${D.accent}40`,borderRadius:8,
                padding:"3px 10px",fontSize:11,fontWeight:800,color:D.accentLight}}>{q.id}</div>
              <div>
                <div onClick={()=>onClientClick&&onClientClick(q.client)}
                  style={{fontSize:15,fontWeight:800,color:D.text,cursor:"pointer"}}>{q.client}</div>
                <div style={{fontSize:11,color:D.muted}}>📅 {q.date} · {q.items?.length||0} позиций</div>
              </div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              <select value={q.status} onChange={e=>updateStatus(q.id,e.target.value)}
                style={{background:(QSC[q.status]||D.muted)+"18",color:QSC[q.status]||D.muted,
                  border:`1px solid ${(QSC[q.status]||D.muted)}40`,borderRadius:6,
                  padding:"4px 8px",fontSize:11,fontWeight:700,cursor:"pointer"}}>
                {QSTATUS.map(s=><option key={s} value={s} style={{background:D.card,color:D.text}}>{s}</option>)}
              </select>
              <button onClick={()=>deleteQuote(q.id)}
                style={{background:"none",border:"none",cursor:"pointer",color:D.muted,padding:3}}>
                <Trash2 size={13}/>
              </button>
            </div>
          </div>

          {/* Items preview */}
          {q.items&&q.items.length>0&&(
            <div style={{background:D.surface,borderRadius:8,overflow:"hidden",marginBottom:10}}>
              {q.items.slice(0,3).map((it,i)=>(
                <div key={i} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",
                  padding:"5px 10px",gap:8,borderBottom:i<Math.min(q.items.length,3)-1?`1px solid ${D.border}`:"none",
                  background:i%2===0?D.card+"60":D.surface}}>
                  <div style={{fontSize:11,color:D.text,fontWeight:600}}>{it.name}</div>
                  <div style={{fontSize:10,color:D.muted}}>{it.w}×{it.h} см</div>
                  <div style={{fontSize:10,color:D.muted}}>×{it.qty}</div>
                  <div style={{fontSize:11,fontWeight:700,color:D.green,textAlign:"right"}}>
                    {fmt(Math.round(it.totalCost*(1+(q.margin||40)/100)*it.qty))}
                  </div>
                </div>
              ))}
              {q.items.length>3&&<div style={{padding:"5px 10px",fontSize:10,color:D.muted}}>
                + ещё {q.items.length-3} позиций
              </div>}
            </div>
          )}

          {/* Totals */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12}}>
            {[
              ["Итого КП",fmt(q.total),D.accentLight],
              ["Маржа",q.margin+"%",D.green],
              ["Аванс "+q.split+"%",fmt(Math.round(q.total*q.split/100)),D.yellow],
              ["Остаток "+(100-q.split)+"%",fmt(q.total-Math.round(q.total*q.split/100)),D.muted],
            ].map(([l,v,c])=>(
              <div key={l} style={{textAlign:"center"}}>
                <div style={{fontSize:9,color:D.muted,fontWeight:700,textTransform:"uppercase",marginBottom:2}}>{l}</div>
                <div style={{fontSize:14,fontWeight:800,color:c}}>{v}</div>
              </div>
            ))}
          </div>

          {/* Notes */}
          {q.notes&&<div style={{marginTop:10,fontSize:11,color:D.muted,background:D.surface,borderRadius:6,padding:"6px 10px"}}>
            📝 {q.notes}
          </div>}
        </div>
      ))}
    </div>
  </div>);
}

// ── ACTIVITY LOG COMPONENT with search ──────────────────────
function ActivityLog({activities}){
  const [search,setSearch]=useState("");
  const filtered=search.trim()
    ?activities.filter(a=>a.text.toLowerCase().includes(search.toLowerCase())||a.date.includes(search))
    :activities;
  return(<div>
    <div style={{position:"relative",marginBottom:8}}>
      <Search size={11} style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",color:D.muted}}/>
      <input value={search} onChange={e=>setSearch(e.target.value)}
        placeholder="Поиск в истории..."
        style={{width:"100%",background:D.bg,border:`1px solid ${D.border}`,borderRadius:6,
          padding:"5px 8px 5px 24px",color:D.text,fontSize:11,outline:"none",boxSizing:"border-box"}}/>
    </div>
    <div style={{maxHeight:220,overflowY:"auto"}}>
      {filtered.slice(0,50).map(a=>(
        <div key={a.id} style={{display:"flex",gap:8,padding:"5px 0",
          borderBottom:`1px solid ${D.border}`,alignItems:"flex-start"}}>
          <span style={{fontSize:14,flexShrink:0}}>{ACT_ICONS[a.type]||"📌"}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:D.text}}>{a.text}</div>
            <div style={{fontSize:9,color:D.muted}}>{a.date} {a.time}</div>
          </div>
        </div>
      ))}
      {filtered.length===0&&<div style={{fontSize:11,color:D.muted,padding:"8px 0"}}>Ничего не найдено</div>}
    </div>
  </div>);
}

// ── PUSH NOTIFICATIONS helper ────────────────────────────────
const requestPushPermission=async()=>{
  if(!("Notification" in window))return false;
  if(Notification.permission==="granted")return true;
  const perm=await Notification.requestPermission();
  return perm==="granted";
};
const sendPushNotification=(title,body,onClick)=>{
  if(Notification.permission!=="granted")return;
  const n=new Notification(title,{body,icon:"/icon-192.png",badge:"/icon-192.png"});
  if(onClick)n.onclick=onClick;
};

// ── CHECK FOLLOW-UPS and send push ──────────────────────────
const checkFollowUps=(leads)=>{
  const today=new Date().toISOString().split("T")[0];
  const due=leads.filter(l=>l.followUp===today&&!["Закрыт (выиграли)","Закрыт (проиграли)"].includes(l.status));
  const overdue=leads.filter(l=>l.followUp&&l.followUp<today&&!["Закрыт (выиграли)","Закрыт (проиграли)"].includes(l.status));
  if(due.length>0)sendPushNotification(`📞 Follow-up сегодня (${due.length})`,due.map(l=>l.name).join(", "));
  if(overdue.length>0)sendPushNotification(`🔴 Просрочено (${overdue.length})`,overdue.map(l=>l.name).join(", "));
};

// ═══════════════════════════════════════════════════════════════
// CLIENT CARD — full profile side panel
// ═══════════════════════════════════════════════════════════════
function ClientCard({clientName,leads,measurements,orders,installations,payments,onClose,onOpenCalc,setPage,activity,setActivity,quotes}){
  const lead=leads.find(l=>l.name===clientName);
  const cMeasures=measurements.filter(m=>m.client===clientName);
  const cOrders=orders.filter(o=>o.client===clientName);
  const cInst=installations.filter(i=>i.client===clientName);
  const cPay=payments.filter(p=>p.client===clientName);
  const cQuotes=(quotes||[]).filter(q=>q.client===clientName);
  const cActivity=(activity||[]).filter(a=>a.client===clientName);
  const paid=cPay.filter(p=>p.status==="Получен").reduce((s,p)=>s+p.amount,0);
  const pending=cPay.filter(p=>p.status==="Ожидается").reduce((s,p)=>s+p.amount,0);
  const phone=lead?.phone||cMeasures[0]?.phone||"";
  const waNum=phone.replace(/[^0-9]/g,"").replace(/^0/,"972");
  const [waModal,setWaModal]=useState(false);
  const [noteText,setNoteText]=useState("");
  const latestOrder=cOrders[cOrders.length-1];
  const latestQuote=cQuotes[0];

  const logAndCall=()=>{
    if(setActivity)addActivity(setActivity,clientName,"call",`📞 Звонок: ${phone}`);
  };
  const sendWA=(tpl)=>{
    const date=new Date().toLocaleDateString("he-IL");
    const total=latestOrder?.total||latestQuote?.total;
    const ordId=latestOrder?.id;
    const text=tpl.text(clientName,tpl.id==="measure"?date:tpl.id==="order_confirm"?ordId:total);
    window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(text)}`,"_blank");
    if(setActivity)addActivity(setActivity,clientName,"whatsapp",`💬 WhatsApp: ${tpl.label}`);
    setWaModal(false);
  };
  const addNote=()=>{
    if(!noteText.trim())return;
    if(setActivity)addActivity(setActivity,clientName,"note",`📝 ${noteText.trim()}`);
    setNoteText("");
  };

  const Section=({icon:Icon,title,children,color=D.accentLight})=>(
    <div style={{marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8,paddingBottom:6,borderBottom:`1px solid ${D.border}`}}>
        <Icon size={12} color={color}/>
        <span style={{fontSize:10,fontWeight:800,color,textTransform:"uppercase",letterSpacing:"0.05em"}}>{title}</span>
      </div>
      {children}
    </div>
  );

  return(
    <div style={{position:"fixed",top:0,right:0,bottom:0,zIndex:1000,display:"flex"}}>
      {/* Backdrop */}
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"#00000060",zIndex:999}}/>
      {/* Panel */}
      <div style={{position:"relative",zIndex:1000,width:380,maxWidth:"100vw",background:D.surface,
        borderLeft:`1px solid ${D.border}`,overflowY:"auto",display:"flex",flexDirection:"column",
        boxShadow:"-8px 0 32px #00000040"}}>
        {/* Header */}
        <div style={{padding:"20px 20px 16px",background:`linear-gradient(135deg,${D.accent}18,${D.surface})`,
          borderBottom:`1px solid ${D.border}`,position:"sticky",top:0,zIndex:10,backdropFilter:"blur(8px)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontSize:20,fontWeight:900,color:D.text}}>{clientName}</div>
              {lead&&<div style={{fontSize:11,color:D.muted,marginTop:2}}>{lead.type} · {lead.city||"—"} · {lead.source}</div>}
              {lead&&<div style={{display:"inline-block",marginTop:6,background:(SC[lead.status]||D.muted)+"20",
                color:SC[lead.status]||D.muted,border:`1px solid ${(SC[lead.status]||D.muted)}40`,
                borderRadius:12,padding:"2px 10px",fontSize:10,fontWeight:700}}>{lead.status}</div>}
            </div>
            <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:D.muted,padding:4}}><X size={18}/></button>
          </div>
          {/* Action buttons */}
          {phone&&(<div style={{display:"flex",gap:8,marginTop:14}}>
            <a href={`tel:${phone}`} onClick={logAndCall}
              style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",
                gap:6,background:D.green+"20",border:`1px solid ${D.green}40`,borderRadius:8,
                padding:"9px",color:D.green,fontWeight:700,fontSize:12,textDecoration:"none"}}>
              <Phone size={14}/> {phone}
            </a>
            <button onClick={()=>setWaModal(true)}
              style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,
                background:"#25D36620",border:"1px solid #25D36640",borderRadius:8,
                padding:"9px 14px",color:"#25D366",fontWeight:700,fontSize:12,cursor:"pointer"}}>
              <MessageCircle size={14}/> WA
            </button>
          </div>)}

          {/* WA Templates modal */}
          {waModal&&phone&&(
            <div style={{marginTop:12,background:D.surface,border:`1px solid ${"#25D366"}30`,borderRadius:10,padding:12}}>
              <div style={{fontSize:10,fontWeight:800,color:"#25D366",textTransform:"uppercase",marginBottom:8}}>
                💬 WhatsApp — выбери шаблон
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {WA_TEMPLATES.map(tpl=>(
                  <button key={tpl.id} onClick={()=>sendWA(tpl)}
                    style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:7,
                      padding:"7px 10px",textAlign:"left",cursor:"pointer",fontSize:11,color:D.text,
                      display:"flex",alignItems:"center",gap:6}}
                    onMouseEnter={e=>e.currentTarget.style.background="#25D36610"}
                    onMouseLeave={e=>e.currentTarget.style.background=D.card}>
                    {tpl.label}
                  </button>
                ))}
              </div>
              <button onClick={()=>setWaModal(false)}
                style={{marginTop:6,background:"none",border:"none",cursor:"pointer",color:D.muted,fontSize:10,padding:0}}>
                Закрыть
              </button>
            </div>
          )}
        </div>

        <div style={{padding:"16px 20px",flex:1,overflowY:"auto"}}>
          {/* Financial summary */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
            {[
              ["КП сумма",fmt(cOrders.reduce((s,o)=>s+o.total,0)),D.text],
              ["Оплачено",fmt(paid),D.green],
              ["Ожидается",fmt(pending),D.yellow],
            ].map(([l,v,c])=>(
              <div key={l} style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:8,padding:"8px 10px",textAlign:"center"}}>
                <div style={{fontSize:8,color:D.muted,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>{l}</div>
                <div style={{fontSize:14,fontWeight:800,color:c}}>{v}</div>
              </div>
            ))}
          </div>

          {/* Measurements */}
          <Section icon={Ruler} title={`Замеры (${cMeasures.length})`} color={D.purple}>
            {cMeasures.length===0&&<div style={{fontSize:11,color:D.muted}}>Нет замеров</div>}
            {cMeasures.map(m=>(
              <div key={m.id} style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:8,
                padding:"8px 10px",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:D.text}}>📅 {m.date} · {m.address||"—"}</div>
                  <div style={{fontSize:10,color:D.muted}}>{(m.openings||[]).length} проёмов · {m.mode==="По чертежу"?"📄 По чертежу":"🚗 Выезд"}</div>
                </div>
                <div style={{display:"flex",gap:5,alignItems:"center"}}>
                  <Badge status={m.status}/>
                  <button onClick={()=>{onOpenCalc(m);onClose();}} style={{background:D.yellow+"20",border:`1px solid ${D.yellow}40`,
                    borderRadius:6,padding:"3px 7px",color:D.yellow,fontSize:9,fontWeight:700,cursor:"pointer"}}>
                    КП →
                  </button>
                </div>
              </div>
            ))}
          </Section>

          {/* Orders */}
          <Section icon={ShoppingCart} title={`Заказы (${cOrders.length})`} color={D.accentLight}>
            {cOrders.length===0&&<div style={{fontSize:11,color:D.muted}}>Нет заказов</div>}
            {cOrders.map(o=>(
              <div key={o.id} style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:8,padding:"8px 10px",marginBottom:6}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <span style={{fontSize:11,fontWeight:800,color:D.accentLight}}>{o.id}</span>
                  <Badge status={o.status}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontSize:11,color:D.muted}}>{o.windows} окон · {o.created}</span>
                  <span style={{fontSize:12,fontWeight:700,color:D.green}}>{fmt(o.paid)} / {fmt(o.total)}</span>
                </div>
                <PBar value={o.progress} color={o.progress===100?D.green:D.accent}/>
              </div>
            ))}
          </Section>

          {/* Installation */}
          {cInst.length>0&&(<Section icon={Wrench} title={`Монтаж (${cInst.length})`} color={D.teal}>
            {cInst.map(i=>(
              <div key={i.id} style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:8,padding:"8px 10px",marginBottom:6,
                display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:D.text}}>📅 {i.scheduledDate}</div>
                  <div style={{fontSize:10,color:D.muted}}>{i.specialist||"—"} · {i.checklist.filter(Boolean).length}/{i.checklist.length} шагов</div>
                </div>
                <Badge status={i.status}/>
              </div>
            ))}
          </Section>)}

          {/* Payments */}
          {cPay.length>0&&(<Section icon={Wallet} title={`Платежи (${cPay.length})`} color={D.green}>
            {cPay.map(p=>(
              <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                padding:"6px 0",borderBottom:`1px solid ${D.border}`}}>
                <div>
                  <div style={{fontSize:11,color:D.text}}>{p.type} · {p.date}</div>
                  <div style={{fontSize:10,color:D.muted}}>{p.method}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:13,fontWeight:800,color:p.status==="Получен"?D.green:D.yellow}}>{fmt(p.amount)}</div>
                  <Badge status={p.status}/>
                </div>
              </div>
            ))}
          </Section>)}

          {/* Notes */}
          {lead?.notes&&(<Section icon={FileText} title="Заметки" color={D.muted}>
            <div style={{fontSize:12,color:D.text,background:D.card,borderRadius:8,padding:10}}>{lead.notes}</div>
          </Section>)}

          {/* Saved Quotes cross-link */}
          {cQuotes.length>0&&(<Section icon={FileText} title={`КП История (${cQuotes.length})`} color={D.yellow}>
            {cQuotes.slice(0,3).map(q=>(
              <div key={q.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                padding:"6px 0",borderBottom:`1px solid ${D.border}`}}>
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:D.text}}>{q.id} · {q.date}</div>
                  <div style={{fontSize:10,color:D.muted}}>{q.items?.length||0} позиций · {q.status}</div>
                </div>
                <span style={{fontSize:12,fontWeight:800,color:D.yellow}}>{fmt(q.total)}</span>
              </div>
            ))}
          </Section>)}

          {/* Follow-up */}
          {lead?.followUp&&(<div style={{background:D.teal+"15",border:`1px solid ${D.teal}30`,borderRadius:8,padding:"8px 12px",marginBottom:12}}>
            <div style={{fontSize:10,fontWeight:700,color:D.teal,textTransform:"uppercase"}}>Follow-up</div>
            <div style={{fontSize:13,fontWeight:800,color:D.text,marginTop:2}}>📅 {lead.followUp}</div>
          </div>)}

          {/* Quick note */}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:10,fontWeight:800,color:D.muted,textTransform:"uppercase",marginBottom:6}}>📝 Заметка</div>
            <div style={{display:"flex",gap:6}}>
              <input value={noteText} onChange={e=>setNoteText(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&addNote()}
                placeholder="Добавить заметку..."
                style={{flex:1,background:D.bg,border:`1px solid ${D.border}`,borderRadius:7,
                  padding:"7px 10px",color:D.text,fontSize:12,outline:"none"}}/>
              <Btn onClick={addNote} small><Plus size={12}/></Btn>
            </div>
          </div>

          {/* Activity log with search */}
          {cActivity.length>0&&(<Section icon={History} title={`История (${cActivity.length})`} color={D.muted}>
            <ActivityLog activities={cActivity}/>
          </Section>)}
        </div>
      </div>
    </div>
  );
}

// ── WHATSAPP TEMPLATES ───────────────────────────────────────
const WA_TEMPLATES=[
  {id:"new_lead",  label:"👋 Первый контакт",
    text:(name)=>`שלום ${name}!\nאני מתקין חלונות ודלתות אלומיניום.\nקיבלתי את פנייתך ואשמח לעזור.\nמתי נוח לך שנדבר? 🏭`},
  {id:"measure",   label:"📐 Подтверждение замера",
    text:(name,date)=>`שלום ${name}!\nאישור הגעה למדידה בתאריך ${date}.\nאם יש שינוי — אנא עדכן אותי מראש.\nתודה! 🙏`},
  {id:"send_kp",   label:"📋 Отправка КП",
    text:(name,total)=>`שלום ${name}!\nמצורפת הצעת המחיר שלנו.\nסה"כ: ₪${total?.toLocaleString()||"—"}\nהצעה בתוקף ל-30 יום.\nשאלות? אשמח לעזור! 😊`},
  {id:"followup",  label:"🔔 Follow-up",
    text:(name)=>`שלום ${name}!\nרציתי לבדוק אם יש שאלות לגבי הצעת המחיר?\nאשמח לפגוש אתכם ולהסביר פרטים נוספים. 🏭`},
  {id:"order_confirm",label:"✅ Подтверждение заказа",
    text:(name,id)=>`שלום ${name}!\nתודה על ההזמנה! מספר הזמנה: ${id||"—"}\nנחזור אליך בקרוב לתיאום מועד ההתקנה. 🙏`},
  {id:"install",   label:"🔧 Дата монтажа",
    text:(name,date)=>`שלום ${name}!\nנקבע מועד התקנה לתאריך ${date}.\nנגיע בשעה שנסכם.\nאם יש שאלות — צרו קשר. 🏭`},
  {id:"done",      label:"🎉 Работа завершена",
    text:(name)=>`שלום ${name}!\nשמחים שהעבודה הושלמה בהצלחה! 🎉\nנשמח לקבל ביקורת ו/או המלצה.\nתמיד כאן לשירותכם! 🏭`},
];

// ── ACTIVITY LOG HELPER ──────────────────────────────────────
const addActivity=(setActivity,clientName,type,text)=>{
  const entry={id:Date.now(),client:clientName,type,text,
    date:new Date().toISOString().split("T")[0],
    time:new Date().toLocaleTimeString("ru-RU",{hour:"2-digit",minute:"2-digit"})};
  setActivity(p=>[entry,...p.slice(0,499)]); // keep last 500
};
const ACT_ICONS={call:"📞",whatsapp:"💬",kp:"📋",measure:"📐",order:"📦",install:"🔧",note:"📝",payment:"💰"};

// ═══════════════════════════════════════════════════════════════
// CALENDAR MODULE
// ═══════════════════════════════════════════════════════════════
function Calendar({leads,measurements,installations,payments,setMeasurements,setInstallations,setLeads,onClientClick,setPage}){
  const [view,setView]=useState("month"); // month | week
  const [current,setCurrent]=useState(()=>{const d=new Date();return{y:d.getFullYear(),m:d.getMonth()};});
  const [selected,setSelected]=useState(()=>new Date().toISOString().split("T")[0]);
  const [quickModal,setQuickModal]=useState(null); // {date, type}
  const [quickForm,setQuickForm]=useState({client:"",phone:"",address:"",time:"09:00",notes:""});

  const today=new Date().toISOString().split("T")[0];
  const DAYS_RU=[ui("d1"),ui("d2"),ui("d3"),ui("d4"),ui("d5"),ui("d6"),ui("d7")];
  const MONTHS_RU=["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];

  // Build events map: date → [{type,label,color,client,id}]
  const eventsMap={};
  const addEv=(date,ev)=>{if(!date)return;if(!eventsMap[date])eventsMap[date]=[];eventsMap[date].push(ev);};

  measurements.forEach(m=>addEv(m.date,{type:"measure",label:m.client,sub:m.address,color:D.teal,client:m.client,id:m.id,phone:m.phone,status:m.status}));
  installations.forEach(i=>addEv(i.scheduledDate,{type:"install",label:i.client,sub:i.address,color:D.purple,client:i.client,id:i.id,status:i.status}));
  leads.forEach(l=>{
    if(!l.followUp)return;
    const isPast=l.followUp<today;
    addEv(l.followUp,{type:"followup",label:l.name,sub:l.status,color:isPast?D.red:D.yellow,client:l.name,id:l.id,phone:l.phone,isPast});
  });
  payments.forEach(p=>{
    if(p.status==="Ожидается"&&p.date)
      addEv(p.date,{type:"payment",label:p.client,sub:`₪${p.amount?.toLocaleString()}`,color:D.green,client:p.client,id:p.id});
  });

  const TYPE_ICONS={measure:"📐",install:"🔧",followup:"🔔",payment:"💰"};
  const TYPE_LABELS={measure:"Замер",install:"Монтаж",followup:"Follow-up",payment:"Платёж"};

  // Month grid
  const getDaysInMonth=(y,m)=>{
    const first=new Date(y,m,1);
    const last=new Date(y,m+1,0);
    const startDow=(first.getDay()+6)%7; // Mon=0
    const days=[];
    for(let i=0;i<startDow;i++){
      const d=new Date(y,m,1-startDow+i);
      days.push({date:d.toISOString().split("T")[0],cur:false});
    }
    for(let d=1;d<=last.getDate();d++){
      const dt=new Date(y,m,d);
      days.push({date:dt.toISOString().split("T")[0],cur:true});
    }
    while(days.length%7!==0){
      const last2=new Date(days[days.length-1].date);
      last2.setDate(last2.getDate()+1);
      days.push({date:last2.toISOString().split("T")[0],cur:false});
    }
    return days;
  };

  const days=getDaysInMonth(current.y,current.m);
  const selEvents=eventsMap[selected]||[];

  const prevMonth=()=>setCurrent(c=>c.m===0?{y:c.y-1,m:11}:{y:c.y,m:c.m-1});
  const nextMonth=()=>setCurrent(c=>c.m===11?{y:c.y+1,m:0}:{y:c.y,m:c.m+1});
  const goToday=()=>{const d=new Date();setCurrent({y:d.getFullYear(),m:d.getMonth()});setSelected(today);};

  const saveQuick=()=>{
    if(!quickForm.client)return;
    const id=Date.now();
    if(quickModal.type==="measure"){
      setMeasurements(p=>[...p,{id,client:quickForm.client,phone:quickForm.phone,
        address:quickForm.address,date:quickModal.date,status:"Запланирован",
        mode:"Выезд",specialist:"",notes:quickForm.notes,openings:[],files:[],
        floor:"1",wallType:"Железобетон",crane:false,demolition:false}]);
    } else if(quickModal.type==="install"){
      setInstallations(p=>[...p,{id,client:quickForm.client,address:quickForm.address,
        scheduledDate:quickModal.date,status:"Запланирован",specialist:"",
        checklist:new Array(11).fill(false),notes:quickForm.notes,
        photosBefore:[],photosAfter:[],completedDate:""}]);
    } else if(quickModal.type==="followup"){
      // Update lead's follow-up date
      setLeads(p=>p.map(l=>l.name===quickForm.client?{...l,followUp:quickModal.date}:l));
    }
    setQuickModal(null);
    setQuickForm({client:"",phone:"",address:"",time:"09:00",notes:""});
    setSelected(quickModal.date);
  };

  // Week view
  const getWeekDays=()=>{
    const d=new Date(selected);
    const dow=(d.getDay()+6)%7;
    const mon=new Date(d); mon.setDate(d.getDate()-dow);
    return Array.from({length:7},(_,i)=>{
      const wd=new Date(mon); wd.setDate(mon.getDate()+i);
      return wd.toISOString().split("T")[0];
    });
  };
  const weekDays=getWeekDays();

  return(<div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:16,height:"calc(100vh - 120px)",minHeight:500}}>
    {/* LEFT: calendar grid */}
    <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:16,padding:20,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={prevMonth} style={{background:D.surface,border:`1px solid ${D.border}`,borderRadius:8,padding:"5px 8px",cursor:"pointer",color:D.muted}}>
            <ChevronLeft size={15}/>
          </button>
          <div style={{fontSize:18,fontWeight:900,color:D.text,minWidth:180}}>
            {MONTHS_RU[current.m]} {current.y}
          </div>
          <button onClick={nextMonth} style={{background:D.surface,border:`1px solid ${D.border}`,borderRadius:8,padding:"5px 8px",cursor:"pointer",color:D.muted}}>
            <ChevronRight size={15}/>
          </button>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {/* Legend */}
          <div style={{display:"flex",gap:8,marginRight:8,fontSize:10,color:D.muted}}>
            {[["📐",D.teal,"Замер"],["🔧",D.purple,"Монтаж"],["🔔",D.yellow,"Follow-up"],["💰",D.green,"Платёж"]].map(([ico,c,l])=>(
              <span key={l} style={{display:"flex",alignItems:"center",gap:3}}>
                <span style={{width:8,height:8,borderRadius:"50%",background:c,display:"inline-block"}}/>
                {l}
              </span>
            ))}
          </div>
          <button onClick={goToday} style={{background:D.accent+"20",border:`1px solid ${D.accent}40`,
            borderRadius:7,padding:"5px 12px",cursor:"pointer",color:D.accentLight,fontSize:11,fontWeight:700}}>
            Сегодня
          </button>
          {/* View toggle */}
          <div style={{display:"flex",background:D.surface,borderRadius:8,padding:2,gap:2}}>
            {[["month","Месяц"],["week","Неделя"]].map(([v,l])=>(
              <button key={v} onClick={()=>setView(v)}
                style={{padding:"4px 10px",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,
                  background:view===v?D.accent:"transparent",color:view===v?"#fff":D.muted}}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view==="month"?(
        <>
          {/* Day headers */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
            {DAYS_RU.map((d,i)=>(
              <div key={d} style={{textAlign:"center",fontSize:10,fontWeight:800,
                color:i>=5?D.red:D.muted,padding:"4px 0",textTransform:"uppercase"}}>
                {d}
              </div>
            ))}
          </div>
          {/* Day cells */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,flex:1,overflow:"auto"}}>
            {days.map(({date,cur})=>{
              const evs=eventsMap[date]||[];
              const isSel=date===selected;
              const isToday=date===today;
              const isWe=new Date(date).getDay()===0||new Date(date).getDay()===6;
              return(
                <div key={date} onClick={()=>setSelected(date)}
                  style={{borderRadius:10,padding:"5px 4px",cursor:"pointer",minHeight:70,
                    background:isSel?D.accent+"25":isToday?D.accent+"10":D.surface,
                    border:`1.5px solid ${isSel?D.accent:isToday?D.accent+"60":"transparent"}`,
                    opacity:cur?1:0.35,transition:"all 0.1s"}}>
                  <div style={{fontSize:11,fontWeight:isToday?900:isSel?700:500,
                    color:isToday?D.accentLight:isSel?D.accentLight:isWe?D.red:D.text,
                    marginBottom:3,textAlign:"right",paddingRight:2}}>
                    {isToday?<span style={{background:D.accent,color:"#fff",borderRadius:10,padding:"1px 5px"}}>{new Date(date).getDate()}</span>:new Date(date).getDate()}
                  </div>
                  {/* Event dots */}
                  <div style={{display:"flex",flexDirection:"column",gap:2}}>
                    {evs.slice(0,3).map((ev,i)=>(
                      <div key={i} style={{background:ev.color+"25",borderLeft:`2px solid ${ev.color}`,
                        borderRadius:"0 4px 4px 0",padding:"1px 4px",fontSize:9,fontWeight:600,
                        color:ev.color,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {TYPE_ICONS[ev.type]} {ev.label}
                      </div>
                    ))}
                    {evs.length>3&&<div style={{fontSize:9,color:D.muted,paddingLeft:4}}>+{evs.length-3}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ):(
        /* WEEK VIEW */
        <div style={{flex:1,overflow:"auto"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:6}}>
            {weekDays.map(date=>{
              const evs=eventsMap[date]||[];
              const isToday=date===today;
              const isSel=date===selected;
              const d=new Date(date);
              const dow=((d.getDay()+6)%7);
              return(
                <div key={date} onClick={()=>setSelected(date)}
                  style={{borderRadius:12,padding:10,cursor:"pointer",minHeight:200,
                    background:isSel?D.accent+"20":isToday?D.accent+"10":D.surface,
                    border:`1.5px solid ${isSel?D.accent:isToday?D.accent+"50":D.border}`}}>
                  <div style={{textAlign:"center",marginBottom:8}}>
                    <div style={{fontSize:9,color:dow>=5?D.red:D.muted,fontWeight:700,textTransform:"uppercase"}}>{DAYS_RU[dow]}</div>
                    <div style={{fontSize:18,fontWeight:900,
                      color:isToday?D.accentLight:isSel?D.accentLight:D.text}}>
                      {isToday?<span style={{background:D.accent,color:"#fff",borderRadius:"50%",width:28,height:28,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:15}}>{d.getDate()}</span>:d.getDate()}
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}>
                    {evs.map((ev,i)=>(
                      <div key={i} onClick={e=>{e.stopPropagation();onClientClick&&onClientClick(ev.client);}}
                        style={{background:ev.color+"20",border:`1px solid ${ev.color}40`,
                          borderRadius:6,padding:"4px 6px",cursor:"pointer"}}
                        onMouseEnter={e=>e.currentTarget.style.background=ev.color+"35"}
                        onMouseLeave={e=>e.currentTarget.style.background=ev.color+"20"}>
                        <div style={{fontSize:10,fontWeight:700,color:ev.color}}>{TYPE_ICONS[ev.type]} {TYPE_LABELS[ev.type]}</div>
                        <div style={{fontSize:11,fontWeight:600,color:D.text}}>{ev.label}</div>
                        {ev.sub&&<div style={{fontSize:9,color:D.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ev.sub}</div>}
                      </div>
                    ))}
                    {evs.length===0&&<div style={{fontSize:10,color:D.muted,textAlign:"center",marginTop:8}}>—</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>

    {/* RIGHT: selected day panel */}
    <div style={{display:"flex",flexDirection:"column",gap:10,overflow:"auto"}}>
      {/* Selected day header */}
      <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,padding:16}}>
        <div style={{fontSize:13,fontWeight:900,color:D.text,marginBottom:2}}>
          {selected===today?"📅 Сегодня":""} {new Date(selected).toLocaleDateString("ru-RU",{weekday:"long",day:"numeric",month:"long"})}
        </div>
        <div style={{fontSize:11,color:D.muted,marginBottom:12}}>
          {selEvents.length>0?`${selEvents.length} событий`:"Нет событий"}
        </div>
        {/* Quick add buttons */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
          {[["measure","📐 Замер",D.teal],["install","🔧 Монтаж",D.purple],
            ["followup","🔔 Follow-up",D.yellow]].map(([type,label,color])=>(
            <button key={type} onClick={()=>setQuickModal({date:selected,type})}
              style={{background:color+"15",border:`1px solid ${color}40`,borderRadius:8,
                padding:"7px 6px",cursor:"pointer",color,fontWeight:700,fontSize:11}}>
              {label}
            </button>
          ))}
          <button onClick={()=>setPage&&setPage("calc")}
            style={{background:D.accent+"15",border:`1px solid ${D.accent}40`,borderRadius:8,
              padding:"7px 6px",cursor:"pointer",color:D.accentLight,fontWeight:700,fontSize:11}}>
            🧮 КП
          </button>
        </div>
      </div>

      {/* Events for selected day */}
      {selEvents.length>0&&(<div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,padding:16}}>
        <div style={{fontSize:10,fontWeight:800,color:D.muted,textTransform:"uppercase",marginBottom:10}}>События дня</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {selEvents.map((ev,i)=>(
            <div key={i} style={{background:ev.color+"12",border:`1px solid ${ev.color}30`,
              borderRadius:10,padding:"10px 12px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,fontWeight:800,color:ev.color}}>
                    {TYPE_ICONS[ev.type]} {TYPE_LABELS[ev.type]}
                    {ev.isPast&&<span style={{marginLeft:6,fontSize:9,background:D.red,color:"#fff",borderRadius:4,padding:"1px 4px"}}>просрочено</span>}
                  </div>
                  <div onClick={()=>onClientClick&&onClientClick(ev.client)}
                    style={{fontSize:13,fontWeight:700,color:D.text,cursor:"pointer",marginTop:2}}>
                    {ev.label}
                  </div>
                  {ev.sub&&<div style={{fontSize:10,color:D.muted,marginTop:1}}>{ev.sub}</div>}
                </div>
                <div style={{display:"flex",gap:4,flexShrink:0}}>
                  {ev.phone&&(<a href={`tel:${ev.phone}`}
                    style={{background:D.green+"20",border:`1px solid ${D.green}40`,borderRadius:6,
                      padding:"4px 7px",color:D.green,fontSize:10,fontWeight:700,textDecoration:"none"}}>
                    📞
                  </a>)}
                  {ev.phone&&(<a href={`https://wa.me/${ev.phone.replace(/[^0-9]/g,"").replace(/^0/,"972")}`}
                    target="_blank" rel="noreferrer"
                    style={{background:"#25D36620",border:"1px solid #25D36640",borderRadius:6,
                      padding:"4px 7px",color:"#25D366",fontSize:10,fontWeight:700,textDecoration:"none"}}>
                    WA
                  </a>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>)}

      {/* Upcoming 7 days */}
      <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:14,padding:16}}>
        <div style={{fontSize:10,fontWeight:800,color:D.muted,textTransform:"uppercase",marginBottom:10}}>
          📅 Ближайшие 7 дней
        </div>
        {(()=>{
          const upcoming=[];
          for(let i=0;i<7;i++){
            const d=new Date();d.setDate(d.getDate()+i);
            const dstr=d.toISOString().split("T")[0];
            const evs=eventsMap[dstr]||[];
            if(evs.length>0)upcoming.push({date:dstr,evs,label:i===0?"Сегодня":i===1?"Завтра":d.toLocaleDateString("ru-RU",{weekday:"short",day:"numeric",month:"short"})});
          }
          if(upcoming.length===0)return<div style={{fontSize:11,color:D.muted}}>Нет запланированных событий</div>;
          return upcoming.map(({date,evs,label})=>(
            <div key={date} onClick={()=>setSelected(date)}
              style={{marginBottom:8,cursor:"pointer",padding:"6px 8px",borderRadius:8,
                background:date===today?D.accent+"10":D.surface}}
              onMouseEnter={e=>e.currentTarget.style.background=D.accent+"10"}
              onMouseLeave={e=>e.currentTarget.style.background=date===today?D.accent+"10":D.surface}>
              <div style={{fontSize:10,fontWeight:700,color:D.muted,marginBottom:4}}>{label}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                {evs.map((ev,i)=>(
                  <span key={i} style={{background:ev.color+"20",color:ev.color,
                    border:`1px solid ${ev.color}40`,borderRadius:5,padding:"2px 6px",fontSize:10,fontWeight:600}}>
                    {TYPE_ICONS[ev.type]} {ev.label}
                  </span>
                ))}
              </div>
            </div>
          ));
        })()}
      </div>
    </div>

    {/* QUICK CREATE MODAL */}
    {quickModal&&(<Modal title={`${TYPE_ICONS[quickModal.type]} Создать ${TYPE_LABELS[quickModal.type]} — ${new Date(quickModal.date).toLocaleDateString("ru-RU",{day:"numeric",month:"long"})}`}
      onClose={()=>setQuickModal(null)}>
      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:12}}>
        <Inp label="Клиент *" value={quickForm.client} onChange={e=>setQuickForm(p=>({...p,client:e.target.value}))} placeholder="Имя клиента"/>
        {quickModal.type!=="followup"&&<Inp label="Телефон" value={quickForm.phone} onChange={e=>setQuickForm(p=>({...p,phone:e.target.value}))} placeholder="05X-XXXXXXX"/>}
        {quickModal.type!=="followup"&&<Inp label="Адрес" value={quickForm.address} onChange={e=>setQuickForm(p=>({...p,address:e.target.value}))} placeholder="Улица, город"/>}
        {quickModal.type==="followup"&&(
          <div style={{fontSize:11,color:D.muted,background:D.surface,borderRadius:8,padding:10}}>
            Для Follow-up введи имя клиента точно как в CRM — дата follow-up обновится автоматически.
          </div>
        )}
        <Inp label="Заметки" value={quickForm.notes} onChange={e=>setQuickForm(p=>({...p,notes:e.target.value}))} placeholder="Доп. информация..."/>
      </div>
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={saveQuick} variant="success"><Check size={13}/> Сохранить</Btn>
        <Btn onClick={()=>setQuickModal(null)} variant="ghost">Отмена</Btn>
      </div>
    </Modal>)}
  </div>);
}

const PAGES=()=>[
  {id:"dashboard",   icon:LayoutDashboard, label:ui("dashboard")},
  {id:"leads",       icon:Users,           label:ui("leads")},
  {id:"measurements",icon:Ruler,           label:ui("measurements")},
  {id:"calc",        icon:Calculator,      label:ui("calc")},
  {id:"quotes",      icon:FileText,        label:ui("quotes")},
  {id:"orders",      icon:ShoppingCart,    label:ui("orders")},
  {id:"installation",icon:Wrench,          label:ui("install")},
  {id:"payments",    icon:Wallet,          label:ui("payments")},
  {id:"calendar",    icon:CalendarDays,    label:ui("calendar")},
  {id:"finance",     icon:TrendingUp,      label:ui("finance")},
  {id:"kpi",         icon:BarChart2,       label:ui("kpi")},
  {id:"inventory",   icon:Package,         label:ui("inventory")},
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
  const [clientCard,setClientCard]=useState(null); // client name to show card
  const [sidebarOpen,setSidebarOpen]=useState(false); // mobile sidebar
  const [quotes,setQuotes]=useState(()=>load(KEYS.quotes,[]));
  const [templates,setTemplates]=useState(()=>load(KEYS.templates,[]));
  const [activity,setActivity]=useState(()=>load(KEYS.activity,[]));
  const [lang,setLang]=useState(()=>{
    const stored=load(KEYS.lang,"ru");
    _LANG=stored;
    return stored;
  });
  const [company,setCompany]=useState(()=>load(KEYS.company,{
    name:"חלונות אלומיניום",nameRu:"Алюминиевые окна",
    phone:"050-000-0000",address:"",email:"",
    bank:"",bankAccount:"",taxId:"",
    bizType:"חברה בעמ",
  }));
  const [companyModal,setCompanyModal]=useState(false);
  const [installations,setInstallations]=useState(()=>load(KEYS.installations,II_INST));

  useEffect(()=>{setSaved(false);save(KEYS.leads,leads);setTimeout(()=>setSaved(true),600);},[leads]);
  useEffect(()=>{save(KEYS.measurements,measurements);},[measurements]);
  useEffect(()=>{save(KEYS.orders,orders);},[orders]);
  useEffect(()=>{save(KEYS.installations,installations);},[installations]);
  useEffect(()=>{save(KEYS.quotes,quotes);},[quotes]);
  useEffect(()=>{save(KEYS.templates,templates);},[templates]);
  useEffect(()=>{save(KEYS.activity,activity);},[activity]);
  useEffect(()=>{save(KEYS.company,company);},[company]);
  useEffect(()=>{_LANG=lang;save(KEYS.lang,lang);},[lang]);

  // ── FIREBASE SYNC ─────────────────────────────────────────
  const [fbSynced,setFbSynced]=useState(false);
  const [fbOnline,setFbOnline]=useState(false);

  useEffect(()=>{
    // Load from Firebase on app start
    fbLoadAll().then(fbData=>{
      if(!fbData){setFbSynced(true);return;}
      // Update all states from Firebase (cloud is source of truth)
      const upd=(key,setter)=>{if(fbData[key]!==undefined&&fbData[key]!==null){
        const val=Array.isArray(fbData[key])?fbData[key]:
                  typeof fbData[key]==="object"?fbData[key]:fbData[key];
        localStorage.setItem("wb:"+key,JSON.stringify(val));
        setter(val);
      }};
      upd("leads",setLeads);
      upd("orders",setOrders);
      upd("measurements",setMeasurements);
      upd("installations",setInstallations);
      upd("inventory",setInventory);
      upd("payments",setPayments);
      upd("kpi",setKpi);
      upd("quotes",setQuotes);
      upd("templates",setTemplates);
      upd("activity",setActivity);
      if(fbData.company)setCompany(fbData.company);
      setFbOnline(true);
      setFbSynced(true);
    }).catch(()=>setFbSynced(true));

    // Subscribe to real-time updates (for multi-device sync)
    const unsub=fbSubscribe(fbData=>{
      if(!fbData)return;
      setFbOnline(true);
      // Only update if data changed (avoid infinite loop)
      const upd=(key,setter,current)=>{
        if(fbData[key]===undefined||fbData[key]===null)return;
        const remote=JSON.stringify(fbData[key]);
        const local=JSON.stringify(current);
        if(remote!==local){localStorage.setItem("wb:"+key,remote);setter(fbData[key]);}
      };
      // Note: we use functional state updates to get current values
      setLeads(cur=>{if(fbData.leads&&JSON.stringify(fbData.leads)!==JSON.stringify(cur))return fbData.leads;return cur;});
      setOrders(cur=>{if(fbData.orders&&JSON.stringify(fbData.orders)!==JSON.stringify(cur))return fbData.orders;return cur;});
      setPayments(cur=>{if(fbData.payments&&JSON.stringify(fbData.payments)!==JSON.stringify(cur))return fbData.payments;return cur;});
      setMeasurements(cur=>{if(fbData.measurements&&JSON.stringify(fbData.measurements)!==JSON.stringify(cur))return fbData.measurements;return cur;});
      setInstallations(cur=>{if(fbData.installations&&JSON.stringify(fbData.installations)!==JSON.stringify(cur))return fbData.installations;return cur;});
      setQuotes(cur=>{if(fbData.quotes&&JSON.stringify(fbData.quotes)!==JSON.stringify(cur))return fbData.quotes;return cur;});
    });
    return unsub;
  },[]);

  // Request push permission and check follow-ups on load
  useEffect(()=>{
    requestPushPermission().then(granted=>{
      if(granted)checkFollowUps(leads);
    });
    // Check again every hour
    const interval=setInterval(()=>{
      if(Notification.permission==="granted")checkFollowUps(leads);
    },3600000);
    return()=>clearInterval(interval);
  },[]);
  useEffect(()=>{save(KEYS.inventory,inventory);},[inventory]);
  useEffect(()=>{save(KEYS.payments,payments);},[payments]);
  useEffect(()=>{save(KEYS.kpi,kpi);},[kpi]);

  const openCalc=(measurement)=>{setCalcPreload(measurement);setPage("calc");setSidebarOpen(false);};
  const navTo=(pg)=>{setPage(pg);setSidebarOpen(false);};
  const [globalSearch,setGlobalSearch]=useState("");
  const [searchFocus,setSearchFocus]=useState(false);

  const today=new Date().toISOString().split("T")[0];
  const overdueFollowUps=leads.filter(l=>l.followUp&&l.followUp<today&&!["Закрыт (выиграли)","Закрыт (проиграли)"].includes(l.status));
  const pendM=measurements.filter(m=>m.status==="Запланирован").length;
  const pendInst=installations.filter(i=>i.status==="Запланирован"||i.status==="В процессе").length;
  const todayStr2=new Date().toISOString().split("T")[0];
  const todayCalEvents=[
    ...measurements.filter(m=>m.date===todayStr2),
    ...installations.filter(i=>i.scheduledDate===todayStr2),
    ...leads.filter(l=>l.followUp===todayStr2),
  ].length;
  const alerts=[
    leads.filter(l=>l.status==="Новый лид").length, // dashboard
    leads.filter(l=>l.status==="Новый лид").length, // leads
    pendM,           // measurements
    null,            // calc
    null,            // quotes
    pendInst,        // orders
    inventory.filter(i=>i.qty<i.minQty).length, // installation
    payments.filter(p=>p.status==="Ожидается").length, // payments
    todayCalEvents,  // calendar
    overdueFollowUps.length, // finance
    null,            // kpi
    null,            // inventory
  ];

  const SidebarContent=()=>(<>
    <div style={{padding:"16px 14px 12px",borderBottom:`1px solid ${D.border}`}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:34,height:34,background:"linear-gradient(135deg,#2563EB,#1D4ED8)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🏭</div>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:900,color:D.text}}>WindowOS</div>
          <div style={{display:"flex",alignItems:"center",gap:4,marginTop:1}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:saved?D.green:D.yellow}}/>
            <span style={{fontSize:9,color:D.muted,fontWeight:600}}>{saved?"Сохранено":"Сохраняю..."}</span>
            {fbOnline&&<span style={{fontSize:9,color:"#F97316",fontWeight:700,marginLeft:2}}>☁️</span>}
            {fbSynced&&!fbOnline&&<span style={{fontSize:9,color:D.muted,marginLeft:2}}>offline</span>}
          </div>
        </div>
        <button onClick={()=>setSidebarOpen(false)} style={{background:"none",border:"none",cursor:"pointer",color:D.muted,padding:4,display:window.innerWidth<768?"flex":"none",alignItems:"center"}}>
          <X size={16}/>
        </button>
      </div>
    </div>
    <nav style={{flex:1,padding:"8px 6px",overflowY:"auto"}}>
      {PAGES().map(({id,icon:Icon,label},pi)=>{
        const active=page===id;const badge=alerts[pi];
        return(<button key={id} onClick={()=>navTo(id)} style={{display:"flex",alignItems:"center",gap:9,
          width:"100%",padding:"9px 10px",borderRadius:9,marginBottom:2,cursor:"pointer",border:"none",
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
        overdueFollowUps.length>0&&[`🔴 ${overdueFollowUps.length} просрочен follow-up`,"leads"],
        pendM>0&&[`📐 ${pendM} замеров ждут`,"measurements"],
        pendInst>0&&[`🔧 ${pendInst} монтажей активно`,"installation"],
        inventory.filter(i=>i.qty<i.minQty).length>0&&[`📦 нужна закупка`,"inventory"],
        payments.filter(p=>p.status==="Ожидается").length>0&&[`💰 ожидаются платежи`,"payments"],
      ].filter(Boolean).map(([a,pg],i)=>(<button key={i} onClick={()=>navTo(pg)}
        style={{display:"block",width:"100%",textAlign:"left",background:D.yellow+"12",border:`1px solid ${D.yellow}25`,
          borderRadius:7,padding:"5px 8px",marginBottom:3,fontSize:9,fontWeight:700,color:D.yellow,cursor:"pointer"}}
        onMouseEnter={e=>e.currentTarget.style.background=D.yellow+"28"}
        onMouseLeave={e=>e.currentTarget.style.background=D.yellow+"12"}>{a} →</button>))}
    </div>
    <div style={{padding:"8px",borderTop:`1px solid ${D.border}`}}>
      {/* Language switcher */}
      <div style={{display:"flex",gap:4,marginBottom:6}}>
        {[["ru","🇷🇺"],["he","🇮🇱"],["en","🇺🇸"]].map(([l,flag])=>(
          <button key={l} onClick={()=>{_LANG=l;setLang(l);}}
            style={{flex:1,padding:"5px 2px",borderRadius:6,border:`1px solid ${lang===l?D.accent:D.border}`,
              background:lang===l?D.accent+"20":"transparent",color:lang===l?D.accentLight:D.muted,
              fontSize:13,cursor:"pointer",letterSpacing:0}}>
            {flag}
          </button>
        ))}
      </div>
      {/* Company settings */}
      <button onClick={()=>setCompanyModal(true)}
        style={{width:"100%",background:D.surface,border:`1px solid ${D.border}`,borderRadius:7,
          padding:"5px 8px",color:D.muted,fontSize:10,cursor:"pointer",textAlign:"left"}}>
        ⚙️ Реквизиты компании
      </button>
    </div>
    <div style={{padding:"6px 14px 8px",fontSize:9,color:D.muted+"55"}}>WindowOS v5.0 🇮🇱</div>
  </>);

  return(<div style={{display:"flex",height:"100vh",background:D.bg,fontFamily:"'Segoe UI',Arial,sans-serif",overflow:"hidden",position:"relative"}}>
    {/* DESKTOP SIDEBAR */}
    <div className="desktop-sidebar" style={{width:210,background:D.surface,borderRight:`1px solid ${D.border}`,display:"flex",flexDirection:"column",flexShrink:0,
      '@media (max-width: 768px)':{display:"none"}}}>
      <SidebarContent/>
    </div>

    {/* MOBILE SIDEBAR OVERLAY */}
    {sidebarOpen&&(<>
      <div onClick={()=>setSidebarOpen(false)} style={{position:"fixed",inset:0,background:"#00000070",zIndex:900}}/>
      <div style={{position:"fixed",left:0,top:0,bottom:0,width:240,background:D.surface,
        borderRight:`1px solid ${D.border}`,display:"flex",flexDirection:"column",zIndex:901,
        boxShadow:"4px 0 24px #00000050"}}>
        <SidebarContent/>
      </div>
    </>)}

    {/* MAIN */}
    <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",minWidth:0}}>
      {/* MOBILE TOP BAR */}
      <div style={{display:"none",padding:"10px 14px",background:D.surface,borderBottom:`1px solid ${D.border}`,
        alignItems:"center",gap:10,position:"sticky",top:0,zIndex:100,
        // Inline style can't do media queries, use a class approach - we'll show it always on small viewport
        // We handle this with JS-based isMobile
        }} id="mobile-topbar">
        <button onClick={()=>setSidebarOpen(true)} style={{background:"none",border:"none",cursor:"pointer",color:D.muted,padding:4}}>
          <Menu size={20}/>
        </button>
        <div style={{fontSize:14,fontWeight:900,color:D.text}}>WindowOS</div>
        <div style={{fontSize:11,color:D.muted,flex:1}}>{PAGES().find(p=>p.id===page)?.label||""}</div>
        <div style={{width:8,height:8,borderRadius:"50%",background:saved?D.green:D.yellow}}/>
      </div>

      <div style={{flex:1,padding:"18px 16px",overflowY:"auto"}}>
        {/* GLOBAL SEARCH BAR */}
        <div style={{position:"relative",marginBottom:18}}>
          <Search size={13} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:D.muted,pointerEvents:"none"}}/>
          <input
            value={globalSearch}
            onChange={e=>setGlobalSearch(e.target.value)}
            onFocus={()=>setSearchFocus(true)}
            onBlur={()=>setTimeout(()=>setSearchFocus(false),200)}
            placeholder="🔍 Глобальный поиск — клиент, телефон, заказ, адрес..."
            style={{width:"100%",background:D.card,border:`1px solid ${searchFocus?D.accent:D.border}`,
              borderRadius:10,padding:"9px 12px 9px 36px",color:D.text,fontSize:13,
              outline:"none",boxSizing:"border-box",transition:"border-color 0.2s"}}/>
          {globalSearch&&<button onClick={()=>setGlobalSearch("")}
            style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",
              background:"none",border:"none",cursor:"pointer",color:D.muted,padding:2}}>
            <X size={14}/>
          </button>}
          {(searchFocus||globalSearch)&&globalSearch.trim()&&(
            <GlobalSearch
              q={globalSearch} leads={leads} measurements={measurements} orders={orders}
              payments={payments} installations={installations}
              onClientClick={setClientCard}
              onClose={()=>setGlobalSearch("")}
            />
          )}
        </div>
        {page==="dashboard"&&<Dashboard key={lang} leads={leads} orders={orders} payments={payments} inventory={inventory} kpi={kpi} measurements={measurements} installations={installations} onClientClick={setClientCard}/>}
        {page==="calendar"&&<Calendar key={lang} leads={leads} measurements={measurements} installations={installations} payments={payments} setMeasurements={setMeasurements} setInstallations={setInstallations} setLeads={setLeads} onClientClick={setClientCard} setPage={navTo}/>}
        {page==="leads"&&<Leads key={lang} leads={leads} setLeads={setLeads} onClientClick={setClientCard}/>}
        {page==="measurements"&&<Measurements key={lang} measurements={measurements} setMeasurements={setMeasurements} onOpenCalc={openCalc} leads={leads} setLeads={setLeads} onClientClick={setClientCard}/>}
        {page==="orders"&&<Orders key={lang} orders={orders} setOrders={setOrders} setPayments={setPayments} payments={payments} onClientClick={setClientCard}/>}
        {page==="installation"&&<Installation key={lang} installations={installations} setInstallations={setInstallations} orders={orders} onClientClick={setClientCard}/>}
        {page==="inventory"&&<Inventory key={lang} inventory={inventory} setInventory={setInventory}/>}
        {page==="payments"&&<Payments key={lang} payments={payments} setPayments={setPayments} onClientClick={setClientCard} company={company}/>}
        {page==="quotes"&&<Quotes key={lang} quotes={quotes} setQuotes={setQuotes} onClientClick={setClientCard}/>}
        {page==="finance"&&<FinancePL key={lang} orders={orders} payments={payments} leads={leads} measurements={measurements} kpi={kpi}/>}
        {page==="kpi"&&<KPI key={lang} leads={leads} measurements={measurements} orders={orders} payments={payments}/>}
        {page==="calc"&&<Calc key={lang} preload={calcPreload} setPreload={setCalcPreload} orders={orders} setOrders={setOrders} leads={leads} setLeads={setLeads} quotes={quotes} setQuotes={setQuotes} templates={templates} setTemplates={setTemplates} setActivity={setActivity} company={company}/>}
      </div>
    </div>

    {/* CLIENT CARD PANEL */}
    {clientCard&&(<ClientCard
      clientName={clientCard}
      leads={leads} measurements={measurements} orders={orders}
      installations={installations} payments={payments}
      quotes={quotes} activity={activity} setActivity={setActivity}
      onClose={()=>setClientCard(null)}
      onOpenCalc={openCalc}
      setPage={navTo}
    />)}

    {/* COMPANY SETTINGS MODAL */}
    {companyModal&&(<Modal title="⚙️ Реквизиты компании" onClose={()=>setCompanyModal(false)}>
      {/* Business type selector */}
      <div style={{marginBottom:14}}>
        <div style={{fontSize:9,color:D.muted,fontWeight:700,textTransform:"uppercase",marginBottom:6}}>סוג עסק / Тип бизнеса</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {[["עוסק פטור","Освобождённый"],["עוסק מורשה","Авторизованный"],["חברה בעמ","Ltd (חברה)"],["שותפות","Партнёрство"],["עמותה","НКО"]].map(([t,r])=>(
            <button key={t} onClick={()=>setCompany(p=>({...p,bizType:t}))}
              style={{padding:"6px 12px",borderRadius:7,border:`1px solid ${(company.bizType||"חברה בעמ")===t?D.accent:D.border}`,
                background:(company.bizType||"חברה בעמ")===t?D.accent+"20":"transparent",
                color:(company.bizType||"חברה בעמ")===t?D.accentLight:D.muted,
                fontSize:11,fontWeight:700,cursor:"pointer"}}>
              {t}<span style={{fontSize:9,opacity:0.7,marginRight:3}}> {r}</span>
            </button>
          ))}
        </div>
        {["עוסק מורשה","חברה בעמ","שותפות"].includes(company.bizType||"חברה בעמ")&&
          <div style={{fontSize:10,color:D.teal,marginTop:5}}>✅ מע"מ 18% · חשבוניות מס · מספר הקצאה נדרש ≥ ₪10,000</div>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
        {[
          ["Название (иврит) | שם","name","חלונות אלומיניום"],
          ["Название (рус)","nameRu","Алюминиевые окна"],
          ["Телефон | טלפון","phone","050-000-0000"],
          ["Email","email","info@company.com"],
          ["Адрес | כתובת","address","תל אביב..."],
          ["ח.פ. / ע.מ. / מספר עוסק","taxId",""],
          ["Банк | בנק","bank","הפועלים"],
          ["Счёт | חשבון בנק","bankAccount",""],
        ].map(([l,k,ph])=>(
          <div key={k}>
            <div style={{fontSize:9,color:D.muted,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>{l}</div>
            <input value={company[k]||""} onChange={e=>setCompany(p=>({...p,[k]:e.target.value}))}
              placeholder={ph}
              style={{width:"100%",background:D.bg,border:`1px solid ${D.border}`,borderRadius:7,
                padding:"7px 10px",color:D.text,fontSize:12,outline:"none",boxSizing:"border-box"}}/>
          </div>
        ))}
      </div>
      <div style={{fontSize:10,color:D.teal,marginBottom:12,padding:"6px 10px",background:D.teal+"12",borderRadius:6}}>
        ✓ הפרטים יופיעו בכל החשבוניות, קבלות, הצעות מחיר ותעודות גמר
      </div>
      <Btn onClick={()=>setCompanyModal(false)} variant="success"><Check size={13}/> שמור</Btn>
    </Modal>)}

    {/* Mobile sidebar toggle */}
    <style>{`
      @media (max-width: 768px) {
        .desktop-sidebar { display: none !important; }
        #mobile-topbar { display: flex !important; }
        body { font-size: 14px; }
      }
      @media (min-width: 769px) {
        #mobile-topbar { display: none !important; }
      }
    `}</style>
  </div>);
}
