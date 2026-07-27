# Was noch offen ist

Stand 27.07.2026, Zweig `claude/vioweb-master-prompt-x2381g`.

Die Website ist gebaut und geprüft. Was hier steht, ist **nicht fertig** —
sortiert danach, wer es erledigen kann.

| Bereich | Punkte | Wer |
|---|---|---|
| A · Blocker vor dem Livegang | 5 | du |
| B · Angaben, die nur du hast | 13 Platzhalter | du |
| C · Einrichtung bei Dritten | 4 | du |
| D · Offene Entscheidungen | 3 | du, dann ich |
| E · Doku stimmt nicht mehr | 5 | ich |
| F · Erst nach Livegang messbar | 5 | nach dem Umzug |
| G · Bewusst nicht gebaut | 1 | — |

---

## A · Blocker — ohne diese Punkte kein Livegang

### A1 · `robots.txt` sperrt die Seite

```
User-agent: *
Disallow: /
```

Das ist Absicht, solange nichts live ist. **Bleibt die Zeile stehen, nimmt
Google die Seite nie in den Index auf** — auch nicht Wochen später. Vor dem
Livegang durch `Allow: /` ersetzen und den Warnblock darüber löschen.

### A2 · Impressum enthält Platzhalter

Ein Impressum mit Platzhaltern ist abmahnfähig. Details in Abschnitt B.

### A3 · Datenschutzerklärung enthält Platzhalter

Dazu eine Besonderheit: Der Absatz über den Formulardienst nennt einen
Dienst, der noch nicht eingerichtet ist.

> **Solange kein Formulardienst läuft, muss dieser Absatz gelöscht werden.**
> Eine Erklärung, die einen ungenutzten Dienst nennt, ist genauso falsch
> wie eine, die einen genutzten verschweigt.

### A4 · Zwei orange Warnkästen sind noch sichtbar

Je einer in `impressum.html` und `datenschutz.html`, dazu ein Warnhinweis
als Kommentar am Dateianfang. Alle vier Stellen zum Schluss entfernen.

### A5 · E-Mail-Adresse ist eine Annahme

Überall steht `kontakt@vioweb.de`. Die Domain war vorgegeben, der Teil
davor nicht. **Bitte bestätigen oder korrigieren.**

| Datei | Stellen |
|---|---|
| `index.html` | 6 — Formular (`data-mail`), `noscript`-Rückfall, Fußzeile, JSON-LD |
| `datenschutz.html` | 2 |
| `impressum.html` | 1 |
| `danke.html` | 1 |

Warum eine Annahme statt eines Platzhalters: Ohne funktionierende Adresse
wäre der E-Mail-Rückfall des Formulars tot. Ein totes Formular war
ausgeschlossen, also stand hier eine plausible Adresse statt einer Lücke.

---

## B · Angaben, die nur du hast

13 Platzhalter in drei Dateien. Im Quelltext als `[GROSSBUCHSTABEN IN
KLAMMERN]`, auf der Seite lila unterlegt — sie sind also nicht zu übersehen.

### `impressum.html` — 8 Stellen

| Platzhalter | Woher | Anzahl |
|---|---|---|
| `[VOR- UND NACHNAME]` | — | 2 |
| `[STRASSE UND HAUSNUMMER]` | ladungsfähige Anschrift, **kein Postfach** | 1 |
| `[POSTLEITZAHL]` | Torgau | 1 |
| `[TELEFONNUMMER]` | § 5 DDG verlangt ein zweites schnelles Kontaktmittel | 1 |
| `[STEUERNUMMER]` | Finanzamt | 1 |
| `[ANSCHRIFT WIE OBEN]` | Wiederholung beim Verantwortlichen | 1 |
| `[E-MAIL PRUEFEN]` | siehe A5 | 1 |

Bist du **umsatzsteuerpflichtig**, muss der Kleinunternehmer-Absatz durch
die Umsatzsteuer-Identifikationsnummer nach § 27a UStG ersetzt werden.

### `datenschutz.html` — 9 Stellen

Name, Anschrift, Postleitzahl und Telefonnummer wie im Impressum. Zusätzlich:

| Platzhalter | Woher |
|---|---|
| `[NAME DES FORMULARDIENSTES]` | siehe C1 |
| `[ANBIETER UND ANSCHRIFT]` | Impressum des Dienstes |
| `[SERVERSTANDORT]` | aus dem Vertrag |
| `[SPEICHERDAUER, ZUM BEISPIEL 12 MONATE]` | deine Entscheidung, üblich sind 6 bis 12 Monate |
| `[DATUM EINTRAGEN]` | Datum des Livegangs |

### `index.html` — 2 Stellen

Im JSON-LD für Suchmaschinen: `[STRASSE UND HAUSNUMMER EINTRAGEN]` und
`[POSTLEITZAHL EINTRAGEN]`. Der Ort steht bereits als `Torgau` drin.

> Suchmaschinen bewerten eine unvollständige Anschrift schlechter als gar
> keine. Willst du die Anschrift **nicht** öffentlich im Datenblock haben,
> sag Bescheid — dann nehme ich den `PostalAddress`-Block heraus und lasse
> nur das Einzugsgebiet stehen. Im Impressum bleibt die Anschrift
> Pflicht, das ist davon unabhängig.

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

`lastmod` in `sitemap.xml` steht auf `2026-07-27` und muss auf das
Livegang-Datum. Danach Search Console anmelden, Sitemap einreichen,
Startseite zur Indexierung anfordern.

---

## D · Entscheidungen, die ich nicht treffen kann

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

### D3 · Firmenzeichen hat keine helle Variante

Das Zeichen hat eine **weiße Hälfte**, die auf dem hellen Grund `#F7F7FA`
verschwindet. Ich habe das Layout angepasst statt das Zeichen zu ändern:
Es sitzt auf einer dunklen Kachel.

Das ist eine Notlösung, die funktioniert. **Sauber wäre eine zweite
Zeichendatei für helle Hintergründe.** Die kann ich nicht erfinden — dafür
bräuchte ich die Vorlage oder deine Freigabe, das Zeichen anzupassen.

---

## E · Doku beschreibt teilweise den alten Stand

Beim Zusammentragen dieser Liste aufgefallen. Die Website selbst ist
korrekt — die Beschreibung dazu ist es an fünf Stellen nicht mehr. Das
räume ich auf, sobald du grünes Licht gibst; es ändert nichts an der Seite.

| Datei | Behauptet | Tatsächlich |
|---|---|---|
| `README.md` Z. 215 | „Die Seite nutzt **Systemschriften**, es wird keine Schriftdatei geladen" | Manrope, lokal, zwei `.woff2` |
| `README.md` Z. 229 | Anleitung „Später auf eigene Schriftdateien umstellen" | längst erledigt, Abschnitt überflüssig |
| `README.md` Z. 250 | Akzent `#9B54FC` für Text, `#6226FA` für Flächen, „auf dem dunklen Grund" | hell, `--akzent: #7C3AED` |
| `CLAUDE.md` Z. 51 | „**Dunkel**, linksbündig, typografisch" samt beider alter Lila | hell |
| `vioweb-designrichtlinien.md` Z. 279, 313 | Fokusrahmen `#9B54FC`, Prüfpunkt zu `#6226FA` | beide Werte gibt es nicht mehr |

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
