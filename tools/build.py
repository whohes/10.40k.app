"""Собирает app/data/necrons.json из выгрузки 40k.app (raw.json), core_extra.json и переводов (ru.json).

Каждый текст правил хранится один раз в словаре texts по id (короткий хеш английского текста):
  texts[id] = {"en": "...", "ru": "..."}
Переводы лежат в tools/ru/*.txt построчно: id|русский текст; новые/изменённые тексты без перевода
просто показываются на английском. Список непереведённых пишется в untranslated.json.
"""
import hashlib, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
raw = json.loads((ROOT / "raw.json").read_text())
extra = json.loads((ROOT / "core_extra.json").read_text())
kw_site = json.loads((ROOT / "kw_site.json").read_text())
ru = {}
for f in sorted((ROOT / "ru").glob("*.txt")):
    for line in f.read_text().splitlines():
        if "|" in line:
            k, v = line.split("|", 1)
            ru[k.strip()] = v.strip()
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT.parent / "data" / "necrons.json"

texts = {}

def T(html):
    html = (html or "").strip()
    if not html:
        return None
    tid = hashlib.sha1(html.encode()).hexdigest()[:8]
    texts[tid] = {"en": html}
    return tid

def kwkey(name):
    """'Rapid Fire 2' -> 'rapid fire', 'Anti-Vehicle 2+' -> 'anti', 'Scouts 9"' -> 'scouts'"""
    k = name.lower().strip()
    if k.startswith("anti-"):
        return "anti"
    k = re.sub(r'\s+(\d+\+?|d\d+(\+\d+)?|\d+")$', "", k)
    return k

# --- glossary ---
glossary = {}
for k, v in kw_site.items():
    glossary[k] = {"name": v["name"], "t": T(v["html"])}
for k, v in extra["keywords"].items():
    if k in glossary:
        continue
    if v.get("ref") == "army":
        glossary[k] = {"name": v["name"], "t": T(raw["army"][0]["html"])}
    else:
        glossary[k] = {"name": v["name"], "t": T(v["html"])}

CAT_ORDER = ["Epic heroes", "Leaders & Characters", "Battleline", "Mounted",
             "Infantry, Swarms, Beasts", "Aircraft", "Titanic", "Dedicated Transports", "Vehicles, Monsters"]

units = []
names_upper = {u["name"].upper(): u["slug"] for u in raw["units"]}
for u in raw["units"]:
    kw = u["keywordGroups"].get("Keywords", [])
    out = {
        "id": u["slug"],
        "name": u["name"],
        "cat": u["cat"],
        "models": u["models"],
        "ranged": [{"name": w["name"], "kw": w["keywords"], "p": w["profile"]} for w in u["ranged"]],
        "melee": [{"name": w["name"], "kw": w["keywords"], "p": w["profile"]} for w in u["melee"]],
        "keywords": kw,
        "core": u["keywordGroups"].get("Core Abilities", []),
        "faction": u["keywordGroups"].get("Faction Abilities", []),
        "costs": u["costs"],
        "sections": [],
    }
    for l in u["loose"]:
        m = re.match(r"(\d\+) invulnerable save", l["name"], re.I)
        if m:
            out["invuln"] = m.group(1)
        elif l["name"].upper().startswith("DAMAGED"):
            out["damaged"] = {"name": l["name"].title().replace("Damaged", "Damaged"), "t": T(l["html"])}
    for s in u["sections"]:
        items = []
        for it in s["items"]:
            items.append({"name": it["name"], "t": T(it["html"])})
            if s["title"] == "Rules" and it["name"] == "Leader":
                lead = re.findall(r"<li><strong>([^<]+)</strong>", it["html"])
                out["leads"] = [names_upper.get(x.strip().upper(), None) or x.strip().title() for x in lead]
        out["sections"].append({"title": s["title"], "items": items})
    kwl = [k.lower() for k in kw]
    out["character"] = "character" in kwl
    out["epic"] = "epic hero" in kwl or u["cat"] == "Epic heroes"
    out["battleline"] = "battleline" in kwl
    out["transport"] = "dedicated transport" in kwl or u["cat"] == "Dedicated Transports"
    units.append(out)

units.sort(key=lambda x: (CAT_ORDER.index(x["cat"]) if x["cat"] in CAT_ORDER else 99, x["name"]))

def strat(s, src):
    return {"name": s["name"], "cp": s["cp"], "misc": s["misc"], "turn": s["turn"], "src": src,
            "parts": [{"label": p["label"], "t": T(p["html"])} for p in s["parts"]]}

detachments = []
for d in raw["detachments"]:
    detachments.append({
        "id": d["slug"],
        "name": d["name"],
        # у Pantheon of Woe в карточку правила склеились соседние карточки — отрезаем хвост
        "rules": [{"name": r["name"], "t": T(r["html"].split("Necrodermal Binding Abilities")[0])} for r in d["rules"]],
        "stratagems": [strat(s, d["slug"]) for s in d["stratagems"]],
        "enhancements": [{"name": e["name"], "pts": e["pts"], "t": T(e["html"])} for e in d["enhancements"]],
    })

core = [strat(s, "core") for s in extra["stratagems"]]
army = [{"name": a["name"], "t": T(a["html"])} for a in raw["army"]]

missing = {}
for tid, t in texts.items():
    if tid in ru:
        t["ru"] = ru[tid]
    else:
        missing[tid] = t["en"]

data = {
    "faction": "Necrons",
    "source": "10.40k.app",
    "army": army,
    "glossary": glossary,
    "units": units,
    "detachments": detachments,
    "core": core,
    "texts": texts,
}
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")))
(ROOT / "untranslated.json").write_text(json.dumps(missing, ensure_ascii=False, indent=0))
print(f"units={len(units)} detachments={len(detachments)} texts={len(texts)} untranslated={len(missing)} -> {OUT} ({OUT.stat().st_size//1024} KB)")
