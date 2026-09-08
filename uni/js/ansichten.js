/* =========================================================================
   Campus — Ansichten.

   Jede Funktion beschreibt genau eine Seite und liefert:

     { kopf:  false | { art:'home' } | { titel, zurueck, aktion }
       html:  der Inhalt als Zeichenkette
       titel: der Titel fuers Browserfenster }

   Zwei Regeln gelten durchgehend:

   1. Kein Name, kein Studiengang und kein Semester steht im Markup.
      Alles kommt aus Uni.zustand und Uni.abfrage.
   2. Wo fuer den gewaehlten Studiengang nichts hinterlegt ist, steht ein
      leerer Zustand mit einem Weg nach vorn — nie ersatzweise der Inhalt
      eines anderen Studiengangs.

   Der gesamte Ansichtszustand steckt in der Adresse: gewaehlter Reiter,
   Filter, Kalenderwoche, Suchtext, Onboarding-Schritt. Dadurch ist jede
   Ansicht teilbar und der Zurueck-Knopf des Browsers funktioniert.
   ========================================================================= */
window.Uni = window.Uni || {};

Uni.ansicht = (function () {
  'use strict';

  var b = Uni.baustein;
  var d = Uni.daten;
  var q = Uni.abfrage;
  var z = Uni.zustand;
  var esc = b.esc;

  /* Studiengang, Schulart, Faecher und Semester als eine Zeile — an
     vielen Stellen gebraucht und deshalb nur einmal geschrieben. */
  function studienzeile(mitSemester) {
    var p = z.profil();
    var sg = d.studiengang(p.studiengang);
    var typ = d.lehramtstyp(p.lehramtstyp);
    var teile = [];
    if (mitSemester) teile.push(p.semester + '. Semester');
    if (typ) teile.push(typ.kurz);
    else if (sg) teile.push(sg.kurz);
    var f = faecherNamen();
    if (f) teile.push(f);
    return teile.join(' · ');
  }

  function faecherNamen() {
    return (z.profil().faecher || []).map(function (id) {
      var f = d.fach(id);
      return f ? f.name : id;
    }).join(', ');
  }

  function musterhinweis() {
    return b.hinweis('<b>Musterdaten.</b> Beiträge, Termine und Meldungen in diesem Prototyp sind erfunden und stammen nicht von einer Hochschule.');
  }

  /* --------------------------------------------------------- Home */

  function home() {
    var heute = q.heuteTermine();
    var module = q.moduleSortiert();
    var feed = q.feed();
    var sg = d.studiengang(z.profil().studiengang);

    var html =
      '<section class="u-heute" aria-labelledby="heute-titel">' +
        '<div class="u-heute__kopf">' +
          '<h2 class="u-kicker" id="heute-titel">Heute</h2>' +
          '<a class="u-abschnitt__mehr" href="/uni/kalender/">Kalender</a>' +
        '</div>' +
        (heute.length
          ? heute.map(b.heuteZeile).join('')
          : '<p class="u-klein u-leise" style="padding:.2rem var(--rand) 1.1rem">' + naechsterHinweis() + '</p>') +
      '</section>';

    /* --- Deine Module --- */
    html += '<section class="u-abschnitt" aria-labelledby="module-titel">' +
      '<div class="u-abschnitt__kopf">' +
        '<div>' +
          '<p class="u-kicker">' + esc(studienzeile(true)) + '</p>' +
          '<h2 class="u-titel u-h2" id="module-titel">Deine Module</h2>' +
        '</div>' +
        (module.length ? '<a class="u-abschnitt__mehr" href="/uni/studium/">Alle</a>' : '') +
      '</div>';

    if (module.length) {
      html += '<div class="u-modulreihe">' +
        module.map(b.modulkarte).join('') +
        '<a class="u-modulkarte u-modulkarte--neu" href="/uni/studium/?hinzufuegen=1">' +
          b.zeichen('plus', 20) + '<span>Modul hinzufügen</span></a>' +
      '</div>';
    } else {
      html += leerModul(sg);
    }
    html += '</section>';

    /* --- Für dich --- */
    html += '<section class="u-abschnitt u-abschnitt--linie" aria-labelledby="feed-titel">' +
      '<div class="u-abschnitt__kopf">' +
        '<div>' +
          '<p class="u-kicker">Aus deinen Modulen und vom Campus</p>' +
          '<h2 class="u-titel u-h2" id="feed-titel">Für dich</h2>' +
        '</div>' +
      '</div>' +
      '<div class="u-feed">' + feed.slice(0, 4).map(function (e) { return b.feedEintrag(e); }).join('') + '</div>' +
    '</section>';

    html += entdeckenBlock();

    if (feed.length > 4) {
      html += '<section class="u-abschnitt">' +
        '<div class="u-feed">' + feed.slice(4).map(function (e) { return b.feedEintrag(e); }).join('') + '</div>' +
      '</section>';
    }

    html += '<div style="padding:var(--s-abschnitt) var(--rand) 0">' + musterhinweis() + '</div>';

    return { titel: 'Campus', kopf: { art: 'home' }, html: html };

    function naechsterHinweis() {
      var alle = q.meineTermine().filter(function (t) { return t.datum > d.iso(d.heute()); })
        .sort(function (a, c) { return a.datum < c.datum ? -1 : 1; });
      if (!alle.length) return 'Heute steht nichts an, und weiter vorn ist auch noch nichts eingetragen.';
      return 'Heute steht nichts an. Als Nächstes: ' +
        esc(b.relativ(alle[0].datum) + ', ' + alle[0].start + ' Uhr · ' + alle[0].titel) + '.';
    }
  }

  /* Leerer Zustand, wenn fuer Studiengang und Semester nichts hinterlegt
     ist. Er weicht ausdruecklich NICHT auf einen anderen Studiengang
     aus, sondern bietet die beiden Wege an, die weiterhelfen. */
  function leerModul(sg) {
    var p = z.profil();
    var hs = d.hochschule(p.hochschule);
    var titel, text;

    if (!sg) {
      titel = 'Noch kein Studiengang gewählt';
      text = hs && !hs.angebotErfasst
        ? 'Für ' + hs.name + ' ist das Studienangebot in diesem Prototyp noch nicht erfasst. Du kannst deine Module trotzdem selbst hinzufügen.'
        : 'Wähle im Onboarding deinen Studiengang, dann schlagen wir dir passende Module vor.';
    } else if (!sg.moduleErfasst) {
      titel = 'Für deinen Studiengang sind noch keine Module hinterlegt';
      text = sg.name + ' ist im Studienangebot erfasst, die Modulstruktur aber noch nicht. Wir zeigen dir deshalb keine Module eines anderen Studiengangs, sondern gar keine.';
    } else {
      titel = 'Für diese Kombination haben wir noch keine Module';
      text = 'Zu ' + studienzeile(true) + ' ist hier noch nichts hinterlegt. Du kannst Module selbst hinzufügen oder vorschlagen.';
    }

    return '<div class="u-leer" style="padding-block:var(--s-lg)">' +
      '<p class="u-leer__titel">' + esc(titel) + '</p>' +
      '<p class="u-leer__text">' + esc(text) + '</p>' +
      '<div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:var(--s-md)">' +
        '<button type="button" class="u-knopf" data-tun="modul-suchen">Modul hinzufügen</button>' +
        '<button type="button" class="u-knopf u-knopf--still" data-tun="modul-vorschlagen">Modul vorschlagen</button>' +
      '</div>' +
      (sg && sg.quelle
        ? '<p style="margin-top:var(--s-md)">' + b.quelleZeile(sg.quelle, false) + '</p>'
        : hs && hs.web ? '<p style="margin-top:var(--s-md)">' + b.quelleZeile({ name: hs.name, url: hs.web }, false) + '</p>' : '') +
    '</div>';
  }

  function entdeckenBlock() {
    var floh = q.flohmarkt({}).length;
    return '<section class="u-entdecken">' +
      '<p class="u-kicker" style="color:inherit;opacity:.7">Entdecken</p>' +
      '<h2 class="u-entdecken__titel">Hier passiert was.</h2>' +
      '<p class="u-entdecken__text">Campus, Materialien, Services und der Flohmarkt deiner Hochschule.</p>' +
      '<div class="u-entdecken__gitter">' +
        punkt('Campus', q.campus().length + ' Beiträge', '/uni/entdecken/?bereich=campus') +
        punkt('Materialien', d.materialien.length + ' Angebote', '/uni/entdecken/?bereich=materialien') +
        punkt('Services', d.services.length + ' Anbieter', '/uni/entdecken/?bereich=services') +
        punkt('Flohmarkt', floh ? floh + ' Artikel' : 'noch leer', '/uni/flohmarkt/') +
      '</div>' +
    '</section>';

    function punkt(titel, meta, ziel) {
      return '<a class="u-entdecken__punkt" href="' + esc(ziel) + '">' +
        '<b>' + esc(titel) + '</b><span>' + esc(meta) + '</span></a>';
    }
  }

  /* ------------------------------------------------------ Studium */

  function studium(ctx) {
    var p = z.profil();
    var sg = d.studiengang(p.studiengang);
    var hs = d.hochschule(p.hochschule);
    var module = q.moduleSortiert();
    var gepinnt = module.filter(function (m) { return z.gepinnt(m.slug); });
    var rest = module.filter(function (m) { return !z.gepinnt(m.slug); });
    var frueher = q.frühereModule();
    var ects = module.reduce(function (s, m) { return s + m.ects; }, 0);
    var fristen = q.naechsteFristen(1);

    var html =
      '<section class="u-semesterkopf">' +
        '<p class="u-kicker">' + esc(hs ? hs.name : '') + '</p>' +
        '<h1 class="u-titel u-h1">' + esc(sg ? sg.name : 'Studium') + '</h1>' +
        (sg && sg.abschluss ? '<p class="u-klein u-leise">' + esc(sg.abschluss) + '</p>' : '') +
        '<p class="u-leise">' + esc(unterzeile()) + '</p>' +
        '<div class="u-semesterkopf__zahlen">' +
          zahl(module.length, 'Module') +
          zahl(ects, 'ECTS') +
          zahl(fristen.length ? b.relativ(fristen[0].datum) : '—', 'Nächste Frist') +
        '</div>' +
      '</section>';

    if (!module.length) {
      html += '<section class="u-abschnitt">' + leerModul(sg) + '</section>';
    } else {
      if (gepinnt.length) {
        html += '<section class="u-abschnitt">' +
          b.abschnitt('Angepinnt') +
          '<div class="u-modulreihe">' + gepinnt.map(b.modulkarte).join('') + '</div>' +
        '</section>';
      }
      html += '<section class="u-abschnitt' + (gepinnt.length ? ' u-abschnitt--linie' : '') + '">' +
        '<div class="u-abschnitt__kopf">' +
          '<h2 class="u-titel u-h2">' + (gepinnt.length ? 'Weitere Module' : 'Deine Module') + '</h2>' +
          '<button type="button" class="u-abschnitt__mehr" data-tun="modul-suchen">Hinzufügen</button>' +
        '</div>' +
        (rest.length
          ? '<div class="u-liste">' + rest.map(b.modulzeile).join('') + '</div>'
          : '<p class="u-klein u-leise" style="padding:0 var(--rand)">Alle deine Module sind angepinnt.</p>') +
        '<div style="padding:var(--s-md) var(--rand) 0">' +
          '<button type="button" class="u-knopf u-knopf--still u-knopf--klein" data-tun="modul-suchen">' +
            b.zeichen('plus', 16) + 'Modul hinzufügen</button>' +
        '</div>' +
      '</section>';
    }

    if (frueher.length) {
      html += '<section class="u-abschnitt u-abschnitt--linie">' +
        b.abschnitt('Frühere Semester') +
        '<div class="u-liste">' + frueher.map(b.modulzeile).join('') + '</div>' +
        '<p class="u-klein u-leise" style="padding:var(--s-sm) var(--rand) 0">' +
          'Module aus früheren Semestern deines Studiengangs. Sie zählen nicht ins laufende Semester.</p>' +
      '</section>';
    }

    if (sg) {
      html += '<section class="u-abschnitt u-abschnitt--linie">' +
        '<div style="padding:0 var(--rand)">' +
          (sg.hinweis ? b.hinweis(esc(sg.hinweis)) + '<div style="height:.6rem"></div>' : '') +
          '<p class="u-klein u-leise" style="line-height:1.6;max-width:44ch">' +
            'Studiengang und Struktur sind aus dem öffentlichen Studienangebot übernommen. ' +
            'Modulnamen, Dozenten, Räume und Zeiten in diesem Prototyp sind dagegen Musterdaten.</p>' +
          (sg.quelle ? '<p style="margin-top:.5rem">' + b.quelleZeile(sg.quelle, false) + '</p>' : '') +
          (sg.dokumente ? '<p>' + b.quelleZeile(sg.dokumente, false) + '</p>' : '') +
        '</div>' +
      '</section>';
    }

    return {
      titel: 'Studium', kopf: { titel: 'Studium' }, html: html,
      blatt: ctx.frage.get('hinzufuegen') ? modulBlatt() : null
    };

    function zahl(wert, text) {
      return '<div class="u-semesterkopf__zahl"><b>' + esc(wert) + '</b><span>' + esc(text) + '</span></div>';
    }

    /* Schulart, Faecher, Semester und Semesterbezeichnung. Der
       Studiengang steht schon als Ueberschrift darueber. */
    function unterzeile() {
      var teile = [];
      var typ = d.lehramtstyp(p.lehramtstyp);
      if (typ) teile.push(typ.name);
      var f = faecherNamen();
      if (f) teile.push(f);
      teile.push(p.semester + '. Semester');
      teile.push(d.semesterName);
      return teile.join(' · ');
    }
  }

  /* Blatt zum Hinzufuegen: Vorschlaege aus dem eigenen Studiengang,
     darunter der Weg fuer alles, was noch fehlt. */
  function modulBlatt() {
    var vorschlaege = q.modulvorschlaege();
    var p = z.profil();

    return {
      titel: 'Modul hinzufügen',
      html: '<p class="u-klein u-leise" style="margin:-.3rem 0 .8rem">' +
          (vorschlaege.length
            ? 'Vorschläge für ' + esc(studienzeile(true))
            : 'Für ' + esc(studienzeile(false)) + ' sind noch keine Module hinterlegt.') + '</p>' +
        vorschlaege.slice(0, 8).map(function (m) {
          return '<button type="button" class="u-blatt__punkt" data-tun="modul-hinzufuegen" data-wert="' + esc(m.slug) + '">' +
            '<span class="u-blatt__kachel" data-farbe="' + esc(m.farbe) + '" style="background:var(--modul-zart);color:var(--modul)">' +
              esc(m.kuerzel.slice(0, 3)) + '</span>' +
            '<span><b>' + esc(m.name) + '</b><span>' + esc(modulUnterzeile(m)) + '</span></span>' +
            '</button>';
        }).join('') +
        '<div style="padding-top:var(--s-md)">' +
          b.hinweis('<b>Dein Modul ist nicht dabei?</b> Du kannst es vorschlagen. Vorschläge werden von anderen Studenten deiner Hochschule bestätigt, bevor sie für alle sichtbar sind.') +
          '<button type="button" class="u-knopf u-knopf--still u-knopf--breit" style="margin-top:.7rem" data-tun="modul-vorschlagen">Modul vorschlagen</button>' +
        '</div>'
    };
  }

  /* -------------------------------------------------------- Modul */

  function modul(ctx) {
    var m = d.modul(ctx.teile[1]);
    if (!m) return nichtGefunden();

    var reiter = ctx.frage.get('reiter') || 'feed';
    var t = q.naechsterTermin(m.slug);
    var belegt = z.belegt(m.slug);
    var sg = d.studiengang(m.studiengang);

    var inhalt =
      reiter === 'lernen' ? modulLernen(m, ctx) :
      reiter === 'termine' ? modulTermine(m) :
      reiter === 'dateien' ? modulDateien(m) : modulFeed(m, belegt);

    var html =
      '<header class="u-modulkopf" data-farbe="' + esc(m.farbe) + '">' +
        '<div class="u-modulkopf__zeile">' +
          '<a class="u-modulkopf__zurueck" href="/uni/studium/" aria-label="Zurück zum Studium">' + b.zeichen('zurueck', 22) + '</a>' +
          (belegt
            ? '<button type="button" class="u-modulkopf__aktion" data-tun="pin" data-wert="' + esc(m.slug) + '" ' +
              'aria-pressed="' + (z.gepinnt(m.slug) ? 'true' : 'false') + '" ' +
              'aria-label="' + (z.gepinnt(m.slug) ? 'Modul lösen' : 'Modul anpinnen') + '">' +
              b.zeichen('nadel', 21) + '</button>'
            : '<button type="button" class="u-modulkopf__aktion" data-tun="modul-hinzufuegen" data-wert="' + esc(m.slug) + '" aria-label="Modul belegen">' +
              b.zeichen('plus', 22) + '</button>') +
        '</div>' +
        '<p class="u-modulkopf__kuerzel">' + esc(m.kuerzel) + (z.gepinnt(m.slug) ? ' · angepinnt' : '') + '</p>' +
        '<h1 class="u-modulkopf__name">' + esc(m.name) + '</h1>' +
        '<p class="u-modulkopf__meta">' + esc(kopfzeile()) + '</p>' +
        (t ? '<p class="u-modulkopf__naechst">' + b.zeichen('uhr', 14) +
              esc(b.relativ(t.datum) + ' · ' + t.start + (t.ort ? ' · ' + t.ort : '')) + '</p>' : '') +
      '</header>' +

      (belegt ? '' :
        '<div style="padding:var(--s-md) var(--rand) 0">' +
          b.hinweis('Du belegst dieses Modul nicht. Es gehört zu ' + esc(sg ? sg.name : 'einem anderen Studiengang') +
            ', ' + m.semester + '. Semester.') +
        '</div>') +

      '<div class="u-modulreiter" data-farbe="' + esc(m.farbe) + '">' +
        '<div class="u-reiter u-reiter--modul" role="tablist">' +
          reiterPunkt('Feed', 'feed') + reiterPunkt('Lernen', 'lernen') +
          reiterPunkt('Termine', 'termine') + reiterPunkt('Dateien', 'dateien') +
        '</div>' +
      '</div>' +

      '<div data-farbe="' + esc(m.farbe) + '">' + inhalt + '</div>';

    return { titel: m.name, kopf: false, html: html };

    /* Nur nennen, was bekannt ist. Ein erfundener Dozent waere
       schlimmer als eine fehlende Angabe. */
    function kopfzeile() {
      var teile = [];
      if (m.dozent) teile.push(m.dozent);
      teile.push(d.semesterName);
      if (m.ects) teile.push(m.ects + ' ECTS');
      return teile.join(' · ');
    }

    function reiterPunkt(text, wert) {
      return '<a class="u-reiter__punkt" role="tab" aria-selected="' + (reiter === wert ? 'true' : 'false') + '" ' +
        'href="/uni/modul/' + esc(m.slug) + '/?reiter=' + wert + '">' + esc(text) + '</a>';
    }
  }

  function modulFeed(m) {
    var eintraege = q.feedZuModul(m.slug);
    var services = q.servicesZuModul(m.slug);
    var html = '';

    if (!eintraege.length) {
      html += b.leer('Noch nichts los', 'In diesem Modul hat bisher niemand etwas geschrieben. Eine Frage ist ein guter Anfang.', 'Beitrag schreiben', '/uni/modul/' + m.slug + '/?neu=beitrag');
    } else {
      html += '<div class="u-feed">' + eintraege.map(function (e) { return b.feedEintrag(e, true); }).join('') + '</div>';
    }

    html += '<section class="u-abschnitt">' +
      '<div style="padding:0 var(--rand)">' +
        '<div class="u-karte">' +
          '<p class="u-kicker">Hilfe zum Modul</p>' +
          '<p style="margin:.35rem 0 .8rem;font-size:.93rem;line-height:1.5">' +
            (services.length === 1
              ? esc('Ein Student bietet Unterstützung zu ' + m.name + ' an.')
              : services.length
                ? esc(services.length + ' Studenten bieten Unterstützung zu ' + m.name + ' an.')
                : 'Für dieses Modul bietet bisher niemand Unterstützung an.') + '</p>' +
          '<div style="display:flex;gap:.5rem;flex-wrap:wrap">' +
            '<a class="u-knopf u-knopf--klein" href="/uni/entdecken/?bereich=services&modul=' + esc(m.slug) + '">Nachhilfe suchen</a>' +
            '<button type="button" class="u-knopf u-knopf--still u-knopf--klein" data-tun="service-anbieten">Nachhilfe anbieten</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>';

    var fehlt = [];
    if (!m.dozent) fehlt.push('Dozent');
    if (!m.pruefung) fehlt.push('Prüfungsform');
    if ((m.plan || []).some(function (x) { return !x.ort; })) fehlt.push('Raum');

    var angaben = [];
    if (m.pruefung) angaben.push('Prüfung: ' + m.pruefung);
    if (m.teilnehmer) angaben.push(m.teilnehmer + ' Studenten folgen diesem Modul');
    var sgm = d.studiengang(m.studiengang);
    var dok = d.studiendokumente(m.studiengang);

    html += '<section class="u-abschnitt u-abschnitt--linie">' +
      b.abschnitt('Über das Modul') +
      '<div style="padding:0 var(--rand)">' +
        '<p style="font-size:.95rem;line-height:1.6;max-width:46ch">' + esc(m.beschreibung) + '</p>' +
        (angaben.length ? '<p class="u-klein u-leise" style="margin-top:.6rem">' + esc(angaben.join(' · ')) + '</p>' : '') +
        (sgm ? '<p class="u-klein u-leise" style="margin-top:.3rem">' + esc(sgm.name +
          (m.gruppe ? ' · ' + gruppenName(m.gruppe) : '')) + '</p>' : '') +
        '<div style="margin-top:var(--s-md);display:grid;gap:.6rem">' +
          b.hinweis('<b>Musterdaten.</b> Modulname, Zeiten und Beiträge in diesem Prototyp sind erfunden. ' +
            'Die verbindlichen Angaben stehen im Modulhandbuch deiner Hochschule.') +
          (fehlt.length
            ? b.hinweis('Nicht hinterlegt: ' + esc(fehlt.join(', ')) +
              '. Wir tragen hier nichts ein, wofür uns keine Quelle vorliegt.')
            : '') +
        '</div>' +
        (dok ? '<p style="margin-top:.7rem">' + b.quelleZeile(dok, false) + '</p>' : '') +
      '</div>' +
    '</section>';

    return html;
  }

  function modulLernen(m, ctx) {
    var typ = ctx.frage.get('typ') || '';
    var sortierung = ctx.frage.get('sortierung') || 'bewertung';
    var liste = q.materialien({ modul: m.slug, typ: typ || null, sortierung: sortierung });
    var services = q.servicesZuModul(m.slug);
    var alle = q.materialienZuModul(m.slug);

    var typen = [{ wert: '', text: 'Alle' }];
    var gesehen = {};
    alle.forEach(function (x) {
      if (!gesehen[x.typ]) { gesehen[x.typ] = true; typen.push({ wert: x.typ, text: b.TYPNAME[x.typ] || x.typ }); }
    });

    var html = '';
    if (alle.length) {
      html += b.filterleiste(typen, typ, 'filter-typ') +
        '<div class="u-filter" style="padding-top:0">' + sortierpillen(sortierung) + '</div>';
    }

    if (!liste.length) {
      html += b.leer('Noch keine Materialien',
        alle.length
          ? 'Unter diesem Filter gibt es nichts. Nimm den Filter heraus oder stelle selbst etwas ein.'
          : 'Für dieses Modul hat noch niemand etwas eingestellt. Du kannst der Erste sein.',
        'Material einstellen', '/uni/studium/?neu=material');
    } else {
      html += '<div class="u-liste">' + liste.map(b.materialzeile).join('') + '</div>';
    }

    if (services.length) {
      html += '<section class="u-abschnitt">' +
        b.abschnitt('Services zum Modul') +
        '<div class="u-liste">' + services.map(serviceZeile).join('') + '</div>' +
      '</section>';
    }

    html += '<div style="padding:var(--s-abschnitt) var(--rand) 0">' +
      b.hinweis('Preise legen die Studenten selbst fest. Einstellen kostet nichts. Im Prototyp ist kein Zahlungsanbieter angebunden.') +
    '</div>';

    return html;
  }

  function gruppenName(g) {
    return {
      bildungswissenschaften: 'Bildungswissenschaften', schulart: 'Schulartspezifisch',
      fachwissenschaft: 'Fachwissenschaft', fachdidaktik: 'Fachdidaktik', praktikum: 'Schulpraktische Studien'
    }[g] || g;
  }

  function sortierpillen(aktiv) {
    return ['bewertung', 'neu', 'preis'].map(function (s) {
      var text = { bewertung: 'Beste Bewertung', neu: 'Neu', preis: 'Preis' }[s];
      return '<button type="button" class="u-filter__pille" data-tun="filter-sortierung" data-wert="' + s + '" ' +
        'aria-pressed="' + (aktiv === s ? 'true' : 'false') + '">' + esc(text) + '</button>';
    }).join('');
  }

  function modulTermine(m) {
    var jetzt = d.iso(d.heute());
    var liste = d.termine.filter(function (t) { return t.modul === m.slug && t.datum >= jetzt; })
      .sort(function (a, c) { return a.datum === c.datum ? (a.start < c.start ? -1 : 1) : (a.datum < c.datum ? -1 : 1); })
      .slice(0, 12);

    if (!liste.length) return b.leer('Keine Termine', 'Für dieses Modul ist nichts eingetragen.', 'Zum Kalender', '/uni/kalender/');

    var html = '';
    var letztesDatum = '';
    liste.forEach(function (t) {
      if (t.datum !== letztesDatum) {
        html += '<p class="u-tagliste__kopf">' + esc(b.datumLang(t.datum)) + '</p>';
        letztesDatum = t.datum;
      }
      html += b.terminzeile(t);
    });
    return '<div>' + html + '</div>' +
      '<div style="padding:var(--s-abschnitt) var(--rand) 0">' +
        b.hinweis('Wiederkehrende Veranstaltungen kommen aus dem Stundenplan des Moduls. Offizielle Termine der Hochschule sind nicht angebunden.') +
      '</div>';
  }

  function modulDateien(m) {
    var gekauft = q.gekaufteMaterialien().filter(function (x) { return x.modul === m.slug; });
    var favoriten = q.favorisierteMaterialien().filter(function (x) { return x.modul === m.slug; });

    return '<section class="u-abschnitt" style="margin-top:var(--s-lg)">' +
        b.abschnitt('Gekauft') +
        (gekauft.length
          ? '<div class="u-liste">' + gekauft.map(b.materialzeile).join('') + '</div>'
          : '<p class="u-klein u-leise" style="padding:0 var(--rand)">Du hast für dieses Modul noch nichts gekauft.</p>') +
      '</section>' +
      '<section class="u-abschnitt">' +
        b.abschnitt('Gemerkt') +
        (favoriten.length
          ? '<div class="u-liste">' + favoriten.map(b.materialzeile).join('') + '</div>'
          : '<p class="u-klein u-leise" style="padding:0 var(--rand)">Nichts gemerkt.</p>') +
      '</section>' +
      '<section class="u-abschnitt">' +
        b.abschnitt('Eigene Dateien') +
        '<div style="padding:0 var(--rand)">' +
          b.hinweis('<b>Noch kein Speicher angebunden.</b> Eigene Dateien landen später hier — hochgeladen wird im Prototyp nichts.') +
        '</div>' +
      '</section>';
  }

  function serviceZeile(s) {
    var p = d.person(s.anbieter);
    return '<a class="u-material" href="/uni/service/' + esc(s.slug) + '/" data-farbe="tanne">' +
      '<span class="u-material__kachel"><b style="font-size:1.15rem">' + esc(s.kategorie.charAt(0)) + '</b>' +
        '<span>Service</span></span>' +
      '<span class="u-material__text">' +
        '<span class="u-material__titel">' + esc(s.titel) + '</span>' +
        '<span class="u-material__meta">' + esc(s.kategorie) + (p ? ' · ' + esc(p.name) : '') +
          ' · ' + esc(s.ort) + ' · ' + b.sterne(s.bewertung, s.anzahlBewertungen) + '</span>' +
      '</span>' +
      '<span class="u-material__rechts">' +
        '<span class="u-material__preis">' + b.preis(s.preis) + '</span>' +
        '<span class="u-klein u-leise">je ' + esc(s.einheit) + '</span>' +
      '</span>' +
      '</a>';
  }

  /* ----------------------------------------------------- Kalender */

  function kalender(ctx) {
    var heuteIso = d.iso(d.heute());
    var gewaehlt = ctx.frage.get('tag') || heuteIso;
    var montag = d.montag(b.ausIso(gewaehlt));
    var tage = [];
    for (var i = 0; i < 7; i++) tage.push(d.iso(d.plus(montag, i)));

    var vorher = d.iso(d.plus(montag, -7));
    var nachher = d.iso(d.plus(montag, 7));
    var desTages = q.termineAm(gewaehlt);
    var demnaechst = q.naechsteFristen(3, gewaehlt);

    var html =
      '<div class="u-kalkopf">' +
        '<div class="u-kalkopf__zeile">' +
          '<span class="u-kalkopf__spanne">' + esc(spannenText(tage[0], tage[6])) + '</span>' +
          '<span class="u-kalkopf__knoepfe">' +
            '<a class="u-rundknopf" href="/uni/kalender/?tag=' + vorher + '" aria-label="Woche zurück">' + b.zeichen('zurueck', 20) + '</a>' +
            '<a class="u-rundknopf" href="/uni/kalender/?tag=' + heuteIso + '" aria-label="Zu heute">' + b.zeichen('kalender', 19) + '</a>' +
            '<a class="u-rundknopf" href="/uni/kalender/?tag=' + nachher + '" aria-label="Woche vor">' + b.zeichen('weiter', 20) + '</a>' +
          '</span>' +
        '</div>' +
        '<div class="u-woche">' + tage.map(tagKnopf).join('') + '</div>' +
      '</div>';

    html += '<p class="u-tagliste__kopf">' + esc(b.datumLang(gewaehlt)) +
      (gewaehlt === heuteIso ? ' <span class="u-leise" style="font-size:.8rem">· heute</span>' : '') + '</p>';

    html += desTages.length
      ? desTages.map(terminMitCheckliste).join('')
      : '<p class="u-leise u-klein" style="padding:.2rem var(--rand) 0">An diesem Tag steht nichts an.</p>';

    html += '<section class="u-abschnitt u-abschnitt--linie">' +
      b.abschnitt('Demnächst') +
      (demnaechst.length
        ? '<div class="u-liste">' + demnaechst.map(function (t) { return b.terminzeile(t, true); }).join('') + '</div>'
        : '<p class="u-klein u-leise" style="padding:0 var(--rand)">Keine Prüfungen oder Abgaben eingetragen.</p>') +
    '</section>';

    html += '<section class="u-abschnitt">' +
      '<div style="padding:0 var(--rand);display:grid;gap:.6rem">' +
        b.hinweis('<b>Erinnerungen.</b> Prüfungen erinnern standardmäßig 7 Tage und 1 Tag vorher. Bei Abgaben entscheidest du selbst.') +
        b.hinweis('Der Abgleich mit Google Kalender und Apple Kalender ist vorbereitet, aber im Prototyp nicht angebunden.') +
      '</div>' +
    '</section>';

    return {
      titel: 'Kalender',
      kopf: { titel: 'Kalender', aktion: { tun: 'schnellmenue', text: 'Neu', zeichen: 'plus' } },
      html: html
    };

    function tagKnopf(isoTag) {
      var dt = b.ausIso(isoTag);
      var farben = q.termineAm(isoTag).slice(0, 4).map(function (t) {
        var m = t.modul ? d.modul(t.modul) : null;
        return '<i data-farbe="' + esc(m ? m.farbe : 'stein') + '"></i>';
      });
      return '<a class="u-tag" href="/uni/kalender/?tag=' + isoTag + '" ' +
        'aria-pressed="' + (isoTag === gewaehlt ? 'true' : 'false') + '" data-heute="' + (isoTag === heuteIso ? 'ja' : 'nein') + '">' +
        '<span>' + b.WOCHENTAG_KURZ[dt.getDay()] + '</span>' +
        '<b>' + dt.getDate() + '</b>' +
        '<span class="u-tag__punkte">' + farben.join('') + '</span>' +
        '</a>';
    }

    function spannenText(von, bis) {
      var a = b.ausIso(von), c = b.ausIso(bis);
      if (a.getMonth() === c.getMonth()) return a.getDate() + '. – ' + c.getDate() + '. ' + b.MONAT[a.getMonth()];
      return a.getDate() + '. ' + b.MONAT[a.getMonth()].slice(0, 3) + '. – ' + c.getDate() + '. ' + b.MONAT[c.getMonth()].slice(0, 3) + '.';
    }
  }

  /* Abgaben tragen eine Checkliste. Die Haken sind echt und bleiben
     erhalten — sie liegen in zustand.js. */
  function terminMitCheckliste(t) {
    var html = b.terminzeile(t);
    if (!t.checkliste) return html;

    var grund = [];
    t.checkliste.forEach(function (p, i) { if (p.erledigt) grund.push(i); });
    var gesetzt = z.hakenVorhanden(t.id) ? z.hakenListe(t.id) : grund;

    return html + '<div style="padding:0 var(--rand) .9rem calc(var(--rand) + 62px);display:grid;gap:.4rem">' +
      t.checkliste.map(function (p, i) {
        var an = gesetzt.indexOf(i) > -1;
        return '<button type="button" data-tun="haken" data-wert="' + esc(t.id) + '" data-nr="' + i + '" ' +
          'data-grund="' + esc(grund.join(',')) + '" aria-pressed="' + (an ? 'true' : 'false') + '" ' +
          'style="display:flex;gap:.55rem;align-items:center;text-align:left;min-height:36px;font-size:.88rem;' +
          (an ? 'color:var(--text-leise);text-decoration:line-through' : '') + '">' +
          '<span style="flex:none;width:17px;height:17px;border-radius:4px;display:grid;place-items:center;border:1.5px solid ' +
            (an ? 'var(--marke);background:var(--marke);color:var(--marke-auf)' : 'var(--linie)') + '">' +
            (an ? b.zeichen('haken', 11) : '') + '</span>' +
          esc(p.text) + '</button>';
      }).join('') + '</div>';
  }

  /* ---------------------------------------------------- Entdecken */

  function entdecken(ctx) {
    var bereich = ctx.frage.get('bereich') || '';
    var campusSlug = ctx.frage.get('campus');
    var modulFilter = ctx.frage.get('modul');

    if (campusSlug) {
      var c = d.campusEintrag(campusSlug);
      if (c) return campusSeite(c);
    }

    var reiter = [
      { wert: '', text: 'Für dich' },
      { wert: 'campus', text: 'Campus' },
      { wert: 'materialien', text: 'Materialien' },
      { wert: 'services', text: 'Services' },
      { wert: 'flohmarkt', text: 'Flohmarkt' }
    ];

    var html = '<div class="u-reiter" role="tablist">' + reiter.map(function (r) {
      return '<a class="u-reiter__punkt" role="tab" aria-selected="' + (bereich === r.wert ? 'true' : 'false') + '" ' +
        'href="/uni/entdecken/' + (r.wert ? '?bereich=' + r.wert : '') + '">' + esc(r.text) + '</a>';
    }).join('') + '</div>';

    if (bereich === 'campus') html += campusListe();
    else if (bereich === 'materialien') html += materialBereich(ctx);
    else if (bereich === 'services') html += serviceBereich(modulFilter);
    else if (bereich === 'flohmarkt') html += flohmarktBereich();
    else html += empfehlungen();

    return { titel: 'Entdecken', kopf: { titel: 'Entdecken', zurueck: '/uni/' }, html: html };
  }

  function campusSeite(c) {
    var art = { hinweis: 'Hinweis', event: 'Veranstaltung', angebot: 'Angebot', wegweiser: 'Wegweiser' }[c.art] || 'Campus';
    return {
      titel: c.titel,
      kopf: { titel: 'Campus', zurueck: '/uni/entdecken/?bereich=campus' },
      html: '<article style="padding:var(--s-lg) var(--rand)">' +
        '<p class="u-kicker">' + esc(art) + ' · ' + esc(b.relativ(c.datum)) + '</p>' +
        '<h1 class="u-titel u-h1" style="margin:.3rem 0 .7rem">' + esc(c.titel) + '</h1>' +
        '<p style="font-size:1rem;line-height:1.65;max-width:46ch">' + esc(c.text) + '</p>' +
        '<p style="margin-top:var(--s-lg)">' + b.quelleZeile(c.quelle, c.muster) + '</p>' +
        (c.muster
          ? '<div style="margin-top:var(--s-md)">' + musterhinweis() + '</div>'
          : '') +
        '</article>'
    };
  }

  function campusListe() {
    var liste = q.campus();
    return '<div style="padding:var(--s-md) var(--rand) 0">' + musterhinweis() + '</div>' +
      '<div class="u-feed" style="margin-top:var(--s-xs)">' + liste.map(b.campusEintrag).join('') + '</div>';
  }

  function empfehlungen() {
    var material = q.materialZuMeinenModulen().slice(0, 3);
    var services = q.serviceZuMeinenModulen();
    if (services.length < 3) {
      services = services.concat(d.services.filter(function (s) {
        return services.indexOf(s) === -1 && (!s.module || !s.module.length);
      }));
    }
    services = services.slice(0, 3);
    var neueste = q.flohmarkt({}).slice(0, 3);
    var campus = q.campus().slice(0, 3);
    var hs = d.hochschule(z.profil().hochschule);

    var html = '<section class="u-abschnitt" style="margin-top:var(--s-lg)">' +
        '<div style="padding:0 var(--rand)">' +
          '<h1 class="u-titel u-h1">Hier passiert was.</h1>' +
          '<p class="u-leise" style="margin-top:.35rem;max-width:44ch">' +
            esc('Empfehlungen für ' + studienzeile(true) + (hs ? ' an der ' + hs.kurz : '') + '.') + '</p>' +
        '</div>' +
      '</section>';

    html += '<section class="u-abschnitt u-abschnitt--linie">' +
      b.abschnitt('Vom Campus', 'Alle', '/uni/entdecken/?bereich=campus') +
      '<div class="u-feed">' + campus.map(b.campusEintrag).join('') + '</div>' +
    '</section>';

    html += '<section class="u-abschnitt u-abschnitt--linie">' +
      b.abschnitt('Passend zu deinen Modulen', 'Alle', '/uni/entdecken/?bereich=materialien') +
      (material.length
        ? '<div class="u-liste">' + material.map(b.materialzeile).join('') + '</div>'
        : '<p class="u-klein u-leise" style="padding:0 var(--rand)">Zu deinen Modulen gibt es noch kein Material. Unter „Materialien“ findest du alles, was andere eingestellt haben.</p>') +
    '</section>';

    html += '<section class="u-abschnitt u-abschnitt--linie">' +
      b.abschnitt('Hilfe von Studenten', 'Alle', '/uni/entdecken/?bereich=services') +
      '<div class="u-liste">' + services.map(serviceZeile).join('') + '</div>' +
    '</section>';

    html += '<section class="u-abschnitt u-abschnitt--linie">' +
      b.abschnitt('Neu auf dem Flohmarkt', 'Alle', '/uni/flohmarkt/') +
      (neueste.length
        ? '<div class="u-floh">' + neueste.map(b.flohkarte).join('') + '</div>'
        : '<p class="u-klein u-leise" style="padding:0 var(--rand)">An deiner Hochschule steht gerade nichts zum Verkauf.</p>') +
    '</section>';

    return html;
  }

  function materialBereich(ctx) {
    var typ = ctx.frage.get('typ') || '';
    var sortierung = ctx.frage.get('sortierung') || 'bewertung';
    var liste = q.materialien({ typ: typ || null, sortierung: sortierung });

    var typen = [{ wert: '', text: 'Alle' }];
    Object.keys(b.TYPNAME).forEach(function (t) {
      if (d.materialien.some(function (m) { return m.typ === t; })) typen.push({ wert: t, text: b.TYPNAME[t] });
    });

    return b.filterleiste(typen, typ, 'filter-typ') +
      '<div class="u-filter" style="padding-top:0">' + sortierpillen(sortierung) + '</div>' +
      (liste.length
        ? '<div class="u-liste">' + liste.map(b.materialzeile).join('') + '</div>'
        : b.leer('Nichts gefunden', 'Unter diesem Filter gibt es kein Material.', 'Filter zurücksetzen', '/uni/entdecken/?bereich=materialien'));
  }

  function serviceBereich(modulFilter) {
    var liste = modulFilter ? q.servicesZuModul(modulFilter) : q.alleServices();
    var m = modulFilter ? d.modul(modulFilter) : null;
    return (m ? '<p class="u-klein u-leise" style="padding:var(--s-md) var(--rand) 0">Gefiltert nach ' + esc(m.name) +
        ' · <a href="/uni/entdecken/?bereich=services" style="color:var(--marke);font-weight:600">Filter entfernen</a></p>' : '') +
      (liste.length
        ? '<div class="u-liste" style="margin-top:var(--s-sm)">' + liste.map(serviceZeile).join('') + '</div>'
        : b.leer('Noch keine Services', 'Für dieses Modul bietet bisher niemand Unterstützung an.', 'Alle Services', '/uni/entdecken/?bereich=services')) +
      '<div style="padding:var(--s-abschnitt) var(--rand) 0">' +
        b.hinweis('Services werden nicht sofort gebucht. Du schreibst dem Anbieter, ihr klärt Termin und Umfang im Chat.') +
      '</div>';
  }

  function flohmarktBereich() {
    var liste = q.flohmarkt({}).slice(0, 6);
    return (liste.length
      ? '<div class="u-floh">' + liste.map(b.flohkarte).join('') + '</div>'
      : b.leer('Noch nichts eingestellt', 'An deiner Hochschule steht gerade nichts zum Verkauf.', 'Etwas einstellen', '/uni/flohmarkt/')) +
      '<div style="padding:0 var(--rand)">' +
        '<a class="u-knopf u-knopf--still u-knopf--breit" href="/uni/flohmarkt/">Zum Flohmarkt</a>' +
      '</div>';
  }

  /* ------------------------------------------- Material: Liste */

  function materialListe(ctx) {
    return { titel: 'Materialien', kopf: { titel: 'Materialien', zurueck: '/uni/entdecken/' }, html: materialBereich(ctx) };
  }

  /* ------------------------------------------ Material: Detail */

  function material(ctx) {
    var mat = d.material(ctx.teile[1]);
    if (!mat) return nichtGefunden();

    var m = mat.modul ? d.modul(mat.modul) : null;
    var v = d.person(mat.verkaeufer);
    var gekauft = z.gekauft(mat.slug);
    var favorit = z.favorit(mat.slug);
    var hs = v ? d.hochschule(v.hochschule) : null;

    var html = '<div data-farbe="' + esc(m ? m.farbe : 'stein') + '">' +
      '<div class="u-produkt__kopf">' +
        '<div class="u-produkt__reihe">' +
          '<span class="u-produkt__kachel"><b>' + esc(mat.dateityp.split(' ')[0]) + '</b><span>' + esc(mat.umfang) + '</span></span>' +
          '<div style="min-width:0">' +
            '<p class="u-kicker">' + esc(b.TYPNAME[mat.typ] || mat.typ) + (m ? ' · ' + esc(m.name) : '') + '</p>' +
            '<h1 class="u-produkt__titel">' + esc(mat.titel) + '</h1>' +
            '<p class="u-produkt__ersteller">' +
              '<a href="/uni/profil/?person=' + esc(v.id) + '" style="font-weight:700;color:var(--text)">' + esc(v.name) + '</a>' +
              (v.verifiziert ? b.verifiziert() : '') +
              '<span>· ' + b.sterne(mat.bewertung, mat.anzahlBewertungen) + '</span>' +
            '</p>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="u-produkt__kauf">' +
        '<span class="u-produkt__preis">' + b.preis(mat.preis) +
          '<small>' + (gekauft ? 'gekauft' : 'einmalig') + '</small></span>' +
        (gekauft
          ? '<a class="u-knopf" href="/uni/profil/?bereich=dateien">Zu deinen Dateien</a>'
          : '<button type="button" class="u-knopf" data-tun="kaufen" data-wert="' + esc(mat.slug) + '">Kaufen</button>') +
        '<button type="button" class="u-rundknopf" data-tun="favorit" data-wert="' + esc(mat.slug) + '" ' +
          'aria-pressed="' + (favorit ? 'true' : 'false') + '" aria-label="Merken" ' +
          'style="border:1px solid var(--linie);' + (favorit ? 'color:var(--marke)' : '') + '">' +
          b.zeichen('herz', 20) + '</button>' +
      '</div>' +

      '<div class="u-werte">' +
        wert(mat.dateityp, 'Dateiformat') +
        wert(mat.umfang, 'Umfang') +
        wert(b.datumKurz(mat.aktualisiert), 'Aktualisiert') +
        wert(mat.semester ? mat.semester + '. Semester' : 'Semesterfrei', 'Passt zu') +
        wert(mat.verkaeufe + '×', 'Gekauft') +
      '</div>';

    if (mat.typ === 'hausarbeit') {
      html += '<div style="padding:var(--s-md) var(--rand) 0">' +
        b.hinweis('<b>Referenzmaterial, nicht zur direkten Abgabe bestimmt.</b> Hausarbeiten werden vor der Veröffentlichung geprüft und dienen als Beispiel für Aufbau und Zitierweise.', 'warn') +
      '</div>';
    }

    html += '<section class="u-abschnitt">' +
      b.abschnitt('Beschreibung') +
      '<p style="padding:0 var(--rand);font-size:.97rem;line-height:1.6;max-width:46ch">' + esc(mat.beschreibung) + '</p>' +
    '</section>';

    if (mat.vorschau && mat.vorschauText) {
      html += '<section class="u-abschnitt">' +
        b.abschnitt('Vorschau') +
        '<div class="u-vorschau"><h4>Auszug</h4>' + esc(mat.vorschauText).replace(/\n/g, '<br>') + '</div>' +
        '<p class="u-klein u-leise" style="padding:.5rem var(--rand) 0">Die Vorschau ist kostenlos. Wie viel sichtbar ist, entscheidet der Ersteller.</p>' +
      '</section>';
    } else {
      html += '<section class="u-abschnitt"><div style="padding:0 var(--rand)">' +
        b.hinweis('Für dieses Material hat der Ersteller keine Vorschau freigegeben.') + '</div></section>';
    }

    html += '<section class="u-abschnitt u-abschnitt--linie">' +
      b.abschnitt('Bewertungen') +
      '<div style="padding:0 var(--rand) .3rem">' + b.sterne(mat.bewertung, mat.anzahlBewertungen) + '</div>' +
      '<div class="u-liste">' + (mat.rezensionen || []).map(function (r) {
        return '<div class="u-rezension">' +
          '<div class="u-rezension__kopf"><b>' + esc(r.von) + '</b>' + b.sterne(r.sterne) +
            '<span class="u-leise">· ' + esc(b.datumKurz(r.datum)) + '</span></div>' +
          '<p>' + esc(r.text) + '</p></div>';
      }).join('') + '</div>' +
    '</section>';

    html += '<section class="u-abschnitt u-abschnitt--linie">' +
      b.abschnitt('Ersteller') +
      '<div style="padding:0 var(--rand)">' +
        '<div class="u-karte">' +
          '<div style="display:flex;gap:.7rem;align-items:center">' +
            '<span class="u-inbox__bild" data-farbe="' + esc(m ? m.farbe : 'stein') + '">' + esc(v.kuerzel) + '</span>' +
            '<div style="flex:1;min-width:0">' +
              '<div style="font-weight:700;display:flex;align-items:center;gap:.35rem">' + esc(v.name) +
                (v.verifiziert ? b.verifiziert(false) : '') + '</div>' +
              '<div class="u-klein u-leise">' + b.sterne(v.bewertung, v.anzahlBewertungen) + ' · ' +
                esc(v.verkaeufe + ' Verkäufe · ' + (hs ? hs.kurz : '')) + '</div>' +
            '</div>' +
            '<button type="button" class="u-knopf u-knopf--still u-knopf--klein" data-tun="folgen" data-wert="' + esc(v.id) + '">' +
              (z.folgt(v.id) ? 'Folgt' : 'Folgen') + '</button>' +
          '</div>' +
          '<p class="u-klein u-leise" style="margin-top:.7rem;line-height:1.5">' + esc(v.ueber) + '</p>' +
          '<a class="u-knopf u-knopf--still u-knopf--breit u-knopf--klein" style="margin-top:.8rem" href="/uni/profil/?person=' + esc(v.id) + '">Profil ansehen</a>' +
        '</div>' +
      '</div>' +
    '</section></div>';

    return {
      titel: mat.titel, kopf: { titel: '', zurueck: m ? '/uni/modul/' + m.slug + '/?reiter=lernen' : '/uni/entdecken/?bereich=materialien' },
      html: html
    };

    function wert(gross, klein) {
      return '<div><b>' + esc(gross) + '</b><span>' + esc(klein) + '</span></div>';
    }
  }

  /* ------------------------------------------------- Services */

  function serviceListe(ctx) {
    return { titel: 'Services', kopf: { titel: 'Services', zurueck: '/uni/entdecken/' }, html: serviceBereich(ctx.frage.get('modul')) };
  }

  function service(ctx) {
    var s = d.service(ctx.teile[1]);
    if (!s) return nichtGefunden();
    var p = d.person(s.anbieter);
    var hs = d.hochschule(p.hochschule);
    var module = (s.module || []).map(function (x) { return d.modul(x); }).filter(Boolean);

    var html = '<div data-farbe="tanne">' +
      '<div class="u-produkt__kopf">' +
        '<p class="u-kicker">' + esc(s.kategorie) + '</p>' +
        '<h1 class="u-produkt__titel" style="margin-top:.2rem">' + esc(s.titel) + '</h1>' +
        '<p class="u-produkt__ersteller">' +
          '<a href="/uni/profil/?person=' + esc(p.id) + '" style="font-weight:700;color:var(--text)">' + esc(p.name) + '</a>' +
          (p.verifiziert ? b.verifiziert() : '') +
          '<span>· ' + b.sterne(s.bewertung, s.anzahlBewertungen) + '</span>' +
        '</p>' +
      '</div>' +

      '<div class="u-produkt__kauf">' +
        '<span class="u-produkt__preis">' + b.preis(s.preis) + '<small>je ' + esc(s.einheit) + '</small></span>' +
        '<button type="button" class="u-knopf" data-tun="anfragen" data-wert="' + esc(s.slug) + '">' +
          b.zeichen('sprech', 18) + 'Anfragen</button>' +
      '</div>' +

      '<div class="u-werte">' +
        '<div><b>' + esc(s.ort) + '</b><span>Wo</span></div>' +
        '<div><b>' + esc(s.kategorie) + '</b><span>Art</span></div>' +
        '<div><b>' + esc(p.semester + '. Semester') + '</b><span>Anbieter</span></div>' +
        '<div><b>' + esc(hs ? hs.kurz : '') + '</b><span>Hochschule</span></div>' +
      '</div>' +

      '<section class="u-abschnitt">' +
        b.abschnitt('Worum es geht') +
        '<p style="padding:0 var(--rand);font-size:.97rem;line-height:1.6;max-width:46ch">' + esc(s.beschreibung) + '</p>' +
      '</section>';

    if (module.length) {
      html += '<section class="u-abschnitt">' +
        b.abschnitt('Passt zu diesen Modulen') +
        '<div class="u-filter">' + module.map(function (m) {
          return '<a class="u-filter__pille" href="/uni/modul/' + esc(m.slug) + '/">' + esc(m.name) + '</a>';
        }).join('') + '</div>' +
      '</section>';
    }

    html += '<section class="u-abschnitt"><div style="padding:0 var(--rand)">' +
        b.hinweis('Es gibt keine feste Buchung. Du schreibst eine Anfrage, ihr klärt Termin und Preis im Chat.') +
      '</div></section></div>';

    return { titel: s.titel, kopf: { titel: '', zurueck: '/uni/entdecken/?bereich=services' }, html: html };
  }

  /* ------------------------------------------------ Flohmarkt */

  function flohmarkt(ctx) {
    var kategorie = ctx.frage.get('kategorie') || '';
    var sortierung = ctx.frage.get('sortierung') || 'neu';
    var alle = q.flohmarkt({});
    var liste = q.flohmarkt({ kategorie: kategorie || null, sortierung: sortierung });
    var hs = d.hochschule(z.profil().hochschule);

    var kategorien = [{ wert: '', text: 'Alles' }];
    var gesehen = {};
    alle.forEach(function (a) {
      if (!gesehen[a.kategorie]) { gesehen[a.kategorie] = true; kategorien.push({ wert: a.kategorie, text: a.kategorie }); }
    });

    var html =
      '<div style="padding:var(--s-md) var(--rand) 0">' +
        '<h1 class="u-titel u-h1">Flohmarkt</h1>' +
        '<p class="u-leise u-klein" style="margin-top:.3rem">' +
          esc('Nur Studenten der ' + (hs ? hs.name : 'eigenen Hochschule') + '. Abholung vor Ort, Bezahlung untereinander.') + '</p>' +
      '</div>';

    if (!alle.length) {
      html += b.leer('Noch nichts eingestellt',
        'An deiner Hochschule steht gerade nichts zum Verkauf. Der Flohmarkt gilt bewusst nur für die eigene Hochschule — Artikel anderer Hochschulen tauchen hier nicht auf.',
        'Etwas einstellen', '/uni/flohmarkt/');
      html = html.replace('href="/uni/flohmarkt/">Etwas einstellen</a>', 'href="/uni/flohmarkt/" data-tun="artikel-einstellen">Etwas einstellen</a>');
    } else {
      html += b.filterleiste(kategorien, kategorie, 'filter-kategorie') +
        '<div class="u-filter" style="padding-top:0">' +
          ['neu', 'preis'].map(function (s) {
            return '<button type="button" class="u-filter__pille" data-tun="filter-sortierung" data-wert="' + s + '" ' +
              'aria-pressed="' + (sortierung === s ? 'true' : 'false') + '">' +
              (s === 'neu' ? 'Neu eingestellt' : 'Preis') + '</button>';
          }).join('') +
        '</div>' +
        (liste.length
          ? '<div class="u-floh">' + liste.map(b.flohkarte).join('') + '</div>'
          : b.leer('Nichts gefunden', 'In dieser Kategorie steht gerade nichts zum Verkauf.', 'Alles anzeigen', '/uni/flohmarkt/'));
    }

    html += '<div style="padding:var(--s-md) var(--rand) 0">' +
      b.hinweis('Der Flohmarkt läuft ohne Zahlung über die Plattform. Du schreibst dem Verkäufer, ihr macht einen Treffpunkt aus, bezahlt wird vor Ort.') +
    '</div>';

    return {
      titel: 'Flohmarkt',
      kopf: { titel: 'Flohmarkt', zurueck: '/uni/entdecken/', aktion: { tun: 'artikel-einstellen', text: 'Einstellen', zeichen: 'plus' } },
      html: html
    };
  }

  function artikel(ctx) {
    var a = d.artikel(ctx.teile[1]);
    if (!a) return nichtGefunden();
    var v = d.person(a.verkaeufer);
    var hs = d.hochschule(a.hochschule);

    var html = '<div data-farbe="' + esc(a.farbe) + '">' +
      '<div class="u-flohkarte__flaeche" style="aspect-ratio:16/9;border-radius:0;font-size:.85rem">' + esc(a.kategorie) + '</div>' +
      '<div class="u-produkt__kopf">' +
        '<p class="u-kicker">' + esc(a.kategorie + ' · ' + a.zustand) + '</p>' +
        '<h1 class="u-produkt__titel" style="margin-top:.2rem">' + esc(a.titel) + '</h1>' +
        '<p class="u-produkt__ersteller">' + esc('Eingestellt ' + b.relativ(a.eingestellt).toLowerCase() + ' · ' + a.ort) + '</p>' +
      '</div>' +
      '<div class="u-produkt__kauf">' +
        '<span class="u-produkt__preis">' + b.preis(a.preis) + '<small>Abholpreis</small></span>' +
        '<button type="button" class="u-knopf" data-tun="anfragen" data-wert="' + esc(a.slug) + '">' +
          b.zeichen('sprech', 18) + 'Nachricht schreiben</button>' +
      '</div>' +
      '<section class="u-abschnitt">' +
        b.abschnitt('Beschreibung') +
        '<p style="padding:0 var(--rand);font-size:.97rem;line-height:1.6;max-width:46ch">' + esc(a.beschreibung) + '</p>' +
      '</section>' +
      '<section class="u-abschnitt u-abschnitt--linie">' +
        b.abschnitt('Verkäufer') +
        '<div style="padding:0 var(--rand)"><div class="u-karte">' +
          '<div style="display:flex;gap:.7rem;align-items:center">' +
            '<span class="u-inbox__bild">' + esc(v.kuerzel) + '</span>' +
            '<div style="flex:1;min-width:0">' +
              '<div style="font-weight:700;display:flex;align-items:center;gap:.35rem">' + esc(v.name) +
                (v.verifiziert ? b.verifiziert(false) : '') + '</div>' +
              '<div class="u-klein u-leise">' + b.sterne(v.bewertung, v.anzahlBewertungen) + ' · ' + esc(hs ? hs.kurz : '') + '</div>' +
            '</div>' +
          '</div>' +
        '</div></div>' +
      '</section>' +
      '<section class="u-abschnitt"><div style="padding:0 var(--rand)">' +
        b.hinweis('<b>Kein Versand, keine Zahlung über die App.</b> Trefft euch auf dem Campus oder in der Nähe. Bezahlt wird bar oder privat.') +
      '</div></section></div>';

    return { titel: a.titel, kopf: { titel: '', zurueck: '/uni/flohmarkt/' }, html: html };
  }

  /* --------------------------------------------------- Profil */

  function profil(ctx) {
    var personId = ctx.frage.get('person');
    if (personId) return fremdesProfil(personId);

    var bereich = ctx.frage.get('bereich') || 'uebersicht';
    var p = z.profil();
    var hs = d.hochschule(p.hochschule);
    var name = z.name();

    var html =
      '<header class="u-profilkopf">' +
        '<div class="u-profilkopf__reihe">' +
          '<span class="u-profilkopf__bild">' + (z.kuerzel() ? esc(z.kuerzel()) : b.zeichen('person', 28)) + '</span>' +
          '<div style="min-width:0">' +
            '<h1 class="u-profilkopf__name">' + esc(name || 'Dein Profil') +
              (z.profil().verifizierung === 'bestaetigt' ? b.verifiziert() : '') + '</h1>' +
            '<p class="u-profilkopf__meta">' + esc(studienzeile(true)) + '</p>' +
            '<p class="u-profilkopf__meta">' + esc(hs ? hs.name : '') + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="u-profilzahlen">' +
          '<div><b>' + q.meineModule().length + '</b><span>Module</span></div>' +
          '<div><b>' + z.kaeufe().length + '</b><span>Käufe</span></div>' +
          '<div><b>' + z.favoriten().length + '</b><span>Gemerkt</span></div>' +
        '</div>' +
        (name ? '' :
          '<p class="u-klein u-leise" style="margin-top:var(--s-md)">Du hast keinen Namen angegeben. ' +
          '<a href="/uni/onboarding/" style="color:var(--marke);font-weight:600">Namen ergänzen</a></p>') +
      '</header>' +

      '<div class="u-reiter" role="tablist">' +
        ['uebersicht', 'dateien', 'favoriten', 'einstellungen'].map(function (w) {
          var text = { uebersicht: 'Übersicht', dateien: 'Dateien', favoriten: 'Gemerkt', einstellungen: 'Einstellungen' }[w];
          return '<a class="u-reiter__punkt" role="tab" aria-selected="' + (bereich === w ? 'true' : 'false') + '" ' +
            'href="/uni/profil/?bereich=' + w + '">' + esc(text) + '</a>';
        }).join('') +
      '</div>';

    if (bereich === 'dateien') html += profilDateien();
    else if (bereich === 'favoriten') html += profilFavoriten();
    else if (bereich === 'einstellungen') html += profilEinstellungen();
    else html += profilUebersicht();

    return { titel: name ? name : 'Profil', kopf: { titel: 'Profil' }, html: html };
  }

  function profilUebersicht() {
    var gekauft = q.gekaufteMaterialien();
    return '<section class="u-abschnitt" style="margin-top:var(--s-lg)">' +
        '<div style="padding:0 var(--rand)">' +
          b.hinweis('<b>Verifiziert über die Hochschul-Adresse.</b> Damit kannst du verkaufen, posten und in der Community mitschreiben. Im Prototyp wird keine E-Mail verschickt.') +
        '</div>' +
      '</section>' +
      '<section class="u-abschnitt u-abschnitt--linie">' +
        b.abschnitt('Zuletzt gekauft', 'Alle', '/uni/profil/?bereich=dateien') +
        (gekauft.length
          ? '<div class="u-liste">' + gekauft.slice(0, 3).map(b.materialzeile).join('') + '</div>'
          : '<p class="u-klein u-leise" style="padding:0 var(--rand)">Noch nichts gekauft.</p>') +
      '</section>' +
      '<section class="u-abschnitt u-abschnitt--linie">' +
        b.abschnitt('Verkaufen') +
        '<div style="padding:0 var(--rand);display:grid;gap:.6rem">' +
          '<button type="button" class="u-knopf u-knopf--still u-knopf--breit" data-tun="schnellmenue">Etwas einstellen</button>' +
          b.hinweis('Einstellen kostet nichts. Beim Verkauf digitaler Materialien fällt später eine Gebühr an; die Höhe steht noch nicht fest und wird vor der Veröffentlichung angezeigt.') +
        '</div>' +
      '</section>';
  }

  function profilDateien() {
    var gekauft = q.gekaufteMaterialien();
    return '<section class="u-abschnitt" style="margin-top:var(--s-lg)">' +
        b.abschnitt('Gekaufte Materialien') +
        (gekauft.length
          ? '<div class="u-liste">' + gekauft.map(b.materialzeile).join('') + '</div>'
          : b.leer('Noch keine Dateien', 'Was du kaufst oder speicherst, liegt hier — sortiert nach Modul.', 'Materialien ansehen', '/uni/entdecken/?bereich=materialien')) +
      '</section>' +
      '<section class="u-abschnitt u-abschnitt--linie">' +
        b.abschnitt('Eigene Uploads') +
        '<div style="padding:0 var(--rand)">' +
          b.hinweis('<b>Noch kein Speicher angebunden.</b> Im Prototyp lässt sich nichts hochladen.') +
        '</div>' +
      '</section>';
  }

  function profilFavoriten() {
    var f = q.favorisierteMaterialien();
    return '<section class="u-abschnitt" style="margin-top:var(--s-lg)">' +
      (f.length
        ? '<div class="u-liste">' + f.map(b.materialzeile).join('') + '</div>'
        : b.leer('Nichts gemerkt', 'Tippe bei einem Material auf das Herz, dann findest du es hier wieder.', 'Materialien ansehen', '/uni/entdecken/?bereich=materialien')) +
      '</section>';
  }

  function profilEinstellungen() {
    var thema = z.thema();
    var ben = z.benachrichtigungen();

    return '<section class="u-abschnitt" style="margin-top:var(--s-lg)">' +
        b.abschnitt('Darstellung') +
        '<div style="padding:0 var(--rand)"><div class="u-filter" style="padding-inline:0">' +
          [['system', 'Wie das Gerät'], ['hell', 'Hell'], ['dunkel', 'Dunkel']].map(function (t) {
            return '<button type="button" class="u-filter__pille" data-tun="thema" data-wert="' + t[0] + '" ' +
              'aria-pressed="' + (thema === t[0] ? 'true' : 'false') + '">' + esc(t[1]) + '</button>';
          }).join('') +
        '</div></div>' +
      '</section>' +

      '<section class="u-abschnitt u-abschnitt--linie">' +
        b.abschnitt('Benachrichtigungen') +
        '<div style="padding:0 var(--rand)">' +
          '<div class="u-filter" style="padding-inline:0">' +
            [['wichtig', 'Wichtiges'], ['alles', 'Alles'], ['aus', 'Aus']].map(function (t) {
              return '<button type="button" class="u-filter__pille" data-tun="benachrichtigungen" data-wert="' + t[0] + '" ' +
                'aria-pressed="' + (ben === t[0] ? 'true' : 'false') + '">' + esc(t[1]) + '</button>';
            }).join('') +
          '</div>' +
          '<p class="u-klein u-leise" style="margin-top:.7rem;line-height:1.55">' +
            'Bei „Wichtiges“ erinnert dich die App an Prüfungen und Abgaben und meldet unbeantwortete Verkaufsanfragen. ' +
            'Modul-Updates kommen gesammelt, nicht einzeln.</p>' +
          '<div style="margin-top:.9rem">' +
            b.hinweis('Push-Benachrichtigungen und Ruhezeiten sind vorbereitet, im Prototyp aber nicht aktiv.') +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="u-abschnitt u-abschnitt--linie">' +
        b.abschnitt('Dein Studium') +
        '<div style="padding:0 var(--rand)">' +
          '<a class="u-schalter" href="/uni/onboarding/">' +
            '<span><b style="font-weight:700">Name, Hochschule, Studiengang, Semester</b>' +
              '<span class="u-klein u-leise" style="display:block">' +
                esc((z.name() ? z.name() + ' · ' : '') + d.hochschule(z.profil().hochschule).kurz + ' · ' + studienzeile(true)) +
              '</span></span>' + b.zeichen('weiter', 18) + '</a>' +
          (z.eigeneModulliste()
            ? '<button type="button" class="u-schalter" data-tun="module-zuruecksetzen">' +
                '<span><b style="font-weight:700">Module wieder aus dem Studiengang ableiten</b>' +
                  '<span class="u-klein u-leise" style="display:block">Deine eigene Modulauswahl wird verworfen</span></span>' +
                b.zeichen('weiter', 18) + '</button>'
            : '') +
          '<button type="button" class="u-schalter" data-tun="zuruecksetzen">' +
            '<span><b style="font-weight:700">Prototyp zurücksetzen</b>' +
              '<span class="u-klein u-leise" style="display:block">Alle lokalen Angaben verwerfen und neu beginnen</span></span>' +
            b.zeichen('weiter', 18) + '</button>' +
        '</div>' +
      '</section>' +

      '<section class="u-abschnitt">' +
        '<div style="padding:0 var(--rand)">' +
          b.hinweis('<b>Prototyp.</b> Es gibt kein Konto, keinen Server und keine Zahlung. Alle Angaben liegen nur in diesem Browser und lassen sich jederzeit löschen.') +
        '</div>' +
      '</section>';
  }

  function fremdesProfil(id) {
    var v = d.person(id);
    if (!v) return nichtGefunden();
    var hs = d.hochschule(v.hochschule);
    var sg = d.studiengang(v.studiengang);
    var eigene = q.materialienVon(v.id);
    var services = d.services.filter(function (s) { return s.anbieter === v.id; });

    var html =
      '<header class="u-profilkopf">' +
        '<div class="u-profilkopf__reihe">' +
          '<span class="u-profilkopf__bild">' + esc(v.kuerzel) + '</span>' +
          '<div style="min-width:0">' +
            '<h1 class="u-profilkopf__name">' + esc(v.name) + (v.verifiziert ? b.verifiziert() : '') + '</h1>' +
            '<p class="u-profilkopf__meta">' + esc((sg ? sg.kurz : '') + ' · ' + v.semester + '. Semester') + '</p>' +
            '<p class="u-profilkopf__meta">' + esc(hs ? hs.name : '') + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="u-profilzahlen">' +
          '<div><b>' + String(v.bewertung).replace('.', ',') + '</b><span>' + v.anzahlBewertungen + ' Bewertungen</span></div>' +
          '<div><b>' + v.verkaeufe + '</b><span>Verkäufe</span></div>' +
          '<div><b>' + esc(v.seit) + '</b><span>Dabei seit</span></div>' +
        '</div>' +
        '<div style="display:flex;gap:.5rem;margin-top:var(--s-lg)">' +
          '<button type="button" class="u-knopf u-knopf--klein" data-tun="folgen" data-wert="' + esc(v.id) + '">' +
            (z.folgt(v.id) ? 'Folgt' : 'Folgen') + '</button>' +
          '<button type="button" class="u-knopf u-knopf--still u-knopf--klein" data-tun="anfragen" data-wert="' + esc(v.id) + '">Nachricht</button>' +
        '</div>' +
      '</header>' +
      '<section class="u-abschnitt" style="margin-top:var(--s-lg)">' +
        '<p style="padding:0 var(--rand);font-size:.95rem;line-height:1.6;max-width:46ch">' + esc(v.ueber) + '</p>' +
      '</section>';

    if (eigene.length) {
      html += '<section class="u-abschnitt u-abschnitt--linie">' + b.abschnitt('Materialien') +
        '<div class="u-liste">' + eigene.map(b.materialzeile).join('') + '</div></section>';
    }
    if (services.length) {
      html += '<section class="u-abschnitt u-abschnitt--linie">' + b.abschnitt('Services') +
        '<div class="u-liste">' + services.map(serviceZeile).join('') + '</div></section>';
    }

    return { titel: v.name, kopf: { titel: '', zurueck: '/uni/entdecken/' }, html: html };
  }

  /* ---------------------------------------------------- Inbox */

  function inbox(ctx) {
    var chatId = ctx.frage.get('chat');
    if (chatId) return chat(chatId);

    var liste = d.nachrichten;
    return {
      titel: 'Nachrichten',
      kopf: { titel: 'Nachrichten', zurueck: '/uni/' },
      html: (liste.length
        ? '<div class="u-liste" style="margin-top:var(--s-xs)">' + liste.map(b.inboxzeile).join('') + '</div>'
        : b.leer('Keine Nachrichten', 'Anfragen zu Materialien, Services und Flohmarkt landen hier.', 'Zum Entdecken', '/uni/entdecken/')) +
        '<div style="padding:var(--s-abschnitt) var(--rand) 0">' +
          b.hinweis('Chats, Verkäufe und Mitteilungen liegen an einem Ort. Eine eigene Benachrichtigungsseite gibt es bewusst nicht.') +
        '</div>'
    };
  }

  function chat(id) {
    var c = d.chat(id);
    if (!c) return nichtGefunden();
    var p = d.person(c.partner);
    z.alsGelesen(c.id);

    var eigene = (Uni.app && Uni.app.chatEntwurf && Uni.app.chatEntwurf[c.id]) || [];
    var verlauf = c.verlauf.concat(eigene);

    var html =
      '<div style="padding:.7rem var(--rand);border-bottom:1px solid var(--linie);background:var(--flaeche)">' +
        '<p class="u-kicker">' + esc(b.bezugText(c.bezug)) + '</p>' +
      '</div>' +
      '<div class="u-chat">' + verlauf.map(function (n) {
        return '<div class="u-blase u-blase--' + (n.von === 'ich' ? 'eigen' : 'fremd') + '">' +
          esc(n.text) + '<span class="u-blase__zeit">' + esc(n.zeit) + '</span></div>';
      }).join('') + '</div>' +
      '<form class="u-chatfeld" data-tun="chat-senden" data-wert="' + esc(c.id) + '">' +
        '<label class="u-nurlesen" for="chat-eingabe">Nachricht an ' + esc(p.name) + '</label>' +
        '<input type="text" id="chat-eingabe" name="text" placeholder="Nachricht schreiben" autocomplete="off">' +
        '<button type="submit" class="u-rundknopf" aria-label="Senden" style="background:var(--marke);color:var(--marke-auf)">' +
          b.zeichen('weiter', 20) + '</button>' +
      '</form>';

    return { titel: p.name, kopf: { titel: p.name, zurueck: '/uni/inbox/' }, html: html };
  }

  /* ---------------------------------------------------- Suche */

  function suche(ctx) {
    var text = ctx.frage.get('q') || '';
    var art = ctx.frage.get('art') || '';
    var treffer = q.suchen(text);
    var gefiltert = art ? treffer.filter(function (t) { return t.art === art; }) : treffer;

    var html =
      '<form class="u-suchkopf" data-tun="suche-senden" role="search">' +
        '<a class="u-rundknopf" href="/uni/" aria-label="Zurück">' + b.zeichen('zurueck', 20) + '</a>' +
        '<label class="u-nurlesen" for="suche-eingabe">Suchen</label>' +
        '<input type="search" id="suche-eingabe" name="q" value="' + esc(text) + '" ' +
          'placeholder="Module, Materialien, Leute …" autocomplete="off" enterkeyhint="search">' +
      '</form>';

    if (!text) {
      var module = q.moduleSortiert();
      var letzte = z.letzteSuchen();
      if (module.length) {
        html += '<section class="u-abschnitt" style="margin-top:var(--s-sm)">' +
          b.abschnitt('Deine Module') +
          '<div class="u-modulreihe">' + module.map(b.modulkarte).join('') + '</div>' +
        '</section>';
      }
      html += '<section class="u-abschnitt' + (module.length ? ' u-abschnitt--linie' : '') + '">' +
        b.abschnitt(letzte.length ? 'Zuletzt gesucht' : 'Wonach du suchen kannst') +
        (letzte.length
          ? '<div class="u-liste">' + letzte.map(function (s) {
              return '<a class="u-treffer" href="/uni/suche/?q=' + encodeURIComponent(s) + '">' +
                '<span class="u-treffer__titel">' + b.zeichen('lupe', 15) + ' ' + esc(s) + '</span></a>';
            }).join('') + '</div>'
          : '<p class="u-klein u-leise" style="padding:0 var(--rand);max-width:44ch">' +
            'Module, Dozenten, Lernmaterialien, Services, Flohmarkt-Artikel und Leute. Andere Studiengänge sind durchsuchbar, stehen aber weiter hinten.</p>') +
      '</section>';
      return { titel: 'Suche', kopf: false, html: html };
    }

    var arten = [
      { wert: '', text: 'Alles' }, { wert: 'modul', text: 'Module' },
      { wert: 'material', text: 'Materialien' }, { wert: 'leute', text: 'Leute' }
    ];
    html += '<div class="u-reiter" role="tablist">' + arten.map(function (a) {
      var n = a.wert ? treffer.filter(function (t) { return t.art === a.wert; }).length : treffer.length;
      return '<a class="u-reiter__punkt" role="tab" aria-selected="' + (art === a.wert ? 'true' : 'false') + '" ' +
        'href="/uni/suche/?q=' + encodeURIComponent(text) + (a.wert ? '&art=' + a.wert : '') + '">' +
        esc(a.text) + ' <span class="u-leise">' + n + '</span></a>';
    }).join('') + '</div>';

    html += gefiltert.length
      ? '<div>' + gefiltert.map(function (t) {
          return '<a class="u-treffer" href="' + esc(t.ziel) + '" data-farbe="' + esc(t.farbe || 'stein') + '">' +
            '<span class="u-treffer__typ" style="color:var(--modul)">' +
              esc({ modul: 'Modul', material: 'Material', service: 'Service', flohmarkt: 'Flohmarkt',
                    leute: 'Person', campus: 'Campus', studiengang: 'Studiengang' }[t.art] || t.art) + '</span>' +
            '<span class="u-treffer__titel">' + esc(t.titel) + '</span>' +
            '<span class="u-treffer__meta">' + t.meta + '</span></a>';
        }).join('') + '</div>'
      : b.leer('Nichts gefunden', 'Zu „' + text + '“ gibt es keinen Treffer.', 'Suche leeren', '/uni/suche/');

    return { titel: 'Suche: ' + text, kopf: false, html: html };
  }

  /* ----------------------------------------------- Onboarding

     Die Schrittfolge steht nirgends fest, sie ergibt sich aus den
     Daten: was ein Studiengang braucht, steht an ihm selbst
     (braucht.lehramtstyp, braucht.faecher, braucht.vertiefung), und wie
     die Faecher gewaehlt werden, steht am Faechermodell der Schulart.
     Ein BWL-Student sieht deshalb keinen Lehramtsschritt, und die
     Fortschrittsanzeige zaehlt die tatsaechlichen Schritte.

     Alle Angaben stehen in der Adresse, damit Zurueck und Neuladen
     funktionieren. Erst der letzte Schritt schreibt sie fest. */

  function onboarding(ctx) {
    var f = ctx.frage;
    var p = z.profil();

    var a = {
      name: f.has('name') ? f.get('name') : p.name,
      hochschule: f.get('hochschule') || p.hochschule,
      studiengang: f.has('studiengang') ? (f.get('studiengang') || null) : p.studiengang,
      lehramtstyp: f.has('lehramtstyp') ? (f.get('lehramtstyp') || null) : p.lehramtstyp,
      faecher: f.has('faecher') ? f.get('faecher').split(',').filter(Boolean) : (p.faecher || []).slice(),
      semester: Number(f.get('semester') || p.semester)
    };

    var hs = d.hochschule(a.hochschule);
    var sg = d.studiengang(a.studiengang);
    var typ = d.lehramtstyp(a.lehramtstyp);
    var modell = typ ? d.faechermodell(typ.faechermodell) : null;

    var schritte = ['name', 'hochschule'];
    if (hs && !hs.angebotErfasst) {
      schritte.push('kein-angebot');
    } else {
      schritte.push('studiengang');
      if (sg) {
        if (sg.braucht.lehramtstyp) schritte.push('lehramtstyp');
        if (sg.braucht.vertiefung) schritte.push('vertiefung');
        if (sg.braucht.faecher && typ && modell) schritte.push('faecher');
        schritte.push('semester');
        if (sg.moduleErfasst) schritte.push('module');
      }
    }

    var nr = Number(f.get('schritt') || 1);
    if (!(nr >= 1)) nr = 1;
    if (nr > schritte.length) nr = schritte.length;
    var aktuell = schritte[nr - 1];

    var html = '<div class="u-onboarding">' +
      '<div class="u-fortschritt">' + schritte.map(function (x, i) {
        return '<i data-aktiv="' + (i < nr ? 'ja' : 'nein') + '"></i>';
      }).join('') + '</div>' +
      '<p class="u-onboarding__schritt">Schritt ' + nr + ' von ' + schritte.length + '</p>';

    if (aktuell === 'name') html += schrittName();
    else if (aktuell === 'hochschule') html += schrittHochschule();
    else if (aktuell === 'kein-angebot') html += schrittKeinAngebot();
    else if (aktuell === 'studiengang') html += schrittStudiengang();
    else if (aktuell === 'lehramtstyp') html += schrittLehramtstyp();
    else if (aktuell === 'faecher') html += schrittFaecher();
    else if (aktuell === 'semester') html += schrittSemester();
    else html += schrittModule();

    if (nr > 1) {
      html += '<p style="margin-top:var(--s-xl)"><a href="' + esc(adresse(nr - 1, {})) +
        '" class="u-klein" style="color:var(--text-leise);font-weight:600">Zurück</a></p>';
    }
    html += '</div>';

    return { titel: 'Willkommen', kopf: false, leiste: false, html: html };

    /* --------------------------------------------- einzelne Schritte */

    function schrittName() {
      return '<h1 class="u-onboarding__frage">Wie sollen wir dich nennen?</h1>' +
        untertitel('Vorname, Spitzname oder gar nichts. Du entscheidest, was andere sehen, und kannst es später ändern.') +
        '<form data-tun="onboarding-name" data-weiter="' + esc(adresse(2, {})) + '">' +
          '<div class="u-feld">' +
            '<label for="onb-name">Dein Name</label>' +
            '<input type="text" id="onb-name" name="name" value="' + esc(a.name) + '" ' +
              'placeholder="Zum Beispiel Anna" autocomplete="given-name" maxlength="40">' +
            '<span class="u-feld__hinweis">Kein Pflichtfeld. Ohne Namen grüßt dich die App einfach ohne Namen.</span>' +
          '</div>' +
          '<button type="submit" class="u-knopf u-knopf--breit">Weiter</button>' +
        '</form>';
    }

    function schrittHochschule() {
      return '<h1 class="u-onboarding__frage">An welcher Hochschule bist du?</h1>' +
        d.hochschulen.map(function (h) {
          var zahl = d.studiengaengeVon(h.id).length;
          return wahl(h.name, h.ort + (h.angebotErfasst ? ' · ' + zahl + ' Studiengänge erfasst' : ' · Studienangebot noch nicht erfasst'),
            adresse(3, { hochschule: h.id, studiengang: '', lehramtstyp: '', faecher: '' }), a.hochschule === h.id);
        }).join('');
    }

    /* Fuer Hochschulen ohne erfasstes Angebot wird nichts erfunden. */
    function schrittKeinAngebot() {
      return '<h1 class="u-onboarding__frage">Für diese Hochschule ist noch kein Studienangebot erfasst</h1>' +
        untertitel('Der Prototyp hat bisher nur das Studienangebot der ' +
          esc(d.hochschule('uni-leipzig').name) + ' erfasst. Für ' + esc(hs.name) +
          ' zeigen wir dir deshalb keine Studiengänge — statt welche zu erfinden.') +
        (hs.web ? '<p style="margin-bottom:var(--s-lg)">' +
          b.quelleZeile({ name: hs.name, url: hs.web }, false) + '</p>' : '') +
        '<button type="button" class="u-knopf u-knopf--breit" data-tun="onboarding-fertig" ' +
          datenAttribute() + '>Trotzdem loslegen</button>' +
        '<p class="u-klein u-leise" style="margin-top:var(--s-md);line-height:1.55">' +
          'Du kannst deine Module danach von Hand hinzufügen oder vorschlagen.</p>';
    }

    function schrittStudiengang() {
      var liste = d.studiengaengeVon(a.hochschule);
      if (!liste.length) return schrittKeinAngebot();
      return '<h1 class="u-onboarding__frage">Was studierst du?</h1>' +
        untertitel('Studiengänge der ' + esc(hs.name) + ', erfasst aus dem öffentlichen Studienangebot.') +
        liste.map(function (x) {
          var unter = x.abschluss + (x.moduleErfasst ? '' : ' · noch keine Module erfasst');
          return wahl(x.name, unter, adresse(4, { studiengang: x.id, lehramtstyp: '', faecher: '' }), a.studiengang === x.id);
        }).join('') +
        (liste[0] && liste[0].quelle ? '<p style="margin-top:var(--s-md)">' +
          b.quelleZeile(liste[0].quelle, false) + '</p>' : '');
    }

    /* Der neue Schritt: erst die Schulart, dann die Faecher. Welche
       Schularten es gibt, haengt an der Hochschule. */
    function schrittLehramtstyp() {
      var typen = d.lehramtstypenVon(a.hochschule).filter(function (t) { return t.studiengang === a.studiengang; });
      if (!typen.length) {
        return '<h1 class="u-onboarding__frage">Welches Lehramt?</h1>' +
          untertitel('Für diese Hochschule sind die Lehramtsrichtungen noch nicht erfasst.') +
          '<button type="button" class="u-knopf u-knopf--breit" data-tun="onboarding-fertig" ' + datenAttribute() + '>Trotzdem loslegen</button>';
      }
      return '<h1 class="u-onboarding__frage">Welches Lehramt?</h1>' +
        untertitel('Wähle die Schulart, für die du studierst. Sie entscheidet über deine Module und darüber, wie die Fächer gewählt werden.') +
        typen.map(function (t) {
          var unter = t.klassen + (t.strukturErfasst === false ? ' · Struktur noch nicht erfasst' : '');
          return wahl(t.name, unter, adresse(nr + 1, { lehramtstyp: t.id, faecher: '' }), a.lehramtstyp === t.id);
        }).join('') +
        (typen[0].quelle ? '<p style="margin-top:var(--s-md)">' + b.quelleZeile(typen[0].quelle, false) + '</p>' : '');
    }

    /* Die Faecherauswahl richtet sich nach dem Modell der Schulart.
       Grundschule ist ausdruecklich kein Zwei-Faecher-Studium. */
    function schrittFaecher() {
      if (!modell) {
        return '<h1 class="u-onboarding__frage">Fächer</h1>' +
          untertitel('Für ' + esc(typ.name) + ' ist die Fächerstruktur hier noch nicht erfasst. Wir fragen sie deshalb nicht ab.') +
          '<a class="u-knopf u-knopf--breit" href="' + esc(adresse(nr + 1, {})) + '">Weiter</a>';
      }

      var kopf, auswahl, gewaehlt = a.faecher;
      if (modell.art === 'kernfach') {
        kopf = '<h1 class="u-onboarding__frage">Welches Kernfach?</h1>' + untertitel(modell.erklaerung);
        auswahl = fachliste(modell.kernfach, 1);
        auswahl += '<div style="margin-top:var(--s-lg)">' +
          b.hinweis('<b>Dazu kommen fest:</b> ' + esc(modell.lernbereiche.map(function (id) {
            var x = d.fach(id); return x ? x.name : id;
          }).join(', ')) + '. ' + esc(modell.wahlfachHinweis)) + '</div>';
      } else if (modell.art === 'gemischt') {
        kopf = '<h1 class="u-onboarding__frage">Welches Fach?</h1>' + untertitel(modell.erklaerung);
        auswahl = fachliste(modell.faecher, 1);
        if (modell.nichtErfasst) {
          auswahl += '<div style="margin-top:var(--s-lg)">' +
            b.hinweis('<b>Nicht erfasst:</b> ' + esc(modell.nichtErfasst.join(', ')) +
              '. Sie werden hier nicht abgefragt, weil uns dazu keine belastbare öffentliche Quelle vorliegt.') + '</div>';
        }
      } else {
        kopf = '<h1 class="u-onboarding__frage">Welche Fächer?</h1>' + untertitel(modell.erklaerung);
        auswahl = modell.gruppen.map(function (g) {
          return '<p class="u-kicker" style="margin:var(--s-lg) 0 .6rem">' + esc(g.name) + '</p>' +
            (g.hinweis ? '<p class="u-klein u-leise" style="margin-bottom:.6rem;max-width:42ch">' + esc(g.hinweis) + '</p>' : '') +
            fachliste(g.faecher, modell.anzahl);
        }).join('');
      }

      var fertig = auswahlVollstaendig();
      return kopf + auswahl +
        '<div style="margin-top:var(--s-xl)">' +
          (fertig
            ? '<a class="u-knopf u-knopf--breit" href="' + esc(adresse(nr + 1, {})) + '">Weiter</a>'
            : '<button type="button" class="u-knopf u-knopf--breit" disabled ' +
              'style="opacity:.45;cursor:not-allowed">' + esc(auswahlHinweis()) + '</button>') +
        '</div>' +
        (modell.quelle ? '<p style="margin-top:var(--s-md)">' + b.quelleZeile(modell.quelle, false) + '</p>' : '');

      function fachliste(ids, hoechstens) {
        return ids.map(function (id) {
          var x = d.fach(id);
          if (!x) return '';
          var an = gewaehlt.indexOf(id) > -1;
          var neu = an
            ? gewaehlt.filter(function (y) { return y !== id; })
            : gewaehlt.concat([id]);
          if (!an && gewaehlt.length >= hoechstens) {
            /* Ist die Auswahl voll, ersetzt ein Tippen das zuletzt
               gewaehlte Fach — sonst kommt man nicht mehr weiter. */
            neu = gewaehlt.slice(0, hoechstens - 1).concat([id]);
          }
          return '<a class="u-wahl" href="' + esc(adresse(nr, { faecher: neu.join(',') })) + '" ' +
            'aria-pressed="' + (an ? 'true' : 'false') + '">' +
            '<span><b>' + esc(x.name) + '</b></span>' +
            (an ? '<span style="color:var(--marke)">' + b.zeichen('haken', 18) + '</span>' : b.zeichen('plus', 18)) +
            '</a>';
        }).join('');
      }

      function auswahlVollstaendig() {
        if (gewaehlt.length !== modell.anzahl) return false;
        if (modell.art !== 'gruppen') return true;
        var g1 = modell.gruppen[0].faecher;
        var ausG1 = gewaehlt.filter(function (x) { return g1.indexOf(x) > -1; }).length;
        if (ausG1 >= 1) return true;
        /* Sonderfall Musik: laut Hochschule auch mit Ethik/Philosophie
           oder Evangelischer Religion kombinierbar. */
        if (gewaehlt.indexOf('musik') > -1) {
          var rest = gewaehlt.filter(function (x) { return x !== 'musik'; })[0];
          return rest === 'ethik-philosophie' || rest === 'ev-religion';
        }
        return false;
      }

      function auswahlHinweis() {
        if (gewaehlt.length < modell.anzahl) {
          var fehlt = modell.anzahl - gewaehlt.length;
          return fehlt === 1 ? 'Noch ein Fach wählen' : 'Noch ' + fehlt + ' Fächer wählen';
        }
        return 'Diese Kombination ist nicht möglich';
      }
    }

    function schrittSemester() {
      /* Gibt es fuer den Studiengang keine Modulstruktur, entfaellt der
         Bestaetigungsschritt — dann endet das Onboarding hier. */
      var letzter = nr === schritte.length;
      return '<h1 class="u-onboarding__frage">In welchem Semester?</h1>' +
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (n) {
          return wahl(n + '. Semester', '', adresse(nr, { semester: n }), a.semester === n);
        }).join('') +
        '<div style="margin-top:var(--s-lg)">' +
          (letzter
            ? '<button type="button" class="u-knopf u-knopf--breit" data-tun="onboarding-fertig" ' +
              datenAttribute() + '>Los geht’s</button>'
            : '<a class="u-knopf u-knopf--breit" href="' + esc(adresse(nr + 1, {})) + '">Weiter</a>') +
        '</div>' +
        (letzter && sg && !sg.moduleErfasst
          ? '<div style="margin-top:var(--s-md)">' +
            b.hinweis('Für ' + esc(sg.name) + ' ist hier noch keine Modulstruktur erfasst. ' +
              'Du kannst deine Module danach selbst hinzufügen oder vorschlagen.') + '</div>'
          : '');
    }

    /* Letzter Schritt: der Nutzer bestaetigt, was er wirklich belegt.
       Der Studienverlaufsplan schlaegt nur vor. */
    function schrittModule() {
      profilSichern();
      var empfohlen = z.empfohleneModule();
      var belegt = z.module();

      if (!empfohlen.length) {
        return '<h1 class="u-onboarding__frage">Für diese Kombination haben wir noch keine Module</h1>' +
          untertitel('Das heißt nicht, dass es keine gibt — sie sind hier nur noch nicht erfasst. Du kannst deine Module selbst hinzufügen oder vorschlagen.') +
          '<button type="button" class="u-knopf u-knopf--breit" data-tun="onboarding-abschliessen">Weiter zur App</button>';
      }

      return '<h1 class="u-onboarding__frage">Deine Module</h1>' +
        untertitel('Das passt laut Studienstruktur zu deinem ' + a.semester + '. Semester. Nimm heraus, was du nicht belegst.') +
        empfohlen.map(function (m) {
          var an = belegt.indexOf(m.slug) > -1;
          return '<button type="button" class="u-wahl" data-tun="modul-umschalten" data-wert="' + esc(m.slug) + '" ' +
            'aria-pressed="' + (an ? 'true' : 'false') + '">' +
            '<span><b>' + esc(m.name) + '</b><span>' + esc(modulUnterzeile(m)) + '</span></span>' +
            '<span style="color:' + (an ? 'var(--marke)' : 'var(--text-leise)') + '">' +
              b.zeichen(an ? 'haken' : 'plus', 18) + '</span>' +
            '</button>';
        }).join('') +
        '<div style="margin-top:var(--s-xl);display:grid;gap:.6rem">' +
          '<button type="button" class="u-knopf u-knopf--breit" data-tun="onboarding-abschliessen">' +
            (belegt.length ? 'Los geht’s mit ' + belegt.length + ' Modulen' : 'Ohne Module starten') + '</button>' +
          '<button type="button" class="u-knopf u-knopf--still u-knopf--breit" data-tun="modul-suchen">Weiteres Modul suchen</button>' +
          '<button type="button" class="u-knopf u-knopf--still u-knopf--breit" data-tun="modul-vorschlagen">Fehlendes Modul vorschlagen</button>' +
        '</div>' +
        '<div style="margin-top:var(--s-lg)">' + musterhinweis() + '</div>';
    }

    /* --------------------------------------------- Hilfsteile */

    function profilSichern() {
      var p2 = z.profil();
      var gleich = p2.name === a.name && p2.hochschule === a.hochschule &&
        p2.studiengang === a.studiengang && p2.lehramtstyp === a.lehramtstyp &&
        p2.semester === a.semester && (p2.faecher || []).join(',') === a.faecher.join(',');
      if (!gleich) z.onboardingSpeichern(a);
    }

    function datenAttribute() {
      return 'data-name="' + esc(a.name) + '" data-hochschule="' + esc(a.hochschule) + '" ' +
        'data-studiengang="' + esc(a.studiengang || '') + '" data-lehramtstyp="' + esc(a.lehramtstyp || '') + '" ' +
        'data-faecher="' + esc(a.faecher.join(',')) + '" data-semester="' + a.semester + '"';
    }

    function untertitel(text) {
      return '<p class="u-leise" style="margin:-1rem 0 var(--s-lg);max-width:44ch;font-size:.95rem;line-height:1.55">' +
        esc(text) + '</p>';
    }

    function adresse(schritt, neu) {
      var w = {
        name: neu.name !== undefined ? neu.name : a.name,
        hochschule: neu.hochschule !== undefined ? neu.hochschule : a.hochschule,
        studiengang: neu.studiengang !== undefined ? neu.studiengang : (a.studiengang || ''),
        lehramtstyp: neu.lehramtstyp !== undefined ? neu.lehramtstyp : (a.lehramtstyp || ''),
        faecher: neu.faecher !== undefined ? neu.faecher : a.faecher.join(','),
        semester: neu.semester !== undefined ? neu.semester : a.semester
      };
      return '/uni/onboarding/?schritt=' + schritt +
        '&name=' + encodeURIComponent(w.name || '') +
        '&hochschule=' + encodeURIComponent(w.hochschule) +
        '&studiengang=' + encodeURIComponent(w.studiengang) +
        '&lehramtstyp=' + encodeURIComponent(w.lehramtstyp) +
        '&faecher=' + encodeURIComponent(w.faecher) +
        '&semester=' + encodeURIComponent(w.semester);
    }

    function wahl(titel, unter, ziel, aktiv) {
      return '<a class="u-wahl" href="' + esc(ziel) + '" aria-pressed="' + (aktiv ? 'true' : 'false') + '">' +
        '<span><b>' + esc(titel) + '</b>' + (unter ? '<span>' + esc(unter) + '</span>' : '') + '</span>' +
        (aktiv ? '<span style="color:var(--marke)">' + b.zeichen('haken', 18) + '</span>' : b.zeichen('weiter', 18)) +
        '</a>';
    }
  }

  /* Zweite Zeile einer Modulzeile: nur was wirklich bekannt ist. */
  function modulUnterzeile(m) {
    var teile = [];
    if (m.dozent) teile.push(m.dozent);
    if (m.ects) teile.push(m.ects + ' ECTS');
    teile.push(m.semester + '. Semester');
    return teile.join(' · ');
  }

  /* -------------------------------------------- Nicht gefunden */

  function nichtGefunden() {
    return {
      titel: 'Nicht gefunden',
      kopf: { titel: '', zurueck: '/uni/' },
      html: b.leer('Diese Seite gibt es nicht', 'Der Link führt ins Leere oder der Eintrag wurde entfernt.', 'Zur Startseite', '/uni/')
    };
  }

  return {
    home: home, studium: studium, modul: modul, kalender: kalender,
    entdecken: entdecken, materialListe: materialListe, material: material,
    serviceListe: serviceListe, service: service,
    flohmarkt: flohmarkt, artikel: artikel, profil: profil, inbox: inbox,
    suche: suche, onboarding: onboarding, nichtGefunden: nichtGefunden,
    modulBlatt: modulBlatt, studienzeile: studienzeile, modulUnterzeile: modulUnterzeile
  };
})();
