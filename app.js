/* 10k.app — ростеры и дата-листы Warhammer 40,000 (10-я редакция). Без сборки, без зависимостей. */
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 10);

/* ---------------- иконки ---------------- */
const I = {
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
  army: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h10"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5z"/><path d="M4 19a2 2 0 012-2h13"/></svg>',
  rules: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z"/></svg>',
  dots: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>',
  chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
  right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M9 6l6 6-6 6"/></svg>',
  warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
  crown: '<svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M3 18h18l-1.5-10-5 4L12 5l-2.5 7-5-4z"/></svg>',
  ankh: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><circle cx="32" cy="32" r="22"/><path d="M32 16v32M24 22v20M40 22v20"/></svg>',
};

/* ---------------- интерфейс RU/EN ---------------- */
const UI = {
  ru: {
    faction: 'Фракция', factionLocked: 'Сначала убери юниты, чтобы сменить фракцию', armies: 'Армии', units: 'Юниты', rules: 'Правила', newArmy: 'Новая армия', add: 'Добавить', create: 'Создать',
    name: 'Название', limit: 'Лимит очков', detachment: 'Детачмент', noArmies: 'Пока нет ни одной армии',
    noArmiesHint: 'Создай ростер, чтобы держать под рукой датащиты, стратагемы и детач.',
    pts: 'оч.', unitsCount: n => `${n} ${plural(n, 'юнит', 'юнита', 'юнитов')}`, empty: 'В армии пока пусто',
    emptyHint: 'Нажми «Добавить», чтобы выбрать юниты.', roster: 'Состав', strats: 'Стратагемы', det: 'Детач',
    search: 'Поиск юнитов', searchAll: 'Поиск по юнитам и правилам', size: 'Размер отряда', enh: 'Энхансмент', none: 'Нет',
    warlord: 'Варлорд', duplicate: 'Дублировать', remove: 'Убрать', inArmy: 'В армии', added: 'Добавлено',
    settingsUnit: 'В этой армии', edit: 'Армия', save: 'Сохранить', del: 'Удалить армию', delConfirm: 'Удалить эту армию? Это нельзя отменить.',
    export: 'Экспорт', import: 'Импорт', copyText: 'Скопировать списком', copyJSON: 'Скопировать для импорта', copied: 'Скопировано',
    share: 'Поделиться', importHint: 'Вставь сюда данные экспорта (JSON) — армия добавится к твоим.', importDo: 'Импортировать',
    imported: n => `Импортировано: ${n}`, importBad: 'Не получилось прочитать данные', file: 'Из файла', download: 'Скачать файл',
    all: 'Все', phases: { command: 'Командная', movement: 'Движение', shooting: 'Стрельба', charge: 'Чардж', fight: 'Бой', any: 'Любая' },
    your: 'Твой ход', opp: 'Ход противника', either: 'Любой ход', core: 'Основные стратагемы (Core)', coreShort: 'Core',
    armyRule: 'Правило армии', detachments: 'Детачменты', glossary: 'Ключевые слова', enhancements: 'Энхансменты',
    detRules: 'Правило детача', ranged: 'Стрелковое оружие', melee: 'Оружие ближнего боя', keywords: 'Ключевые слова',
    coreAb: 'Основные способности', factionAb: 'Способности фракции', leads: 'Может присоединиться к', invuln: 'Инвуль',
    damaged: 'Повреждения', settings: 'Настройки', language: 'Язык', data: 'Данные', about: 'О приложении',
    dataSource: 'Датащиты, детачи и стратагемы — с 10.40k.app; основные стратагемы Core и часть расшифровок ключевых слов — по базовым правилам, сверяй с актуальной версией.',
    backupHint: 'Армии хранятся только в этом браузере. Время от времени сохраняй резервную копию.', exportAll: 'Резервная копия всех армий',
    tapKw: 'Нажми на подсвеченное ключевое слово, чтобы увидеть расшифровку.', other: 'Другое значение', models: 'моделей',
    pickDet: 'Выбери детач', open: 'Открыть', lang: 'Язык правил', untranslated: 'Перевода пока нет — показан оригинал.',
    issues: {
      over: (p, l) => `Перебор очков: ${p} из ${l}`, rule3: n => `«${n}»: больше 3 одинаковых датащитов`,
      rule6: n => `«${n}»: больше 6 одинаковых датащитов`, epic: n => `«${n}»: эпический герой может быть только один`,
      enhDup: n => `Энхансмент «${n}» взят несколько раз`, enhMax: 'Больше 3 энхансментов', enhDet: n => `«${n}» не из выбранного детача`,
      noWarlord: 'Не выбран варлорд', noDet: 'Не выбран детач',
    },
  },
  en: {
    faction: 'Faction', factionLocked: 'Remove units first to change the faction', armies: 'Armies', units: 'Units', rules: 'Rules', newArmy: 'New army', add: 'Add', create: 'Create',
    name: 'Name', limit: 'Points limit', detachment: 'Detachment', noArmies: 'No armies yet',
    noArmiesHint: 'Create a roster to keep datasheets, stratagems and your detachment at hand.',
    pts: 'pts', unitsCount: n => `${n} unit${n === 1 ? '' : 's'}`, empty: 'This army is empty',
    emptyHint: 'Tap “Add” to pick units.', roster: 'Roster', strats: 'Stratagems', det: 'Detachment',
    search: 'Search units', searchAll: 'Search units and rules', size: 'Unit size', enh: 'Enhancement', none: 'None',
    warlord: 'Warlord', duplicate: 'Duplicate', remove: 'Remove', inArmy: 'In army', added: 'Added',
    settingsUnit: 'In this army', edit: 'Army', save: 'Save', del: 'Delete army', delConfirm: 'Delete this army? This cannot be undone.',
    export: 'Export', import: 'Import', copyText: 'Copy as list', copyJSON: 'Copy for import', copied: 'Copied',
    share: 'Share', importHint: 'Paste exported data (JSON) here — the army will be added to yours.', importDo: 'Import',
    imported: n => `Imported: ${n}`, importBad: 'Could not read the data', file: 'From file', download: 'Download file',
    all: 'All', phases: { command: 'Command', movement: 'Movement', shooting: 'Shooting', charge: 'Charge', fight: 'Fight', any: 'Any' },
    your: 'Your turn', opp: "Opponent's turn", either: 'Either turn', core: 'Core stratagems', coreShort: 'Core',
    armyRule: 'Army rule', detachments: 'Detachments', glossary: 'Keywords', enhancements: 'Enhancements',
    detRules: 'Detachment rule', ranged: 'Ranged weapons', melee: 'Melee weapons', keywords: 'Keywords',
    coreAb: 'Core abilities', factionAb: 'Faction abilities', leads: 'Can lead', invuln: 'Invuln',
    damaged: 'Damaged', settings: 'Settings', language: 'Language', data: 'Data', about: 'About',
    dataSource: 'Datasheets, detachments and stratagems from 10.40k.app; Core stratagems and some keyword definitions follow the core rules — check them against the current version.',
    backupHint: 'Armies are stored only in this browser. Make a backup from time to time.', exportAll: 'Backup of all armies',
    tapKw: 'Tap a highlighted keyword to see what it does.', other: 'Other', models: 'models',
    pickDet: 'Pick a detachment', open: 'Open', lang: 'Rules language', untranslated: '',
    issues: {
      over: (p, l) => `Over the limit: ${p} of ${l}`, rule3: n => `“${n}”: more than 3 of the same datasheet`,
      rule6: n => `“${n}”: more than 6 of the same datasheet`, epic: n => `“${n}”: Epic Heroes are limited to one`,
      enhDup: n => `Enhancement “${n}” taken more than once`, enhMax: 'More than 3 enhancements', enhDet: n => `“${n}” is not from the selected detachment`,
      noWarlord: 'No Warlord selected', noDet: 'No detachment selected',
    },
  },
};
function plural(n, a, b, c) { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? b : c; }

