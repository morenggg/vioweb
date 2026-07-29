# Vioweb — Designrichtlinien

> Verbindliche Grundlage für jede Gestaltungsentscheidung.

Version 4.0 · helles Erscheinungsbild, löst Version 3 ab

> **Kehrtwende gegenüber Version 1 bis 3.** Die waren dunkel, abgeleitet
> aus Instagram und den PDF-Berichten. Auf ausdrückliche Entscheidung des
> Betreibers ist die Website jetzt hell. Das Erscheinungsbild auf Instagram
> bleibt davon unberührt — wer beides nebeneinander sieht, merkt den Bruch.
> Wenn die Website hell bleibt, gehört das Instagram-Profil mittelfristig
> angeglichen.

---

## 1. Haltung

Die Seite hat zwei Aufgaben, nicht mehr:

1. Wer eine Website hat, fragt den kostenlosen Kurzcheck an.
2. Wer keine hat, fragt eine neue Website an.

Alles zahlt auf eines der beiden ein oder fliegt raus.

Der Betreiber prüft fremde Websites gegen genau die Punkte, die auf dieser
Seite selbst gelten. Eine Seite, die langsam ist, fremde Server anfragt oder
sich nicht mit der Tastatur bedienen lässt, widerlegt jedes Versprechen auf
ihr. Das ist keine Ästhetikfrage, sondern eine Glaubwürdigkeitsfrage.

---

## 2. Zielgruppe und Sprache

Kleine und mittlere Betriebe, Vereine und Selbstständige. **Keine
Entwickler.**

- **Du**, nicht Sie. **Wir**, nicht ich. Durchgehend.
- Kurze Hauptsätze, ein Gedanke pro Satz.
- Kein Fachjargon. Keine englischen Begriffe, wo es deutsche gibt.
- Konkret statt allgemein: „Drei Sekunden Ladezeit" statt „schlechte Performance".
- **Keine erfundenen Zahlen, Kunden, Bewertungen oder Erfolgsquoten.**
  Fehlt eine Angabe, kommt ein sichtbar markierter Platzhalter hin.
- **Keine Preise erfinden.** Der Check-up hat einen Preis, aber keinen
  hinterlegten — die Seite sagt deshalb nur, dass er vor der Beauftragung
  genannt wird.

Verbotene Wendungen: „digitale Exzellenz", „maßgeschneiderte Lösungen",
„Next Level", „Ihre Vision, unsere Mission", „revolutionieren",
„einzigartige digitale Erlebnisse".

---

## 3. Farben

**Hell.** Warmes Off-White als Hauptfläche, dunkle Bereiche nur als
gezielter Akzent.

| Zweck | Hex | Variable |
|---|---|---|
| Hauptfläche | `#F7F7FA` | `--grund` |
| Karten, erhöhte Flächen | `#FFFFFF` | `--flaeche` |
| ruhige Abschnitte | `#F0EFF6` | `--flaeche-ruhig` |
| dunkler Abschnitt | `#1C1824` | `--dunkel` |
| Text | `#17151D` | `--text` |
| Text gedämpft | `#625F6B` | `--text-leise` |
| Text auf Dunkel | `#EFEDF3` | `--text-hell` |
| Akzent | `#7C3AED` | `--akzent` |
| Akzent, Hover | `#6D28D9` | `--akzent-tief` |
| Akzentfläche, sehr zart | `#EDE9FE` | `--akzent-zart` |
| Akzent auf Dunkel | `#C4B5FD` | `--akzent-hell` |

### Gemessene Kontraste

| Kombination | Wert |
|---|---|
| `#17151D` auf `#F7F7FA` | 17,1:1 |
| `#625F6B` auf `#F7F7FA` | 5,8:1 |
| `#7C3AED` auf `#F7F7FA` | 5,3:1 |
| Weiß auf `#7C3AED` | 5,7:1 |
| `#EFEDF3` auf `#1C1824` | 16,3:1 |

