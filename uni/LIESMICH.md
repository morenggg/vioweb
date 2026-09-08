# Campus — Prototyp unter /uni

Ein klickbarer Frontend-Prototyp einer Studentenplattform. Er liegt in
diesem Ordner und ist vollständig von der Website vioweb.de getrennt.

> **Alles hier ist Muster.** Keine echten Studenten, keine echten
> Dozenten, keine echten Preise, keine Zahlung, kein Konto, kein Server.

---

## Warum es so gebaut ist

vioweb.de liegt statisch auf GitHub Pages: kein Server, kein Build, kein
npm, keine Bibliotheken, keine Anfragen an fremde Server. Der Prototyp
hält sich an dieselben Grenzen — sonst wäre er auf dieser Domain nicht
lauffähig und würde das Versprechen der Website brechen.

Daraus folgt:

- **Keine Bibliothek, kein Framework.** Sechs eigene Skriptdateien,
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
  js/daten.js                   Musterdaten (später: Schnittstelle)
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

Sieben Sammlungen, über Schlüssel verbunden. Alles steht in
`js/daten.js`, nichts ist in der Oberfläche fest verdrahtet.

```
hochschulen    id · name · ort · web
studiengaenge  id · name · abschluss · faecher[]
module         slug · studiengang · fach · semester · plan[]
materialien    slug · modul · verkaeufer
services       slug · module[] · anbieter
flohmarkt      slug · hochschule · verkaeufer
campus         slug · hochschule · quelle{name,url} · muster
feed           id   · modul | studiengang | (hochschulweit)
nachrichten    id   · partner · bezug
```

Termine entstehen aus dem `plan` jedes Moduls, für 14 Wochen rund um
den heutigen Tag. Der Prototyp zeigt dadurch immer eine glaubwürdige
Woche.

## Personalisierung

Der Studiengang bestimmt die Inhalte wirklich — nicht nur die
Beschriftung.

**Die Modulliste ist normalerweise nicht gespeichert.** Sie ergibt sich
aus Studiengang, Fach und Semester:

```
Nutzer → Hochschule → Studiengang → (Fach) → Semester → Module
```

Erst wenn jemand selbst ein Modul hinzufügt oder entfernt, wird die
Liste festgeschrieben. Ein Wechsel des Studiengangs im Onboarding setzt
sie zurück; angepinnte Module, die nicht mehr passen, fallen weg. In den
Einstellungen lässt sich die eigene Auswahl wieder verwerfen.

**Drei Reichweiten** entscheiden über jeden Inhalt:

| Reichweite | sichtbar für |
|---|---|
| modulbezogen | wer das Modul belegt |
| studiengangbezogen | alle im selben Studiengang |
| hochschulweit | alle an der eigenen Hochschule |

Der Flohmarkt gilt nur für die eigene Hochschule. Digitale Materialien
und Services sind bewusst hochschulübergreifend — ein Lernzettel zur
Analysis hilft auch anderswo; der Modulbezug ist dort der eigentliche
Filter.

**Es wird nie auf einen anderen Studiengang ausgewichen.** Wer einen
Studiengang ohne hinterlegte Module wählt, bekommt einen leeren Zustand
mit zwei Wegen nach vorn: Modul hinzufügen oder Modul vorschlagen.

### Hinterlegte Studiengänge

| Studiengang | Module | Besonderheit |
|---|---|---|
| Betriebswirtschaftslehre | 16 | Semester 1 bis 4 |
| Lehramt | 7 + 3 Deutsch + 4 Mathematik | eigener Schritt für das Fach |
| Informatik | 7 | Semester 1 bis 3 |
| Psychologie | 7 | eigenes Statistik II, nicht das der BWL |
| Maschinenbau | 6 | Semester 1 und 3 |
| VWL, Jura, Wirtschaftsinformatik | keine | zeigen den leeren Zustand |

### Der Name

Der Name kommt aus dem Profil und wird im Onboarding erfragt. Er ist
**kein Pflichtfeld**: ohne Namen grüßt die App mit „Guten Morgen“ statt
mit einem erfundenen Namen. Kopf, Profil und Titel lesen denselben
Wert — im Markup steht kein Name.

