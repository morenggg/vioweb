# SEO — was umgesetzt ist und warum

Stand: 27. Juli 2026 · gilt für alle fünf Seiten

> **Die Seite ist derzeit für Suchmaschinen gesperrt.** In `robots.txt`
> steht `Disallow: /`. Vor dem Livegang muss diese Zeile entfernt werden,
> sonst nimmt Google die Seite nie in den Index auf. Das ist Punkt 1 in
> `LAUNCH_CHECKLIST.md`.

---

## 1. Seitenstruktur

| Seite | Titel | Indexierung |
|---|---|---|
| `index.html` | Vioweb — Website prüfen lassen. Von Hand, nicht vom Werkzeug. | index, follow |
| `impressum.html` | Impressum — Vioweb | index, follow |
| `datenschutz.html` | Datenschutzerklärung — Vioweb | index, follow |
| `danke.html` | Danke für deine Anfrage — Vioweb | **noindex**, follow |
| `404.html` | Seite nicht gefunden — Vioweb | **noindex**, follow |

`danke.html` und `404.html` stehen bewusst auf `noindex`: eine
Bestätigungsseite ohne eigenständigen Inhalt und eine Fehlerseite gehören
nicht in den Index. Beide fehlen deshalb auch in der `sitemap.xml` —
Google widerspricht sich sonst selbst.

**Automatisiert geprüft:** kein doppelter Titel, keine doppelte
Description, jede Seite mit Canonical.

## 2. HTML

Semantisch: `header`, `nav`, `main`, `section`, `aside`, `article`,
`footer`. Genau **eine `<h1>` pro Seite**, Überschriftenfolge ohne
Sprünge — beides wird bei jedem Durchlauf automatisch geprüft.

