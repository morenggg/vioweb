# KI-Sichtbarkeit und SEO

Stand 28.07.2026, Zweig `claude/vioweb-master-prompt-x2381g`.

Ziel: Die Seite soll von Google, Bing und Antwortsystemen wie ChatGPT Search
gecrawlt, verstanden und als Quelle zitiert werden können. Ohne
Keyword-Häufung, ohne erfundene Inhalte.

**Ausgangslage:** Statische Seite auf GitHub Pages, kein Build, kein
Framework, keine externen Ressourcen. Fünf HTML-Dateien, kritisches CSS
inline, JavaScript ausschließlich für den Formularversand. Der technische
SEO-Unterbau war bereits weitgehend vorhanden; der eine echte Blocker war
die vollständige Crawler-Sperre.

---

## A · Umgesetzt

### A1 · `robots.txt` geöffnet und differenziert · `robots.txt`

Vorher stand dort eine vollständige Sperre:

```
User-agent: *
Disallow: /
```

Jetzt gilt: Suchmaschinen und Antwortsysteme dürfen lesen und zitieren, reine
Trainingssammler nicht.

| Bot | Regel | Warum |
|---|---|---|
| `*` | Allow | Google, Bing und alle übrigen |
| `OAI-SearchBot` | Allow | ChatGPT Search, damit Vioweb als Quelle erscheinen kann |
| `PerplexityBot` | Allow | dasselbe für Perplexity |
| `GPTBot` | Disallow | reines Modelltraining, bringt keine Besucher |
| `CCBot` | Disallow | Common Crawl, Grundlage vieler Trainingssammlungen |
| `ClaudeBot` | Disallow | Modelltraining |

Zusätzlich sind die internen Markdown-Notizen und die Kurzcheck-Vorlage
ausgeschlossen, damit sie nicht im Index landen.

> **Eine Feinheit der Technik, die oft falsch gemacht wird:** Regeln
> verschiedener `User-agent`-Gruppen werden **nicht** zusammengeführt. Ein Bot
> befolgt nur die Gruppe, die am genauesten auf ihn passt. Die `Disallow`-Zeilen
> für die internen Notizen stehen deshalb in jeder erlaubenden Gruppe erneut.
> Stünden sie nur unter `*`, könnte OAI-SearchBot sie sehr wohl abrufen.

`Google-Extended` ist **bewusst nicht** gesperrt. Der Eintrag steuert bei
Google sowohl Training als auch das Heranziehen als Quelle in Gemini. Eine
Sperre würde also Zitate kosten. Die AI Overviews in der Google-Suche hängen
ohnehin am normalen Googlebot.

### A2 · Platzhalter-Anschrift aus den strukturierten Daten entfernt · `index.html`

Der wichtigste inhaltliche Fund. Im JSON-LD stand:

```json
"address": {
  "@type": "PostalAddress",
  "streetAddress": "[STRASSE UND HAUSNUMMER EINTRAGEN]",
  "postalCode": "[POSTLEITZAHL EINTRAGEN]",
  ...
}
```

Solange die Seite gesperrt war, war das folgenlos. Mit geöffneter `robots.txt`
hätte Google den Platzhaltertext als echte Anschrift übernommen. Der Block ist
entfernt.

Damit entfällt auch die Grundlage für den Typ `ProfessionalService`, einen
Untertyp von `LocalBusiness`, der eine vollständige öffentliche Anschrift
voraussetzt. Der Knoten ist jetzt nur noch `Organization`. Die räumliche
Einordnung trägt so lange `areaServed: Deutschland`, gestützt auf die
Fußzeile „Deutschlandweit, ansässig in Torgau".

Sobald die Anschrift feststeht, können beide Angaben ergänzt werden. Die
Stelle ist im Quelltext kommentiert.

### A3 · Open Graph auf allen Seiten · vier Unterseiten

`impressum.html`, `datenschutz.html`, `danke.html` und `404.html` hatten keine
Open-Graph-Angaben. Ergänzt wurden `og:type`, `og:site_name`, `og:locale`,
`og:url`, `og:title`, `og:description`, `og:image` samt Maßen und
Alternativtext sowie `twitter:card`. Es wird das bereits vorhandene Bild
`img/og-bild.png` (1200 × 630) verwendet, keine neue Datei erfunden.

