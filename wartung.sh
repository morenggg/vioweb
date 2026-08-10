#!/bin/sh
# =============================================================================
#  Wartungsmodus fuer vioweb.de an- und ausschalten.
#
#    ./wartung.sh an      jede Seite zeigt die Wartungsseite
#    ./wartung.sh aus     die normale Website ist zurueck
#    ./wartung.sh status  zeigt, was gerade aktiv ist
#
#  Was passiert:
#  Im Wartungsmodus tragen ALLE Einstiegspunkte denselben Inhalt — die
#  Wartungsseite. Nicht ueber eine Weiterleitung, sondern direkt. Damit gibt
#  es kein Aufblitzen der echten Seite, keine Weiterleitungsschleife, und es
#  funktioniert ohne JavaScript. Auch 404.html traegt sie, also landet jede
#  unbekannte Adresse ebenfalls dort.
#
#  Warum kein Schalter im Code:
#  Die Seite ist statisch und wird von GitHub Pages ausgeliefert. Es gibt
#  kein Build-System und keine Umgebungsvariablen. Ein Schalter, der erst im
#  Browser greift, wuerde die echte Seite kurz zeigen und Besuchern ohne
#  JavaScript gar nicht helfen.
#
#  Die normale Website liegt waehrenddessen unveraendert in normalbetrieb/.
# =============================================================================
set -e
cd "$(dirname "$0")"

QUELLE=wartungsseite.html
ABLAGE=normalbetrieb

# Alle Adressen, unter denen jemand auf der Website landen kann.
# kurzcheck-muster.html steht bewusst NICHT dabei: das ist ein Musterbericht
# zum Weitergeben und nicht Teil der Website.
SEITEN="index.html preise/index.html faq/index.html kontakt/index.html datenschutz.html danke.html 404.html leistungen.html"

fehler() { echo "FEHLER: $1" >&2; exit 1; }

aktiv() {
  if grep -q 'Wartungsseite' index.html 2>/dev/null; then echo an; else echo aus; fi
}

case "$1" in
  an)
    [ "$(aktiv)" = an ] && { echo "Wartungsmodus ist bereits an."; exit 0; }
    [ -f "$QUELLE" ] || fehler "$QUELLE fehlt."
    for s in $SEITEN; do
      [ -f "$s" ] || continue
      mkdir -p "$ABLAGE/$(dirname "$s")"
      cp "$s" "$ABLAGE/$s"
      cp "$QUELLE" "$s"
    done
    echo "Wartungsmodus AN."
    echo "Jede Adresse zeigt die Wartungsseite; die Website liegt in $ABLAGE/."
    ;;
  aus)
    [ "$(aktiv)" = aus ] && { echo "Wartungsmodus ist bereits aus."; exit 0; }
    [ -d "$ABLAGE" ] || fehler "$ABLAGE/ fehlt — die Website laesst sich nicht zurueckholen."
    for s in $SEITEN; do
      [ -f "$ABLAGE/$s" ] || continue
      cp "$ABLAGE/$s" "$s"
    done
    rm -rf "$ABLAGE"
    echo "Wartungsmodus AUS. Die normale Website ist zurueck."
    ;;
  status|"")
    if [ "$(aktiv)" = an ]; then
      echo "Wartungsmodus: AN  (alle Seiten zeigen die Wartungsseite)"
      echo "Abgelegt in $ABLAGE/: $(find "$ABLAGE" -name '*.html' 2>/dev/null | wc -l | tr -d ' ') Seiten"
    else
      echo "Wartungsmodus: AUS (normale Website)"
    fi
    ;;
  *)
    echo "Aufruf: ./wartung.sh an | aus | status" >&2
    exit 1
    ;;
esac

echo "Nicht vergessen: aenderungen committen und pushen."