**Formularrahmen brauchen einen eigenen Wert.** Die dekorative Haarlinie
`rgba(23,21,29,.10)` erreicht gegen den Grund nur 1,25:1 — für
Bedienelemente verlangt WCAG 1.4.11 aber 3:1. Deshalb `--linie-feld:
#8B8894` an allen Eingabefeldern.

### Regeln für Lila

- Höchstens **eine** betonte Fläche pro Abschnitt
- Verboten: großflächige Verläufe, Neon, Glaseffekte als Selbstzweck,
  eingefärbte Icon-Sets
- Dunkle Flächen sind Akzent, nicht Grundton: **höchstens ein dunkler
  Abschnitt** auf der Startseite

---

## 4. Schrift

**Manrope**, lokal eingebunden. Variable Datei, Gewichte 400 bis 800.

```
--schrift: "Manrope", -apple-system, BlinkMacSystemFont, "Segoe UI",
           Roboto, "Helvetica Neue", Arial, sans-serif;
```

Monospace nur für Nummern und technische Marker.

**Warum lokal und nicht per Google Fonts:** Ein `<link>` zu
`fonts.googleapis.com` würde bei jedem Aufruf eine Anfrage an einen fremden
Server auslösen — genau das, was diese Website nicht tut. Die Dateien liegen
in `fonts/`, Lizenz ist die SIL OFL 1.1, Selbsthosting ist erlaubt.

Nur der lateinische Grundschnitt (24,8 KB) wird vorgeladen; er deckt Deutsch
mit Umlauten und ß vollständig ab. Die erweiterte Datei holt der Browser nur
bei Bedarf, geregelt über `unicode-range`.

### Regeln

- Überschriften 800, Fließtext 400, Zwischenüberschriften 700
- Laufweite bei großen Überschriften `-0.028em` bis `-0.032em`
- Zeilenhöhe Fließtext **1.65**, Überschriften 1.12
- Fließtext höchstens **62 Zeichen** je Zeile.
  **Achtung bei `ch`:** Die Einheit misst die Breite der Null, nicht die
  eines Durchschnittsbuchstabens. `62ch` ergaben gemessen **82 Zeichen**
  je Zeile. Der Faktor liegt bei rund 1,32. Für Grundschriftgröße trifft
  `46ch` die Vorgabe, für größere Schriften entsprechend mehr. Im Zweifel
  nachmessen statt rechnen
- Keine langen Versalstrecken, keine extrem fetten Textblöcke
- Alle Größen über `clamp()` — keine starren Pixelwerte für Schrift

---

## 5. Layout und Abstände

- **Alles linksbündig auf einer festen Kante. Nichts wird zentriert.**
  Das gilt auch für Innenpolster von Klickflächen
- Seitenrand: 20 px bis 560 px, 28 px bis 900 px, darüber 48 px
- Inhaltsbreite höchstens **1200 px**
- **Rechts bleibt Luft.** Der Satzspiegel endet vor dem Rand — das heißt
  nicht, dass das Layout einspaltig bleibt

### Abstandssystem

Nur diese Werte, keine Zwischengrößen:

```css
--s-xs: .5rem;   --s-sm: .75rem;  --s-md: 1rem;   --s-lg: 1.5rem;
--s-xl: 2.5rem;  --s-2xl: 4rem;   --s-3xl: 6rem;  --s-4xl: 8rem;
```

Große Abstände zwischen Abschnitten (`--s-2xl` mobil, `--s-3xl` ab
1040 px), kleine innerhalb zusammengehöriger Inhalte.

### Zwei-Kanten-Raster ab 1040 px

Bis 1040 px ist die Seite einspaltig. Darüber: **Rail links**
(`--rail: 164px`, Abstand `--gasse: 64px`) mit dem Kicker, rechts der
Inhalt. Beide Kanten sind über alle Abschnitte hinweg dieselben.

