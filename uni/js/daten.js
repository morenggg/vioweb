/* =========================================================================
   Campus — Zugriff auf die Daten.

   Diese Datei haelt nichts selbst. Sie liefert die Datumshilfen (die
   alle anderen brauchen) und ein einziges Fenster auf zwei Quellen:

     Uni.hochschuldaten   Angaben aus oeffentlichen Hochschulquellen
     Uni.muster           erfundene Inhalte fuer die Ansicht

   Die Trennung ist Absicht. Wer wissen will, ob eine Angabe echt ist,
   schaut auf herkunft — und die Oberflaeche zeigt es an.

   Ladereihenfolge: daten.js zuerst (wegen der Datumshilfen), danach
   hochschuldaten.js und musterdaten.js. Die Zugriffe unten laufen erst
   beim Zeichnen, deshalb ist das unproblematisch.
   ========================================================================= */
window.Uni = window.Uni || {};

Uni.daten = (function () {
  'use strict';

  /* ------------------------------------------------- Datumshilfen */

  function iso(d) {
    var m = d.getMonth() + 1, t = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (t < 10 ? '0' : '') + t;
  }
  function heute() {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }
  function plus(d, tage) {
    var n = new Date(d.getTime());
    n.setDate(n.getDate() + tage);
    return n;
  }
  /* Montag der Woche, in der d liegt. Sonntag zaehlt zur Woche davor. */
  function montag(d) {
    var n = new Date(d.getTime());
    var w = n.getDay() === 0 ? 7 : n.getDay();
    return plus(n, 1 - w);
  }
  var M0 = montag(heute());

  /* wochentag: 1 = Montag ... 7 = Sonntag */
  function termintag(wocheVersatz, wochentag) {
    return iso(plus(M0, wocheVersatz * 7 + (wochentag - 1)));
  }

  var semesterName = 'Wintersemester 2026/27';

  function hd() { return Uni.hochschuldaten; }
  function mu() { return Uni.muster; }

  function nachSlug(liste, slug) {
    for (var i = 0; i < liste.length; i++) if (liste[i].slug === slug) return liste[i];
    return null;
  }
  function nachId(liste, id) {
    for (var i = 0; i < liste.length; i++) if (liste[i].id === id) return liste[i];
    return null;
  }

  return {
    iso: iso, heute: heute, plus: plus, montag: montag, termintag: termintag,
    semesterName: semesterName,

    /* --- Hochschulstruktur (recherchiert) ------------------------- */
    get hochschulen() { return hd().hochschulen; },
    get studiengaenge() { return hd().studiengaenge; },
    get lehramtstypen() { return hd().lehramtstypen; },
    get faecher() { return hd().faecher; },
    get anbieter() { return hd().anbieter; },
    geprueft: function () { return hd().geprueft; },

    hochschule: function (id) { return hd().hochschule(id); },
    studiengang: function (id) { return hd().studiengang(id); },
    lehramtstyp: function (id) { return hd().lehramtstyp(id); },
    fach: function (id) { return hd().fach(id); },
    faechermodell: function (id) { return hd().faechermodell(id); },
    studiengaengeVon: function (h) { return hd().studiengaengeVon(h); },
    lehramtstypenVon: function (h) { return hd().lehramtstypenVon(h); },

    /* --- Inhalte (Muster) ----------------------------------------- */
    get module() { return mu().module; },
    get materialien() { return mu().materialien; },
    get services() { return mu().services; },
    get flohmarkt() { return mu().flohmarkt; },
    get campus() { return mu().campus; },
    get feed() { return mu().feed; },
    get nachrichten() { return mu().nachrichten; },
    get verkaeufer() { return mu().verkaeufer; },
    get termine() { return mu().termine; },

    modul: function (slug) { return nachSlug(mu().module, slug); },
    material: function (slug) { return nachSlug(mu().materialien, slug); },
    service: function (slug) { return nachSlug(mu().services, slug); },
    artikel: function (slug) { return nachSlug(mu().flohmarkt, slug); },
    campusEintrag: function (slug) { return nachSlug(mu().campus, slug); },
    chat: function (id) { return nachId(mu().nachrichten, id); },
    person: function (id) {
      return id === 'system'
        ? { id: 'system', name: 'Campus', kuerzel: 'C', verifiziert: true }
        : nachId(mu().verkaeufer, id);
    },

    /* Wo ein Studiengang seine verbindlichen Angaben veroeffentlicht.
       Wird auf der Modulseite als Verweis angeboten — nicht als Quelle
       des Moduls, sondern als Ort, an dem die echten Angaben stehen. */
    studiendokumente: function (studiengangId) {
      var s = hd().studiengang(studiengangId);
      return s && s.dokumente ? s.dokumente : null;
    }
  };
})();
