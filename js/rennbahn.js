/* =========================================================================
   Vioweb — die kleine Rennbahn auf der Wartungsseite.

   Warum Canvas 2D und keine 3D-Bibliothek:
   Die Seite darf beim Aufruf keine einzige Anfrage an einen fremden Server
   stellen, und eine 3D-Bibliothek mitzuliefern waere ein Vielfaches des
   gesamten uebrigen Seitengewichts. Die raeumliche Wirkung entsteht
   stattdessen aus einer festen Isometrie: die Strecke liegt flach in einer
   Ebene und wird gedreht, gestaucht und in der Hoehe versetzt gezeichnet.
   Das reicht fuer den Eindruck einer Bahn auf einem Tisch und laeuft auch
   auf aelteren Telefonen fluessig.

   Aufbau:
     1. Streckenverlauf   — Stuetzpunkte, Spline, Bogenlaenge, Kruemmung
     2. Projektion        — Ebene nach Bildschirm
     3. Fahrphysik        — Gas, Bremse, Rollwiderstand, Kurvengrenze
     4. Zeichnen          — Platte, Bahn, Curbs, Banden, Auto
     5. Anzeigen          — Runde, Zeit, Bestzeit, Tempo
     6. Bedienung         — Knoepfe, Tastatur, Beruehrung
   ========================================================================= */
