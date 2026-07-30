# Was noch offen ist

Stand 28.07.2026, Zweig `claude/vioweb-master-prompt-x2381g`.

Die Website ist gebaut, geprüft und laut Betreiber online. Was hier steht,
ist noch **nicht** erledigt, sortiert danach, wer es erledigen kann.

| Bereich | Punkte | Wer |
|---|---|---|
| A · Blocker | 2 offen, 4 erledigt | du |
| B · Angaben, die nur du hast | erledigt | — |
| C · Einrichtung bei Dritten | 4 | du |
| D · Offene Entscheidungen | 3 | du, dann ich |
| E · Doku stimmt nicht mehr | 2 offen, 3 erledigt | ich |
| F · Erst nach Livegang messbar | 5 | nach dem Umzug |
| G · Bewusst nicht gebaut | 1 | — |

---

## A · Blocker

### A1 bis A4 · erledigt

- **`robots.txt`** ist geöffnet, differenziert nach Suchmaschinen,
  Antwortsystemen und Trainingssammlern.
- **Impressum** vollständig: Name, ladungsfähige Anschrift, Telefon, E-Mail,
  Verantwortlicher nach § 18 Abs. 2 MStV.
- **Datenschutzerklärung** vollständig: Verantwortlicher, Speicherdauer sechs
  Monate, Stand 28.07.2026. Der Absatz zum Kontaktformular beschreibt den
  tatsächlichen Weg über das E-Mail-Programm des Besuchers.
- **Beide Warnkästen** und die Warnhinweise im Quelltext sind entfernt, es
  gibt keine Platzhalter mehr.

> **Keine Umsatzsteuer-Angabe.** Es ist kein Gewerbe angemeldet und keine
> Nummer erteilt. Eine USt-IdNr. nach § 27a UStG ist nur anzugeben, wenn eine
> vorhanden ist. Die Stelle ist im Quelltext kommentiert, dort steht auch, was
> nach der Anmeldung ergänzt werden muss.

### A5 · Interne Notizen sind über die Domain abrufbar

`robots.txt` hält sie aus dem Index, verhindert aber keinen direkten Abruf.
Wer `vioweb.de/OFFEN.md` errät, sieht die Datei. Drei Wege:

1. **GitHub Pages aus `docs/` veröffentlichen.** Website nach `docs/`, Notizen
   bleiben im Hauptverzeichnis. Sauberste Lösung.
2. **Notizen vor dem Livegang aus dem Zweig nehmen.**
3. **So lassen.**

> Ist das Repository ohnehin öffentlich, sind die Dateien schon jetzt über
> github.com lesbar. Dann ändert nur Weg 2 etwas.

### A6 · Gewerbeanmeldung

Kein Punkt, den ich lösen kann, aber einer, der zum Rest gehört: Die Seite
bietet bezahlte Leistungen an. Die Impressumspflicht greift damit schon
jetzt, und eine Gewerbeanmeldung wird üblicherweise fällig, sobald man nach
außen anbietet, nicht erst beim ersten Auftrag.

**Das ist keine Rechtsberatung.** Kläre es vor dem ersten Auftrag mit der IHK,
dem Gewerbeamt oder einem Anwalt, nicht danach.

---

## B · Angaben, die nur du hast

**Erledigt.** Es gibt keine Platzhalter mehr in Impressum und
Datenschutzerklärung. Nachgeprüft: `class="luecke"` kommt in keiner der fünf
HTML-Dateien mehr vor.

Offen ist nur noch die Umsatzsteuer-Angabe, und zwar erst nach der
Gewerbeanmeldung, siehe A6.

---

## C · Einrichtung bei Dritten

### C1 · Formulardienst — noch keiner eingerichtet

Aktuell steht im Formular `data-endpunkt=""`. GitHub Pages liefert nur
Dateien aus und kann kein Formular verarbeiten.

**Das Formular ist trotzdem nicht tot.** Es hat drei Wege, alle drei sind
geprüft:

1. Endpunkt hinterlegt → Versand ohne Neuladen
2. kein Endpunkt → vorbefüllte E-Mail öffnet sich (**aktueller Zustand**)
3. kein JavaScript → normaler Formularversand über `action`

Empfehlung: **Formcarry** oder **Formspark**. Beide mit Servern in der EU
und ohne fremdes Skript — die Seite spricht selbst mit dem Endpunkt, die
Kernaussage der Marke bleibt also unangetastet.

> **Auftragsverarbeitungsvertrag nach Art. 28 DSGVO ist Voraussetzung.**
> Ohne ihn darf der Dienst nicht eingesetzt werden. Kein Papierkram.

