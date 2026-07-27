# Vioweb — Designrichtlinien

> Verbindliche Grundlage für jede Gestaltungsentscheidung.
> Die Werte stammen aus dem bestehenden Erscheinungsbild (Instagram,
> PDF-Berichte, Facebook) und sind kein Vorschlag.

Version 2.0 · löst die erste Fassung vollständig ab

---

## 1. Haltung

Die Seite hat genau eine Aufgabe: Der Besucher trägt seine Website-Adresse
in das Kontaktformular ein und fragt den kostenlosen Kurz-Check an. Alles
andere zahlt darauf ein oder fliegt raus.

Der Betreiber prüft fremde Websites gegen genau die Punkte, die auf dieser
Seite selbst gelten. Eine Seite, die langsam ist, fremde Server anfragt oder
sich nicht mit der Tastatur bedienen lässt, widerlegt jedes Versprechen auf
ihr. Das ist hier keine Ästhetikfrage, sondern eine Glaubwürdigkeitsfrage.

---

## 2. Zielgruppe und Sprache

Kleine und mittlere Betriebe in Deutschland: Handwerk, Dienstleister,
Vereine, Praxen. **Keine Entwickler.**

- **Du**, nicht Sie. **Wir**, nicht ich. Durchgehend.
- Kurze Hauptsätze, ein Gedanke pro Satz.
- Kein Fachjargon. Keine englischen Begriffe, wo es deutsche gibt.
- Konkret statt allgemein: „Drei Sekunden Ladezeit" statt „schlechte Performance".
- Folgen benennen, nicht Methoden: „Ob dich findet, wer dich sucht" statt
  „Meta-Tags und strukturierte Daten".
- **Keine erfundenen Zahlen.** Steht eine Zahl auf der Seite, muss sie
  belegbar sein. Fehlt eine Angabe, kommt ein sichtbar markierter
  Platzhalter hin — nichts Erfundenes.

Feste Formulierungen:

> Analysieren. Optimieren. Entwickeln.
> Der erste Check kostet nichts.

---

## 3. Farben

Dunkles Erscheinungsbild. Lila ist die einzige Akzentfarbe.

| Zweck | Hex | Variable |
|---|---|---|
| Hintergrund | `#060609` | `--grund` |
| Hintergrund, zweite Ebene | `#0B0B10` | `--grund-2` |
| Text hell | `#FFFFFF` | `--text` |
| Text gedämpft | `#9EA1A9` | `--text-leise` |
| Linien | `#282830` | `--linie` |
| Akzent hell | `#9B54FC` | `--akzent-hell` |
| Akzent kräftig | `#6226FA` | `--akzent-voll` |
| Lichtschein | `#240D4E` | `--schein` |

Ampelfarben nur, wenn tatsächlich eine Bewertung dargestellt wird:
`#2E7D32` grün · `#D98A00` gelb · `#C1272D` rot. Sonst keine weiteren Farben.

### Die beiden Lila sind nicht austauschbar

Gemessen gegen `#060609`:

| Farbe | Kontrast | Erlaubt für |
|---|---|---|
| `#FFFFFF` | 19,4:1 | alles |
| `#9EA1A9` | 7,8:1 | Fließtext |
| `#9B54FC` | 4,9:1 | **Text**, Akzentwörter, Verweise |
| `#6226FA` | **3,1:1** | **nur Flächen**, Balken, Punkte, Rahmen |
| Weiß auf `#6226FA` | 6,6:1 | Schaltflächen |

`#6226FA` erreicht als Textfarbe die geforderten 4,5:1 nicht und wird
deshalb **nie** für Text verwendet — auch nicht für kleine Beschriftungen.
Umgekehrt bleibt `#6226FA` die Farbe des Balkens, der Aufzählungspunkte und
der vollflächigen Schaltfläche.

Fehlermeldungen im Formular laufen auf `#FF8A8F` statt `#C1272D`: Rot auf
Schwarz erreicht sonst die 4,5:1 nicht.

### Ein Akzent pro Abschnitt

Meist ein einzelnes Wort in der Schlagzeile. Nie zwei lila Hervorhebungen
in derselben Überschrift, nie eine ganze Zeile in Lila.