const CAT_RU = {
  'Epic heroes': 'Эпические герои', 'Leaders & Characters': 'Лидеры и персонажи', 'Battleline': 'Линейные',
  'Mounted': 'Кавалерия', 'Infantry, Swarms, Beasts': 'Пехота, рои, звери', 'Aircraft': 'Авиация', 'Titanic': 'Титанические',
  'Dedicated Transports': 'Транспорты', 'Vehicles, Monsters': 'Техника и монстры',
};
const ROLE = {
  'Epic heroes': 'role-epic', 'Leaders & Characters': 'role-char', 'Battleline': 'role-line', 'Mounted': 'role-mount',
  'Infantry, Swarms, Beasts': 'role-inf', 'Aircraft': 'role-air', 'Titanic': 'role-titan', 'Dedicated Transports': 'role-trans',
  'Vehicles, Monsters': 'role-veh',
};
const SEC_RU = { 'Unit Composition': 'Состав отряда', 'Wargear Options': 'Опции снаряжения', 'Rules': 'Правила', 'Unit Abilities': 'Способности', 'Wargear': 'Снаряжение' };
const PART_RU = { Target: 'Цель', When: 'Когда', Effect: 'Эффект', Restriction: 'Ограничение' };
const TYPE_RU = { 'Battle Tactic': 'Боевая тактика', 'Strategic Ploy': 'Стратегическая уловка', 'Epic Deed': 'Эпическое деяние', 'Wargear': 'Снаряжение' };
const PH_KEYS = ['command', 'movement', 'shooting', 'charge', 'fight'];

