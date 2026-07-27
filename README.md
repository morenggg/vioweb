# Vioweb — Website

Statische Website für Vioweb. Handgeschriebenes HTML, CSS und JavaScript.
Kein Framework, kein npm, kein Build-Schritt.

Die Seite hat zwei Aufgaben: Wer eine Website hat, fragt den kostenlosen
Kurzcheck an. Wer keine hat, fragt eine neue Website an.

---

## Dateien

```
index.html            Startseite
impressum.html        Pflichtangaben — enthält Platzhalter
datenschutz.html      Pflichtangaben — enthält Platzhalter
danke.html            Bestätigung nach dem Absenden
404.html              Fehlerseite
robots.txt            sperrt derzeit ALLES — siehe LAUNCH_CHECKLIST.md
sitemap.xml
site.webmanifest
.nojekyll             schaltet die Jekyll-Verarbeitung von GitHub Pages ab
CNAME                 eigene Domain — nicht löschen
css/seite.css         alles unterhalb der Falz
js/seite.js           Formular, Menü, Kopfzeile, Einblenden, Fortschrittsbalken
fonts/                Manrope, lokal (SIL OFL 1.1)
img/                  Firmenzeichen, Favicons, Vorschaubild
SEO.md                alle SEO-Maßnahmen mit Begründung
LAUNCH_CHECKLIST.md   Prüfliste für den Livegang
```

> **Die Seite ist derzeit für Suchmaschinen gesperrt.** In `robots.txt`
> steht `Disallow: /`. Das ist Punkt 1 in `LAUNCH_CHECKLIST.md`.

---

## Lokal ansehen

Ein Doppelklick auf `index.html` reicht **nicht mehr** — über `file://`
blockiert der Browser die Schriftdateien (CORS). Stattdessen:

```
cd vioweb
python3 -m http.server 8099
```

Dann `http://127.0.0.1:8099/` aufrufen. Alle Prüfungen laufen ebenfalls
über diesen Weg.

---

## Das Firmenzeichen

Das echte Zeichen ist eingebaut. Die Quelldatei war ein 1024 × 1024 großes
PNG, an dem zwei Dinge nicht stimmten und die vor dem Einbau behoben
wurden:

- Ein **ein Pixel breiter grauer Rahmen** lief um die gesamte Fläche.
- **88 % der Fläche war leer.** Ungeschnitten wäre das Zeichen im
  Kopfbereich auf etwa 19 px Höhe geschrumpft.

**Offener Punkt:** Das Zeichen hat eine **weiße Hälfte**. Auf dem jetzt
hellen Hintergrund verschwindet sie. Es liegt deshalb auf einer dunklen
Kachel — das Zeichen selbst bleibt unverändert, das Layout passt sich an.
Eine eigene Logovariante für helle Hintergründe wäre die saubere Lösung.

Daraus entstanden die drei Dateien oben. Verhältnis des Zeichens nach dem
Zuschnitt: **1,649 : 1** (breiter als hoch) — davon hängen die Größen im
CSS ab.

### Wenn das Zeichen einmal getauscht wird

Neue Quelldatei bereitlegen, dann:

1. Rahmen abschneiden und auf die echten Motivgrenzen zuschneiden
2. Auf 480 px Breite verkleinern, als WebP mit Qualität 88 speichern →
   `img/zeichen.webp`
3. Favicon-Paket erzeugen: 32, 192 und 512 px sowie `apple-touch-icon`
   (180 px, voller Grund) und `maskable-512` (22 % Sicherheitszone)
4. `img/og-bild.png` neu erzeugen, es enthält dasselbe Zeichen
5. Ändert sich das Seitenverhältnis, in **allen fünf** HTML-Dateien die
   `width`- und `height`-Angaben am `<img class="marke__zeichen">` sowie am
   Wasserzeichen in `index.html` anpassen

**Warum WebP und kein SVG:** Das Zeichen hat zwei Farben und weiche
Verläufe. Eine Nachzeichnung als SVG wäre etwa 2 KB statt 30 KB groß und
bei jeder Größe gestochen scharf — sie wäre aber eine **Nachbildung**, nicht
die Originaldatei. Bei einem Markenzeichen ist das eine Entscheidung des
Betreibers, keine des Entwicklers. Sag Bescheid, wenn du die schlanke
Variante willst; die 30 KB sind der Preis für die exakte Vorlage.

---

## Vor dem Livegang

Diese Punkte sind noch offen. Die Reihenfolge ist die empfohlene.

### 1. E-Mail-Adresse prüfen

Überall steht `kontakt@vioweb.de`. Das ist eine **Annahme**, keine
Vorgabe — die Domain war bekannt, der Teil davor nicht. Stimmt die Adresse
nicht, in diesen Dateien ersetzen:

