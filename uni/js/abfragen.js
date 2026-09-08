/* =========================================================================
   Campus — Abfragen.

   Die Schicht zwischen Musterdaten und Oberflaeche. Alles, was
   gefiltert, sortiert oder zusammengerechnet werden muss, steht hier —
   nicht in den Ansichten.

   Hier faellt auch die Entscheidung, was ein Nutzer ueberhaupt zu sehen
   bekommt. Drei Reichweiten gelten durchgehend:

     modulbezogen        nur, wenn das Modul belegt ist
     studiengangbezogen  nur im eigenen Studiengang
     hochschulweit       fuer alle an der eigenen Hochschule

   Es wird nie auf einen anderen Studiengang ausgewichen. Wer einen
   Studiengang ohne hinterlegte Module waehlt, bekommt leere Listen —
   die Ansichten zeigen dann einen leeren Zustand.

   Wenn spaeter ein Server dazukommt, wird genau diese Datei gegen echte
   Anfragen getauscht; die Ansichten bleiben, wie sie sind.
   ========================================================================= */
window.Uni = window.Uni || {};

Uni.abfrage = (function () {
  'use strict';

  var d = Uni.daten;

  function profil() { return Uni.zustand.profil(); }

  /* ------------------------------------------------- Module */

  function meineModule() {
    return Uni.zustand.module().map(function (s) { return d.modul(s); }).filter(Boolean);
  }

  /* Angepinnte zuerst, sonst in der Reihenfolge des Katalogs. */
  function moduleSortiert() {
    var m = meineModule();
    return m.filter(function (x) { return Uni.zustand.gepinnt(x.slug); })
      .concat(m.filter(function (x) { return !Uni.zustand.gepinnt(x.slug); }));
  }

  /* Module desselben Studiengangs aus frueheren Semestern. Sie sind
     nicht belegt, bleiben aber sichtbar. */
  function frühereModule() {
    var p = profil();
    return d.module.filter(function (m) {
      return m.studiengang === p.studiengang
        && (!m.fach || m.fach === p.fach)
        && m.semester < p.semester;
    }).sort(function (a, b) { return b.semester - a.semester; });
  }

  /* Vorschlaege beim Hinzufuegen: eigener Studiengang, noch nicht
     belegt, nach Naehe zum aktuellen Semester. */
  function modulvorschlaege() {
    var p = profil();
    return d.module.filter(function (m) {
      return m.studiengang === p.studiengang
        && (!m.fach || m.fach === p.fach)
        && !Uni.zustand.belegt(m.slug);
    }).sort(function (a, b) {
      return Math.abs(a.semester - p.semester) - Math.abs(b.semester - p.semester);
    });
  }

  /* ------------------------------------------------- Termine */

  function nachZeit(a, b) {
    if (a.datum !== b.datum) return a.datum < b.datum ? -1 : 1;
    return (a.start || '') < (b.start || '') ? -1 : 1;
  }

  /* Termine der belegten Module, dazu alles ohne Modulbezug (eigene
     To-dos, private Termine, Campus-Veranstaltungen). */
  function meineTermine() {
    var meine = Uni.zustand.module();
    return d.termine.filter(function (t) {
      return !t.modul || meine.indexOf(t.modul) > -1;
    });
  }

  function termineAm(datumIso) {
    return meineTermine().filter(function (t) { return t.datum === datumIso; }).sort(nachZeit);
  }

  function heuteTermine() { return termineAm(d.iso(d.heute())); }

  function naechsterTermin(modulSlug) {
    var jetzt = d.iso(d.heute());
    return d.termine.filter(function (t) { return t.modul === modulSlug && t.datum >= jetzt; })
      .sort(nachZeit)[0] || null;
  }

  /* abTag: alles danach, aber ohne den Tag selbst — sonst stuende im
     Kalender unter „Demnaechst“ noch einmal, was oben schon steht. */
  function naechsteFristen(anzahl, abTag) {
    var grenze = abTag || d.iso(d.heute());
    return meineTermine().filter(function (t) {
      return (t.art === 'pruefung' || t.art === 'abgabe') && (abTag ? t.datum > grenze : t.datum >= grenze);
    }).sort(nachZeit).slice(0, anzahl || 3);
  }

  /* ------------------------------------------------- Feed */

  function feed() {
    var meine = Uni.zustand.module();
    var p = profil();
    var gepinnt = Uni.zustand.stand().gepinnt;

    return d.feed.filter(function (e) {
      if (e.modul) return meine.indexOf(e.modul) > -1;
      if (e.studiengang) return e.studiengang === p.studiengang;
      return true;                       /* hochschulweit */
    }).sort(function (a, b) { return rang(a) - rang(b); });

    /* Reihenfolge: erst was der Nutzer wissen MUSS, dann Module, dann
       Campus, dann Fragen, zuletzt Marktplatz. */
    function rang(e) {
      if (e.typ === 'termin' || e.typ === 'hinweis') return e.modul ? 0 : 2;
      if (e.modul && gepinnt.indexOf(e.modul) > -1) return 1;
      if (e.typ === 'campus' || e.typ === 'event') return 3;
      if (e.typ === 'frage') return 4;
      return 5;
    }
  }

  function feedZuModul(slug) {
    return d.feed.filter(function (e) { return e.modul === slug; });
  }

  /* ------------------------------------------------- Campus */

  /* Hochschulweit heisst: entweder ohne Hochschulbezug oder genau die
     eigene. Fremde Hochschulen tauchen nicht auf. */
  function campus() {
    var h = profil().hochschule;
    return d.campus.filter(function (c) { return !c.hochschule || c.hochschule === h; });
  }

  /* ------------------------------------------------- Marktplatz */

  function materialienZuModul(slug) {
    return d.materialien.filter(function (m) { return m.modul === slug; });
  }

  function servicesZuModul(slug) {
    return d.services.filter(function (s) {
      return s.module && s.module.indexOf(slug) > -1;
    });
  }

  /* Services ohne Modulbindung passen ueberall und stehen deshalb in
     den allgemeinen Listen. */
  function alleServices() { return d.services; }

  function materialienVon(verkaeuferId) {
    return d.materialien.filter(function (m) { return m.verkaeufer === verkaeuferId; });
  }

  function gekaufteMaterialien() {
    return Uni.zustand.kaeufe().map(function (s) { return d.material(s); }).filter(Boolean);
  }

  function favorisierteMaterialien() {
    return Uni.zustand.favoriten().map(function (s) { return d.material(s); }).filter(Boolean);
  }

  /* Zu den eigenen Modulen passendes Material — die Grundlage der
     Empfehlungen unter Entdecken. */
  function materialZuMeinenModulen() {
    var meine = Uni.zustand.module();
    return d.materialien.filter(function (m) { return m.modul && meine.indexOf(m.modul) > -1; });
  }

  function serviceZuMeinenModulen() {
    var meine = Uni.zustand.module();
    return d.services.filter(function (s) {
      if (!s.module || !s.module.length) return false;
      for (var i = 0; i < s.module.length; i++) if (meine.indexOf(s.module[i]) > -1) return true;
      return false;
    });
  }

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

  /* ------------------------------------------------- Flohmarkt */

  /* Nur die eigene Hochschule. Gibt es dort nichts, bleibt die Liste
     leer — der Flohmarkt ist bewusst kein hochschuluebergreifender
     Marktplatz. */
  function flohmarkt(filter) {
    filter = filter || {};
    var h = profil().hochschule;
    var liste = d.flohmarkt.filter(function (a) { return a.hochschule === h; });
    if (filter.kategorie) liste = liste.filter(function (a) { return a.kategorie === filter.kategorie; });
    if (filter.sortierung === 'preis') liste.sort(function (a, b) { return a.preis - b.preis; });
    else liste.sort(function (a, b) { return a.eingestellt < b.eingestellt ? 1 : -1; });
    return liste;
  }

  /* ------------------------------------------------- Inbox */

  function ungeleseneNachrichten() {
    return d.nachrichten.filter(function (c) {
      return c.ungelesen > 0 && !Uni.zustand.gelesen(c.id);
    }).length;
  }

  /* ------------------------------------------------- Suche

     Ein Feld, alle Sammlungen. Eigene Module und der eigene Studiengang
     stehen vorn, andere Studiengaenge sind durchsuchbar, aber weiter
     hinten. */

  function suchen(text) {
    var q = (text || '').trim().toLowerCase();
    if (!q) return [];
    var b = Uni.baustein;
    var p = profil();
    var treffer = [];

    function passt() {
      for (var i = 0; i < arguments.length; i++) {
        var w = arguments[i];
        if (w && String(w).toLowerCase().indexOf(q) > -1) return true;
      }
      return false;
    }

    d.module.forEach(function (m) {
      if (!passt(m.name, m.kuerzel, m.dozent, m.beschreibung)) return;
      var eigen = m.studiengang === p.studiengang;
      var sg = d.studiengang(m.studiengang);
      treffer.push({
        art: 'modul', titel: m.name, farbe: m.farbe, rang: Uni.zustand.belegt(m.slug) ? 0 : eigen ? 1 : 3,
        meta: m.dozent + ' · ' + (Uni.zustand.belegt(m.slug) ? 'belegt' : (sg ? sg.kurz + ' · ' : '') + m.semester + '. Semester'),
        ziel: '/uni/modul/' + m.slug + '/'
      });
    });
    d.materialien.forEach(function (m) {
      if (!passt(m.titel, m.beschreibung, m.typ)) return;
      var mod = m.modul ? d.modul(m.modul) : null;
      treffer.push({
        art: 'material', titel: m.titel, farbe: mod ? mod.farbe : 'stein',
        rang: mod && Uni.zustand.belegt(mod.slug) ? 0 : 2,
        meta: (mod ? mod.name + ' · ' : '') + b.preis(m.preis),
        ziel: '/uni/material/' + m.slug + '/'
      });
    });
    d.services.forEach(function (s) {
      if (!passt(s.titel, s.beschreibung, s.kategorie)) return;
      treffer.push({
        art: 'service', titel: s.titel, farbe: 'tanne', rang: 2,
        meta: s.kategorie + ' · ab ' + b.preis(s.preis) + ' je ' + s.einheit,
        ziel: '/uni/service/' + s.slug + '/'
      });
    });
    flohmarkt({}).forEach(function (a) {
      if (!passt(a.titel, a.beschreibung, a.kategorie)) return;
      treffer.push({
        art: 'flohmarkt', titel: a.titel, farbe: a.farbe, rang: 2,
        meta: a.kategorie + ' · ' + b.preis(a.preis),
        ziel: '/uni/flohmarkt/' + a.slug + '/'
      });
    });
    d.verkaeufer.forEach(function (v) {
      if (!passt(v.name, v.ueber)) return;
      var sg = d.studiengang(v.studiengang);
      treffer.push({
        art: 'leute', titel: v.name, farbe: 'stein', rang: v.studiengang === p.studiengang ? 1 : 3,
        meta: (sg ? sg.kurz + ' · ' : '') + v.semester + '. Semester',
        ziel: '/uni/profil/?person=' + v.id
      });
    });
    campus().forEach(function (c) {
      if (!passt(c.titel, c.text)) return;
      treffer.push({
        art: 'campus', titel: c.titel, farbe: 'stein', rang: 2,
        meta: c.quelle ? c.quelle.name : '', ziel: '/uni/entdecken/?campus=' + c.slug
      });
    });

    return treffer.sort(function (a, b2) { return a.rang - b2.rang; });
  }

  return {
    meineModule: meineModule, moduleSortiert: moduleSortiert, frühereModule: frühereModule,
    modulvorschlaege: modulvorschlaege,
    meineTermine: meineTermine, termineAm: termineAm, heuteTermine: heuteTermine,
    naechsterTermin: naechsterTermin, naechsteFristen: naechsteFristen,
    feed: feed, feedZuModul: feedZuModul, campus: campus,
    materialien: materialien, materialienZuModul: materialienZuModul, materialienVon: materialienVon,
    servicesZuModul: servicesZuModul, alleServices: alleServices,
    materialZuMeinenModulen: materialZuMeinenModulen, serviceZuMeinenModulen: serviceZuMeinenModulen,
    gekaufteMaterialien: gekaufteMaterialien, favorisierteMaterialien: favorisierteMaterialien,
    flohmarkt: flohmarkt, ungeleseneNachrichten: ungeleseneNachrichten, suchen: suchen
  };
})();