/* ---------------- состояние ---------------- */
let DATA = null;            // текущая фракция
const DB = {};              // все фракции по id
let FACTIONS = [];          // [{id, name, ru}]
const TEXTS = {}, GLOSS = {};
const factionName = id => { const f = FACTIONS.find(x => x.id === id); return f ? (lang === 'ru' ? f.ru : f.name) : id; };
function useFaction(id) { DATA = DB[id] || DB[FACTIONS[0].id]; return DATA; }
/** находит фракцию, где есть юнит/детач с таким id */
function findFaction(kind, id) { return FACTIONS.map(f => DB[f.id]).find(d => d[kind].some(x => x.id === id)); }
const store = {
  get(k, d) { try { const v = localStorage.getItem('10k.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('10k.' + k, JSON.stringify(v)); } catch { toast('Не удалось сохранить'); } },
};
let lang = store.get('lang', 'ru');
let armies = store.get('armies', []);
const ui = { stratPhase: 'all', armyTab: {}, unitSearch: '', pickSearch: '', faction: store.get('faction', 'necrons') };
const L = () => UI[lang];
const saveArmies = () => store.set('armies', armies);

const unitById = id => DATA.units.find(u => u.id === id);
const detById = id => DATA.detachments.find(d => d.id === id);
const armyById = id => armies.find(a => a.id === id);
const t = id => { if (!id) return ''; const x = TEXTS[id]; if (!x) return ''; return (lang === 'ru' && x.ru) || x.en; };
const catName = c => lang === 'ru' ? (CAT_RU[c] || c) : c;
const secName = s => lang === 'ru' ? (SEC_RU[s] || s) : s;
const partName = p => lang === 'ru' ? (PART_RU[p] || p) : p;

function miscName(misc) {
  if (lang !== 'ru') return misc;
  const [ph, type] = misc.split(' - ');
  const phases = ph.replace(' Phase', '').split(' & ').map(p => (p === 'Any' ? 'Любая фаза' : L().phases[p.toLowerCase()] || p));
  return phases.join(' / ') + (type ? ' · ' + (TYPE_RU[type] || type) : '');
}
function stratPhases(s) {
  const ph = s.misc.split(' - ')[0].replace(' Phase', '');
  if (ph === 'Any') return PH_KEYS.slice();
  return ph.split(' & ').map(p => p.toLowerCase());
}

/* ---------------- очки и проверки ---------------- */
function entryPts(e) {
  const u = unitById(e.id); if (!u) return 0;
  const c = u.costs[Math.min(e.size || 0, u.costs.length - 1)];
  let p = c ? c.pts : 0;
  if (e.enh) { const en = findEnh(e.enh); if (en) p += en.pts; }
  return p;
}
function findEnh(name, detId) {
  for (const d of DATA.detachments) { if (detId && d.id !== detId) continue; const x = d.enhancements.find(e => e.name === name); if (x) return x; }
  return null;
}
const armyPts = a => a.units.reduce((s, e) => s + entryPts(e), 0);

function validate(a) {
  const out = [], I_ = L().issues, total = armyPts(a);
  if (total > a.limit) out.push(['error', I_.over(total, a.limit)]);
  if (!a.det) out.push(['warn', I_.noDet]);
  const counts = {};
  a.units.forEach(e => { counts[e.id] = (counts[e.id] || 0) + 1; });
  for (const [id, n] of Object.entries(counts)) {
    const u = unitById(id); if (!u) continue;
    if (u.epic && n > 1) out.push(['error', I_.epic(u.name)]);
    else if ((u.battleline || u.transport) ? n > 6 : n > 3) out.push(['error', (u.battleline || u.transport) ? I_.rule6(u.name) : I_.rule3(u.name)]);
  }
  const enh = a.units.filter(e => e.enh).map(e => e.enh);
  if (enh.length > 3) out.push(['error', I_.enhMax]);
  [...new Set(enh)].forEach(n => { if (enh.filter(x => x === n).length > 1) out.push(['error', I_.enhDup(n)]); });
  if (a.det) [...new Set(enh)].forEach(n => { if (!findEnh(n, a.det)) out.push(['error', I_.enhDet(n)]); });
  if (a.units.length && !a.units.some(e => e.warlord)) out.push(['warn', I_.noWarlord]);
  return out;
}

/* ---------------- ключевые слова ---------------- */
function kwKey(name) {
  let k = name.toLowerCase().trim().replace(/^\[|\]$/g, '');
  if (k.startsWith('anti-')) return 'anti';
  k = k.replace(/\s+(\d+\+?|d\d+(\+\d+)?|\d+")$/, '');
  return GLOSS[k] ? k : null;
}
let KW_RE = null;
function kwRegex() {
  if (KW_RE) return KW_RE;
  const title = ['Lethal Hits', 'Sustained Hits(?: (?:D?\\d+))?', 'Devastating Wounds', 'Ignores Cover', 'Indirect Fire', 'Twin-linked',
    'Rapid Fire(?: \\d+)?', 'Feel No Pain(?: \\d\\+)?', 'Deep Strike', 'Lone Operative', 'Deadly Demise(?: [\\dD+]+)?', 'Fights First',
    'Reanimation Protocols', 'Extra Attacks', 'Stealth', 'Infiltrators', 'Scouts(?: \\d+")?', 'Leader', 'invulnerable save'];
  KW_RE = new RegExp('(\\[[A-Z][A-Z -]*?(?: [\\dD+"]+)?\\]|\\b(?:' + title.join('|') + ')\\b)', 'g');
  return KW_RE;
}
/** Подсвечивает ключевые слова в уже вставленном HTML-тексте правил. */
function linkKeywords(root, skipKey) {
  const re = kwRegex();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: n => (n.parentElement.closest('.kw, button, a') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const n of nodes) {
    const s = n.nodeValue; re.lastIndex = 0; if (!re.test(s)) continue;
    re.lastIndex = 0;
    const frag = document.createDocumentFragment(); let last = 0, m;
    while ((m = re.exec(s))) {
      const key = kwKey(m[0]); if (!key || key === skipKey) continue;
      frag.append(s.slice(last, m.index));
      const b = document.createElement('button'); b.className = 'kw'; b.dataset.kw = key; b.dataset.label = m[0].replace(/^\[|\]$/g, ''); b.textContent = m[0];
      frag.append(b); last = m.index + m[0].length;
    }
    if (last === 0) continue;
    frag.append(s.slice(last)); n.replaceWith(frag);
  }
}
const kwChip = (label, plain) => { const k = kwKey(label); return k ? `<button class="kw-chip" data-kw="${k}" data-label="${esc(label)}">${esc(label)}</button>` : `<span class="kw-chip kw-chip--plain">${esc(label)}</span>`; };

/* ---------------- нижняя шторка ---------------- */
function openSheet(title, html, sub, selfKey) {
  closeSheet(true);
  const back = document.createElement('div'); back.className = 'sheet-back';
  const sh = document.createElement('div'); sh.className = 'sheet'; sh.setAttribute('role', 'dialog');
  sh.innerHTML = `<div class="sheet__grip"></div><h2>${esc(title)}</h2><div class="sheet__body">${html}</div>${sub ? `<div class="sheet__sub">${esc(sub)}</div>` : ''}`;
  document.body.append(back, sh);
  linkKeywords($('.sheet__body', sh), selfKey);
  requestAnimationFrame(() => { back.classList.add('show'); sh.classList.add('show'); });
  back.onclick = () => closeSheet();
  let y0 = null, dy = 0;
  sh.addEventListener('touchstart', e => { if (sh.scrollTop <= 0) { y0 = e.touches[0].clientY; dy = 0; sh.style.transition = 'none'; } }, { passive: true });
  sh.addEventListener('touchmove', e => { if (y0 == null) return; dy = Math.max(0, e.touches[0].clientY - y0); sh.style.transform = `translateY(${dy}px)`; }, { passive: true });
  sh.addEventListener('touchend', () => { if (y0 == null) return; sh.style.transition = ''; sh.style.transform = ''; if (dy > 80) closeSheet(); y0 = null; });
  history.pushState({ sheet: 1 }, '');
}
function closeSheet(silent) {
  const sh = $('.sheet'), back = $('.sheet-back'); if (!sh) return;
  sh.classList.remove('show'); back.classList.remove('show');
  setTimeout(() => { sh.remove(); back.remove(); }, 220);
  if (!silent && history.state && history.state.sheet) history.back();
}
function confirmSheet(msg, okLabel, onOk) {
  openSheet(msg, `<div class="settings__actions" style="margin-top:6px"><button class="btn" id="cNo">${lang === 'ru' ? 'Отмена' : 'Cancel'}</button><button class="btn btn--danger" id="cYes">${esc(okLabel)}</button></div>`);
  $('#cNo').onclick = () => closeSheet();
  $('#cYes').onclick = () => { closeSheet(true); onOk(); };
}
function showKeyword(key, label) {
  const g = GLOSS[key]; if (!g) return;
  const x = TEXTS[g.t];
  openSheet(label || g.name, t(g.t), lang === 'ru' && x && !x.ru ? L().untranslated : (label && label !== g.name ? g.name : ''), key);
}
document.addEventListener('click', e => {
  const k = e.target.closest('[data-kw]');
  if (k) { e.preventDefault(); e.stopPropagation(); showKeyword(k.dataset.kw, k.dataset.label); }
}, true);

function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 1600); }

/* ---------------- каркас: шапка и навигация ---------------- */
function setBar({ title, back, actions = '' }) {
  $('#bar').innerHTML = `
    ${back ? `<button class="icon-btn bar__back" id="backBtn" aria-label="Назад">${I.back}</button>` : ''}
    <div class="bar__title">${esc(title)}</div>
    <div class="lang" role="group" aria-label="${L().lang}">
      <button data-lang="ru" class="${lang === 'ru' ? 'on' : ''}">RU</button><button data-lang="en" class="${lang === 'en' ? 'on' : ''}">EN</button>
    </div>${actions}`;
  if (back) $('#backBtn').onclick = () => (history.length > 1 && history.state?.inApp ? history.back() : go(back));
  $$('[data-lang]', $('#bar')).forEach(b => b.onclick = () => { if (lang === b.dataset.lang) return; lang = b.dataset.lang; store.set('lang', lang); document.documentElement.lang = lang; render(true); });
}
function setNav(active) {
  const items = [['armies', '#/', I.army, L().armies], ['units', '#/units', I.book, L().units], ['rules', '#/rules', I.rules, L().rules]];
  $('#nav').innerHTML = items.map(([k, h, ic, label]) => `<a href="${h}" class="${active === k ? 'on' : ''}"><span class="nav__pill">${ic}</span>${label}</a>`).join('');
}
function go(hash) { location.hash = hash; }

/* ---------------- экраны ---------------- */
function viewArmies() {
  setBar({ title: '10k.app', actions: `<button class="icon-btn" onclick="go('#/settings')" aria-label="${L().settings}">${I.gear}</button>` });
  setNav('armies');
  const v = $('#view');
  if (!armies.length) {
    v.innerHTML = `<div class="empty">${I.ankh}<h3>${L().noArmies}</h3><p>${L().noArmiesHint}</p></div>`;
  } else {
    v.innerHTML = `<div class="unit-list">${armies.map(a => {
      useFaction(a.faction);
      const p = armyPts(a), d = detById(a.det), bad = validate(a).some(x => x[0] === 'error');
      return `<a class="unit-card role-line" href="#/army/${a.id}">
        <div class="grow"><div class="unit-card__name">${esc(a.name)}</div>
        <div class="unit-card__sub"><span>${esc(factionName(a.faction))}</span><span>${d ? esc(d.name) : '—'}</span><span>${L().unitsCount(a.units.length)}</span>${bad ? `<span class="badge badge--danger">!</span>` : ''}</div></div>
        <div class="unit-card__pts">${p}<small>/ ${a.limit}</small></div></a>`;
    }).join('')}</div>`;
  }
  v.insertAdjacentHTML('beforeend', `<button class="fab" onclick="go('#/new')">${I.plus}${L().newArmy}</button>`);
}

function armyForm(a) {
  const limits = [500, 1000, 2000, 3000];
  return `
    <div class="field"><label>${L().faction}</label><div class="opts" id="fFaction">
      ${FACTIONS.map(f => `<button class="opt ${a.faction === f.id ? 'on' : ''}" data-v="${f.id}">${esc(lang === 'ru' ? f.ru : f.name)}</button>`).join('')}
    </div></div>
    <div class="field"><label>${L().name}</label><input class="input" id="fName" maxlength="60" value="${esc(a.name)}" placeholder="${lang === 'ru' ? 'Например: Лист на 500' : 'e.g. 500 pts list'}"></div>
    <div class="field"><label>${L().limit}</label><div class="opts" id="fLimit">
      ${limits.map(l => `<button class="opt ${a.limit === l ? 'on' : ''}" data-v="${l}">${l}</button>`).join('')}
      <input class="input" id="fLimitCustom" inputmode="numeric" style="width:110px;min-height:42px" placeholder="${L().other}" value="${limits.includes(a.limit) ? '' : a.limit}">
    </div></div>
    <div class="field"><label>${L().detachment}</label><div class="opts" id="fDet">
      ${detOpts(a)}
    </div></div>`;
}
const detOpts = a => DB[a.faction].detachments.map(d => `<button class="opt ${a.det === d.id ? 'on' : ''}" data-v="${d.id}">${esc(d.name)}</button>`).join('');
function bindArmyForm(a, locked) {
  const bindDet = () => $$('#fDet .opt').forEach(b => b.onclick = () => { a.det = b.dataset.v; $$('#fDet .opt').forEach(x => x.classList.toggle('on', x === b)); });
  $$('#fFaction .opt').forEach(b => b.onclick = () => {
    if (locked && b.dataset.v !== a.faction) return toast(L().factionLocked);
    a.faction = b.dataset.v; a.det = null; $$('#fFaction .opt').forEach(x => x.classList.toggle('on', x === b));
    $('#fDet').innerHTML = detOpts(a); bindDet();
  });
  $$('#fLimit .opt').forEach(b => b.onclick = () => { a.limit = +b.dataset.v; $('#fLimitCustom').value = ''; $$('#fLimit .opt').forEach(x => x.classList.toggle('on', x === b)); });
  $('#fLimitCustom').oninput = e => { const n = parseInt(e.target.value, 10); if (n > 0) { a.limit = n; $$('#fLimit .opt').forEach(x => x.classList.remove('on')); } };
  bindDet();
  $('#fName').oninput = e => { a.name = e.target.value; };
}

function viewNew() {
  setBar({ title: L().newArmy, back: '#/' }); setNav('armies');
  const draft = { id: uid(), faction: ui.faction, name: '', limit: 500, det: null, units: [] };
  $('#view').innerHTML = `<div class="card stack">${armyForm(draft)}</div>
    <div style="margin-top:16px"><button class="btn btn--primary btn--block" id="createBtn">${L().create}</button></div>`;
  bindArmyForm(draft);
  $('#createBtn').onclick = () => {
    draft.name = draft.name.trim() || (lang === 'ru' ? 'Новая армия' : 'New army');
    draft.created = draft.updated = Date.now();
    armies.unshift(draft); saveArmies(); location.replace('#/army/' + draft.id);
  };
}

function viewArmyEdit(a) {
  setBar({ title: L().edit, back: '#/army/' + a.id }); setNav('armies');
  const draft = JSON.parse(JSON.stringify(a));
  $('#view').innerHTML = `<div class="card stack">${armyForm(draft)}</div>
    <div style="margin-top:16px"><button class="btn btn--primary btn--block" id="saveBtn">${L().save}</button></div>
    <div class="section-title">${L().export}</div>
    <div class="stack">
      <button class="btn btn--block" id="copyText">${L().copyText}</button>
      <button class="btn btn--block" id="copyJSON">${L().copyJSON}</button>
      ${navigator.share ? `<button class="btn btn--block" id="shareBtn">${L().share}</button>` : ''}
      <button class="btn btn--block" id="dupBtn">${L().duplicate}</button>
      <button class="btn btn--block btn--danger" id="delBtn">${L().del}</button>
    </div>`;
  bindArmyForm(draft, a.units.length > 0);
  $('#saveBtn').onclick = () => { Object.assign(a, draft, { name: draft.name.trim() || a.name, updated: Date.now() }); saveArmies(); history.back(); };
  $('#copyText').onclick = () => copy(rosterText(a));
  $('#copyJSON').onclick = () => copy(JSON.stringify({ app: '10k.app', v: 1, armies: [a] }));
  if ($('#shareBtn')) $('#shareBtn').onclick = () => navigator.share({ title: a.name, text: rosterText(a) }).catch(() => {});
  $('#dupBtn').onclick = () => { const c = JSON.parse(JSON.stringify(a)); c.id = uid(); c.name += lang === 'ru' ? ' (копия)' : ' (copy)'; c.units.forEach(e => e.uid = uid()); armies.unshift(c); saveArmies(); location.replace('#/army/' + c.id); };
  $('#delBtn').onclick = () => confirmSheet(L().delConfirm, L().del, () => { armies = armies.filter(x => x.id !== a.id); saveArmies(); location.replace('#/'); });
}
function rosterText(a) {
  const d = detById(a.det);
  const lines = [`${a.name} — ${armyPts(a)}/${a.limit} ${L().pts}`, `${factionName(a.faction)} · ${d ? d.name : '—'}`, ''];
  groupByCat(a.units.map(e => ({ e, u: unitById(e.id) })).filter(x => x.u)).forEach(([cat, list]) => {
    lines.push(catName(cat).toUpperCase());
    list.forEach(({ e, u }) => {
      const c = u.costs[e.size || 0];
      lines.push(`• ${u.name}${u.costs.length > 1 ? ` (${c.label})` : ''} — ${entryPts(e)}${e.warlord ? ` · ${L().warlord}` : ''}${e.enh ? ` · ${e.enh}` : ''}`);
    });
    lines.push('');
  });
  return lines.join('\n').trim();
}
async function copy(s) {
  try { await navigator.clipboard.writeText(s); toast(L().copied); }
  catch { const ta = document.createElement('textarea'); ta.value = s; document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove(); toast(L().copied); }
}
function groupByCat(list) {
  const order = Object.keys(ROLE), map = new Map();
  list.forEach(x => { const c = x.u.cat; if (!map.has(c)) map.set(c, []); map.get(c).push(x); });
  return [...map.entries()].sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
}

function viewArmy(a) {
  const tab = ui.armyTab[a.id] || 'roster';
  setBar({ title: a.name, back: '#/', actions: `<button class="icon-btn" onclick="go('#/army/${a.id}/edit')" aria-label="${L().edit}">${I.dots}</button>` });
  setNav('armies');
  const p = armyPts(a), d = detById(a.det), issues = validate(a);
  const v = $('#view');
  v.innerHTML = `
    <div class="card army-head">
      <h2 class="army-head__name">${esc(a.name)}</h2>
      <button class="army-head__det" id="detBtn"><span><span class="muted small">${L().detachment}</span><br><b>${d ? esc(d.name) : L().pickDet}</b></span>${I.right}</button>
      <div class="pts-line"><span><b>${p}</b> <span class="muted">/ ${a.limit} ${L().pts}</span></span><span class="muted small">${L().unitsCount(a.units.length)}</span></div>
      <div class="pts-bar ${p > a.limit ? 'over' : ''}"><i style="width:${Math.min(100, a.limit ? (p / a.limit) * 100 : 0)}%"></i></div>
      ${issues.length ? `<div class="issues">${issues.map(([lv, m]) => `<div class="issue issue--${lv}">${I.warn}<span>${esc(m)}</span></div>`).join('')}</div>` : ''}
    </div>
    <div class="seg" id="seg">
      <button data-t="roster" class="${tab === 'roster' ? 'on' : ''}">${L().roster}</button>
      <button data-t="strats" class="${tab === 'strats' ? 'on' : ''}">${L().strats}</button>
      <button data-t="det" class="${tab === 'det' ? 'on' : ''}">${L().det}</button>
    </div>
    <div id="tabBody"></div>`;
  $('#detBtn').onclick = () => (d ? (ui.armyTab[a.id] = 'det', render()) : go(`#/army/${a.id}/edit`));
  $$('#seg button').forEach(b => b.onclick = () => { ui.armyTab[a.id] = b.dataset.t; render(); window.scrollTo({ top: 0 }); });
  const body = $('#tabBody');
  if (tab === 'roster') {
    if (!a.units.length) body.innerHTML = `<div class="empty">${I.ankh}<h3>${L().empty}</h3><p>${L().emptyHint}</p></div>`;
    else {
      body.innerHTML = groupByCat(a.units.map(e => ({ e, u: unitById(e.id) })).filter(x => x.u)).map(([cat, list]) => `
        <div class="section-title">${esc(catName(cat))}</div>
        <div class="unit-list">${list.map(({ e, u }) => {
          const c = u.costs[e.size || 0];
          return `<a class="unit-card ${ROLE[u.cat] || ''}" href="#/army/${a.id}/u/${e.uid}">
            <div class="grow"><div class="unit-card__name">${esc(u.name)}</div>
              <div class="unit-card__sub">
                ${u.costs.length > 1 ? `<span>${esc(sizeLabel(c.label))}</span>` : ''}
                ${e.warlord ? `<span class="badge badge--warn">${I.crown}${L().warlord}</span>` : ''}
                ${e.enh ? `<span class="badge badge--accent">${esc(e.enh)}</span>` : ''}
              </div></div>
            <div class="unit-card__pts">${entryPts(e)}</div></a>`;
        }).join('')}</div>`).join('');
    }
    v.insertAdjacentHTML('beforeend', `<button class="fab" onclick="go('#/army/${a.id}/add')">${I.plus}${L().add}</button>`);
  } else if (tab === 'strats') {
    renderStrats(body, [...(d ? d.stratagems : []), ...DATA.core], true);
  } else {
    if (d) renderDetachment(body, d); else body.innerHTML = `<div class="empty"><button class="btn btn--primary" onclick="go('#/army/${a.id}/edit')">${L().pickDet}</button></div>`;
  }
}
const dmgLabel = u => { const r = (u.damaged.name.match(/\d+-\d+/) || [''])[0]; return lang === 'ru' ? `Повреждения: ${r} ран` : `Damaged: ${r} wounds remaining`; };
const sizeLabel = l => lang === 'ru' ? l.replace(/(\d+) models?/, (_, n) => `${n} ${plural(+n, 'модель', 'модели', 'моделей')}`) : l;

function viewPicker(a) {
  setBar({ title: L().add, back: '#/army/' + a.id }); setNav('armies');
  const v = $('#view');
  v.innerHTML = `<div class="search">${I.search}<input id="q" type="search" placeholder="${L().search}" value="${esc(ui.pickSearch)}" autocomplete="off"></div><div id="list"></div>`;
  const draw = () => {
    const q = ui.pickSearch.trim().toLowerCase();
    const counts = {}; a.units.forEach(e => counts[e.id] = (counts[e.id] || 0) + 1);
    const list = DATA.units.filter(u => !q || u.name.toLowerCase().includes(q) || u.keywords.some(k => k.toLowerCase().includes(q))).map(u => ({ u }));
    $('#list').innerHTML = groupByCat(list).map(([cat, l]) => `
      <div class="section-title">${esc(catName(cat))}</div>
      <div class="unit-list">${l.map(({ u }) => `
        <div class="unit-card picker-item ${ROLE[u.cat] || ''}">
          <a class="grow" href="#/unit/${u.id}"><div class="unit-card__name">${esc(u.name)}</div>
          <div class="unit-card__sub"><span>${u.costs.map(c => c.pts).join(' / ')} ${L().pts}</span>${counts[u.id] ? `<span class="count">${L().inArmy}: ${counts[u.id]}</span>` : ''}</div></a>
          <button class="add" data-add="${u.id}" aria-label="${L().add}">${I.plus}</button>
        </div>`).join('')}</div>`).join('') || `<div class="empty">—</div>`;
    $$('[data-add]').forEach(b => b.onclick = () => {
      const u = unitById(b.dataset.add);
      a.units.push({ uid: uid(), id: u.id, size: 0, enh: null, warlord: false });
      a.updated = Date.now(); saveArmies(); toast(`${L().added}: ${u.name}`); draw();
    });
  };
  $('#q').oninput = e => { ui.pickSearch = e.target.value; draw(); };
  draw();
}

function viewArmyUnit(a, e) {
  const u = unitById(e.id); if (!u) return go('#/army/' + a.id);
  setBar({ title: u.name, back: '#/army/' + a.id, actions: `<button class="icon-btn" id="toSettings" aria-label="${L().settingsUnit}">${I.gear}</button>` }); setNav('armies');
  const d = detById(a.det);
  const enhs = d ? d.enhancements : [];
  const canEnh = u.character && !u.epic;
  const takenElsewhere = new Set(a.units.filter(x => x !== e && x.enh).map(x => x.enh));
  const v = $('#view');
  v.innerHTML = `
    <div id="ds"></div>
    <div class="settings" id="unitSettings" style="margin-top:22px">
      <div class="settings__title">${L().settingsUnit} · ${entryPts(e)} ${L().pts}</div>
      ${u.costs.length > 1 ? `<div class="field"><label>${L().size}</label><div class="opts">${u.costs.map((c, i) => `<button class="opt ${(e.size || 0) === i ? 'on' : ''}" data-size="${i}">${esc(sizeLabel(c.label))}<small>${c.pts} ${L().pts}</small></button>`).join('')}</div></div>` : ''}
      ${canEnh && enhs.length ? `<div class="field"><label>${L().enh}</label><div class="opts">
        <button class="opt ${!e.enh ? 'on' : ''}" data-enh="">${L().none}</button>
        ${enhs.map(x => `<button class="opt ${e.enh === x.name ? 'on' : ''}" data-enh="${esc(x.name)}" ${takenElsewhere.has(x.name) ? 'disabled' : ''}>${esc(x.name)}<small>+${x.pts} ${L().pts}</small></button>`).join('')}
      </div></div>` : ''}
      ${u.character ? `<div class="toggle"><span>${L().warlord}</span><button class="switch ${e.warlord ? 'on' : ''}" id="wl" aria-pressed="${!!e.warlord}"></button></div>` : ''}
      <div class="settings__actions"><button class="btn" id="dup">${L().duplicate}</button><button class="btn btn--danger" id="rm">${L().remove}</button></div>
    </div>`;
  $('#toSettings').onclick = () => $('#unitSettings').scrollIntoView({ behavior: 'smooth', block: 'start' });
  const save = () => { a.updated = Date.now(); saveArmies(); render(true); };
  $$('[data-size]').forEach(b => b.onclick = () => { e.size = +b.dataset.size; save(); });
  $$('[data-enh]').forEach(b => b.onclick = () => { e.enh = b.dataset.enh || null; save(); });
  if ($('#wl')) $('#wl').onclick = () => { const on = !e.warlord; a.units.forEach(x => x.warlord = false); e.warlord = on; save(); };
  $('#dup').onclick = () => { const c = { ...e, uid: uid(), warlord: false, enh: null }; a.units.splice(a.units.indexOf(e) + 1, 0, c); a.updated = Date.now(); saveArmies(); toast(L().added); location.replace(`#/army/${a.id}/u/${c.uid}`); };
  $('#rm').onclick = () => { a.units = a.units.filter(x => x !== e); a.updated = Date.now(); saveArmies(); history.back(); };
  renderDatasheet($('#ds'), u, { entry: e, army: a });
}

function factionSeg(onChange) {
  if (FACTIONS.length < 2) return '';
  setTimeout(() => $$('#facSeg button').forEach(b => b.onclick = () => { ui.faction = b.dataset.f; store.set('faction', ui.faction); onChange(); }));
  return `<div class="seg" id="facSeg" style="margin-top:0">${FACTIONS.map(f => `<button data-f="${f.id}" class="${ui.faction === f.id ? 'on' : ''}">${esc(lang === 'ru' ? f.ru : f.name)}</button>`).join('')}</div>`;
}
function viewUnits() {
  setBar({ title: L().units }); setNav('units');
  const v = $('#view');
  v.innerHTML = `${factionSeg(() => render(true))}<div class="search">${I.search}<input id="q" type="search" placeholder="${L().search}" value="${esc(ui.unitSearch)}" autocomplete="off"></div><div id="list"></div>`;
  const draw = () => {
    const q = ui.unitSearch.trim().toLowerCase();
    const list = DATA.units.filter(u => !q || u.name.toLowerCase().includes(q) || u.keywords.some(k => k.toLowerCase().includes(q))
      || u.ranged.concat(u.melee).some(w => w.name.toLowerCase().includes(q))).map(u => ({ u }));
    $('#list').innerHTML = groupByCat(list).map(([cat, l]) => `
      <div class="section-title">${esc(catName(cat))}</div>
      <div class="unit-list">${l.map(({ u }) => `<a class="unit-card ${ROLE[u.cat] || ''}" href="#/unit/${u.id}">
        <div class="grow"><div class="unit-card__name">${esc(u.name)}</div>
        <div class="unit-card__sub"><span>${statLine(u)}</span></div></div>
        <div class="unit-card__pts">${u.costs[0] ? u.costs[0].pts : ''}</div></a>`).join('')}</div>`).join('') || `<div class="empty">—</div>`;
  };
  $('#q').oninput = e => { ui.unitSearch = e.target.value; draw(); };
  draw();
}
const statLine = u => { const m = u.models[0]; if (!m) return ''; const s = m.stats; return `M ${s[0]} · T ${s[1]} · Sv ${s[2]}${u.invuln ? `/${u.invuln}` : ''} · W ${s[3]}`; };

function viewUnit(u) {
  setBar({ title: u.name, back: '#/units' }); setNav('units');
  renderDatasheet($('#view'), u, {});
}

/* ---------------- датащит ---------------- */
function renderDatasheet(el, u, ctx) {
  const e = ctx.entry;
  const pts = e ? entryPts(e) : u.costs.map(c => c.pts).join(' / ');
  const statHead = ['M', 'T', 'SV', 'W', 'LD', 'OC'];
  const wProf = (w, melee) => {
    const h = ['RNG', 'A', melee ? 'WS' : 'BS', 'S', 'AP', 'D'];
    return `<div class="weapon"><div class="weapon__name">${esc(w.name)}</div>
      ${w.kw.length ? `<div class="weapon__kw">${w.kw.map(k => kwChip(k)).join('')}</div>` : ''}
      <div class="weapon__prof">${w.p.map((x, i) => `<div><span>${h[i]}</span>${esc(x)}</div>`).join('')}</div></div>`;
  };
  const leads = (u.leads || []).map(id => { const x = unitById(id); return x ? `<a href="#/unit/${x.id}">${esc(x.name)}</a>` : `<span class="links-plain">${esc(id)}</span>`; });
  const sec = s => s.items.filter(i => !(s.title === 'Rules' && i.name === 'Leader')).map(i => `
      <div class="ability">${i.name ? `<div class="ability__name">${esc(i.name)}</div>` : ''}<div class="ability__body">${t(i.t)}</div></div>`).join('');
  const sections = u.sections.filter(s => s.items.some(i => !(s.title === 'Rules' && i.name === 'Leader')));
  const order = ['Unit Abilities', 'Wargear', 'Rules', 'Unit Composition', 'Wargear Options'];
  sections.sort((a, b) => order.indexOf(a.title) - order.indexOf(b.title));
  const enhObj = e && e.enh ? findEnh(e.enh) : null;

  el.insertAdjacentHTML('beforeend', `
    <div class="ds-head ${ROLE[u.cat] || ''}">
      <h1>${esc(u.name)}</h1>
      <div class="ds-head__pts">${pts}<div>${L().pts}</div></div>
    </div>
    <div class="ds-cat">${esc(catName(u.cat))}${!e && u.costs.length > 1 ? ' · ' + u.costs.map(c => `${sizeLabel(c.label)}: ${c.pts}`).join(', ') : ''}</div>
    <div class="stats">${u.models.map(m => `
      ${u.models.length > 1 ? `<div><div class="stat-model__name">${esc(m.name)}</div>` : '<div>'}
      <div class="stat-row">${m.stats.map((s, i) => `<div class="stat"><span>${statHead[i]}</span><b>${esc(s)}</b></div>`).join('')}</div></div>`).join('')}
    </div>
    ${u.invuln || u.damaged ? `<div class="invuln">
      ${u.invuln ? `<button class="badge badge--accent" data-kw="invulnerable save" data-label="${L().invuln} ${u.invuln}">${L().invuln} ${esc(u.invuln)}</button>` : ''}
      ${u.damaged ? `<button class="badge badge--warn" id="dmgBtn">${esc(dmgLabel(u))}</button>` : ''}
    </div>` : ''}
    ${enhObj ? `<div class="block"><div class="block__title">${L().enh}</div><div class="ability" style="border-color:var(--accent)"><div class="ability__name">${esc(e.enh)} · +${enhObj.pts}</div><div class="ability__body">${t(enhObj.t)}</div></div></div>` : ''}
    ${u.ranged.length ? `<div class="block"><div class="block__title">${L().ranged}</div><div class="weapons">${u.ranged.map(w => wProf(w, false)).join('')}</div></div>` : ''}
    ${u.melee.length ? `<div class="block"><div class="block__title">${L().melee}</div><div class="weapons">${u.melee.map(w => wProf(w, true)).join('')}</div></div>` : ''}
    ${u.core.length || u.faction.length ? `<div class="block">
      ${u.core.length ? `<div class="block__title">${L().coreAb}</div><div class="chip-row">${u.core.map(k => kwChip(k)).join('')}</div>` : ''}
      ${u.faction.length ? `<div class="block__title" style="margin-top:14px">${L().factionAb}</div><div class="chip-row">${u.faction.map(k => kwChip(k)).join('')}</div>` : ''}
    </div>` : ''}
    ${leads.length ? `<div class="block"><div class="block__title">${L().leads}</div><div class="links">${leads.join('')}</div></div>` : ''}
    ${sections.map(s => `<div class="block"><div class="block__title">${esc(secName(s.title))}</div>${sec(s)}</div>`).join('')}
    ${u.damaged ? `<div class="block"><div class="block__title">${L().damaged}</div><div class="ability"><div class="ability__name">${esc(dmgLabel(u))}</div><div class="ability__body">${t(u.damaged.t)}</div></div></div>` : ''}
    <div class="block"><div class="block__title">${L().keywords}</div><div class="chip-row">${u.keywords.map(k => `<span class="kw-chip kw-chip--plain">${esc(k.toUpperCase())}</span>`).join('')}</div></div>
    <p class="note">${L().tapKw}</p>`);
  linkKeywords(el);
  const dmg = $('#dmgBtn', el); if (dmg) dmg.onclick = () => openSheet(dmgLabel(u), t(u.damaged.t));
}

/* ---------------- стратагемы ---------------- */
function renderStrats(el, list, withSource) {
  const P = L().phases;
  const chips = [['all', L().all], ...PH_KEYS.map(k => [k, P[k]])];
  el.innerHTML = `
    <div class="chips" id="phChips">${chips.map(([k, l]) => `<button class="chip ${ui.stratPhase === k ? 'on' : ''}" data-ph="${k}">${l}</button>`).join('')}</div>
    <div class="legend"><span><i style="background:var(--your)"></i>${L().your}</span><span><i style="background:var(--opp)"></i>${L().opp}</span><span><i style="background:var(--either)"></i>${L().either}</span></div>
    <div id="sl" class="stack"></div>`;
  const draw = () => {
    const f = list.filter(s => ui.stratPhase === 'all' || stratPhases(s).includes(ui.stratPhase));
    let lastSrc = null, html = '';
    f.forEach((s, i) => {
      if (withSource && s.src !== lastSrc) {
        html += `<div class="section-title">${s.src === 'core' ? esc(L().core) : esc(detById(s.src)?.name || '')}</div>`;
        lastSrc = s.src;
      }
      html += `<div class="strat ${s.turn}">
        <button class="strat__head" data-i="${i}">
          <div class="strat__cp">${esc(s.cp)}<small>CP</small></div>
          <div class="grow"><div class="strat__name">${esc(s.name)}</div><div class="strat__misc">${esc(miscName(s.misc))}</div></div>
          <span class="strat__chev">${I.chev}</span>
        </button>
        <div class="strat__body">${s.parts.map(p => `<div class="strat__part"><span>${esc(partName(p.label))}</span><div>${t(p.t)}</div></div>`).join('')}</div>
      </div>`;
    });
    $('#sl', el).innerHTML = html || `<div class="empty">—</div>`;
    linkKeywords($('#sl', el));
    $$('.strat__head', el).forEach(b => b.onclick = () => b.parentElement.classList.toggle('open'));
  };
  $$('[data-ph]', el).forEach(b => b.onclick = () => { ui.stratPhase = b.dataset.ph; $$('[data-ph]', el).forEach(x => x.classList.toggle('on', x === b)); draw(); });
  draw();
}

/* ---------------- детач / правила ---------------- */
function renderDetachment(el, d) {
  el.innerHTML = `
    <div class="section-title">${L().detRules}</div>
    ${d.rules.map(r => `<div class="ability"><div class="ability__name">${esc(r.name)}</div><div class="ability__body">${t(r.t)}</div></div>`).join('')}
    ${d.enhancements.length ? `<div class="section-title">${L().enhancements}</div>
      ${d.enhancements.map(x => `<div class="ability"><div class="row"><div class="ability__name grow">${esc(x.name)}</div><span class="badge">${x.pts} ${L().pts}</span></div><div class="ability__body">${t(x.t)}</div></div>`).join('')}` : ''}
    <div id="dStr"></div>`;
  linkKeywords(el);
  const s = $('#dStr', el);
  s.innerHTML = `<div class="section-title">${L().strats}</div><div></div>`;
  renderStrats(s.lastElementChild, d.stratagems, false);
}

function viewRules() {
  setBar({ title: L().rules }); setNav('rules');
  const v = $('#view');
  const gl = Object.entries(DATA.glossary).sort((a, b) => a[1].name.localeCompare(b[1].name));
  v.innerHTML = `${factionSeg(() => render(true))}
    <div class="section-title">${L().armyRule}</div>
    ${DATA.army.map(r => `<div class="ability"><div class="ability__name">${esc(r.name)}</div><div class="ability__body">${t(r.t)}</div></div>`).join('')}
    <div class="section-title">${L().detachments}</div>
    <div class="unit-list">${DATA.detachments.map(d => `<a class="unit-card role-line" href="#/det/${d.id}"><div class="grow"><div class="unit-card__name">${esc(d.name)}</div>
      <div class="unit-card__sub"><span>${esc(d.rules[0]?.name || '')}</span></div></div>${I.right}</a>`).join('')}
      <a class="unit-card role-air" href="#/core"><div class="grow"><div class="unit-card__name">${esc(L().core)}</div><div class="unit-card__sub"><span>${DATA.core.length}</span></div></div>${I.right}</a>
    </div>
    <div class="section-title">${L().glossary}</div>
    <div class="chip-row">${gl.map(([k, g]) => `<button class="kw-chip" data-kw="${k}">${esc(g.name)}</button>`).join('')}</div>`;
  linkKeywords(v);
}
function viewDet(d) { setBar({ title: d.name, back: '#/rules' }); setNav('rules'); renderDetachment($('#view'), d); }
function viewCore() { setBar({ title: L().core, back: '#/rules' }); setNav('rules'); renderStrats($('#view'), DATA.core, false); }

function viewSettings() {
  setBar({ title: L().settings, back: '#/' }); setNav('armies');
  const v = $('#view');
  v.innerHTML = `
    <div class="section-title">${L().data}</div>
    <p class="muted small" style="margin:0 4px 12px">${L().backupHint}</p>
    <div class="stack">
      <button class="btn btn--block" id="expAll">${L().exportAll}: ${L().copyJSON.toLowerCase()}</button>
      <button class="btn btn--block" id="dlAll">${L().download}</button>
    </div>
    <div class="section-title">${L().import}</div>
    <textarea class="input" id="impText" placeholder='{"app":"10k.app", ...}'></textarea>
    <p class="muted small" style="margin:8px 4px 12px">${L().importHint}</p>
    <div class="row"><button class="btn btn--primary grow" id="impBtn">${L().importDo}</button>
      <label class="btn">${L().file}<input type="file" id="impFile" accept=".json,application/json,text/plain" hidden></label></div>
    <div class="section-title">${L().about}</div>
    <p class="note" style="margin-top:0">${L().dataSource}</p>
    <p class="note">10k.app · v${APP_VERSION}</p>`;
  const payload = () => JSON.stringify({ app: '10k.app', v: 1, armies });
  $('#expAll').onclick = () => copy(payload());
  $('#dlAll').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([payload()], { type: 'application/json' })); a.download = `10k-armies-${new Date().toISOString().slice(0, 10)}.json`; a.click(); };
  const doImport = txt => {
    try {
      const j = JSON.parse(txt); const list = Array.isArray(j) ? j : j.armies || (j.units ? [j] : []);
      let n = 0;
      list.forEach(a => { if (!a || !Array.isArray(a.units)) return; a.id = uid(); a.faction = DB[a.faction] ? a.faction : 'necrons'; useFaction(a.faction); a.limit = +a.limit || 2000; a.units = a.units.filter(e => unitById(e.id)).map(e => ({ uid: uid(), id: e.id, size: +e.size || 0, enh: e.enh || null, warlord: !!e.warlord })); armies.unshift(a); n++; });
      if (!n) throw 0; saveArmies(); toast(L().imported(n)); $('#impText').value = '';
    } catch { toast(L().importBad); }
  };
  $('#impBtn').onclick = () => doImport($('#impText').value);
  $('#impFile').onchange = e => { const f = e.target.files[0]; if (f) f.text().then(doImport); };
}

/* ---------------- роутер ---------------- */
function render(keepScroll) {
  if (!DATA) return;
  const y = window.scrollY;
  closeSheet(true);
  const h = location.hash.replace(/^#\/?/, '');
  const p = h.split('/').filter(Boolean);
  $('#view').innerHTML = '';
  try {
    if (!p.length || p[0] === 'armies') viewArmies();
    else if (p[0] === 'new') viewNew();
    else if (p[0] === 'settings') viewSettings();
    else if (p[0] === 'army') {
      const a = armyById(p[1]); if (!a) return location.replace('#/');
      useFaction(a.faction);
      if (p[2] === 'edit') viewArmyEdit(a);
      else if (p[2] === 'add') viewPicker(a);
      else if (p[2] === 'u') { const e = a.units.find(x => x.uid === p[3]); if (!e) return location.replace('#/army/' + a.id); viewArmyUnit(a, e); }
      else viewArmy(a);
    }
    else if (p[0] === 'units') { useFaction(ui.faction); viewUnits(); }
    else if (p[0] === 'unit') { DATA = findFaction('units', p[1]) || DATA; const u = unitById(p[1]); if (!u) return location.replace('#/units'); viewUnit(u); }
    else if (p[0] === 'rules') { useFaction(ui.faction); viewRules(); }
    else if (p[0] === 'det') { DATA = findFaction('detachments', p[1]) || DATA; const d = detById(p[1]); if (!d) return location.replace('#/rules'); viewDet(d); }
    else if (p[0] === 'core') viewCore();
    else location.replace('#/');
  } catch (err) { console.error(err); $('#view').innerHTML = `<div class="empty">Ошибка: ${esc(err.message)}</div>`; }
  window.scrollTo(0, keepScroll ? y : 0);
}
window.addEventListener('hashchange', () => { if (!history.state || !history.state.inApp) history.replaceState({ inApp: true }, ''); render(); });
window.addEventListener('popstate', () => { if ($('.sheet') && !(history.state && history.state.sheet)) closeSheet(true); });

const APP_VERSION = '1.1.0';
async function boot() {
  document.documentElement.lang = lang;
  history.replaceState({ inApp: false }, '');
  try {
    FACTIONS = (await (await fetch('data/index.json')).json()).factions;
    await Promise.all(FACTIONS.map(async f => { DB[f.id] = await (await fetch(f.file)).json(); }));
    FACTIONS.forEach(f => { Object.assign(TEXTS, DB[f.id].texts); Object.assign(GLOSS, DB[f.id].glossary); });
    if (!DB[ui.faction]) ui.faction = FACTIONS[0].id;
    useFaction(ui.faction);
    let migrated = false;
    armies.forEach(a => { if (!a.faction) { a.faction = 'necrons'; migrated = true; } });
    if (migrated) saveArmies();
  } catch (e) {
    $('#view').innerHTML = `<div class="empty">Не удалось загрузить данные. Проверь подключение и обнови страницу.</div>`; return;
  }
  render();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
}
boot();
