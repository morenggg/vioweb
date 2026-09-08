/* =========================================================================
   Campus — Bausteine.

   Kleine Funktionen, die HTML zurueckgeben. Jede steht fuer genau ein
   sichtbares Element und wird von mehreren Ansichten benutzt:

     Zeichen, Sterne, Verifizierungsmarke, Heute-Zeile, Modulkarte,
     Modulzeile, Feed-Eintrag, Materialzeile, Terminzeile, Inbox-Zeile,
     Flohmarkt-Karte, Filterleiste, leerer Zustand, Hinweisstreifen.

   Warum Zeichenketten statt DOM-Aufrufe: ohne Framework ist das die
   kuerzeste lesbare Form, und der Router setzt eine Ansicht ohnehin in
   einem Zug ein. Jeder Text laeuft durch esc().
   ========================================================================= */
window.Uni = window.Uni || {};

Uni.baustein = (function () {
  'use strict';

  /* ------------------------------------------------- Werkzeug */

  function esc(s) {
    return String(s === null || s === undefined ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  var WOCHENTAG = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  var WOCHENTAG_KURZ = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  var MONAT = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  var MONAT_KURZ = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'];

  function ausIso(iso) {
    var t = String(iso).split('-');
    return new Date(Number(t[0]), Number(t[1]) - 1, Number(t[2]));
  }
  function tageBis(iso) {
    var a = Uni.daten.heute().getTime();
    var b = ausIso(iso).getTime();
    return Math.round((b - a) / 86400000);
  }
  function datumLang(iso) {
    var d = ausIso(iso);
    return WOCHENTAG[d.getDay()] + ', ' + d.getDate() + '. ' + MONAT[d.getMonth()];
  }
  function datumKurz(iso) {
    var d = ausIso(iso);
    return d.getDate() + '. ' + MONAT_KURZ[d.getMonth()];
  }
  /* „Heute“, „Morgen“, Wochentag innerhalb der Woche, sonst das Datum. */
  function relativ(iso) {
    var n = tageBis(iso);
    if (n === 0) return 'Heute';
    if (n === 1) return 'Morgen';
    if (n === -1) return 'Gestern';
    if (n > 1 && n < 7) return WOCHENTAG_KURZ[ausIso(iso).getDay()];
    return datumKurz(iso);
  }
  function inTagen(iso) {
    var n = tageBis(iso);
    if (n === 0) return 'heute';
    if (n === 1) return 'morgen';
    if (n < 0) return 'vor ' + Math.abs(n) + ' Tagen';
    if (n < 7) return 'in ' + n + ' Tagen';
    if (n < 14) return 'nächste Woche';
    return 'in ' + Math.floor(n / 7) + ' Wochen';
  }
  function preis(n) {
    return n.toFixed(2).replace('.', ',') + ' €';
  }

  var ARTNAME = {
    vorlesung: 'Vorlesung', seminar: 'Seminar', pruefung: 'Prüfung',
    abgabe: 'Abgabe', todo: 'To-do', event: 'Event', privat: 'Privat'
  };
  var TYPNAME = {
    lernzettel: 'Lernzettel', zusammenfassung: 'Zusammenfassung',
    formelsammlung: 'Formelsammlung', karteikarten: 'Karteikarten',
    uebungsaufgaben: 'Übungsaufgaben', hausarbeit: 'Hausarbeit',
    vorlage: 'Vorlage', tool: 'Werkzeug'
  };

  /* ------------------------------------------------- Zeichen

     Eigener kleiner Satz, als Pfade im Code. Keine Icon-Bibliothek und
     keine zweite Datei: das waeren zusaetzliche Anfragen ohne Gewinn. */

  var PFADE = {
    haus:     '<path d="M3 10.6 12 3.4l9 7.2V20a1 1 0 0 1-1 1h-4.5v-6.5h-7V21H4a1 1 0 0 1-1-1z"/>',
    buch:     '<path d="M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2z"/><path d="M8 7.5h7M8 11h5"/>',
    plus:     '<path d="M12 5.5v13M5.5 12h13"/>',
    kalender: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>',
    person:   '<circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 20.5c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4"/>',
    lupe:     '<circle cx="10.8" cy="10.8" r="6.3"/><path d="m15.5 15.5 4.2 4.2"/>',
    brief:    '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.8 7 8.2 6 8.2-6"/>',
    zurueck:  '<path d="m14.5 5.5-6.5 6.5 6.5 6.5"/>',
    weiter:   '<path d="m9.5 5.5 6.5 6.5-6.5 6.5"/>',
    uhr:      '<circle cx="12" cy="12" r="8.4"/><path d="M12 7.4V12l3 2"/>',
    ort:      '<path d="M12 21c4.2-4.4 6.3-7.7 6.3-10.4A6.3 6.3 0 0 0 5.7 10.6C5.7 13.3 7.8 16.6 12 21z"/><circle cx="12" cy="10.4" r="2.3"/>',
    stern:    '<path d="m12 3.6 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z" fill="currentColor" stroke="none"/>',
    herz:     '<path d="M12 20.2C6.3 16.4 3.5 13.3 3.5 9.9A4.4 4.4 0 0 1 12 8a4.4 4.4 0 0 1 8.5 1.9c0 3.4-2.8 6.5-8.5 10.3z"/>',
    nadel:    '<path d="M9 3.5h6l-.8 5.2 3.1 3.1H6.7l3.1-3.1zM12 11.8V20"/>',
    haken:    '<path d="m4.5 12.5 5 5 10-11"/>',
    siegel:   '<circle cx="12" cy="12" r="8.4"/><path d="m8.3 12.2 2.6 2.6 4.8-5.2"/>',
    filter:   '<path d="M3.5 6h17M6.5 12h11M10 18h4"/>',
    mehr:     '<circle cx="5.5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="18.5" cy="12" r="1.4" fill="currentColor" stroke="none"/>',
    tasche:   '<path d="M5 8h14l-1.2 12.5H6.2z"/><path d="M8.8 8V6.4a3.2 3.2 0 0 1 6.4 0V8"/>',
    blitz:    '<path d="M13.2 3 5.8 13.4h5.3L10.4 21l7.8-10.6h-5.4z"/>',
    kreuz:    '<path d="m6.5 6.5 11 11M17.5 6.5l-11 11"/>',
    pfeilRaus:'<path d="M14 4h6v6M20 4l-8.5 8.5"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    ordner:   '<path d="M3.5 6.5a1 1 0 0 1 1-1h4.2l2 2.4h8.8a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z"/>',
    aussen:   '<path d="M7.5 16.5 16.5 7.5M9.5 7.5h7v7"/>',
    sprech:   '<path d="M20.5 12.4c0 3.9-3.8 7-8.5 7-1 0-2-.1-2.9-.4L4 20.5l1.5-3.7A6.7 6.7 0 0 1 3.5 12.4c0-3.9 3.8-7 8.5-7s8.5 3.1 8.5 7z"/>'
  };

  function zeichen(name, groesse) {
    var p = PFADE[name];
    if (!p) return '';
    var s = groesse || 20;
    return '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" ' +
      'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true" focusable="false">' + p + '</svg>';
  }

  /* ------------------------------------------------- kleine Teile */

  function sterne(wert, anzahl) {
    return '<span class="u-sterne">' + zeichen('stern', 12) +
      '<b>' + String(wert).replace('.', ',') + '</b>' +
      (anzahl ? '<span>(' + anzahl + ')</span>' : '') + '</span>';
  }

  function verifiziert(text) {
    return '<span class="u-verifiziert" title="Mit Hochschul-Adresse bestätigt">' +
      zeichen('siegel', 13) + (text === false ? '' : '<span>Verifiziert</span>') + '</span>';
  }

  function marke(text, art) {
    return '<span class="u-marke' + (art ? ' u-marke--' + art : '') + '">' + esc(text) + '</span>';
  }

  function abschnitt(titel, mehrText, mehrZiel) {
    return '<div class="u-abschnitt__kopf">' +
      '<h2 class="u-titel u-h2">' + esc(titel) + '</h2>' +
      (mehrText ? '<a class="u-abschnitt__mehr" href="' + esc(mehrZiel) + '">' + esc(mehrText) + '</a>' : '') +
      '</div>';
  }

  function hinweis(text, art) {
    return '<div class="u-hinweis' + (art ? ' u-hinweis--' + art : '') + '">' +
      '<span>' + text + '</span></div>';
  }

  function leer(titel, text, knopfText, knopfZiel) {
    return '<div class="u-leer">' +
      '<p class="u-leer__titel">' + esc(titel) + '</p>' +
      '<p class="u-leer__text">' + esc(text) + '</p>' +
      (knopfText ? '<a class="u-knopf" href="' + esc(knopfZiel) + '">' + esc(knopfText) + '</a>' : '') +
      '</div>';
  }

  function filterleiste(punkte, aktiv, tun) {
    return '<div class="u-filter" role="group">' + punkte.map(function (p) {
      return '<button type="button" class="u-filter__pille" data-tun="' + esc(tun) + '" ' +
        'data-wert="' + esc(p.wert) + '" aria-pressed="' + (p.wert === aktiv ? 'true' : 'false') + '">' +
        esc(p.text) + '</button>';
    }).join('') + '</div>';
  }

  /* Quellenangabe. Nur wo eine echte Adresse hinterlegt ist, entsteht
     ein Verweis — sonst steht die Quelle als Text da und wird als
     Musterdaten gekennzeichnet. Es gibt keinen erfundenen Link. */
  function quelleZeile(quelle, muster) {
    if (!quelle || !quelle.name) return '';
    if (quelle.url) {
      return '<a class="u-quelle" href="' + esc(quelle.url) + '" target="_blank" rel="noopener noreferrer">' +
        'Quelle: ' + esc(quelle.name) + zeichen('aussen', 12) +
        '<span class="u-nurlesen">(öffnet in einem neuen Tab)</span></a>';
    }
    return '<span class="u-quelle u-quelle--muster">Quelle: ' + esc(quelle.name) +
      (muster ? ' · Musterdaten' : '') + '</span>';
  }

  /* ------------------------------------------------- Heute */

  function heuteZeile(t) {
    var m = t.modul ? Uni.daten.modul(t.modul) : null;
    var jetzt = new Date();
    var laeuft = t.start && t.ende &&
      t.datum === Uni.daten.iso(Uni.daten.heute()) &&
      minuten(t.start) <= jetzt.getHours() * 60 + jetzt.getMinutes() &&
      minuten(t.ende) >= jetzt.getHours() * 60 + jetzt.getMinutes();

    return '<a class="u-heute__zeile" href="' + (m ? '/uni/modul/' + esc(m.slug) + '/' : '/uni/kalender/') + '"' +
      (m ? ' data-farbe="' + esc(m.farbe) + '"' : '') + '>' +
      '<span class="u-heute__zeit">' + esc(t.start || '') +
        (t.ende ? '<small>bis ' + esc(t.ende) + '</small>' : '') + '</span>' +
      '<span class="u-heute__was">' +
        '<span class="u-heute__titel">' + esc(t.titel) + '</span>' +
        '<span class="u-heute__ort">' + esc([ARTNAME[t.art] || '', t.ort].filter(Boolean).join(' · ')) + '</span>' +
      '</span>' +
      (laeuft ? '<span class="u-heute__jetzt">Jetzt</span>' : '') +
      '</a>';
  }
  function minuten(hhmm) {
    var t = String(hhmm).split(':');
    return Number(t[0]) * 60 + Number(t[1] || 0);
  }

  /* ------------------------------------------------- Modul */

  function modulkarte(m) {
    var t = Uni.abfrage.naechsterTermin(m.slug);
    return '<a class="u-modulkarte" href="/uni/modul/' + esc(m.slug) + '/" data-farbe="' + esc(m.farbe) + '">' +
      '<span>' +
        '<span class="u-modulkarte__kuerzel">' + esc(m.kuerzel) +
          (Uni.zustand.gepinnt(m.slug) ? ' · angepinnt' : '') + '</span>' +
        '<span class="u-modulkarte__name">' + esc(m.name) + '</span>' +
        '<span class="u-modulkarte__dozent">' + esc(m.dozent) + '</span>' +
      '</span>' +
      '<span class="u-modulkarte__fuss">' + zeichen('uhr', 13) +
        (t ? esc(relativ(t.datum) + ' · ' + t.start) : 'Kein Termin geplant') + '</span>' +
      '</a>';
  }

  function modulzeile(m) {
    var t = Uni.abfrage.naechsterTermin(m.slug);
    return '<a class="u-modulzeile" href="/uni/modul/' + esc(m.slug) + '/" data-farbe="' + esc(m.farbe) + '">' +
      '<span>' +
        '<span class="u-modulzeile__name">' +
          (Uni.zustand.gepinnt(m.slug) ? '<span class="u-nadel">' + zeichen('nadel', 13) + '</span> ' : '') +
          esc(m.name) + '</span>' +
        '<span class="u-modulzeile__meta">' + esc(m.dozent + ' · ' + m.ects + ' ECTS' + (m.note ? ' · Note ' + m.note : '')) + '</span>' +
      '</span>' +
      '<span class="u-modulzeile__naechst">' + (t ? esc(relativ(t.datum)) + '<br>' + esc(t.start) : '—') + '</span>' +
      '</a>';
  }

  /* ------------------------------------------------- Feed */

  /* Redaktionell: Typzeile, Ueberschrift, kurzer Text, Fusszeile.

     Der Eintrag ist ein <article>, kein <a>: in der Fusszeile kann eine
     Quelle stehen, und ein Verweis im Verweis ist nicht erlaubt. Die
     ganze Flaeche bleibt trotzdem anklickbar — der Titelverweis legt
     sich per ::after darueber, Quelle und Anhang liegen darauf.

     ohneModul: im Modul-Hub steht der Name schon im Kopf. */
  function feedEintrag(e, ohneModul) {
    var bezug = e.modul ? Uni.daten.modul(e.modul) : null;
    var m = ohneModul ? null : bezug;
    var typ = { termin: 'Termin', material: 'Material', frage: 'Frage', event: 'Event', campus: 'Campus', hinweis: 'Hinweis' }[e.typ] || e.typ;
    var c = e.campus ? Uni.daten.campusEintrag(e.campus) : null;

    var ziel = e.material ? '/uni/material/' + e.material + '/'
      : c ? '/uni/entdecken/?campus=' + c.slug
      : bezug ? '/uni/modul/' + bezug.slug + '/' : '/uni/';

    var anhang = '';
    if (e.material) {
      var mat = Uni.daten.material(e.material);
      if (mat) {
        anhang = '<a class="u-anhang" href="/uni/material/' + esc(mat.slug) + '/">' +
          '<span class="u-anhang__kachel">' + esc(mat.dateityp.split(' ')[0]) + '</span>' +
          '<span class="u-anhang__text">' +
            '<span class="u-anhang__titel">' + esc(mat.titel) + '</span>' +
            '<span class="u-anhang__meta">' + esc(mat.umfang) + ' · ' + preis(mat.preis) + '</span>' +
          '</span>' + zeichen('weiter', 16) + '</a>';
      }
    }

    var fuss = [];
    if (e.von) fuss.push(esc(e.von));
    if (e.zeit) fuss.push(esc(e.zeit));
    if (e.antworten) fuss.push('<b>' + e.antworten + ' Antworten</b>');
    if (e.hilfreich) fuss.push(e.hilfreich + '× hilfreich');

    var quelle = c ? quelleZeile(c.quelle, c.muster) : '';

    return '<article class="u-feed__eintrag"' + (bezug ? ' data-farbe="' + esc(bezug.farbe) + '"' : '') + '>' +
      '<p class="u-feed__typ">' + esc(typ) + (m ? ' <span>· ' + esc(m.name) + '</span>' : '') +
        (e.amtlich ? ' <span>· amtlich</span>' : '') + '</p>' +
      '<h3 class="u-feed__titel"><a href="' + esc(ziel) + '">' + esc(e.titel) + '</a></h3>' +
      (e.text ? '<p class="u-feed__text">' + esc(e.text) + '</p>' : '') +
      anhang +
      '<p class="u-feed__fuss">' + fuss.join(' · ') + (quelle ? (fuss.length ? '<br>' : '') + quelle : '') + '</p>' +
      '</article>';
  }

  /* Ein Campus-Beitrag in derselben Form. Die Quelle steht hier immer
     dabei, weil genau das der Unterschied zu einem Modulbeitrag ist. */
  function campusEintrag(c) {
    var art = { hinweis: 'Hinweis', event: 'Event', angebot: 'Angebot', wegweiser: 'Wegweiser' }[c.art] || 'Campus';
    return '<article class="u-feed__eintrag">' +
      '<p class="u-feed__typ">' + esc(art) +
        (c.quelle ? ' <span>· ' + esc(c.quelle.name) + '</span>' : '') + '</p>' +
      '<h3 class="u-feed__titel"><a href="/uni/entdecken/?campus=' + esc(c.slug) + '">' + esc(c.titel) + '</a></h3>' +
      '<p class="u-feed__text">' + esc(c.text.length > 140 ? c.text.slice(0, 140) + ' …' : c.text) + '</p>' +
      '<p class="u-feed__fuss">' + esc(relativ(c.datum)) + '<br>' + quelleZeile(c.quelle, c.muster) + '</p>' +
      '</article>';
  }

  /* ------------------------------------------------- Material */

  function materialzeile(mat) {
    var m = mat.modul ? Uni.daten.modul(mat.modul) : null;
    var v = Uni.daten.person(mat.verkaeufer);
    return '<a class="u-material" href="/uni/material/' + esc(mat.slug) + '/"' +
      (m ? ' data-farbe="' + esc(m.farbe) + '"' : '') + '>' +
      '<span class="u-material__kachel"><b>' + esc(mat.dateityp.split(' ')[0]) + '</b>' +
        '<span>' + esc(mat.umfang.replace(/ (Seiten|Karten|Folien|Tabellenblätter)/, '')) + '</span></span>' +
      '<span class="u-material__text">' +
        '<span class="u-material__titel">' + esc(mat.titel) + '</span>' +
        '<span class="u-material__meta">' + esc(TYPNAME[mat.typ] || mat.typ) +
          (v ? ' · ' + esc(v.name) : '') + ' · ' + sterne(mat.bewertung, mat.anzahlBewertungen) + '</span>' +
      '</span>' +
      '<span class="u-material__rechts">' +
        '<span class="u-material__preis">' + preis(mat.preis) + '</span>' +
        (Uni.zustand.gekauft(mat.slug) ? '<span class="u-klein u-leise">gekauft</span>' : '') +
      '</span>' +
      '</a>';
  }

  /* ------------------------------------------------- Termine */

  function terminzeile(t, mitDatum) {
    var m = t.modul ? Uni.daten.modul(t.modul) : null;
    var besonders = t.art === 'pruefung' || t.art === 'abgabe';
    return '<a class="u-termin" href="' + (m ? '/uni/modul/' + esc(m.slug) + '/?reiter=termine' : '/uni/kalender/') + '"' +
      (m ? ' data-farbe="' + esc(m.farbe) + '"' : '') + '>' +
      '<span class="u-termin__zeit">' + esc(t.start || '—') +
        (mitDatum ? '<small>' + esc(relativ(t.datum)) + '</small>' : t.ende ? '<small>bis ' + esc(t.ende) + '</small>' : '') + '</span>' +
      '<span class="u-termin__balken">' +
        '<span class="u-termin__titel">' + esc(t.titel) + '</span>' +
        '<span class="u-termin__meta">' +
          (besonders ? '<b>' + esc(ARTNAME[t.art]) + '</b> · ' : esc(ARTNAME[t.art] || '') + (t.ort ? ' · ' : '')) +
          esc(t.ort || '') + '</span>' +
      '</span>' +
      '</a>';
  }

  /* ------------------------------------------------- Inbox */

  function inboxzeile(c) {
    var p = Uni.daten.person(c.partner);
    var letzte = c.verlauf[c.verlauf.length - 1];
    var ungelesen = c.ungelesen > 0 && !Uni.zustand.gelesen(c.id);
    return '<a class="u-inbox" href="/uni/inbox/?chat=' + esc(c.id) + '" data-farbe="' + esc(c.farbe) + '">' +
      '<span class="u-inbox__bild">' + esc(p ? p.kuerzel : '?') + '</span>' +
      '<span class="u-inbox__text">' +
        '<span class="u-inbox__name">' + esc(p ? p.name : 'Unbekannt') +
          (p && p.verifiziert ? verifiziert(false) : '') + '</span>' +
        '<span class="u-inbox__bezug">' + esc(bezugText(c.bezug)) + '</span>' +
        '<span class="u-inbox__letzte">' + (letzte.von === 'ich' ? 'Du: ' : '') + esc(letzte.text) + '</span>' +
      '</span>' +
      '<span class="u-inbox__rechts">' + esc(kurzZeit(letzte.zeit)) +
        (ungelesen ? '<br><span class="u-inbox__punkt"></span>' : '') + '</span>' +
      '</a>';
  }
  /* In der Liste steht nur der Tag, nicht die Uhrzeit: „Gestern 18:12“
     wird zu „Gestern“, „Vor 3 Wochen“ bleibt vollstaendig. */
  function kurzZeit(zeit) {
    return String(zeit).replace(/\s+\d{1,2}:\d{2}$/, '');
  }

  function bezugText(b) {
    if (!b) return '';
    var art = { flohmarkt: 'Flohmarkt', material: 'Material', service: 'Service', system: 'Mitteilung' }[b.art] || '';
    return art + (b.titel ? ' · ' + b.titel : '');
  }

  /* ------------------------------------------------- Flohmarkt */

  function flohkarte(a) {
    return '<a class="u-flohkarte" href="/uni/flohmarkt/' + esc(a.slug) + '/" data-farbe="' + esc(a.farbe) + '">' +
      '<span class="u-flohkarte__flaeche" aria-hidden="true">' + esc(a.kategorie) + '</span>' +
      '<span class="u-flohkarte__text">' +
        '<span class="u-flohkarte__titel">' + esc(a.titel) + '</span>' +
        '<span class="u-flohkarte__preis">' + preis(a.preis) + '</span>' +
        '<span class="u-flohkarte__meta">' + esc(a.zustand + ' · ' + relativ(a.eingestellt)) + '</span>' +
      '</span>' +
      '</a>';
  }

  return {
    esc: esc, zeichen: zeichen, preis: preis,
    datumLang: datumLang, datumKurz: datumKurz, relativ: relativ, inTagen: inTagen,
    tageBis: tageBis, ausIso: ausIso, minuten: minuten,
    ARTNAME: ARTNAME, TYPNAME: TYPNAME, WOCHENTAG_KURZ: WOCHENTAG_KURZ, MONAT: MONAT,
    sterne: sterne, verifiziert: verifiziert, marke: marke, abschnitt: abschnitt,
    hinweis: hinweis, leer: leer, filterleiste: filterleiste,
    heuteZeile: heuteZeile, modulkarte: modulkarte, modulzeile: modulzeile,
    feedEintrag: feedEintrag, campusEintrag: campusEintrag, quelleZeile: quelleZeile,
    materialzeile: materialzeile, terminzeile: terminzeile,
    inboxzeile: inboxzeile, flohkarte: flohkarte, bezugText: bezugText
  };
})();
