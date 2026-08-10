# Wartungsmodus

Im Wartungsmodus zeigt **jede Adresse** dieselbe Seite: die Wortmarke, groß
und mittig, darunter eine Zeile. Sonst nichts — keine Verweise, kein
Formular, kein Skript.

---

## Ein- und ausschalten

```sh
./wartung.sh an       # jede Seite zeigt die Wartungsseite
./wartung.sh aus      # die normale Website ist zurück
./wartung.sh status   # zeigt, was gerade aktiv ist
```

Danach committen und pushen. GitHub Pages übernimmt es von selbst.

---

## Wie es funktioniert

Im Wartungsmodus tragen alle Einstiegspunkte **denselben Inhalt** — direkt,
nicht über eine Weiterleitung:

```
index.html            preise/index.html     faq/index.html
kontakt/index.html    datenschutz.html      danke.html
404.html              leistungen.html
```

Weil auch `404.html` die Wartungsseite trägt, landet **jede unbekannte
Adresse** ebenfalls dort. Es gibt kein Aufblitzen der echten Seite, keine
Weiterleitungsschleife, und es funktioniert ohne JavaScript.

Die normale Website liegt währenddessen unverändert in `normalbetrieb/` und
wird beim Ausschalten zurückgespielt. Nachgemessen: alle acht Seiten kommen
**byte-identisch** zurück.

**Nicht betroffen:** `kurzcheck-muster.html`. Das ist ein Musterbericht zum
Weitergeben und nicht Teil der Website — falls du den Link gerade jemandem
geschickt hast, funktioniert er weiter.

---

## Warum kein Schalter im Code

Die Seite ist statisch und wird von GitHub Pages ausgeliefert: kein
Build-System, keine Umgebungsvariablen. Ein Schalter, der erst im Browser
greift, würde die echte Seite kurz zeigen und Besuchern ohne JavaScript gar
nicht helfen.

---

## Zum Aussehen

- **Heller Grund, kein dunkler.** Die Wortmarke ist dunkles `#1A1C22` auf
  transparentem Grund. Auf dunklem Hintergrund verschwindet sie, und die
  Datei wird nicht verändert. Für eine dunkle Fassung braucht es eine helle
  Logovariante — die gibt es bisher nicht.
- Das Logo nimmt 68 % der Bildschirmbreite ein, höchstens 480 px. Damit
  wirkt es im Hochformat wie eine Story-Kachel und bleibt am Schreibtisch
  ruhig.
- Hinter dem Logo ein sehr dezenter violetter Schein, der langsam atmet. Bei
  `prefers-reduced-motion` entfällt er ersatzlos.
- Die Seite passt auf allen geprüften Breiten ohne Scrollen auf einen
  Bildschirm: 320, 360, 375, 390, 430, 768 und 1440 px.

**Texte ändern:** alles steht in `wartungsseite.html`. Die Zeile unter dem
Logo ist ein einzelnes `<p>` — willst du wirklich nur das Logo, lösch die
Zeile heraus. Nach jeder Änderung einmal `./wartung.sh aus` und
`./wartung.sh an`, damit sie auf alle Seiten verteilt wird.

---

## Impressum und Datenschutz

Beides ist im Wartungsmodus **nicht** erreichbar, und das ist vertretbar:
Die Seite bietet keine Leistungen an, nennt keine Preise, erhebt keine Daten
und setzt nichts auf dem Gerät ab. Eine reine Platzhalterseite ist keine
geschäftsmäßige Telemedien-Nutzung im Sinne von § 5 DDG.

Sobald die Website wieder online geht, ändert sich das: Dann gilt die
Impressumspflicht erneut. Das Impressum wurde vorher gelöscht — siehe A0 in
`OFFEN.md`. Ich bin kein Anwalt, und das ist keine Rechtsberatung.

---

## Suchmaschinen

Die Wartungsseite trägt `noindex,nofollow`. Grund: Sonst würde diese dünne
Seite in den Suchergebnissen an die Stelle der echten Inhalte treten.
Gecrawlt werden darf sie weiterhin — sonst liest niemand das `noindex`.

**Das hat einen Preis.** Dauert die Wartung Wochen, fallen die Adressen aus
dem Index und müssen sich danach neu aufbauen. Für ein paar Tage ist es der
geringere Schaden. Sauberer wäre ein HTTP-Status 503, den kann GitHub Pages
aber nicht liefern.

`sitemap.xml` nennt weiterhin die vier normalen Adressen. Das ist während der
Wartung ein Widerspruch zum `noindex`, aber harmlos und nach dem Ausschalten
wieder richtig.

---

## Örtlich testen

```sh
python3 -m http.server 8099
```

Dann `http://127.0.0.1:8099/` aufrufen. Ein Aufruf über `file://` reicht
nicht, weil Schrift und Logo über absolute Pfade geladen werden.

Ein Unterschied zum echten Betrieb: Der Testserver zeigt bei unbekannten
Adressen seine eigene Fehlerseite. GitHub Pages liefert dort `404.html` aus —
und die trägt die Wartungsseite.

---

## Was geprüft wurde

- Alle acht Adressen liefern die Wartungsseite, ohne Verweise und ohne Skript
- Nirgends steht noch „Impressum", „Datenschutz", „Preis" oder Inhalt der
  alten Seiten im Quelltext
- Keine Anfrage an fremde Server, keine Konsolenfehler
- Ohne JavaScript sichtbar, bei reduzierter Bewegung ohne Animation
- Sieben Breiten von 320 bis 1440 px: kein Querlauf, kein Scrollen nötig,
  Zeile nie breiter als die Marke
- Zurückschalten liefert alle acht Seiten byte-identisch; im Normalbetrieb
  laufen die bestehenden Prüfungen grün

---

## Die alte Wartungsseite

Die frühere Fassung mit der Rennbahn liegt in der Git-Historie bei Commit
`ed975b6`. Zurückholen:

```sh
git checkout ed975b6 -- wartungsseite.html js/rennbahn.js
```