### A4 · Zwei zu dünne Meta-Descriptions · `impressum.html`, `404.html`

39 und 42 Zeichen. Auf 121 und 132 Zeichen gebracht, inhaltlich zutreffend,
jeweils auch im `og:description` mitgeführt.

### A5 · Bildattribute · alle fünf HTML-Dateien

| Bild | Attribute | Warum |
|---|---|---|
| Zeichen im Kopfbereich | `decoding="async" fetchpriority="high"` | steht über der Falz, **kein** Lazy Loading, das würde das Largest Contentful Paint verschlechtern |
| Zeichen in der Fußzeile | `loading="lazy" decoding="async"` | weit unten, darf spät laden |

`width` und `height` waren bereits gesetzt, es gibt also keinen Layout Shift.

### A6 · `llms.txt` angelegt · `llms.txt` *(neu)*

Sachliche Übersicht für Antwortsysteme: Angebot, die vier Leistungen, die acht
Prüfbereiche, Arbeitsweise, Ablauf, Preislage, alle Anker der Startseite,
Kontaktweg. Jede Angabe stammt aus dem sichtbaren Seitentext.

Am Ende steht ausdrücklich, dass es keine Referenzen, Bewertungen und
Erfolgszahlen gibt. Das verhindert, dass ein Antwortsystem das Fehlen als
Lücke deutet und selbst etwas ergänzt.

> `llms.txt` ist ein Vorschlag ohne verbindlichen Standard. Sie ersetzt weder
> Sitemap noch sauberes HTML und wird hier nur als Ergänzung geführt.

### A7 · Sitemap präzisiert · `sitemap.xml`

`lastmod` auf den aktuellen Stand. Der Kommentar hält jetzt fest, was
absichtlich fehlt: die `noindex`-Seiten, die gesperrten Notizdateien und die
Anker der Startseite, die keine eigenen Adressen sind.

---

## B · Bereits vorhanden und deshalb unverändert

Der technische Unterbau war zu großen Teilen fertig. Nachgeprüft und in
Ordnung:

| Prüfung | Ergebnis |
|---|---|
| Canonical | auf allen fünf Seiten, absolut, `https://vioweb.de`, ohne `www` |
| Titel | fünf verschiedene, 18 bis 56 Zeichen |
| Descriptions | fünf verschiedene, nach A4 alle zwischen 98 und 166 Zeichen |
| `meta robots` | `index,follow` öffentlich, `noindex,follow` auf `danke` und `404` |
| Überschriften | genau eine `h1` je Seite, keine Sprünge in der Rangfolge |
| Landmarken | `header`, `nav`, `main`, `footer`, `section`, `article` vollständig |
| Linktexte | keine Fälle von „Mehr", „Hier klicken", „Mehr erfahren" |
| Links ohne Text | keine |
| JSON-LD | gültig auf allen fünf Seiten, `WebSite`, `Organization`, `BreadcrumbList`, `FAQPage`, `OfferCatalog` mit vier `Service`-Knoten |
| FAQ-Daten | alle elf Antworten stimmen **wörtlich** mit dem sichtbaren Text überein |
| Inhalte ohne JavaScript | vollständig im ausgelieferten HTML, 0 von 315 Elementen verborgen |
| Interne Verweise | alle 14 erreichbar, kein toter Anker |
| 404-Seite | vorhanden, mit Rückweg zur Startseite |
| Render-Blocker | keine, es wird nichts von fremden Servern geladen |
| UTM-Parameter | kein Router, keine Umschreibung; `?utm_source=chatgpt.com` bleibt erhalten, der Canonical zeigt trotzdem auf die saubere Adresse |
| Tracking | keines vorhanden, deshalb auch keine doppelten Seitenaufrufe |

