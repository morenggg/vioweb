# Café Morgenmuffel — Demo-Website

Gestaltungsentwurf für ein echtes Café in Torgau, gebaut **ausschließlich**
aus dem übergebenen Bildmaterial. Kein Auftrag, kein Live-Angebot.

    index.html · style.css · script.js · bilder/

Nur HTML, CSS und JavaScript. Keine Frameworks, keine Build-Tools, keine
Schriften oder Skripte von fremden Servern. `index.html` lässt sich direkt
im Browser öffnen.

## Woher die Inhalte stammen

**Aus den Bildern übernommen (echt):**

- Name, Signet und Farbwelt — Fensterbeschriftung und Speisekarte
- Anschrift Bäckerstraße 6, Torgau — Instagram-Profil
- Öffnungszeiten Mo–So 9–17 Uhr — Instagram-Profil und Fensteraufkleber
- Instagram-Adresse @cafemorgenmuffel_torgau
- Die gesamte Karte samt Preisen, Beschreibungen und Hinweisen —
  abgetippt von den beiden Kartenfotos
- Die Zeile „Kaffee · Bagels · Matcha · Kuchen · Good Times“ — Profiltext

**Sichtbar als Demo markiert (fehlt im Material):**

- Telefonnummer
- E-Mail-Adresse
- Hinweise zu Parkplätzen und Bus
- Impressum und Datenschutzerklärung

Erfunden wurde nichts. Die Fließtexte in „Über uns“ sind Entwurfstexte;
sie beschreiben nur, was auf den Fotos und der Karte zu sehen ist.

## Bilder

Die vier Originaldateien liegen unverändert in `bilder/`, siehe
`bilder/HERKUNFT.txt`. Alle Ausschnitte entstehen per CSS über vier Zahlen
je Motiv (Abschnitt „Bildschnitt“ in `style.css`). Vorteil: die Originale
bleiben unangetastet, und der Browser lädt jede Datei nur ein einziges Mal,
egal wie viele Ausschnitte sie auf der Seite füllt.

Offener Punkt: Die vier Screenshots sind zusammen rund 11 MB. Für eine
Vorschau ist das in Ordnung, für den Livebetrieb sollten daraus
zugeschnittene WebP-Dateien in mehreren Größen werden. Das erzeugt neue
Bilddateien und wurde deshalb bewusst nicht gemacht.

Ebenfalls offen, weil es dafür kein Material gibt: Favicon und
Vorschaubild für geteilte Links.

## Geprüft

360 / 375 / 768 / 1280 / 1440 px, kein waagerechtes Scrollen, alle
Bildpfade lokal, keine einzige Anfrage an einen fremden Server, Tastatur-
bedienung, Menü und Lichtkasten, Farbkontraste nach WCAG AA, Darstellung
ohne JavaScript, `prefers-reduced-motion`.
