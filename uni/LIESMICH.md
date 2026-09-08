# Campus — Prototyp unter /uni

Ein klickbarer Frontend-Prototyp einer Studentenplattform. Er liegt in
diesem Ordner und ist vollständig von der Website vioweb.de getrennt.

> **Zwei Sorten Daten, streng getrennt.** Die Studienstruktur
> (Hochschulen, Studiengänge, Lehramtsrichtungen, Fächer) ist aus
> öffentlichen Hochschulquellen recherchiert und trägt ihre Adresse.
> Alles andere — Modulnamen, Dozenten, Räume, Zeiten, Beiträge, Preise —
> ist erfunden und in der Oberfläche als Musterdaten gekennzeichnet.
> Kein Konto, kein Server, keine Zahlung.

---

## Warum es so gebaut ist

vioweb.de liegt statisch auf GitHub Pages: kein Server, kein Build, kein
npm, keine Bibliotheken, keine Anfragen an fremde Server. Der Prototyp
hält sich an dieselben Grenzen — sonst wäre er auf dieser Domain nicht
lauffähig und würde das Versprechen der Website brechen.

Daraus folgt:

- **Keine Bibliothek, kein Framework.** Acht eigene Skriptdateien,
  ein Stylesheet.
- **Routing ohne Server.** Unter jeder Adresse liegt eine echte
  `index.html`. Alle sind gleich aufgebaut; welche Ansicht erscheint,
  entscheidet der Router im Browser anhand der Adresse. Direktaufruf und
  geteilter Link funktionieren dadurch genauso wie die Navigation in der
  App. Die Hüllen erzeugt `seiten.sh`.
- **Schrift aus dem Projekt.** Manrope liegt bereits unter `/fonts/`.
  Für die Überschriften kommt ein System-Serif-Stack zum Einsatz —
  Magazincharakter ohne eine einzige zusätzliche Anfrage.
- **Ein Stylesheet, blockierend geladen.** Die Oberfläche wird im
  Browser aufgebaut; ein nachgeladenes CSS würde sie sichtbar springen
  lassen. Die Datei wird einmal zwischengespeichert und gilt dann für
  alle Seiten der App.

## Was die Website davon merkt: nichts

- Eigene Klassennamen mit Präfix `u-`, eigener Wertesatz, eigenes
  Stylesheet. Keine Überschneidung mit `css/seite.css` oder
  `js/seite.js`.
- `wartung.sh` fasst nur seine feste Seitenliste an. `/uni` steht nicht
  darin und bleibt beim Umschalten unberührt — der Prototyp ist also
  auch erreichbar, während die Website im Wartungsmodus steht.
- **Kein Eintrag in `sitemap.xml`.** Jede Seite trägt
  `noindex,nofollow`. In `robots.txt` steht bewusst **kein** `Disallow`:
  was nicht gecrawlt werden darf, liest das noindex nie.

---

## Dateien

```
uni/
  index.html                    Home
  studium/  kalender/  entdecken/  flohmarkt/
  profil/  inbox/  suche/  onboarding/
  modul/<slug>/                 Modul-Hub
  material/<slug>/              Produktseite
  service/<slug>/               Serviceseite
  flohmarkt/<slug>/             Artikelseite

  css/app.css                   Werte, Bausteine, Ansichten, Schreibtisch
  js/daten.js                   Datumshilfen und ein Fenster auf beide Quellen
  js/hochschuldaten.js          Struktur aus öffentlichen Hochschulquellen
  js/musterdaten.js             alles Erfundene, klar getrennt
  js/zustand.js                 der eine Nutzerzustand (localStorage)
  js/abfragen.js                Filtern, Sortieren, Suchen, Sichtbarkeit
  js/bausteine.js               wiederverwendbare Bausteine
  js/ansichten.js               eine Funktion je Seite
  js/app.js                     Router, Kopf, Tableiste, Schnellmenü

  seiten.sh                     erzeugt die Hüllen neu
  LIESMICH.md                   diese Datei
```