**Zur Vollständigkeit der Inhalte für Antwortsysteme:** Die Startseite
beantwortet im sichtbaren Text bereits, was Vioweb ist, was angeboten wird,
für wen, welche acht Bereiche geprüft werden, was der Kunde erhält, wie es
danach weitergeht, was der Kurzcheck kostet und wie der Kontakt abläuft.
Hier war nichts zu ergänzen.

---

## C · Noch manuell einzurichten

### C1 · Google Search Console

1. <https://search.google.com/search-console> öffnen, Property vom Typ
   **Domain** anlegen für `vioweb.de`. Diese Variante deckt `www`, ohne `www`,
   HTTP und HTTPS in einem Rutsch ab.
2. Verifizierung über den angebotenen **DNS-TXT-Eintrag** beim
   Domain-Anbieter eintragen.
3. Alternativ, falls DNS nicht möglich ist: Meta-Tag-Verifizierung. Das Tag
   gehört in `index.html` direkt nach der Zeile
   `<meta name="viewport" …>`:
   ```html
   <meta name="google-site-verification" content="HIER-DEN-CODE-EINSETZEN">
   ```
4. Danach unter *Sitemaps* eintragen: `sitemap.xml`
5. Startseite über die URL-Prüfung zur Indexierung anfordern.

> Es ist **kein** Code hinterlegt. Einen zu erfinden wäre sinnlos, die
> Verifizierung würde scheitern.

### C2 · Bing Webmaster Tools

1. <https://www.bing.com/webmasters> öffnen. Der Import aus der Search Console
   ist der schnellste Weg und überträgt die Verifizierung mit.
2. Andernfalls Meta-Tag an dieselbe Stelle wie oben:
   ```html
   <meta name="msvalidate.01" content="HIER-DEN-CODE-EINSETZEN">
   ```
3. Sitemap einreichen: `https://vioweb.de/sitemap.xml`

Bing versorgt auch ChatGPT Search mit Teilen seines Index. Der Eintrag zahlt
also direkt auf die KI-Sichtbarkeit ein.

### C3 · IndexNow

**Empfehlung: vorerst nicht einrichten.**

IndexNow braucht eine Schlüsseldatei im Web-Wurzelverzeichnis und einen
Aufruf, sobald sich etwas ändert. Beides ginge technisch auf GitHub Pages,
der Nutzen steht aber in keinem Verhältnis: Die Seite hat drei Adressen und
ändert sich selten. Bing findet sie über die Sitemap.

Falls es später doch gewünscht ist, ist der einfachste Weg über Bing
Webmaster Tools: Dort lässt sich ein Schlüssel erzeugen, die Datei wird ins
Wurzelverzeichnis gelegt, und die Übermittlung erfolgt von Hand über die
Oberfläche. Kein Skript, keine Zugangsdaten im Repository.

### C4 · Cloudflare, falls davor geschaltet

Im Repository liegt keine Cloudflare-Konfiguration, das lässt sich also nur im
Dashboard prüfen. Zu kontrollieren ist, dass diese Funktionen die Bots nicht
abweisen:

| Einstellung | Worauf achten |
|---|---|
| Bot Fight Mode | **aus.** Er fordert Challenges auch von echten Suchmaschinen |
| Super Bot Fight Mode | „Verified Bots" auf *Allow* |
| Managed Challenge, WAF | keine Regel, die `Googlebot`, `Bingbot` oder `OAI-SearchBot` trifft |
| Browser Integrity Check | für Bots ausnehmen, er blockt untypische User-Agents |
| Rate Limiting | keine engen Grenzen auf `/` und `/sitemap.xml` |
| SSL/TLS | **Full (strict)**, sonst droht eine Weiterleitungsschleife |
| Auto Minify | **aus.** Das CSS steht von Hand gesetzt inline |
| Rocket Loader | **aus.** Er verschiebt Skripte und bricht den Formularversand |
| Cache-Regeln | `robots.txt`, `sitemap.xml` und `llms.txt` nicht lange zwischenspeichern |

Prüfen lässt sich das anschließend über die Search Console unter *URL-Prüfung
→ Live-Test*: Wird die Seite dort abgerufen, kommt Googlebot durch.

Ohne Cloudflare übernimmt GitHub Pages HTTPS und die Weiterleitung von HTTP
selbst, sobald *Enforce HTTPS* aktiv ist.

