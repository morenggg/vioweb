/* =========================================================================
   Campus — Zustand.

   Alles, was der Nutzer im Prototyp veraendert, liegt hier: belegte
   Module, angepinnte Module, Favoriten, gekaufte Materialien, Haken auf
   Checklisten, Thema, gelesene Chats, letzte Suchen.

   Gespeichert wird in localStorage. Das ist bewusst der einzige Speicher:
   der Prototyp hat kein Backend, und es werden keine echten Daten
   erhoben. Faellt localStorage aus (privates Fenster, gesperrte
   Speicherung), laeuft die App weiter, merkt sich aber nichts.

   Spaeter tritt an die Stelle von speichern() ein Aufruf an den Server.
   Die Ansichten fassen den Speicher nie direkt an, sie fragen nur ueber
   die Funktionen hier.
   ========================================================================= */
window.Uni = window.Uni || {};

Uni.zustand = (function () {
  'use strict';

  var SCHLUESSEL = 'uni.zustand.v1';

  var grundstand = {
    profil: {
      hochschule: 'uni-leipzig',
      studiengang: 'bwl',
      semester: 3,
      onboardingFertig: false
    },
    /* Module des laufenden Semesters, in dieser Reihenfolge. */
    module: ['statistik-2', 'marketing', 'wirtschaftsrecht', 'investition-finanzierung', 'wirtschaftsinformatik', 'wirtschaftsenglisch'],
    gepinnt: ['statistik-2', 'marketing'],
    favoriten: ['marketing-lernzettel'],
    gekauft: ['formelsammlung-statistik-2'],
    gefolgt: ['v-lena'],
    haken: {},            /* terminId -> [Indizes der erledigten Punkte] */
    gelesen: [],          /* Chat-Kennungen */
    letzteSuchen: ['Statistik II Klausur', 'Taschenrechner', 'Nachhilfe'],
    thema: 'system',      /* system | hell | dunkel */
    benachrichtigungen: 'wichtig'
  };

  var stand = null;
  var horcher = [];

  function tiefeKopie(o) { return JSON.parse(JSON.stringify(o)); }

  function laden() {
    var gespeichert = null;
    try {
      gespeichert = JSON.parse(window.localStorage.getItem(SCHLUESSEL) || 'null');
    } catch (e) { gespeichert = null; }

    stand = tiefeKopie(grundstand);
    if (gespeichert && typeof gespeichert === 'object') {
      Object.keys(grundstand).forEach(function (k) {
        if (gespeichert[k] === undefined) return;
        if (k === 'profil') {
          Object.keys(grundstand.profil).forEach(function (p) {
            if (gespeichert.profil && gespeichert.profil[p] !== undefined) stand.profil[p] = gespeichert.profil[p];
          });
        } else {
          stand[k] = gespeichert[k];
        }
      });
    }
    return stand;
  }

  function speichern() {
    try { window.localStorage.setItem(SCHLUESSEL, JSON.stringify(stand)); } catch (e) { /* egal */ }
    horcher.forEach(function (f) { f(stand); });
  }

  function inListe(liste, wert) { return stand[liste].indexOf(wert) > -1; }

  function umschalten(liste, wert) {
    var i = stand[liste].indexOf(wert);
    if (i > -1) stand[liste].splice(i, 1); else stand[liste].push(wert);
    speichern();
    return i === -1;
  }

  return {
    laden: laden,
    speichern: speichern,
    horchen: function (f) { horcher.push(f); },

    stand: function () { return stand || laden(); },
    profil: function () { return (stand || laden()).profil; },

    /* --- Module --------------------------------------------------- */
    module: function () { return (stand || laden()).module.slice(); },
    belegt: function (slug) { return inListe('module', slug); },
    modulHinzufuegen: function (slug) {
      if (!inListe('module', slug)) { stand.module.push(slug); speichern(); }
    },
    modulEntfernen: function (slug) {
      var i = stand.module.indexOf(slug);
      if (i > -1) { stand.module.splice(i, 1); speichern(); }
      var j = stand.gepinnt.indexOf(slug);
      if (j > -1) { stand.gepinnt.splice(j, 1); speichern(); }
    },
    gepinnt: function (slug) { return inListe('gepinnt', slug); },
    pinUmschalten: function (slug) { return umschalten('gepinnt', slug); },

    /* --- Marktplatz ----------------------------------------------- */
    favorit: function (slug) { return inListe('favoriten', slug); },
    favoritUmschalten: function (slug) { return umschalten('favoriten', slug); },
    favoriten: function () { return (stand || laden()).favoriten.slice(); },
    gekauft: function (slug) { return inListe('gekauft', slug); },
    kaufMerken: function (slug) { if (!inListe('gekauft', slug)) { stand.gekauft.push(slug); speichern(); } },
    folgt: function (id) { return inListe('gefolgt', id); },
    folgenUmschalten: function (id) { return umschalten('gefolgt', id); },

    /* --- Checklisten auf Abgaben ----------------------------------
       Solange der Nutzer nichts angetippt hat, gilt der Stand aus den
       Musterdaten. Beim ersten Antippen wird dieser Stand uebernommen
       und ab dann hier gefuehrt. */
    hakenVorhanden: function (terminId) {
      return Object.prototype.hasOwnProperty.call((stand || laden()).haken, terminId);
    },
    hakenListe: function (terminId) { return (stand || laden()).haken[terminId] || []; },
    hakenUmschalten: function (terminId, index, grund) {
      var l = Object.prototype.hasOwnProperty.call(stand.haken, terminId)
        ? stand.haken[terminId] : (grund || []).slice();
      var i = l.indexOf(index);
      if (i > -1) l.splice(i, 1); else l.push(index);
      stand.haken[terminId] = l;
      speichern();
    },

    /* --- Inbox ----------------------------------------------------- */
    gelesen: function (id) { return inListe('gelesen', id); },
    alsGelesen: function (id) { if (!inListe('gelesen', id)) { stand.gelesen.push(id); speichern(); } },

    /* --- Suche ----------------------------------------------------- */
    letzteSuchen: function () { return (stand || laden()).letzteSuchen.slice(0, 5); },
    sucheMerken: function (text) {
      text = (text || '').trim();
      if (!text) return;
      var i = stand.letzteSuchen.indexOf(text);
      if (i > -1) stand.letzteSuchen.splice(i, 1);
      stand.letzteSuchen.unshift(text);
      stand.letzteSuchen = stand.letzteSuchen.slice(0, 8);
      speichern();
    },

    /* --- Einstellungen --------------------------------------------- */
    thema: function () { return (stand || laden()).thema; },
    themaSetzen: function (wert) {
      stand.thema = wert;
      if (wert === 'system') document.documentElement.removeAttribute('data-thema');
      else document.documentElement.setAttribute('data-thema', wert);
      speichern();
    },
    themaAnwenden: function () {
      var w = (stand || laden()).thema;
      if (w === 'system') document.documentElement.removeAttribute('data-thema');
      else document.documentElement.setAttribute('data-thema', w);
    },
    benachrichtigungen: function () { return (stand || laden()).benachrichtigungen; },
    benachrichtigungenSetzen: function (wert) { stand.benachrichtigungen = wert; speichern(); },

    /* --- Onboarding ------------------------------------------------ */
    onboardingFertig: function () { return (stand || laden()).profil.onboardingFertig; },
    onboardingSpeichern: function (hochschule, studiengang, semester) {
      stand.profil.hochschule = hochschule;
      stand.profil.studiengang = studiengang;
      stand.profil.semester = semester;
      stand.profil.onboardingFertig = true;
      speichern();
    },
    zuruecksetzen: function () {
      stand = tiefeKopie(grundstand);
      speichern();
    }
  };
})();
