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
  js/zustand.js                 alles, was der Nutzer ändert (localStorage)
  js/abfragen.js                Filtern, Sortieren, Suchen
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

Onboarding · Navigation ohne Neuladen · Module anpinnen und lösen ·
Module hinzufügen · Reiter · Filter und Sortierung · Materialien merken ·
Verkäufern folgen · Checklisten auf Abgaben · Kalenderwoche blättern ·
globale Suche über alle Sammlungen · Chat mit eigener Antwort ·
Schnellmenü mit Formularen · helles und dunkles Erscheinungsbild ·
Benachrichtigungsstufe · Prototyp zurücksetzen.

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
  der Prototyp zeigt nur eine.

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