---

## 4. Schrift

Systemschriften. Keine geladenen Schriftdateien, keine Schriften von fremden
Servern. Drei Rollen, klar getrennt:

| Rolle | Stack | Einsatz |
|---|---|---|
| Schlagzeile | `"Helvetica Neue", Helvetica, Arial, sans-serif` | H1, H2, H3, Fließtext |
| Struktur | `"Arial Narrow", "Helvetica Neue Condensed", "Liberation Sans Narrow", Arial` | Versal-Beschriftungen, Formularlabels, Claim |
| Technik | `ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono"` | Kicker, Nummern, technische Angaben |

**Bekannte Grenze:** Die schmale Grotesk existiert nicht auf jedem System.
Android und manche Linux-Systeme fallen auf normal breite Schrift zurück.
Das ist bewusst in Kauf genommen — der Preis einer geladenen Schriftdatei
wäre höher als der Gewinn. Alle Layouts müssen deshalb auch dann tragen,
wenn die Struktur-Schrift normal breit rendert.

### Regeln

- Schlagzeilen: fett (700), Laufweite `-0.02em` bis `-0.03em`, Zeilenhöhe 1.02–1.06
- Versalien bekommen **immer** zusätzliche Laufweite:
  Struktur `+0.1em`, Technik `+0.2em` bis `+0.28em`
- Fließtext höchstens **52 Zeichen** pro Zeile (`max-width: 52ch`)
- Zeilenhöhe Fließtext 1.65
- Nie Versalien über lange Textstrecken

---

## 5. Layout

- **Alles linksbündig auf einer festen Kante. Nichts wird zentriert.**
  Das gilt auch für Innenpolster von Klickflächen: Sie dürfen die Kante
  nicht verschieben, notfalls über negative Außenabstände ausgleichen.
- Seitenrand: 24 px auf dem Handy, 64 px ab 900 px Breite
- Inhaltsbreite höchstens 1120 px
- **Rechts bleibt bewusst Luft.** Text füllt die Fläche nie ganz aus
- Wiederkehrend: der Balken **68 × 5 px** in `#6226FA` unter der Kicker-Zeile,
  in jedem Abschnitt
- Abstände zwischen Abschnitten: 72 px mobil, 104 px ab 900 px
- Abschnitte werden durch Haarlinien in `#282830` getrennt, nicht durch Flächen

### Signaturelement

Das Firmenzeichen liegt groß mit **11 % Deckkraft** als Wasserzeichen im
Hintergrund des Aufmachers, dahinter ein weicher radialer Lichtschein in
`#240D4E`.

Zwei harte Bedingungen:

1. **Nur am rechten Rand angeschnitten.** Wird das Zeichen an zwei Rändern
   gleichzeitig beschnitten, wirkt es als dunkler Block statt als Form.
   Umgesetzt über `right: -11%`, vertikal zentriert, Breite
   `min(46vw, 460px)` gegen eine Mindesthöhe von 560 px.
2. **Der Schein hat keine sichtbare Kante.** Der Verlauf läuft über sieben
   Stufen bis auf null aus. Weniger Stufen erzeugen einen sichtbaren Ring.

---

## 6. Bewegung

Höchstens ein dezentes Einblenden beim Scrollen. Nichts, was hüpft oder
blinkt. Dauer 150–300 ms.

Umgesetzt rein in CSS über `animation-timeline: view()`, ohne JavaScript.
Browser ohne Unterstützung zeigen den Inhalt sofort — es darf keinen
Zustand geben, in dem etwas unsichtbar hängen bleibt.

`prefers-reduced-motion: reduce` schaltet alle Bewegung ab.

---

## 7. Was ausdrücklich nicht vorkommt

Diese Muster sind verworfen und dürfen nicht wieder auftauchen:

- Reihen aus drei oder vier gleich großen Symbolen mit Beschriftung darunter
- Zentrierte Sperrsatz-Zeilen als Zierde
- Farbverläufe über die gesamte Fläche
- Mehrere Akzentfarben
- Nummerierte Schrittfolgen `01 / 02 / 03`, **außer** wenn wirklich eine
  Reihenfolge gemeint ist (bei den drei Leistungen ist sie es)