Auf der Startseite trägt die `<h1>` die Kernaussage („Deine Website.
Ehrlich beurteilt."), die `<h2>` gliedern die sechs Abschnitte, `<h3>`
die einzelnen Punkte darin.

Aufzählungen mit `list-style: none` bekommen `role="list"`, weil Safari
Listen sonst nicht mehr als Liste ansagt.

## 3. Meta

Je Seite eigener `<title>` (≤ 60 Zeichen) und eigene Description
(120–160 Zeichen), absoluter Canonical, `robots`, `theme-color`,
`viewport`, `lang="de"`.

**Kein Ort im Titel.** Die Leistung ist ortsunabhängig; Torgau steht nur
dort, wo eine Anschrift strukturell nötig ist (Impressum, Datenschutz,
JSON-LD, Fußzeile). Ein erzwungenes „Website-Analyse Torgau" im Titel
würde Reichweite kosten statt bringen.

## 4. Social

Open Graph vollständig (`type`, `site_name`, `locale`, `url`, `title`,
`description`, `image` mit Maßen und `image:alt`), Twitter Card als
`summary_large_image`.

Das Vorschaubild `img/og-bild.png` (1200 × 630) ist gebaut und enthält
Zeichen, Wortmarke, Claim und die Schlagzeile — bei geteilten Verweisen
ist es oft der erste Kontakt mit der Marke.

## 5. Strukturierte Daten

Auf der Startseite ein `@graph` mit vier Knoten:

| Typ | Zweck |
|---|---|
| `WebSite` | verknüpft Seite und Betrieb |
| `Organization` + `ProfessionalService` | Name, Logo, Anschrift, Einzugsgebiet, Instagram, Leistungskatalog |
| `BreadcrumbList` | Pfad statt nackter URL im Suchergebnis |
| `FAQPage` | Chance auf ausklappbare Fragen im Suchergebnis |

Auf Impressum, Datenschutz, Danke und 404 jeweils eine
`BreadcrumbList` (Startseite → diese Seite).

**Das FAQ-Schema ist wortgleich mit dem sichtbaren Text.** Google straft
Abweichungen ab; ein automatischer Vergleich prüft das bei jedem
Durchlauf.

Erweiterbar: `Service` je Umfangsstufe, `Review`/`AggregateRating`, sobald
es echte Bewertungen gibt. **Nicht vorher** — erfundene Bewertungen sind
ein Verstoß gegen Googles Richtlinien und abmahnfähig.

**Offen:** Anschrift und Postleitzahl im JSON-LD sind Platzhalter. Ohne
sie ist der `LocalBusiness`-Teil unvollständig.

## 6. robots.txt und sitemap.xml

`robots.txt` sperrt derzeit alles und nennt die Sitemap. Die
`sitemap.xml` enthält die drei indexierbaren Seiten mit `lastmod`,
`changefreq` und `priority`.

## 7. Bilder

| Datei | Einsatz | Maße im Markup | Format |
|---|---|---|---|
| `img/zeichen.webp` | Kopf, Fußzeile, Wasserzeichen | ja | WebP |
| `img/og-bild.png` | nur Social-Crawler | – | PNG |
| `img/favicon-32/192/512.png` | Reiter, Manifest | – | PNG |
| `img/apple-touch-icon.png` | iOS-Startbildschirm | – | PNG |
| `img/maskable-512.png` | Android, maskierbar | – | PNG |

Jedes `<img>` im Markup hat `width` und `height` — das reserviert den
Platz vor dem Laden und hält CLS bei null. Das Zeichen im Kopfbereich
trägt `alt="Vioweb"`, die dekorativen Wiederholungen `alt=""`. Ein
dekoratives Bild mit erfundenem Alt-Text ist schlechter als gar keiner.

Das Wasserzeichen ist rein dekorativ und läuft mit `fetchpriority="low"`,
damit es dem sichtbaren Inhalt keine Bandbreite wegnimmt.

## 8. URLs

`/`, `/impressum.html`, `/datenschutz.html`, `/danke.html`. Kurz,
sprechend, kleingeschrieben, keine Parameter, keine IDs.

## 9. Core Web Vitals

| Maßnahme | Wirkt auf |
|---|---|
| Kritisches CSS inline, Rest nicht-blockierend | LCP |
| Systemschriften, keine Schriftdatei | LCP, CLS |
| `width`/`height` an allen Bildern | CLS |
| Keine Animation, die Inhalt verschiebt | CLS |
| Ein einziges JS, `defer` geladen | INP |
| Keine fremden Server | LCP, INP |
| WebP statt PNG für das Zeichen | LCP |

**Kein Preload nötig:** Die einzige Datei im kritischen Pfad ist
`img/zeichen.webp`, und die steht bereits im Markup ganz oben.
Zusätzliche `preload`-Anweisungen würden hier nur Prioritäten
durcheinanderbringen.

Zielwerte: LCP < 1,8 s · INP < 200 ms · CLS < 0,05.
Lighthouse-Ziel: **> 95 in allen vier Kategorien.**

> Gemessen wird erst nach dem Livegang unter echten Bedingungen. Die
> Werte gehören in `LAUNCH_CHECKLIST.md`, nicht hierher — alles andere
> wäre eine Behauptung.

## 10. Keywords

Aus dem tatsächlichen Angebot abgeleitet, nicht aus einem Werkzeug:

**Tragend:** Website prüfen lassen · Website-Analyse · Website
optimieren lassen · Website Ladezeit verbessern · Website Check

**Ergänzend:** Website barrierefrei prüfen · Impressum Website prüfen ·
Website mehr Anfragen · Website Nutzerführung · Website neu bauen lassen

**Bewusst nicht:** „SEO Agentur", „Webdesign günstig", „Marketing" — dafür
gibt es keine Inhalte auf der Seite. Auf Suchbegriffe zu optimieren, die
das Angebot nicht abdeckt, bringt Besucher, die sofort wieder gehen.

Die Begriffe stehen in Überschriften, Prüfpunkten und Fragen — dort, wo
sie inhaltlich hingehören. **Keine Keyword-Häufung.**

## 11. Inhaltsstrategie

Die Startseite deckt den Suchvorgang von der Frage („Warum reicht ein
Werkzeug nicht?") über die Leistung bis zur Kontaktaufnahme ab.

Sinnvolle Erweiterungen, falls die Seite wachsen soll:

1. **Eine Seite je Umfangsstufe** (Analyse / Begleitung / Umsetzung) —
   erlaubt eigene Titel und eigene `Service`-Daten
2. **Fallbeispiele**, sobald es echte gibt, mit Zahlen vorher und nachher
3. **Ein Glossar** der zehn Prüfbereiche — beantwortet Fragen, die
   Betriebe tatsächlich googeln

Jede neue Seite braucht: eigener Titel, eigene Description, Canonical,
Eintrag in der Sitemap, Verweis aus der Startseite.
