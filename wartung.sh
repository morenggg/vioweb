#!/bin/sh
# =============================================================================
#  Wartungsmodus fuer vioweb.de an- und ausschalten.
#
#    ./wartung.sh an      Wartungsseite auf /
#    ./wartung.sh aus     normale Startseite auf /
#    ./wartung.sh status  zeigt, was gerade aktiv ist
#
#  Warum ein Dateitausch und kein Schalter im Code:
#  Die Seite ist statisch und wird von GitHub Pages ausgeliefert. Ein
#  Schalter, der erst im Browser greift, wuerde die echte Startseite kurz
#  aufblitzen lassen und Suchmaschinen sowie Besuchern ohne JavaScript
#  weiterhin die alte Seite zeigen. Der Tausch der Datei hat keinen dieser
#  Nachteile.
#
#  Die jeweils nicht aktive Fassung bleibt vollstaendig im Projekt liegen
#  und traegt noindex, damit sie nicht neben der echten Startseite in den
#  Suchergebnissen auftaucht.
# =============================================================================
set -e
cd "$(dirname "$0")"

WARTUNG=wartungsseite.html
NORMAL=startseite.html
LIVE=index.html

INDEX_AN='<meta name="robots" content="index,follow,max-image-preview:large">'
INDEX_AUS='<meta name="robots" content="noindex,nofollow">'

fehler() { echo "FEHLER: $1" >&2; exit 1; }

# Welche Fassung liegt gerade auf index.html?
aktiv() {
  if grep -q 'id="bahn"' "$LIVE" 2>/dev/null; then echo wartung; else echo normal; fi
}

case "$1" in
  an)
    [ "$(aktiv)" = wartung ] && { echo "Wartungsmodus ist bereits an."; exit 0; }
    [ -f "$WARTUNG" ] || fehler "$WARTUNG fehlt."
    cp "$LIVE" "$NORMAL"
    sed -i "s|$INDEX_AN|$INDEX_AUS|" "$NORMAL"
    cp "$WARTUNG" "$LIVE"
    sed -i "s|$INDEX_AUS|$INDEX_AN|" "$LIVE"
    echo "Wartungsmodus AN. index.html zeigt die Wartungsseite."
    echo "Die bisherige Startseite liegt in $NORMAL."
    ;;
  aus)
    [ "$(aktiv)" = normal ] && { echo "Wartungsmodus ist bereits aus."; exit 0; }
    [ -f "$NORMAL" ] || fehler "$NORMAL fehlt — die Startseite laesst sich nicht zurueckholen."
    cp "$LIVE" "$WARTUNG"
    sed -i "s|$INDEX_AN|$INDEX_AUS|" "$WARTUNG"
    cp "$NORMAL" "$LIVE"
    sed -i "s|$INDEX_AUS|$INDEX_AN|" "$LIVE"
    echo "Wartungsmodus AUS. index.html zeigt wieder die normale Startseite."
    echo "Die Wartungsseite liegt in $WARTUNG."
    ;;
  status|"")
    if [ "$(aktiv)" = wartung ]; then
      echo "Wartungsmodus: AN  (index.html = Wartungsseite mit Rennbahn)"
    else
      echo "Wartungsmodus: AUS (index.html = normale Startseite)"
    fi
    ;;
  *)
    echo "Aufruf: ./wartung.sh an | aus | status" >&2
    exit 1
    ;;
esac

echo "Nicht vergessen: aenderungen committen und pushen."
