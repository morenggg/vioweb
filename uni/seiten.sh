#!/bin/sh
# =============================================================================
#  Erzeugt die Huellen unter /uni.
#
#      ./seiten.sh
#
#  Warum es dieses Skript gibt:
#  Die Seite liegt statisch auf GitHub Pages. Es gibt keinen Server, der
#  /uni/modul/statistik-2/ auf eine Vorlage lenken koennte. Also bekommt
#  jede Adresse eine echte index.html. Alle sind gleich aufgebaut und
#  laden dasselbe Stylesheet und dieselben Skripte; welche Ansicht
#  erscheint, entscheidet der Router anhand der Adresse.
#
#  Dadurch funktioniert ein Direktaufruf oder ein geteilter Link genauso
#  wie die Navigation in der App.
#
#  Die Slugs kommen direkt aus js/daten.js. Kommt dort ein Modul, ein
#  Material, ein Service oder ein Flohmarkt-Artikel dazu, genuegt ein
#  Aufruf dieses Skripts — es legt die fehlenden Ordner an und raeumt
#  die weg, deren Slug es nicht mehr gibt.
# =============================================================================
set -e
cd "$(dirname "$0")"

FESTE="_ studium kalender entdecken flohmarkt profil inbox suche onboarding material service modul"

# Die Slugs stehen nicht doppelt hier drin, sondern werden aus
# js/daten.js gelesen. Dort markieren Kommentare den Anfang und das Ende
# jeder Sammlung. So kann die Liste nie auseinanderlaufen.
slugs() {
  sed -n "/--- SLUGS $1 ---/,/--- ENDE $1 ---/p" js/daten.js \
    | grep -o "slug: '[^']*'" | sed "s/slug: '//; s/'$//"
}

MODULE=$(slugs module)
MATERIALIEN=$(slugs materialien)
SERVICES=$(slugs services)
ARTIKEL=$(slugs flohmarkt)

for name in MODULE MATERIALIEN SERVICES ARTIKEL; do
  eval "wert=\$$name"
  [ -n "$wert" ] || { echo "FEHLER: keine Slugs fuer $name in js/daten.js gefunden." >&2; exit 1; }
done

# Ordner wegraeumen, deren Slug es nicht mehr gibt. Ohne die vorherige
# Pruefung waere das gefaehrlich — deshalb steht sie oben.
aufraeumen() {
  ordner="$1"
  liste="$2"
  [ -d "$ordner" ] || return 0
  for pfad in "$ordner"/*/; do
    [ -d "$pfad" ] || continue
    name=$(basename "$pfad")
    if ! echo "$liste" | grep -qx "$name"; then
      rm -rf "$pfad"
      echo "  entfernt: $pfad"
    fi
  done
}

# $1 Zielordner (leer = /uni selbst), $2 Titel
huelle() {
  ordner="$1"
  titel="$2"
  if [ -n "$ordner" ]; then mkdir -p "$ordner"; datei="$ordner/index.html"; else datei="index.html"; fi
  cat > "$datei" <<VORLAGE
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">

<title>$titel</title>
<meta name="description" content="Prototyp einer Campus-App für Studenten. Musterdaten, kein Konto, keine Zahlung.">

<!-- Prototyp: gehoert nicht in den Index. Gecrawlt werden darf die Seite,
     sonst liest niemand das noindex. Begruendungen in uni/LIESMICH.md. -->
<meta name="robots" content="noindex,nofollow">

<meta name="theme-color" content="#F3EFE7" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#15140F" media="(prefers-color-scheme: dark)">

<link rel="icon" href="/img/favicon-32.png" sizes="32x32" type="image/png">
<link rel="icon" href="/img/favicon-192.png" sizes="192x192" type="image/png">
<link rel="apple-touch-icon" href="/img/apple-touch-icon.png">

<link rel="preload" href="/fonts/manrope-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/uni/css/app.css">

<!-- Ein gewaehltes Thema noch vor dem ersten Bild setzen, sonst blitzt
     die helle Fassung auf. -->
<script>
try {
  var g = JSON.parse(localStorage.getItem('uni.zustand.v1') || 'null');
  if (g && g.thema && g.thema !== 'system') document.documentElement.setAttribute('data-thema', g.thema);
} catch (e) {}
</script>

<script defer src="/uni/js/daten.js"></script>
<script defer src="/uni/js/zustand.js"></script>
<script defer src="/uni/js/bausteine.js"></script>
<script defer src="/uni/js/abfragen.js"></script>
<script defer src="/uni/js/ansichten.js"></script>
<script defer src="/uni/js/app.js"></script>
</head>
<body>

<div class="u-app" id="app"></div>

<noscript>
  <div class="u-ohnejs">
    <h1 class="u-titel u-h1">Campus</h1>
    <p>Dieser Prototyp wird im Browser aufgebaut und braucht dafür JavaScript.
       Die Website von Vioweb funktioniert ohne.</p>
    <p><a href="/">Zur Website von Vioweb</a></p>
  </div>
</noscript>

</body>
</html>
VORLAGE
  echo "  $datei"
}

echo "Feste Adressen:"
for s in $FESTE; do
  case "$s" in
    _)          huelle ""            "Campus" ;;
    studium)    huelle "studium"     "Studium · Campus" ;;
    kalender)   huelle "kalender"    "Kalender · Campus" ;;
    entdecken)  huelle "entdecken"   "Entdecken · Campus" ;;
    flohmarkt)  huelle "flohmarkt"   "Flohmarkt · Campus" ;;
    profil)     huelle "profil"      "Profil · Campus" ;;
    inbox)      huelle "inbox"       "Nachrichten · Campus" ;;
    suche)      huelle "suche"       "Suche · Campus" ;;
    onboarding) huelle "onboarding"  "Willkommen · Campus" ;;
    material)   huelle "material"    "Materialien · Campus" ;;
    service)    huelle "service"     "Services · Campus" ;;
    modul)      huelle "modul"       "Module · Campus" ;;
  esac
done

echo "Module:";      for s in $MODULE;       do huelle "modul/$s"     "Modul · Campus"; done
echo "Materialien:"; for s in $MATERIALIEN;  do huelle "material/$s"  "Material · Campus"; done
echo "Services:";    for s in $SERVICES;     do huelle "service/$s"   "Service · Campus"; done
echo "Flohmarkt:";   for s in $ARTIKEL;      do huelle "flohmarkt/$s" "Artikel · Campus"; done

echo "Aufraeumen:"
aufraeumen modul     "$MODULE"
aufraeumen material  "$MATERIALIEN"
aufraeumen service   "$SERVICES"
aufraeumen flohmarkt "$ARTIKEL"

echo "Fertig."
