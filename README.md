# Vioweb

Plattform für Website-Analyse, Optimierung, SEO, Performance, UX und Conversion.

> Wir verkaufen keine Webseiten. Wir lösen Probleme.

## Stand

Das Projekt befindet sich in der Prototypenphase. Es gibt noch keinen
produktiven Code — bewusst: Jede Idee wird zuerst als eigenständiger
HTML-Prototyp gebaut, getestet und freigegeben, bevor daraus eine
Produktionsimplementierung entsteht.

## Inhalt

| Datei | Zweck |
|---|---|
| `vioweb-designrichtlinien.md` | Design-System. Verbindlich, vor jeder Designentscheidung zu lesen |
| `CLAUDE.md` | Arbeitsanweisungen für die Weiterentwicklung |
| `prototypes/index.html` | Landingpage-Prototyp |

## Prototyp ansehen

```
open prototypes/index.html
```

Kein Build, keine Abhängigkeiten, kein Server. Die Datei enthält HTML, CSS und
JavaScript vollständig und lädt keine externen Ressourcen.

**Was der Prototyp zeigt:** Sticky Header, Hero mit Analyse-Eingabe, simulierte
Analyse mit animierten Messwerten, Leistungen, Ablauf, FAQ, CTA und Footer —
inklusive Dark Mode, Tastaturbedienung und `prefers-reduced-motion`.

Die Analyse ist simuliert und arbeitet mit sichtbar gekennzeichneten
Beispieldaten. Es findet keine echte Messung statt.

## Geprüft

Der Prototyp wurde automatisiert in Chromium gegen folgende Punkte getestet:

- 360 px, 768 px und 1280 px ohne horizontalen Überlauf
- Light und Dark Mode
- Genau eine `<h1>`, `lang="de"`, gültiges JSON-LD
- FAQ-Schema deckungsgleich mit dem sichtbaren Text
- Alle Interaktionsflächen ≥ 44 × 44 px
- Formularvalidierung inklusive Fehlermeldung und Live-Region
- Mobile Navigation: Öffnen, Fokusfang, Escape, Fokusrückgabe
- Vollständig nutzbar ohne JavaScript
- `prefers-reduced-motion` blendet keine Inhalte aus

Die Prüfliste für jede weitere Änderung steht in
`vioweb-designrichtlinien.md`, Abschnitt 12.
