"""Собирает data/<фракция>.json и data/index.json из выгрузок 40k.app.

  tools/raw/<slug>.json   сырая выгрузка фракции (tools/scrape.js)
  tools/kw_site.json      расшифровки ключевых слов с сайта
  tools/core_extra.json   стратагемы Core и недостающие ключевые слова
  tools/ru/*.txt          переводы, построчно: id|русский текст

Каждый текст правил хранится один раз в словаре texts по id (короткий хеш английского текста):
  texts[id] = {"en": "...", "ru": "..."}
Тексты без перевода показываются на английском; их список пишется в tools/untranslated.json.
"""
import hashlib, json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT.parent / "data"
FACTIONS = {
    "necrons": {"name": "Necrons", "ru": "Некроны"},
    "thousand-sons": {"name": "Thousand Sons", "ru": "Тысяча Сынов"},
}
CAT_ORDER = ["Epic heroes", "Epic Heroes", "Leaders & Characters", "Characters", "Battleline", "Mounted",
             "Infantry, Swarms, Beasts", "Infantry", "Beasts", "Aircraft", "Titanic", "Dedicated Transports",
             "Vehicles, Monsters", "Vehicles", "Monsters", "Fortifications", "Allied Units", "Other"]

extra = json.loads((ROOT / "core_extra.json").read_text())
kw_site = json.loads((ROOT / "kw_site.json").read_text())
ru = {}
for f in sorted((ROOT / "ru").glob("*.txt")):
    for line in f.read_text().splitlines():
        if "|" in line:
            k, v = line.split("|", 1)
            ru[k.strip()] = v.strip()


def build(slug, meta):
    raw = json.loads((ROOT / "raw" / f"{slug}.json").read_text())
    texts = {}

    def T(html):
        html = (html or "").strip()
        # заголовки внутри карточек приходят голым текстом между абзацами — оформляем их
        html = re.sub(r"(</p>|</ul>)\s*([^<\s][^<]*?)\s*(?=<p>|<ul>)", lambda m: f"{m.group(1)}<p><strong>{m.group(2)}</strong></p>", html)
        if not html:
            return None
        tid = hashlib.sha1(html.encode()).hexdigest()[:8]
        texts[tid] = {"en": html}
        return tid

    glossary = {}
    for k, v in kw_site.items():
        glossary[k] = {"name": v["name"], "t": T(v["html"])}
    for k, v in extra["keywords"].items():
        glossary.setdefault(k, {"name": v["name"], "t": T(v["html"])})
    army = [{"name": a["name"], "t": T(a["html"])} for a in raw["army"]]
    for a in army:  # правило армии тоже открывается по тапу (Reanimation Protocols и т.п.)
        glossary[a["name"].lower()] = {"name": a["name"], "t": a["t"]}

    names_upper = {u["name"].upper(): u["slug"] for u in raw["units"]}
    units = []
    for u in raw["units"]:
        kw = u["keywordGroups"].get("Keywords", [])
        out = {
            "id": u["slug"], "name": u["name"], "cat": u["cat"], "models": u["models"],
            "ranged": [{"name": w["name"], "kw": w["keywords"], "p": w["profile"]} for w in u["ranged"]],
            "melee": [{"name": w["name"], "kw": w["keywords"], "p": w["profile"]} for w in u["melee"]],
            "keywords": kw,
            "core": u["keywordGroups"].get("Core Abilities", []),
            "faction": u["keywordGroups"].get("Faction Abilities", []),
            "costs": u["costs"], "sections": [],
        }
        for l in u["loose"]:
            m = re.match(r"(\d\+) invulnerable save", l["name"], re.I)
            if m:
                out["invuln"] = m.group(1)
            elif l["name"].upper().startswith("DAMAGED"):
                out["damaged"] = {"name": l["name"], "t": T(l["html"])}
            elif l["name"] and not any(it["name"] == l["name"] for sec in u["sections"] for it in sec["items"]):
                out["sections"].append({"title": "Unit Abilities", "items": [{"name": l["name"], "t": T(l["html"])}]})
        for s in u["sections"]:
            items, seen = [], set()
            for it in s["items"]:
                if (it["name"], it["html"]) in seen:  # на сайте вложенные блоки иногда дублируются
                    continue
                seen.add((it["name"], it["html"]))
                items.append({"name": it["name"], "t": T(it["html"])})
                if s["title"] == "Rules" and it["name"] == "Leader":
                    lead = re.findall(r"<li><strong>([^<]+)</strong>", it["html"])
                    out["leads"] = [names_upper.get(x.strip().upper()) or x.strip().title() for x in lead]
            out["sections"].append({"title": s["title"], "items": items})
        kwl = [k.lower() for k in kw]
        out["character"] = "character" in kwl
        out["epic"] = "epic hero" in kwl or u["cat"].lower() == "epic heroes"
        out["battleline"] = "battleline" in kwl
        out["transport"] = "dedicated transport" in kwl or u["cat"] == "Dedicated Transports"
        units.append(out)
    units.sort(key=lambda x: (CAT_ORDER.index(x["cat"]) if x["cat"] in CAT_ORDER else 99, x["name"]))

    def strat(s, src):
        return {"name": s["name"], "cp": s["cp"], "misc": s["misc"], "turn": s["turn"], "src": src,
                "parts": [{"label": p["label"], "t": T(p["html"])} for p in s["parts"]]}

    detachments = [{
        "id": d["slug"], "name": d["name"],
        # у Pantheon of Woe в карточку правила склеились соседние карточки — отрезаем хвост
        "rules": [{"name": r["name"], "t": T(r["html"].split("Necrodermal Binding Abilities")[0])} for r in d["rules"]],
        "stratagems": [strat(s, d["slug"]) for s in d["stratagems"]],
        "enhancements": [{"name": e["name"], "pts": e["pts"], "t": T(e["html"])} for e in d["enhancements"]],
    } for d in raw["detachments"]]
    core = [strat(s, "core") for s in extra["stratagems"]]

    missing = {}
    for tid, t in texts.items():
        if tid in ru:
            t["ru"] = ru[tid]
        else:
            missing[tid] = t["en"]

    data = {"id": slug, "faction": meta["name"], "ru": meta["ru"], "source": "10.40k.app", "army": army,
            "glossary": glossary, "units": units, "detachments": detachments, "core": core, "texts": texts}
    path = OUT / f"{slug}.json"
    path.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")))
    print(f"{slug}: units={len(units)} detachments={len(detachments)} texts={len(texts)} untranslated={len(missing)} ({path.stat().st_size // 1024} KB)")
    return missing


OUT.mkdir(parents=True, exist_ok=True)
missing = {}
built = []
for slug, meta in FACTIONS.items():
    if (ROOT / "raw" / f"{slug}.json").exists():
        missing.update(build(slug, meta))
        built.append({"id": slug, "name": meta["name"], "ru": meta["ru"], "file": f"data/{slug}.json"})
(OUT / "index.json").write_text(json.dumps({"factions": built}, ensure_ascii=False))
(ROOT / "untranslated.json").write_text(json.dumps(missing, ensure_ascii=False, indent=0))
print("untranslated total:", len(missing))