**Jeder Abschnitt hat eine eigene Komposition.** Kein zweiter Abschnitt
ist wie der davor aufgebaut: Bandleiste, zwei Wege als Karten,
redaktionelle Definitionsliste, Kartenvergleich, dunkler Abschnitt mit
Nummernliste, Häkchenliste, dreispaltige Schrittfolge, Accordion,
zweispaltiger Kontaktblock.

### Nicht alles ist eine Karte

Karten gibt es an genau drei Stellen: die zwei Wege, der Vergleich
Kurzcheck/Check-up und der Kontaktblock. Alles andere ist redaktionell —
Überschrift, Text, Haarlinien, Weißraum.

Acht Prüfbereiche als acht Kacheln wären genau die Baukastenoptik, die
hier nicht vorkommen soll. Sie stehen deshalb als Definitionsliste mit
Haarlinien.

### Formen

- Radien: **10 px** normal, **16 px** für Karten. Keine Pillen außer bei
  kleinen Marken
- Ein einziger, sehr flacher Schatten (`--hebung`) und nur auf betonten
  Karten
- Rahmen statt Schatten, wo es geht

---

## 6. Bewegung

- Fortschrittsbalken oben, 3 px, `transform: scaleX()`, einmal je
  Bildaufbau über `requestAnimationFrame`
- Einblenden beim Scrollen, sehr dezent
- Hover auf Knöpfen und Verweisen, der Pfeil rückt 3 px
- Mobilmenü fährt von rechts ein
- Accordion über `::details-content`

Dauer 160 ms (schnell), 280 ms (mittel), 460 ms (lang).
`prefers-reduced-motion: reduce` schaltet alles ab.

**Kein Einblenden über `animation-timeline: view()`.** Getestet und wieder
entfernt: Läuft ein Element den Bereich nie durch, bleibt es auf
`opacity: 0` stehen — im Test war ein ganzer Abschnitt unsichtbar. Der
unsichtbare Ausgangszustand wird deshalb erst gesetzt, wenn das Skript
läuft, plus Sicherheitsnetz nach zwei Sekunden.

---

## 6a. Zwei Bausteine mit eigenen Regeln

### Mobilmenü

Fährt von rechts ein, dahinter ein Schleier. Grundlage ist ein `<details>`
— ohne JavaScript öffnet und schließt es nativ.

- Unter 380 px die **ganze Breite**, darüber **92 %** bis höchstens 400 px.
  Dann bleibt links ein Streifen der Seite sichtbar und ein Tippen daneben
  schließt. Bei voller Breite gibt es kein „daneben", dort bleiben Kreuz und
  Escape
- Sitzt an Ober-, Unter- und rechter Kante. **Nie ein schwebendes Feld**
- Eigene Kopfleiste auf Höhe des Seitenkopfs: Marke links, Kreuz rechts.
  Die Marke steht auf derselben Kante wie die des Seitenkopfs, dadurch wirkt
  der Übergang durchgehend
- Das `<summary>` **ist** der Schließen-Knopf. Ein zweites `<summary>` ist
  nicht erlaubt, ein zusätzlicher Knopf wäre ohne JavaScript tot
- Zwei Ebenen: vier Seiten groß mit Unterzeile, darunter durch eine
  Haarlinie getrennt der Aufruf und das Rechtliche
- Ab 900 px übernehmen die Textlinks, die Schublade wird ausgeblendet
- Fokusfang und Scroll-Sperre gehören dazu. Bei einer früheren Fassung als
  Dropdown waren beide ausdrücklich draußen

Fünf Fallen, alle beim Testen aufgetreten:

1. **`backdrop-filter` am Kopfbereich macht ihn zum Bezugsrahmen für
   `position: fixed`.** Tafel und Schleier waren dadurch auf die Kopfzeile
   eingesperrt. Bei offenem Menü wird der Filter deshalb abgeschaltet.