Einzutragen sind dann: `action`, `data-endpunkt` (derselbe Wert, andere
Aufgabe) und das versteckte Feld `_redirect` auf die volle Adresse von
`danke.html`. Manche Dienste erwarten dafür `_next` oder `redirect`.

### C2 · GitHub Pages ist noch nicht aktiv

Settings → Pages → *Deploy from a branch*, Branch `main`, Ordner `/ (root)`.
`CNAME` mit `vioweb.de` und `.nojekyll` liegen bereits im Repository und
dürfen nicht gelöscht werden.

### C3 · DNS zeigt noch nicht auf GitHub

- `A`-Einträge für `vioweb.de`: `185.199.108.153`, `185.199.109.153`,
  `185.199.110.153`, `185.199.111.153`
- `CNAME` für `www` auf `<benutzername>.github.io`
- danach **Enforce HTTPS** anhaken

Falls Cloudflare davor liegt: SSL-Modus **Full (strict)**, Auto Minify
**aus** (das CSS ist von Hand gesetzt und inline), Rocket Loader **aus**
(verschiebt Skripte und bricht den Formularversand).

### C4 · Suchmaschinen

`lastmod` in `sitemap.xml` muss auf das Livegang-Datum. Die vollständige
Anleitung für Search Console, Bing Webmaster Tools, IndexNow und die
Cloudflare-Prüfung steht in `KI-SICHTBARKEIT-UND-SEO.md` unter C.

---

## D · Entscheidungen, die ich nicht treffen kann

### D-1 · Das Angebots-Popup speichert etwas auf dem Gerät — bitte lesen

„Höchstens einmal in 24 Stunden" braucht ein Gedächtnis. Ohne Speicherung
erschiene der Hinweis bei **jedem** Aufruf. Ich habe deshalb einen Eintrag im
lokalen Speicher (`localStorage`) angelegt: einen Zeitstempel, sonst nichts.

**Warum das eine Entscheidung für dich ist:** Deine Kernaussage lautet „keine
Cookies, nichts von Dritten". Die bleibt wörtlich richtig — `localStorage`
ist kein Cookie, und nichts verlässt das Gerät. Aber § 25 TTDSG gilt für
*jede* Speicherung auf dem Endgerät, nicht nur für Cookies. Erlaubt ohne
Einwilligung ist sie, wenn sie „unbedingt erforderlich" ist.

- **Meine Einschätzung:** Ein Zeitstempel ohne Personenbezug, der nur
  verhindert, dass ein Hinweis nervt, ist ein sehr geringes Risiko. Genau so
  handhaben es die meisten. Ich habe es in der Datenschutzerklärung als
  eigenen Abschnitt 3 offengelegt, mit Zweck, Inhalt, Dauer und Löschweg.
- **Das Risiko, das bleibt:** Eine strenge Auslegung könnte eine Einwilligung
  verlangen. Dann bräuchte die Seite doch ein Banner — und damit fiele genau
  das weg, was du gegenüber Kunden als Vorteil nennst.
- **Wenn du das nicht willst,** sag Bescheid. Dann nehme ich die Speicherung
  heraus. Der Hinweis erscheint dann einmal je Seitenaufruf, was aufdringlich
  wirkt, oder ich lasse ihn ganz weg und das Angebot steht nur auf der
  Preisseite.

Ich bin kein Anwalt, und das hier ist keine Rechtsberatung.

### D-1b · „August-Angebot" läuft seit dem 30. Juli

Du wolltest es ab heute sichtbar haben. Der Zeitraum steht jetzt auf
**30.07.2026 bis einschließlich 31.08.2026**, und die Gültigkeitsangaben auf
der Preisseite und im Hinweisfeld nennen genau diese Daten.

**Das musste mit:** Vorher stand dort „gültig vom 01.08.2026". Hätte das
Angebot heute schon gelaufen, während die Seite einen späteren Beginn nennt,
wäre das eine falsche Angabe gewesen. Deine beiden Textstellen tragen deshalb
jetzt den 30.07.

