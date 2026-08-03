# Wartungsmodus

Die Startseite kann durch eine Wartungsseite mit kleiner Rennbahn ersetzt
werden. Alles andere — Preise, FAQ, Kontakt, Impressum, Datenschutz — bleibt
unverändert erreichbar.

---

## Ein- und ausschalten

```sh
./wartung.sh an       # Wartungsseite auf /
./wartung.sh aus      # normale Startseite auf /
./wartung.sh status   # zeigt, was gerade aktiv ist
```

Danach committen und pushen. GitHub Pages übernimmt die Änderung von selbst.

Ohne Skript geht es genauso von Hand:

| Ziel | Schritte |
|---|---|
| **an** | `index.html` → `startseite.html` kopieren, dort `robots` auf `noindex,nofollow` setzen. `wartungsseite.html` → `index.html` kopieren, dort `robots` auf `index,follow,max-image-preview:large` setzen |
| **aus** | dasselbe in die andere Richtung |

Genau eine der beiden Fassungen ist indexierbar. Die andere trägt `noindex`
und steht zusätzlich in `robots.txt`, damit sie nicht neben der echten
Startseite in den Suchergebnissen auftaucht.

---

## Warum kein Schalter im Code

Der Auftrag sah `VITE_MAINTENANCE_MODE` oder `export const MAINTENANCE_MODE`
vor. Beides passt hier nicht:

- Es gibt **kein Build-System** — kein `package.json`, kein Vite, kein npm.
  Die Seite ist reines HTML, CSS und JavaScript und wird von GitHub Pages
  unverändert ausgeliefert. Umgebungsvariablen werden nirgends eingelesen.
- Ein Schalter, der **erst im Browser** greift, hätte drei Nachteile: die
  echte Startseite blitzt kurz auf, bevor das Skript sie ersetzt;
  Suchmaschinen sehen weiter die alte Seite; und ohne JavaScript bliebe die
  alte Seite ganz stehen.

Der Tausch der Datei hat keinen dieser Nachteile und ist ein Befehl.

---

## Was neu ist

| Datei | Zweck |
|---|---|
| `wartungsseite.html` | die Wartungsseite, abgelegte Fassung |
| `startseite.html` | die bisherige Startseite, abgelegte Fassung |
| `js/rennbahn.js` | die Rennbahn, rund 20 KB, ohne Fremdcode |
| `wartung.sh` | der Umschalter |
| `WARTUNGSMODUS.md` | diese Datei |

**Geändert:** `index.html` (trägt jetzt die Wartungsseite) und `robots.txt`
(vier neue Einträge in allen drei Bot-Gruppen).

**Bibliotheken:** keine. Die Bahn läuft auf Canvas 2D, das jeder Browser
mitbringt. Eine 3D-Bibliothek wäre ein Vielfaches des gesamten übrigen
Seitengewichts gewesen, und die Seite darf beim Aufruf keine einzige Anfrage
an einen fremden Server stellen — das ist die Kernaussage der Marke.

---

## Wie das Spiel funktioniert

Das Auto fährt einen festen Rundkurs. Gesteuert wird nur das Tempo.

- **Gas** — Knöpfe gedrückt halten, oder Leertaste, Pfeil hoch, `W`
- **Bremse** — Knopf gedrückt halten, oder Pfeil runter, `S`

Die Fahrwerte hängen zusammen und sind aufeinander abgestimmt: Aus Gaskraft,
Rollwiderstand und Luftwiderstand ergibt sich die Endgeschwindigkeit von
selbst — rund 130 km/h. Jede Kurve hat ein eigenes Grenztempo, das sich aus
ihrer Krümmung ergibt. Wer zu schnell hineinfährt, rutscht nach außen,
verliert Tempo und sieht kurz **„Zu schnell!"**. Das Auto fängt sich wieder,
es gibt kein Ausscheiden.

Eine Runde dauert bei zügiger Fahrt etwa 13 Sekunden. Die Strecke ist rund
380 Meter lang; daraus und aus dem Tempo entstehen alle angezeigten Zahlen.
Nichts davon ist zufällig.

**Die erste Runde zählt nicht als Bestzeit.** Sie beginnt aus dem Stand und
wäre nicht vergleichbar — wie eine Auslaufrunde im echten Rennsport.

---

## Bestzeit zurücksetzen

Auf der Seite: der Verweis **„Bestzeit zurücksetzen"** unter den Knöpfen.

Von Hand: in den Entwicklerwerkzeugen des Browsers unter *Application →
Local Storage* den Eintrag `vioweb-bestzeit` löschen. Er enthält nur eine
Zahl — die Sekunden der schnellsten Runde. Kein Personenbezug, nichts wird
übertragen.

---

## Texte und Verweise ändern

Alles steht in `wartungsseite.html`:

| Was | Wo |
|---|---|
| Statuszeile | `<p class="status">` |
| Überschrift | `<h1>` |
| Beschreibung | `.wartung__satz` und `.wartung__klein` |
| Kontaktbereich | `<section class="schluss">` |
| E-Mail-Adresse | im Verweis `mailto:kontakt@vioweb.de` |
| Fußzeile | `<footer class="fuss">` |

Die Streckenbeschriftungen (`ANALYSE`, `PERFORMANCE`, `SEO`,
`SICHTBARKEIT`, `CONVERSION`, `VIOWEB`) stehen in `js/rennbahn.js` in der
Liste `BANDEN`.

Wird die Datei bearbeitet, während der Wartungsmodus **an** ist, muss die
Änderung in `index.html` gemacht werden — `wartungsseite.html` ist dann nur
die Ablage. `./wartung.sh aus` schreibt den aktuellen Stand automatisch
zurück in die Ablage.

---

## Örtlich testen

```sh
python3 -m http.server 8099
```

Dann `http://127.0.0.1:8099/` aufrufen. Ein einfaches Öffnen der Datei über
`file://` reicht nicht: die Schriften und das Stylesheet werden dann nicht
geladen.

---

## Was geprüft wurde

- Breiten 375 × 667, 390 × 844, 768 × 1024 und 1440 × 900: kein seitliches
  Scrollen, nichts über dem Rand, Bahn vollständig sichtbar
- Gas beschleunigt, Bremse verzögert bis zum Stillstand, ohne Gas rollt das
  Auto aus, die Endgeschwindigkeit ist begrenzt
- Runden werden gezählt, Zeiten laufen, die Bestzeit übersteht das Neuladen
- Steuerung über Maus, Finger und Tastatur; Fokus sichtbar; Leertaste
  scrollt die Seite nicht
- Bei `prefers-reduced-motion` bleibt das Auto steuerbar, die Bewegung
  drumherum entfällt
- Im Hintergrund rechnet nichts weiter
- Kontraste mindestens 4,5:1
- Keine Anfrage an fremde Server, keine Konsolenfehler
- Impressum, Datenschutz, Preise, FAQ und Kontakt erreichbar

---

## Offen

- **Das August-Angebot erscheint nicht mehr auf der Startseite.** Das
  Hinweisfeld lag dort und ist mit der alten Startseite in die Ablage
  gewandert. Auf `/preise/` steht der Angebotspreis weiterhin. Ein
  Verkaufsfenster auf einer Wartungsseite wäre ein Widerspruch — wenn du es
  trotzdem willst, sag Bescheid.
- **Lighthouse ist nicht gemessen.** Örtlich fehlen Komprimierung und
  Zwischenspeicherung, die Zahlen wären nicht aussagekräftig. Sinnvoll ist
  eine Messung gegen die veröffentlichte Seite.
