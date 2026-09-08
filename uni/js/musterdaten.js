/* =========================================================================
   Campus — Musterdaten.

   ALLES IN DIESER DATEI IST ERFUNDEN: Modulnamen, Dozenten, Raeume,
   Uhrzeiten, Beitraege, Materialien, Preise, Bewertungen, Nachrichten.

   Sie ist bewusst von hochschuldaten.js getrennt. Dort stehen die
   Angaben aus oeffentlichen Hochschulquellen, hier steht das Erfundene.
   Jeder Datensatz traegt herkunft: 'muster', und die Oberflaeche
   kennzeichnet ihn als solchen. Nichts davon darf als Auskunft einer
   Hochschule erscheinen.

   Sobald ein Anbieter aus hochschuldaten.js echte Module liefert,
   treten sie an die Stelle dieser Liste; die Ansichten aendern sich
   dadurch nicht.
   ========================================================================= */
window.Uni = window.Uni || {};

Uni.muster = (function () {
  'use strict';

  var z = Uni.daten;          /* Datumshilfen, siehe daten.js */
  var hd = Uni.hochschuldaten;
  var iso = z.iso, heute = z.heute, plus = z.plus, termintag = z.termintag;

  /* Ein Eintrag im Stundenplan. Alle Zeiten und Raeume sind erfunden. */
  function V(wochentag, start, ende, ort) {
    return { wochentag: wochentag, start: start, ende: ende, ort: ort, art: 'vorlesung', titel: 'Vorlesung' };
  }
  function S(wochentag, start, ende, ort, titel) {
    return { wochentag: wochentag, start: start, ende: ende, ort: ort, art: 'seminar', titel: titel || 'Seminar' };
  }

  var FARBEN = ['koralle', 'senf', 'tanne', 'tinte', 'rost', 'pflaume', 'oliv', 'terrakotta'];
  function farbeFuer(text) {
    var summe = 0;
    for (var i = 0; i < text.length; i++) summe += text.charCodeAt(i);
    return FARBEN[summe % FARBEN.length];
  }

  /* ------------------------------------------------- Module

     studiengang zeigt auf hochschuldaten.studiengaenge.
     Bei Lehramt kommen zwei weitere Schluessel dazu:

       lehramtstyp  nur fuer diese Schulart (null = fuer alle)
       fach         nur, wenn dieses Fach gewaehlt ist (null = immer)
       gruppe       bildungswissenschaften | schulart | fachwissenschaft |
                    fachdidaktik | praktikum  */

  /* --- SLUGS module --- */
  var module = [

    /* ------------- Wirtschaftswissenschaften ------------- */
    { slug: 'grundlagen-bwl', name: 'Grundlagen der Betriebswirtschaftslehre', kuerzel: 'GBW', dozent: 'Prof. Reimann',
      farbe: 'terrakotta', ects: 6, semester: 1, studiengang: 'ul-wiwi', pruefung: 'Klausur, 90 Minuten', teilnehmer: 312,
      beschreibung: 'Aufbau von Unternehmen, betriebliche Funktionen und die Grundbegriffe, auf denen die weiteren Module aufbauen.',
      plan: [V(1, '09:00', '10:30', 'Hörsaal 1')] },
    { slug: 'wirtschaftsmathematik', name: 'Wirtschaftsmathematik', kuerzel: 'WMA', dozent: 'Dr. Weiss',
      farbe: 'tinte', ects: 6, semester: 1, studiengang: 'ul-wiwi', pruefung: 'Klausur, 90 Minuten', teilnehmer: 298,
      beschreibung: 'Folgen, Funktionen, Differential- und Integralrechnung mit wirtschaftlichen Anwendungen.',
      plan: [V(2, '08:30', '10:00', 'Hörsaal 2')] },
    { slug: 'buchfuehrung', name: 'Buchführung und Abschluss', kuerzel: 'BUF', dozent: 'Dr. Meinhardt',
      farbe: 'oliv', ects: 5, semester: 1, studiengang: 'ul-wiwi', pruefung: 'Klausur, 90 Minuten', teilnehmer: 268,
      beschreibung: 'Doppelte Buchführung, Jahresabschluss und Bilanzierung von der ersten Buchung an.',
      plan: [V(4, '10:15', '11:45', 'Hörsaal 4')] },
    { slug: 'statistik-1', name: 'Statistik I', kuerzel: 'STA I', dozent: 'Prof. Wagner',
      farbe: 'koralle', ects: 6, semester: 2, studiengang: 'ul-wiwi', pruefung: 'Klausur, 90 Minuten', teilnehmer: 231,
      beschreibung: 'Deskriptive Statistik und Wahrscheinlichkeitsrechnung als Grundlage für Statistik II.',
      plan: [V(2, '10:15', '11:45', 'Hörsaal 3')] },
    { slug: 'mikrooekonomik', name: 'Mikroökonomik', kuerzel: 'MIK', dozent: 'Prof. Ahrens',
      farbe: 'pflaume', ects: 6, semester: 2, studiengang: 'ul-wiwi', pruefung: 'Klausur, 90 Minuten', teilnehmer: 245,
      beschreibung: 'Haushalts- und Unternehmenstheorie, Marktformen und Preisbildung.',
      plan: [V(3, '12:00', '13:30', 'Hörsaal 1')] },
    { slug: 'kostenrechnung', name: 'Kosten- und Leistungsrechnung', kuerzel: 'KLR', dozent: 'Dr. Weiss',
      farbe: 'senf', ects: 5, semester: 2, studiengang: 'ul-wiwi', pruefung: 'Klausur, 90 Minuten', teilnehmer: 224,
      beschreibung: 'Kostenarten, Kostenstellen, Kostenträger und die Kalkulation im Betrieb.',
      plan: [V(5, '10:15', '11:45', 'Seminarraum 2.01')] },
    { slug: 'statistik-2', name: 'Statistik II', kuerzel: 'STA II', dozent: 'Prof. Wagner',
      farbe: 'koralle', ects: 6, semester: 3, studiengang: 'ul-wiwi', pruefung: 'Klausur, 90 Minuten', teilnehmer: 214,
      beschreibung: 'Schließende Statistik: Schätzverfahren, Hypothesentests, Regression. Aufbauend auf Statistik I.',
      plan: [V(2, '10:15', '11:45', 'Hörsaal 3'), S(4, '14:00', '15:30', 'Seminarraum 2.04', 'Übung')] },
    { slug: 'marketing', name: 'Marketing', kuerzel: 'MKT', dozent: 'Prof. Berger',
      farbe: 'senf', ects: 5, semester: 3, studiengang: 'ul-wiwi', pruefung: 'Hausarbeit und Präsentation', teilnehmer: 186,
      beschreibung: 'Marketingmanagement, Marktforschung, Positionierung und Kommunikationspolitik.',
      plan: [V(2, '14:00', '15:30', 'Seminarraum 1.12')] },
    { slug: 'wirtschaftsrecht', name: 'Wirtschaftsrecht', kuerzel: 'WR', dozent: 'Dr. König',
      farbe: 'tinte', ects: 5, semester: 3, studiengang: 'ul-wiwi', pruefung: 'Klausur, 60 Minuten', teilnehmer: 203,
      beschreibung: 'BGB im unternehmerischen Alltag, Handelsrecht, Gesellschaftsformen und Vertragsgestaltung.',
      plan: [V(4, '08:30', '10:00', 'Hörsaal 1')] },
    { slug: 'investition-finanzierung', name: 'Investition & Finanzierung', kuerzel: 'IUF', dozent: 'Prof. Scholz',
      farbe: 'tanne', ects: 6, semester: 3, studiengang: 'ul-wiwi', pruefung: 'Klausur, 120 Minuten', teilnehmer: 197,
      beschreibung: 'Investitionsrechnung, Kapitalwertmethode, Finanzierungsformen und Kapitalstruktur.',
      plan: [V(5, '12:00', '13:30', 'Hörsaal 2')] },
    { slug: 'wirtschaftsinformatik', name: 'Wirtschaftsinformatik', kuerzel: 'WINF', dozent: 'Prof. Lindner',
      farbe: 'pflaume', ects: 5, semester: 3, studiengang: 'ul-wiwi', pruefung: 'Projektarbeit', teilnehmer: 142,
      beschreibung: 'Geschäftsprozesse, Datenmodellierung und betriebliche Informationssysteme.',
      plan: [S(1, '16:00', '17:30', 'Rechenzentrum 1.05')] },
    { slug: 'wirtschaftsenglisch', name: 'Wirtschaftsenglisch', kuerzel: 'ENG', dozent: 'Ms. Hartley',
      farbe: 'oliv', ects: 3, semester: 3, studiengang: 'ul-wiwi', pruefung: 'Mündliche Prüfung', teilnehmer: 64,
      beschreibung: 'Business English: Verhandlung, Korrespondenz und Präsentation.',
      plan: [S(3, '09:00', '10:30', 'Seminarraum 3.01', 'Kurs')] },
    { slug: 'personalmanagement', name: 'Personalmanagement', kuerzel: 'PM', dozent: 'Prof. Reimann',
      farbe: 'terrakotta', ects: 5, semester: 4, studiengang: 'ul-wiwi', pruefung: 'Klausur, 60 Minuten', teilnehmer: 121,
      beschreibung: 'Personalauswahl, Führung und Arbeitsrecht in der betrieblichen Praxis.',
      plan: [V(3, '14:00', '15:30', 'Hörsaal 4')] },
    { slug: 'makrooekonomik', name: 'Makroökonomik', kuerzel: 'MAK', dozent: 'Prof. Ahrens',
      farbe: 'tinte', ects: 6, semester: 4, studiengang: 'ul-wiwi', pruefung: 'Klausur, 90 Minuten', teilnehmer: 188,
      beschreibung: 'Volkswirtschaftliche Gesamtrechnung, Konjunktur, Geld- und Fiskalpolitik.',
      plan: [V(1, '10:15', '11:45', 'Hörsaal 1')] },
    { slug: 'controlling', name: 'Controlling', kuerzel: 'CTR', dozent: 'Dr. Weiss',
      farbe: 'oliv', ects: 5, semester: 4, studiengang: 'ul-wiwi', pruefung: 'Klausur, 90 Minuten', teilnehmer: 96,
      beschreibung: 'Kennzahlensysteme, Planung, Abweichungsanalyse und Berichtswesen.',
      plan: [V(5, '08:30', '10:00', 'Seminarraum 1.04')] },
    { slug: 'unternehmensfuehrung', name: 'Unternehmensführung', kuerzel: 'UF', dozent: 'Prof. Scholz',
      farbe: 'rost', ects: 5, semester: 4, studiengang: 'ul-wiwi', pruefung: 'Fallstudie', teilnehmer: 88,
      beschreibung: 'Strategische Planung, Organisation und Entscheidungsprozesse.',
      plan: [V(2, '16:00', '17:30', 'Hörsaal 2')] },

    /* ------------- Informatik ------------- */
    { slug: 'programmierung', name: 'Programmierung', kuerzel: 'PROG', dozent: 'Prof. Roth',
      farbe: 'tanne', ects: 8, semester: 1, studiengang: 'ul-informatik', pruefung: 'Klausur und Programmierprojekt', teilnehmer: 284,
      beschreibung: 'Von der ersten Schleife bis zu Objekten: Grundlagen der Programmierung mit vielen Übungsaufgaben.',
      plan: [V(1, '09:00', '10:30', 'Hörsaal 7'), S(4, '15:00', '16:30', 'Rechnerpool 2', 'Übung')] },
    { slug: 'mathematik-informatik', name: 'Mathematik für Informatiker', kuerzel: 'MAFI', dozent: 'Dr. Sander',
      farbe: 'tinte', ects: 8, semester: 1, studiengang: 'ul-informatik', pruefung: 'Klausur, 120 Minuten', teilnehmer: 271,
      beschreibung: 'Diskrete Strukturen, Logik, Mengen, Relationen und lineare Algebra.',
      plan: [V(2, '08:30', '10:00', 'Hörsaal 7')] },
    { slug: 'algorithmen-datenstrukturen', name: 'Algorithmen und Datenstrukturen', kuerzel: 'ALGO', dozent: 'Prof. Roth',
      farbe: 'koralle', ects: 8, semester: 2, studiengang: 'ul-informatik', pruefung: 'Klausur, 120 Minuten', teilnehmer: 238,
      beschreibung: 'Sortier- und Suchverfahren, Bäume, Graphen und die Analyse von Laufzeiten.',
      plan: [V(3, '10:15', '11:45', 'Hörsaal 7')] },
    { slug: 'datenbanken', name: 'Datenbanken', kuerzel: 'DB', dozent: 'Prof. Keller',
      farbe: 'senf', ects: 6, semester: 3, studiengang: 'ul-informatik', pruefung: 'Klausur, 90 Minuten', teilnehmer: 192,
      beschreibung: 'Relationales Modell, SQL, Normalformen und Transaktionen.',
      plan: [V(2, '10:15', '11:45', 'Hörsaal 8')] },
    { slug: 'rechnernetze', name: 'Rechnernetze', kuerzel: 'NETZ', dozent: 'Dr. Fuchs',
      farbe: 'tinte', ects: 6, semester: 3, studiengang: 'ul-informatik', pruefung: 'Klausur, 90 Minuten', teilnehmer: 184,
      beschreibung: 'Schichtenmodelle, Adressierung, Routing und die Protokolle des Internets.',
      plan: [V(3, '14:00', '15:30', 'Hörsaal 8')] },
    { slug: 'softwaretechnik', name: 'Softwaretechnik', kuerzel: 'SWT', dozent: 'Prof. Roth',
      farbe: 'tanne', ects: 6, semester: 3, studiengang: 'ul-informatik', pruefung: 'Projektarbeit', teilnehmer: 176,
      beschreibung: 'Anforderungen, Entwurfsmuster, Testen und die Arbeit im Team.',
      plan: [S(4, '10:15', '11:45', 'Seminarraum 7.02')] },
    { slug: 'theoretische-informatik', name: 'Theoretische Informatik', kuerzel: 'THEO', dozent: 'Dr. Sander',
      farbe: 'pflaume', ects: 6, semester: 3, studiengang: 'ul-informatik', pruefung: 'Klausur, 120 Minuten', teilnehmer: 168,
      beschreibung: 'Automaten, formale Sprachen, Berechenbarkeit und Komplexität.',
      plan: [V(5, '08:30', '10:00', 'Hörsaal 7')] },

    /* ------------- Psychologie ------------- */
    { slug: 'psych-allgemeine', name: 'Allgemeine Psychologie I', kuerzel: 'APSY', dozent: 'Prof. Vogel',
      farbe: 'pflaume', ects: 6, semester: 1, studiengang: 'ul-psychologie', pruefung: 'Klausur, 90 Minuten', teilnehmer: 164,
      beschreibung: 'Wahrnehmung, Aufmerksamkeit, Lernen und Gedächtnis.',
      plan: [V(1, '10:15', '11:45', 'Hörsaal 9')] },
    { slug: 'psych-forschungsmethoden', name: 'Einführung in die Forschungsmethoden', kuerzel: 'FOME', dozent: 'Dr. Brandt',
      farbe: 'tinte', ects: 6, semester: 1, studiengang: 'ul-psychologie', pruefung: 'Klausur, 90 Minuten', teilnehmer: 158,
      beschreibung: 'Versuchsplanung, Gütekriterien und wissenschaftliches Arbeiten.',
      plan: [V(3, '08:30', '10:00', 'Hörsaal 9')] },
    { slug: 'psych-statistik-1', name: 'Statistik I', kuerzel: 'STA I', dozent: 'Dr. Brandt',
      farbe: 'koralle', ects: 6, semester: 2, studiengang: 'ul-psychologie', pruefung: 'Klausur, 90 Minuten', teilnehmer: 151,
      beschreibung: 'Deskriptive Statistik und Wahrscheinlichkeitsrechnung für psychologische Daten.',
      plan: [V(2, '10:15', '11:45', 'Hörsaal 9')] },
    { slug: 'psych-statistik-2', name: 'Statistik II', kuerzel: 'STA II', dozent: 'Dr. Brandt',
      farbe: 'koralle', ects: 6, semester: 3, studiengang: 'ul-psychologie', pruefung: 'Klausur, 90 Minuten', teilnehmer: 147,
      beschreibung: 'Varianzanalyse, Regression und Testverfahren, gerechnet an Beispieldatensätzen.',
      plan: [V(2, '10:15', '11:45', 'Hörsaal 9'), S(4, '14:00', '15:30', 'Rechnerpool 3', 'Übung')] },
    { slug: 'psych-entwicklung', name: 'Entwicklungspsychologie', kuerzel: 'EPSY', dozent: 'Prof. Neubert',
      farbe: 'tanne', ects: 5, semester: 3, studiengang: 'ul-psychologie', pruefung: 'Klausur, 90 Minuten', teilnehmer: 139,
      beschreibung: 'Entwicklung über die Lebensspanne, von der frühen Kindheit bis ins hohe Alter.',
      plan: [V(4, '12:00', '13:30', 'Hörsaal 9')] },
    { slug: 'psych-sozial', name: 'Sozialpsychologie', kuerzel: 'SOZ', dozent: 'Prof. Vogel',
      farbe: 'senf', ects: 5, semester: 3, studiengang: 'ul-psychologie', pruefung: 'Hausarbeit', teilnehmer: 134,
      beschreibung: 'Einstellungen, Gruppenprozesse und soziale Wahrnehmung.',
      plan: [S(3, '14:00', '15:30', 'Seminarraum 9.01')] },
    { slug: 'psych-diagnostik', name: 'Diagnostik', kuerzel: 'DIAG', dozent: 'Dr. Ritter',
      farbe: 'rost', ects: 6, semester: 3, studiengang: 'ul-psychologie', pruefung: 'Klausur, 90 Minuten', teilnehmer: 128,
      beschreibung: 'Testtheorie, Gütekriterien und der Einsatz psychologischer Verfahren.',
      plan: [V(5, '10:15', '11:45', 'Hörsaal 9')] },

    /* ------------- Lehramt · Bildungswissenschaften -------------
       Gelten fuer jede Schulart, deshalb lehramtstyp: null. */
    { slug: 'la-biwi-einfuehrung', name: 'Einführung in die Bildungswissenschaften', kuerzel: 'BIWI', dozent: 'Prof. Hoffmann',
      farbe: 'tanne', ects: 5, semester: 1, studiengang: 'ul-lehramt', gruppe: 'bildungswissenschaften',
      pruefung: 'Klausur, 90 Minuten', teilnehmer: 276,
      beschreibung: 'Schule als Institution, Bildungssystem, Lehrerberuf und die Grundbegriffe der Erziehungswissenschaft.',
      plan: [V(1, '10:15', '11:45', 'Hörsaal 5')] },
    { slug: 'la-allgemeine-paedagogik', name: 'Allgemeine Pädagogik', kuerzel: 'APÄD', dozent: 'Dr. Sommer',
      farbe: 'oliv', ects: 5, semester: 1, studiengang: 'ul-lehramt', gruppe: 'bildungswissenschaften',
      pruefung: 'Hausarbeit', teilnehmer: 254,
      beschreibung: 'Erziehungsbegriffe, pädagogische Anthropologie und die Klassiker der Pädagogik.',
      plan: [S(3, '08:30', '10:00', 'Seminarraum 4.02')] },
    { slug: 'la-paedagogische-psychologie', name: 'Pädagogische Psychologie', kuerzel: 'PPSY', dozent: 'Prof. Neubert',
      farbe: 'pflaume', ects: 5, semester: 2, studiengang: 'ul-lehramt', gruppe: 'bildungswissenschaften',
      pruefung: 'Klausur, 90 Minuten', teilnehmer: 241,
      beschreibung: 'Lernen, Motivation und Leistungsbewertung aus psychologischer Sicht.',
      plan: [V(2, '12:00', '13:30', 'Hörsaal 5')] },
    { slug: 'la-schulpaedagogik', name: 'Schulpädagogik', kuerzel: 'SCHP', dozent: 'Dr. Sommer',
      farbe: 'terrakotta', ects: 5, semester: 3, studiengang: 'ul-lehramt', gruppe: 'bildungswissenschaften',
      pruefung: 'Portfolio', teilnehmer: 198,
      beschreibung: 'Unterrichtsplanung, Klassenführung und Umgang mit heterogenen Lerngruppen.',
      plan: [S(2, '10:15', '11:45', 'Seminarraum 4.02')] },
    { slug: 'la-entwicklungspsychologie', name: 'Entwicklung und Lernen', kuerzel: 'ENTW', dozent: 'Prof. Neubert',
      farbe: 'pflaume', ects: 5, semester: 3, studiengang: 'ul-lehramt', gruppe: 'bildungswissenschaften',
      pruefung: 'Klausur, 90 Minuten', teilnehmer: 213,
      beschreibung: 'Kognitive, soziale und emotionale Entwicklung von Kindern und Jugendlichen.',
      plan: [V(3, '12:00', '13:30', 'Hörsaal 5')] },
    { slug: 'la-inklusion', name: 'Inklusion und Heterogenität', kuerzel: 'INKL', dozent: 'Dr. Lehmann',
      farbe: 'senf', ects: 5, semester: 4, studiengang: 'ul-lehramt', gruppe: 'bildungswissenschaften',
      pruefung: 'Hausarbeit', teilnehmer: 142,
      beschreibung: 'Umgang mit Vielfalt im Klassenzimmer, sonderpädagogische Grundlagen und Nachteilsausgleich.',
      plan: [S(5, '10:15', '11:45', 'Seminarraum 4.05')] },

    /* ------------- Lehramt · Schulpraktische Studien ------------- */
    { slug: 'la-schulpraktische-studien', name: 'Schulpraktische Studien', kuerzel: 'SPS', dozent: 'Frau Bauer',
      farbe: 'tanne', ects: 10, semester: 3, studiengang: 'ul-lehramt', gruppe: 'praktikum',
      pruefung: 'Praktikumsbericht', teilnehmer: 96,
      beschreibung: 'Hospitation und eigene Unterrichtsversuche an einer Praktikumsschule, begleitet durch ein Seminar.',
      plan: [S(4, '08:00', '11:15', 'Praktikumsschule', 'Praktikumstag')] }
  ];
  /* --- ENDE module --- */

  /* ------------- Lehramt · Fach- und Lernbereichsmodule -------------

     Diese Module entstehen aus den Faechern in hochschuldaten.js. Ein
     Lehramtsstudent bekommt sie nur fuer die Faecher, die er im
     Onboarding gewaehlt hat.

     Bewusst OHNE Dozent und OHNE Raum: die echten Namen stehen in den
     Modulhandbuechern und Vorlesungsverzeichnissen der Hochschule, die
     hier nicht abrufbar sind. Statt sie zu erfinden, bleiben die Felder
     leer, und die Oberflaeche sagt das. */

  var LB = { 'gsd-deutsch': 1, 'gsd-mathematik': 3, 'gsd-sachunterricht': 5 };

  hd.faecher.forEach(function (f, i) {
    if (f.id === 'grundschuldidaktik') return;

    /* Die drei festen Lernbereiche der Grundschuldidaktik gehoeren zur
       Schulart, nicht zu einem gewaehlten Fach. */
    if (LB[f.id]) {
      module.push({
        slug: 'la-lb-' + f.id, name: f.name, kuerzel: 'GSD',
        dozent: null, farbe: farbeFuer(f.id), ects: 5, semester: 3,
        studiengang: 'ul-lehramt', lehramtstyp: 'ul-la-grundschule', gruppe: 'schulart',
        pruefung: null, teilnehmer: null,
        beschreibung: 'Lernbereich der Grundschuldidaktik. Alle Studierenden im Lehramt an Grundschulen belegen ihn, unabhängig vom Kernfach.',
        plan: [S(LB[f.id], '10:15', '11:45', null)]
      });
      return;
    }

    module.push({
      slug: 'la-fw-' + f.id, name: 'Fachwissenschaft ' + f.name, kuerzel: 'FW',
      dozent: null, farbe: farbeFuer(f.id), ects: 10, semester: 3,
      studiengang: 'ul-lehramt', fach: f.id, gruppe: 'fachwissenschaft',
      pruefung: null, teilnehmer: null,
      beschreibung: 'Fachwissenschaftlicher Teil des Faches ' + f.name + '.',
      plan: [V(1 + (i % 5), '08:30', '10:00', null)]
    });
    module.push({
      slug: 'la-fd-' + f.id, name: 'Fachdidaktik ' + f.name, kuerzel: 'FD',
      dozent: null, farbe: farbeFuer(f.name), ects: 5, semester: 3,
      studiengang: 'ul-lehramt', fach: f.id, gruppe: 'fachdidaktik',
      pruefung: null, teilnehmer: null,
      beschreibung: 'Fachdidaktischer Teil des Faches ' + f.name + ': wie die Inhalte im Unterricht vermittelt werden.',
      plan: [S(1 + ((i + 2) % 5), '12:00', '13:30', null)]
    });
  });

  /* Alles hier ist erfunden. Der Schluessel steht an jedem Datensatz,
     damit die Oberflaeche ihn kennzeichnen kann. */
  module.forEach(function (m) {
    m.herkunft = 'muster';
    if (m.gruppe === undefined) m.gruppe = null;
    if (m.lehramtstyp === undefined) m.lehramtstyp = null;
    if (m.fach === undefined) m.fach = null;
  });

  /* ------------------------------------------------- Verkäufer */

  var verkaeufer = [
    { id: 'v-lena',  name: 'Lena K.',  kuerzel: 'LK', verifiziert: true,  hochschule: 'uni-leipzig', studiengang: 'ul-wiwi',       semester: 5, bewertung: 4.9, anzahlBewertungen: 87, verkaeufe: 214, seit: 'März 2025',     ueber: 'Schreibe seit dem dritten Semester Zusammenfassungen für die Wirtschaftsmodule. Alles selbst getippt, nach jeder Klausur aktualisiert.' },
    { id: 'v-jonas', name: 'Jonas B.', kuerzel: 'JB', verifiziert: true,  hochschule: 'uni-leipzig', studiengang: 'ul-wiwi',       semester: 7, bewertung: 4.7, anzahlBewertungen: 41, verkaeufe: 93,  seit: 'Oktober 2024',  ueber: 'Tabellen, Vorlagen und kleine Werkzeuge für alles, was mit Zahlen zu tun hat.' },
    { id: 'v-sarah', name: 'Sarah M.', kuerzel: 'SM', verifiziert: true,  hochschule: 'uni-leipzig', studiengang: 'ul-wiwi',       semester: 4, bewertung: 4.8, anzahlBewertungen: 63, verkaeufe: 148, seit: 'Januar 2025',   ueber: 'Karteikarten und Lernzettel, gerne auch auf Zuruf für ein bestimmtes Modul.' },
    { id: 'v-tim',   name: 'Tim R.',   kuerzel: 'TR', verifiziert: false, hochschule: 'uni-leipzig', studiengang: 'ul-jura',       semester: 6, bewertung: 4.4, anzahlBewertungen: 12, verkaeufe: 19,  seit: 'Juni 2026',     ueber: 'Juristische Grundlagen für Wirtschaftsstudenten.' },
    { id: 'v-anna',  name: 'Anna W.',  kuerzel: 'AW', verifiziert: true,  hochschule: 'uni-leipzig', studiengang: 'ul-psychologie', semester: 8, bewertung: 5.0, anzahlBewertungen: 29, verkaeufe: 52, seit: 'April 2025',    ueber: 'Statistik-Nachhilfe und Korrekturlesen. Ich erkläre lieber zweimal als einmal zu schnell.' },
    { id: 'v-mara',  name: 'Mara S.',  kuerzel: 'MS', verifiziert: true,  hochschule: 'uni-leipzig', studiengang: 'ul-lehramt',    semester: 6, bewertung: 4.9, anzahlBewertungen: 34, verkaeufe: 71,  seit: 'November 2024', ueber: 'Lehramt an Gymnasien, Deutsch und Geschichte. Ich teile meine Mitschriften und Unterrichtsentwürfe aus den ersten Praktika.' },
    { id: 'v-david', name: 'David P.', kuerzel: 'DP', verifiziert: true,  hochschule: 'uni-leipzig', studiengang: 'ul-informatik',  semester: 5, bewertung: 4.8, anzahlBewertungen: 26, verkaeufe: 58, seit: 'Februar 2025',  ueber: 'Karteikarten und Spickzettel für die Grundlagenmodule. Kurz halten ist die halbe Arbeit.' }
  ];

  /* ------------------------------------------------- Materialien */

  /* --- SLUGS materialien --- */
  var materialien = [
    { slug: 'formelsammlung-statistik-2', titel: 'Formelsammlung Statistik II', typ: 'formelsammlung',
      modul: 'statistik-2', verkaeufer: 'v-lena', preis: 2.99, bewertung: 4.9, anzahlBewertungen: 63,
      dateityp: 'PDF', umfang: '18 Seiten', aktualisiert: iso(plus(heute(), -12)), semester: 3, verkaeufe: 210, vorschau: true,
      beschreibung: 'Alle Formeln der Vorlesung auf 18 Seiten, sortiert nach Kapitel. Enthält Schätzer, Testverfahren, Verteilungstabellen und die Rechenwege, die in der Klausur verlangt werden.',
      vorschauText: 'Kapitel 3 · Hypothesentests\n\nEin Test prüft eine Annahme über die Grundgesamtheit anhand einer Stichprobe. Die Nullhypothese H0 wird beibehalten, solange die Daten nicht deutlich dagegen sprechen.\n\nEinstichproben-t-Test: t = (x̄ − μ0) / (s / √n)\nFreiheitsgrade: df = n − 1',
      rezensionen: [
        { von: 'Paul H.', sterne: 5, datum: iso(plus(heute(), -9)),  text: 'Hat mir die halbe Klausurvorbereitung abgenommen. Die Verteilungstabellen hinten sind Gold wert.' },
        { von: 'Miriam T.', sterne: 5, datum: iso(plus(heute(), -21)), text: 'Sauber sortiert, nichts Überflüssiges.' },
        { von: 'Kevin S.', sterne: 4, datum: iso(plus(heute(), -34)), text: 'Sehr gut, hätte mir bei der Regression noch ein Beispiel gewünscht.' }
      ] },
    { slug: 'klausurzusammenfassung-statistik-2', titel: 'Klausurzusammenfassung Statistik II', typ: 'zusammenfassung',
      modul: 'statistik-2', verkaeufer: 'v-lena', preis: 5.99, bewertung: 4.8, anzahlBewertungen: 41,
      dateityp: 'PDF', umfang: '42 Seiten', aktualisiert: iso(plus(heute(), -5)), semester: 3, verkaeufe: 134, vorschau: true,
      beschreibung: 'Die komplette Vorlesung in einem Dokument: Definitionen, Rechenwege, typische Klausuraufgaben mit Lösung.',
      vorschauText: 'Inhalt\n\n1. Punktschätzung\n2. Konfidenzintervalle\n3. Hypothesentests\n4. Chi-Quadrat-Verfahren\n5. Einfache lineare Regression\n\nKapitel 1 · Punktschätzung\nEin Schätzer heißt erwartungstreu, wenn sein Erwartungswert dem wahren Parameter entspricht.',
      rezensionen: [
        { von: 'Nele F.', sterne: 5, datum: iso(plus(heute(), -3)),  text: 'Besser als mein eigenes Mitgeschriebenes.' },
        { von: 'Ali D.', sterne: 5, datum: iso(plus(heute(), -16)), text: 'Klar geschrieben, keine unnötigen Umwege.' }
      ] },
    { slug: 'marketing-lernzettel', titel: 'Marketing Lernzettel', typ: 'lernzettel',
      modul: 'marketing', verkaeufer: 'v-sarah', preis: 4.49, bewertung: 4.7, anzahlBewertungen: 38,
      dateityp: 'PDF', umfang: '31 Seiten', aktualisiert: iso(plus(heute(), -19)), semester: 3, verkaeufe: 97, vorschau: true,
      beschreibung: 'Kompakte Zusammenfassung aller Vorlesungsteile, mit Merksätzen und einer Übersicht der Modelle.',
      vorschauText: 'Positionierung\n\nEine Marke besetzt im Kopf der Kundschaft genau eine Aussage. Wer zwei besetzen will, besetzt keine.\n\nDrei Fragen:\n1. Für wen?\n2. Statt wem?\n3. Warum glaubwürdig?',
      rezensionen: [{ von: 'Jana L.', sterne: 5, datum: iso(plus(heute(), -11)), text: 'Genau richtig für die Woche vor der Abgabe.' }] },
    { slug: 'karteikarten-statistik-2', titel: 'Karteikarten Statistik II · 180 Karten', typ: 'karteikarten',
      modul: 'statistik-2', verkaeufer: 'v-sarah', preis: 3.49, bewertung: 4.6, anzahlBewertungen: 24,
      dateityp: 'PDF und CSV', umfang: '180 Karten', aktualisiert: iso(plus(heute(), -26)), semester: 3, verkaeufe: 61, vorschau: true,
      beschreibung: 'Begriffe und Formeln als Frage-Antwort-Karten. Die CSV-Datei lässt sich in gängige Lern-Apps einlesen.',
      vorschauText: 'Vorderseite: Wann ist ein Schätzer konsistent?\nRückseite: Wenn er mit wachsendem Stichprobenumfang gegen den wahren Parameter konvergiert.',
      rezensionen: [{ von: 'Sophie R.', sterne: 5, datum: iso(plus(heute(), -14)), text: 'Für unterwegs perfekt.' }] },
    { slug: 'uebungsaufgaben-iuf', titel: 'Übungsaufgaben Investition mit Lösungsweg', typ: 'uebungsaufgaben',
      modul: 'investition-finanzierung', verkaeufer: 'v-jonas', preis: 4.99, bewertung: 4.8, anzahlBewertungen: 19,
      dateityp: 'PDF', umfang: '26 Seiten', aktualisiert: iso(plus(heute(), -8)), semester: 3, verkaeufe: 44, vorschau: true,
      beschreibung: '40 gerechnete Aufgaben zur Kapitalwertmethode, internen Zinsfuß und Annuität.',
      vorschauText: 'Aufgabe 7\n\nEine Maschine kostet 80.000 EUR und liefert vier Jahre lang 25.000 EUR Rückfluss. Kalkulationszins 6 Prozent.\n\nKapitalwert = −80.000 + 25.000 · Rentenbarwertfaktor(6 %, 4 Jahre)',
      rezensionen: [{ von: 'Marek P.', sterne: 5, datum: iso(plus(heute(), -6)), text: 'Der Rechenweg ist wirklich vollständig.' }] },
    { slug: 'excel-vorlage-investition', titel: 'Excel-Vorlage Investitionsrechnung', typ: 'vorlage',
      modul: 'investition-finanzierung', verkaeufer: 'v-jonas', preis: 6.99, bewertung: 4.7, anzahlBewertungen: 15,
      dateityp: 'XLSX', umfang: '6 Tabellenblätter', aktualisiert: iso(plus(heute(), -40)), semester: null, verkaeufe: 38, vorschau: false,
      beschreibung: 'Fertige Tabelle für Kapitalwert, Annuität und Amortisation. Formeln sind sichtbar und nicht gesperrt.',
      rezensionen: [{ von: 'Lea B.', sterne: 5, datum: iso(plus(heute(), -22)), text: 'Spart in der Übung Zeit.' }] },
    { slug: 'zusammenfassung-wirtschaftsrecht', titel: 'Zusammenfassung Wirtschaftsrecht', typ: 'zusammenfassung',
      modul: 'wirtschaftsrecht', verkaeufer: 'v-tim', preis: 4.99, bewertung: 4.4, anzahlBewertungen: 11,
      dateityp: 'PDF', umfang: '35 Seiten', aktualisiert: iso(plus(heute(), -55)), semester: 3, verkaeufe: 27, vorschau: true,
      beschreibung: 'Vertragsrecht, Handelsrecht und Gesellschaftsformen in einer Übersicht.',
      vorschauText: 'Kaufvertrag, § 433 BGB\n\nDer Verkäufer schuldet Übergabe und Eigentumsverschaffung, der Käufer Zahlung und Abnahme.',
      rezensionen: [{ von: 'Ben O.', sterne: 4, datum: iso(plus(heute(), -30)), text: 'Solide. Beim Gesellschaftsrecht wird es etwas schnell.' }] },
    { slug: 'hausarbeit-markenpositionierung', titel: 'Hausarbeit: Markenpositionierung im Mittelstand', typ: 'hausarbeit',
      modul: 'marketing', verkaeufer: 'v-lena', preis: 8.99, bewertung: 4.5, anzahlBewertungen: 8,
      dateityp: 'PDF', umfang: '22 Seiten', aktualisiert: iso(plus(heute(), -70)), semester: 2, verkaeufe: 16, vorschau: true, geprueft: true,
      beschreibung: 'Mit 1,3 bewertete Hausarbeit aus dem Vorjahr. Gedacht als Beispiel für Aufbau, Zitierweise und Argumentation.',
      vorschauText: 'Gliederung\n\n1. Einleitung\n2. Begriff der Positionierung\n3. Besonderheiten mittelständischer Marken\n4. Fallbeispiel\n5. Fazit',
      rezensionen: [{ von: 'Clara N.', sterne: 5, datum: iso(plus(heute(), -44)), text: 'Als Orientierung für den Aufbau sehr hilfreich.' }] },
    { slug: 'praesentationsvorlage', titel: 'Präsentationsvorlage für Seminararbeiten', typ: 'vorlage',
      modul: null, verkaeufer: 'v-jonas', preis: 3.99, bewertung: 4.6, anzahlBewertungen: 22,
      dateityp: 'PPTX und ODP', umfang: '14 Folien', aktualisiert: iso(plus(heute(), -33)), semester: null, verkaeufe: 71, vorschau: true,
      beschreibung: 'Schlichte Vorlage ohne Effekte: Titel, Gliederung, Inhalt, Diagramm, Quellen.',
      vorschauText: 'Folie 3 · Aufbau\n\nEine Aussage pro Folie. Die Überschrift ist die Aussage, nicht das Thema.',
      rezensionen: [{ von: 'Ida W.', sterne: 5, datum: iso(plus(heute(), -17)), text: 'Endlich mal ohne bunte Farbverläufe.' }] },
    { slug: 'lernplan-vorlage', titel: 'Lernplan-Vorlage für die Klausurphase', typ: 'tool',
      modul: null, verkaeufer: 'v-sarah', preis: 2.49, bewertung: 4.5, anzahlBewertungen: 17,
      dateityp: 'XLSX', umfang: '3 Tabellenblätter', aktualisiert: iso(plus(heute(), -48)), semester: null, verkaeufe: 55, vorschau: false,
      beschreibung: 'Trägt die Klausurtermine ein und verteilt die Themen rückwärts auf die verbleibenden Wochen.',
      rezensionen: [{ von: 'Robin E.', sterne: 4, datum: iso(plus(heute(), -25)), text: 'Simpel, aber genau deshalb benutze ich sie.' }] },

    /* --- Lehramt --- */
    { slug: 'zusammenfassung-bildungswissenschaften', titel: 'Zusammenfassung Bildungswissenschaften', typ: 'zusammenfassung',
      modul: 'la-biwi-einfuehrung', verkaeufer: 'v-mara', preis: 4.99, bewertung: 4.8, anzahlBewertungen: 29,
      dateityp: 'PDF', umfang: '38 Seiten', aktualisiert: iso(plus(heute(), -15)), semester: 1, verkaeufe: 88, vorschau: true,
      beschreibung: 'Die Einführungsvorlesung in einem Dokument: Bildungssystem, Schultheorien, Professionalisierung.',
      vorschauText: 'Funktionen von Schule nach Fend\n\nQualifikation, Selektion, Integration und Enkulturation. Die vier Funktionen stehen in Spannung zueinander.',
      rezensionen: [{ von: 'Frieda M.', sterne: 5, datum: iso(plus(heute(), -10)), text: 'Die Übersicht der Theorien am Ende ist sehr gut.' }] },
    { slug: 'lernzettel-entwicklungspsychologie', titel: 'Lernzettel Entwicklung und Lernen', typ: 'lernzettel',
      modul: 'la-entwicklungspsychologie', verkaeufer: 'v-mara', preis: 3.99, bewertung: 4.7, anzahlBewertungen: 21,
      dateityp: 'PDF', umfang: '24 Seiten', aktualisiert: iso(plus(heute(), -7)), semester: 3, verkaeufe: 63, vorschau: true,
      beschreibung: 'Piaget, Erikson, Bindungstheorie und die Entwicklungsaufgaben im Jugendalter, mit Beispielen aus dem Schulalltag.',
      vorschauText: 'Piaget · Stadien der kognitiven Entwicklung\n\n1. sensomotorisch (0–2)\n2. präoperational (2–7)\n3. konkret-operational (7–11)\n4. formal-operational (ab 11)',
      rezensionen: [{ von: 'Lars B.', sterne: 5, datum: iso(plus(heute(), -4)), text: 'Kompakt und trotzdem vollständig.' }] },
    { slug: 'unterrichtsentwurf-vorlage', titel: 'Vorlage für den Unterrichtsentwurf', typ: 'vorlage',
      modul: null, verkaeufer: 'v-mara', preis: 3.49, bewertung: 4.9, anzahlBewertungen: 18,
      dateityp: 'DOCX und ODT', umfang: '9 Seiten', aktualisiert: iso(plus(heute(), -20)), semester: null, verkaeufe: 74, vorschau: true,
      beschreibung: 'Gerüst mit Bedingungsanalyse, Sachanalyse, didaktischer Analyse, Verlaufsplan und Literatur.',
      vorschauText: 'Verlaufsplan\n\nPhase | Zeit | Lehrerhandlung | Schülerhandlung | Sozialform | Medien\nEinstieg | 5 min | … | … | Plenum | Tafel',
      rezensionen: [{ von: 'Nora K.', sterne: 5, datum: iso(plus(heute(), -12)), text: 'Genau die Struktur, die im Seminar verlangt wird.' }] },
    { slug: 'lernzettel-sprachwissenschaft', titel: 'Lernzettel Sprachwissenschaft', typ: 'lernzettel',
      modul: 'la-fw-deutsch', verkaeufer: 'v-mara', preis: 3.99, bewertung: 4.6, anzahlBewertungen: 14,
      dateityp: 'PDF', umfang: '27 Seiten', aktualisiert: iso(plus(heute(), -31)), semester: 3, verkaeufe: 41, vorschau: true,
      beschreibung: 'Phonologie, Morphologie und Syntax mit Baumdiagrammen und Analysebeispielen.',
      vorschauText: 'Morphologie\n\nMorphem = kleinste bedeutungstragende Einheit.\nfrei: Haus · gebunden: -lich, un-\nDerivation verändert die Wortart, Flexion nicht.',
      rezensionen: [{ von: 'Timo H.', sterne: 5, datum: iso(plus(heute(), -18)), text: 'Die Baumdiagramme sind endlich mal verständlich.' }] },
    { slug: 'unterrichtsentwuerfe-deutsch', titel: 'Drei Unterrichtsentwürfe Deutsch, Sekundarstufe', typ: 'vorlage',
      modul: 'la-fd-deutsch', verkaeufer: 'v-mara', preis: 5.49, bewertung: 4.8, anzahlBewertungen: 12,
      dateityp: 'PDF', umfang: '31 Seiten', aktualisiert: iso(plus(heute(), -9)), semester: 3, verkaeufe: 37, vorschau: true,
      beschreibung: 'Drei vollständige Entwürfe aus dem Praktikum, jeweils mit Verlaufsplan, Material und Rückmeldung der Mentorin. Als Beispiel gedacht, nicht zum Abschreiben.',
      vorschauText: 'Entwurf 2 · Kurzgeschichte, Klasse 8\n\nEinstieg: Standbild zur Schlüsselszene\nErarbeitung: Textarbeit in Partnerarbeit\nSicherung: Schreibgespräch an der Tafel',
      rezensionen: [{ von: 'Yannik P.', sterne: 5, datum: iso(plus(heute(), -5)), text: 'Sehr hilfreich vor dem ersten eigenen Entwurf.' }] },
    { slug: 'uebungsaufgaben-analysis', titel: 'Übungsaufgaben Analysis mit Lösungen', typ: 'uebungsaufgaben',
      modul: 'la-fw-mathematik', verkaeufer: 'v-david', preis: 5.49, bewertung: 4.7, anzahlBewertungen: 16,
      dateityp: 'PDF', umfang: '34 Seiten', aktualisiert: iso(plus(heute(), -9)), semester: 3, verkaeufe: 39, vorschau: true,
      beschreibung: 'Aufgaben zu Integralen, Reihen und mehrdimensionaler Differentialrechnung, jeweils mit Lösungsweg.',
      vorschauText: 'Aufgabe 12\n\nUntersuche die Reihe auf Konvergenz: Summe über 1/(n·ln n) für n ≥ 2.\n\nAnsatz: Integralkriterium.',
      rezensionen: [{ von: 'Pia S.', sterne: 5, datum: iso(plus(heute(), -5)), text: 'Deckt sich fast eins zu eins mit den Übungsblättern.' }] },

    /* --- Informatik --- */
    { slug: 'karteikarten-algorithmen', titel: 'Karteikarten Algorithmen · 140 Karten', typ: 'karteikarten',
      modul: 'algorithmen-datenstrukturen', verkaeufer: 'v-david', preis: 3.49, bewertung: 4.8, anzahlBewertungen: 23,
      dateityp: 'PDF und CSV', umfang: '140 Karten', aktualisiert: iso(plus(heute(), -13)), semester: 2, verkaeufe: 67, vorschau: true,
      beschreibung: 'Laufzeiten, Datenstrukturen und Verfahren als Frage-Antwort-Karten.',
      vorschauText: 'Vorderseite: Laufzeit von Quicksort im schlechtesten Fall?\nRückseite: O(n²), wenn das Pivot immer das Minimum oder Maximum ist. Im Mittel O(n log n).',
      rezensionen: [{ von: 'Ole R.', sterne: 5, datum: iso(plus(heute(), -8)), text: 'Perfekt für die Straßenbahn.' }] },
    { slug: 'zusammenfassung-datenbanken', titel: 'Zusammenfassung Datenbanken', typ: 'zusammenfassung',
      modul: 'datenbanken', verkaeufer: 'v-david', preis: 4.99, bewertung: 4.7, anzahlBewertungen: 19,
      dateityp: 'PDF', umfang: '33 Seiten', aktualisiert: iso(plus(heute(), -6)), semester: 3, verkaeufe: 52, vorschau: true,
      beschreibung: 'Relationales Modell, SQL, Normalformen und Transaktionen, mit den Beispielabfragen aus der Übung.',
      vorschauText: 'Dritte Normalform\n\nEine Relation ist in 3NF, wenn sie in 2NF ist und kein Nichtschlüsselattribut transitiv vom Schlüssel abhängt.',
      rezensionen: [{ von: 'Hanna V.', sterne: 5, datum: iso(plus(heute(), -3)), text: 'Die Normalformen sind hier zum ersten Mal klar geworden.' }] },

    /* --- Psychologie --- */
    { slug: 'formelsammlung-statistik-psych', titel: 'Formelsammlung Statistik II · Psychologie', typ: 'formelsammlung',
      modul: 'psych-statistik-2', verkaeufer: 'v-anna', preis: 2.99, bewertung: 4.9, anzahlBewertungen: 27,
      dateityp: 'PDF', umfang: '16 Seiten', aktualisiert: iso(plus(heute(), -11)), semester: 3, verkaeufe: 81, vorschau: true,
      beschreibung: 'Varianzanalyse, Regression und Effektstärken auf 16 Seiten.',
      vorschauText: 'Einfaktorielle ANOVA\n\nSS_total = SS_zwischen + SS_innerhalb\nF = MS_zwischen / MS_innerhalb\nη² = SS_zwischen / SS_total',
      rezensionen: [{ von: 'Malte D.', sterne: 5, datum: iso(plus(heute(), -7)), text: 'Genau die Formeln, die erlaubt sind.' }] },
    { slug: 'zusammenfassung-sozialpsychologie', titel: 'Zusammenfassung Sozialpsychologie', typ: 'zusammenfassung',
      modul: 'psych-sozial', verkaeufer: 'v-anna', preis: 4.49, bewertung: 4.8, anzahlBewertungen: 15,
      dateityp: 'PDF', umfang: '29 Seiten', aktualisiert: iso(plus(heute(), -24)), semester: 3, verkaeufe: 44, vorschau: true,
      beschreibung: 'Klassische Studien, Einstellungsforschung und Gruppenprozesse.',
      vorschauText: 'Kognitive Dissonanz\n\nFestinger 1957: Widersprüchliche Kognitionen erzeugen einen unangenehmen Spannungszustand.',
      rezensionen: [{ von: 'Ruth A.', sterne: 5, datum: iso(plus(heute(), -19)), text: 'Sehr gut für die Hausarbeit zu nutzen.' }] }
  ];
  /* --- ENDE materialien --- */

  /* ------------------------------------------------- Services */

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
      anbieter: 'v-david', module: ['la-fw-mathematik', 'mathematik-informatik', 'wirtschaftsmathematik'],
      preis: 20, einheit: 'Stunde', bewertung: 4.8, anzahlBewertungen: 21, ort: 'Online oder Bibliothek',
      beschreibung: 'Grenzwerte, Integrale, Beweise: wir gehen deine Übungsblätter durch und ich zeige dir, wie man den Ansatz findet. Auch für Lehramt.' },
    { slug: 'nachhilfe-programmierung', titel: 'Hilfe beim Programmierprojekt', kategorie: 'Programmierung',
      anbieter: 'v-david', module: ['programmierung', 'algorithmen-datenstrukturen', 'softwaretechnik'],
      preis: 24, einheit: 'Stunde', bewertung: 4.9, anzahlBewertungen: 17, ort: 'Online',
      beschreibung: 'Wir setzen uns an deinen Code, suchen den Fehler gemeinsam und ich erkläre, warum er entstanden ist. Keine fertigen Lösungen.' },
    { slug: 'unterrichtsentwurf-feedback', titel: 'Feedback zum Unterrichtsentwurf', kategorie: 'Feedback',
      anbieter: 'v-mara', module: ['la-fd-deutsch', 'la-fd-geschichte', 'la-fd-mathematik', 'la-schulpaedagogik', 'la-schulpraktische-studien'],
      preis: 18, einheit: 'Entwurf', bewertung: 4.9, anzahlBewertungen: 11, ort: 'Online',
      beschreibung: 'Ich lese deinen Entwurf gegen die Kriterien des Seminars: Bedingungsanalyse, didaktische Reduktion, Verlaufsplan. Rückmeldung als Kommentar im Dokument.' }
  ];
  /* --- ENDE services --- */

  /* ------------------------------------------------- Flohmarkt

     Nur die eigene Hochschule. Keine Zahlung ueber die Plattform. */

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
    { slug: 'kinderbuch-sammlung', titel: 'Kiste mit Kinder- und Jugendbüchern', preis: 20, kategorie: 'Bücher',
      zustand: 'Gut', verkaeufer: 'v-mara', hochschule: 'uni-leipzig', eingestellt: iso(plus(heute(), -7)), ort: 'Lindenau', farbe: 'tinte',
      beschreibung: 'Rund 30 Titel aus dem Literaturseminar, viele davon Klassiker für die Sekundarstufe I. Nur zusammen.' }
  ];
  /* --- ENDE flohmarkt --- */

  /* ------------------------------------------------- Campus

     Zwei Sorten, klar getrennt:

     1. herkunft 'muster' — erfundene Meldungen ohne Adresse. Sie zeigen,
        wie der Bereich aussieht, und werden als Musterdaten
        gekennzeichnet.
     2. herkunft 'recherchiert' — Wegweiser auf die echte Startseite der
        Hochschule. Sie behaupten nichts, sondern sagen, wo die
        verbindlichen Angaben stehen. Nur diese tragen eine Adresse. */

  var campus = [
    { slug: 'bibliothek-laenger', hochschule: null, art: 'hinweis', herkunft: 'muster',
      titel: 'Bibliothek heute länger geöffnet', datum: iso(heute()),
      text: 'Die Campus-Bibliothek schließt in der Prüfungsphase erst um 22:00 Uhr statt um 20:00 Uhr. Das gilt bis Ende des Monats, auch am Wochenende.',
      quelle: { name: 'Universitätsbibliothek' } },
    { slug: 'hochschulsport-kurse', hochschule: null, art: 'angebot', herkunft: 'muster',
      titel: 'Hochschulsport öffnet neue Kurse', datum: iso(plus(heute(), -1)),
      text: 'Ab Montag sind Plätze in Klettern, Volleyball und Yoga frei. Die Anmeldung läuft über das Sportportal.',
      quelle: { name: 'Zentrum für Hochschulsport' } },
    { slug: 'erstsemester-treff', hochschule: null, art: 'event', herkunft: 'muster',
      titel: 'Erstsemester-Treff auf dem Campus', datum: termintag(0, 4),
      text: 'Ab 18:30 Uhr im Innenhof. Die Fachschaft grillt, es gibt eine kurze Campusführung für alle, die noch suchen.',
      quelle: { name: 'Fachschaftsrat' } },
    { slug: 'mensa-preise', hochschule: null, art: 'hinweis', herkunft: 'muster',
      titel: 'Mensa: neue Preise ab dem Wintersemester', datum: iso(plus(heute(), -3)),
      text: 'Das Studentenwerk hebt die Preise für Hauptgerichte an. Der ermäßigte Satz für Studenten bleibt bestehen.',
      quelle: { name: 'Studentenwerk' } },
    { slug: 'karrieretag', hochschule: null, art: 'event', herkunft: 'muster',
      titel: 'Karrieretag auf dem Campus', datum: termintag(2, 4),
      text: 'Rund 40 Unternehmen aus der Region stellen sich vor, Schwerpunkt Praktika und Werkstudentenstellen.',
      quelle: { name: 'Career Service' } },
    { slug: 'wlan-wartung', hochschule: null, art: 'hinweis', herkunft: 'muster',
      titel: 'WLAN am Wochenende zeitweise gestört', datum: iso(plus(heute(), -2)),
      text: 'Am Samstag zwischen 6:00 und 10:00 Uhr wird das Campusnetz gewartet. In dieser Zeit sind die Lernplattform und die Bibliotheksdatenbanken nicht erreichbar.',
      quelle: { name: 'Rechenzentrum' } }
  ];

  /* Je Hochschule ein Wegweiser mit echter Adresse. */
  hd.hochschulen.forEach(function (h) {
    campus.push({
      slug: 'wegweiser-' + h.id, hochschule: h.id, art: 'wegweiser', herkunft: 'recherchiert',
      titel: 'Fristen, Prüfungsordnung und Öffnungszeiten',
      datum: hd.geprueft,
      text: 'Verbindliche Termine, Prüfungsordnungen, Rückmeldefristen und die Öffnungszeiten von Bibliothek und Sekretariaten stehen auf den Seiten deiner Hochschule. Dieser Prototyp gibt sie nicht wieder.',
      quelle: { name: h.name, url: h.web, abgerufen: hd.geprueft }
    });
  });

  /* Studiendokumente der Fakultät als zweiter echter Verweis. */
  campus.push({
    slug: 'studiendokumente-wifa', hochschule: 'uni-leipzig', art: 'wegweiser', herkunft: 'recherchiert',
    titel: 'Studien- und Prüfungsordnungen, Modulbeschreibungen',
    datum: hd.geprueft,
    text: 'Die Wirtschaftswissenschaftliche Fakultät veröffentlicht Studienordnung, Prüfungsordnung, Modulbeschreibungen und den Studienablaufplan öffentlich. Dort stehen die verbindlichen Modulangaben — nicht in diesem Prototyp.',
    quelle: { name: 'Wirtschaftswissenschaftliche Fakultät · Studiendokumente',
      url: 'https://www.wifa.uni-leipzig.de/studium/studienorganisation/studiendokumente', abgerufen: hd.geprueft }
  });

  /* ------------------------------------------------- Feed

     Vier Reichweiten, und genau daraus entsteht die Personalisierung:

       modul        nur fuer Studenten, die dieses Modul belegen
       fach         nur, wenn dieses Fach gewaehlt ist (Lehramt)
       studiengang  fuer alle in diesem Studiengang
       (nichts)     hochschulweit */

  var feed = [
    /* --- Wirtschaftswissenschaften --- */
    { id: 'f-wiwi-1', typ: 'termin', modul: 'statistik-2', amtlich: true,
      titel: 'Raumänderung für die heutige Vorlesung',
      text: 'Statistik II findet heute in Hörsaal 3 statt, nicht wie üblich in Hörsaal 1. Die Übung am Donnerstag bleibt unverändert.',
      zeit: 'vor 2 Stunden', von: 'Prof. Wagner' },
    { id: 'f-wiwi-2', typ: 'hinweis', modul: 'statistik-2', eigen: true,
      titel: 'Übungsblatt 3 ist heute um 18:00 Uhr fällig',
      text: 'Du hast noch einen offenen Punkt auf deiner Checkliste.', zeit: 'heute' },
    { id: 'f-wiwi-3', typ: 'frage', modul: 'marketing',
      titel: 'Welche Themen sind für die Klausur besonders wichtig?',
      text: 'In der letzten Vorlesung war von einem Schwerpunkt die Rede, aber nicht welcher. Weiß jemand mehr?',
      zeit: 'vor 4 Stunden', von: 'Anonym · verifiziert', antworten: 7, hilfreich: 24 },
    { id: 'f-wiwi-4', typ: 'material', modul: 'statistik-2', material: 'klausurzusammenfassung-statistik-2',
      titel: 'Neue Zusammenfassung für Statistik II',
      text: 'Lena K. hat ihre Klausurzusammenfassung überarbeitet, jetzt mit den Aufgaben der letzten Klausur.',
      zeit: 'vor 5 Stunden', von: 'Lena K.' },
    { id: 'f-wiwi-5', typ: 'frage', modul: 'investition-finanzierung',
      titel: 'Rentenbarwertfaktor in Aufgabe 12 — Denkfehler?',
      text: 'Ich komme auf 3,465 statt 3,4651. Rundet ihr vorher oder erst am Ende?',
      zeit: 'gestern', von: 'Marek P.', antworten: 4, hilfreich: 11 },
    { id: 'f-wiwi-6', typ: 'termin', modul: 'wirtschaftsrecht', amtlich: true,
      titel: 'Klausurtermin steht fest',
      text: 'Die Klausur Wirtschaftsrecht ist in vier Wochen, Dienstag um 11:00 Uhr in Hörsaal 1.',
      zeit: 'vor 2 Tagen', von: 'Dr. König' },

    /* --- Lehramt, fachübergreifend --- */
    { id: 'f-la-1', typ: 'termin', modul: 'la-schulpraktische-studien', amtlich: true,
      titel: 'Anmeldung für den Praktikumsblock ist geöffnet',
      text: 'Die Plätze an den Praktikumsschulen werden nach Eingang vergeben. Wer im Block hospitieren möchte, sollte sich diese Woche eintragen.',
      zeit: 'vor 3 Stunden', von: 'Frau Bauer' },
    { id: 'f-la-2', typ: 'frage', modul: 'la-schulpaedagogik',
      titel: 'Hat jemand Literatur für die Hausarbeit zur Klassenführung?',
      text: 'Im Seminar wurden nur zwei Titel genannt, beide sind in der Bibliothek ausgeliehen. Womit habt ihr gearbeitet?',
      zeit: 'vor 6 Stunden', von: 'Anonym · verifiziert', antworten: 9, hilfreich: 31 },
    { id: 'f-la-3', typ: 'hinweis', modul: 'la-entwicklungspsychologie', amtlich: true,
      titel: 'Neue Folien zur Vorlesung stehen online',
      text: 'Die Sitzung zur Bindungstheorie ist ergänzt, inklusive der Grafik, die in der Vorlesung gefehlt hat.',
      zeit: 'gestern', von: 'Prof. Neubert' },
    { id: 'f-la-4', typ: 'material', modul: 'la-entwicklungspsychologie', material: 'lernzettel-entwicklungspsychologie',
      titel: 'Lernzettel zu Entwicklung und Lernen aktualisiert',
      text: 'Mara S. hat die Übersicht zu Piaget und Erikson überarbeitet und Beispiele aus dem Schulalltag ergänzt.',
      zeit: 'vor 2 Tagen', von: 'Mara S.' },
    { id: 'f-la-5', typ: 'hinweis', studiengang: 'ul-lehramt',
      titel: 'Fachschaft sammelt Erfahrungsberichte aus dem Praktikum',
      text: 'Wer schon an einer Schule war, kann kurz aufschreiben, wie die Betreuung lief. Die Sammlung hilft allen, die im nächsten Block dran sind.',
      zeit: 'vor 3 Tagen', von: 'Fachschaftsrat Lehramt', antworten: 6, hilfreich: 19 },

    /* --- Lehramt, fachbezogen --- */
    { id: 'f-la-deu-1', typ: 'frage', modul: 'la-fd-deutsch', fach: 'deutsch',
      titel: 'Wie ausführlich muss die Sachanalyse im Entwurf sein?',
      text: 'Im Beispiel aus dem Seminar sind es zwei Seiten, in der Handreichung steht „knapp“. Wonach richtet ihr euch?',
      zeit: 'gestern', von: 'Anonym · verifiziert', antworten: 5, hilfreich: 14 },
    { id: 'f-la-deu-2', typ: 'material', modul: 'la-fd-deutsch', fach: 'deutsch', material: 'unterrichtsentwuerfe-deutsch',
      titel: 'Drei Unterrichtsentwürfe Deutsch eingestellt',
      text: 'Mit Verlaufsplan, Material und der Rückmeldung der Mentorin.',
      zeit: 'vor 2 Tagen', von: 'Mara S.' },
    { id: 'f-la-mat-1', typ: 'frage', modul: 'la-fd-mathematik', fach: 'mathematik',
      titel: 'Beispielaufgaben für die Einführung des Funktionsbegriffs?',
      text: 'Ich suche Aufgaben, die ohne Formelsprache auskommen und trotzdem tragfähig sind.',
      zeit: 'vor 2 Tagen', von: 'Anonym · verifiziert', antworten: 4, hilfreich: 12 },
    { id: 'f-la-ges-1', typ: 'frage', modul: 'la-fd-geschichte', fach: 'geschichte',
      titel: 'Quellenarbeit in Klasse 7 — womit fangt ihr an?',
      text: 'Bildquellen oder Textquellen zuerst? Im Seminar wurde beides vertreten.',
      zeit: 'gestern', von: 'Anonym · verifiziert', antworten: 3, hilfreich: 9 },

    /* --- Lehramt, Grundschule --- */
    { id: 'f-la-gs-1', typ: 'hinweis', modul: 'la-lb-gsd-sachunterricht',
      titel: 'Materialkiste für die Sachunterrichts-Werkstatt',
      text: 'Für die Sitzung nächste Woche bitte einen Alltagsgegenstand mitbringen, an dem sich ein naturwissenschaftliches Phänomen zeigen lässt.',
      zeit: 'gestern', von: 'Seminarleitung' },
    { id: 'f-la-gs-2', typ: 'frage', modul: 'la-lb-gsd-deutsch',
      titel: 'Schriftspracherwerb: welche Fibel nutzt ihr im Praktikum?',
      text: 'An meiner Schule wird nach zwei verschiedenen Ansätzen gearbeitet und ich komme durcheinander.',
      zeit: 'vor 2 Tagen', von: 'Anonym · verifiziert', antworten: 7, hilfreich: 21 },

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
      text: 'David P. hat die Normalformen neu erklärt und die Beispielabfragen ergänzt.',
      zeit: 'vor 2 Tagen', von: 'David P.' },
    { id: 'f-inf-4', typ: 'hinweis', studiengang: 'ul-informatik',
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
      text: 'Samstag zwischen 6:00 und 10:00 Uhr.', zeit: 'vor 2 Tagen' }
  ];

  feed.forEach(function (e) { if (!e.herkunft) e.herkunft = 'muster'; });

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
        { von: 'fremd', text: 'Klar. Mittwoch 17 Uhr oder Freitag vormittags. Bring am besten dein letztes Übungsblatt mit.', zeit: 'Vorgestern 12:20' }
      ] },
    { id: 'c3', partner: 'v-mara', bezug: { art: 'material', slug: 'unterrichtsentwurf-vorlage', titel: 'Vorlage für den Unterrichtsentwurf' },
      ungelesen: 0, farbe: 'tanne',
      verlauf: [
        { von: 'ich',   text: 'Danke für die Vorlage, die Verlaufstabelle hat mir viel Zeit gespart.', zeit: 'Montag 09:15' },
        { von: 'fremd', text: 'Freut mich. Falls dein Seminar eine andere Gliederung verlangt, sag Bescheid, ich habe noch eine zweite Fassung.', zeit: 'Montag 09:52' }
      ] },
    { id: 'c4', partner: 'system', bezug: { art: 'system', titel: 'Campus' }, ungelesen: 0, farbe: 'stein',
      verlauf: [
        { von: 'fremd', text: 'Deine Hochschul-E-Mail-Adresse ist bestätigt. Du kannst jetzt verkaufen und Beiträge schreiben.', zeit: 'Vor 3 Wochen' }
      ] }
  ];

  /* ------------------------------------------------- Termine

     Aus dem Stundenplan jedes Moduls fuer 14 Wochen, dazu die
     Einzeltermine darunter. Erzeugt wird das fuer ALLE Module; welche
     davon sichtbar sind, entscheidet die Modulliste des Nutzers. */

  var termine = [];
  var nummer = 0;

  module.forEach(function (m) {
    (m.plan || []).forEach(function (p) {
      for (var w = -4; w <= 9; w++) {
        nummer++;
        termine.push({
          id: 't' + nummer, modul: m.slug, titel: m.name, zusatz: p.titel, art: p.art,
          datum: termintag(w, p.wochentag), start: p.start, ende: p.ende, ort: p.ort,
          wiederkehrend: true, herkunft: 'muster'
        });
      }
    });
  });

  function einzel(t) {
    nummer++;
    t.id = 't' + nummer;
    t.herkunft = 'muster';
    termine.push(t);
  }

  /* Wirtschaftswissenschaften */
  einzel({ modul: 'statistik-2', titel: 'Übungsblatt 3 abgeben', art: 'abgabe',
    datum: iso(heute()), start: '18:00', ort: 'Lernplattform',
    checkliste: [{ text: 'Aufgabe 1 bis 3 rechnen', erledigt: true }, { text: 'Lösungsweg abtippen', erledigt: true }, { text: 'Hochladen', erledigt: false }] });
  einzel({ modul: 'statistik-2', titel: 'Klausur Statistik II', art: 'pruefung',
    datum: termintag(2, 3), start: '09:00', ende: '10:30', ort: 'Hörsaal 3', erinnerungen: ['7 Tage vorher', '1 Tag vorher'] });
  einzel({ modul: 'marketing', titel: 'Hausarbeit Positionierung abgeben', art: 'abgabe',
    datum: termintag(1, 5), start: '23:59', ort: 'Lernplattform',
    checkliste: [{ text: 'Gliederung', erledigt: true }, { text: 'Quellen sammeln', erledigt: true }, { text: 'Rohfassung', erledigt: false }, { text: 'Korrektur lesen lassen', erledigt: false }] });
  einzel({ modul: 'wirtschaftsrecht', titel: 'Klausur Wirtschaftsrecht', art: 'pruefung',
    datum: termintag(4, 2), start: '11:00', ende: '12:00', ort: 'Hörsaal 1', erinnerungen: ['7 Tage vorher', '1 Tag vorher'] });

  /* Lehramt */
  einzel({ modul: 'la-schulpraktische-studien', titel: 'Praktikumsbericht: erste Fassung', art: 'abgabe',
    datum: iso(heute()), start: '19:00', ort: 'Lernplattform',
    checkliste: [{ text: 'Hospitationsprotokoll abtippen', erledigt: true }, { text: 'Reflexion schreiben', erledigt: false }, { text: 'Anhang zusammenstellen', erledigt: false }] });
  einzel({ modul: 'la-entwicklungspsychologie', titel: 'Klausur Entwicklung und Lernen', art: 'pruefung',
    datum: termintag(2, 4), start: '10:00', ende: '11:30', ort: 'Hörsaal 5', erinnerungen: ['7 Tage vorher', '1 Tag vorher'] });
  einzel({ modul: 'la-schulpaedagogik', titel: 'Hausarbeit Klassenführung abgeben', art: 'abgabe',
    datum: termintag(3, 5), start: '23:59', ort: 'Lernplattform',
    checkliste: [{ text: 'Literatur sichten', erledigt: true }, { text: 'Gliederung abstimmen', erledigt: false }, { text: 'Rohfassung', erledigt: false }] });
  einzel({ modul: 'la-fd-deutsch', titel: 'Unterrichtsentwurf abgeben', art: 'abgabe', datum: termintag(2, 2), start: '12:00', ort: null });
  einzel({ modul: 'la-fd-mathematik', titel: 'Unterrichtsentwurf abgeben', art: 'abgabe', datum: termintag(2, 2), start: '12:00', ort: null });
  einzel({ modul: 'la-lb-gsd-sachunterricht', titel: 'Werkstattbericht abgeben', art: 'abgabe', datum: termintag(2, 3), start: '18:00', ort: null });

  /* Informatik */
  einzel({ modul: 'softwaretechnik', titel: 'Projektabgabe: erstes Release', art: 'abgabe',
    datum: termintag(2, 5), start: '23:59', ort: 'Lernplattform',
    checkliste: [{ text: 'Anforderungen festhalten', erledigt: true }, { text: 'Tests schreiben', erledigt: false }, { text: 'Dokumentation', erledigt: false }] });
  einzel({ modul: 'datenbanken', titel: 'Klausur Datenbanken', art: 'pruefung',
    datum: termintag(3, 3), start: '09:00', ende: '10:30', ort: 'Hörsaal 8', erinnerungen: ['7 Tage vorher', '1 Tag vorher'] });
  einzel({ modul: 'theoretische-informatik', titel: 'Übungsblatt 4 abgeben', art: 'abgabe',
    datum: iso(heute()), start: '18:00', ort: 'Lernplattform',
    checkliste: [{ text: 'Aufgabe 1 und 2', erledigt: true }, { text: 'Pumping-Lemma-Beweis', erledigt: false }] });

  /* Psychologie */
  einzel({ modul: 'psych-statistik-2', titel: 'Klausur Statistik II', art: 'pruefung',
    datum: termintag(2, 3), start: '09:00', ende: '10:30', ort: 'Hörsaal 9', erinnerungen: ['7 Tage vorher', '1 Tag vorher'] });
  einzel({ modul: 'psych-sozial', titel: 'Hausarbeit Sozialpsychologie abgeben', art: 'abgabe',
    datum: termintag(3, 5), start: '23:59', ort: 'Lernplattform',
    checkliste: [{ text: 'Fragestellung festlegen', erledigt: true }, { text: 'Literatur sichten', erledigt: false }, { text: 'Rohfassung', erledigt: false }] });

  /* ohne Modulbezug: gilt fuer alle */
  einzel({ titel: 'Lerngruppe', art: 'privat', datum: termintag(0, 3), start: '17:00', ende: '19:00', ort: 'Bibliothek, Gruppenraum 2', privat: true });
  einzel({ titel: 'Erstsemester-Treff auf dem Campus', art: 'event', datum: termintag(0, 4), start: '18:30', ort: 'Innenhof', gemeinschaft: true, bestaetigt: 34 });
  einzel({ titel: 'Hochschulsport: Anmeldung Kurse', art: 'todo', datum: termintag(0, 5), start: '20:00', ort: 'Online' });

  return {
    module: module, verkaeufer: verkaeufer, materialien: materialien, services: services,
    flohmarkt: flohmarkt, campus: campus, feed: feed, nachrichten: nachrichten, termine: termine
  };
})();
