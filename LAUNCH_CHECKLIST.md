# Livegang — Prüfliste

Von oben nach unten abarbeiten. Die ersten drei Punkte sind Pflicht,
alles andere baut darauf auf.

---

## Kritisch — ohne diese Punkte kein Livegang

- [ ] **`robots.txt` freigeben.** Dort steht aktuell `Disallow: /`.
      Zeile entfernen und durch `Allow: /` ersetzen, sonst bleibt die
      Seite dauerhaft unsichtbar für Google.
- [ ] **Impressum ausfüllen.** Alle `[ECKIGEN KLAMMERN]` in
      `impressum.html` ersetzen: Name, ladungsfähige Anschrift,
      Telefonnummer, Steuernummer. Ein Impressum mit Platzhaltern ist
      abmahnfähig.
- [ ] **Datenschutzerklärung ausfüllen.** Gleiches Vorgehen in
      `datenschutz.html`. **Solange kein Formulardienst läuft, muss der
      Abschnitt dazu gelöscht werden** — eine Erklärung, die einen
      ungenutzten Dienst nennt, ist genauso falsch wie eine, die einen
      genutzten verschweigt.
- [ ] **Beide orangen Warnkästen entfernen**, aus Impressum und
      Datenschutz, samt Warnhinweis am Dateianfang.
- [ ] **E-Mail-Adresse prüfen.** Überall steht `kontakt@vioweb.de` — das
      ist eine Annahme. Stimmt sie nicht, in `index.html` (Formular
      `action` und `data-mail`, `noscript`, Fußzeile, JSON-LD) sowie in
      `impressum.html`, `datenschutz.html` und `danke.html` ersetzen.

## Domain und Auslieferung

- [ ] Domain `vioweb.de` zeigt auf GitHub Pages
- [ ] `A`-Einträge: `185.199.108.153`, `185.199.109.153`,
      `185.199.110.153`, `185.199.111.153`
- [ ] `CNAME` für `www` auf `<benutzername>.github.io`
- [ ] Datei `CNAME` liegt im Repository und enthält `vioweb.de`
- [ ] GitHub Pages aktiv: Settings → Pages → Deploy from a branch,
      Branch `main`, Ordner `/ (root)`
- [ ] **Enforce HTTPS** angehakt (erst nach DNS-Umstellung möglich)
- [ ] `https://vioweb.de` lädt ohne Zertifikatswarnung
- [ ] `http://` leitet auf `https://` um
- [ ] `www.vioweb.de` leitet auf `vioweb.de` um
- [ ] Datei `.nojekyll` liegt noch im Repository

### Cloudflare — nur falls eingesetzt

- [ ] SSL/TLS-Modus auf **Full (strict)**, nicht Flexible
- [ ] Always Use HTTPS aktiv
- [ ] Auto Minify **aus** — das CSS ist inline und von Hand gesetzt
- [ ] Rocket Loader **aus** — verschiebt Skripte und bricht das Formular
- [ ] Browser Cache TTL auf mindestens vier Stunden

## Formular

- [ ] Formulardienst eingerichtet (Empfehlung: Formcarry oder Formspark,
      beide mit EU-Servern)
- [ ] **Auftragsverarbeitungsvertrag nach Art. 28 DSGVO abgeschlossen** —
      ohne ihn darf der Dienst nicht eingesetzt werden
- [ ] Endpunkt in `index.html` an **beiden** Stellen eingetragen:
      `action="…"` und `data-endpunkt="…"`
- [ ] Verstecktes Feld `_redirect` auf die volle Adresse von
      `danke.html` gesetzt
- [ ] Dienst namentlich in `datenschutz.html` eingetragen
- [ ] Testanfrage abgeschickt und **im Postfach angekommen**
- [ ] Weiterleitung auf `danke.html` funktioniert
- [ ] Leeres Formular zeigt drei Fehlermeldungen in Klartext
- [ ] `beispiel.de` wird beim Verlassen des Feldes zu `https://beispiel.de`