- `index.html` — im Formular (`action` und `data-mail`), im
  `<noscript>`-Block, in der Fußzeile, im JSON-LD
- `impressum.html`, `datenschutz.html`, `danke.html`

Der Grund für die Annahme statt eines Platzhalters: Ohne funktionierende
Adresse wäre der E-Mail-Rückfall des Formulars tot, und ein totes Formular
war ausgeschlossen.

### 2. Impressum ausfüllen

In `impressum.html` sind alle offenen Stellen hervorgehoben — im Quelltext
als `[GROSSBUCHSTABEN IN KLAMMERN]`, auf der Seite als lila unterlegter
Text. Zu ersetzen:

| Platzhalter | Woher |
|---|---|
| `[VOR- UND NACHNAME]` | zweimal: Anschrift und Verantwortlicher |
| `[STRASSE UND HAUSNUMMER]` | ladungsfähige Anschrift, kein Postfach |
| `[POSTLEITZAHL]` | Torgau |
| `[TELEFONNUMMER]` | § 5 DDG verlangt ein zweites schnelles Kontaktmittel |
| `[STEUERNUMMER]` | vom Finanzamt |

Bist du umsatzsteuerpflichtig, ersetze den Kleinunternehmer-Absatz durch
die Umsatzsteuer-Identifikationsnummer nach § 27a UStG.

Zum Schluss den orangen Warnkasten und den Warnhinweis am Anfang der Datei
löschen.

### 3. Datenschutzerklärung ausfüllen

Gleiches Vorgehen in `datenschutz.html`. Zusätzlich zu den Angaben aus dem
Impressum:

| Platzhalter | Woher |
|---|---|
| `[NAME DES FORMULARDIENSTES]` | siehe Punkt 4 |
| `[ANBIETER UND ANSCHRIFT]` | aus dem Impressum des Dienstes |
| `[SERVERSTANDORT]` | aus dem Vertrag |
| `[SPEICHERDAUER…]` | deine Entscheidung, üblich sind 6 bis 12 Monate |
| `[DATUM EINTRAGEN]` | Datum des Livegangs |

**Wichtig:** Solange kein Formulardienst eingerichtet ist und das Formular
per E-Mail arbeitet, muss der Absatz zum Formulardienst **gelöscht**
werden. Eine Datenschutzerklärung, die einen nicht genutzten Dienst nennt,
ist genauso falsch wie eine, die einen genutzten verschweigt.

### 4. Formulardienst einrichten

GitHub Pages kann keine Formulare verarbeiten — es liefert nur Dateien aus.
Für den Versand braucht es einen fremden Dienst.

