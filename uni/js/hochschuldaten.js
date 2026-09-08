/* =========================================================================
   Campus — Hochschulstruktur.

   HIER STEHEN DIE ANGABEN, DIE AUS ÖFFENTLICHEN HOCHSCHULQUELLEN
   STAMMEN. Alles Erfundene liegt getrennt davon in musterdaten.js.

   Jeder Datensatz traegt seine Herkunft:

     offiziell      maschinell aus einer offiziellen Quelle uebernommen
     recherchiert   von Hand aus oeffentlichen Seiten der Hochschule
                    uebernommen, Adresse gespeichert, nicht automatisch
                    geprueft
     gemeinschaft   von Studenten eingetragen
     muster         erfunden, nur zur Ansicht

   Was hier steht, ist „recherchiert“: Struktur des Studienangebots, die
   Lehramtsrichtungen und die Faecherlisten der Universitaet Leipzig,
   jeweils mit der oeffentlichen Adresse, auf der die Angabe steht.
   Modulnamen, Dozenten, Raeume und Uhrzeiten sind NICHT darunter — die
   liegen als Musterdaten daneben und sind in der Oberflaeche als solche
   gekennzeichnet.

   Warum kein automatischer Import: siehe anbieter[] am Ende der Datei.
   ========================================================================= */
window.Uni = window.Uni || {};

