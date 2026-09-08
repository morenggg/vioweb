/* =========================================================================
   Campus — Abfragen.

   Die Schicht zwischen Musterdaten und Oberflaeche. Alles, was gefiltert,
   sortiert oder zusammengerechnet werden muss, steht hier — nicht in den
   Ansichten. Wenn spaeter ein Server dazukommt, wird genau diese Datei
   gegen echte Anfragen getauscht und die Ansichten bleiben, wie sie sind.
   ========================================================================= */
window.Uni = window.Uni || {};

Uni.abfrage = (function () {
  'use strict';

  var d = Uni.daten;

  function meineModule() {
    return Uni.zustand.module().map(function (s) { return d.modul(s); }).filter(Boolean);
  }

  /* Angepinnte zuerst, sonst in der gewaehlten Reihenfolge. */
  function moduleSortiert() {
    var m = meineModule();
    var gepinnt = m.filter(function (x) { return Uni.zustand.gepinnt(x.slug); });
    var rest = m.filter(function (x) { return !Uni.zustand.gepinnt(x.slug); });
    return gepinnt.concat(rest);
  }

  function abgeschlosseneModule() {
    return d.module.filter(function (m) { return m.abgeschlossen; })
      .sort(function (a, b) { return b.semester - a.semester; });
  }

  function nachZeit(a, b) {
    if (a.datum !== b.datum) return a.datum < b.datum ? -1 : 1;
    return (a.start || '') < (b.start || '') ? -1 : 1;
  }

  /* Nur Termine der belegten Module, dazu alles ohne Modulbezug
     (eigene To-dos, private Termine, Campus-Veranstaltungen). */
  function meineTermine() {
    var meine = Uni.zustand.module();
    return d.termine.filter(function (t) {
      return !t.modul || meine.indexOf(t.modul) > -1;
    });
  }

  function termineAm(datumIso) {
    return meineTermine().filter(function (t) { return t.datum === datumIso; }).sort(nachZeit);
  }

  function termineVon(vonIso, bisIso) {
    return meineTermine().filter(function (t) {
      return t.datum >= vonIso && t.datum <= bisIso;
    }).sort(nachZeit);
  }

  function heuteTermine() { return termineAm(d.iso(d.heute())); }

  function naechsterTermin(modulSlug) {
    var jetzt = d.iso(d.heute());
    var liste = d.termine.filter(function (t) {
      return t.modul === modulSlug && t.datum >= jetzt;
    }).sort(nachZeit);
    return liste[0] || null;
  }

  /* abTag: alles ab diesem Datum, aber ohne den Tag selbst — sonst
     stuende im Kalender unter „Demnaechst“ noch einmal, was oben schon
     als Termin des Tages steht. */
  function naechstePruefungen(anzahl, abTag) {
    var grenze = abTag || d.iso(d.heute());
    return meineTermine().filter(function (t) {
      return (t.art === 'pruefung' || t.art === 'abgabe') && (abTag ? t.datum > grenze : t.datum >= grenze);
    }).sort(nachZeit).slice(0, anzahl || 3);
  }

  /* Feed: erst die belegten Module, dann Campus. Innerhalb der Gruppen
     bleibt die Reihenfolge aus den Daten erhalten. Spaeter uebernimmt das
     eine Gewichtung. */
  function feed() {
    var meine = Uni.zustand.module();
    var gepinnt = Uni.zustand.stand().gepinnt;
    return d.feed.filter(function (e) {
      return !e.modul || meine.indexOf(e.modul) > -1;
    }).sort(function (a, b) {
      return rang(a) - rang(b);
    });

    function rang(e) {
      if (e.typ === 'termin' || e.typ === 'hinweis') return 0;
      if (e.modul && gepinnt.indexOf(e.modul) > -1) return 1;
      if (e.typ === 'campus' || e.typ === 'event') return 2;
      if (e.typ === 'frage') return 3;
      return 4;
    }
  }

  function feedZuModul(slug) {
    return d.feed.filter(function (e) { return e.modul === slug; });
  }

  function materialienZuModul(slug) {
    return d.materialien.filter(function (m) { return m.modul === slug; });
  }

  function servicesZuModul(slug) {
    return d.services.filter(function (s) { return s.modul === slug; });
  }

  function materialienVon(verkaeuferId) {
    return d.materialien.filter(function (m) { return m.verkaeufer === verkaeuferId; });
  }

  function gekaufteMaterialien() {
    return Uni.zustand.stand().gekauft.map(function (s) { return d.material(s); }).filter(Boolean);
  }

  function favorisierteMaterialien() {
    return Uni.zustand.favoriten().map(function (s) { return d.material(s); }).filter(Boolean);
  }

  /* Materialien filtern und sortieren. filter ist ein einfaches Objekt,
     damit die Ansichten keine eigene Logik brauchen. */
  function materialien(filter) {
    filter = filter || {};
    var liste = d.materialien.slice();
    if (filter.modul) liste = liste.filter(function (m) { return m.modul === filter.modul; });
    if (filter.typ) liste = liste.filter(function (m) { return m.typ === filter.typ; });
    if (filter.hoechstpreis) liste = liste.filter(function (m) { return m.preis <= filter.hoechstpreis; });
    if (filter.mindestbewertung) liste = liste.filter(function (m) { return m.bewertung >= filter.mindestbewertung; });

    if (filter.sortierung === 'preis') liste.sort(function (a, b) { return a.preis - b.preis; });
    else if (filter.sortierung === 'neu') liste.sort(function (a, b) { return a.aktualisiert < b.aktualisiert ? 1 : -1; });
    else liste.sort(function (a, b) { return b.bewertung - a.bewertung; });
    return liste;
  }

  function flohmarkt(filter) {
    filter = filter || {};
    var liste = d.flohmarkt.slice();
    if (filter.kategorie) liste = liste.filter(function (a) { return a.kategorie === filter.kategorie; });
    if (filter.sortierung === 'preis') liste.sort(function (a, b) { return a.preis - b.preis; });
    else liste.sort(function (a, b) { return a.eingestellt < b.eingestellt ? 1 : -1; });
    return liste;
  }

  function ungeleseneNachrichten() {
    return d.nachrichten.filter(function (c) {
      return c.ungelesen > 0 && !Uni.zustand.gelesen(c.id);
    }).length;
  }

  /* Vorschlaege beim Modul-Hinzufuegen: gleicher Studiengang, Semester
     passend, noch nicht belegt. */
  function modulvorschlaege() {
    var p = Uni.zustand.profil();
    return d.katalog.filter(function (m) {
      return m.studiengang === p.studiengang && !Uni.zustand.belegt(m.slug);
    }).sort(function (a, b) {
      return Math.abs(a.semester - p.semester) - Math.abs(b.semester - p.semester);
    });
  }

  /* Globale Suche. Ein Feld, alle Sammlungen. Die Trefferliste traegt
     ihren Typ mit, damit die Ansicht sie nur noch ausgeben muss. */
  function suchen(text) {
    var q = (text || '').trim().toLowerCase();
    if (!q) return [];
    var treffer = [];

    function passt() {
      for (var i = 0; i < arguments.length; i++) {
        var w = arguments[i];
        if (w && String(w).toLowerCase().indexOf(q) > -1) return true;
      }
      return false;
    }

    d.module.concat(d.katalog).forEach(function (m) {
      if (passt(m.name, m.kuerzel, m.dozent, m.beschreibung)) {
        treffer.push({ art: 'modul', titel: m.name, meta: m.dozent + ' · ' + (Uni.zustand.belegt(m.slug) ? 'belegt' : m.semester + '. Semester'), ziel: '/uni/modul/' + m.slug + '/', farbe: m.farbe });
      }
    });
    d.materialien.forEach(function (m) {
      if (passt(m.titel, m.beschreibung, m.typ)) {
        var mod = m.modul ? d.modul(m.modul) : null;
        treffer.push({ art: 'material', titel: m.titel, meta: (mod ? mod.name + ' · ' : '') + Uni.baustein.preis(m.preis), ziel: '/uni/material/' + m.slug + '/', farbe: mod ? mod.farbe : 'stein' });
      }
    });
    d.services.forEach(function (s) {
      if (passt(s.titel, s.beschreibung, s.kategorie)) {
        treffer.push({ art: 'service', titel: s.titel, meta: s.kategorie + ' · ab ' + Uni.baustein.preis(s.preis) + ' je ' + s.einheit, ziel: '/uni/service/' + s.slug + '/', farbe: 'tanne' });
      }
    });
    d.flohmarkt.forEach(function (a) {
      if (passt(a.titel, a.beschreibung, a.kategorie)) {
        treffer.push({ art: 'flohmarkt', titel: a.titel, meta: a.kategorie + ' · ' + Uni.baustein.preis(a.preis), ziel: '/uni/flohmarkt/' + a.slug + '/', farbe: a.farbe });
      }
    });
    d.verkaeufer.forEach(function (v) {
      if (passt(v.name, v.ueber)) {
        var sg = d.studiengang(v.studiengang);
        treffer.push({ art: 'leute', titel: v.name, meta: (sg ? sg.kurz + ' · ' : '') + v.semester + '. Semester', ziel: '/uni/profil/?person=' + v.id, farbe: 'stein' });
      }
    });
    d.campus.forEach(function (c) {
      if (passt(c.titel, c.text)) {
        treffer.push({ art: 'campus', titel: c.titel, meta: c.quelle, ziel: '/uni/entdecken/?campus=' + c.slug, farbe: 'stein' });
      }
    });
    return treffer;
  }

  return {
    meineModule: meineModule, moduleSortiert: moduleSortiert, abgeschlosseneModule: abgeschlosseneModule,
    meineTermine: meineTermine, termineAm: termineAm, termineVon: termineVon, heuteTermine: heuteTermine,
    naechsterTermin: naechsterTermin, naechstePruefungen: naechstePruefungen,
    feed: feed, feedZuModul: feedZuModul,
    materialien: materialien, materialienZuModul: materialienZuModul, materialienVon: materialienVon,
    servicesZuModul: servicesZuModul, gekaufteMaterialien: gekaufteMaterialien,
    favorisierteMaterialien: favorisierteMaterialien, flohmarkt: flohmarkt,
    ungeleseneNachrichten: ungeleseneNachrichten, modulvorschlaege: modulvorschlaege, suchen: suchen
  };
})();
