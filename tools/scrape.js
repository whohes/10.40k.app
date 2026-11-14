/*
  Выгрузка данных фракции с 10.40k.app.
  Сайт закрыт защитой от ботов, поэтому скрипт запускается в обычном браузере:
  1. Открой https://10.40k.app/factions/necrons
  2. Открой DevTools → Console, вставь этот файл целиком и нажми Enter.
  3. Через ~1–2 минуты скачается raw.json — положи его в tools/raw.json
     и запусти `python3 tools/build.py`.
*/
(async () => {
  const FACTION = location.pathname.split('/')[2] || 'necrons';
  const C = (root, name) => root.querySelector(`[class*="${name}"]`);
  const isAbil = a => !String(a.className).includes('ability__name');
  const cleanHTML = el => {
    const ok = new Set(['P', 'STRONG', 'B', 'EM', 'I', 'UL', 'OL', 'LI', 'BR']);
    const walk = n => {
      if (n.nodeType === 3) return n.textContent.replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
      if (n.nodeType !== 1) return '';
      const inner = [...n.childNodes].map(walk).join('');
      if (!ok.has(n.tagName)) return inner;
      const tg = n.tagName === 'B' ? 'strong' : n.tagName === 'I' ? 'em' : n.tagName.toLowerCase();
      return tg === 'br' ? '<br>' : `<${tg}>${inner}</${tg}>`;
    };
    return [...el.childNodes].map(walk).join('').replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ').trim();
  };
  const loadDoc = url => new Promise(res => {
    const f = document.createElement('iframe');
    f.style.cssText = 'position:fixed;left:-5000px;width:1200px;height:900px'; f.src = url; document.body.appendChild(f);
    const t0 = Date.now();
    const iv = setInterval(() => {
      try {
        const m = f.contentDocument && f.contentDocument.querySelector('main');
        if ((m && m.innerText.length > 200 && !m.querySelector('[class*=Spinner]')) || Date.now() - t0 > 20000) { clearInterval(iv); setTimeout(() => res(f), 600); }
      } catch (e) { }
    }, 300);
  });

  const parseUnit = (d, slug) => {
    const u = { slug, name: d.querySelector('h1').textContent.trim(), models: [], ranged: [], melee: [], keywordGroups: {}, costs: [], sections: [], loose: [] };
    const lay = C(d, 'UnitLayout_layout'); const used = new Set();
    lay.querySelectorAll('[class*="Table_header__title"]').forEach(t => {
      const title = t.textContent.trim(), header = t.parentElement, cont = header.parentElement; used.add(cont);
      if (header.className.includes('Models_models__header')) {
        cont.querySelectorAll('[class*="Models_model__"][class*="name"]').forEach(nm => {
          const bs = C(nm, 'baseSize'), base = bs ? bs.textContent.trim() : '';
          u.models.push({ name: nm.textContent.replace(base, '').trim(), base, stats: [...C(nm.parentElement, 'Models_model__characteristics').children].map(x => x.textContent.trim()) });
        });
      } else if (header.className.includes('Weapons_weapons__header')) {
        const arr = /melee/i.test(title) ? u.melee : u.ranged;
        cont.querySelectorAll('[class*="Weapons_weapon__name"]').forEach(nm => {
          const w = nm.parentElement;
          arr.push({
            name: nm.textContent.trim(),
            keywords: [...w.querySelectorAll('[class*="Weapons_weapon__keywords"] [class*="Keyword_keyword"]')].filter(x => !String(x.className).includes('__text')).map(x => x.textContent.trim()),
            profile: [...C(w, 'Weapons_weapon__profile').children].map(x => x.textContent.trim()),
          });
        });
      } else if (cont.className.includes('Keywords_keywords')) {
        u.keywordGroups[title] = [...cont.querySelectorAll('[class*="Keyword_keyword__text"]')].map(x => x.textContent.trim());
      } else if (title === 'Costs') {
        cont.querySelectorAll('[class*="Costs_cost"]').forEach(c => u.costs.push({ label: c.children[0].textContent.trim(), pts: parseInt(c.children[1].textContent) }));
      } else {
        u.sections.push({ title, items: [...cont.querySelectorAll('[class*="Abilities_ability"]')].filter(isAbil).map(a => { const n = C(a, 'Abilities_ability__name'), tx = a.querySelector('[class*="Text_text"]'); return { name: n ? n.textContent.trim() : '', html: tx ? cleanHTML(tx) : '' }; }) });
      }
    });
    lay.querySelectorAll('[class*="Abilities_ability"]').forEach(a => {
      if (!isAbil(a)) return; let p = a; while (p && p !== lay) { if (used.has(p)) return; p = p.parentElement; }
      const n = C(a, 'Abilities_ability__name'), tx = a.querySelector('[class*="Text_text"]');
      u.loose.push({ name: n ? n.textContent.trim() : '', html: tx ? cleanHTML(tx) : '' });
    });
    return u;
  };
  const parseDet = (d, slug) => {
    const det = { slug, name: d.querySelector('h1').textContent.trim(), rules: [], stratagems: [], enhancements: [] };
    const rl = C(d, 'DetachmentLayout_layout__rules');
    if (rl) rl.querySelectorAll('[class*="Card_card__title"]').forEach(t => { const card = t.parentElement.parentElement, c = C(card, 'Card_card__container'); det.rules.push({ name: t.textContent.trim(), html: c ? cleanHTML(c) : '' }); });
    d.querySelectorAll('[class*="Stratagem_stratagem__name"]').forEach(n => {
      const s = n.parentElement.parentElement;
      const st = { name: n.textContent.trim(), cp: C(s, 'Stratagem_stratagem__cost').textContent.trim(), misc: C(s, 'Stratagem_stratagem__misc').textContent.trim(), turn: /yourTurn/.test(s.className) ? 'your' : /opponentsTurn/.test(s.className) ? 'opponent' : 'either', parts: [] };
      s.querySelectorAll('[class*="Stratagem_stratagem__main"]').forEach(m => { const b = m.cloneNode(true), lab = b.querySelector('span'); const label = lab.textContent.trim(); lab.remove(); st.parts.push({ label, html: cleanHTML(b) }); });
      det.stratagems.push(st);
    });
    d.querySelectorAll('[class*="Enhancement_enhancement__name"]').forEach(n => { const e = n.closest('article'); det.enhancements.push({ name: n.textContent.trim(), pts: parseInt(C(e, 'Points_points').textContent), html: cleanHTML(C(e, 'Enhancement_enhancement__content')) }); });
    return det;
  };

  const DATA = { units: [], detachments: [], keywords: {}, army: [] };
  // список юнитов с категориями — со страницы фракции
  const units = []; let cat = ''; const seen = new Set();
  const w = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_ELEMENT);
  while (w.nextNode()) {
    const e = w.currentNode, cls = String(e.className || '');
    if (/title/i.test(cls) && !e.children.length && e.textContent.trim().length > 2 && !e.closest('a')) cat = e.textContent.trim();
    const h = e.tagName === 'A' && e.getAttribute('href') || '';
    if (h.includes('/unit/')) { const slug = h.split('/unit/')[1]; if (!seen.has(slug)) { seen.add(slug); units.push({ slug, cat }); } }
  }
  const dets = [...new Set([...document.querySelectorAll('a')].map(a => a.getAttribute('href') || '').filter(h => h.includes('/rules/detachment/')).map(h => h.split('/').pop()))];

  { const f = await loadDoc(`/factions/${FACTION}/rules`); const flex = C(C(f.contentDocument, 'Segment_segment'), 'Flex_flex'); let cur = null;
    for (const ch of flex.children) { const t = C(ch, 'SectionTitle_section__title'); if (t) { cur = { name: t.textContent.trim(), html: '' }; DATA.army.push(cur); } else if (cur) cur.html += cleanHTML(C(ch, 'Card_card__container') || ch); }
    f.remove(); }
  for (const s of dets) { console.log('detachment', s); const f = await loadDoc(`/factions/${FACTION}/rules/detachment/${s}`); DATA.detachments.push(parseDet(f.contentDocument, s)); f.remove(); }
  for (const u of units) { console.log('unit', u.slug); const f = await loadDoc(`/factions/${FACTION}/unit/${u.slug}`); const r = parseUnit(f.contentDocument, u.slug); r.cat = u.cat; DATA.units.push(r); f.remove(); }

  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(DATA)], { type: 'application/json' }));
  a.download = 'raw.json'; a.click();
  console.log('Готово:', DATA.units.length, 'юнитов,', DATA.detachments.length, 'детачей');
})();