Uni.hochschuldaten = (function () {
  'use strict';

  /* Datum der Recherche. Steht an jedem uebernommenen Datensatz, damit
     spaeter erkennbar ist, wie alt die Angabe ist. */
  var GEPRUEFT = '2026-09-08';

  function quelle(name, url) {
    return { name: name, url: url, abgerufen: GEPRUEFT };
  }

  var Q_STUDIENANGEBOT = quelle('Universität Leipzig · Studienangebot',
    'https://www.uni-leipzig.de/studium/vor-dem-studium/studienangebot');
  var Q_LEHRAMT = quelle('Universität Leipzig · Aufbau des Lehramtsstudiums',
    'https://www.uni-leipzig.de/studium/vor-dem-studium/aufbau-des-studiums/lehramt');
  var Q_GYMNASIUM = quelle('Universität Leipzig · Lehramt an Gymnasien',
    'https://www.uni-leipzig.de/studium/im-studium/lehramtsstudium/lehramt-an-gymnasien');
  var Q_OBERSCHULE = quelle('Universität Leipzig · Lehramt an Oberschulen',
    'https://www.uni-leipzig.de/studium/im-studium/lehramtsstudium/lehramt-an-oberschulen');
  var Q_GRUNDSCHULE = quelle('Universität Leipzig · Lehramt an Grundschulen',
    'https://www.uni-leipzig.de/studium/im-studium/lehramtsstudium/lehramt-an-grundschulen');
  var Q_SONDERPAED = quelle('Universität Leipzig · Lehramt Sonderpädagogik',
    'https://www.uni-leipzig.de/studium/vor-dem-studium/studienangebot/studiengang/course/show/lehramt-sonderpaedagogik');
  var Q_WIWI = quelle('Universität Leipzig · Wirtschaftswissenschaften B. Sc.',
    'https://www.uni-leipzig.de/studium/vor-dem-studium/studienangebot/studiengang/course/show/wirtschaftswissenschaften-b-sc');
  var Q_WIFA_DOKUMENTE = quelle('Wirtschaftswissenschaftliche Fakultät · Studiendokumente',
    'https://www.wifa.uni-leipzig.de/studium/studienorganisation/studiendokumente');

  /* ------------------------------------------------- Hochschulen

     Nur fuer die Pilot-Hochschule ist das Studienangebot erfasst. Bei
     den uebrigen steht angebotErfasst: false — die App zeigt dort einen
     leeren Zustand und den Verweis auf die Hochschule, statt Inhalte
     einer anderen Hochschule zu zeigen. */

  var hochschulen = [
    { id: 'uni-leipzig', name: 'Universität Leipzig', kurz: 'Uni Leipzig', ort: 'Leipzig', land: 'Sachsen',
      web: 'https://www.uni-leipzig.de/', mailendung: 'studserv.uni-leipzig.de',
      angebotErfasst: true, pilot: true, herkunft: 'recherchiert', quelle: Q_STUDIENANGEBOT },
    { id: 'htwk-leipzig', name: 'HTWK Leipzig', kurz: 'HTWK', ort: 'Leipzig', land: 'Sachsen',
      web: 'https://www.htwk-leipzig.de/', mailendung: 'stud.htwk-leipzig.de',
      angebotErfasst: false, herkunft: 'recherchiert' },
    { id: 'tu-dresden', name: 'TU Dresden', kurz: 'TU Dresden', ort: 'Dresden', land: 'Sachsen',
      web: 'https://tu-dresden.de/', mailendung: 'mailbox.tu-dresden.de',
      angebotErfasst: false, herkunft: 'recherchiert' },
    { id: 'uni-halle', name: 'Martin-Luther-Universität Halle-Wittenberg', kurz: 'Uni Halle', ort: 'Halle', land: 'Sachsen-Anhalt',
      web: 'https://www.uni-halle.de/', mailendung: 'student.uni-halle.de',
      angebotErfasst: false, herkunft: 'recherchiert' },
    { id: 'uni-jena', name: 'Friedrich-Schiller-Universität Jena', kurz: 'Uni Jena', ort: 'Jena', land: 'Thüringen',
      web: 'https://www.uni-jena.de/', mailendung: 'uni-jena.de',
      angebotErfasst: false, herkunft: 'recherchiert' }
  ];

  /* ------------------------------------------------- Studiengänge

     braucht steuert das Onboarding. Nur was hier steht, wird gefragt —
     ein BWL-Student bekommt keinen Lehramtsschritt zu sehen.

       lehramtstyp   Schulart waehlen
       vertiefung    Studienrichtung waehlen
       faecher       Faecher waehlen (Regeln stehen am Lehramtstyp)

     moduleErfasst sagt, ob es fuer den Studiengang ueberhaupt eine
     Modulstruktur gibt. Ist sie false, zeigt die App den leeren
     Zustand — und niemals die Module eines anderen Studiengangs. */

  var studiengaenge = [
    { id: 'ul-lehramt', hochschule: 'uni-leipzig', name: 'Lehramt', kurz: 'Lehramt',
      abschluss: 'Erste Staatsprüfung', regelstudienzeit: null,
      braucht: { lehramtstyp: true, faecher: true },
      moduleErfasst: true, herkunft: 'recherchiert', quelle: Q_LEHRAMT,
      hinweis: 'Die Universität Leipzig bietet fünf schulartbezogene Lehramtsstudiengänge an. Die Regelstudienzeit hängt von der Schulart ab.' },

    { id: 'ul-wiwi', hochschule: 'uni-leipzig', name: 'Wirtschaftswissenschaften', kurz: 'WiWi',
      abschluss: 'Bachelor of Science', fakultaet: 'Wirtschaftswissenschaftliche Fakultät', regelstudienzeit: 6,
      braucht: {}, moduleErfasst: true, herkunft: 'recherchiert', quelle: Q_WIWI,
      dokumente: Q_WIFA_DOKUMENTE,
      hinweis: 'Betriebswirtschaftslehre ist an der Universität Leipzig kein eigener Bachelor, sondern Teil dieses Studiengangs.' },

    { id: 'ul-informatik', hochschule: 'uni-leipzig', name: 'Informatik', kurz: 'Informatik',
      abschluss: 'Bachelor of Science', fakultaet: 'Fakultät für Mathematik und Informatik', regelstudienzeit: 6,
      braucht: {}, moduleErfasst: true, herkunft: 'recherchiert', quelle: Q_STUDIENANGEBOT },

    { id: 'ul-psychologie', hochschule: 'uni-leipzig', name: 'Psychologie', kurz: 'Psychologie',
      abschluss: 'Bachelor of Science', fakultaet: 'Fakultät für Lebenswissenschaften', regelstudienzeit: 6,
      braucht: {}, moduleErfasst: true, herkunft: 'recherchiert', quelle: Q_STUDIENANGEBOT },

    /* Angeboten, aber ohne erfasste Modulstruktur. Genau dafuer gibt es
       den leeren Zustand. */
    { id: 'ul-jura', hochschule: 'uni-leipzig', name: 'Rechtswissenschaft', kurz: 'Jura',
      abschluss: 'Staatsexamen', regelstudienzeit: null,
      braucht: {}, moduleErfasst: false, herkunft: 'recherchiert', quelle: Q_STUDIENANGEBOT },
    { id: 'ul-vwl', hochschule: 'uni-leipzig', name: 'Volkswirtschaftslehre', kurz: 'VWL',
      abschluss: 'Bachelor of Science', fakultaet: 'Wirtschaftswissenschaftliche Fakultät', regelstudienzeit: 6,
      braucht: {}, moduleErfasst: false, herkunft: 'recherchiert', quelle: Q_STUDIENANGEBOT }
  ];

  /* ------------------------------------------------- Lehramtstypen

     Welche Schularten es gibt, haengt an der Hochschule und am
     Bundesland. Deshalb stehen sie NICHT als globale Liste da, sondern
     mit hochschule-Schluessel.

     faechermodell beschreibt, WIE die Faecher gewaehlt werden. Das ist
     der Kern: Grundschule funktioniert anders als Gymnasium, und ein
     Modell „zwei Faecher“ fuer alle waere schlicht falsch. */

  var lehramtstypen = [
    { id: 'ul-la-grundschule', hochschule: 'uni-leipzig', studiengang: 'ul-lehramt',
      name: 'Lehramt an Grundschulen', kurz: 'Grundschule', klassen: '1. bis 4. Klasse',
      faechermodell: 'grundschule', herkunft: 'recherchiert', quelle: Q_GRUNDSCHULE },

    { id: 'ul-la-oberschule', hochschule: 'uni-leipzig', studiengang: 'ul-lehramt',
      name: 'Lehramt an Oberschulen', kurz: 'Oberschule', klassen: '5. bis 10. Klasse',
      faechermodell: 'zwei-faecher-oberschule', regelstudienzeit: 9,
      herkunft: 'recherchiert', quelle: Q_OBERSCHULE },

    { id: 'ul-la-gymnasium', hochschule: 'uni-leipzig', studiengang: 'ul-lehramt',
      name: 'Lehramt an Gymnasien', kurz: 'Gymnasium', klassen: '5. bis 12./13. Klasse',
      faechermodell: 'zwei-faecher-gymnasium', herkunft: 'recherchiert', quelle: Q_GYMNASIUM },

    { id: 'ul-la-sonderpaedagogik', hochschule: 'uni-leipzig', studiengang: 'ul-lehramt',
      name: 'Lehramt Sonderpädagogik', kurz: 'Sonderpädagogik', klassen: '1. bis 4. oder 5. bis 10. Klasse',
      faechermodell: 'sonderpaedagogik', herkunft: 'recherchiert', quelle: Q_SONDERPAED },

    { id: 'ul-la-bbs', hochschule: 'uni-leipzig', studiengang: 'ul-lehramt',
      name: 'Lehramt an berufsbildenden Schulen', kurz: 'Berufsbildende Schulen', klassen: 'Berufliche Bildung',
      faechermodell: null, strukturErfasst: false, herkunft: 'recherchiert', quelle: Q_LEHRAMT,
      hinweis: 'Für diese Schulart ist die Fächer- und Fachrichtungsstruktur hier noch nicht erfasst.' }
  ];

  /* ------------------------------------------------- Fächermodelle

     Jedes Modell beschreibt die Auswahl als Daten, nicht als Code. Das
     Onboarding liest sie und baut daraus die Schritte.

       art     'gruppen'  zwei gleichwertige Faecher mit Gruppenregel
               'kernfach' ein Kernfach plus feste Lernbereiche
               'gemischt' ein Fach plus Bereiche, die nicht erfasst sind
       anzahl  wie viele Faecher gewaehlt werden */

  var faechermodelle = {
    'zwei-faecher-gymnasium': {
      art: 'gruppen', anzahl: 2, quelle: Q_GYMNASIUM,
      erklaerung: 'Zwei Fächer, davon mindestens eines aus Gruppe 1. Die Fächer der Gruppe 2 lassen sich nicht miteinander kombinieren.',
      gruppen: [
        { id: 'g1', name: 'Gruppe 1 · frei kombinierbar',
          faecher: ['biologie', 'deutsch', 'englisch', 'mathematik', 'physik', 'sorbisch', 'sport'] },
        { id: 'g2', name: 'Gruppe 2 · nur mit einem Fach aus Gruppe 1',
          faecher: ['chemie', 'ethik-philosophie', 'franzoesisch', 'grw', 'geschichte', 'informatik',
                    'kunst', 'polnisch', 'ev-religion', 'russisch', 'spanisch', 'tschechisch'] },
        { id: 'g3', name: 'Sonderfall',
          faecher: ['musik'],
          hinweis: 'Musik lässt sich mit einem Fach aus Gruppe 1 oder mit Ethik/Philosophie oder Evangelischer Religion kombinieren.' }
      ]
    },

    'zwei-faecher-oberschule': {
      art: 'gruppen', anzahl: 2, quelle: Q_OBERSCHULE,
      erklaerung: 'Zwei Fächer, davon mindestens eines aus Gruppe 1. Beide werden im gleichen Umfang studiert.',
      gruppen: [
        { id: 'g1', name: 'Gruppe 1 · frei kombinierbar',
          faecher: ['biologie', 'deutsch', 'englisch', 'mathematik', 'physik', 'sorbisch', 'sport'] },
        { id: 'g2', name: 'Gruppe 2 · nur mit einem Fach aus Gruppe 1',
          faecher: ['chemie', 'ethik-philosophie', 'ev-religion', 'franzoesisch', 'grw-os', 'geschichte',
                    'informatik', 'kunst', 'musik', 'polnisch', 'russisch', 'spanisch', 'tschechisch', 'wth'] }
      ]
    },

    /* Grundschule ist ausdruecklich KEIN Zwei-Faecher-Studium. Ein
       Kernfach wird vertieft, dazu kommen feste Lernbereiche der
       Grundschuldidaktik und ein kleines Wahlfach. */
    'grundschule': {
      art: 'kernfach', anzahl: 1, quelle: Q_GRUNDSCHULE,
      erklaerung: 'Ein Kernfach wird vertieft studiert. Dazu kommen die Grundschuldidaktiken Deutsch, Mathematik und Sachunterricht sowie ein kleines Wahlfach.',
      kernfach: ['deutsch', 'mathematik', 'sorbisch', 'englisch', 'ev-religion', 'ethik-philosophie', 'kunst', 'musik', 'sport'],
      lernbereiche: ['gsd-deutsch', 'gsd-mathematik', 'gsd-sachunterricht'],
      wahlfach: ['musik', 'kunst', 'sport', 'werken'],
      wahlfachHinweis: 'Das kleine Wahlfach wird laut Hochschule erst nach der Zulassung festgelegt.'
    },

    /* Fuer Sonderpaedagogik ist das Unterrichtsfach oeffentlich
       beschrieben, die Foerderschwerpunkte sind hier nicht erfasst. Sie
       werden deshalb auch nicht abgefragt und nicht erfunden. */
    'sonderpaedagogik': {
      art: 'gemischt', anzahl: 1, quelle: Q_SONDERPAED,
      erklaerung: 'Neben den Förderschwerpunkten wird ein Unterrichtsfach der Oberschule oder die Grundschuldidaktik studiert.',
      faecher: ['biologie', 'chemie', 'deutsch', 'englisch', 'ethik-philosophie', 'ev-religion', 'geschichte',
                'informatik', 'kunst', 'mathematik', 'musik', 'physik', 'sport', 'wth', 'grundschuldidaktik'],
      nichtErfasst: ['Förderschwerpunkte']
    }
  };

  /* ------------------------------------------------- Fächer

     Eine Liste mit Kennungen, aber KEINE globale Fachliste im Sinne von
     „jedes Fach ist ueberall waehlbar“: welche Faecher zur Auswahl
     stehen, entscheidet allein das Faechermodell der Schulart. */

  /* --- SLUGS faecher --- */
  var faecher = [
    { id: 'biologie',          name: 'Biologie' },
    { id: 'chemie',            name: 'Chemie' },
    { id: 'deutsch',           name: 'Deutsch' },
    { id: 'englisch',          name: 'Englisch' },
    { id: 'ethik-philosophie', name: 'Ethik/Philosophie' },
    { id: 'ev-religion',       name: 'Evangelische Religion' },
    { id: 'franzoesisch',      name: 'Französisch' },
    { id: 'geschichte',        name: 'Geschichte' },
    { id: 'grw',               name: 'Gemeinschaftskunde/Rechtserziehung/Wirtschaft' },
    { id: 'grw-os',            name: 'Gemeinschaftskunde/Rechtserziehung' },
    { id: 'informatik',        name: 'Informatik' },
    { id: 'kunst',             name: 'Kunst' },
    { id: 'mathematik',        name: 'Mathematik' },
    { id: 'musik',             name: 'Musik' },
    { id: 'physik',            name: 'Physik' },
    { id: 'polnisch',          name: 'Polnisch' },
    { id: 'russisch',          name: 'Russisch' },
    { id: 'sorbisch',          name: 'Sorbisch' },
    { id: 'spanisch',          name: 'Spanisch' },
    { id: 'sport',             name: 'Sport' },
    { id: 'tschechisch',       name: 'Tschechisch' },
    { id: 'werken',            name: 'Werken' },
    { id: 'wth',               name: 'Wirtschaft-Technik-Haushalt/Soziales' },
    { id: 'gsd-deutsch',       name: 'Grundschuldidaktik Deutsch' },
    { id: 'gsd-mathematik',    name: 'Grundschuldidaktik Mathematik' },
    { id: 'gsd-sachunterricht', name: 'Grundschuldidaktik Sachunterricht' },
    { id: 'grundschuldidaktik', name: 'Grundschuldidaktik' }
  ];
  /* --- ENDE faecher --- */

  /* ------------------------------------------------- Datenanbieter

     Statt eines grossen Scrapers eine Liste von Anbietern mit klarem
     Status. Ein neuer Anbieter kommt als Eintrag dazu; die App fragt
     immer nur ueber lade() an.

     Fuer den Prototyp liefert allein der statische Import Daten. Was
     mit den anderen ist, steht ehrlich daneben — inklusive der
     Gruende, warum sie hier nicht angebunden sind. */

  var anbieter = [
    { id: 'statisch', name: 'Statischer Import', status: 'aktiv',
      liefert: ['hochschulen', 'studiengaenge', 'lehramtstypen', 'faecher'],
      beschreibung: 'Von Hand aus den öffentlichen Seiten der Hochschule übernommen, mit Adresse und Datum. Das ist die Grundlage dieses Prototyps.' },

    { id: 'modulhandbuch', name: 'Modulhandbücher', status: 'vorbereitet',
      liefert: ['module'],
      quelle: Q_WIFA_DOKUMENTE,
      beschreibung: 'Die Studiendokumente der Fakultäten sind öffentlich, meist als PDF. Ein Import müsste sie herunterladen, den Text auslesen und Modulnummer, Titel, Leistungspunkte und empfohlenes Semester übernehmen.',
      offen: 'Aus dieser Entwicklungsumgebung sind die Hochschulserver nicht erreichbar, ein Abruf war deshalb nicht möglich.' },

    { id: 'vorlesungsverzeichnis', name: 'Vorlesungsverzeichnis (AlmaWeb)', status: 'blockiert',
      liefert: ['veranstaltungen'],
      beschreibung: 'Das Vorlesungsverzeichnis der Universität Leipzig läuft über AlmaWeb.',
      offen: 'AlmaWeb arbeitet mit Sitzungsadressen (mgrqispi.dll mit Token). Es gibt keine stabile öffentliche Adresse je Veranstaltung und keine dokumentierte Schnittstelle. Ohne offizielle Freigabe ist ein Import weder technisch sinnvoll noch zitierfähig.' },

    { id: 'news', name: 'Newsportal und Veranstaltungsportal', status: 'vorbereitet',
      liefert: ['campus'],
      quelle: quelle('Universität Leipzig · Newsportal',
        'https://www.uni-leipzig.de/universitaet/service/medien-und-kommunikation/newsportal'),
      beschreibung: 'Newsportal und Veranstaltungsportal sind öffentlich. Titel, Datum, Kurztext und Adresse ließen sich übernehmen und mit Quellenangabe anzeigen.',
      offen: 'Ein Feed-Format ist nicht bestätigt; der Abruf war aus dieser Umgebung nicht möglich.' },

    { id: 'hisinone', name: 'HISinOne / LSF', status: 'offen',
      liefert: ['veranstaltungen', 'studiengaenge'],
      beschreibung: 'Viele Hochschulen setzen HIS-Systeme ein. Wo sie öffentlich zugänglich sind, wäre ein eigener Anbieter je System sinnvoll.',
      offen: 'Je Hochschule zu prüfen: öffentlicher Zugang, robots.txt, Nutzungsbedingungen, Last.' }
  ];

  /* Einziger Einstiegspunkt für die App. Heute beantwortet ihn der
     statische Import; spaeter tritt hier ein echter Abruf daneben,
     ohne dass die Ansichten sich aendern. */
  function lade(art, hochschuleId) {
    var tabellen = {
      hochschulen: hochschulen,
      studiengaenge: studiengaenge,
      lehramtstypen: lehramtstypen,
      faecher: faecher
    };
    var liste = tabellen[art] || [];
    if (!hochschuleId) return liste.slice();
    return liste.filter(function (x) { return !x.hochschule || x.hochschule === hochschuleId; });
  }

  function nachId(liste, id) {
    for (var i = 0; i < liste.length; i++) if (liste[i].id === id) return liste[i];
    return null;
  }

  return {
    geprueft: GEPRUEFT,
    hochschulen: hochschulen,
    studiengaenge: studiengaenge,
    lehramtstypen: lehramtstypen,
    faechermodelle: faechermodelle,
    faecher: faecher,
    anbieter: anbieter,
    lade: lade,

    hochschule: function (id) { return nachId(hochschulen, id); },
    studiengang: function (id) { return nachId(studiengaenge, id); },
    lehramtstyp: function (id) { return nachId(lehramtstypen, id); },
    fach: function (id) { return nachId(faecher, id); },
    faechermodell: function (id) { return id ? faechermodelle[id] || null : null; },

    /* Studiengaenge einer Hochschule. Ist das Angebot nicht erfasst,
       kommt eine leere Liste — kein Ersatz von anderswo. */
    studiengaengeVon: function (hochschuleId) {
      return studiengaenge.filter(function (s) { return s.hochschule === hochschuleId; });
    },
    lehramtstypenVon: function (hochschuleId) {
      return lehramtstypen.filter(function (t) { return t.hochschule === hochschuleId; });
    }
  };
})();