(function () {
  'use strict';

  var leinwand = document.getElementById('bahn');
  if (!leinwand || !leinwand.getContext) return;
  var stift = leinwand.getContext('2d');

  var ruhig = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* --------------------------------------------------- 1. Streckenverlauf */
  /* Stuetzpunkte im Streckenmass. Eine Einheit entspricht einem Meter der
     gedachten grossen Strecke — daraus ergibt sich spaeter das Tempo in
     km/h, ohne dass irgendwo eine Zahl geraten wird.
     Der Kurs ist geschlossen: zwei laengere Geraden, mehrere Kurven und
     eine enge Haarnadel oben links. z ist reine Optik, die Physik kennt
     keine Hoehe. */
  var STUETZEN = [
    { x: -65.0, y:  33.8, z: 0 },   /* Start und Ziel, Beginn der Hauptgeraden */
    { x: -13.0, y:  37.7, z: 0 },
    { x:  35.8, y:  35.8, z: 1.3 },
    { x:  63.7, y:  23.4, z: 3.3 }, /* weite Rechtskurve, leicht angehoben */
    { x:  74.1, y:   1.3, z: 3.9 },
    { x:  62.4, y: -19.5, z: 3.3 },
    { x:  32.5, y: -31.2, z: 1.3 },
    { x: -16.3, y: -35.1, z: 0 },   /* Gegengerade */
    { x: -46.8, y: -29.9, z: 0 },
    { x: -68.9, y: -14.3, z: 0 },   /* Anfahrt zur Haarnadel */
    { x: -80.6, y:   2.6, z: 0 },   /* Haarnadel, engster Punkt */
    { x: -67.6, y:  22.1, z: 0 }
  ];


  var BAHNBREITE = 9.8;            /* Meter, beide Spuren zusammen */

  /* Catmull-Rom durch die Stuetzpunkte, geschlossen. Ergibt einen weichen
     Verlauf ohne Knicke, ohne dass jede Kurve von Hand gerechnet wird. */
  function spline(p0, p1, p2, p3, t) {
    var t2 = t * t, t3 = t2 * t;
    return {
      x: .5 * ((2 * p1.x) + (-p0.x + p2.x) * t +
               (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
               (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
      y: .5 * ((2 * p1.y) + (-p0.y + p2.y) * t +
               (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
               (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      z: .5 * ((2 * p1.z) + (-p0.z + p2.z) * t +
               (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 +
               (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3)
    };
  }

  /* Dichte Abtastung. Aus ihr kommen Laenge, Richtung und Kruemmung —
     alles, was Zeichnung und Physik brauchen. */
  var PUNKTE = [];
  (function abtasten() {
    var n = STUETZEN.length, jeAbschnitt = 24, i, k;
    for (i = 0; i < n; i++) {
      var p0 = STUETZEN[(i - 1 + n) % n], p1 = STUETZEN[i];
      var p2 = STUETZEN[(i + 1) % n], p3 = STUETZEN[(i + 2) % n];
      for (k = 0; k < jeAbschnitt; k++) {
        PUNKTE.push(spline(p0, p1, p2, p3, k / jeAbschnitt));
      }
    }
    /* Bogenlaenge und Kruemmung je Punkt. Die Kruemmung ergibt sich aus der
       Richtungsaenderung zwischen Vorgaenger und Nachfolger geteilt durch
       die zurueckgelegte Strecke. */
    var gesamt = 0, m = PUNKTE.length;
    for (i = 0; i < m; i++) {
      var a = PUNKTE[i], b = PUNKTE[(i + 1) % m];
      a.s = gesamt;
      a.dx = b.x - a.x; a.dy = b.y - a.y;
      a.len = Math.hypot(a.dx, a.dy);
      a.dx /= a.len; a.dy /= a.len;
      gesamt += a.len;
    }
    for (i = 0; i < m; i++) {
      var v = PUNKTE[(i - 1 + m) % m], w = PUNKTE[i];
      var winkel = Math.atan2(v.dx * w.dy - v.dy * w.dx, v.dx * w.dx + v.dy * w.dy);
      w.k = Math.abs(winkel) / Math.max(w.len, .001);
    }
    /* Kruemmung leicht glaetten, sonst zittert die Kurvengrenze. */
    var roh = PUNKTE.map(function (p) { return p.k; });
    for (i = 0; i < m; i++) {
      var sum = 0;
      for (k = -3; k <= 3; k++) sum += roh[(i + k + m) % m];
      PUNKTE[i].k = sum / 7;
    }
    PUNKTE.laenge = gesamt;
  })();

  var LAENGE = PUNKTE.laenge;

  /* Punkt an einer beliebigen Bogenlaenge, linear zwischen den Abtastungen. */
  function beiS(s) {
    s = ((s % LAENGE) + LAENGE) % LAENGE;
    var m = PUNKTE.length;
    var i = Math.floor(s / LAENGE * m) % m;
    /* Zur richtigen Stelle laufen — die Abtastung ist nicht exakt gleich lang. */
    while (PUNKTE[i].s > s && i > 0) i--;
    while (i < m - 1 && PUNKTE[i + 1].s <= s) i++;
    var a = PUNKTE[i], b = PUNKTE[(i + 1) % m];
    var t = a.len > 0 ? (s - a.s) / a.len : 0;
    if (t < 0) t = 0; if (t > 1) t = 1;
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      z: a.z + (b.z - a.z) * t,
      dx: a.dx, dy: a.dy, k: a.k
    };
  }

  /* ------------------------------------------------------- 2. Projektion */
  /* Feste Isometrie: drehen, in der Tiefe stauchen, Hoehe nach oben. */
  var DREH = -0.42, STAUCH = 0.52, HOEHE = 2.6;
  var cosD = Math.cos(DREH), sinD = Math.sin(DREH);
  var mass = 1, mitteX = 0, mitteY = 0;

  function proj(x, y, z) {
    var px = x * cosD - y * sinD;
    var py = (x * sinD + y * cosD) * STAUCH - (z || 0) * HOEHE;
    return { x: mitteX + px * mass, y: mitteY + py * mass };
  }

  /* Massstab so waehlen, dass die ganze Strecke samt Rand ins Bild passt. */
  function einpassen(breite, hoehe) {
    var minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    var rand = BAHNBREITE * 0.9 + 12;
    mass = 1; mitteX = 0; mitteY = 0;
    PUNKTE.forEach(function (p) {
      [-rand, rand].forEach(function (o) {
        var q = proj(p.x - p.dy * o, p.y + p.dx * o, p.z);
        if (q.x < minX) minX = q.x; if (q.x > maxX) maxX = q.x;
        if (q.y < minY) minY = q.y; if (q.y > maxY) maxY = q.y;
      });
    });
    var mx = 14;
    mass = Math.min((breite - mx * 2) / (maxX - minX), (hoehe - mx * 2) / (maxY - minY));
    mitteX = breite / 2 - (minX + maxX) / 2 * mass;
    mitteY = hoehe / 2 - (minY + maxY) / 2 * mass;
  }

  /* ------------------------------------------------------ 3. Fahrphysik */
  /* Die Werte haengen zusammen und sind aufeinander eingestellt, nicht
     geraten: Aus Gaskraft, Rollwiderstand und Luftwiderstand ergibt sich
     die Endgeschwindigkeit von selbst — sie liegt dort, wo der Widerstand
     die Gaskraft aufwiegt. Mit diesen Zahlen sind das rund 36 m/s, also
     etwa 130 km/h. V_MAX ist nur noch das Sicherheitsnetz darueber.
     Frueher stand V_MAX bei 148 km/h, der Luftwiderstand riegelte aber
     schon bei 90 ab — die Zahl war damit ohne Bedeutung. */
  var GAS_KRAFT   = 13.0;   /* m/s je Sekunde */
  var BREMS_KRAFT = 28.0;
  var ROLLEN      = 0.8;    /* konstanter Anteil */
  var LUFT        = 0.0093; /* waechst mit dem Quadrat des Tempos */
  var V_MAX       = 38.0;   /* m/s, rund 137 km/h */
  var QUER_MAX    = 22.0;   /* m/s^2 Seitenfuehrung, begrenzt das Kurventempo */

  var auto = {
    s: 0,          /* Bogenlaenge auf der Strecke */
    v: 0,          /* Tempo in m/s */
    quer: 0,       /* Versatz zur Ideallinie, positiv = nach aussen */
    rutscht: 0     /* Restzeit der Rutschanzeige */
  };

  var gas = false, bremse = false;

  /* Erlaubtes Tempo an dieser Stelle: v = Wurzel(Querbeschleunigung / Kruemmung). */
  function grenze(k) {
    if (k < 1e-4) return V_MAX;
    return Math.min(V_MAX, Math.sqrt(QUER_MAX / k));
  }

  function fahren(dt) {
    var hier = beiS(auto.s);

    if (gas)    auto.v += GAS_KRAFT * dt;
    if (bremse) auto.v -= BREMS_KRAFT * dt;

    /* Rollwiderstand wirkt immer, aber nie bis ins Negative. */
    auto.v -= (ROLLEN + LUFT * auto.v * auto.v) * dt;
    if (auto.v < 0) auto.v = 0;
    if (auto.v > V_MAX) auto.v = V_MAX;

    /* Zu schnell in der Kurve: das Auto schiebt nach aussen und verliert
       Tempo. Kein Ausfall, kein Neustart — es faengt sich wieder. */
    var vGrenze = grenze(hier.k);
    if (auto.v > vGrenze) {
      var ueber = (auto.v - vGrenze) / Math.max(vGrenze, 1);
      auto.quer += ueber * 34 * dt;
      /* Der Tempoverlust ueberwiegt den Gewinn aus dem Zuviel — sonst waere
         stures Vollgas die schnellste Linie und die Bremse ohne Zweck. */
      auto.v -= ueber * 40 * dt;
      /* Der Hinweis erscheint erst bei deutlichem Ueberschreiten. Bei 0.06
         meldete er sich auf diesem kompakten Kurs in der Haelfte aller
         Messungen und wurde zum Dauerlicht. Das Rutschen selbst setzt
         weiterhin frueher ein — es soll spuerbar sein, nicht angesagt. */
      if (ueber > 0.18) auto.rutscht = 0.7;
    }
    /* Zurueck auf die Linie. */
    auto.quer -= auto.quer * Math.min(1, 2.6 * dt);
    var maxQuer = BAHNBREITE * 0.42;
    if (auto.quer > maxQuer) auto.quer = maxQuer;
    if (auto.quer < -maxQuer) auto.quer = -maxQuer;

    if (auto.rutscht > 0) auto.rutscht -= dt;

    var vorher = auto.s;
    auto.s += auto.v * dt;
    if (auto.s >= LAENGE) { auto.s -= LAENGE; rundeVoll(); }
    return vorher;
  }

  /* -------------------------------------------------------- 5. Anzeigen */
  var anzeige = {
    runde:  document.getElementById('anz-runde'),
    zeit:   document.getElementById('anz-zeit'),
    best:   document.getElementById('anz-best'),
    tempo:  document.getElementById('anz-tempo'),
    hinweis: document.getElementById('bahn-hinweis')
  };

  var SPEICHER = 'vioweb-bestzeit';
  var runde = 1, rundenStart = 0, jetztMs = 0, beste = 0;

  try { beste = parseFloat(window.localStorage.getItem(SPEICHER)) || 0; }
  catch (e) { beste = 0; }

  function alsZeit(sek) {
    if (!sek || sek <= 0) return '--:--.--';
    var m = Math.floor(sek / 60);
    var r = sek - m * 60;
    return (m < 10 ? '0' : '') + m + ':' + (r < 10 ? '0' : '') + r.toFixed(2);
  }

  function rundeVoll() {
    var zeit = (jetztMs - rundenStart) / 1000;
    rundenStart = jetztMs;
    /* Die allererste Runde beginnt bei Tempo null und waere nicht
       vergleichbar; sie zaehlt mit, gilt aber nicht als Bestzeit. */
    if (runde > 1 && (beste === 0 || zeit < beste)) {
      beste = zeit;
      try { window.localStorage.setItem(SPEICHER, String(beste)); } catch (e) {}
      melden('Neue Bestzeit');
    } else {
      melden('Nächste Optimierungsrunde');
    }
    runde++;
  }

  var meldungBis = 0, meldungText = '';
  function melden(text) { meldungText = text; meldungBis = jetztMs + 1600; }

  var letzteAnzeige = 0;
  function anzeigenSchreiben() {
    /* Nur zehnmal je Sekunde: haeufiger ist nicht lesbar und kostet Layout. */
    if (jetztMs - letzteAnzeige < 100) return;
    letzteAnzeige = jetztMs;
    if (anzeige.runde) anzeige.runde.textContent = (runde < 10 ? '0' : '') + runde;
    if (anzeige.zeit)  anzeige.zeit.textContent = alsZeit((jetztMs - rundenStart) / 1000);
    if (anzeige.best)  anzeige.best.textContent = alsZeit(beste);
    if (anzeige.tempo) anzeige.tempo.textContent = Math.round(auto.v * 3.6);
    if (anzeige.hinweis) {
      var t = auto.rutscht > 0 ? 'Zu schnell!' : (jetztMs < meldungBis ? meldungText : '');
      if (anzeige.hinweis.textContent !== t) anzeige.hinweis.textContent = t;
    }
  }

  /* --------------------------------------------------------- 4. Zeichnen */
  var F = {
    platte:    '#141119',
    platteHell:'#1E1A28',
    asphalt:   '#26222F',
    asphaltHell:'#2E2938',
    linie:     'rgba(255,255,255,.72)',
    rand:      'rgba(255,255,255,.16)',
    curbRot:   '#B4322E',
    curbWeiss: '#E8E4EE',
    planke:    '#3A3446',
    akzent:    '#7C3AED',
    akzentHell:'#C4B5FD'
  };

  /* Ein Streckenband zeichnen: Aussenkante hin, Innenkante zurueck. */
  function band(halb, versatz) {
    var m = PUNKTE.length, i, p, q;
    stift.beginPath();
    for (i = 0; i <= m; i++) {
      p = PUNKTE[i % m];
      q = proj(p.x - p.dy * (versatz + halb), p.y + p.dx * (versatz + halb), p.z);
      if (i === 0) stift.moveTo(q.x, q.y); else stift.lineTo(q.x, q.y);
    }
    for (i = m; i >= 0; i--) {
      p = PUNKTE[i % m];
      q = proj(p.x - p.dy * (versatz - halb), p.y + p.dx * (versatz - halb), p.z);
      stift.lineTo(q.x, q.y);
    }
    stift.closePath();
  }

  /* Die Platte, auf der die Bahn liegt. Eigene Funktion, damit die hinteren
     Banden zwischen Platte und Bahn gezeichnet werden koennen. */
  function grundZeichnen() {
    var g = stift.createRadialGradient(mitteX, mitteY, 10,
                                       mitteX, mitteY, Math.max(leinwand.w, leinwand.h) * .75);
    g.addColorStop(0, F.platteHell);
    g.addColorStop(1, F.platte);
    stift.fillStyle = g;
    stift.fillRect(0, 0, leinwand.w, leinwand.h);
  }

  function bahnZeichnen() {
    /* Schatten der Bahn auf der Platte. */
    stift.save();
    stift.translate(0, 7);
    band(BAHNBREITE / 2 + 2.5, 0);
    stift.fillStyle = 'rgba(0,0,0,.42)';
    stift.fill();
    stift.restore();

    /* Bahnkoerper. */
    band(BAHNBREITE / 2 + 2.2, 0);
    stift.fillStyle = F.planke;
    stift.fill();

    band(BAHNBREITE / 2, 0);
    stift.fillStyle = F.asphalt;
    stift.fill();

    /* Mittelstreifen zwischen den beiden Spuren, gestrichelt. */
    var m = PUNKTE.length, i, p, q;
    stift.strokeStyle = F.linie;
    stift.lineWidth = Math.max(1, 1.1 * mass);
    stift.beginPath();
    for (i = 0; i < m; i++) {
      if (i % 8 > 4) continue;
      p = PUNKTE[i];
      q = proj(p.x, p.y, p.z);
      var r = proj(PUNKTE[(i + 1) % m].x, PUNKTE[(i + 1) % m].y, PUNKTE[(i + 1) % m].z);
      stift.moveTo(q.x, q.y); stift.lineTo(r.x, r.y);
    }
    stift.stroke();

    /* Aussen- und Innenkante durchgezogen. */
    [-1, 1].forEach(function (seite) {
      stift.beginPath();
      for (i = 0; i <= m; i++) {
        p = PUNKTE[i % m];
        var o = seite * (BAHNBREITE / 2 - 1.4);
        q = proj(p.x - p.dy * o, p.y + p.dx * o, p.z);
        if (i === 0) stift.moveTo(q.x, q.y); else stift.lineTo(q.x, q.y);
      }
      stift.strokeStyle = F.rand;
      stift.lineWidth = Math.max(1, .9 * mass);
      stift.stroke();
    });

    /* Curbs nur dort, wo wirklich eine Kurve ist, und nur auf der
       Innenseite — genau da, wo ein Fahrzeug sie mitnimmt. Vorher lagen sie
       beidseitig fast um den ganzen Kurs und die Bahn sah unruhig aus.
       Die Farbe wechselt alle drei Abschnitte, sonst flimmert das Muster. */
    for (i = 0; i < m; i++) {
      p = PUNKTE[i];
      if (p.k < 0.022) continue;
      var vor = PUNKTE[(i - 1 + m) % m];
      var dreh = vor.dx * p.dy - vor.dy * p.dx;      /* > 0 = Linkskurve */
      var innen = dreh > 0 ? 1 : -1;
      var o1 = innen * (BAHNBREITE / 2), o2 = innen * (BAHNBREITE / 2 + 2.4);
      var a1 = proj(p.x - p.dy * o1, p.y + p.dx * o1, p.z);
      var a2 = proj(p.x - p.dy * o2, p.y + p.dx * o2, p.z);
      var nx = PUNKTE[(i + 1) % m];
      var b1 = proj(nx.x - nx.dy * o1, nx.y + nx.dx * o1, nx.z);
      var b2 = proj(nx.x - nx.dy * o2, nx.y + nx.dx * o2, nx.z);
      stift.beginPath();
      stift.moveTo(a1.x, a1.y); stift.lineTo(a2.x, a2.y);
      stift.lineTo(b2.x, b2.y); stift.lineTo(b1.x, b1.y);
      stift.closePath();
      stift.fillStyle = (Math.floor(i / 3) % 2) ? F.curbRot : F.curbWeiss;
      stift.fill();
    }

    /* Start- und Ziellinie: Schachbrett quer ueber die Bahn, davor eine
       durchgezogene weisse Linie. Vorher war der Streifen so schmal, dass
       er im Bild kaum zu sehen war. */
    var st = PUNKTE[0], felder = 10;
    for (i = 0; i < felder; i++) {
      var u1 = -BAHNBREITE / 2 + BAHNBREITE * i / felder;
      var u2 = -BAHNBREITE / 2 + BAHNBREITE * (i + 1) / felder;
      var c1 = proj(st.x - st.dy * u1, st.y + st.dx * u1, st.z);
      var c2 = proj(st.x - st.dy * u2, st.y + st.dx * u2, st.z);
      var nx2 = PUNKTE[5];
      var c3 = proj(nx2.x - nx2.dy * u2, nx2.y + nx2.dx * u2, nx2.z);
      var c4 = proj(nx2.x - nx2.dy * u1, nx2.y + nx2.dx * u1, nx2.z);
      stift.beginPath();
      stift.moveTo(c1.x, c1.y); stift.lineTo(c2.x, c2.y);
      stift.lineTo(c3.x, c3.y); stift.lineTo(c4.x, c4.y);
      stift.closePath();
      stift.fillStyle = (i % 2) ? '#EFEDF3' : '#211D2A';
      stift.fill();
    }
  }

  /* Werbebanden am Streckenrand. Die Begriffe sind Pruefbereiche von
     Vioweb — die Strecke soll das Angebot streifen, nicht bewerben.
     Sie stehen auf den Geraden und der weiten Rechtskurve, also dort, wo
     Platz ist. Angegeben sind Startpunkt und Laenge in Abtastschritten. */
  var BANDEN = [
    { i:  14, n: 18, text: 'VIOWEB', marke: true },
    { i:  52, n: 20, text: 'ANALYSE' },
    { i:  96, n: 22, text: 'PERFORMANCE' },
    { i: 170, n: 14, text: 'SEO' },
    { i: 196, n: 22, text: 'SICHTBARKEIT' },
    { i: 232, n: 24, text: 'CONVERSION' }
  ];

  /* Eine Bande folgt der Kante Punkt fuer Punkt. Als gerader Balken
     zwischen zwei weit entfernten Stellen schnitt sie vorher quer ueber
     die Bahn. */
  function bandeBauen(b) {
    var m = PUNKTE.length, o = BAHNBREITE / 2 + 9, k, p, unten = [];
    for (k = 0; k <= b.n; k++) {
      p = PUNKTE[(b.i + k) % m];
      unten.push(proj(p.x - p.dy * o, p.y + p.dx * o, p.z));
    }
    var mitteIdx = Math.floor(unten.length / 2);
    return { unten: unten, hoehe: 5.5 * mass, mitte: unten[mitteIdx],
             richtung: Math.atan2(unten[mitteIdx + 1].y - unten[mitteIdx - 1].y,
                                  unten[mitteIdx + 1].x - unten[mitteIdx - 1].x),
             daten: b };
  }

  function bandeZeichnen(bd) {
    var u = bd.unten, h = bd.hoehe, i;
    stift.beginPath();
    for (i = 0; i < u.length; i++) (i ? stift.lineTo(u[i].x, u[i].y) : stift.moveTo(u[i].x, u[i].y));
    for (i = u.length - 1; i >= 0; i--) stift.lineTo(u[i].x, u[i].y - h);
    stift.closePath();
    stift.fillStyle = bd.daten.marke ? F.akzent : '#211D2A';
    stift.fill();
    stift.strokeStyle = 'rgba(255,255,255,.10)';
    stift.lineWidth = 1;
    stift.stroke();

    /* Beschriftung nur, wenn sie noch lesbar waere. Auf dem Telefon ist die
       Bande dafuer zu klein — dann bleibt sie eine ruhige Flaeche. */
    var gr = 3.5 * mass;
    if (gr < 7) return;
    stift.save();
    stift.translate(bd.mitte.x, bd.mitte.y - h * .55);
    /* Laeuft die Bande nach links, zeigt ihre Richtung nach hinten und die
       Schrift stuende auf dem Kopf. Eine halbe Drehung stellt sie auf. */
    var dreh = bd.richtung;
    if (dreh > Math.PI / 2 || dreh < -Math.PI / 2) dreh += Math.PI;
    stift.rotate(dreh);
    stift.fillStyle = bd.daten.marke ? '#FFFFFF' : F.akzentHell;
    stift.font = '700 ' + gr.toFixed(1) + 'px Manrope, system-ui, sans-serif';
    stift.textAlign = 'center';
    stift.textBaseline = 'middle';
    stift.fillText(bd.daten.text, 0, 0);
    stift.restore();
  }

  /* Das Fahrzeug: ein kleiner Rennwagen in Aufsicht, aus wenigen Flaechen.
     Bewusst kein nachgebautes Vorbild — eigene, einfache Form. */
  function autoZeichnen() {
    var p = beiS(auto.s);
    var o = auto.quer;
    var mx = p.x - p.dy * o, my = p.y + p.dx * o;
    var mitte = proj(mx, my, p.z);

    /* Mindestgroesse in Bildpunkten: auf dem Telefon ist die Leinwand klein,
       und ein massstaeblich korrektes Auto waere dort ein Fleck von wenigen
       Pixeln. Es waechst deshalb nach unten mit, bis es erkennbar bleibt. */
    var L = Math.max(10.5, 24 / mass), B = L * 0.457;
    function ecke(vor, seit) {
      return proj(mx + p.dx * vor - p.dy * seit, my + p.dy * vor + p.dx * seit, p.z);
    }

    /* Schatten. */
    stift.save();
    stift.translate(0, 4);
    stift.beginPath();
    var sch = [ecke(L * .5, B * .5), ecke(L * .5, -B * .5), ecke(-L * .5, -B * .5), ecke(-L * .5, B * .5)];
    sch.forEach(function (q, i) { i ? stift.lineTo(q.x, q.y) : stift.moveTo(q.x, q.y); });
    stift.closePath();
    stift.fillStyle = 'rgba(0,0,0,.45)';
    stift.fill();
    stift.restore();

    /* Karosserie. */
    stift.beginPath();
    var k = [ecke(L * .5, B * .34), ecke(L * .34, B * .5), ecke(-L * .42, B * .5),
             ecke(-L * .5, B * .3), ecke(-L * .5, -B * .3), ecke(-L * .42, -B * .5),
             ecke(L * .34, -B * .5), ecke(L * .5, -B * .34)];
    k.forEach(function (q, i) { i ? stift.lineTo(q.x, q.y) : stift.moveTo(q.x, q.y); });
    stift.closePath();
    var gv = stift.createLinearGradient(mitte.x - 8, mitte.y - 8, mitte.x + 8, mitte.y + 8);
    gv.addColorStop(0, '#9B6BFF');
    gv.addColorStop(1, F.akzent);
    stift.fillStyle = gv;
    stift.fill();
    /* Heller Rand: hebt das Auto vom dunklen Asphalt ab. Ohne ihn verliert
       man es auf kleinen Leinwaenden aus den Augen. */
    stift.strokeStyle = 'rgba(255,255,255,.55)';
    stift.lineWidth = Math.max(1, .55 * mass);
    stift.stroke();

    /* Cockpit. */
    stift.beginPath();
    var c = [ecke(L * .12, B * .26), ecke(-L * .14, B * .3),
             ecke(-L * .14, -B * .3), ecke(L * .12, -B * .26)];
    c.forEach(function (q, i) { i ? stift.lineTo(q.x, q.y) : stift.moveTo(q.x, q.y); });
    stift.closePath();
    stift.fillStyle = '#171520';
    stift.fill();

    /* Heckfluegel. */
    stift.beginPath();
    var f = [ecke(-L * .46, B * .54), ecke(-L * .56, B * .54),
             ecke(-L * .56, -B * .54), ecke(-L * .46, -B * .54)];
    f.forEach(function (q, i) { i ? stift.lineTo(q.x, q.y) : stift.moveTo(q.x, q.y); });
    stift.closePath();
    stift.fillStyle = '#221E2C';
    stift.fill();

    /* Bremslichter: leuchten, solange gebremst wird. */
    if (bremse) {
      [-1, 1].forEach(function (sd) {
        var q = ecke(-L * .5, sd * B * .3);
        stift.beginPath();
        stift.arc(q.x, q.y, Math.max(1.4, 1.0 * mass), 0, Math.PI * 2);
        stift.fillStyle = '#FF3B30';
        stift.fill();
      });
    }
  }

  /* ---------------------------------------------------------- Zeichenlauf */
  function bild() {
    stift.setTransform(leinwand.dpr, 0, 0, leinwand.dpr, 0, 0);

    /* Banden nach Tiefe sortieren: was oberhalb der Bahnmitte steht, liegt
       hinter der Strecke und wird zuerst gezeichnet. Der Rest kommt danach,
       sonst wuerde die Bahn ihre eigenen Banden verdecken. */
    var banden = BANDEN.map(bandeBauen);
    var mitteBahn = proj(0, 0, 0).y;

    grundZeichnen();
    banden.forEach(function (bd) { if (bd.mitte.y < mitteBahn) bandeZeichnen(bd); });
    bahnZeichnen();
    banden.forEach(function (bd) { if (bd.mitte.y >= mitteBahn) bandeZeichnen(bd); });
    autoZeichnen();
  }

  /* Groesse an den Platz anpassen, scharf auf hochaufloesenden Bildschirmen. */
  function messen() {
    var kasten = leinwand.parentNode.getBoundingClientRect();
    var b = Math.max(240, Math.round(kasten.width));
    var h = Math.max(200, Math.round(kasten.height));
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    leinwand.width = Math.round(b * dpr);
    leinwand.height = Math.round(h * dpr);
    leinwand.style.width = b + 'px';
    leinwand.style.height = h + 'px';
    leinwand.w = b; leinwand.h = h; leinwand.dpr = dpr;
    einpassen(b, h);
    bild();
  }

  /* --------------------------------------------------------- Zeitschleife */
  var laeuft = false, letzte = 0;

  function schritt(t) {
    if (!laeuft) return;
    if (!letzte) letzte = t;
    /* Grosse Spruenge abfangen: nach einem Tabwechsel darf das Auto nicht
       eine halbe Runde weiterspringen. */
    var dt = Math.min((t - letzte) / 1000, 0.05);
    letzte = t;
    jetztMs += dt * 1000;
    fahren(dt);
    bild();
    anzeigenSchreiben();
    window.requestAnimationFrame(schritt);
  }

  function starten() {
    if (laeuft) return;
    laeuft = true; letzte = 0;
    window.requestAnimationFrame(schritt);
  }
  function anhalten() { laeuft = false; }

  /* Im Hintergrund wird nicht gerechnet. */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) anhalten(); else starten();
  });

  /* --------------------------------------------------------- 6. Bedienung */
  function setzen(welche, an) {
    if (welche === 'gas') gas = an; else bremse = an;
    var el = document.getElementById(welche === 'gas' ? 'knopf-gas' : 'knopf-bremse');
    if (el) {
      el.setAttribute('aria-pressed', an ? 'true' : 'false');
      el.classList.toggle('fahrknopf--aktiv', an);
    }
  }

  function knopfBinden(id, welche) {
    var el = document.getElementById(id);
    if (!el) return;
    /* Zeigerereignisse decken Maus, Stift und Finger gemeinsam ab. Damit
       reagiert der Knopf auch beim langen Halten zuverlaessig, und das
       Verlassen mit gedruecktem Finger loest sauber aus. */
    el.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      if (el.setPointerCapture) { try { el.setPointerCapture(e.pointerId); } catch (x) {} }
      setzen(welche, true);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (art) {
      el.addEventListener(art, function () { setzen(welche, false); });
    });
    /* Tastatur: der Knopf ist ein echter <button>, Leertaste und Eingabe
       loesen ihn aus. Gehalten wird ueber keydown/keyup. */
    el.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setzen(welche, true); }
    });
    el.addEventListener('keyup', function (e) {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setzen(welche, false); }
    });
    el.addEventListener('blur', function () { setzen(welche, false); });
  }

  knopfBinden('knopf-gas', 'gas');
  knopfBinden('knopf-bremse', 'bremse');

  /* Tastatur auf der ganzen Seite. Nicht, wenn gerade in einem Feld
     geschrieben wird. */
  var GAS_TASTEN = [' ', 'ArrowUp', 'w', 'W'];
  var BREMS_TASTEN = ['ArrowDown', 's', 'S'];
  function imFeld(e) {
    var t = e.target;
    return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT');
  }
  document.addEventListener('keydown', function (e) {
    if (imFeld(e) || e.repeat) return;
    if (e.target && e.target.id && e.target.id.indexOf('knopf-') === 0) return;
    if (GAS_TASTEN.indexOf(e.key) > -1) { e.preventDefault(); setzen('gas', true); }
    else if (BREMS_TASTEN.indexOf(e.key) > -1) { e.preventDefault(); setzen('bremse', true); }
  });
  document.addEventListener('keyup', function (e) {
    if (imFeld(e)) return;
    if (e.target && e.target.id && e.target.id.indexOf('knopf-') === 0) return;
    if (GAS_TASTEN.indexOf(e.key) > -1) setzen('gas', false);
    else if (BREMS_TASTEN.indexOf(e.key) > -1) setzen('bremse', false);
  });
  /* Fenster verlassen: Gas weg, sonst faehrt das Auto endlos weiter. */
  window.addEventListener('blur', function () { setzen('gas', false); setzen('bremse', false); });

  /* Bestzeit zuruecksetzen. */
  var loeschen = document.getElementById('bestzeit-loeschen');
  if (loeschen) {
    loeschen.addEventListener('click', function () {
      beste = 0;
      try { window.localStorage.removeItem(SPEICHER); } catch (e) {}
      anzeige.best.textContent = alsZeit(0);
      melden('Bestzeit gelöscht');
    });
  }

  /* ------------------------------------------------------------- Anlauf */
  window.addEventListener('resize', messen, { passive: true });
  messen();
  anzeigenSchreiben();

  /* Bei reduzierter Bewegung laeuft die Schleife genauso — das Auto ist
     schliesslich der Zweck der Seite. Was entfaellt, sind die Bewegungen
     drumherum; die stehen im CSS. */
  if (!document.hidden) starten();
})();
