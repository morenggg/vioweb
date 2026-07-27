# Vioweb — Website

Statische Website für Vioweb. Handgeschriebenes HTML, CSS und JavaScript.
Kein Framework, kein npm, kein Build-Schritt. Zum Bearbeiten reicht ein
Texteditor, zum Anschauen ein Doppelklick auf `index.html`.

Die Seite hat genau eine Aufgabe: Der Besucher trägt seine Website-Adresse
in das Formular ein und fragt den kostenlosen Kurz-Check an.

---

## Dateien

```
index.html            Startseite
impressum.html        Pflichtangaben — enthält Platzhalter
datenschutz.html      Pflichtangaben — enthält Platzhalter
danke.html            Bestätigung, nur ohne JavaScript erreichbar
404.html              Fehlerseite
robots.txt
sitemap.xml
.nojekyll             schaltet die Jekyll-Verarbeitung von GitHub Pages ab
css/seite.css         alles unterhalb der Falz
js/formular.js        ausschließlich der Formularversand
img/zeichen.svg       Firmenzeichen — PLATZHALTER
img/og-bild.png       Vorschaubild für soziale Netzwerke, 1200 × 630
```

---

## Vor dem Livegang

Diese Punkte sind noch offen. Die Reihenfolge ist die empfohlene.

### 1. Firmenzeichen ersetzen

`img/zeichen.svg` enthält ein selbst gezeichnetes Platzhalter-W. Ersetze die
Datei durch das echte Zeichen — gleicher Dateiname, gleiche Stelle.

Damit Wasserzeichen und Kopfbereich weiter passen, sollte die Ersatzdatei
ein **quadratisches** `viewBox`-Verhältnis haben und ihre Farbe über
`currentColor` beziehen. Das Zeichen ist zusätzlich direkt in den
HTML-Dateien eingebettet (Kopfbereich und Fußzeile) — such dort nach
`marke__zeichen` und tausche den `<path>` mit aus.

Danach `img/og-bild.png` neu erzeugen, es enthält dasselbe Zeichen.

### 2. E-Mail-Adresse prüfen

Überall steht `kontakt@vioweb.de`. Das ist eine **Annahme**, keine
Vorgabe — die Domain war bekannt, der Teil davor nicht. Stimmt die Adresse
nicht, in diesen Dateien ersetzen:

- `index.html` — im Formular (`action` und `data-mail`), im
  `<noscript>`-Block, im Abschnitt Kontakt, im JSON-LD
- `impressum.html`, `datenschutz.html`, `danke.html`

Der Grund für die Annahme statt eines Platzhalters: Ohne funktionierende
Adresse wäre der E-Mail-Rückfall des Formulars tot, und ein totes Formular
war ausgeschlossen.

### 3. Impressum ausfüllen

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

### 4. Datenschutzerklärung ausfüllen

Gleiches Vorgehen in `datenschutz.html`. Zusätzlich zu den Angaben aus dem
Impressum:

| Platzhalter | Woher |
|---|---|
| `[NAME DES FORMULARDIENSTES]` | siehe Punkt 5 |
| `[ANBIETER UND ANSCHRIFT]` | aus dem Impressum des Dienstes |
| `[SERVERSTANDORT]` | aus dem Vertrag |
| `[SPEICHERDAUER…]` | deine Entscheidung, üblich sind 6 bis 12 Monate |
| `[DATUM EINTRAGEN]` | Datum des Livegangs |

**Wichtig:** Solange kein Formulardienst eingerichtet ist und das Formular
per E-Mail arbeitet, muss der Absatz zum Formulardienst **gelöscht**
werden. Eine Datenschutzerklärung, die einen nicht genutzten Dienst nennt,
ist genauso falsch wie eine, die einen genutzten verschweigt.

### 5. Formulardienst einrichten

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

### 6. GitHub Pages aktivieren

1. Im Repository auf **Settings → Pages**
2. Unter *Build and deployment* als Source **Deploy from a branch** wählen
3. Branch `main`, Ordner `/ (root)`, speichern
4. Unter *Custom domain* `vioweb.de` eintragen
5. Beim Domain-Anbieter setzen:
   - `A`-Einträge für `vioweb.de` auf
     `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`
   - `CNAME` für `www` auf `<benutzername>.github.io`
6. Nach der DNS-Umstellung **Enforce HTTPS** anhaken

Die Datei `.nojekyll` muss liegen bleiben, sonst verarbeitet GitHub die
Dateien unnötig nach.

### 7. Zum Schluss

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
- Formular in allen drei Wegen: mit Endpunkt, per E-Mail, ohne JavaScript
- Leeres Absenden erzeugt drei Fehler in Klartext neben den Feldern
- `beispiel.de` wird zu `https://beispiel.de` ergänzt
- Honeypot bricht still ab; Honeypot und `_redirect` werden nicht versendet
- `prefers-reduced-motion` blendet nichts aus
- JSON-LD gültig

Gesamtgröße der Startseite: **rund 30 KB**, verteilt auf vier Anfragen.
