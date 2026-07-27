# Schriften

## Manrope

Variable Schriftdatei, Gewichte 400 bis 800 in einer Datei.

| Datei | Zeichenumfang | Größe |
|---|---|---|
| `manrope-latin.woff2` | Latein inklusive Umlauten und ß | 24,8 KB |
| `manrope-latin-ext.woff2` | erweitertes Latein (osteuropäisch) | 15,1 KB |

**Lizenz:** SIL Open Font License 1.1. Selbsthosting auf einer Website ist
ausdrücklich erlaubt. Quelle: <https://github.com/sharanda/manrope>

**Wichtig:** Die Dateien liegen bewusst lokal im Projekt. Google Fonts per
`<link>` einzubinden würde bei jedem Seitenaufruf eine Anfrage an einen
fremden Server auslösen — genau das, was diese Website nicht tut und wovon
sie ihre Glaubwürdigkeit bezieht.

Nur `manrope-latin.woff2` wird vorgeladen. Die erweiterte Datei holt der
Browser nur, wenn ein Zeichen daraus tatsächlich vorkommt — das regelt
`unicode-range` in der `@font-face`-Regel.

## Ersetzen

Andere Schrift gewünscht? Nur diese drei Stellen ändern:

1. Die `.woff2`-Dateien hier ablegen
2. In **jeder** HTML-Datei die `@font-face`-Regeln und `--schrift` anpassen
3. Den `<link rel="preload">` im `<head>` auf die neue Datei zeigen lassen

Die Schrift muss deutsche Umlaute und ß enthalten — sonst fallen einzelne
Zeichen sichtbar auf die Ersatzschrift zurück.
