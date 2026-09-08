/* =========================================================================
   Campus — Musterdaten.

   ALLES HIER IST ERFUNDEN. Keine echten Studenten, keine echten Dozenten,
   keine echten Meldungen einer Hochschule, keine echten Preise. Der
   Prototyp hat kein Backend; diese Datei nimmt spaeter die Stelle der
   Schnittstelle ein.

   Aufbau wie eine spaetere Datenbank: flache Sammlungen, die ueber
   Schluessel aufeinander zeigen.

     hochschulen   id
     studiengaenge id, optional faecher
     module        slug · studiengang · fach · semester
     materialien   slug · modul · verkaeufer
     services      slug · modul · anbieter
     flohmarkt     slug · verkaeufer · hochschule
     campus        slug · hochschule · quelle
     feed          id   · modul | studiengang | hochschulweit
     nachrichten   id   · partner · bezug

   Die Zuordnung Studiengang -> Semester -> Module ist die Grundlage der
   ganzen Personalisierung. Wer Lehramt waehlt, bekommt Lehramtsmodule;
   wer einen Studiengang ohne hinterlegte Module waehlt, bekommt einen
   leeren Zustand und NICHT ersatzweise BWL.

   Termine entstehen aus den Stundenplaenen der Module, relativ zum
   heutigen Tag. Der Prototyp zeigt dadurch immer eine glaubwuerdige
   Woche, egal wann er geoeffnet wird.
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

  /* ------------------------------------------------- Hochschulen

     web ist die echte Startseite der Einrichtung. Sie ist die einzige
     Adresse, die in diesem Prototyp nach draussen zeigt, und wird nur
     dort verwendet, wo der Verweis inhaltlich stimmt: als Wegweiser zu
     den Seiten der Hochschule, nie unter einer erfundenen Meldung. */

  var hochschulen = [
    { id: 'uni-leipzig',  name: 'Universität Leipzig',              kurz: 'Uni Leipzig', ort: 'Leipzig', mailendung: 'studserv.uni-leipzig.de', web: 'https://www.uni-leipzig.de/' },
    { id: 'htwk-leipzig', name: 'HTWK Leipzig',                     kurz: 'HTWK',        ort: 'Leipzig', mailendung: 'stud.htwk-leipzig.de',    web: 'https://www.htwk-leipzig.de/' },
    { id: 'tu-dresden',   name: 'TU Dresden',                       kurz: 'TU Dresden',  ort: 'Dresden', mailendung: 'mailbox.tu-dresden.de',   web: 'https://tu-dresden.de/' },
    { id: 'uni-halle',    name: 'Martin-Luther-Universität Halle',  kurz: 'Uni Halle',   ort: 'Halle',   mailendung: 'student.uni-halle.de',    web: 'https://www.uni-halle.de/' },
    { id: 'uni-jena',     name: 'Universität Jena',                 kurz: 'Uni Jena',    ort: 'Jena',    mailendung: 'uni-jena.de',             web: 'https://www.uni-jena.de/' }
  ];

  /* ------------------------------------------------- Studiengaenge

     faecher gibt es nur, wo der Studiengang wirklich in Faecher
     zerfaellt. Das Onboarding blendet den Schritt sonst aus.
     Studiengaenge ohne hinterlegte Module sind Absicht: sie zeigen den
     leeren Zustand. */

  var studiengaenge = [
    { id: 'bwl',          name: 'Betriebswirtschaftslehre', kurz: 'BWL',          abschluss: 'Bachelor' },
    { id: 'lehramt',      name: 'Lehramt',                  kurz: 'Lehramt',      abschluss: 'Staatsexamen',
      faecher: [
        { id: 'deutsch',     name: 'Deutsch' },
        { id: 'mathematik',  name: 'Mathematik' }
      ] },
    { id: 'informatik',   name: 'Informatik',               kurz: 'Informatik',   abschluss: 'Bachelor' },
    { id: 'psychologie',  name: 'Psychologie',              kurz: 'Psychologie',  abschluss: 'Bachelor' },
    { id: 'maschinenbau', name: 'Maschinenbau',             kurz: 'Maschinenbau', abschluss: 'Bachelor' },
    { id: 'vwl',          name: 'Volkswirtschaftslehre',    kurz: 'VWL',          abschluss: 'Bachelor' },
    { id: 'jura',         name: 'Rechtswissenschaft',       kurz: 'Jura',         abschluss: 'Staatsexamen' },
    { id: 'winfo',        name: 'Wirtschaftsinformatik',    kurz: 'WI',           abschluss: 'Bachelor' }
  ];

  /* Musterwerte fuer das Konto des Prototyps. Sie haengen bewusst NICHT
     an einem Namen — der Name kommt aus dem Profil des Nutzers. */
  var demoKonto = {
    verifiziert: true, seit: 'Oktober 2025',
    bewertung: 4.8, anzahlBewertungen: 12, verkaeufe: 7, kaeufe: 5
  };

  /* ------------------------------------------------- Modulkatalog

     Ein Termin im Stundenplan. art steuert die Beschriftung. */
  function V(wochentag, start, ende, ort) {
    return { wochentag: wochentag, start: start, ende: ende, ort: ort, art: 'vorlesung', titel: 'Vorlesung' };
  }
  function S(wochentag, start, ende, ort, titel) {
    return { wochentag: wochentag, start: start, ende: ende, ort: ort, art: 'seminar', titel: titel || 'Seminar' };
  }

  /* --- SLUGS module --- */
  var module = [

    /* ---------------- Betriebswirtschaftslehre ---------------- */
    { slug: 'grundlagen-bwl', name: 'Grundlagen der Betriebswirtschaftslehre', kuerzel: 'GBW', dozent: 'Prof. Reimann',
      farbe: 'terrakotta', ects: 6, semester: 1, studiengang: 'bwl', pruefung: 'Klausur, 90 Minuten', teilnehmer: 312,
      beschreibung: 'Aufbau von Unternehmen, betriebliche Funktionen und die Grundbegriffe, auf denen alle weiteren Module aufbauen.',
      plan: [V(1, '09:00', '10:30', 'Hörsaal 1')] },
    { slug: 'wirtschaftsmathematik', name: 'Wirtschaftsmathematik', kuerzel: 'WMA', dozent: 'Dr. Weiss',
      farbe: 'tinte', ects: 6, semester: 1, studiengang: 'bwl', pruefung: 'Klausur, 90 Minuten', teilnehmer: 298,
      beschreibung: 'Folgen, Funktionen, Differential- und Integralrechnung mit wirtschaftlichen Anwendungen.',
      plan: [V(2, '08:30', '10:00', 'Hörsaal 2')] },
    { slug: 'buchfuehrung', name: 'Buchführung und Abschluss', kuerzel: 'BUF', dozent: 'Dr. Meinhardt',
      farbe: 'oliv', ects: 5, semester: 1, studiengang: 'bwl', pruefung: 'Klausur, 90 Minuten', teilnehmer: 268,
      beschreibung: 'Doppelte Buchführung, Jahresabschluss und Bilanzierung von der ersten Buchung an.',
      plan: [V(4, '10:15', '11:45', 'Hörsaal 4')] },
    { slug: 'statistik-1', name: 'Statistik I', kuerzel: 'STA I', dozent: 'Prof. Wagner',
      farbe: 'koralle', ects: 6, semester: 2, studiengang: 'bwl', pruefung: 'Klausur, 90 Minuten', teilnehmer: 231,
      beschreibung: 'Deskriptive Statistik und Wahrscheinlichkeitsrechnung als Grundlage für Statistik II.',
      plan: [V(2, '10:15', '11:45', 'Hörsaal 3')] },
    { slug: 'mikrooekonomik', name: 'Mikroökonomik', kuerzel: 'MIK', dozent: 'Prof. Ahrens',
      farbe: 'pflaume', ects: 6, semester: 2, studiengang: 'bwl', pruefung: 'Klausur, 90 Minuten', teilnehmer: 245,
      beschreibung: 'Haushalts- und Unternehmenstheorie, Marktformen und Preisbildung.',
      plan: [V(3, '12:00', '13:30', 'Hörsaal 1')] },
    { slug: 'kostenrechnung', name: 'Kosten- und Leistungsrechnung', kuerzel: 'KLR', dozent: 'Dr. Weiss',
      farbe: 'senf', ects: 5, semester: 2, studiengang: 'bwl', pruefung: 'Klausur, 90 Minuten', teilnehmer: 224,
      beschreibung: 'Kostenarten, Kostenstellen, Kostenträger und die Kalkulation im Betrieb.',
      plan: [V(5, '10:15', '11:45', 'Seminarraum 2.01')] },
    { slug: 'statistik-2', name: 'Statistik II', kuerzel: 'STA II', dozent: 'Prof. Wagner',
      farbe: 'koralle', ects: 6, semester: 3, studiengang: 'bwl', pruefung: 'Klausur, 90 Minuten', teilnehmer: 214,
      beschreibung: 'Schließende Statistik: Schätzverfahren, Hypothesentests, Regression. Aufbauend auf Statistik I.',
      plan: [V(2, '10:15', '11:45', 'Hörsaal 3'), S(4, '14:00', '15:30', 'Seminarraum 2.04', 'Übung')] },
    { slug: 'marketing', name: 'Marketing', kuerzel: 'MKT', dozent: 'Prof. Berger',
      farbe: 'senf', ects: 5, semester: 3, studiengang: 'bwl', pruefung: 'Hausarbeit und Präsentation', teilnehmer: 186,
      beschreibung: 'Marketingmanagement, Marktforschung, Positionierung und Kommunikationspolitik.',
      plan: [V(2, '14:00', '15:30', 'Seminarraum 1.12')] },
    { slug: 'wirtschaftsrecht', name: 'Wirtschaftsrecht', kuerzel: 'WR', dozent: 'Dr. König',
      farbe: 'tinte', ects: 5, semester: 3, studiengang: 'bwl', pruefung: 'Klausur, 60 Minuten', teilnehmer: 203,
      beschreibung: 'BGB im unternehmerischen Alltag, Handelsrecht, Gesellschaftsformen und Vertragsgestaltung.',
      plan: [V(4, '08:30', '10:00', 'Hörsaal 1')] },
    { slug: 'investition-finanzierung', name: 'Investition & Finanzierung', kuerzel: 'IUF', dozent: 'Prof. Scholz',
      farbe: 'tanne', ects: 6, semester: 3, studiengang: 'bwl', pruefung: 'Klausur, 120 Minuten', teilnehmer: 197,
      beschreibung: 'Investitionsrechnung, Kapitalwertmethode, Finanzierungsformen und Kapitalstruktur.',
      plan: [V(5, '12:00', '13:30', 'Hörsaal 2')] },
    { slug: 'wirtschaftsinformatik', name: 'Wirtschaftsinformatik', kuerzel: 'WINF', dozent: 'Prof. Lindner',
      farbe: 'pflaume', ects: 5, semester: 3, studiengang: 'bwl', pruefung: 'Projektarbeit', teilnehmer: 142,
      beschreibung: 'Geschäftsprozesse, Datenmodellierung und betriebliche Informationssysteme.',
      plan: [S(1, '16:00', '17:30', 'Rechenzentrum 1.05')] },
    { slug: 'wirtschaftsenglisch', name: 'Wirtschaftsenglisch', kuerzel: 'ENG', dozent: 'Ms. Hartley',
      farbe: 'oliv', ects: 3, semester: 3, studiengang: 'bwl', pruefung: 'Mündliche Prüfung', teilnehmer: 64,
      beschreibung: 'Business English: Verhandlung, Korrespondenz und Präsentation.',
      plan: [S(3, '09:00', '10:30', 'Seminarraum 3.01', 'Kurs')] },
    { slug: 'personalmanagement', name: 'Personalmanagement', kuerzel: 'PM', dozent: 'Prof. Reimann',
      farbe: 'terrakotta', ects: 5, semester: 4, studiengang: 'bwl', pruefung: 'Klausur, 60 Minuten', teilnehmer: 121,
      beschreibung: 'Personalauswahl, Führung und Arbeitsrecht in der betrieblichen Praxis.',
      plan: [V(3, '14:00', '15:30', 'Hörsaal 4')] },
    { slug: 'makrooekonomik', name: 'Makroökonomik', kuerzel: 'MAK', dozent: 'Prof. Ahrens',
      farbe: 'tinte', ects: 6, semester: 4, studiengang: 'bwl', pruefung: 'Klausur, 90 Minuten', teilnehmer: 188,
      beschreibung: 'Volkswirtschaftliche Gesamtrechnung, Konjunktur, Geld- und Fiskalpolitik.',
      plan: [V(1, '10:15', '11:45', 'Hörsaal 1')] },
    { slug: 'controlling', name: 'Controlling', kuerzel: 'CTR', dozent: 'Dr. Weiss',
      farbe: 'oliv', ects: 5, semester: 4, studiengang: 'bwl', pruefung: 'Klausur, 90 Minuten', teilnehmer: 96,
      beschreibung: 'Kennzahlensysteme, Planung, Abweichungsanalyse und Berichtswesen.',
      plan: [V(5, '08:30', '10:00', 'Seminarraum 1.04')] },
    { slug: 'unternehmensfuehrung', name: 'Unternehmensführung', kuerzel: 'UF', dozent: 'Prof. Scholz',
      farbe: 'rost', ects: 5, semester: 4, studiengang: 'bwl', pruefung: 'Fallstudie', teilnehmer: 88,
      beschreibung: 'Strategische Planung, Organisation und Entscheidungsprozesse.',
      plan: [V(2, '16:00', '17:30', 'Hörsaal 2')] },

    /* ---------------- Lehramt, fachübergreifend ---------------- */
    { slug: 'bildungswissenschaften', name: 'Einführung in die Bildungswissenschaften', kuerzel: 'BIWI', dozent: 'Prof. Hoffmann',
      farbe: 'tanne', ects: 5, semester: 1, studiengang: 'lehramt', pruefung: 'Klausur, 90 Minuten', teilnehmer: 276,
      beschreibung: 'Schule als Institution, Bildungssystem, Lehrerberuf und die Grundbegriffe der Erziehungswissenschaft.',
      plan: [V(1, '10:15', '11:45', 'Hörsaal 5')] },
    { slug: 'allgemeine-paedagogik', name: 'Allgemeine Pädagogik', kuerzel: 'APÄD', dozent: 'Dr. Sommer',
      farbe: 'oliv', ects: 5, semester: 1, studiengang: 'lehramt', pruefung: 'Hausarbeit', teilnehmer: 254,
      beschreibung: 'Erziehungsbegriffe, pädagogische Anthropologie und die Klassiker der Pädagogik.',
      plan: [S(3, '08:30', '10:00', 'Seminarraum 4.02')] },
    { slug: 'paedagogische-psychologie', name: 'Pädagogische Psychologie', kuerzel: 'PPSY', dozent: 'Prof. Neubert',
      farbe: 'pflaume', ects: 5, semester: 2, studiengang: 'lehramt', pruefung: 'Klausur, 90 Minuten', teilnehmer: 241,
      beschreibung: 'Lernen, Motivation und Leistungsbewertung aus psychologischer Sicht.',
      plan: [V(2, '12:00', '13:30', 'Hörsaal 5')] },
    { slug: 'schulpaedagogik', name: 'Schulpädagogik', kuerzel: 'SCHP', dozent: 'Dr. Sommer',
      farbe: 'terrakotta', ects: 5, semester: 3, studiengang: 'lehramt', pruefung: 'Portfolio', teilnehmer: 198,
      beschreibung: 'Unterrichtsplanung, Klassenführung und Umgang mit heterogenen Lerngruppen.',
      plan: [S(2, '10:15', '11:45', 'Seminarraum 4.02')] },
    { slug: 'entwicklungspsychologie', name: 'Entwicklungspsychologie', kuerzel: 'ENTW', dozent: 'Prof. Neubert',
      farbe: 'pflaume', ects: 5, semester: 3, studiengang: 'lehramt', pruefung: 'Klausur, 90 Minuten', teilnehmer: 213,
      beschreibung: 'Kognitive, soziale und emotionale Entwicklung von Kindern und Jugendlichen.',
      plan: [V(3, '12:00', '13:30', 'Hörsaal 5')] },
    { slug: 'schulpraktische-studien', name: 'Schulpraktische Studien', kuerzel: 'SPS', dozent: 'Frau Bauer',
      farbe: 'tanne', ects: 10, semester: 3, studiengang: 'lehramt', pruefung: 'Praktikumsbericht', teilnehmer: 96,
      beschreibung: 'Hospitation und eigene Unterrichtsversuche an einer Praktikumsschule, begleitet durch ein Seminar.',
      plan: [S(4, '08:00', '11:15', 'Praktikumsschule', 'Praktikumstag')] },
    { slug: 'inklusion-heterogenitaet', name: 'Inklusion und Heterogenität', kuerzel: 'INKL', dozent: 'Dr. Lehmann',
      farbe: 'senf', ects: 5, semester: 4, studiengang: 'lehramt', pruefung: 'Hausarbeit', teilnehmer: 142,
      beschreibung: 'Umgang mit Vielfalt im Klassenzimmer, sonderpädagogische Grundlagen und Nachteilsausgleich.',
      plan: [S(5, '10:15', '11:45', 'Seminarraum 4.05')] },

    /* ---------------- Lehramt, Fach Deutsch ---------------- */
    { slug: 'deutsch-sprachwissenschaft', name: 'Sprachwissenschaft', kuerzel: 'SPRW', dozent: 'Prof. Winkler',
      farbe: 'tinte', ects: 5, semester: 1, studiengang: 'lehramt', fach: 'deutsch', pruefung: 'Klausur, 90 Minuten', teilnehmer: 118,
      beschreibung: 'Phonologie, Morphologie und Syntax des Deutschen.',
      plan: [S(2, '14:00', '15:30', 'Seminarraum 5.01')] },
    { slug: 'deutsch-literaturwissenschaft', name: 'Literaturwissenschaft', kuerzel: 'LITW', dozent: 'Prof. Winkler',
      farbe: 'rost', ects: 5, semester: 3, studiengang: 'lehramt', fach: 'deutsch', pruefung: 'Hausarbeit', teilnehmer: 104,
      beschreibung: 'Gattungen, Epochen und die Analyse literarischer Texte für den Unterricht.',
      plan: [S(1, '14:00', '15:30', 'Seminarraum 5.03')] },
    { slug: 'deutsch-fachdidaktik', name: 'Fachdidaktik Deutsch', kuerzel: 'FD-D', dozent: 'Dr. Petersen',
      farbe: 'koralle', ects: 5, semester: 3, studiengang: 'lehramt', fach: 'deutsch', pruefung: 'Unterrichtsentwurf', teilnehmer: 87,
      beschreibung: 'Lese- und Schreibdidaktik, Umgang mit Texten und Planung von Deutschstunden.',
      plan: [S(4, '12:00', '13:30', 'Seminarraum 5.02')] },

    /* ---------------- Lehramt, Fach Mathematik ---------------- */
    { slug: 'mathematik-analysis', name: 'Analysis I', kuerzel: 'ANA I', dozent: 'Prof. Kramer',
      farbe: 'tinte', ects: 9, semester: 1, studiengang: 'lehramt', fach: 'mathematik', pruefung: 'Klausur, 120 Minuten', teilnehmer: 156,
      beschreibung: 'Folgen, Grenzwerte, Stetigkeit und Differentialrechnung in einer Variablen.',
      plan: [V(1, '08:00', '09:30', 'Hörsaal 6'), S(3, '16:00', '17:30', 'Seminarraum 6.02', 'Übung')] },
    { slug: 'mathematik-lineare-algebra', name: 'Lineare Algebra', kuerzel: 'LINA', dozent: 'Prof. Kramer',
      farbe: 'tanne', ects: 9, semester: 2, studiengang: 'lehramt', fach: 'mathematik', pruefung: 'Klausur, 120 Minuten', teilnehmer: 148,
      beschreibung: 'Vektorräume, lineare Abbildungen, Matrizen und Eigenwerte.',
      plan: [V(3, '10:15', '11:45', 'Hörsaal 6')] },
    { slug: 'mathematik-analysis-2', name: 'Analysis II', kuerzel: 'ANA II', dozent: 'Prof. Kramer',
      farbe: 'tinte', ects: 9, semester: 3, studiengang: 'lehramt', fach: 'mathematik', pruefung: 'Klausur, 120 Minuten', teilnehmer: 131,
      beschreibung: 'Integralrechnung, Funktionenfolgen und mehrdimensionale Analysis.',
      plan: [V(1, '08:00', '09:30', 'Hörsaal 6'), S(3, '16:00', '17:30', 'Seminarraum 6.02', 'Übung')] },
    { slug: 'mathematik-fachdidaktik', name: 'Mathematikdidaktik', kuerzel: 'FD-M', dozent: 'Dr. Voss',
      farbe: 'koralle', ects: 5, semester: 3, studiengang: 'lehramt', fach: 'mathematik', pruefung: 'Unterrichtsentwurf', teilnehmer: 79,
      beschreibung: 'Wie mathematische Begriffe im Unterricht entstehen, typische Fehlvorstellungen und Aufgabenformate.',
      plan: [S(4, '12:00', '13:30', 'Seminarraum 6.04')] },

    /* ---------------- Informatik ---------------- */
    { slug: 'programmierung', name: 'Programmierung', kuerzel: 'PROG', dozent: 'Prof. Roth',
      farbe: 'tanne', ects: 8, semester: 1, studiengang: 'informatik', pruefung: 'Klausur und Programmierprojekt', teilnehmer: 284,
      beschreibung: 'Von der ersten Schleife bis zu Objekten: Grundlagen der Programmierung mit vielen Übungsaufgaben.',
      plan: [V(1, '09:00', '10:30', 'Hörsaal 7'), S(4, '15:00', '16:30', 'Rechnerpool 2', 'Übung')] },
    { slug: 'mathematik-informatik', name: 'Mathematik für Informatiker', kuerzel: 'MAFI', dozent: 'Dr. Sander',
      farbe: 'tinte', ects: 8, semester: 1, studiengang: 'informatik', pruefung: 'Klausur, 120 Minuten', teilnehmer: 271,
      beschreibung: 'Diskrete Strukturen, Logik, Mengen, Relationen und lineare Algebra.',
      plan: [V(2, '08:30', '10:00', 'Hörsaal 7')] },
    { slug: 'algorithmen-datenstrukturen', name: 'Algorithmen und Datenstrukturen', kuerzel: 'ALGO', dozent: 'Prof. Roth',
      farbe: 'koralle', ects: 8, semester: 2, studiengang: 'informatik', pruefung: 'Klausur, 120 Minuten', teilnehmer: 238,
      beschreibung: 'Sortier- und Suchverfahren, Bäume, Graphen und die Analyse von Laufzeiten.',
      plan: [V(3, '10:15', '11:45', 'Hörsaal 7')] },
    { slug: 'datenbanken', name: 'Datenbanken', kuerzel: 'DB', dozent: 'Prof. Keller',
      farbe: 'senf', ects: 6, semester: 3, studiengang: 'informatik', pruefung: 'Klausur, 90 Minuten', teilnehmer: 192,
      beschreibung: 'Relationales Modell, SQL, Normalformen und Transaktionen.',
      plan: [V(2, '10:15', '11:45', 'Hörsaal 8')] },
    { slug: 'rechnernetze', name: 'Rechnernetze', kuerzel: 'NETZ', dozent: 'Dr. Fuchs',
      farbe: 'tinte', ects: 6, semester: 3, studiengang: 'informatik', pruefung: 'Klausur, 90 Minuten', teilnehmer: 184,
      beschreibung: 'Schichtenmodelle, Adressierung, Routing und die Protokolle des Internets.',
      plan: [V(3, '14:00', '15:30', 'Hörsaal 8')] },
    { slug: 'softwaretechnik', name: 'Softwaretechnik', kuerzel: 'SWT', dozent: 'Prof. Roth',
      farbe: 'tanne', ects: 6, semester: 3, studiengang: 'informatik', pruefung: 'Projektarbeit', teilnehmer: 176,
      beschreibung: 'Anforderungen, Entwurfsmuster, Testen und die Arbeit im Team.',
      plan: [S(4, '10:15', '11:45', 'Seminarraum 7.02')] },
    { slug: 'theoretische-informatik', name: 'Theoretische Informatik', kuerzel: 'THEO', dozent: 'Dr. Sander',
      farbe: 'pflaume', ects: 6, semester: 3, studiengang: 'informatik', pruefung: 'Klausur, 120 Minuten', teilnehmer: 168,
      beschreibung: 'Automaten, formale Sprachen, Berechenbarkeit und Komplexität.',
      plan: [V(5, '08:30', '10:00', 'Hörsaal 7')] },

    /* ---------------- Psychologie ---------------- */
    { slug: 'psych-allgemeine', name: 'Allgemeine Psychologie I', kuerzel: 'APSY', dozent: 'Prof. Vogel',
      farbe: 'pflaume', ects: 6, semester: 1, studiengang: 'psychologie', pruefung: 'Klausur, 90 Minuten', teilnehmer: 164,
      beschreibung: 'Wahrnehmung, Aufmerksamkeit, Lernen und Gedächtnis.',
      plan: [V(1, '10:15', '11:45', 'Hörsaal 9')] },
    { slug: 'psych-forschungsmethoden', name: 'Einführung in die Forschungsmethoden', kuerzel: 'FOME', dozent: 'Dr. Brandt',
      farbe: 'tinte', ects: 6, semester: 1, studiengang: 'psychologie', pruefung: 'Klausur, 90 Minuten', teilnehmer: 158,
      beschreibung: 'Versuchsplanung, Gütekriterien und wissenschaftliches Arbeiten.',
      plan: [V(3, '08:30', '10:00', 'Hörsaal 9')] },
    { slug: 'psych-statistik-1', name: 'Statistik I', kuerzel: 'STA I', dozent: 'Dr. Brandt',
      farbe: 'koralle', ects: 6, semester: 2, studiengang: 'psychologie', pruefung: 'Klausur, 90 Minuten', teilnehmer: 151,
      beschreibung: 'Deskriptive Statistik und Wahrscheinlichkeitsrechnung für psychologische Daten.',
      plan: [V(2, '10:15', '11:45', 'Hörsaal 9')] },
    { slug: 'psych-statistik-2', name: 'Statistik II', kuerzel: 'STA II', dozent: 'Dr. Brandt',
      farbe: 'koralle', ects: 6, semester: 3, studiengang: 'psychologie', pruefung: 'Klausur, 90 Minuten', teilnehmer: 147,
      beschreibung: 'Varianzanalyse, Regression und Testverfahren, gerechnet an echten Datensätzen.',
      plan: [V(2, '10:15', '11:45', 'Hörsaal 9'), S(4, '14:00', '15:30', 'Rechnerpool 3', 'Übung')] },
    { slug: 'psych-entwicklung', name: 'Entwicklungspsychologie', kuerzel: 'EPSY', dozent: 'Prof. Neubert',
      farbe: 'tanne', ects: 5, semester: 3, studiengang: 'psychologie', pruefung: 'Klausur, 90 Minuten', teilnehmer: 139,
      beschreibung: 'Entwicklung über die Lebensspanne, von der frühen Kindheit bis ins hohe Alter.',
      plan: [V(4, '12:00', '13:30', 'Hörsaal 9')] },
    { slug: 'psych-sozial', name: 'Sozialpsychologie', kuerzel: 'SOZ', dozent: 'Prof. Vogel',
      farbe: 'senf', ects: 5, semester: 3, studiengang: 'psychologie', pruefung: 'Hausarbeit', teilnehmer: 134,
      beschreibung: 'Einstellungen, Gruppenprozesse und soziale Wahrnehmung.',
      plan: [S(3, '14:00', '15:30', 'Seminarraum 9.01')] },
    { slug: 'psych-diagnostik', name: 'Diagnostik', kuerzel: 'DIAG', dozent: 'Dr. Ritter',
      farbe: 'rost', ects: 6, semester: 3, studiengang: 'psychologie', pruefung: 'Klausur, 90 Minuten', teilnehmer: 128,
      beschreibung: 'Testtheorie, Gütekriterien und der Einsatz psychologischer Verfahren.',
      plan: [V(5, '10:15', '11:45', 'Hörsaal 9')] },

    /* ---------------- Maschinenbau ---------------- */
    { slug: 'mb-technische-mechanik-1', name: 'Technische Mechanik I', kuerzel: 'TM I', dozent: 'Prof. Krüger',
      farbe: 'tinte', ects: 8, semester: 1, studiengang: 'maschinenbau', pruefung: 'Klausur, 120 Minuten', teilnehmer: 208,
      beschreibung: 'Statik: Kräfte, Momente, Lagerreaktionen und Fachwerke.',
      plan: [V(1, '08:00', '09:30', 'Hörsaal 10'), S(3, '16:00', '17:30', 'Seminarraum 10.02', 'Übung')] },
    { slug: 'mb-mathematik', name: 'Mathematik für Ingenieure', kuerzel: 'MAIN', dozent: 'Dr. Sander',
      farbe: 'oliv', ects: 8, semester: 1, studiengang: 'maschinenbau', pruefung: 'Klausur, 120 Minuten', teilnehmer: 201,
      beschreibung: 'Analysis, lineare Algebra und Differentialgleichungen mit technischen Anwendungen.',
      plan: [V(2, '08:30', '10:00', 'Hörsaal 10')] },
    { slug: 'mb-thermodynamik', name: 'Thermodynamik', kuerzel: 'THD', dozent: 'Prof. Krüger',
      farbe: 'rost', ects: 6, semester: 3, studiengang: 'maschinenbau', pruefung: 'Klausur, 120 Minuten', teilnehmer: 164,
      beschreibung: 'Hauptsätze, Zustandsänderungen, Kreisprozesse und Wärmeübertragung.',
      plan: [V(1, '10:15', '11:45', 'Hörsaal 10')] },
    { slug: 'mb-werkstofftechnik', name: 'Werkstofftechnik', kuerzel: 'WERK', dozent: 'Dr. Hansen',
      farbe: 'terrakotta', ects: 6, semester: 3, studiengang: 'maschinenbau', pruefung: 'Klausur, 90 Minuten', teilnehmer: 158,
      beschreibung: 'Aufbau und Eigenschaften metallischer Werkstoffe, Wärmebehandlung und Prüfverfahren.',
      plan: [V(2, '14:00', '15:30', 'Hörsaal 11')] },
    { slug: 'mb-konstruktion', name: 'Konstruktionslehre', kuerzel: 'KONS', dozent: 'Prof. Ebert',
      farbe: 'tanne', ects: 7, semester: 3, studiengang: 'maschinenbau', pruefung: 'Konstruktionsentwurf', teilnehmer: 152,
      beschreibung: 'Technisches Zeichnen, Toleranzen und der Entwurf einfacher Baugruppen.',
      plan: [S(4, '09:00', '11:15', 'Zeichensaal', 'Entwurfsübung')] },
    { slug: 'mb-maschinenelemente', name: 'Maschinenelemente', kuerzel: 'MASE', dozent: 'Prof. Ebert',
      farbe: 'senf', ects: 6, semester: 3, studiengang: 'maschinenbau', pruefung: 'Klausur, 120 Minuten', teilnehmer: 147,
      beschreibung: 'Verbindungen, Lager, Wellen und Getriebe: auslegen und nachrechnen.',
      plan: [V(5, '12:00', '13:30', 'Hörsaal 10')] }
  ];
  /* --- ENDE module --- */

  /* ------------------------------------------------- Verkaeufer */

  var verkaeufer = [
    { id: 'v-lena',  name: 'Lena K.',  kuerzel: 'LK', verifiziert: true,  hochschule: 'uni-leipzig', studiengang: 'bwl',          semester: 5, bewertung: 4.9, anzahlBewertungen: 87, verkaeufe: 214, seit: 'März 2025',    ueber: 'Schreibe seit dem dritten Semester Zusammenfassungen für die Wirtschaftsmodule. Alles selbst getippt, nach jeder Klausur aktualisiert.' },
    { id: 'v-jonas', name: 'Jonas B.', kuerzel: 'JB', verifiziert: true,  hochschule: 'uni-leipzig', studiengang: 'winfo',        semester: 7, bewertung: 4.7, anzahlBewertungen: 41, verkaeufe: 93,  seit: 'Oktober 2024', ueber: 'Tabellen, Vorlagen und kleine Werkzeuge für alles, was mit Zahlen zu tun hat.' },
    { id: 'v-sarah', name: 'Sarah M.', kuerzel: 'SM', verifiziert: true,  hochschule: 'uni-leipzig', studiengang: 'bwl',          semester: 4, bewertung: 4.8, anzahlBewertungen: 63, verkaeufe: 148, seit: 'Januar 2025',  ueber: 'Karteikarten und Lernzettel, gerne auch auf Zuruf für ein bestimmtes Modul.' },
    { id: 'v-tim',   name: 'Tim R.',   kuerzel: 'TR', verifiziert: false, hochschule: 'uni-leipzig', studiengang: 'jura',         semester: 6, bewertung: 4.4, anzahlBewertungen: 12, verkaeufe: 19,  seit: 'Juni 2026',    ueber: 'Juristische Grundlagen für Wirtschaftsstudenten.' },
    { id: 'v-anna',  name: 'Anna W.',  kuerzel: 'AW', verifiziert: true,  hochschule: 'uni-leipzig', studiengang: 'psychologie',  semester: 8, bewertung: 5.0, anzahlBewertungen: 29, verkaeufe: 52,  seit: 'April 2025',   ueber: 'Statistik-Nachhilfe und Korrekturlesen. Ich erkläre lieber zweimal als einmal zu schnell.' },
    { id: 'v-mara',  name: 'Mara S.',  kuerzel: 'MS', verifiziert: true,  hochschule: 'uni-leipzig', studiengang: 'lehramt',      semester: 6, bewertung: 4.9, anzahlBewertungen: 34, verkaeufe: 71,  seit: 'November 2024', ueber: 'Lehramt Deutsch und Geschichte. Ich teile meine Mitschriften und Unterrichtsentwürfe aus den ersten Praktika.' },
    { id: 'v-david', name: 'David P.', kuerzel: 'DP', verifiziert: true,  hochschule: 'uni-leipzig', studiengang: 'informatik',   semester: 5, bewertung: 4.8, anzahlBewertungen: 26, verkaeufe: 58,  seit: 'Februar 2025', ueber: 'Karteikarten und Spickzettel für die Grundlagenmodule. Kurz halten ist die halbe Arbeit.' },
    { id: 'v-nils',  name: 'Nils T.',  kuerzel: 'NT', verifiziert: true,  hochschule: 'uni-leipzig', studiengang: 'maschinenbau', semester: 6, bewertung: 4.6, anzahlBewertungen: 18, verkaeufe: 37,  seit: 'Mai 2025',     ueber: 'Gerechnete Aufgaben aus Mechanik und Thermodynamik, mit vollständigem Rechenweg.' }
  ];

  /* ------------------------------------------------- Materialien

     typ: lernzettel | zusammenfassung | formelsammlung | karteikarten |
          uebungsaufgaben | hausarbeit | vorlage | tool
     Digitale Materialien sind bewusst NICHT auf eine Hochschule
     begrenzt — ein Lernzettel zur Analysis hilft auch anderswo. Der
     Modulbezug ist der eigentliche Filter. */

  /* --- SLUGS materialien --- */
  var materialien = [
    { slug: 'formelsammlung-statistik-2', titel: 'Formelsammlung Statistik II', typ: 'formelsammlung',
      modul: 'statistik-2', verkaeufer: 'v-lena', preis: 2.99, bewertung: 4.9, anzahlBewertungen: 63,
      dateityp: 'PDF', umfang: '18 Seiten', aktualisiert: iso(plus(heute(), -12)), semester: 3, verkaeufe: 210, vorschau: true,
      beschreibung: 'Alle Formeln der Vorlesung auf 18 Seiten, sortiert nach Kapitel. Enthält Schätzer, Testverfahren, Verteilungstabellen und die Rechenwege, die in der Klausur wirklich verlangt werden.',
      vorschauText: 'Kapitel 3 · Hypothesentests\n\nEin Test prüft eine Annahme über die Grundgesamtheit anhand einer Stichprobe. Die Nullhypothese H0 wird beibehalten, solange die Daten nicht deutlich dagegen sprechen.\n\nEinstichproben-t-Test: t = (x̄ − μ0) / (s / √n)\nFreiheitsgrade: df = n − 1',
      rezensionen: [
        { von: 'Paul H.', sterne: 5, datum: iso(plus(heute(), -9)),  text: 'Hat mir die halbe Klausurvorbereitung abgenommen. Die Verteilungstabellen hinten sind Gold wert.' },
        { von: 'Miriam T.', sterne: 5, datum: iso(plus(heute(), -21)), text: 'Sauber sortiert, nichts Überflüssiges. Genau das, was in der Vorlesung drankam.' },
        { von: 'Kevin S.', sterne: 4, datum: iso(plus(heute(), -34)), text: 'Sehr gut, hätte mir bei der Regression noch ein Beispiel gewünscht.' }
      ] },
    { slug: 'klausurzusammenfassung-statistik-2', titel: 'Klausurzusammenfassung Statistik II', typ: 'zusammenfassung',
      modul: 'statistik-2', verkaeufer: 'v-lena', preis: 5.99, bewertung: 4.8, anzahlBewertungen: 41,
      dateityp: 'PDF', umfang: '42 Seiten', aktualisiert: iso(plus(heute(), -5)), semester: 3, verkaeufe: 134, vorschau: true,
      beschreibung: 'Die komplette Vorlesung in einem Dokument: Definitionen, Rechenwege, typische Klausuraufgaben mit Lösung. Nach der letzten Klausur überarbeitet.',
      vorschauText: 'Inhalt\n\n1. Punktschätzung und Eigenschaften von Schätzern\n2. Konfidenzintervalle\n3. Hypothesentests\n4. Chi-Quadrat-Verfahren\n5. Einfache lineare Regression\n\nKapitel 1 · Punktschätzung\nEin Schätzer heißt erwartungstreu, wenn sein Erwartungswert dem wahren Parameter entspricht.',
      rezensionen: [
        { von: 'Nele F.', sterne: 5, datum: iso(plus(heute(), -3)),  text: 'Besser als mein eigenes Mitgeschriebenes. Die Beispielaufgaben am Ende jedes Kapitels helfen sehr.' },
        { von: 'Ali D.', sterne: 5, datum: iso(plus(heute(), -16)), text: 'Klar geschrieben, keine unnötigen Umwege.' }
      ] },
    { slug: 'marketing-lernzettel', titel: 'Marketing Lernzettel', typ: 'lernzettel',
      modul: 'marketing', verkaeufer: 'v-sarah', preis: 4.49, bewertung: 4.7, anzahlBewertungen: 38,
      dateityp: 'PDF', umfang: '31 Seiten', aktualisiert: iso(plus(heute(), -19)), semester: 3, verkaeufe: 97, vorschau: true,
      beschreibung: 'Kompakte Zusammenfassung aller Vorlesungsteile, mit Merksätzen und einer Übersicht der Modelle, die regelmäßig abgefragt werden.',
      vorschauText: 'Positionierung\n\nEine Marke besetzt im Kopf der Kundschaft genau eine Aussage. Wer zwei besetzen will, besetzt keine.\n\nDrei Fragen vor jeder Positionierung:\n1. Für wen?\n2. Statt wem?\n3. Warum glaubwürdig?',
      rezensionen: [
        { von: 'Jana L.', sterne: 5, datum: iso(plus(heute(), -11)), text: 'Genau richtig für die Woche vor der Abgabe.' },
        { von: 'Tom K.', sterne: 4, datum: iso(plus(heute(), -28)), text: 'Gut, an ein paar Stellen etwas knapp.' }
      ] },
    { slug: 'karteikarten-statistik-2', titel: 'Karteikarten Statistik II · 180 Karten', typ: 'karteikarten',
      modul: 'statistik-2', verkaeufer: 'v-sarah', preis: 3.49, bewertung: 4.6, anzahlBewertungen: 24,
      dateityp: 'PDF und CSV', umfang: '180 Karten', aktualisiert: iso(plus(heute(), -26)), semester: 3, verkaeufe: 61, vorschau: true,
      beschreibung: 'Begriffe und Formeln als Frage-Antwort-Karten. Die CSV-Datei lässt sich in gängige Lern-Apps einlesen.',
      vorschauText: 'Vorderseite: Wann ist ein Schätzer konsistent?\nRückseite: Wenn er mit wachsendem Stichprobenumfang gegen den wahren Parameter konvergiert.',
      rezensionen: [{ von: 'Sophie R.', sterne: 5, datum: iso(plus(heute(), -14)), text: 'Für unterwegs perfekt.' }] },
    { slug: 'uebungsaufgaben-iuf', titel: 'Übungsaufgaben Investition mit Lösungsweg', typ: 'uebungsaufgaben',
      modul: 'investition-finanzierung', verkaeufer: 'v-jonas', preis: 4.99, bewertung: 4.8, anzahlBewertungen: 19,
      dateityp: 'PDF', umfang: '26 Seiten', aktualisiert: iso(plus(heute(), -8)), semester: 3, verkaeufe: 44, vorschau: true,
      beschreibung: '40 gerechnete Aufgaben zur Kapitalwertmethode, internen Zinsfuß und Annuität. Jede Aufgabe mit vollständigem Rechenweg.',
      vorschauText: 'Aufgabe 7\n\nEine Maschine kostet 80.000 EUR und liefert vier Jahre lang 25.000 EUR Rückfluss. Kalkulationszins 6 Prozent.\n\nKapitalwert = −80.000 + 25.000 · Rentenbarwertfaktor(6 %, 4 Jahre)',
      rezensionen: [{ von: 'Marek P.', sterne: 5, datum: iso(plus(heute(), -6)), text: 'Der Rechenweg ist wirklich vollständig, nicht nur das Ergebnis.' }] },
    { slug: 'excel-vorlage-investition', titel: 'Excel-Vorlage Investitionsrechnung', typ: 'vorlage',
      modul: 'investition-finanzierung', verkaeufer: 'v-jonas', preis: 6.99, bewertung: 4.7, anzahlBewertungen: 15,
      dateityp: 'XLSX', umfang: '6 Tabellenblätter', aktualisiert: iso(plus(heute(), -40)), semester: null, verkaeufe: 38, vorschau: false,
      beschreibung: 'Fertige Tabelle für Kapitalwert, Annuität und Amortisation. Zahlen eintragen, Ergebnis steht. Formeln sind sichtbar und nicht gesperrt.',
      rezensionen: [{ von: 'Lea B.', sterne: 5, datum: iso(plus(heute(), -22)), text: 'Spart in der Übung jede Menge Zeit.' }] },
    { slug: 'zusammenfassung-wirtschaftsrecht', titel: 'Zusammenfassung Wirtschaftsrecht', typ: 'zusammenfassung',
      modul: 'wirtschaftsrecht', verkaeufer: 'v-tim', preis: 4.99, bewertung: 4.4, anzahlBewertungen: 11,
      dateityp: 'PDF', umfang: '35 Seiten', aktualisiert: iso(plus(heute(), -55)), semester: 3, verkaeufe: 27, vorschau: true,
      beschreibung: 'Vertragsrecht, Handelsrecht und Gesellschaftsformen in einer Übersicht. Mit den Paragraphen, die in der Klausur zitiert werden müssen.',
      vorschauText: 'Kaufvertrag, § 433 BGB\n\nDer Verkäufer schuldet Übergabe und Eigentumsverschaffung, der Käufer Zahlung und Abnahme. Zwei Willenserklärungen, ein Vertrag.',
      rezensionen: [{ von: 'Ben O.', sterne: 4, datum: iso(plus(heute(), -30)), text: 'Solide. Beim Gesellschaftsrecht wird es etwas schnell.' }] },
    { slug: 'hausarbeit-markenpositionierung', titel: 'Hausarbeit: Markenpositionierung im Mittelstand', typ: 'hausarbeit',
      modul: 'marketing', verkaeufer: 'v-lena', preis: 8.99, bewertung: 4.5, anzahlBewertungen: 8,
      dateityp: 'PDF', umfang: '22 Seiten', aktualisiert: iso(plus(heute(), -70)), semester: 2, verkaeufe: 16, vorschau: true, geprueft: true,
      beschreibung: 'Mit 1,3 bewertete Hausarbeit aus dem Vorjahr. Gedacht als Beispiel für Aufbau, Zitierweise und Argumentation.',
      vorschauText: 'Gliederung\n\n1. Einleitung\n2. Begriff der Positionierung\n3. Besonderheiten mittelständischer Marken\n4. Fallbeispiel\n5. Fazit\n\n1. Einleitung\nDie vorliegende Arbeit untersucht, wie mittelständische Unternehmen ihre Marke gegenüber größeren Wettbewerbern abgrenzen.',
      rezensionen: [{ von: 'Clara N.', sterne: 5, datum: iso(plus(heute(), -44)), text: 'Als Orientierung für den Aufbau sehr hilfreich.' }] },
    { slug: 'praesentationsvorlage', titel: 'Präsentationsvorlage für Seminararbeiten', typ: 'vorlage',
      modul: null, verkaeufer: 'v-jonas', preis: 3.99, bewertung: 4.6, anzahlBewertungen: 22,
      dateityp: 'PPTX und ODP', umfang: '14 Folien', aktualisiert: iso(plus(heute(), -33)), semester: null, verkaeufe: 71, vorschau: true,
      beschreibung: 'Schlichte Vorlage ohne Effekte: Titel, Gliederung, Inhalt, Diagramm, Quellen. Funktioniert in PowerPoint, Keynote und LibreOffice.',
      vorschauText: 'Folie 3 · Aufbau\n\nEine Aussage pro Folie. Die Überschrift ist die Aussage, nicht das Thema.',
      rezensionen: [{ von: 'Ida W.', sterne: 5, datum: iso(plus(heute(), -17)), text: 'Endlich mal ohne bunte Farbverläufe.' }] },
    { slug: 'lernplan-vorlage', titel: 'Lernplan-Vorlage für die Klausurphase', typ: 'tool',
      modul: null, verkaeufer: 'v-sarah', preis: 2.49, bewertung: 4.5, anzahlBewertungen: 17,
      dateityp: 'XLSX', umfang: '3 Tabellenblätter', aktualisiert: iso(plus(heute(), -48)), semester: null, verkaeufe: 55, vorschau: false,
      beschreibung: 'Trägt die Klausurtermine ein und verteilt die Themen rückwärts auf die verbleibenden Wochen.',
      rezensionen: [{ von: 'Robin E.', sterne: 4, datum: iso(plus(heute(), -25)), text: 'Simpel, aber genau deshalb benutze ich sie.' }] },

    /* --- Lehramt --- */
    { slug: 'zusammenfassung-bildungswissenschaften', titel: 'Zusammenfassung Bildungswissenschaften', typ: 'zusammenfassung',
      modul: 'bildungswissenschaften', verkaeufer: 'v-mara', preis: 4.99, bewertung: 4.8, anzahlBewertungen: 29,
      dateityp: 'PDF', umfang: '38 Seiten', aktualisiert: iso(plus(heute(), -15)), semester: 1, verkaeufe: 88, vorschau: true,
      beschreibung: 'Die Einführungsvorlesung in einem Dokument: Bildungssystem, Schultheorien, Professionalisierung. Mit den Begriffen, die in der Klausur definiert werden müssen.',
      vorschauText: 'Kapitel 2 · Funktionen von Schule nach Fend\n\nQualifikation, Selektion, Integration und Enkulturation. Die vier Funktionen stehen in Spannung zueinander — genau das ist die typische Klausurfrage.',
      rezensionen: [{ von: 'Frieda M.', sterne: 5, datum: iso(plus(heute(), -10)), text: 'Hat mir die Klausur gerettet. Die Übersicht der Theorien am Ende ist sehr gut.' }] },
    { slug: 'lernzettel-entwicklungspsychologie', titel: 'Lernzettel Entwicklungspsychologie', typ: 'lernzettel',
      modul: 'entwicklungspsychologie', verkaeufer: 'v-mara', preis: 3.99, bewertung: 4.7, anzahlBewertungen: 21,
      dateityp: 'PDF', umfang: '24 Seiten', aktualisiert: iso(plus(heute(), -7)), semester: 3, verkaeufe: 63, vorschau: true,
      beschreibung: 'Piaget, Erikson, Bindungstheorie und die Entwicklungsaufgaben im Jugendalter, jeweils mit einem Beispiel aus dem Schulalltag.',
      vorschauText: 'Piaget · Stadien der kognitiven Entwicklung\n\n1. sensomotorisch (0–2)\n2. präoperational (2–7)\n3. konkret-operational (7–11)\n4. formal-operational (ab 11)\n\nFür den Unterricht wichtig: Der Übergang zu 4 ist individuell sehr verschieden.',
      rezensionen: [{ von: 'Lars B.', sterne: 5, datum: iso(plus(heute(), -4)), text: 'Kompakt und trotzdem vollständig.' }] },
    { slug: 'unterrichtsentwurf-vorlage', titel: 'Vorlage für den Unterrichtsentwurf', typ: 'vorlage',
      modul: null, verkaeufer: 'v-mara', preis: 3.49, bewertung: 4.9, anzahlBewertungen: 18,
      dateityp: 'DOCX und ODT', umfang: '9 Seiten', aktualisiert: iso(plus(heute(), -20)), semester: null, verkaeufe: 74, vorschau: true,
      beschreibung: 'Gerüst mit Bedingungsanalyse, Sachanalyse, didaktischer Analyse, Verlaufsplan und Literatur. Die Verlaufstabelle ist schon formatiert.',
      vorschauText: 'Verlaufsplan\n\nPhase | Zeit | Lehrerhandlung | Schülerhandlung | Sozialform | Medien\nEinstieg | 5 min | … | … | Plenum | Tafel',
      rezensionen: [{ von: 'Nora K.', sterne: 5, datum: iso(plus(heute(), -12)), text: 'Genau die Struktur, die im Seminar verlangt wird.' }] },
    { slug: 'lernzettel-sprachwissenschaft', titel: 'Lernzettel Sprachwissenschaft', typ: 'lernzettel',
      modul: 'deutsch-sprachwissenschaft', verkaeufer: 'v-mara', preis: 3.99, bewertung: 4.6, anzahlBewertungen: 14,
      dateityp: 'PDF', umfang: '27 Seiten', aktualisiert: iso(plus(heute(), -31)), semester: 1, verkaeufe: 41, vorschau: true,
      beschreibung: 'Phonologie, Morphologie und Syntax mit Baumdiagrammen und den Analysebeispielen aus dem Seminar.',
      vorschauText: 'Morphologie\n\nMorphem = kleinste bedeutungstragende Einheit.\nfrei: Haus · gebunden: -lich, un-\nDerivation verändert die Wortart, Flexion nicht.',
      rezensionen: [{ von: 'Timo H.', sterne: 5, datum: iso(plus(heute(), -18)), text: 'Die Baumdiagramme sind endlich mal verständlich.' }] },
    { slug: 'uebungsaufgaben-analysis', titel: 'Übungsaufgaben Analysis mit Lösungen', typ: 'uebungsaufgaben',
      modul: 'mathematik-analysis-2', verkaeufer: 'v-david', preis: 5.49, bewertung: 4.7, anzahlBewertungen: 16,
      dateityp: 'PDF', umfang: '34 Seiten', aktualisiert: iso(plus(heute(), -9)), semester: 3, verkaeufe: 39, vorschau: true,
      beschreibung: 'Aufgaben zu Integralen, Reihen und mehrdimensionaler Differentialrechnung, jeweils mit vollständigem Lösungsweg.',
      vorschauText: 'Aufgabe 12\n\nUntersuche die Reihe auf Konvergenz: Summe über 1/(n·ln n) für n ≥ 2.\n\nAnsatz: Integralkriterium. Das Integral von 1/(x·ln x) ist ln(ln x) und divergiert.',
      rezensionen: [{ von: 'Pia S.', sterne: 5, datum: iso(plus(heute(), -5)), text: 'Deckt sich fast eins zu eins mit den Übungsblättern.' }] },

    /* --- Informatik --- */
    { slug: 'karteikarten-algorithmen', titel: 'Karteikarten Algorithmen · 140 Karten', typ: 'karteikarten',
      modul: 'algorithmen-datenstrukturen', verkaeufer: 'v-david', preis: 3.49, bewertung: 4.8, anzahlBewertungen: 23,
      dateityp: 'PDF und CSV', umfang: '140 Karten', aktualisiert: iso(plus(heute(), -13)), semester: 2, verkaeufe: 67, vorschau: true,
      beschreibung: 'Laufzeiten, Datenstrukturen und Verfahren als Frage-Antwort-Karten. Die CSV lässt sich in gängige Lern-Apps einlesen.',
      vorschauText: 'Vorderseite: Laufzeit von Quicksort im schlechtesten Fall?\nRückseite: O(n²), wenn das Pivot immer das Minimum oder Maximum ist. Im Mittel O(n log n).',
      rezensionen: [{ von: 'Ole R.', sterne: 5, datum: iso(plus(heute(), -8)), text: 'Perfekt für die Straßenbahn.' }] },
    { slug: 'zusammenfassung-datenbanken', titel: 'Zusammenfassung Datenbanken', typ: 'zusammenfassung',
      modul: 'datenbanken', verkaeufer: 'v-david', preis: 4.99, bewertung: 4.7, anzahlBewertungen: 19,
      dateityp: 'PDF', umfang: '33 Seiten', aktualisiert: iso(plus(heute(), -6)), semester: 3, verkaeufe: 52, vorschau: true,
      beschreibung: 'Relationales Modell, SQL, Normalformen und Transaktionen. Mit den Beispielabfragen aus der Übung.',
      vorschauText: 'Dritte Normalform\n\nEine Relation ist in 3NF, wenn sie in 2NF ist und kein Nichtschlüsselattribut transitiv vom Schlüssel abhängt.\n\nMerksatz: „Der Schlüssel, der ganze Schlüssel und nichts als der Schlüssel."',
      rezensionen: [{ von: 'Hanna V.', sterne: 5, datum: iso(plus(heute(), -3)), text: 'Die Normalformen sind hier zum ersten Mal wirklich klar geworden.' }] },

    /* --- Psychologie --- */
    { slug: 'formelsammlung-statistik-psych', titel: 'Formelsammlung Statistik II · Psychologie', typ: 'formelsammlung',
      modul: 'psych-statistik-2', verkaeufer: 'v-anna', preis: 2.99, bewertung: 4.9, anzahlBewertungen: 27,
      dateityp: 'PDF', umfang: '16 Seiten', aktualisiert: iso(plus(heute(), -11)), semester: 3, verkaeufe: 81, vorschau: true,
      beschreibung: 'Varianzanalyse, Regression und Effektstärken auf 16 Seiten, abgestimmt auf die Vorlesung und die erlaubte Formelsammlung in der Klausur.',
      vorschauText: 'Einfaktorielle ANOVA\n\nQuadratsummen: SS_total = SS_zwischen + SS_innerhalb\nF = MS_zwischen / MS_innerhalb\nEffektstärke: η² = SS_zwischen / SS_total',
      rezensionen: [{ von: 'Malte D.', sterne: 5, datum: iso(plus(heute(), -7)), text: 'Genau die Formeln, die erlaubt sind, keine überflüssigen.' }] },
    { slug: 'zusammenfassung-sozialpsychologie', titel: 'Zusammenfassung Sozialpsychologie', typ: 'zusammenfassung',
      modul: 'psych-sozial', verkaeufer: 'v-anna', preis: 4.49, bewertung: 4.8, anzahlBewertungen: 15,
      dateityp: 'PDF', umfang: '29 Seiten', aktualisiert: iso(plus(heute(), -24)), semester: 3, verkaeufe: 44, vorschau: true,
      beschreibung: 'Klassische Studien, Einstellungsforschung und Gruppenprozesse, mit den Kritikpunkten, die im Seminar besprochen wurden.',
      vorschauText: 'Kognitive Dissonanz\n\nFestinger 1957: Widersprüchliche Kognitionen erzeugen einen unangenehmen Spannungszustand. Reduziert wird er meist über die am leichtesten änderbare Kognition.',
      rezensionen: [{ von: 'Ruth A.', sterne: 5, datum: iso(plus(heute(), -19)), text: 'Sehr gut für die Hausarbeit zu nutzen.' }] },

    /* --- Maschinenbau --- */
    { slug: 'uebungsaufgaben-technische-mechanik', titel: 'Übungsaufgaben Technische Mechanik I', typ: 'uebungsaufgaben',
      modul: 'mb-technische-mechanik-1', verkaeufer: 'v-nils', preis: 5.99, bewertung: 4.6, anzahlBewertungen: 13,
      dateityp: 'PDF', umfang: '41 Seiten', aktualisiert: iso(plus(heute(), -17)), semester: 1, verkaeufe: 34, vorschau: true,
      beschreibung: '35 Aufgaben zu Lagerreaktionen, Fachwerken und Schnittgrößen, jede mit Freikörperbild und Rechenweg.',
      vorschauText: 'Aufgabe 4\n\nEin Träger auf zwei Stützen, Streckenlast q über die halbe Länge.\n\nSchritt 1: Freikörperbild. Schritt 2: Summe der Momente um A gleich null.',
      rezensionen: [{ von: 'Jan W.', sterne: 5, datum: iso(plus(heute(), -14)), text: 'Die Freikörperbilder sind sauber gezeichnet, das hilft am meisten.' }] },
    { slug: 'formelsammlung-thermodynamik', titel: 'Formelsammlung Thermodynamik', typ: 'formelsammlung',
      modul: 'mb-thermodynamik', verkaeufer: 'v-nils', preis: 3.49, bewertung: 4.7, anzahlBewertungen: 11,
      dateityp: 'PDF', umfang: '14 Seiten', aktualisiert: iso(plus(heute(), -22)), semester: 3, verkaeufe: 28, vorschau: true,
      beschreibung: 'Hauptsätze, Zustandsgleichungen und die Kreisprozesse mit den zugehörigen Diagrammen.',
      vorschauText: 'Erster Hauptsatz für offene Systeme\n\ndQ + dW_t = dH + dE_kin + dE_pot\n\nStationärer Fließprozess ohne Höhenänderung: q + w_t = h2 − h1',
      rezensionen: [{ von: 'Sina L.', sterne: 4, datum: iso(plus(heute(), -16)), text: 'Kompakt. Ein Beispiel je Kreisprozess wäre noch schön.' }] }
  ];
  /* --- ENDE materialien --- */

  /* ------------------------------------------------- Services

     module ist eine Liste: dieselbe Nachhilfe passt oft zu mehreren
     Modulen, und Statistik heisst in BWL und Psychologie gleich, ist
     aber ein anderes Modul. Eine leere Liste heisst: passt überall. */

  /* --- SLUGS services --- */
  var services = [
    { slug: 'nachhilfe-statistik', titel: 'Nachhilfe Statistik I und II', kategorie: 'Nachhilfe',
      anbieter: 'v-anna', module: ['statistik-1', 'statistik-2', 'psych-statistik-1', 'psych-statistik-2'],
      preis: 22, einheit: 'Stunde', bewertung: 5.0, anzahlBewertungen: 19, ort: 'Online oder Bibliothek',
      beschreibung: 'Einzeln oder zu zweit. Wir rechnen deine Übungsblätter zusammen durch und gehen die Klausuraufgaben der letzten Jahre an. Die erste halbe Stunde zum Kennenlernen kostet nichts.' },
    { slug: 'korrekturlesen-hausarbeit', titel: 'Korrekturlesen von Haus- und Seminararbeiten', kategorie: 'Korrektur',
      anbieter: 'v-anna', module: [], preis: 3.5, einheit: 'Seite', bewertung: 4.9, anzahlBewertungen: 27, ort: 'Online',
      beschreibung: 'Rechtschreibung, Grammatik, Zeichensetzung und ein Blick auf den roten Faden. Rückmeldung als Kommentar im Dokument, in der Regel innerhalb von zwei Tagen.' },
    { slug: 'excel-hilfe', titel: 'Excel-Hilfe für Übungsblätter und Auswertungen', kategorie: 'Excel',
      anbieter: 'v-jonas', module: ['investition-finanzierung', 'kostenrechnung', 'controlling'],
      preis: 18, einheit: 'Stunde', bewertung: 4.8, anzahlBewertungen: 14, ort: 'Online',
      beschreibung: 'Pivot, Verweise, Diagramme und alles, was in der Übung schneller gehen muss. Wir teilen den Bildschirm und du machst mit.' },
    { slug: 'praesentationsfeedback', titel: 'Feedback zu deiner Präsentation', kategorie: 'Feedback',
      anbieter: 'v-lena', module: [], preis: 15, einheit: 'Termin', bewertung: 4.7, anzahlBewertungen: 9, ort: 'Online',
      beschreibung: 'Du hältst deinen Vortrag einmal komplett, ich schreibe mit und wir gehen ihn danach Folie für Folie durch.' },
    { slug: 'bewerbungshilfe', titel: 'Bewerbungsunterlagen für Praktika', kategorie: 'Bewerbung',
      anbieter: 'v-sarah', module: [], preis: 25, einheit: 'Paket', bewertung: 4.6, anzahlBewertungen: 12, ort: 'Online',
      beschreibung: 'Lebenslauf und Anschreiben gemeinsam überarbeiten, abgestimmt auf die Stelle. Zwei Runden sind im Preis enthalten.' },
    { slug: 'nachhilfe-buchfuehrung', titel: 'Nachhilfe Buchführung und Bilanzierung', kategorie: 'Nachhilfe',
      anbieter: 'v-lena', module: ['buchfuehrung', 'kostenrechnung'], preis: 20, einheit: 'Stunde', bewertung: 4.8, anzahlBewertungen: 16, ort: 'Bibliothek oder online',
      beschreibung: 'Buchungssätze, Abschluss, typische Klausuraufgaben. Auch kurzfristig vor der Klausur.' },
    { slug: 'nachhilfe-mathematik', titel: 'Nachhilfe Mathematik und Analysis', kategorie: 'Nachhilfe',
      anbieter: 'v-david', module: ['mathematik-analysis', 'mathematik-analysis-2', 'mathematik-lineare-algebra', 'mathematik-informatik', 'mb-mathematik', 'wirtschaftsmathematik'],
      preis: 20, einheit: 'Stunde', bewertung: 4.8, anzahlBewertungen: 21, ort: 'Online oder Bibliothek',
      beschreibung: 'Grenzwerte, Integrale, Beweise: wir gehen deine Übungsblätter durch und ich zeige dir, wie man den Ansatz findet. Auch für Lehramt und Ingenieurmathematik.' },
    { slug: 'nachhilfe-programmierung', titel: 'Hilfe beim Programmierprojekt', kategorie: 'Programmierung',
      anbieter: 'v-david', module: ['programmierung', 'algorithmen-datenstrukturen', 'softwaretechnik'],
      preis: 24, einheit: 'Stunde', bewertung: 4.9, anzahlBewertungen: 17, ort: 'Online',
      beschreibung: 'Wir setzen uns an deinen Code, suchen den Fehler gemeinsam und ich erkläre, warum er entstanden ist. Keine fertigen Lösungen.' },
    { slug: 'unterrichtsentwurf-feedback', titel: 'Feedback zum Unterrichtsentwurf', kategorie: 'Feedback',
      anbieter: 'v-mara', module: ['deutsch-fachdidaktik', 'mathematik-fachdidaktik', 'schulpaedagogik', 'schulpraktische-studien'],
      preis: 18, einheit: 'Entwurf', bewertung: 4.9, anzahlBewertungen: 11, ort: 'Online',
      beschreibung: 'Ich lese deinen Entwurf gegen die Kriterien des Seminars: Bedingungsanalyse, didaktische Reduktion, Verlaufsplan. Rückmeldung als Kommentar im Dokument.' }
  ];
  /* --- ENDE services --- */

  /* ------------------------------------------------- Flohmarkt

     Nur die eigene Hochschule. Keine Zahlung ueber die Plattform: die
     App stellt den Kontakt her, alles Weitere machen die beiden
     Studenten unter sich. Fuer den Prototyp sind nur fuer Leipzig
     Artikel hinterlegt — an anderen Hochschulen zeigt der Flohmarkt
     deshalb einen leeren Zustand, und das ist richtig so. */

  /* --- SLUGS flohmarkt --- */
  var flohmarkt = [
    { slug: 'taschenrechner-ti-30', titel: 'Taschenrechner TI-30 ECO RS', preis: 12, kategorie: 'Uni-Zubehör',
      zustand: 'Gut', verkaeufer: 'v-sarah', hochschule: 'uni-leipzig', eingestellt: iso(plus(heute(), -1)), ort: 'Südvorstadt', farbe: 'senf',
      beschreibung: 'Der in den Klausuren zugelassene Rechner. Zwei Semester benutzt, Display ohne Kratzer. Solarbetrieb, keine Batterie nötig.' },
    { slug: 'bwl-grundlagen-buch', titel: 'Wöhe: Einführung in die Allgemeine BWL, 27. Auflage', preis: 18, kategorie: 'Bücher',
      zustand: 'Gebraucht', verkaeufer: 'v-lena', hochschule: 'uni-leipzig', eingestellt: iso(plus(heute(), -2)), ort: 'Zentrum-Süd', farbe: 'tinte',
      beschreibung: 'Ein paar Bleistiftnotizen am Rand, Einband leicht bestoßen. Alles lesbar, nichts fehlt.' },
    { slug: 'monitor-24-zoll', titel: '24-Zoll-Monitor, Full HD', preis: 55, kategorie: 'Technik',
      zustand: 'Sehr gut', verkaeufer: 'v-jonas', hochschule: 'uni-leipzig', eingestellt: iso(plus(heute(), -3)), ort: 'Connewitz', farbe: 'tanne',
      beschreibung: 'Zweitmonitor, drei Jahre alt, keine Pixelfehler. HDMI-Kabel und Standfuß liegen dabei. Abholung, weil sperrig.' },
    { slug: 'schreibtischlampe', titel: 'Schreibtischlampe mit Klemme', preis: 8, kategorie: 'Möbel',
      zustand: 'Gut', verkaeufer: 'v-tim', hochschule: 'uni-leipzig', eingestellt: iso(plus(heute(), -4)), ort: 'Gohlis', farbe: 'terrakotta',
      beschreibung: 'Klemmt an jede Tischplatte bis 4 cm. Warmes Licht, Schalter am Kabel.' },
    { slug: 'fahrrad-28-zoll', titel: 'Damenrad 28 Zoll, 7 Gänge', preis: 95, kategorie: 'Fahrräder',
      zustand: 'Gebraucht', verkaeufer: 'v-anna', hochschule: 'uni-leipzig', eingestellt: iso(plus(heute(), -6)), ort: 'Plagwitz', farbe: 'oliv',
      beschreibung: 'Fährt zuverlässig, Reifen und Bremsen letztes Jahr neu. Rahmen hat Gebrauchsspuren. Probefahrt gern.' },
    { slug: 'kaffeemaschine', titel: 'Filterkaffeemaschine mit Thermoskanne', preis: 15, kategorie: 'Haushalt',
      zustand: 'Sehr gut', verkaeufer: 'v-sarah', hochschule: 'uni-leipzig', eingestellt: iso(plus(heute(), -8)), ort: 'Südvorstadt', farbe: 'rost',
      beschreibung: 'Kanne hält den Kaffee mehrere Stunden warm. Entkalkt, sauber, funktioniert einwandfrei.' },
    { slug: 'aktenordner-set', titel: 'Fünf Ordner und ein Locher', preis: 5, kategorie: 'Uni-Zubehör',
      zustand: 'Gut', verkaeufer: 'v-tim', hochschule: 'uni-leipzig', eingestellt: iso(plus(heute(), -10)), ort: 'Zentrum-Nord', farbe: 'senf',
      beschreibung: 'Nach der Prüfungsphase übrig. Rücken sind beschriftet, lässt sich aber überkleben.' },
    { slug: 'statistik-buch', titel: 'Fahrmeir: Statistik, 9. Auflage', preis: 22, kategorie: 'Bücher',
      zustand: 'Sehr gut', verkaeufer: 'v-lena', hochschule: 'uni-leipzig', eingestellt: iso(plus(heute(), -12)), ort: 'Zentrum-Süd', farbe: 'tinte',
      beschreibung: 'Das Standardwerk zur Vorlesung. Kaum benutzt, weil ich hauptsächlich mit dem Skript gelernt habe.' },
    { slug: 'zeichenbrett', titel: 'Zeichenplatte A3 mit Schiene', preis: 25, kategorie: 'Uni-Zubehör',
      zustand: 'Gut', verkaeufer: 'v-nils', hochschule: 'uni-leipzig', eingestellt: iso(plus(heute(), -5)), ort: 'Schleußig', farbe: 'senf',
      beschreibung: 'Aus dem Konstruktionsentwurf übrig. Schiene läuft leicht, Platte hat ein paar Bleistiftspuren.' },
    { slug: 'kinderbuch-sammlung', titel: 'Kiste mit Kinder- und Jugendbüchern', preis: 20, kategorie: 'Bücher',
      zustand: 'Gut', verkaeufer: 'v-mara', hochschule: 'uni-leipzig', eingestellt: iso(plus(heute(), -7)), ort: 'Lindenau', farbe: 'tinte',
      beschreibung: 'Rund 30 Titel aus dem Literaturseminar, viele davon Klassiker für die Sekundarstufe I. Nur zusammen.' }
  ];
  /* --- ENDE flohmarkt --- */

  /* ------------------------------------------------- Campus

     Zwei Sorten, klar getrennt:

     1. muster: true  — erfundene Meldungen. Sie zeigen, wie der Bereich
        aussieht, tragen KEINE Adresse und werden in der Oberflaeche als
        Musterdaten gekennzeichnet. Eine erfundene Meldung darf nie wie
        eine echte Mitteilung einer Hochschule wirken.

     2. muster: false — Wegweiser auf die echte Startseite der jeweiligen
        Hochschule. Hier stimmt der Verweis inhaltlich: die Angaben
        stehen wirklich dort. Nur diese Eintraege haben eine Adresse. */

  var campus = [
    { slug: 'bibliothek-laenger', hochschule: null, art: 'hinweis', muster: true,
      titel: 'Bibliothek heute länger geöffnet', datum: iso(heute()),
      text: 'Die Campus-Bibliothek schließt in der Prüfungsphase erst um 22:00 Uhr statt um 20:00 Uhr. Das gilt bis Ende des Monats, auch am Wochenende.',
      quelle: { name: 'Universitätsbibliothek' } },
    { slug: 'hochschulsport-kurse', hochschule: null, art: 'angebot', muster: true,
      titel: 'Hochschulsport öffnet neue Kurse', datum: iso(plus(heute(), -1)),
      text: 'Ab Montag sind Plätze in Klettern, Volleyball und Yoga frei. Die Anmeldung läuft über das Sportportal, erfahrungsgemäß sind die Kurse innerhalb weniger Stunden voll.',
      quelle: { name: 'Zentrum für Hochschulsport' } },
    { slug: 'erstsemester-treff', hochschule: null, art: 'event', muster: true,
      titel: 'Erstsemester-Treff auf dem Campus', datum: termintag(0, 4),
      text: 'Ab 18:30 Uhr im Innenhof. Die Fachschaft grillt, es gibt eine kurze Campusführung für alle, die noch suchen.',
      quelle: { name: 'Fachschaftsrat' } },
    { slug: 'mensa-preise', hochschule: null, art: 'hinweis', muster: true,
      titel: 'Mensa: neue Preise ab dem Wintersemester', datum: iso(plus(heute(), -3)),
      text: 'Das Studentenwerk hebt die Preise für Hauptgerichte an. Der ermäßigte Satz für Studenten bleibt bestehen, die Aufschläge treffen vor allem Gäste.',
      quelle: { name: 'Studentenwerk' } },
    { slug: 'karrieretag', hochschule: null, art: 'event', muster: true,
      titel: 'Karrieretag auf dem Campus', datum: termintag(2, 4),
      text: 'Rund 40 Unternehmen aus der Region stellen sich vor, Schwerpunkt Praktika und Werkstudentenstellen. Ohne Anmeldung, Lebenslauf mitbringen lohnt sich.',
      quelle: { name: 'Career Service' } },
    { slug: 'wlan-wartung', hochschule: null, art: 'hinweis', muster: true,
      titel: 'WLAN am Wochenende zeitweise gestört', datum: iso(plus(heute(), -2)),
      text: 'Am Samstag zwischen 6:00 und 10:00 Uhr wird das Campusnetz gewartet. In dieser Zeit sind die Lernplattform und die Bibliotheksdatenbanken nicht erreichbar.',
      quelle: { name: 'Rechenzentrum' } }
  ];

  /* Je Hochschule ein Wegweiser mit echter Adresse. Er behauptet nichts,
     sondern sagt, wo die verbindlichen Angaben wirklich stehen. */
  hochschulen.forEach(function (h) {
    campus.push({
      slug: 'wegweiser-' + h.id, hochschule: h.id, art: 'wegweiser', muster: false,
      titel: 'Fristen, Prüfungsordnung und Öffnungszeiten',
      datum: iso(plus(heute(), -30)),
      text: 'Verbindliche Termine, Prüfungsordnungen, Rückmeldefristen und die Öffnungszeiten von Bibliothek und Sekretariaten stehen auf den Seiten deiner Hochschule. Dieser Prototyp gibt sie nicht wieder.',
      quelle: { name: h.name, url: h.web }
    });
  });

  /* ------------------------------------------------- Feed

     Drei Reichweiten, und genau daraus entsteht die Personalisierung:

       modul        nur fuer Studenten, die dieses Modul belegen
       studiengang  fuer alle in diesem Studiengang
       (nichts)     hochschulweit, unabhaengig vom Studiengang

     typ: termin | material | frage | event | campus | hinweis */

  var feed = [

    /* --- BWL --- */
    { id: 'f-bwl-1', typ: 'termin', modul: 'statistik-2', amtlich: true,
      titel: 'Raumänderung für die heutige Vorlesung',
      text: 'Statistik II findet heute in Hörsaal 3 statt, nicht wie üblich in Hörsaal 1. Die Übung am Donnerstag bleibt unverändert.',
      zeit: 'vor 2 Stunden', von: 'Prof. Wagner' },
    { id: 'f-bwl-2', typ: 'hinweis', modul: 'statistik-2', eigen: true,
      titel: 'Übungsblatt 3 ist heute um 18:00 Uhr fällig',
      text: 'Du hast noch einen offenen Punkt auf deiner Checkliste.', zeit: 'heute' },
    { id: 'f-bwl-3', typ: 'frage', modul: 'marketing',
      titel: 'Welche Themen sind für die Klausur besonders wichtig?',
      text: 'In der letzten Vorlesung war von einem Schwerpunkt die Rede, aber nicht welcher. Weiß jemand mehr?',
      zeit: 'vor 4 Stunden', von: 'Anonym · verifiziert', antworten: 7, hilfreich: 24 },
    { id: 'f-bwl-4', typ: 'material', modul: 'statistik-2', material: 'klausurzusammenfassung-statistik-2',
      titel: 'Neue Zusammenfassung für Statistik II',
      text: 'Lena K. hat ihre Klausurzusammenfassung überarbeitet, jetzt mit den Aufgaben der letzten Klausur.',
      zeit: 'vor 5 Stunden', von: 'Lena K.' },
    { id: 'f-bwl-5', typ: 'frage', modul: 'investition-finanzierung',
      titel: 'Rentenbarwertfaktor in Aufgabe 12 — Denkfehler?',
      text: 'Ich komme auf 3,465 statt 3,4651. Rundet ihr vorher oder erst am Ende?',
      zeit: 'gestern', von: 'Marek P.', antworten: 4, hilfreich: 11 },
    { id: 'f-bwl-6', typ: 'termin', modul: 'wirtschaftsrecht', amtlich: true,
      titel: 'Klausurtermin steht fest',
      text: 'Die Klausur Wirtschaftsrecht ist in vier Wochen, Dienstag um 11:00 Uhr in Hörsaal 1. Der Termin liegt jetzt in deinem Kalender.',
      zeit: 'vor 2 Tagen', von: 'Dr. König' },
    { id: 'f-bwl-7', typ: 'frage', modul: 'wirtschaftsinformatik',
      titel: 'Reicht ein ER-Modell oder braucht es auch das relationale Schema?',
      text: 'In der Aufgabenstellung steht nur Datenmodell. Im Seminar wurde beides gezeigt.',
      zeit: 'vor 3 Tagen', von: 'Anonym · verifiziert', antworten: 3, hilfreich: 8 },

    /* --- Lehramt --- */
    { id: 'f-la-1', typ: 'termin', modul: 'schulpraktische-studien', amtlich: true,
      titel: 'Anmeldung für den Praktikumsblock ist geöffnet',
      text: 'Die Plätze an den Praktikumsschulen werden nach Eingang vergeben. Wer im Block hospitieren möchte, sollte sich diese Woche eintragen.',
      zeit: 'vor 3 Stunden', von: 'Frau Bauer' },
    { id: 'f-la-2', typ: 'frage', modul: 'schulpaedagogik',
      titel: 'Hat jemand Literatur für die Hausarbeit zur Klassenführung?',
      text: 'Im Seminar wurden nur zwei Titel genannt, beide sind in der Bibliothek ausgeliehen. Womit habt ihr gearbeitet?',
      zeit: 'vor 6 Stunden', von: 'Anonym · verifiziert', antworten: 9, hilfreich: 31 },
    { id: 'f-la-3', typ: 'hinweis', modul: 'entwicklungspsychologie',
      titel: 'Neue Folien zur Vorlesung stehen online',
      text: 'Die Sitzung zur Bindungstheorie ist ergänzt, inklusive der Grafik, die in der Vorlesung gefehlt hat.',
      zeit: 'gestern', von: 'Prof. Neubert', amtlich: true },
    { id: 'f-la-4', typ: 'material', modul: 'entwicklungspsychologie', material: 'lernzettel-entwicklungspsychologie',
      titel: 'Lernzettel zur Entwicklungspsychologie aktualisiert',
      text: 'Mara S. hat die Übersicht zu Piaget und Erikson überarbeitet und Beispiele aus dem Schulalltag ergänzt.',
      zeit: 'vor 2 Tagen', von: 'Mara S.' },
    { id: 'f-la-5', typ: 'frage', modul: 'deutsch-fachdidaktik',
      titel: 'Wie ausführlich muss die Sachanalyse im Entwurf sein?',
      text: 'Im Beispiel aus dem Seminar sind es zwei Seiten, in der Handreichung steht „knapp“. Wonach richtet ihr euch?',
      zeit: 'gestern', von: 'Anonym · verifiziert', antworten: 5, hilfreich: 14 },
    { id: 'f-la-6', typ: 'frage', modul: 'mathematik-fachdidaktik',
      titel: 'Beispielaufgaben für die Einführung des Funktionsbegriffs?',
      text: 'Ich suche Aufgaben, die ohne Formelsprache auskommen und trotzdem tragfähig sind.',
      zeit: 'vor 2 Tagen', von: 'Anonym · verifiziert', antworten: 4, hilfreich: 12 },
    { id: 'f-la-7', typ: 'hinweis', studiengang: 'lehramt',
      titel: 'Fachschaft sammelt Erfahrungsberichte aus dem Praktikum',
      text: 'Wer schon an einer Schule war, kann kurz aufschreiben, wie die Betreuung lief. Die Sammlung hilft allen, die im nächsten Block dran sind.',
      zeit: 'vor 3 Tagen', von: 'Fachschaftsrat Lehramt', antworten: 6, hilfreich: 19 },

    /* --- Informatik --- */
    { id: 'f-inf-1', typ: 'termin', modul: 'datenbanken', amtlich: true,
      titel: 'Übung fällt diese Woche aus',
      text: 'Die Übung zu Datenbanken entfällt einmalig. Das Blatt bleibt trotzdem bis Freitag abzugeben.',
      zeit: 'vor 4 Stunden', von: 'Prof. Keller' },
    { id: 'f-inf-2', typ: 'frage', modul: 'theoretische-informatik',
      titel: 'Pumping-Lemma: Reicht ein Gegenbeispiel für den Beweis?',
      text: 'In der Übung wurde es einmal so gemacht und einmal ausführlich. Was wird in der Klausur erwartet?',
      zeit: 'gestern', von: 'Anonym · verifiziert', antworten: 6, hilfreich: 22 },
    { id: 'f-inf-3', typ: 'material', modul: 'datenbanken', material: 'zusammenfassung-datenbanken',
      titel: 'Zusammenfassung Datenbanken überarbeitet',
      text: 'David P. hat die Normalformen neu erklärt und die Beispielabfragen aus der Übung ergänzt.',
      zeit: 'vor 2 Tagen', von: 'David P.' },
    { id: 'f-inf-4', typ: 'hinweis', modul: 'softwaretechnik',
      titel: 'Projektgruppen bis Freitag eintragen',
      text: 'Dreier- und Vierergruppen. Wer sich nicht einträgt, wird zugelost.',
      zeit: 'vor 2 Tagen', von: 'Prof. Roth', amtlich: true },
    { id: 'f-inf-5', typ: 'hinweis', studiengang: 'informatik',
      titel: 'Rechnerpool in der Prüfungsphase länger geöffnet',
      text: 'Die Pools sind bis 22:00 Uhr zugänglich. Der Zugang läuft über den Studentenausweis.',
      zeit: 'vor 3 Tagen', von: 'Fachschaftsrat Informatik' },

    /* --- Psychologie --- */
    { id: 'f-psy-1', typ: 'frage', modul: 'psych-statistik-2',
      titel: 'Voraussetzungen der ANOVA — wie streng prüft ihr die?',
      text: 'Levene-Test ist signifikant, die Gruppen sind aber fast gleich groß. Rechnet ihr trotzdem weiter?',
      zeit: 'vor 5 Stunden', von: 'Anonym · verifiziert', antworten: 8, hilfreich: 27 },
    { id: 'f-psy-2', typ: 'termin', modul: 'psych-diagnostik', amtlich: true,
      titel: 'Testverfahren für die Sitzung mitbringen',
      text: 'Die Manuale liegen im Handapparat der Bibliothek. Wer keinen bekommt, arbeitet zu zweit.',
      zeit: 'gestern', von: 'Dr. Ritter' },
    { id: 'f-psy-3', typ: 'material', modul: 'psych-statistik-2', material: 'formelsammlung-statistik-psych',
      titel: 'Formelsammlung für die Klausur aktualisiert',
      text: 'Anna W. hat die Effektstärken ergänzt und auf die erlaubte Fassung gekürzt.',
      zeit: 'vor 2 Tagen', von: 'Anna W.' },

    /* --- Maschinenbau --- */
    { id: 'f-mb-1', typ: 'frage', modul: 'mb-thermodynamik',
      titel: 'Kreisprozess in Aufgabe 5: isentrop oder polytrop?',
      text: 'In der Angabe steht nur „reibungsfrei“. Ich komme mit beiden Ansätzen auf verschiedene Wirkungsgrade.',
      zeit: 'vor 3 Stunden', von: 'Anonym · verifiziert', antworten: 5, hilfreich: 16 },
    { id: 'f-mb-2', typ: 'termin', modul: 'mb-konstruktion', amtlich: true,
      titel: 'Zeichensaal am Donnerstag früher geöffnet',
      text: 'Ab 8:00 Uhr, damit vor der Abgabe noch Zeit bleibt. Zeichenplatten bitte selbst mitbringen.',
      zeit: 'gestern', von: 'Prof. Ebert' },
    { id: 'f-mb-3', typ: 'material', modul: 'mb-thermodynamik', material: 'formelsammlung-thermodynamik',
      titel: 'Formelsammlung Thermodynamik eingestellt',
      text: 'Nils T. hat die Hauptsätze und Kreisprozesse auf 14 Seiten zusammengefasst.',
      zeit: 'vor 3 Tagen', von: 'Nils T.' },

    /* --- hochschulweit --- */
    { id: 'f-cam-1', typ: 'campus', campus: 'bibliothek-laenger',
      titel: 'Bibliothek heute länger geöffnet',
      text: 'Bis 22:00 Uhr statt 20:00 Uhr, den ganzen Monat.', zeit: 'heute' },
    { id: 'f-cam-2', typ: 'event', campus: 'erstsemester-treff',
      titel: 'Erstsemester-Treff auf dem Campus',
      text: 'Donnerstag ab 18:30 Uhr im Innenhof. Die Fachschaft grillt.', zeit: 'gestern' },
    { id: 'f-cam-3', typ: 'campus', campus: 'hochschulsport-kurse',
      titel: 'Hochschulsport öffnet neue Kurse',
      text: 'Klettern, Volleyball und Yoga. Anmeldung ab Montag.', zeit: 'vor 2 Tagen' },
    { id: 'f-cam-4', typ: 'campus', campus: 'wlan-wartung',
      titel: 'WLAN am Wochenende zeitweise gestört',
      text: 'Samstag zwischen 6:00 und 10:00 Uhr. Lernplattform und Datenbanken sind dann nicht erreichbar.', zeit: 'vor 2 Tagen' }
  ];

  /* ------------------------------------------------- Nachrichten */

  var nachrichten = [
    { id: 'c1', partner: 'v-sarah', bezug: { art: 'flohmarkt', slug: 'taschenrechner-ti-30', titel: 'Taschenrechner TI-30 ECO RS' },
      ungelesen: 2, farbe: 'senf',
      verlauf: [
        { von: 'ich',   text: 'Hallo Sarah, ist der Taschenrechner noch da?', zeit: 'Gestern 18:12' },
        { von: 'fremd', text: 'Hi, ja, ist noch zu haben.', zeit: 'Gestern 18:40' },
        { von: 'fremd', text: 'Ich bin morgen ab 14 Uhr in der Bibliothek, da könnten wir uns treffen. Passt dir das?', zeit: 'Gestern 18:41' }
      ] },
    { id: 'c2', partner: 'v-anna', bezug: { art: 'service', slug: 'nachhilfe-statistik', titel: 'Nachhilfe Statistik I und II' },
      ungelesen: 1, farbe: 'koralle',
      verlauf: [
        { von: 'ich',   text: 'Hi Anna, ich schreibe bald Statistik und komme bei den Testverfahren nicht weiter. Hast du noch Termine frei?', zeit: 'Vorgestern 11:03' },
        { von: 'fremd', text: 'Klar. Mittwoch 17 Uhr oder Freitag vormittags. Bring am besten dein letztes Übungsblatt mit, dann sehe ich schnell, wo es hakt.', zeit: 'Vorgestern 12:20' }
      ] },
    { id: 'c3', partner: 'v-lena', bezug: { art: 'material', slug: 'formelsammlung-statistik-2', titel: 'Formelsammlung Statistik II' },
      ungelesen: 0, farbe: 'tanne',
      verlauf: [
        { von: 'ich',   text: 'Danke für die Formelsammlung, hat mir sehr geholfen.', zeit: 'Montag 09:15' },
        { von: 'fremd', text: 'Freut mich. Falls dir etwas fehlt, sag Bescheid, ich aktualisiere nach jeder Klausur.', zeit: 'Montag 09:52' }
      ] },
    { id: 'c4', partner: 'system', bezug: { art: 'system', titel: 'Campus' }, ungelesen: 0, farbe: 'stein',
      verlauf: [
        { von: 'fremd', text: 'Deine Hochschul-E-Mail-Adresse ist bestätigt. Du kannst jetzt verkaufen und Beiträge schreiben.', zeit: 'Vor 3 Wochen' }
      ] }
  ];

  /* ------------------------------------------------- Termine

     Aus dem Stundenplan jedes Moduls entstehen feste Termine fuer
     14 Wochen (4 zurueck, 9 voraus). Erzeugt wird das fuer ALLE Module
     des Katalogs — welche davon sichtbar sind, entscheidet spaeter die
     Modulliste des Nutzers. So braucht ein Wechsel des Studiengangs
     kein Neuladen der Daten.

     art: vorlesung | seminar | pruefung | abgabe | todo | event | privat */

  var termine = [];
  var nummer = 0;

  module.forEach(function (m) {
    (m.plan || []).forEach(function (p) {
      for (var w = -4; w <= 9; w++) {
        nummer++;
        termine.push({
          id: 't' + nummer, modul: m.slug, titel: m.name, zusatz: p.titel, art: p.art,
          datum: termintag(w, p.wochentag), start: p.start, ende: p.ende, ort: p.ort,
          wiederkehrend: true
        });
      }
    });
  });

  function einzel(t) {
    nummer++;
    t.id = 't' + nummer;
    termine.push(t);
  }

  /* --- Prüfungen und Abgaben je Studiengang --- */

  /* BWL */
  einzel({ modul: 'statistik-2', titel: 'Übungsblatt 3 abgeben', art: 'abgabe',
    datum: iso(heute()), start: '18:00', ort: 'Lernplattform',
    checkliste: [{ text: 'Aufgabe 1 bis 3 rechnen', erledigt: true }, { text: 'Lösungsweg abtippen', erledigt: true }, { text: 'Hochladen', erledigt: false }] });
  einzel({ modul: 'statistik-2', titel: 'Klausur Statistik II', art: 'pruefung',
    datum: termintag(2, 3), start: '09:00', ende: '10:30', ort: 'Hörsaal 3',
    erinnerungen: ['7 Tage vorher', '1 Tag vorher'] });
  einzel({ modul: 'marketing', titel: 'Hausarbeit Positionierung abgeben', art: 'abgabe',
    datum: termintag(1, 5), start: '23:59', ort: 'Lernplattform',
    checkliste: [{ text: 'Gliederung', erledigt: true }, { text: 'Quellen sammeln', erledigt: true }, { text: 'Rohfassung', erledigt: false }, { text: 'Korrektur lesen lassen', erledigt: false }] });
  einzel({ modul: 'wirtschaftsrecht', titel: 'Klausur Wirtschaftsrecht', art: 'pruefung',
    datum: termintag(4, 2), start: '11:00', ende: '12:00', ort: 'Hörsaal 1',
    erinnerungen: ['7 Tage vorher', '1 Tag vorher'] });
  einzel({ modul: 'wirtschaftsinformatik', titel: 'Projektabgabe Datenmodell', art: 'abgabe',
    datum: termintag(3, 1), start: '12:00', ort: 'Lernplattform' });

  /* Lehramt */
  einzel({ modul: 'schulpraktische-studien', titel: 'Praktikumsbericht: erste Fassung', art: 'abgabe',
    datum: iso(heute()), start: '19:00', ort: 'Lernplattform',
    checkliste: [{ text: 'Hospitationsprotokoll abtippen', erledigt: true }, { text: 'Reflexion schreiben', erledigt: false }, { text: 'Anhang zusammenstellen', erledigt: false }] });
  einzel({ modul: 'entwicklungspsychologie', titel: 'Klausur Entwicklungspsychologie', art: 'pruefung',
    datum: termintag(2, 4), start: '10:00', ende: '11:30', ort: 'Hörsaal 5',
    erinnerungen: ['7 Tage vorher', '1 Tag vorher'] });
  einzel({ modul: 'schulpaedagogik', titel: 'Hausarbeit Klassenführung abgeben', art: 'abgabe',
    datum: termintag(3, 5), start: '23:59', ort: 'Lernplattform',
    checkliste: [{ text: 'Literatur sichten', erledigt: true }, { text: 'Gliederung abstimmen', erledigt: false }, { text: 'Rohfassung', erledigt: false }] });
  einzel({ modul: 'deutsch-fachdidaktik', titel: 'Unterrichtsentwurf abgeben', art: 'abgabe',
    datum: termintag(2, 2), start: '12:00', ort: 'Seminarraum 5.02' });
  einzel({ modul: 'mathematik-fachdidaktik', titel: 'Unterrichtsentwurf abgeben', art: 'abgabe',
    datum: termintag(2, 2), start: '12:00', ort: 'Seminarraum 6.04' });
  einzel({ modul: 'mathematik-analysis-2', titel: 'Klausur Analysis II', art: 'pruefung',
    datum: termintag(4, 1), start: '09:00', ende: '11:00', ort: 'Hörsaal 6',
    erinnerungen: ['7 Tage vorher', '1 Tag vorher'] });

  /* Informatik */
  einzel({ modul: 'softwaretechnik', titel: 'Projektabgabe: erstes Release', art: 'abgabe',
    datum: termintag(2, 5), start: '23:59', ort: 'Lernplattform',
    checkliste: [{ text: 'Anforderungen festhalten', erledigt: true }, { text: 'Tests schreiben', erledigt: false }, { text: 'Dokumentation', erledigt: false }] });
  einzel({ modul: 'datenbanken', titel: 'Klausur Datenbanken', art: 'pruefung',
    datum: termintag(3, 3), start: '09:00', ende: '10:30', ort: 'Hörsaal 8',
    erinnerungen: ['7 Tage vorher', '1 Tag vorher'] });
  einzel({ modul: 'theoretische-informatik', titel: 'Übungsblatt 4 abgeben', art: 'abgabe',
    datum: iso(heute()), start: '18:00', ort: 'Lernplattform',
    checkliste: [{ text: 'Aufgabe 1 und 2', erledigt: true }, { text: 'Pumping-Lemma-Beweis', erledigt: false }] });

  /* Psychologie */
  einzel({ modul: 'psych-statistik-2', titel: 'Klausur Statistik II', art: 'pruefung',
    datum: termintag(2, 3), start: '09:00', ende: '10:30', ort: 'Hörsaal 9',
    erinnerungen: ['7 Tage vorher', '1 Tag vorher'] });
  einzel({ modul: 'psych-sozial', titel: 'Hausarbeit Sozialpsychologie abgeben', art: 'abgabe',
    datum: termintag(3, 5), start: '23:59', ort: 'Lernplattform',
    checkliste: [{ text: 'Fragestellung festlegen', erledigt: true }, { text: 'Literatur sichten', erledigt: false }, { text: 'Rohfassung', erledigt: false }] });
  einzel({ modul: 'psych-statistik-2', titel: 'Auswertung abgeben', art: 'abgabe',
    datum: iso(heute()), start: '18:00', ort: 'Lernplattform',
    checkliste: [{ text: 'Datensatz aufbereiten', erledigt: true }, { text: 'ANOVA rechnen', erledigt: true }, { text: 'Ergebnisteil schreiben', erledigt: false }] });

  /* Maschinenbau */
  einzel({ modul: 'mb-konstruktion', titel: 'Konstruktionsentwurf abgeben', art: 'abgabe',
    datum: termintag(2, 4), start: '11:15', ort: 'Zeichensaal',
    checkliste: [{ text: 'Baugruppe zeichnen', erledigt: true }, { text: 'Toleranzen eintragen', erledigt: false }, { text: 'Stückliste', erledigt: false }] });
  einzel({ modul: 'mb-thermodynamik', titel: 'Klausur Thermodynamik', art: 'pruefung',
    datum: termintag(3, 1), start: '09:00', ende: '11:00', ort: 'Hörsaal 10',
    erinnerungen: ['7 Tage vorher', '1 Tag vorher'] });
  einzel({ modul: 'mb-technische-mechanik-1', titel: 'Übungsblatt 5 abgeben', art: 'abgabe',
    datum: iso(heute()), start: '18:00', ort: 'Lernplattform',
    checkliste: [{ text: 'Freikörperbilder zeichnen', erledigt: true }, { text: 'Schnittgrößen berechnen', erledigt: false }] });

  /* --- ohne Modulbezug: gilt fuer alle --- */
  einzel({ titel: 'Lerngruppe', art: 'privat', datum: termintag(0, 3),
    start: '17:00', ende: '19:00', ort: 'Bibliothek, Gruppenraum 2', privat: true });
  einzel({ titel: 'Erstsemester-Treff auf dem Campus', art: 'event',
    datum: termintag(0, 4), start: '18:30', ort: 'Innenhof', gemeinschaft: true, bestaetigt: 34 });
  einzel({ titel: 'Hochschulsport: Anmeldung Kurse', art: 'todo',
    datum: termintag(0, 5), start: '20:00', ort: 'Online' });

  /* ------------------------------------------------- Zugriff */

  function nachSlug(sammlung, slug) {
    for (var i = 0; i < sammlung.length; i++) if (sammlung[i].slug === slug) return sammlung[i];
    return null;
  }
  function nachId(sammlung, id) {
    for (var i = 0; i < sammlung.length; i++) if (sammlung[i].id === id) return sammlung[i];
    return null;
  }

  return {
    iso: iso, heute: heute, plus: plus, montag: montag, termintag: termintag,
    semesterName: semesterName, demoKonto: demoKonto,

    hochschulen: hochschulen, studiengaenge: studiengaenge, module: module,
    materialien: materialien, services: services, flohmarkt: flohmarkt,
    campus: campus, feed: feed, nachrichten: nachrichten, verkaeufer: verkaeufer,
    termine: termine,

    modul: function (slug) { return nachSlug(module, slug); },
    material: function (slug) { return nachSlug(materialien, slug); },
    service: function (slug) { return nachSlug(services, slug); },
    artikel: function (slug) { return nachSlug(flohmarkt, slug); },
    campusEintrag: function (slug) { return nachSlug(campus, slug); },
    chat: function (id) { return nachId(nachrichten, id); },
    hochschule: function (id) { return nachId(hochschulen, id); },
    studiengang: function (id) { return nachId(studiengaenge, id); },
    person: function (id) {
      return id === 'system' ? { id: 'system', name: 'Campus', kuerzel: 'C', verifiziert: true } : nachId(verkaeufer, id);
    },
    fach: function (studiengangId, fachId) {
      var sg = nachId(studiengaenge, studiengangId);
      if (!sg || !sg.faecher || !fachId) return null;
      for (var i = 0; i < sg.faecher.length; i++) if (sg.faecher[i].id === fachId) return sg.faecher[i];
      return null;
    }
  };
})();