Kommt in `js/daten.js` ein Modul, ein Material, ein Service oder ein
Artikel dazu, gehört der Slug in die Liste in `seiten.sh`, und das
Skript wird einmal ausgeführt.

---

## Datenmodell

Zwei Dateien, streng getrennt:

**`js/hochschuldaten.js`** — Angaben aus öffentlichen Hochschulquellen.
Jeder Datensatz trägt `herkunft` und `quelle { name, url, abgerufen }`.

```
hochschulen     id · name · ort · land · web · angebotErfasst
studiengaenge   id · hochschule · abschluss · fakultaet · braucht{} · moduleErfasst
lehramtstypen   id · hochschule · studiengang · faechermodell · klassen
faechermodelle  art · anzahl · gruppen[] | kernfach[] | lernbereiche[]
faecher         id · name
anbieter        id · status · liefert[] · beschreibung · offen
```

**`js/musterdaten.js`** — alles Erfundene, `herkunft: 'muster'`.

```
module          slug · studiengang · lehramtstyp · fach · gruppe · semester · plan[]
materialien     slug · modul · verkaeufer
services        slug · module[] · anbieter
flohmarkt       slug · hochschule · verkaeufer
campus          slug · hochschule · quelle · herkunft
feed            id   · modul | fach | studiengang | (hochschulweit)
```

Herkunftsstufen: `offiziell` (maschinell aus einer offiziellen Quelle),
`recherchiert` (von Hand aus öffentlichen Seiten, mit Adresse und Datum),
`gemeinschaft` (von Studenten eingetragen, vorbereitet) und `muster`.
Im Prototyp kommen `recherchiert` und `muster` vor.

## Personalisierung

Die Kette ist datengesteuert, nicht fest verdrahtet:

```
Nutzer → Hochschule → Studiengang → (Lehramtstyp) → (Fächer) → Semester → Module
```

Welche Ebenen ein Studiengang braucht, steht an ihm selbst:

```js
braucht: { lehramtstyp: true, faecher: true }   // Lehramt
braucht: {}                                      // Wirtschaftswissenschaften
```

Das Onboarding baut seine Schritte daraus. Ein WiWi-Student sieht
keinen Lehramtsschritt, und die Fortschrittsanzeige zählt die
tatsächlichen Schritte — nichts daran ist fest verdrahtet.

**Empfehlung ist nicht Belegung.** `empfohleneModule()` sagt, was laut
Studienstruktur zum Semester passt. `module()` sind die Module, die der
Nutzer im letzten Onboarding-Schritt bestätigt hat. Wer ein Modul
herausnimmt, sieht es nirgends mehr.

**Vier Reichweiten** entscheiden über jeden Inhalt:

| Reichweite | sichtbar für |
|---|---|
| modulbezogen | wer das Modul belegt |
| fachbezogen | wer dieses Fach gewählt hat |
| studiengangbezogen | alle im selben Studiengang |
| hochschulweit | alle an der eigenen Hochschule |

**Es wird nie auf einen anderen Studiengang ausgewichen.** Fehlt eine
Modulstruktur, kommt ein leerer Zustand mit zwei Wegen nach vorn.

## Lehramt

Der Ablauf hat einen eigenen Schritt vor der Fächerwahl:

```
Hochschule → Lehramt → Schulart → Fächer → Semester → Module bestätigen
```

Welche Schularten es gibt, hängt an der Hochschule — die Liste steht
nicht global im Code. Für die Universität Leipzig sind fünf erfasst:
Grundschule, Oberschule, Gymnasium, Sonderpädagogik und berufsbildende
Schulen.

**Wie die Fächer gewählt werden, hängt an der Schulart.** Das ist der
Kern: ein Modell „zwei Fächer für alle“ wäre schlicht falsch.

