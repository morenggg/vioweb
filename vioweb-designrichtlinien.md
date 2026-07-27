# Vioweb — Designrichtlinien

> Verbindliche Grundlage für jede Design- und Frontend-Entscheidung.
> Diese Datei wird **vor** jeder Designentscheidung gelesen. Änderungen daran sind
> Änderungen an der Marke — sie werden begründet, nicht nebenbei gemacht.

Version 1.0 · Stand: Erstdefinition

---

## 1. Haltung

Vioweb verkauft keine Webseiten. Vioweb löst Probleme.

Das Design ist die erste Demonstration dieser Kompetenz. Eine Seite, die selbst
langsam, laut oder unzugänglich ist, widerlegt jedes Versprechen auf ihr.

**Wirkung:** ruhig · kompetent · technisch · modern · minimalistisch · hochwertig
**Nie:** laut · bunt · überladen · verkäuferisch

**Grundregel:** Lieber weniger Elemente in höchster Qualität als viele
durchschnittliche. Im Zweifel: weglassen.

---

## 2. Entscheidungshierarchie

Wenn Anforderungen kollidieren, gilt diese Reihenfolge:

1. **Zugänglichkeit** — nicht verhandelbar
2. **Performance** — nicht verhandelbar
3. **Klarheit** — versteht der Nutzer, was hier passiert?
4. **Ästhetik** — wirkt es hochwertig?
5. **Neuheit** — ist es originell?

Punkt 5 gewinnt nie gegen 1–4.

---

## 3. Farben

Träger des Designs sind Schwarz, Weiß und Fläche. Lila ist ein **Akzent**,
kein Grundton.

### Token

| Token | Light | Dark | Zweck |
|---|---|---|---|
| `--c-bg` | `#FFFFFF` | `#0B0B0C` | Seitenhintergrund |
| `--c-surface` | `#FAFAFA` | `#151517` | Karten, erhöhte Flächen |
| `--c-surface-2` | `#F2F2F3` | `#1D1D20` | Verschachtelte Flächen |
| `--c-text` | `#0B0B0C` | `#F5F5F6` | Primärtext |
| `--c-text-muted` | `#5A5A61` | `#A1A1AA` | Sekundärtext |
| `--c-border` | `#E4E4E7` | `#27272A` | Trennlinien, Rahmen |
| `--c-accent` | `#6D3BF5` | `#A78CFF` | Vioweb Lila |
| `--c-accent-contrast` | `#FFFFFF` | `#0B0B0C` | Text auf Akzentfläche |

Statusfarben (nur in Analyse-/Datenkontext, nie dekorativ):
`--c-good #15803D` / `#4ADE80` · `--c-warn #B45309` / `#FBBF24` · `--c-bad #B91C1C` / `#F87171`

**Score-Bänder** (verbindlich für alle Messwert-Visualisierungen):
`0–59` kritisch · `60–89` verbesserungswürdig · `90–100` gut.
Messwerte werden nach diesen Bändern eingefärbt, **nicht** in Markenlila — ein
Wert von 54 darf nicht aussehen wie einer von 92. Die Zahl bleibt der
Informationsträger, die Farbe verstärkt sie nur.

### Kontrast (geprüft)

- `#6D3BF5` auf Weiß → **5,85:1** ✓ (AA Fließtext)
- `#A78CFF` auf `#0B0B0C` → **7,3:1** ✓ (AAA Fließtext)
- Weiß auf `#6D3BF5` → **5,85:1** ✓ (Primär-Button)
- `--c-text-muted` erfüllt in beiden Modi ≥ 4,5:1

Jede neue Farbkombination wird vor Einsatz gegen 4,5:1 (Text) bzw. 3:1
(UI-Komponenten, Fokusringe) geprüft.

### Einsatzregeln für Lila