- Kurze Fragmentsätze in Serie („Schnell. Sicher. Sichtbar.")
- Aufgeblasene Werbesprache
- Cookie-Banner

---

## 8. Technische Grenzen

- **Statisch auf GitHub Pages.** Kein Server, keine Datenbank, kein Build.
- HTML, CSS und JavaScript von Hand. Kein Framework, kein npm.
- **Keine externen Ressourcen.** Beim Aufruf darf die Seite keine einzige
  Anfrage an einen fremden Server senden. Das ist die Kernaussage der
  Marke und nicht verhandelbar.
- Kritisches CSS inline im `<head>`, der Rest nicht-blockierend nachgeladen
- JavaScript ausschließlich für den Formularversand. Alles andere
  funktioniert ohne
- Gesamtgröße unter 500 KB, sichtbarer Inhalt unter 1,5 s bei gedrosseltem
  Mobilfunk
- Bilder mit `width` und `height` im Markup, `loading="lazy"` außer im
  Aufmacher, als WebP oder AVIF
- Kein Layoutsprung beim Laden

**Bewusste Doppelung:** Der `:root`-Werteblock steht in jeder HTML-Datei.
Ohne Build-Schritt ist das die einzige Möglichkeit, kritisches CSS inline zu
halten. Wird ein Wert geändert, muss er in allen HTML-Dateien geändert
werden — die Liste steht in der README.

---

## 9. Zugänglichkeit

- Kontrast mindestens 4,5:1 für Fließtext, 3:1 für Bedienelemente
- Sichtbarer Fokusrahmen: 2 px `#9B54FC`, 3 px Abstand
- Sinnvolle Überschriftenhierarchie, genau eine `<h1>` pro Seite
- Jedes Formularfeld hat ein `<label>`. Platzhalter ersetzen kein Label
- Bedienbarkeit vollständig per Tastatur
- Klickflächen mindestens 44 × 44 px. **Ausnahme:** Verweise, die mitten in
  einem Satz stehen (etwa „Zur Datenschutzerklärung" im Einwilligungstext
  oder eine E-Mail-Adresse im Fließtext). WCAG 2.5.8 nimmt diese
  ausdrücklich aus, und eine erzwungene Höhe würde den Zeilenfall
  zerreißen. Alles, was allein steht — Schaltflächen, Navigation, Fußzeile,
  Listenverweise — hält die 44 px ein
- Fehlermeldungen stehen **neben dem betroffenen Feld**, nicht gesammelt
  oben. Kein „Ungültige Eingabe" — stattdessen sagen, was fehlt

---

## 10. Suchmaschinen

Je Seite eigener Titel und eigene Beschreibung. Open Graph, Twitter Card,
kanonische Adresse, `robots.txt`, `sitemap.xml`. JSON-LD vom Typ
`ProfessionalService` mit Anschrift.

**Keine Ortsangabe in Titeln.** Die Leistung ist ortsunabhängig; Torgau
steht nur dort, wo eine Anschrift rechtlich oder strukturell nötig ist
(Impressum, Datenschutz, JSON-LD, Fußzeile).

Keine toten Verweise. Kein `href="javascript:void(0)"`. Was noch nicht
existiert, kommt nicht ins Menü.

---

## 11. Prüfliste vor jedem Abschluss

- [ ] 360 px, 768 px und 1280 px ohne horizontalen Überlauf
- [ ] Nichts zentriert, alles auf der linken Kante
- [ ] Ein Akzent pro Abschnitt, `#6226FA` nirgends als Textfarbe
- [ ] Wasserzeichen nur rechts angeschnitten, Schein ohne Kante
- [ ] **Null Anfragen an fremde Server**
- [ ] Kontraste beider Lila geprüft
- [ ] Vollständige Tastaturbedienung, Fokus jederzeit sichtbar
- [ ] Formular in allen drei Wegen bedienbar (Endpunkt, E-Mail, ohne JS)
- [ ] Fehlermeldungen in Klartext neben dem Feld
- [ ] `prefers-reduced-motion` blendet nichts aus
- [ ] Keine toten Verweise, keine erfundenen Zahlen
- [ ] Alle Platzhalter in der README verzeichnet