### C5 · DNS und Domainvarianten

Die Einträge stehen in `OFFEN.md` unter C3. Für SEO wichtig ist nur die
Einheitlichkeit: `vioweb.de` ohne `www` ist die kanonische Form, alle
Canonicals zeigen dorthin. Der `CNAME` für `www` muss auf
`<benutzername>.github.io` zeigen, GitHub leitet dann selbst auf die
Hauptdomain um.

### C6 · Auswertung ohne Tracking

Es ist kein Tracking eingebaut, und das ist Absicht: Sobald etwas von einem
fremden Server geladen wird, braucht die Seite ein Einwilligungsbanner und
widerlegt ihre eigene Kernaussage.

Zugriffe aus Antwortsystemen lassen sich trotzdem sehen, und zwar in der
Search Console unter *Leistung*. Besuche mit `?utm_source=chatgpt.com` tauchen
dort nicht auf, dafür bräuchte es eine serverseitige Auswertung, die GitHub
Pages nicht bietet.

Wenn eine echte Zugriffsmessung gewünscht ist, ist das ein eigener Auftrag:
Plausible oder Matomo mit EU-Hosting, Eintrag in der Datenschutzerklärung und
die Prüfung, ob eine Einwilligung nötig wird.

---

## D · Angaben, die fehlen und nicht erfunden werden durften

| Angabe | Stand | Folge |
|---|---|---|
| Verifizierungscode Google | fehlt | Search Console noch nicht verbunden |
| Verifizierungscode Bing | fehlt | Bing Webmaster Tools noch nicht verbunden |
| Postanschrift | Platzhalter | `PostalAddress` und `LocalBusiness` fehlen im JSON-LD, siehe A2 |
| Telefonnummer | Platzhalter | kein `telephone` im JSON-LD |
| E-Mail-Adresse | Annahme `kontakt@vioweb.de` | steht so im JSON-LD, bitte bestätigen |
| Weitere Profile außer Instagram | nicht bekannt | `sameAs` enthält nur `instagram.com/vio.web` |
| Referenzen, Bewertungen, Fallstudien | nicht vorhanden | kein `Review`, kein `AggregateRating`, keine Beispielseite |
| Gründungsdatum | nicht bekannt | kein `foundingDate` |

Nichts davon wurde ergänzt oder geschätzt.

---

## E · Offene Entscheidungen

### E1 · Preise · Widerspruch, den ich nicht auflösen darf

Der Auftrag nannte als bekannte Positionierung: kostenlose Erstanalyse,
vollständige Analyse für **79 Euro**, Umsetzung oder Website-Erstellung ab
**799 Euro**.

**Diese Beträge stehen an keiner Stelle im Repository.** Die Seite sagt
ausdrücklich das Gegenteil:

> „Preis nach Umfang der Website. Wir nennen ihn vor der Beauftragung, nicht
> danach."

Auch im JSON-LD trägt nur der Kurzcheck einen Preis, nämlich `0 EUR`. Die drei
übrigen Leistungen haben bewusst keinen.

Ich habe die Beträge deshalb **nicht** eingetragen. Zu entscheiden ist:

1. **Preise bleiben draußen.** Dann ist alles konsistent, es fehlen aber genau
   die Angaben, nach denen in Suche und KI-Antworten am häufigsten gefragt
   wird. „Was kostet eine Website-Analyse" ist eine der häufigsten Suchanfragen
   in diesem Bereich, und ohne Zahl wird Vioweb dort nicht zitiert.
2. **Preise kommen rein.** Dann müssen sie sichtbar auf die Seite, in das
   JSON-LD als `price` bei den betreffenden `Offer`-Knoten, und der Satz
   „Preis nach Umfang" muss angepasst werden, sonst widerspricht sich die Seite.

Ich empfehle Weg 2 mit einer Formulierung wie „ab 79 Euro", die einen Einstieg
nennt, ohne den Spielraum aufzugeben. Aber die Zahl muss von dir bestätigt
kommen, nicht aus dem Auftragstext.