- Maximal **ein** dominanter Lila-Akzent pro Viewport-Höhe
- Erlaubt: Primär-CTA, Fokusring, aktiver Zustand, ein einzelnes Hervorhebungswort
- Verboten: großflächige Verläufe, farbige Sektionshintergründe, Deko-Blobs,
  eingefärbte Icon-Sets, Lila als Fließtextfarbe über mehr als drei Wörter
- Farbe darf **nie** alleiniger Informationsträger sein (Status immer zusätzlich
  über Text oder Form)

---

## 4. Typografie

Typografie trägt das Design — nicht Farben, nicht Icons, nicht Animationen.

### Schrift

System-Font-Stack. Keine Webfonts.

```
system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
```

**Begründung:** null Netzwerk-Requests, kein FOUT/CLS, native Rendering-Qualität
auf jeder Plattform. Ein Webfont müsste einen messbaren Markenvorteil belegen,
der die LCP-Kosten rechtfertigt — bis dahin gilt der System-Stack.

Monospace (nur Code/Messwerte): `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`

### Skala (fluid, mobile-first)

| Token | clamp() | Einsatz |
|---|---|---|
| `--fs-display` | `clamp(2.25rem, 1.5rem + 3.6vw, 4rem)` | Hero-H1, einmal pro Seite |
| `--fs-h2` | `clamp(1.75rem, 1.3rem + 2vw, 2.75rem)` | Sektionstitel |
| `--fs-h3` | `clamp(1.125rem, 1rem + 0.6vw, 1.375rem)` | Kartentitel |
| `--fs-lead` | `clamp(1.0625rem, 1rem + 0.5vw, 1.25rem)` | Vorspann |
| `--fs-body` | `1rem` | Fließtext |
| `--fs-sm` | `0.875rem` | Meta, Labels |
| `--fs-xs` | `0.75rem` | Eyebrow, Footnote |

### Regeln

- Zeilenhöhe: Headlines `1.08–1.15`, Fließtext `1.6`
- Letter-Spacing: nur bei großen Headlines negativ (`-0.02em` bis `-0.03em`);
  Eyebrows/Labels in Versalien `+0.08em`
- Zeilenlänge maximal **68 Zeichen** (`max-width: 62ch` bei Fließtext)
- Gewichte: 400 (Fließtext), 500 (Labels/UI), 600 (Headlines). Kein 700+, kein 300
- Niemals Text in Versalien über mehr als ~24 Zeichen
- `text-wrap: balance` für Headlines, `pretty` für Fließtext
- Niemals Schriftgröße unter 12 px, niemals `user-scalable=no`

---

## 5. Raum & Layout

### Spacing-Skala (Basis 4 px)

`--s-1: 4px` · `--s-2: 8px` · `--s-3: 12px` · `--s-4: 16px` · `--s-5: 24px` ·
`--s-6: 32px` · `--s-7: 48px` · `--s-8: 64px` · `--s-9: 96px` · `--s-10: 128px`

Werte außerhalb der Skala sind nicht zulässig.

### Container & Raster

- Content-Container: `max-width: 1200px`, Innenabstand `--s-5` mobil / `--s-7` ab 768 px
- Schmaler Textcontainer: `max-width: 720px`
- Raster: CSS Grid, `repeat(auto-fit, minmax(…, 1fr))` statt Breakpoint-Ketten
- Vertikaler Sektionsrhythmus: `--s-9` mobil, `--s-10` ab 768 px

### Breakpoints (mobile-first, nur `min-width`)

`480px` (große Phones) · `768px` (Tablet) · `1024px` (Desktop) · `1280px` (groß)

Entwickelt wird zuerst für 360 px Breite. Desktop ist die Erweiterung, nie der
Ausgangspunkt.

### Radien & Tiefe

- Radien: `--r-sm 8px` · `--r-md 12px` · `--r-lg 16px` · `--r-xl 24px` · `--r-full 999px`
- Tiefe entsteht primär über **Rahmen und Flächenwechsel**, nicht über Schatten
- Höchstens zwei Schattenstufen; im Dark Mode Schatten reduzieren und Kontur
  über `--c-border` führen