## Suchmaschinen

- [ ] `https://vioweb.de/robots.txt` erreichbar und **gibt frei**
- [ ] `https://vioweb.de/sitemap.xml` erreichbar und gültig
- [ ] `lastmod` in der Sitemap auf das Livegang-Datum gesetzt
- [ ] Google Search Console: Eigentum bestätigt (per DNS-Eintrag)
- [ ] Sitemap in der Search Console eingereicht
- [ ] Startseite über „URL-Prüfung" zur Indexierung angefordert
- [ ] Bing Webmaster Tools verbunden (Import aus der Search Console geht)
- [ ] Rich Results Test bestanden: <https://search.google.com/test/rich-results>
      — erwartet werden `Organization`, `BreadcrumbList` und `FAQPage`

## Darstellung

- [ ] Favicon erscheint im Browser-Reiter
- [ ] `apple-touch-icon` erscheint beim Ablegen auf dem iOS-Startbildschirm
- [ ] `site.webmanifest` lädt ohne Fehler
- [ ] Vorschaubild prüfen: <https://www.opengraph.xyz/>
- [ ] Verweis testweise in WhatsApp schicken — Bild und Titel korrekt?
- [ ] Canonical auf jeder Seite korrekt und absolut
- [ ] `404.html` erscheint bei einer erfundenen Adresse
- [ ] Impressum und Datenschutz aus der Fußzeile erreichbar

## Browser und Geräte

- [ ] Chrome
- [ ] Firefox
- [ ] Safari auf macOS
- [ ] Safari auf iOS — besonders das Off-Canvas-Menü und die Scroll-Sperre
- [ ] Chrome auf Android
- [ ] 320 px Breite ohne horizontales Scrollen
- [ ] 390 px Breite
- [ ] Tablet quer
- [ ] 1440 px und größer

## Zugänglichkeit

- [ ] Komplette Seite nur mit der Tabulatortaste bedienbar
- [ ] Fokusrahmen überall sichtbar
- [ ] Menü: öffnet, fängt den Fokus, schließt mit Escape, gibt den Fokus
      zurück
- [ ] Formularfehler werden vorgelesen
- [ ] Kontrast geprüft: <https://webaim.org/resources/contrastchecker/>
- [ ] Mit reduzierter Bewegung geprüft (Systemeinstellung) — kein Inhalt
      verschwindet
- [ ] Mit einem Screenreader durchgegangen (VoiceOver oder NVDA)

## Messung dokumentieren

Diese Werte nach dem Livegang **eintragen**, nicht schätzen:

- [ ] Lighthouse mobil — Performance ___ · Accessibility ___ ·
      Best Practices ___ · SEO ___
- [ ] Lighthouse Desktop — Performance ___ · Accessibility ___ ·
      Best Practices ___ · SEO ___
- [ ] PageSpeed Insights, Felddaten nach vier Wochen erneut ansehen
- [ ] HTML validiert: <https://validator.w3.org/>
- [ ] CSS validiert: <https://jigsaw.w3.org/css-validator/>

## Optional, bewusst nicht eingebaut

- [ ] Reichweitenmessung — **derzeit keine.** Die Seite wirbt damit,
      keine fremden Server anzufragen. Kommt Statistik dazu, ist das ein
      eigener Auftrag: Plausible oder Matomo mit EU-Hosting, Eintrag in
      der Datenschutzerklärung, Prüfung ob eine Einwilligung nötig wird.
      Google Analytics würde ein Einwilligungsbanner erzwingen und die
      Kernaussage der Marke widerlegen.

---

## Nach dem Livegang

- [ ] Search Console nach einer Woche prüfen: ist die Seite indexiert?
- [ ] Nach vier Wochen: welche Suchbegriffe bringen Besucher?
- [ ] `SEO.md` mit den echten Messwerten ergänzen