### E2 · Eigene Leistungsseiten · bewusst nicht angelegt

Der Auftrag nannte `/website-analyse`, `/website-optimierung`,
`/website-erstellen`, `/preise`, `/ablauf`, `/beispiele`, `/faq`, mit der
Einschränkung: nur anlegen, wenn der Inhalt nicht schon abgedeckt ist, und
keine nahezu identischen Keyword-Seiten.

Nach dieser Regel habe ich **keine** angelegt. Der Bestand:

| Vorgeschlagene Seite | Bereits abgedeckt durch |
|---|---|
| `/website-analyse` | `#pruefung`, alle acht Bereiche mit Erklärung |
| `/website-optimierung` | `#danach`, vier Wege nach der Analyse |
| `/website-erstellen` | `#neu`, mit acht Leistungspunkten |
| `/preise` | `#vergleich`, ohne Zahlen, siehe E1 |
| `/ablauf` | `#ablauf`, fünf Schritte |
| `/faq` | `#fragen`, elf Fragen mit `FAQPage`-Daten |
| `/beispiele` | nichts, es gibt keine zeigbaren Projekte |

Sieben Seiten aus diesem Material zu schneiden hieße, denselben Text ein
zweites Mal zu schreiben. Genau das ist eine Doorway-Struktur.

**Wann sich das ändert:** Eigenständige Seiten lohnen, sobald jede davon
substanziell mehr enthält als der Abschnitt auf der Startseite, etwa
`/website-analyse` mit einem echten Musterbericht. Die Kurzcheck-Vorlage in
`kurzcheck-vorlage.md` und das Muster in `kurzcheck-muster.html` wären dafür
die Grundlage. Das ist ein eigener Auftrag, keine Nacharbeit.

### E3 · Ratgeberbereich · bewusst nicht angelegt

Eine leere Ordnerstruktur bringt nichts und die Artikel müssen inhaltlich
stimmen. Sinnvolle erste Themen, die zum Angebot passen und ohne erfundene
Zahlen auskommen:

- Was wird bei einer Website-Analyse geprüft
- Website-Analyse oder SEO-Audit, wo der Unterschied liegt
- Was die Lighthouse-Werte aussagen und was nicht
- Wann sich eine Neuerstellung mehr lohnt als eine Überarbeitung

### E4 · Interne Notizen bleiben abrufbar

`robots.txt` hält sie aus dem Index, verhindert aber keinen direkten Abruf.
Wer `vioweb.de/OFFEN.md` errät, sieht die Datei. Die drei Wege stehen in
`OFFEN.md` unter A5.

---

## F · Adressen zum Prüfen nach dem Livegang

Alle drei sind heute schon im Repository vorhanden:

```
https://vioweb.de/robots.txt
https://vioweb.de/sitemap.xml
https://vioweb.de/llms.txt
```

Die inhaltlichen Abschnitte liegen als Anker auf der Startseite:

```
https://vioweb.de/#leistungen
https://vioweb.de/#pruefung
https://vioweb.de/#vergleich
https://vioweb.de/#danach
https://vioweb.de/#neu
https://vioweb.de/#ablauf
https://vioweb.de/#fragen
https://vioweb.de/#kontakt
```

Rechtliche Seiten:

```
https://vioweb.de/impressum.html
https://vioweb.de/datenschutz.html
```

Externe Prüfwerkzeuge:

- Strukturierte Daten: <https://validator.schema.org/>
- Rich-Ergebnisse: <https://search.google.com/test/rich-results>
- HTML: <https://validator.w3.org/>

---

## Wichtig zur Reihenfolge

`robots.txt` ist jetzt offen. Solange GitHub Pages nicht aktiv ist, hat das
keine Wirkung. **Sobald die Domain live geht, kann Google die Seite sofort
indexieren, samt der Platzhalter in Impressum und Datenschutzerklärung.**

Vor dem Umlegen des Schalters müssen deshalb die Punkte A2, A3 und A4 aus
`OFFEN.md` erledigt sein. Ein indexiertes Impressum mit
`[VOR- UND NACHNAME]` ist schlechter als eine Woche später zu starten.