---

## 6. Motion

Animation erklärt Zustandswechsel. Sie unterhält nicht.

| Token | Wert | Einsatz |
|---|---|---|
| `--t-fast` | `150ms` | Hover, Fokus, kleine Farbwechsel |
| `--t-base` | `220ms` | Ein-/Ausblenden, Transformationen |
| `--t-slow` | `300ms` | Panels, Overlays, Scroll-Reveals |
| `--t-data` | `600ms` | **Ausnahme:** einmalige Daten-/Fortschrittsanimationen |
| `--ease` | `cubic-bezier(0.22, 1, 0.36, 1)` | Standard |

**Zur Ausnahme `--t-data`:** Die Marken-Vorgabe lautet 150–300 ms. Für
UI-Transitions gilt sie ohne Einschränkung. Ein Score-Ring oder Messwert, der in
200 ms durchläuft, liest sich jedoch als Rendering-Sprung statt als Messung —
die Animation trägt hier Bedeutung („es wird gemessen"). Deshalb genau eine
dokumentierte Ausnahme bis 600 ms, ausschließlich für einmalige
Datenvisualisierung, nie für Navigation oder Interface-Zustände.

### Regeln

- Nur `transform` und `opacity` animieren. Niemals `width`, `height`, `top`, `left`
- Keine Endlos-Animationen, keine Parallax-Effekte, keine Auto-Play-Karussells
- Kein Layout-Shift durch Animation (CLS = 0)
- `prefers-reduced-motion: reduce` schaltet **alle** Bewegung ab; Inhalte bleiben
  sofort sichtbar und vollständig
- Scroll-Reveals: nur einmal, nur leichte Bewegung (≤ 12 px), niemals als
  Voraussetzung für Sichtbarkeit ohne JS

---

## 7. Zugänglichkeit (Zielwert 100)

Nicht verhandelbar:

- Semantisches HTML zuerst. ARIA nur, wenn kein natives Element existiert
- Genau eine `<h1>` pro Seite; Überschriftenebenen ohne Sprünge
- Skip-Link als erstes fokussierbares Element
- Sichtbarer Fokus: `:focus-visible` mit 2 px Akzentring + 2 px Offset, ≥ 3:1
- Alle Interaktionsflächen ≥ 44 × 44 px — auch Navigations- und Footer-Links.
  WCAG 2.5.8 (AA) verlangt nur 24 × 24 px; 44 px ist bewusst die strengere
  Hausregel, weil die Zielgruppe die Seite überwiegend mobil aufruft. Erreicht
  wird das über `min-height` und Padding, nicht über größere Schrift
- Jedes Formularfeld hat ein `<label>` (visuell versteckt ist erlaubt, `placeholder` als Label nicht)
- Fehler werden in Text benannt, mit `aria-describedby` verknüpft, nicht nur eingefärbt
- Dynamische Ergebnisse in `aria-live="polite"` ankündigen
- Bedienbarkeit vollständig per Tastatur; Overlays: Esc schließt, Fokus wird
  gefangen und beim Schließen zurückgegeben
- Bilder: aussagekräftiges `alt`, dekorative Grafiken `aria-hidden="true"`
- `lang="de"` gesetzt; Kontrast in **beiden** Farbmodi geprüft

---

## 8. Performance (Zielwert 100)

- **Budget:** ≤ 100 KB CSS+JS (komprimiert) für die Landingpage; LCP < 1,8 s,
  INP < 200 ms, CLS < 0,05
- Kein Framework, keine Library ohne belegten Bedarf. Jede Abhängigkeit wird
  begründet
- Keine externen Requests im kritischen Pfad: keine CDN-Fonts, keine
  Third-Party-Widgets, keine Icon-Bibliotheken (Icons als Inline-SVG)
- Bilder: AVIF/WebP mit Fallback, `width`/`height` immer gesetzt,
  `loading="lazy"` + `decoding="async"` unterhalb des Folds; LCP-Bild niemals lazy
- JavaScript ist Progressive Enhancement. Ohne JS bleiben Inhalt und Navigation
  vollständig nutzbar
- `content-visibility: auto` für weit unten liegende Sektionen

---

## 9. SEO (Zielwert 100)

Jede Seite liefert verpflichtend:

- `<title>` ≤ 60 Zeichen, `<meta name="description">` 120–160 Zeichen
- `<link rel="canonical">` absolut
- OpenGraph: `og:type`, `og:title`, `og:description`, `og:url`, `og:image`
  (1200 × 630), `og:locale=de_DE`, `og:site_name`
- Twitter: `summary_large_image`
- `robots` (Standard `index,follow`)
- JSON-LD Schema.org, passend zum Seitentyp und **deckungsgleich mit dem
  sichtbaren Inhalt**
- Genau eine `<h1>`, sinnvolle Überschriftenstruktur
- Sprechende URLs in Kleinbuchstaben mit Bindestrich
- `sitemap.xml` und `robots.txt` gepflegt

---

## 10. Komponentenregeln

- **Erst suchen, dann bauen.** Existiert eine Komponente, wird sie erweitert,
  nicht dupliziert
- Jede Komponente: modular, wiederverwendbar, dokumentiert, ohne Wissen über
  ihren Einsatzort
- Styling ausschließlich über Token. Keine Hex-Werte, keine Magic Numbers im
  Komponenten-CSS
- Zustände immer vollständig definieren: default, hover, focus-visible, active,
  disabled, loading, error, empty

### Button

| Variante | Einsatz | Regel |
|---|---|---|
| Primär | Hauptaktion | Lila-Fläche, **max. eine** pro Bildschirmbereich |
| Sekundär | Nebenaktion | Rahmen, transparente Fläche |
| Ghost | tertiär, Navigation | nur Text |

Höhe ≥ 44 px, Radius `--r-full` oder `--r-md` (konsistent pro Projekt),
Label als Verb + Objekt („Analyse starten"), niemals „Hier klicken".

### Karte

Fläche `--c-surface`, 1 px `--c-border`, Radius `--r-lg`, Padding `--s-5`/`--s-6`.
Hover nur, wenn die Karte tatsächlich klickbar ist — dann Bewegung ≤ 2 px.

### Formular

Label sichtbar oder korrekt versteckt, Feldhöhe ≥ 48 px, Fehler unterhalb des
Feldes in Text, `inputmode`/`autocomplete` gesetzt, Ergebnis per Live-Region.

---

## 11. Inhalt & Tonalität

- Sachlich, konkret, in der Sie-Form. Nutzen vor Feature
- Keine Superlative ohne Beleg, keine erfundenen Zahlen, keine Fake-Testimonials,
  keine künstliche Dringlichkeit
- Demo- und Beispieldaten werden **sichtbar** als solche gekennzeichnet
- Kurze Sätze. Fachbegriffe nur, wenn sie erklärt werden

---

## 12. Selbstkontrolle vor jedem Abschluss

- [ ] 360 px / 768 px / 1280 px geprüft
- [ ] Light **und** Dark Mode geprüft
- [ ] Vollständige Tastaturbedienung, Fokus jederzeit sichtbar
- [ ] Kontraste in beiden Modi ≥ 4,5:1 (Text) / 3:1 (UI)
- [ ] `prefers-reduced-motion` schaltet alle Bewegung ab
- [ ] Ohne JavaScript nutzbar
- [ ] Kein Layout-Shift, keine externen Requests
- [ ] Meta, OG, Canonical, JSON-LD vorhanden und inhaltlich deckungsgleich
- [ ] Nur Token-Werte, keine Duplikate, keine toten Regeln