| Schulart | Modell | Auswahl |
|---|---|---|
| Gymnasium | `gruppen` | zwei Fächer, mindestens eines aus Gruppe 1; Gruppe-2-Fächer nicht miteinander; Musik als Sonderfall |
| Oberschule | `gruppen` | zwei Fächer nach derselben Regel, eigene Fächerliste |
| Grundschule | `kernfach` | **ein** Kernfach, dazu die festen Grundschuldidaktiken Deutsch, Mathematik, Sachunterricht und ein kleines Wahlfach |
| Sonderpädagogik | `gemischt` | ein Unterrichtsfach; die Förderschwerpunkte sind **nicht erfasst** und werden deshalb nicht abgefragt |
| Berufsbildende Schulen | — | Struktur nicht erfasst, wird nicht erfunden |

Die Kombinationsregel wird geprüft: „Weiter“ bleibt gesperrt, solange
die Auswahl unvollständig oder unzulässig ist, mit Klartext daneben.

Die Module eines Lehramtsstudenten entstehen aus vier Gruppen:
`bildungswissenschaften` (für jede Schulart), `schulart` (die
Lernbereiche der Grundschuldidaktik), `fachwissenschaft` und
`fachdidaktik` (je gewähltem Fach) sowie `praktikum`. Grundschule und
Gymnasium bekommen dadurch nachweislich verschiedene Module.

## Öffentliche Hochschuldaten

Pilot ist die **Universität Leipzig**. Recherchiert und mit Adresse
hinterlegt sind: das Studienangebot, die fünf Lehramtsrichtungen, die
Fächergruppen für Gymnasium und Oberschule, das Kernfach-Modell der
Grundschule und das Unterrichtsfach der Sonderpädagogik.

Quellen (Stand siehe `geprueft` in `hochschuldaten.js`):