## Quellen bei Campus-Inhalten

Campus-Einträge tragen `quelle: { name, url? }` und ein `muster`-Kennzeichen.

- **Mit Adresse** wird ein echter Verweis gerendert: `<a>` mit
  `target="_blank"` und `rel="noopener noreferrer"`, klein und dezent
  unter dem Beitrag. Verwendet werden ausschließlich die Startseiten der
  Hochschulen — je Hochschule ein Wegweiser-Eintrag, der nichts
  behauptet, sondern sagt, wo Fristen und Öffnungszeiten wirklich stehen.
- **Ohne Adresse** steht die Quelle als Text da, mit dem Zusatz
  „Musterdaten“. Es wird kein Link erfunden.

Erfundene Meldungen sollen nie wie echte Mitteilungen einer Hochschule
wirken. Deshalb steht über der Campus-Liste und unter der Startseite ein
sichtbarer Hinweis, und jede erfundene Quelle ist gekennzeichnet.

> Die hinterlegten Adressen sind die Startseiten der jeweiligen
> Einrichtungen. Vor einem echten Start gehören sie einmal geprüft.

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

Onboarding in vier bis fünf Schritten (Name, Hochschule, Studiengang,
Fach, Semester) · Ableitung der Module aus dem Studiengang · Navigation
ohne Neuladen · Module anpinnen, hinzufügen, wieder ableiten · Reiter ·
Filter und Sortierung · Materialien merken · Verkäufern folgen ·
Checklisten auf Abgaben · Kalenderwoche blättern · globale Suche über
alle Sammlungen mit Vorrang für eigene Module · Chat mit eigener Antwort ·
Schnellmenü mit Formularen · Quellenverweise · helles und dunkles
Erscheinungsbild · Benachrichtigungsstufe · Prototyp zurücksetzen.

Gespeichert wird in `localStorage`, nur in diesem Browser. Fällt der
Speicher aus (privates Fenster), läuft die App weiter und merkt sich
nichts.

## Was ausdrücklich Attrappe ist

Nichts davon täuscht eine Funktion vor; überall steht ein Hinweis:

- **Zahlung.** Kein Zahlungsanbieter angebunden. „Kaufen“ öffnet einen
  Hinweis und schaltet das Material auf Wunsch nur lokal frei.
- **Verifizierung.** Es wird keine E-Mail verschickt.
- **Hochladen.** Kein Speicher angebunden.
- **Kalender-Abgleich** mit Google und Apple: vorbereitet, nicht
  angebunden.
- **Offizielle Hochschultermine**, Push-Benachrichtigungen, Ruhezeiten:
  vorbereitet, nicht angebunden.
- **Formulare** im Schnellmenü sind vollständig bedienbar, senden aber
  nichts.

## Was noch fehlt

- Community: Kommentare, verschachtelte Antworten, „Hilfreich“ als
  Handlung. Die Beiträge zeigen die Zahlen, sind aber noch nicht
  bedienbar.
- Eigene Semesterübersicht statt der Trennung „laufend / früher“.
- Gebührenmodell. Die Datenstruktur lässt Preis und Gebühren je
  Produktart offen; festgelegt ist nichts.
- Mehrere Hochschulen gleichzeitig: die Daten sind darauf vorbereitet,
  Flohmarkt-Artikel liegen bisher nur für Leipzig vor.
- Weitere Studiengänge. Neue kommen als Eintrag in `studiengaenge` und
  ein paar Module dazu, sonst ändert sich nichts.
- Noten und eine echte Semesterhistorie. Frühere Semester zeigen den
  Modulkatalog, keine persönlichen Ergebnisse — die wären erfunden.

---

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
| A | Maurice · BWL · 3 | BWL-Module und BWL-Feed, Anrede mit Namen |
| B | Anna · Lehramt Deutsch · 3 | Lehramtsmodule, kein BWL, Anrede „Anna“ |
| C | ohne Namen · VWL · 3 | leerer Zustand, kein BWL als Ersatz, Anrede ohne Namen |
