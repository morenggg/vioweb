# Vioweb — Projektanweisungen

**Marke:** Vioweb · **Domain:** vioweb.de · **Instagram:** @vio.web
**Sprache:** Deutsch, durchgehend **Du** und **Wir**

Ein-Personen-Betrieb für Webentwicklung. Zielgruppe sind kleine und mittlere
Betriebe in Deutschland: Handwerk, Dienstleister, Vereine, Praxen.
**Keine Entwickler** — kein Fachjargon, keine englischen Begriffe, wo es
deutsche gibt.

> Analysieren. Optimieren. Entwickeln.
> Der erste Check kostet nichts.

---

## Das eine Ziel

Der Besucher trägt seine Website-Adresse in das Kontaktformular ein und
fragt den kostenlosen Kurz-Check an. Alles auf der Seite zahlt darauf ein
oder fliegt raus.

---

## Vor jeder Änderung

1. `vioweb-designrichtlinien.md` lesen — **verpflichtend**
2. Vorhandene Bausteine, Stile und Muster suchen und weiterverwenden
3. Analyse, Probleme, Verbesserungsideen und Umsetzung **erklären**, dann coden

Keine Quick Fixes, keine Hacks, keine doppelten Bausteine, keine Libraries.

---

## Harte Grenzen

- **Statisch auf GitHub Pages.** Kein Server, kein Build, kein npm
- **Keine externen Ressourcen.** Beim Aufruf darf keine einzige Anfrage an
  einen fremden Server gehen. Das ist die Kernaussage der Marke und nicht
  verhandelbar
- Kritisches CSS inline, der Rest nicht-blockierend nachgeladen
- JavaScript ausschließlich für den Formularversand
- **Keine erfundenen Zahlen und keine erfundenen Angaben.** Fehlt etwas,
  kommt ein sichtbar markierter Platzhalter hin
- Kein Cookie-Banner. Die Seite setzt keine Cookies und lädt nichts von
  Dritten — dann braucht sie auch keine Einwilligung

---

## Gestaltung in drei Sätzen

Hell, linksbündig, typografisch. Lila ist die einzige Akzentfarbe,
`#7C3AED` auf hellem Grund und `#C4B5FD` auf den dunklen Bändern.

**Der Akzent ist selten.** Auf der ganzen Startseite gibt es genau drei
farbige Wörter: im Aufmacher, im Vergleich, im Kontakt. Nicht einer je
Abschnitt — das war die frühere Regel, und acht gleich gebaute
Überschriften hintereinander haben die Seite wie eine Vorlage aussehen
lassen.

**Abschnitte sind nicht gleich gebaut.** Vier haben eine Randspalte mit
Beschriftung, drei laufen über die volle Breite ohne. Die Verteilung ist
absichtlich unregelmäßig; ein strenger Wechsel wäre nur das nächste
Muster.

Alles Weitere, inklusive der verworfenen Muster, steht in
`vioweb-designrichtlinien.md`.

---

## Struktur

```
index.html · impressum.html · datenschutz.html · danke.html · 404.html
css/seite.css        alles unterhalb der Falz
js/formular.js       nur der Formularversand
img/                 Zeichen und Vorschaubild
vioweb-designrichtlinien.md   verbindlich
README.md            offene Platzhalter und Einrichtung
```

Der `:root`-Werteblock steht in jeder HTML-Datei. Wird ein Wert geändert,
muss er in **allen fünf** geändert werden.

---

## Selbstkontrolle nach jeder Aufgabe

Die vollständige Prüfliste steht in `vioweb-designrichtlinien.md`,
Abschnitt 11. Das Wichtigste: 360/768/1280 px, null fremde Anfragen,
Tastaturbedienung, Formular in allen drei Wegen, keine toten Verweise.

---

## Git

Entwicklung auf `claude/vioweb-master-prompt-x2381g`.
Push immer mit `git push -u origin <branch>`.