**Was ich nicht geändert habe:** Die Bezeichnung „August-Angebot". Sie liest
sich als „das Augustangebot, ab jetzt zu haben" — vertretbar, aber wenn du
einen anderen Namen willst (etwa „Sommer-Angebot"), sag ein Wort, dann ziehe
ich ihn über Preisseite, Hinweisfeld und Datenschutzerklärung durch. Der
Speicherschlüssel `vioweb-aktion-august-2026` steht namentlich in der
Erklärung, den würde ich dann mit umbenennen.

### D-2 · Strukturierte Daten nennen im August den regulären Preis

Die `Offer`-Auszeichnung auf der Preisseite steht bei 399 €, weil das im
Dokument steht. Während der Aktion zeigt die Seite 249 € — der reguläre Preis
ist dann daneben sichtbar durchgestrichen, die Angabe widerspricht der Seite
also nicht.

Falls du willst, dass Google im August die 249 € übernimmt, müsste der
Angebotspreis fest im Dokument stehen statt über das Skript. Das hat einen
Preis: fällt das Skript aus oder wird es vergessen, steht der Rabatt nach dem
31. August weiter da. Eine abgelaufene Preisangabe ist irreführende Werbung.
Ich habe deshalb die sichere Richtung gewählt. Sag Bescheid, wenn du es im
August anders willst — dann trage ich es für den Monat fest ein und nehme es
am 1. September wieder heraus.


### D0 · „Über uns" fehlt als Seite

Der Menüpunkt war für die neue Navigation vorgesehen, ist aber **bewusst
weggelassen**: Es gibt keine Seite und keinen Inhalt dazu, und erfinden darf
ich nichts. Die Navigation führt deshalb auf **Start, Preise, FAQ, Kontakt**.

Zwei Dinge musst du dafür entscheiden:

1. **Was steht drauf?** Ein Über-uns-Text für einen Ein-Personen-Betrieb
   nennt üblicherweise die Person — Name, Werdegang, vielleicht ein Foto.
2. **Das kollidiert mit deiner Vorgabe**, dass Nachname und Anschrift nicht
   über Google oder Antwortsysteme auffindbar sein sollen. Eine indexierbare
   Seite mit deinem Namen hebt genau das auf.

Möglich wäre ein Text, der ohne Personenangaben arbeitet: Arbeitsweise,
Zielgruppe, Haltung. Dann bleibt die Sperre wirksam. Sobald du den Text
hast, baue ich die Seite und ergänze den Menüpunkt.

### D0b · Zwei Namen für dieselbe Sache

Auf der Fragenseite stehen jetzt alle 46 Fragen zusammen — und damit fällt
auf, dass dieselbe Leistung zwei Namen trägt:

| Startseite | Preisseite |
|---|---|
| Kurzcheck | Kostenlose Erstanalyse |
| Ausführlicher Check-up | Pro Website-Analyse |

Beide Fassungen stammen aus deinen Texten, deshalb habe ich **nichts
umformuliert**. In der Gruppe „Grundsätzliches" steht die eine Sprache, in
„Website-Analyse" die andere. Sag mir, welches Paar gilt, dann ziehe ich es
über alle Seiten durch. Eigenmächtig freigegebene Texte zu überschreiben
wäre der falsche Weg.

### D1 · Anrede — Du oder Sie

Die ganze Seite ist durchgehend **Du und Wir**, so steht es auch in den
Projektanweisungen. **Deine eigenen Beispieltexte waren aber Sie und Ich.**

Das ist kein Detail: Es betrifft jeden Satz auf fünf Seiten. Solange du
nichts sagst, bleibt es bei Du und Wir. Eine Umstellung ist möglich, aber
sie ist ein eigener Auftrag und keine Nacharbeit.

### D2 · Instagram passt farblich nicht mehr

`@vio.web` ist dunkel gehalten. Die Website ist seit der Überarbeitung
hell. Wer beides nacheinander sieht, merkt den Bruch.

Zwei Wege: das Profil nachziehen, oder bewusst zwei Auftritte fahren. Das
ist eine Markenentscheidung, keine technische.

### D3 · Firmenzeichen ~~hat keine helle Variante~~ — erledigt

Du hast die Wortmarke geliefert: `img/wortmarke.png`, dunkler Schriftzug auf
transparentem Grund. Damit ist die dunkle Notkachel entfallen, die das alte
Zeichen mit seiner weißen Hälfte gebraucht hatte. Die Marke steht jetzt
unverändert auf hellem Grund.

**Zwei Kleinigkeiten bleiben dazu offen:**

1. `img/zeichen.webp` (30 KB) wird von keiner Seite mehr geladen. Es steckt
   noch in `README.md` und `SEO.md` als Beschreibung des alten Stands. Ich
   habe die Datei nicht gelöscht, weil du sie vielleicht anderswo nutzt —
   sag Bescheid, dann fliegt sie raus.
2. Die Wortmarke ist ein PNG mit 28 KB. Als WebP wären es schätzungsweise
   unter 10 KB. Ich habe **nicht** umgewandelt, weil du „ausschließlich das
   Original" und „nicht verändern" geschrieben hast. Ein Formatwechsel ohne
   Änderung am Bild wäre möglich — dein Wort genügt.
3. Für dunkle Flächen gibt es weiterhin keine Variante. Aktuell braucht es
   keine: die Marke kommt nur auf hellem Grund vor. Sollte sie einmal auf
   ein dunkles Band sollen, brauche ich eine helle Fassung.

---

## E · Doku beschreibt teilweise den alten Stand

Die Website ist korrekt, ihre Beschreibung war es an fünf Stellen nicht.
**Drei davon sind inzwischen erledigt**, im Zuge der Umarbeitung gegen die
Vorlagen-Anmutung.

| Datei | Stand |
|---|---|
| `CLAUDE.md` „Gestaltung in drei Sätzen" | **erledigt.** Hell statt dunkel, aktuelle Farbwerte, und die Regel „ein Akzent pro Abschnitt" ist ersetzt — sie hatte den kritisierten Zustand erzeugt |
| `vioweb-designrichtlinien.md` Fokusrahmen und Prüfliste | **erledigt.** Aktuelle Farbwerte, dazu neue Prüfpunkte gegen Geviertstriche und Kurzsatz-Pointen |
| `vioweb-designrichtlinien.md` Satzmaß | **erledigt.** Die `ch`-Falle ist dokumentiert, samt Faktor 1,32 |
| `README.md` Schriften-Abschnitt | **offen.** Behauptet „Die Seite nutzt Systemschriften, es wird keine Schriftdatei geladen". Tatsächlich Manrope, lokal, zwei `.woff2`. Die Anleitung „Später auf eigene Schriftdateien umstellen" ist längst erledigt |
| `README.md` Farben-Abschnitt | **offen.** Nennt `#9B54FC` und `#6226FA` „auf dem dunklen Grund". Beide Werte gibt es nicht mehr, aktuell ist `--akzent: #7C3AED` |

Dazu: Die Größenangabe „138 KB auf sechs Anfragen" in der README stammt aus
der dunklen Fassung und ist seit dem Umbau nicht neu gemessen.

---

## F · Erst nach dem Livegang messbar

Diese Werte sind **absichtlich leer** in `LAUNCH_CHECKLIST.md`.

Lighthouse hier zu messen würde Zahlen erzeugen, die nichts bedeuten: Der
lokale Testserver liefert ohne Kompression und ohne Zwischenspeicher aus.
Das Ergebnis wäre schlechter als die Wirklichkeit auf GitHub Pages — und
eine erfundene gute Zahl wäre schlimmer.

- [ ] Lighthouse mobil — Performance / Accessibility / Best Practices / SEO
- [ ] Lighthouse Desktop — dieselben vier Werte
- [ ] PageSpeed Insights, Felddaten nach vier Wochen
- [ ] HTML-Validator <https://validator.w3.org/>
- [ ] CSS-Validator <https://jigsaw.w3.org/css-validator/>

Ebenfalls erst am echten Gerät sinnvoll: Safari auf iOS (besonders
Off-Canvas-Menü und Scroll-Sperre) und ein Durchgang mit VoiceOver oder
NVDA. Automatisiert ist in Chromium geprüft, das ersetzt beides nicht.

---

## G · Bewusst nicht gebaut

**Reichweitenmessung — derzeit keine.**

Die Seite wirbt damit, keinen einzigen fremden Server anzufragen. Google
Analytics würde ein Einwilligungsbanner erzwingen und damit die Kernaussage
der Marke widerlegen.

Wenn Statistik dazukommen soll, ist das ein eigener Auftrag: Plausible oder
Matomo mit EU-Hosting, Eintrag in der Datenschutzerklärung, Prüfung ob eine
Einwilligung nötig wird.

---

## Was nicht offen ist

Damit die Liste nicht länger wirkt als sie ist — geprüft und erledigt:

- Null Anfragen an fremde Server, auf allen fünf Seiten
- Kontrast durchgehend über dem geforderten Wert, Formularrahmen nach
  WCAG 1.4.11 auf 3:1 gebracht
- Tastaturbedienung komplett, Fokusrückgabe aus dem Menü
- Formular in allen drei Wegen, Honeypot bricht still ab
- Kein horizontaler Überlauf von 320 bis 2560 px
- Aufmacher über 19 Fensterbreiten geprüft: Umbruch am Sinn-Scharnier,
  Akzentphrase nie getrennt, keine Einzelwörter in letzten Zeilen
- Reduzierte Bewegung blendet keinen Inhalt aus
- JSON-LD auf allen fünf Seiten gültig
- Favicons, Vorschaubild, Manifest, Canonical vollständig
