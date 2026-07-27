# Vioweb — Projektanweisungen

**Marke:** Vioweb · **Domain:** vioweb.de · **Instagram:** @vio.web
**Sprache der Seite und der Inhalte:** Deutsch

Vioweb ist eine Plattform für Website-Analyse, Optimierung, SEO, Performance,
UX, Conversion und moderne Webentwicklung.

> Wir verkaufen keine Webseiten. Wir lösen Probleme.

---

## Vor jeder Änderung

1. `vioweb-designrichtlinien.md` lesen — **verpflichtend** vor jeder
   Designentscheidung
2. Projekt analysieren: vorhandene Komponenten, Styles, Patterns suchen
3. Bestehendes nutzen und verbessern statt neu bauen
4. Analyse, Probleme, Verbesserungsideen und Umsetzung **erklären**, dann coden

Nie blind arbeiten. Keine Quick Fixes, keine Hacks, keine doppelten
Komponenten, keine unnötigen Libraries.

---

## Prototyp-Regel

Die Website ist noch nicht produktiv. Deshalb gilt: **jede neue Idee und jede
größere Designänderung beginnt als eigenständiger HTML-Prototyp** unter
`prototypes/`.

Ein Prototyp muss:

- direkt im Browser per Doppelklick funktionieren
- ohne Build-Tools auskommen
- HTML, CSS und JS in einer Datei enthalten
- responsive sein und alle Animationen zeigen
- realistisch wirken und leicht testbar sein

Erst nach Freigabe entsteht daraus produktiver Code.

---

## Qualitätsziele

Lighthouse 100 / 100 / 100 / 100 (Performance, Accessibility, Best Practices, SEO).
Core Web Vitals: LCP < 1,8 s · INP < 200 ms · CLS < 0,05.

Mobile first: zuerst 360 px, dann Tablet, dann Desktop.

---

## Kritisches Denken

Anforderungen werden nicht ungeprüft übernommen. Wenn eine bessere Lösung
existiert: erklären, begründen, dann die bessere Variante umsetzen.
Abweichungen von diesen Regeln werden in `vioweb-designrichtlinien.md`
dokumentiert, nicht stillschweigend eingeführt.

Qualität hat Vorrang vor Geschwindigkeit. Lieber weniger Elemente in höchster
Qualität als viele durchschnittliche.

---

## Selbstkontrolle nach jeder Aufgabe

Responsiveness · Lighthouse · Accessibility · SEO · Konsistenz · Performance ·
Animationen · Dark Mode · Mobile · Tablet · Desktop · Codequalität

Die vollständige Checkliste steht in `vioweb-designrichtlinien.md`, Abschnitt 12.

---

## Struktur

```
vioweb-designrichtlinien.md   Design-System, verbindlich
CLAUDE.md                     diese Datei
prototypes/                   eigenständige HTML-Prototypen
  index.html                  Landingpage
```

---

## Git

Entwicklung auf `claude/vioweb-master-prompt-x2381g`.
Push immer mit `git push -u origin <branch>`.