2. **`.kopf` trägt `z-index: 90`** und ist damit ein eigener Stapelkontext.
   Fortschrittsbalken (140) und Sprungmarke (130) malten auf die Schublade.
   Offen steigt `.kopf` auf 150.
3. **Marke und Aufruf der Kopfzeile müssen weichen**, sonst schauen sie
   neben der Schublade hervor, sobald diese nicht die ganze Breite hat.
4. **Der Wähler dafür muss auf die Kopfzeile begrenzt sein.** Ein einfaches
   `.kopf:has(.menue[open]) .marke` erwischt auch die Marke *in* der
   Schublade — deren Kopfleiste war dadurch leer. Richtig ist
   `.kopf:has(.menue[open]) > .kopf__inhalt > .marke`.
5. **Die Ausfahrt braucht `[open]` im Wähler.** `.menue--zu .menue__tafel`
   verliert gegen `.menue[open] .menue__tafel` über die Spezifität, die
   Animation läuft dann nie los und `animationend` bleibt aus. Richtig ist
   `.menue[open].menue--zu .menue__tafel`.

### Das Firmenzeichen auf hellem Grund

Das Zeichen hat eine **weiße Hälfte**, die auf `#F7F7FA` verschwindet. Es
liegt deshalb auf einer dunklen Kachel (`--dunkel`, Radius 8 px). Das
Zeichen selbst bleibt unverändert — das Layout passt sich an, nicht
umgekehrt.

**Besser wäre eine eigene Logovariante für helle Hintergründe.** Solange
die fehlt, bleibt die Kachel.

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
- Glaseffekte als Selbstzweck (Weichzeichnung nur hinter dem Menü und im
  Kopfbereich, wo sie Lesbarkeit schafft)
- gleich aufgebaute Abschnitte hintereinander
- Fließtext, wo drei Zeilen reichen

---

## 8. Technische Grenzen

- **Statisch auf GitHub Pages.** Kein Server, keine Datenbank, kein Build.
- HTML, CSS und JavaScript von Hand. Kein Framework, kein npm.
- **Keine externen Ressourcen.** Beim Aufruf darf die Seite keine einzige
  Anfrage an einen fremden Server senden. Das ist die Kernaussage der
  Marke und nicht verhandelbar.
- Kritisches CSS inline im `<head>`, der Rest nicht-blockierend nachgeladen
- **JavaScript nur für vier Dinge:** Formularversand, Off-Canvas-Menü
  (Fokusfang, Scroll-Sperre, Ausblendbewegung), Haarlinie unter dem Kopf
  und das Einblenden beim Scrollen. Die letzten drei sind reine Zugaben —
  ohne JavaScript bleibt die Seite vollständig bedienbar und nichts ist
  versteckt. Das Menü selbst ist ein `<details>` und öffnet nativ
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
- Sichtbarer Fokusrahmen: 2 px `#7C3AED`, 3 px Abstand
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
- [ ] Hoechstens drei farbige Woerter auf der ganzen Seite
- [ ] Nicht alle Abschnitte gleich aufgebaut (Randspalte wechselt)
- [ ] Kein Geviertstrich im sichtbaren Text
- [ ] Kein Kurzsatz als Schlusspointe hinter einem laengeren Satz
- [ ] Wasserzeichen nur rechts angeschnitten, Schein ohne Kante
- [ ] **Null Anfragen an fremde Server**
- [ ] Kontraste beider Lila geprüft
- [ ] Vollständige Tastaturbedienung, Fokus jederzeit sichtbar
- [ ] Formular in allen drei Wegen bedienbar (Endpunkt, E-Mail, ohne JS)
- [ ] Fehlermeldungen in Klartext neben dem Feld
- [ ] `prefers-reduced-motion` blendet nichts aus
- [ ] Keine toten Verweise, keine erfundenen Zahlen
- [ ] Alle Platzhalter in der README verzeichnet