**Empfehlung:** [Formcarry](https://formcarry.com) oder
[Formspark](https://formspark.io). Beide bieten Server in der EU, kommen
ohne Skript von Dritten aus (die Seite spricht selbst mit dem Endpunkt) und
stellen einen Vertrag zur Auftragsverarbeitung nach Art. 28 DSGVO bereit.

> Ohne diesen Vertrag darfst du den Dienst nicht einsetzen. Er ist kein
> Papierkram, sondern Voraussetzung.

Einrichtung in `index.html`, am Formular `check-formular`:

```html
<form ...
      action="HIER-DEN-ENDPUNKT"
      data-endpunkt="HIER-DENSELBEN-ENDPUNKT"
      data-mail="kontakt@vioweb.de">
```

Beide Angaben sind nötig und haben verschiedene Aufgaben:

- `data-endpunkt` nutzt das Skript für den Versand ohne Neuladen
- `action` greift nur, wenn JavaScript nicht läuft

Außerdem das versteckte Feld `_redirect` auf die volle Adresse von
`danke.html` setzen. Manche Dienste erwarten dafür einen anderen Feldnamen
(`_next`, `redirect`) — steht in deren Anleitung.

**Ohne Endpunkt bleibt das Formular funktionsfähig.** Es fällt dann auf
eine vorbefüllte E-Mail zurück. Es gibt keinen Zustand, in dem der Besucher
vor einem toten Formular steht.

### 5. GitHub Pages aktivieren

Die Datei `CNAME` mit dem Inhalt `vioweb.de` liegt bereits im Repository —
damit ist die eigene Domain für GitHub Pages hinterlegt. Sie darf nicht
gelöscht oder umbenannt werden.

1. Im Repository auf **Settings → Pages**
2. Unter *Build and deployment* als Source **Deploy from a branch** wählen
3. Branch `main`, Ordner `/ (root)`, speichern
4. Unter *Custom domain* sollte `vioweb.de` bereits stehen (aus `CNAME`)
5. Beim Domain-Anbieter setzen:
   - `A`-Einträge für `vioweb.de` auf
     `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`
   - `CNAME` für `www` auf `<benutzername>.github.io`
6. Nach der DNS-Umstellung **Enforce HTTPS** anhaken

Die Datei `.nojekyll` muss liegen bleiben, sonst verarbeitet GitHub die
Dateien unnötig nach.

### 6. Zum Schluss

- `sitemap.xml`: das `lastmod`-Datum aktualisieren
- Die Seite bei der Google Search Console anmelden
- Beide Warnkästen aus Impressum und Datenschutz entfernen

---

## Schriften

Die Seite nutzt **Systemschriften**. Es wird keine Schriftdatei geladen,
damit beim Aufruf keine Anfrage an einen fremden Server geht und keine
Ladezeit verloren ist. Drei Rollen:

| Rolle | Einsatz |
|---|---|
| `--schrift-schlag` | Schlagzeilen und Fließtext |
| `--schrift-struktur` | Versal-Beschriftungen, Formularlabels, Claim |
| `--schrift-technik` | Kicker, Nummern, technische Angaben |

**Bekannte Grenze:** Die schmale Grotesk der Rolle *Struktur* gibt es nicht
auf jedem Gerät. Android und manche Linux-Systeme zeigen dort normal breite
Schrift. Die Layouts halten das aus.

### Später auf eigene Schriftdateien umstellen

1. Ordner `fonts/` anlegen, `.woff2`-Dateien hineinlegen
2. In **jeder** HTML-Datei im `<style>`-Block `@font-face`-Regeln ergänzen
3. Die drei `--schrift-*`-Werte auf die neuen Namen ändern
4. `<link rel="preload" as="font" type="font/woff2" crossorigin>` für die
   Schrift des Aufmachers ergänzen
5. Prüfen, dass die Lizenz die Einbettung auf einer Website erlaubt

---

## Beim Bearbeiten beachten

**Farben stehen in jeder HTML-Datei.** Das kritische CSS liegt inline im
`<head>`, damit oberhalb der Falz nichts auf eine externe Datei wartet.
Ohne Build-Schritt lässt sich das nicht anders lösen. Wird ein Wert im
`:root`-Block geändert, muss er in **allen fünf** HTML-Dateien geändert
werden:

`index.html` · `impressum.html` · `datenschutz.html` · `danke.html` · `404.html`

**Die beiden Lila sind nicht austauschbar.** `#9B54FC` ist die Textfarbe,
`#6226FA` ist die Flächenfarbe. `#6226FA` erreicht auf dem dunklen Grund
nur 3,1:1 und darf deshalb nie für Text verwendet werden.

**Keine externen Ressourcen.** Keine Schriften, Karten, Videos, Symbole
oder Skripte von fremden Servern. Das ist die Kernaussage der Marke.
Sobald eine fremde Anfrage dazukommt, braucht die Seite ein
Einwilligungsbanner — und widerlegt sich selbst.

Alle Gestaltungsregeln stehen in `vioweb-designrichtlinien.md`.

---

## Geprüft

Automatisiert in Chromium, alle fünf Seiten bei 360, 768 und 1280 px:

- **Null Anfragen an fremde Server** auf jeder Seite
- Kein horizontaler Überlauf
- Genau eine `<h1>` je Seite, keine Sprünge in der Überschriftenfolge
- Kontrast überall über dem geforderten Wert, in beiden Lila geprüft
- Klickflächen ab 44 px, außer bei Verweisen mitten im Satz
- Keine toten Verweise, keine Anker ohne Ziel
- Alle Bilder mit `width` und `height`
- Fließtext über dem Wasserzeichen: 5,04:1 (mobil) und 5,41:1 (Desktop),
  gemessen am hellsten Punkt von Lichtschein und Zeichen
- Formular in allen drei Wegen: mit Endpunkt, per E-Mail, ohne JavaScript
- Off-Canvas-Menü: öffnen, Fokus im Panel, Scroll-Sperre, Escape,
  Fokusrückgabe, Linkklick, Schließen-Knopf
- Keine doppelten Titel, keine doppelten Descriptions, Canonical überall
- JSON-LD auf allen fünf Seiten gültig
- Kein Abschnitt bleibt beim Einblenden unsichtbar (320, 390 und 1440 px)
- Leeres Absenden erzeugt drei Fehler in Klartext neben den Feldern
- `beispiel.de` wird zu `https://beispiel.de` ergänzt
- Honeypot bricht still ab; Honeypot und `_redirect` werden nicht versendet
- `prefers-reduced-motion` blendet nichts aus
- JSON-LD gültig

Gesamtgröße der Startseite: **138 KB** unkomprimiert, verteilt auf sechs
Anfragen — davon 25 KB die Schriftdatei und 31 KB das Firmenzeichen. HTML,
CSS und JavaScript komprimiert der Server auf einen Bruchteil.