- [Studienangebot](https://www.uni-leipzig.de/studium/vor-dem-studium/studienangebot)
- [Aufbau des Lehramtsstudiums](https://www.uni-leipzig.de/studium/vor-dem-studium/aufbau-des-studiums/lehramt)
- [Lehramt an Gymnasien](https://www.uni-leipzig.de/studium/im-studium/lehramtsstudium/lehramt-an-gymnasien)
- [Lehramt an Oberschulen](https://www.uni-leipzig.de/studium/im-studium/lehramtsstudium/lehramt-an-oberschulen)
- [Lehramt an Grundschulen](https://www.uni-leipzig.de/studium/im-studium/lehramtsstudium/lehramt-an-grundschulen)
- [Wirtschaftswissenschaften B. Sc.](https://www.uni-leipzig.de/studium/vor-dem-studium/studienangebot/studiengang/course/show/wirtschaftswissenschaften-b-sc)
- [Studiendokumente der Wirtschaftswissenschaftlichen Fakultät](https://www.wifa.uni-leipzig.de/studium/studienorganisation/studiendokumente)

Für die übrigen vier Hochschulen ist **nichts erfasst**. Sie zeigen im
Onboarding einen eigenen Schritt mit Verweis auf ihre Startseite — statt
Studiengänge zu erfinden.

### Anbieter statt Scraper

`hochschuldaten.js` führt eine Liste von Anbietern mit Status. Ein neuer
kommt als Eintrag dazu; die App fragt nur über `lade()` an.

| Anbieter | Status | Warum |
|---|---|---|
| Statischer Import | aktiv | von Hand recherchiert, mit Adresse und Datum |
| Modulhandbücher | vorbereitet | öffentlich als PDF; Abruf aus dieser Umgebung nicht möglich |
| Vorlesungsverzeichnis (AlmaWeb) | blockiert | Sitzungsadressen mit Token, keine stabile öffentliche Adresse je Veranstaltung, keine dokumentierte Schnittstelle |
| Newsportal | vorbereitet | öffentlich; Feed-Format nicht bestätigt, Abruf nicht möglich |
| HISinOne / LSF | offen | je Hochschule zu prüfen: Zugang, robots.txt, Nutzungsbedingungen |

> **Wichtig:** Aus dieser Entwicklungsumgebung sind die Hochschulserver
> nicht erreichbar — weder per HTTP noch über den Seitenabruf. Die
> Struktur oben stammt deshalb aus der Websuche und ist als
> `recherchiert` gekennzeichnet, nicht als `offiziell`. Vor einem echten
> Start gehört jede Adresse und jede Angabe einmal am Original geprüft.

## Quellen in der Oberfläche

Inhalte tragen `quelle { name, url, abgerufen }`.

- **Mit Adresse** entsteht ein echtes `<a>` mit `target="_blank"` und
  `rel="noopener noreferrer"`, klein und dezent unter dem Inhalt.
  Es zeigt auf die Originalseite, nicht auf eine Kopie.
- **Ohne Adresse** steht die Quelle als Text da, mit dem Zusatz
  „Musterdaten“. Es wird kein Link erfunden.

Quellenverweise stehen im Onboarding (Studienangebot, Schularten,
Fächermodell), im Studium-Bereich (Studiengang und Studiendokumente),
auf Campus-Beiträgen und auf Modulseiten.

Auf jeder Modulseite steht sichtbar, dass Modulname, Zeiten und Beiträge
Musterdaten sind, und welche Angaben **nicht hinterlegt** sind. Wo kein
Dozent bekannt ist, steht keiner — auch kein erfundener.

---

## Routen

| Adresse | Was |
|---|---|
| `/uni/` | Home: Heute, Module, Feed, Entdecken |
| `/uni/studium/` | Semester-Dashboard, Module, frühere Semester |
| `/uni/modul/<slug>/` | Modul-Hub, Reiter `?reiter=feed\|lernen\|termine\|dateien` |
| `/uni/kalender/` | Wochenansicht, `?tag=JJJJ-MM-TT` |
| `/uni/entdecken/` | `?bereich=campus\|materialien\|services\|flohmarkt` |
| `/uni/material/` und `/uni/material/<slug>/` | Liste und Produktseite |
| `/uni/service/` und `/uni/service/<slug>/` | Liste und Serviceseite |
| `/uni/flohmarkt/` und `/uni/flohmarkt/<slug>/` | Liste und Artikelseite |
| `/uni/profil/` | `?bereich=…`, fremdes Profil über `?person=…` |
| `/uni/inbox/` | Liste, einzelner Chat über `?chat=…` |
| `/uni/suche/` | `?q=…&art=modul\|material\|leute` |
| `/uni/onboarding/` | drei Fragen beim ersten Aufruf |

Der gesamte Ansichtszustand steht in der Adresse: Reiter, Filter,
Kalenderwoche, Suchtext. Dadurch ist jede Ansicht teilbar und der
Zurück-Knopf des Browsers funktioniert.

---

## Was wirklich funktioniert

Datengesteuertes Onboarding mit dynamischer Schrittzahl · Lehramtsablauf
mit Schulart, Fächermodell und Kombinationsregel · Bestätigung der
eigenen Module · Navigation ohne Neuladen · Module anpinnen, hinzufügen,
wieder ableiten · Reiter · Filter und Sortierung · Materialien merken ·
Verkäufern folgen · Checklisten auf Abgaben · Kalenderwoche blättern ·
globale Suche über Module, Studiengänge, Materialien, Leute, Campus,
Services und Flohmarkt · Chat mit eigener Antwort · Schnellmenü ·
Quellenverweise · helles und dunkles Erscheinungsbild ·
Benachrichtigungsstufe · Prototyp zurücksetzen.

## Was ausdrücklich Attrappe ist

Nichts davon täuscht eine Funktion vor; überall steht ein Hinweis:

- **Alle Modulnamen, Dozenten, Räume, Zeiten, Beiträge, Materialien,
  Preise und Bewertungen.** Sie stehen in `musterdaten.js` und sind in
  der Oberfläche als Musterdaten gekennzeichnet.
- **Zahlung.** Kein Zahlungsanbieter angebunden.
- **Verifizierung.** Es wird keine E-Mail verschickt.
- **Hochladen**, **Kalender-Abgleich**, **offizielle Hochschultermine**,
  **Push**: vorbereitet, nicht angebunden.

## Was noch fehlt

- Ein echter Import. Modulhandbücher und Newsportal sind als Anbieter
  vorbereitet, aber nicht abgerufen (siehe Tabelle oben).
- Weitere Hochschulen. Jede braucht ihre eigene Recherche; die Struktur
  nimmt sie ohne Umbau auf.
- Förderschwerpunkte der Sonderpädagogik und die Struktur der
  berufsbildenden Schulen.
- Community-Beiträge sind noch nicht bedienbar; Konflikte zwischen
  offiziellen und Community-Angaben sind im Modell vorgesehen
  (`herkunft`), aber noch nicht ausgespielt.
- Deduplizierung gleicher Module aus mehreren Quellen — dafür sind
  Modulnummer, Hochschule und Studiengang als Schlüssel vorgesehen.

## Gestaltung

Eigene Identität, nicht die der Website vioweb.de:

| Zweck | Hell | Dunkel |
|---|---|---|
| Grund | `#F3EFE7` | `#15140F` |
| Fläche | `#FFFDF8` | `#1D1B16` |
| Text | `#171713` | `#F3EFE4` |
| Gedämpft | `#757165` | `#A49D8C` |
| Linie | `#D8D1C3` | `#35312A` |
| Marke | `#1E4636` | `#7FC6A2` |

Die Modulfarben sind der einzige laute Teil der Oberfläche: neun
kräftige Töne, je Modul einer, als volle Fläche auf Karten und
Modulkopf. Alles andere bleibt ruhig.

Überschriften stehen in einer Serifenschrift, Bedienung und Fließtext in
Manrope. Karten sind kantig (6 bis 14 px), Knöpfe rund. Am Schreibtisch
wandert die Tableiste nach links; die Inhaltsspalte wird **nicht** auf
die volle Breite gezogen.

## Zugänglichkeit

Semantisches HTML, `<button>` für Handlungen und `<a>` für Wege,
sichtbarer Fokusrahmen, Sprungmarke, Klickflächen ab 44 px, Fokusfang im
Schnellmenü, Escape schließt, `prefers-reduced-motion` schaltet jede
Bewegung ab. Ohne JavaScript erscheint ein Hinweis statt einer leeren
Seite.

## Prüfen

```
python3 -m http.server 8080     # im Wurzelverzeichnis des Projekts
```

Dann `http://localhost:8080/uni/` aufrufen. Geprüft wurde bei 390, 768
und 1280 px: kein waagerechter Überlauf, keine Fehler in der Konsole,
**null Anfragen an fremde Server**.

Drei Nutzerfälle gehören zu jeder Änderung an der Personalisierung:

| Nutzer | Angaben | Erwartung |
|---|---|---|
| A | Maurice · Wirtschaftswissenschaften · 3 | WiWi-Module und -Feed, Anrede mit Namen |
| B | Anna · Lehramt Gymnasium · Deutsch + Geschichte · 3 | Bildungswissenschaften, Praktikum, Fachwissenschaft und Fachdidaktik beider Fächer; kein WiWi, keine Grundschuldidaktik |
| B2 | Lehramt Grundschule · Kernfach Deutsch · 3 | Lernbereiche der Grundschuldidaktik statt zweitem Fach — nachweislich andere Module als B |
| C | Rechtswissenschaft · 3 | leerer Zustand, kein Ersatz aus einem anderen Studiengang |
| D | ohne Vornamen | „Guten Morgen“ ohne Namen |
| E | TU Dresden | Hinweis auf fehlendes Studienangebot mit Verweis auf die Hochschule |

Dazu ein Quellen-Test: jeder Quellenlink führt auf eine echte
`https`-Adresse, öffnet in einem neuen Tab, trägt
`rel="noopener noreferrer"`, und keine Musterquelle ist verlinkt.
