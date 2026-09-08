/* =========================================================================
   Campus — Zustand.

   Die einzige Quelle fuer alles, was den Nutzer betrifft: Name,
   Hochschule, Studiengang, Lehramtstyp, Faecher, Semester, belegte
   Module, angepinnte Module, Favoriten, Kaeufe, Haken, Thema.

   Kopf, Home, Studium, Feed, Entdecken, Suche und Profil lesen
   ausschliesslich hier — es gibt keinen zweiten Nutzerzustand daneben
   und keinen Namen im Markup.

   Wichtig ist die Unterscheidung:

     empfohleneModule()  was laut Studienstruktur zum Semester passt
     module()            was der Nutzer tatsaechlich bestaetigt hat

   Der Studienverlaufsplan sagt nur, was ueblich ist. Ob jemand ein
   Modul wirklich belegt, entscheidet er im Onboarding selbst.

   Gespeichert wird in localStorage, nur in diesem Browser. Faellt der
   Speicher aus (privates Fenster), laeuft die App weiter und merkt sich
   nichts. Spaeter tritt an die Stelle von speichern() ein Aufruf an den
   Server.
   ========================================================================= */
window.Uni = window.Uni || {};

Uni.zustand = (function () {
  'use strict';

  var SCHLUESSEL = 'uni.zustand.v3';

  var grundstand = {
    profil: {
      name: '',              /* leer erlaubt: dann gruesst die App ohne Namen */
      hochschule: 'uni-leipzig',
      studiengang: null,
      lehramtstyp: null,     /* nur wo der Studiengang es verlangt */
      vertiefung: null,      /* vorbereitet, noch von keinem Studiengang benutzt */
      faecher: [],           /* ein oder mehrere, je nach Faechermodell */
      semester: 3,
      verifizierung: 'bestaetigt',   /* offen | bestaetigt — im Prototyp gesetzt */
      onboardingFertig: false
    },
    module: null,            /* null = noch nichts bestaetigt */
    gepinnt: [],
    favoriten: [],
    gekauft: [],
    gefolgt: [],
    haken: {},               /* terminId -> [Indizes der erledigten Punkte] */
    gelesen: [],             /* Chat-Kennungen */
    letzteSuchen: [],
    thema: 'system',         /* system | hell | dunkel */
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

  function s() { return stand || laden(); }

  function inListe(liste, wert) { return s()[liste].indexOf(wert) > -1; }

  function umschalten(liste, wert) {
    var i = stand[liste].indexOf(wert);
    if (i > -1) stand[liste].splice(i, 1); else stand[liste].push(wert);
    speichern();
    return i === -1;
  }

  /* Was laut Studienstruktur zum aktuellen Semester passt.

     Bei Lehramt zaehlen drei Schluessel mit: die Schulart, die
     gewaehlten Faecher und die Gruppe des Moduls. Ein Modul ohne
     lehramtstyp gilt fuer jede Schulart, ein Modul ohne fach fuer jede
     Faecherwahl.

     Gibt es fuer die Kombination nichts, ist die Liste leer — es wird
     NIE auf einen anderen Studiengang ausgewichen. */
  function empfohleneModule(profil) {
    profil = profil || s().profil;
    if (!profil.studiengang) return [];
    var faecher = profil.faecher || [];
    return Uni.daten.module.filter(function (m) {
      if (m.studiengang !== profil.studiengang) return false;
      if (m.semester !== profil.semester) return false;
      if (m.lehramtstyp && m.lehramtstyp !== profil.lehramtstyp) return false;
      if (m.fach && faecher.indexOf(m.fach) === -1) return false;
      return true;
    });
  }

  function empfohleneSlugs(profil) {
    return empfohleneModule(profil).map(function (m) { return m.slug; });
  }

  /* Aus der Empfehlung eine eigene Liste machen, sobald der Nutzer
     selbst eingreift. */
  function festschreiben() {
    if (stand.module === null) stand.module = empfohleneSlugs();
  }

  return {
    laden: laden,
    speichern: speichern,
    horchen: function (f) { horcher.push(f); },
    stand: s,
    profil: function () { return s().profil; },

    /* --- Name ------------------------------------------------------ */
    name: function () { return s().profil.name || ''; },
    kuerzel: function () {
      var n = s().profil.name.trim();
      return n ? n.charAt(0).toUpperCase() : '';
    },
    nameSetzen: function (wert) {
      stand.profil.name = String(wert || '').trim().slice(0, 40);
      speichern();
    },

    /* --- Module ----------------------------------------------------
       module() sind die bestaetigten Module. Solange nichts bestaetigt
       ist, gilt die Empfehlung — das passiert nur, wenn jemand das
       Onboarding abbricht. */
    empfohleneModule: empfohleneModule,
    empfohleneSlugs: empfohleneSlugs,
    module: function () {
      var st = s();
      return st.module === null ? empfohleneSlugs(st.profil) : st.module.slice();
    },
    moduleBestaetigt: function (slugs) {
      stand.module = (slugs || []).slice();
      stand.gepinnt = stand.gepinnt.filter(function (x) { return stand.module.indexOf(x) > -1; });
      speichern();
    },
    eigeneModulliste: function () { return s().module !== null; },
    belegt: function (slug) { return this.module().indexOf(slug) > -1; },
    modulHinzufuegen: function (slug) {
      festschreiben();
      if (stand.module.indexOf(slug) === -1) { stand.module.push(slug); speichern(); }
    },
    modulEntfernen: function (slug) {
      festschreiben();
      var i = stand.module.indexOf(slug);
      if (i > -1) stand.module.splice(i, 1);
      var j = stand.gepinnt.indexOf(slug);
      if (j > -1) stand.gepinnt.splice(j, 1);
      speichern();
    },
    /* Eigene Auswahl verwerfen: es gilt wieder die Empfehlung. */
    moduleAbleiten: function () {
      stand.module = null;
      var neue = empfohleneSlugs();
      stand.gepinnt = stand.gepinnt.filter(function (x) { return neue.indexOf(x) > -1; });
      speichern();
    },
    gepinnt: function (slug) { return inListe('gepinnt', slug); },
    pinUmschalten: function (slug) { return umschalten('gepinnt', slug); },

    /* --- Marktplatz ------------------------------------------------- */
    favorit: function (slug) { return inListe('favoriten', slug); },
    favoritUmschalten: function (slug) { return umschalten('favoriten', slug); },
    favoriten: function () { return s().favoriten.slice(); },
    gekauft: function (slug) { return inListe('gekauft', slug); },
    kaeufe: function () { return s().gekauft.slice(); },
    kaufMerken: function (slug) { if (!inListe('gekauft', slug)) { stand.gekauft.push(slug); speichern(); } },
    folgt: function (id) { return inListe('gefolgt', id); },
    folgenUmschalten: function (id) { return umschalten('gefolgt', id); },

    /* --- Checklisten auf Abgaben ------------------------------------
       Solange der Nutzer nichts angetippt hat, gilt der Stand aus den
       Musterdaten. Beim ersten Antippen wird er uebernommen. */
    hakenVorhanden: function (terminId) {
      return Object.prototype.hasOwnProperty.call(s().haken, terminId);
    },
    hakenListe: function (terminId) { return s().haken[terminId] || []; },
    hakenUmschalten: function (terminId, index, grund) {
      var l = Object.prototype.hasOwnProperty.call(stand.haken, terminId)
        ? stand.haken[terminId] : (grund || []).slice();
      var i = l.indexOf(index);
      if (i > -1) l.splice(i, 1); else l.push(index);
      stand.haken[terminId] = l;
      speichern();
    },

    /* --- Inbox ------------------------------------------------------- */
    gelesen: function (id) { return inListe('gelesen', id); },
    alsGelesen: function (id) { if (!inListe('gelesen', id)) { stand.gelesen.push(id); speichern(); } },

    /* --- Suche ------------------------------------------------------- */
    letzteSuchen: function () { return s().letzteSuchen.slice(0, 5); },
    sucheMerken: function (text) {
      text = (text || '').trim();
      if (!text) return;
      var i = stand.letzteSuchen.indexOf(text);
      if (i > -1) stand.letzteSuchen.splice(i, 1);
      stand.letzteSuchen.unshift(text);
      stand.letzteSuchen = stand.letzteSuchen.slice(0, 8);
      speichern();
    },

    /* --- Einstellungen ----------------------------------------------- */
    thema: function () { return s().thema; },
    themaSetzen: function (wert) {
      stand.thema = wert;
      this.themaAnwenden();
      speichern();
    },
    themaAnwenden: function () {
      var w = s().thema;
      if (w === 'system') document.documentElement.removeAttribute('data-thema');
      else document.documentElement.setAttribute('data-thema', w);
    },
    benachrichtigungen: function () { return s().benachrichtigungen; },
    benachrichtigungenSetzen: function (wert) { stand.benachrichtigungen = wert; speichern(); },

    /* --- Onboarding ---------------------------------------------------
       Speichert die Angaben und setzt die Modulliste zurueck: sie wird
       ab jetzt wieder aus dem Studiengang abgeleitet. Angepinntes, das
       nicht mehr passt, faellt weg. */
    onboardingFertig: function () { return s().profil.onboardingFertig; },

    /* Die Angaben aus dem Onboarding. Die Modulliste bleibt zunaechst
       offen: sie wird im Schritt „Deine Module“ bestaetigt. */
    onboardingSpeichern: function (angaben) {
      var p = stand.profil;
      p.name = String(angaben.name || '').trim().slice(0, 40);
      p.hochschule = angaben.hochschule || p.hochschule;
      p.studiengang = angaben.studiengang || null;
      p.lehramtstyp = angaben.lehramtstyp || null;
      p.vertiefung = angaben.vertiefung || null;
      p.faecher = (angaben.faecher || []).slice();
      p.semester = Number(angaben.semester) || p.semester;
      stand.module = null;
      stand.gepinnt = [];
      speichern();
    },
    onboardingAbschliessen: function () {
      stand.profil.onboardingFertig = true;
      if (stand.module === null) stand.module = empfohleneSlugs();
      speichern();
    },

    zuruecksetzen: function () {
      stand = tiefeKopie(grundstand);
      speichern();
    }
  };
})();
