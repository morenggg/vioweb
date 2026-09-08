/* =========================================================================
   Campus — Musterdaten.

   ALLES HIER IST ERFUNDEN. Keine echten Studenten, keine echten Dozenten,
   keine echten Preise, keine echten Bewertungen. Der Prototyp hat kein
   Backend; diese Datei nimmt spaeter die Stelle der Schnittstelle ein.

   Aufbau bewusst wie eine spaetere Datenbank: flache Sammlungen mit
   Schluesseln, die aufeinander zeigen (modul, verkaeufer, hochschule).
   Ansichten lesen ausschliesslich hierueber — nichts ist in der
   Oberflaeche fest verdrahtet.

   Termine werden relativ zum heutigen Tag erzeugt. Der Prototyp zeigt
   dadurch immer eine glaubwuerdige Woche, egal wann er geoeffnet wird.
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

  /* ------------------------------------------------- Hochschulen */

  var hochschulen = [
    { id: 'uni-leipzig',  name: 'Universität Leipzig',        kurz: 'Uni Leipzig', ort: 'Leipzig', mailendung: 'studserv.uni-leipzig.de' },
    { id: 'htwk-leipzig', name: 'HTWK Leipzig',               kurz: 'HTWK',        ort: 'Leipzig', mailendung: 'stud.htwk-leipzig.de' },
    { id: 'tu-dresden',   name: 'TU Dresden',                 kurz: 'TU Dresden',  ort: 'Dresden', mailendung: 'mailbox.tu-dresden.de' },
    { id: 'uni-halle',    name: 'Martin-Luther-Universität Halle', kurz: 'Uni Halle', ort: 'Halle', mailendung: 'student.uni-halle.de' },
    { id: 'uni-jena',     name: 'Universität Jena',           kurz: 'Uni Jena',    ort: 'Jena',    mailendung: 'uni-jena.de' }
  ];

  var studiengaenge = [
    { id: 'bwl',       name: 'Betriebswirtschaftslehre', kurz: 'BWL',  abschluss: 'Bachelor' },
    { id: 'vwl',       name: 'Volkswirtschaftslehre',    kurz: 'VWL',  abschluss: 'Bachelor' },
    { id: 'winfo',     name: 'Wirtschaftsinformatik',    kurz: 'WI',   abschluss: 'Bachelor' },
    { id: 'jura',      name: 'Rechtswissenschaft',       kurz: 'Jura', abschluss: 'Staatsexamen' },
    { id: 'psych',     name: 'Psychologie',              kurz: 'Psych', abschluss: 'Bachelor' },
    { id: 'informatik', name: 'Informatik',              kurz: 'Info', abschluss: 'Bachelor' },
    { id: 'lehramt',   name: 'Lehramt',                  kurz: 'LA',   abschluss: 'Staatsexamen' }
  ];

  /* ------------------------------------------------- Nutzer */

  var nutzer = {
    id: 'u-maurice',
    anzeigename: 'Maurice',
    vorname: 'Maurice',
    kuerzel: 'M',
    hochschule: 'uni-leipzig',
    studiengang: 'bwl',
    semester: 3,
    semesterName: 'Wintersemester 2026/27',
    verifiziert: true,
    seit: 'Oktober 2025',
    bewertung: 4.8,
    anzahlBewertungen: 12,
    verkaeufe: 7,
    kaeufe: 5
  };

  /* ------------------------------------------------- Module
     farbe steuert die Flaeche der Modulkarte. plan sind die
     wiederkehrenden Veranstaltungen; daraus entstehen die Termine. */

  var module = [
    {
      slug: 'statistik-2', name: 'Statistik II', kuerzel: 'STA II',
      dozent: 'Prof. Wagner', farbe: 'koralle', ects: 6, semester: 3,
      studiengang: 'bwl', hochschule: 'uni-leipzig', pruefung: 'Klausur, 90 Minuten',
      teilnehmer: 214,
      beschreibung: 'Schließende Statistik: Schätzverfahren, Hypothesentests, Regression. Aufbauend auf Statistik I aus dem zweiten Semester.',
      plan: [
        { wochentag: 2, start: '10:15', ende: '11:45', ort: 'Hörsaal 3',      art: 'vorlesung', titel: 'Vorlesung' },
        { wochentag: 4, start: '14:00', ende: '15:30', ort: 'Seminarraum 2.04', art: 'seminar', titel: 'Übung' }
      ]
    },
    {
      slug: 'marketing', name: 'Marketing', kuerzel: 'MKT',
      dozent: 'Prof. Berger', farbe: 'senf', ects: 5, semester: 3,
      studiengang: 'bwl', hochschule: 'uni-leipzig', pruefung: 'Hausarbeit und Präsentation',
      teilnehmer: 186,
      beschreibung: 'Grundlagen des Marketingmanagements, Marktforschung, Positionierung und Kommunikationspolitik.',
      plan: [
        { wochentag: 2, start: '14:00', ende: '15:30', ort: 'Seminarraum 1.12', art: 'vorlesung', titel: 'Vorlesung' }
      ]
    },
    {
      slug: 'wirtschaftsrecht', name: 'Wirtschaftsrecht', kuerzel: 'WR',
      dozent: 'Dr. König', farbe: 'tinte', ects: 5, semester: 3,
      studiengang: 'bwl', hochschule: 'uni-leipzig', pruefung: 'Klausur, 60 Minuten',
      teilnehmer: 203,
      beschreibung: 'BGB im unternehmerischen Alltag, Handelsrecht, Gesellschaftsformen und Vertragsgestaltung.',
      plan: [
        { wochentag: 4, start: '08:30', ende: '10:00', ort: 'Hörsaal 1', art: 'vorlesung', titel: 'Vorlesung' }
      ]
    },
    {
      slug: 'investition-finanzierung', name: 'Investition & Finanzierung', kuerzel: 'IUF',
      dozent: 'Prof. Scholz', farbe: 'tanne', ects: 6, semester: 3,
      studiengang: 'bwl', hochschule: 'uni-leipzig', pruefung: 'Klausur, 120 Minuten',
      teilnehmer: 197,
      beschreibung: 'Investitionsrechnung, Kapitalwertmethode, Finanzierungsformen und Kapitalstruktur.',
      plan: [
        { wochentag: 5, start: '12:00', ende: '13:30', ort: 'Hörsaal 2', art: 'vorlesung', titel: 'Vorlesung' }
      ]
    },
    {
      slug: 'wirtschaftsinformatik', name: 'Wirtschaftsinformatik', kuerzel: 'WINF',
      dozent: 'Prof. Lindner', farbe: 'pflaume', ects: 5, semester: 3,
      studiengang: 'bwl', hochschule: 'uni-leipzig', pruefung: 'Projektarbeit',
      teilnehmer: 142,
      beschreibung: 'Geschäftsprozesse, Datenmodellierung und betriebliche Informationssysteme.',
      plan: [
        { wochentag: 1, start: '16:00', ende: '17:30', ort: 'Rechenzentrum 1.05', art: 'seminar', titel: 'Seminar' }
      ]
    },
    {
      slug: 'wirtschaftsenglisch', name: 'Wirtschaftsenglisch', kuerzel: 'ENG',
      dozent: 'Ms. Hartley', farbe: 'oliv', ects: 3, semester: 3,
      studiengang: 'bwl', hochschule: 'uni-leipzig', pruefung: 'Mündliche Prüfung',
      teilnehmer: 64,
      beschreibung: 'Business English: Verhandlung, Korrespondenz und Präsentation.',
      plan: [
        { wochentag: 3, start: '09:00', ende: '10:30', ort: 'Seminarraum 3.01', art: 'seminar', titel: 'Kurs' }
      ]
    },
    /* Abgeschlossen, liegt im Archiv. */
    {
      slug: 'statistik-1', name: 'Statistik I', kuerzel: 'STA I',
      dozent: 'Prof. Wagner', farbe: 'stein', ects: 6, semester: 2, abgeschlossen: true,
      studiengang: 'bwl', hochschule: 'uni-leipzig', pruefung: 'Klausur, 90 Minuten', note: '2,0',
      teilnehmer: 231, beschreibung: 'Deskriptive Statistik und Wahrscheinlichkeitsrechnung.', plan: []
    },
    {
      slug: 'buchfuehrung', name: 'Buchführung und Abschluss', kuerzel: 'BUF',
      dozent: 'Dr. Meinhardt', farbe: 'stein', ects: 5, semester: 1, abgeschlossen: true,
      studiengang: 'bwl', hochschule: 'uni-leipzig', pruefung: 'Klausur, 90 Minuten', note: '1,7',
      teilnehmer: 268, beschreibung: 'Doppelte Buchführung, Jahresabschluss, Bilanzierung.', plan: []
    },
    {
      slug: 'mikrooekonomik', name: 'Mikroökonomik', kuerzel: 'MIK',
      dozent: 'Prof. Ahrens', farbe: 'stein', ects: 6, semester: 2, abgeschlossen: true,
      studiengang: 'bwl', hochschule: 'uni-leipzig', pruefung: 'Klausur, 90 Minuten', note: '2,3',
      teilnehmer: 245, beschreibung: 'Haushalts- und Unternehmenstheorie, Marktformen.', plan: []
    }
  ];

  /* Module, die es an der Hochschule gibt, die Maurice aber nicht belegt.
     Grundlage fuer Suche und Vorschlaege im Studium-Bereich. */
  var katalog = [
    { slug: 'personalmanagement', name: 'Personalmanagement', kuerzel: 'PM', dozent: 'Prof. Reimann', farbe: 'terrakotta', ects: 5, semester: 3, studiengang: 'bwl', hochschule: 'uni-leipzig', pruefung: 'Klausur, 60 Minuten', teilnehmer: 121, beschreibung: 'Personalauswahl, Führung, Arbeitsrecht in der Praxis.', plan: [{ wochentag: 3, start: '14:00', ende: '15:30', ort: 'Hörsaal 4', art: 'vorlesung', titel: 'Vorlesung' }] },
    { slug: 'makrooekonomik', name: 'Makroökonomik', kuerzel: 'MAK', dozent: 'Prof. Ahrens', farbe: 'tinte', ects: 6, semester: 3, studiengang: 'bwl', hochschule: 'uni-leipzig', pruefung: 'Klausur, 90 Minuten', teilnehmer: 188, beschreibung: 'Volkswirtschaftliche Gesamtrechnung, Konjunktur, Geldpolitik.', plan: [{ wochentag: 1, start: '10:15', ende: '11:45', ort: 'Hörsaal 1', art: 'vorlesung', titel: 'Vorlesung' }] },
    { slug: 'controlling', name: 'Controlling', kuerzel: 'CTR', dozent: 'Dr. Weiss', farbe: 'oliv', ects: 5, semester: 4, studiengang: 'bwl', hochschule: 'uni-leipzig', pruefung: 'Klausur, 90 Minuten', teilnehmer: 96, beschreibung: 'Kostenrechnung, Kennzahlensysteme, Berichtswesen.', plan: [{ wochentag: 5, start: '08:30', ende: '10:00', ort: 'Seminarraum 1.04', art: 'vorlesung', titel: 'Vorlesung' }] },
    { slug: 'unternehmensfuehrung', name: 'Unternehmensführung', kuerzel: 'UF', dozent: 'Prof. Scholz', farbe: 'rost', ects: 5, semester: 4, studiengang: 'bwl', hochschule: 'uni-leipzig', pruefung: 'Fallstudie', teilnehmer: 88, beschreibung: 'Strategische Planung, Organisation, Entscheidungsprozesse.', plan: [{ wochentag: 2, start: '16:00', ende: '17:30', ort: 'Hörsaal 2', art: 'vorlesung', titel: 'Vorlesung' }] }
  ];

  /* ------------------------------------------------- Termine

     Aus dem Stundenplan werden feste Termine fuer 14 Wochen erzeugt
     (4 zurueck, 9 voraus). Dazu kommen die Einzeltermine darunter.
     art: vorlesung | seminar | pruefung | abgabe | todo | event | privat */

  var termine = [];
  var laufendeNummer = 0;

  module.concat(katalog).forEach(function (m) {
    (m.plan || []).forEach(function (p) {
      for (var w = -4; w <= 9; w++) {
        laufendeNummer++;
        termine.push({
          id: 't' + laufendeNummer,
          modul: m.slug,
          titel: m.name,
          zusatz: p.titel,
          art: p.art,
          datum: termintag(w, p.wochentag),
          start: p.start,
          ende: p.ende,
          ort: p.ort,
          wiederkehrend: true
        });
      }
    });
  });

  function einzel(t) {
    laufendeNummer++;
    t.id = 't' + laufendeNummer;
    termine.push(t);
    return t;
  }

  einzel({ modul: 'statistik-2', titel: 'Übungsblatt 3 abgeben', art: 'abgabe',
    datum: iso(heute()), start: '18:00', ort: 'Moodle',
    checkliste: [{ text: 'Aufgabe 1 bis 3 rechnen', erledigt: true }, { text: 'Lösungsweg abtippen', erledigt: true }, { text: 'Hochladen', erledigt: false }] });

  einzel({ modul: 'statistik-2', titel: 'Klausur Statistik II', art: 'pruefung',
    datum: termintag(2, 3), start: '09:00', ende: '10:30', ort: 'Hörsaal 3',
    erinnerungen: ['7 Tage vorher', '1 Tag vorher'] });

  einzel({ modul: 'marketing', titel: 'Hausarbeit Positionierung abgeben', art: 'abgabe',
    datum: termintag(1, 5), start: '23:59', ort: 'Moodle',
    checkliste: [{ text: 'Gliederung', erledigt: true }, { text: 'Quellen sammeln', erledigt: true }, { text: 'Rohfassung', erledigt: false }, { text: 'Korrektur lesen lassen', erledigt: false }] });

  einzel({ modul: 'wirtschaftsrecht', titel: 'Klausur Wirtschaftsrecht', art: 'pruefung',
    datum: termintag(4, 2), start: '11:00', ende: '12:00', ort: 'Hörsaal 1',
    erinnerungen: ['7 Tage vorher', '1 Tag vorher'] });

  einzel({ modul: 'wirtschaftsinformatik', titel: 'Projektabgabe Datenmodell', art: 'abgabe',
    datum: termintag(3, 1), start: '12:00', ort: 'Moodle' });

  einzel({ titel: 'Lerngruppe Statistik', art: 'privat', datum: termintag(0, 3),
    start: '17:00', ende: '19:00', ort: 'Bibliothek, Gruppenraum 2', privat: true });

  einzel({ titel: 'Erstsemester-Treff auf dem Campus', art: 'event',
    datum: termintag(0, 4), start: '18:30', ort: 'Innenhof Campus Augustusplatz',
    gemeinschaft: true, bestaetigt: 34 });

  einzel({ titel: 'Hochschulsport: Anmeldung Kurse', art: 'todo',
    datum: termintag(0, 5), start: '20:00', ort: 'Online' });

  /* ------------------------------------------------- Verkaeufer */

  var verkaeufer = [
    { id: 'v-lena',   name: 'Lena K.',    kuerzel: 'LK', verifiziert: true,  hochschule: 'uni-leipzig', studiengang: 'bwl',   semester: 5, bewertung: 4.9, anzahlBewertungen: 87, verkaeufe: 214, seit: 'März 2025', ueber: 'Schreibe seit dem dritten Semester Zusammenfassungen für die Wirtschaftsmodule. Alles selbst getippt, nach jeder Klausur aktualisiert.' },
    { id: 'v-jonas',  name: 'Jonas B.',   kuerzel: 'JB', verifiziert: true,  hochschule: 'uni-leipzig', studiengang: 'winfo', semester: 7, bewertung: 4.7, anzahlBewertungen: 41, verkaeufe: 93,  seit: 'Oktober 2024', ueber: 'Tabellen, Vorlagen und kleine Werkzeuge für alles, was mit Zahlen zu tun hat.' },
    { id: 'v-sarah',  name: 'Sarah M.',   kuerzel: 'SM', verifiziert: true,  hochschule: 'uni-leipzig', studiengang: 'bwl',   semester: 4, bewertung: 4.8, anzahlBewertungen: 63, verkaeufe: 148, seit: 'Januar 2025', ueber: 'Karteikarten und Lernzettel, gerne auch auf Zuruf für ein bestimmtes Modul.' },
    { id: 'v-tim',    name: 'Tim R.',     kuerzel: 'TR', verifiziert: false, hochschule: 'uni-leipzig', studiengang: 'jura',  semester: 6, bewertung: 4.4, anzahlBewertungen: 12, verkaeufe: 19,  seit: 'Juni 2026', ueber: 'Juristische Grundlagen für Wirtschaftsstudenten.' },
    { id: 'v-anna',   name: 'Anna W.',    kuerzel: 'AW', verifiziert: true,  hochschule: 'uni-leipzig', studiengang: 'psych', semester: 8, bewertung: 5.0, anzahlBewertungen: 29, verkaeufe: 52,  seit: 'April 2025', ueber: 'Statistik-Nachhilfe und Korrekturlesen. Ich erkläre lieber zweimal als einmal zu schnell.' }
  ];

  /* ------------------------------------------------- Materialien

     typ: lernzettel | zusammenfassung | formelsammlung | karteikarten |
          uebungsaufgaben | hausarbeit | vorlage | tool
     Preise sind Musterpreise. Kostenlos ist nur die Vorschau. */

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
      beschreibung: 'Kompakte Zusammenfassung aller Vorlesungsteile, mit Merksätzen und einer Übersicht der Modelle, die Prof. Berger regelmäßig abfragt.',
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
      dateityp: 'PDF', umfang: '22 Seiten', aktualisiert: iso(plus(heute(), -70)), semester: 2, verkaeufe: 16, vorschau: true,
      geprueft: true,
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
      rezensionen: [{ von: 'Robin E.', sterne: 4, datum: iso(plus(heute(), -25)), text: 'Simpel, aber genau deshalb benutze ich sie.' }] }
  ];

  /* ------------------------------------------------- Services */

  var services = [
    { slug: 'nachhilfe-statistik', titel: 'Nachhilfe Statistik I und II', kategorie: 'Nachhilfe',
      anbieter: 'v-anna', modul: 'statistik-2', preis: 22, einheit: 'Stunde', bewertung: 5.0, anzahlBewertungen: 19,
      ort: 'Online oder Bibliothek', beschreibung: 'Einzeln oder zu zweit. Wir rechnen deine Übungsblätter zusammen durch und gehen die Klausuraufgaben der letzten Jahre an. Erste halbe Stunde zum Kennenlernen kostet nichts.' },
    { slug: 'korrekturlesen-hausarbeit', titel: 'Korrekturlesen von Haus- und Seminararbeiten', kategorie: 'Korrektur',
      anbieter: 'v-anna', modul: null, preis: 3.5, einheit: 'Seite', bewertung: 4.9, anzahlBewertungen: 27,
      ort: 'Online', beschreibung: 'Rechtschreibung, Grammatik, Zeichensetzung und ein Blick auf den roten Faden. Rückmeldung als Kommentar im Dokument, in der Regel innerhalb von zwei Tagen.' },
    { slug: 'excel-hilfe', titel: 'Excel-Hilfe für Übungsblätter und Auswertungen', kategorie: 'Excel',
      anbieter: 'v-jonas', modul: 'investition-finanzierung', preis: 18, einheit: 'Stunde', bewertung: 4.8, anzahlBewertungen: 14,
      ort: 'Online', beschreibung: 'Pivot, Verweise, Diagramme und alles, was in der Übung schneller gehen muss. Wir teilen den Bildschirm und du machst mit.' },
    { slug: 'praesentationsfeedback', titel: 'Feedback zu deiner Präsentation', kategorie: 'Feedback',
      anbieter: 'v-lena', modul: null, preis: 15, einheit: 'Termin', bewertung: 4.7, anzahlBewertungen: 9,
      ort: 'Online', beschreibung: 'Du hältst deinen Vortrag einmal komplett, ich schreibe mit und wir gehen ihn danach Folie für Folie durch.' },
    { slug: 'bewerbungshilfe', titel: 'Bewerbungsunterlagen für Praktika', kategorie: 'Bewerbung',
      anbieter: 'v-sarah', modul: null, preis: 25, einheit: 'Paket', bewertung: 4.6, anzahlBewertungen: 12,
      ort: 'Online', beschreibung: 'Lebenslauf und Anschreiben gemeinsam überarbeiten, abgestimmt auf die Stelle. Zwei Runden sind im Preis enthalten.' },
    { slug: 'nachhilfe-buchfuehrung', titel: 'Nachhilfe Buchführung und Bilanzierung', kategorie: 'Nachhilfe',
      anbieter: 'v-lena', modul: null, preis: 20, einheit: 'Stunde', bewertung: 4.8, anzahlBewertungen: 16,
      ort: 'Bibliothek oder online', beschreibung: 'Buchungssätze, Abschluss, typische Klausuraufgaben. Auch kurzfristig vor der Klausur.' }
  ];

  /* ------------------------------------------------- Flohmarkt

     Nur die eigene Hochschule. Keine Zahlung ueber die Plattform:
     die App stellt den Kontakt her, alles Weitere machen die beiden
     Studenten unter sich. */

  var flohmarkt = [
    { slug: 'taschenrechner-ti-30', titel: 'Taschenrechner TI-30 ECO RS', preis: 12, kategorie: 'Uni-Zubehör',
      zustand: 'Gut', verkaeufer: 'v-sarah', eingestellt: iso(plus(heute(), -1)), ort: 'Südvorstadt', farbe: 'senf',
      beschreibung: 'Der in den Klausuren zugelassene Rechner. Zwei Semester benutzt, Display ohne Kratzer. Solarbetrieb, keine Batterie nötig.' },
    { slug: 'bwl-grundlagen-buch', titel: 'Wöhe: Einführung in die Allgemeine BWL, 27. Auflage', preis: 18, kategorie: 'Bücher',
      zustand: 'Gebraucht', verkaeufer: 'v-lena', eingestellt: iso(plus(heute(), -2)), ort: 'Zentrum-Süd', farbe: 'tinte',
      beschreibung: 'Ein paar Bleistiftnotizen am Rand, Einband leicht bestoßen. Alles lesbar, nichts fehlt.' },
    { slug: 'monitor-24-zoll', titel: '24-Zoll-Monitor, Full HD', preis: 55, kategorie: 'Technik',
      zustand: 'Sehr gut', verkaeufer: 'v-jonas', eingestellt: iso(plus(heute(), -3)), ort: 'Connewitz', farbe: 'tanne',
      beschreibung: 'Zweitmonitor, drei Jahre alt, keine Pixelfehler. HDMI-Kabel und Standfuß liegen dabei. Abholung, weil sperrig.' },
    { slug: 'schreibtischlampe', titel: 'Schreibtischlampe mit Klemme', preis: 8, kategorie: 'Möbel',
      zustand: 'Gut', verkaeufer: 'v-tim', eingestellt: iso(plus(heute(), -4)), ort: 'Gohlis', farbe: 'terrakotta',
      beschreibung: 'Klemmt an jede Tischplatte bis 4 cm. Warmes Licht, Schalter am Kabel.' },
    { slug: 'fahrrad-28-zoll', titel: 'Damenrad 28 Zoll, 7 Gänge', preis: 95, kategorie: 'Fahrräder',
      zustand: 'Gebraucht', verkaeufer: 'v-anna', eingestellt: iso(plus(heute(), -6)), ort: 'Plagwitz', farbe: 'oliv',
      beschreibung: 'Fährt zuverlässig, Reifen und Bremsen letztes Jahr neu. Rahmen hat Gebrauchsspuren. Probefahrt gern.' },
    { slug: 'kaffeemaschine', titel: 'Filterkaffeemaschine mit Thermoskanne', preis: 15, kategorie: 'Haushalt',
      zustand: 'Sehr gut', verkaeufer: 'v-sarah', eingestellt: iso(plus(heute(), -8)), ort: 'Südvorstadt', farbe: 'rost',
      beschreibung: 'Kanne hält den Kaffee mehrere Stunden warm. Entkalkt, sauber, funktioniert einwandfrei.' },
    { slug: 'aktenordner-set', titel: 'Fünf Ordner und ein Locher', preis: 5, kategorie: 'Uni-Zubehör',
      zustand: 'Gut', verkaeufer: 'v-tim', eingestellt: iso(plus(heute(), -10)), ort: 'Zentrum-Nord', farbe: 'senf',
      beschreibung: 'Nach der Prüfungsphase übrig. Rücken sind beschriftet, lässt sich aber überkleben.' },
    { slug: 'statistik-buch', titel: 'Fahrmeir: Statistik, 9. Auflage', preis: 22, kategorie: 'Bücher',
      zustand: 'Sehr gut', verkaeufer: 'v-lena', eingestellt: iso(plus(heute(), -12)), ort: 'Zentrum-Süd', farbe: 'tinte',
      beschreibung: 'Das Standardwerk zur Vorlesung. Kaum benutzt, weil ich hauptsächlich mit dem Skript gelernt habe.' }
  ];

  /* ------------------------------------------------- Campus */

  var campus = [
    { slug: 'bibliothek-laenger', titel: 'Bibliothek heute länger geöffnet', art: 'hinweis',
      datum: iso(heute()), text: 'Die Campus-Bibliothek schließt in der Prüfungsphase erst um 22:00 Uhr statt um 20:00 Uhr. Das gilt bis Ende des Monats, auch am Wochenende.', quelle: 'Universitätsbibliothek' },
    { slug: 'hochschulsport-kurse', titel: 'Hochschulsport öffnet neue Kurse', art: 'angebot',
      datum: iso(plus(heute(), -1)), text: 'Ab Montag sind Plätze in Klettern, Volleyball und Yoga frei. Die Anmeldung läuft über das Sportportal, erfahrungsgemäß sind die Kurse innerhalb weniger Stunden voll.', quelle: 'Zentrum für Hochschulsport' },
    { slug: 'erstsemester-treff', titel: 'Erstsemester-Treff auf dem Campus', art: 'event',
      datum: termintag(0, 4), text: 'Ab 18:30 Uhr im Innenhof. Die Fachschaft grillt, es gibt eine kurze Campusführung für alle, die noch suchen.', quelle: 'Fachschaftsrat Wirtschaftswissenschaften' },
    { slug: 'mensa-preise', titel: 'Mensa: neue Preise ab dem Wintersemester', art: 'hinweis',
      datum: iso(plus(heute(), -3)), text: 'Das Studentenwerk hebt die Preise für Hauptgerichte an. Der ermäßigte Satz für Studenten bleibt bestehen, die Aufschläge treffen vor allem Gäste.', quelle: 'Studentenwerk' },
    { slug: 'karrieretag', titel: 'Karrieretag der Wirtschaftswissenschaften', art: 'event',
      datum: termintag(2, 4), text: 'Rund 40 Unternehmen aus der Region stellen sich vor, Schwerpunkt Praktika und Werkstudentenstellen. Ohne Anmeldung, Lebenslauf mitbringen lohnt sich.', quelle: 'Career Service' },
    { slug: 'wlan-wartung', titel: 'WLAN am Wochenende zeitweise gestört', art: 'hinweis',
      datum: iso(plus(heute(), -2)), text: 'Am Samstag zwischen 6:00 und 10:00 Uhr wird das Campusnetz gewartet. In dieser Zeit sind Moodle und die Bibliotheksdatenbanken nicht erreichbar.', quelle: 'Rechenzentrum' }
  ];

  /* ------------------------------------------------- Feed

     typ: termin | material | frage | event | campus | hinweis
     Reihenfolge steht hier fest. Spaeter uebernimmt das eine
     Gewichtung aus Modulen, Semester, Hochschule und Aktualitaet. */

  var feed = [
    { id: 'f1', typ: 'termin', modul: 'statistik-2', titel: 'Raumänderung für die heutige Vorlesung',
      text: 'Statistik II findet heute in Hörsaal 3 statt, nicht wie üblich in Hörsaal 1. Die Übung am Donnerstag bleibt unverändert.',
      zeit: 'vor 2 Stunden', von: 'Prof. Wagner', amtlich: true },
    { id: 'f2', typ: 'frage', modul: 'marketing', titel: 'Welche Themen sind für die Klausur besonders wichtig?',
      text: 'Prof. Berger hat in der letzten Vorlesung von einem Schwerpunkt gesprochen, aber nicht gesagt welcher. Weiß jemand mehr?',
      zeit: 'vor 4 Stunden', von: 'Anonym · verifiziert', antworten: 7, hilfreich: 24 },
    { id: 'f3', typ: 'campus', campus: 'bibliothek-laenger', titel: 'Bibliothek heute länger geöffnet',
      text: 'Bis 22:00 Uhr statt 20:00 Uhr, den ganzen Monat.', zeit: 'heute', von: 'Universitätsbibliothek' },
    { id: 'f4', typ: 'material', modul: 'statistik-2', material: 'klausurzusammenfassung-statistik-2',
      titel: 'Neue Zusammenfassung für Statistik II',
      text: 'Lena K. hat ihre Klausurzusammenfassung überarbeitet, jetzt mit den Aufgaben der letzten Klausur.',
      zeit: 'vor 5 Stunden', von: 'Lena K.' },
    { id: 'f5', typ: 'hinweis', modul: 'statistik-2', titel: 'Übungsblatt 3 ist heute um 18:00 Uhr fällig',
      text: 'Du hast noch einen offenen Punkt auf deiner Checkliste.', zeit: 'heute', eigen: true },
    { id: 'f6', typ: 'frage', modul: 'investition-finanzierung', titel: 'Rentenbarwertfaktor in Aufgabe 12 — Denkfehler?',
      text: 'Ich komme auf 3,465 statt 3,4651. Rundet ihr vorher oder erst am Ende?',
      zeit: 'gestern', von: 'Marek P.', antworten: 4, hilfreich: 11 },
    { id: 'f7', typ: 'event', campus: 'erstsemester-treff', titel: 'Erstsemester-Treff auf dem Campus',
      text: 'Donnerstag ab 18:30 Uhr im Innenhof. Die Fachschaft grillt.', zeit: 'gestern', von: 'Fachschaftsrat' },
    { id: 'f8', typ: 'termin', modul: 'wirtschaftsrecht', titel: 'Klausurtermin steht fest',
      text: 'Die Klausur Wirtschaftsrecht ist in vier Wochen, Dienstag um 11:00 Uhr in Hörsaal 1. Der Termin liegt jetzt in deinem Kalender.',
      zeit: 'vor 2 Tagen', von: 'Dr. König', amtlich: true },
    { id: 'f9', typ: 'campus', campus: 'hochschulsport-kurse', titel: 'Hochschulsport öffnet neue Kurse',
      text: 'Klettern, Volleyball und Yoga. Anmeldung ab Montag.', zeit: 'vor 2 Tagen', von: 'Hochschulsport' },
    { id: 'f10', typ: 'frage', modul: 'wirtschaftsinformatik', titel: 'Reicht ein ER-Modell oder braucht es auch das relationale Schema?',
      text: 'In der Aufgabenstellung steht nur Datenmodell. Prof. Lindner hat beides gezeigt.',
      zeit: 'vor 3 Tagen', von: 'Anonym · verifiziert', antworten: 3, hilfreich: 8 }
  ];

  /* ------------------------------------------------- Nachrichten

     bezug zeigt, woraus der Chat entstanden ist. Verkaufsanfragen sind
     keine eigene Seite, sondern ein Chat wie jeder andere. */

  var nachrichten = [
    { id: 'c1', partner: 'v-sarah', bezug: { art: 'flohmarkt', slug: 'taschenrechner-ti-30', titel: 'Taschenrechner TI-30 ECO RS' },
      ungelesen: 2, farbe: 'senf',
      verlauf: [
        { von: 'ich',    text: 'Hallo Sarah, ist der Taschenrechner noch da?', zeit: 'Gestern 18:12' },
        { von: 'fremd',  text: 'Hi Maurice, ja, ist noch zu haben.', zeit: 'Gestern 18:40' },
        { von: 'fremd',  text: 'Ich bin morgen ab 14 Uhr in der Bibliothek, da könnten wir uns treffen. Passt dir das?', zeit: 'Gestern 18:41' }
      ] },
    { id: 'c2', partner: 'v-anna', bezug: { art: 'service', slug: 'nachhilfe-statistik', titel: 'Nachhilfe Statistik I und II' },
      ungelesen: 1, farbe: 'koralle',
      verlauf: [
        { von: 'ich',   text: 'Hi Anna, ich schreibe in zwei Wochen Statistik II und komme bei den Testverfahren nicht weiter. Hast du noch Termine frei?', zeit: 'Vorgestern 11:03' },
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

  /* ------------------------------------------------- Zugriff */

  function nachSlug(sammlung, slug) {
    for (var i = 0; i < sammlung.length; i++) {
      if (sammlung[i].slug === slug) return sammlung[i];
    }
    return null;
  }
  function nachId(sammlung, id) {
    for (var i = 0; i < sammlung.length; i++) {
      if (sammlung[i].id === id) return sammlung[i];
    }
    return null;
  }

  return {
    iso: iso, heute: heute, plus: plus, montag: montag, termintag: termintag,
    hochschulen: hochschulen, studiengaenge: studiengaenge, nutzer: nutzer,
    module: module, katalog: katalog, termine: termine, verkaeufer: verkaeufer,
    materialien: materialien, services: services, flohmarkt: flohmarkt,
    campus: campus, feed: feed, nachrichten: nachrichten,

    modul: function (slug) { return nachSlug(module, slug) || nachSlug(katalog, slug); },
    material: function (slug) { return nachSlug(materialien, slug); },
    service: function (slug) { return nachSlug(services, slug); },
    artikel: function (slug) { return nachSlug(flohmarkt, slug); },
    campusEintrag: function (slug) { return nachSlug(campus, slug); },
    person: function (id) { return id === 'system' ? { id: 'system', name: 'Campus', kuerzel: 'C', verifiziert: true } : nachId(verkaeufer, id); },
    hochschule: function (id) { return nachId(hochschulen, id); },
    studiengang: function (id) { return nachId(studiengaenge, id); },
    chat: function (id) { return nachId(nachrichten, id); }
  };
})();
