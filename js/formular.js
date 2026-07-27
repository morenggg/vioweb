/* =========================================================================
   Vioweb — Versand des Kontaktformulars.

   Diese Datei macht ausschliesslich das Formular. Der Rest der Seite
   funktioniert vollstaendig ohne JavaScript.

   Drei Wege, in dieser Reihenfolge:
     1. Endpunkt hinterlegt  -> Versand per fetch, Antwort an Ort und Stelle
     2. kein Endpunkt        -> vorbefuellte E-Mail im Mailprogramm
     3. kein JavaScript      -> das action-Attribut des Formulars greift
                                (mailto) plus Hinweis im <noscript>

   Es gibt keinen Zustand, in dem das Formular tot ist.
   ========================================================================= */
(function () {
  'use strict';

  var formular = document.getElementById('check-formular');
  if (!formular) return;

  var meldung = document.getElementById('formular-meldung');
  var knopf = formular.querySelector('.formular__senden');
  var endpunkt = (formular.dataset.endpunkt || '').trim();
  var mailAdresse = (formular.dataset.mail || '').trim();

  var felder = {
    adresse: document.getElementById('adresse'),
    mail: document.getElementById('mail'),
    einwilligung: document.getElementById('einwilligung')
  };

  /* --------------------------------------------------------- Werkzeuge */

  function fehlerFeld(feld) {
    return document.getElementById(feld.id + '-fehler');
  }

  function fehlerZeigen(feld, text) {
    var ziel = fehlerFeld(feld);
    if (ziel) ziel.textContent = text;
    feld.setAttribute('aria-invalid', 'true');
  }

  function fehlerLoeschen(feld) {
    var ziel = fehlerFeld(feld);
    if (ziel) ziel.textContent = '';
    feld.removeAttribute('aria-invalid');
  }

  function meldungZeigen(text, art) {
    meldung.textContent = text;
    meldung.className = 'meldung' + (art ? ' meldung--' + art : '');
  }

  /* Ergaenzt fehlendes https:// und schneidet www., Pfad und Leerzeichen ab.
     Ohne das scheitert type="url" an jeder Eingabe wie "beispiel.de" — und
     genau so tippen Besucher ihre Adresse ein. */
  function adresseAufraeumen(wert) {
    var w = wert.trim();
    if (!w) return '';
    w = w.replace(/\s+/g, '');
    if (!/^https?:\/\//i.test(w)) w = 'https://' + w;
    return w;
  }

  function istAdresse(wert) {
    try {
      var u = new URL(wert);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
      /* Mindestens ein Punkt und eine Endung aus Buchstaben. */
      return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/i
        .test(u.hostname);
    } catch (e) {
      return false;
    }
  }

  function istMail(wert) {
    return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(wert.trim());
  }

  /* ---------------------------------------------------------- Pruefung */
  /* Fehler stehen neben dem betroffenen Feld und sagen, was fehlt —
     nicht "Ungueltige Eingabe". */

  function pruefen() {
    var ersterFehler = null;

    var adresse = adresseAufraeumen(felder.adresse.value);
    if (!felder.adresse.value.trim()) {
      fehlerZeigen(felder.adresse,
        'Trag hier die Adresse deiner Website ein, zum Beispiel beispiel.de');
      ersterFehler = ersterFehler || felder.adresse;
    } else if (!istAdresse(adresse)) {
      fehlerZeigen(felder.adresse,
        'Das sieht noch nicht nach einer Website-Adresse aus. So sollte sie aussehen: beispiel.de');
      ersterFehler = ersterFehler || felder.adresse;
    } else {
      felder.adresse.value = adresse;
      fehlerLoeschen(felder.adresse);
    }

    if (!felder.mail.value.trim()) {
      fehlerZeigen(felder.mail,
        'Ohne deine E-Mail können wir dir das Ergebnis nicht schicken.');
      ersterFehler = ersterFehler || felder.mail;
    } else if (!istMail(felder.mail.value)) {
      fehlerZeigen(felder.mail,
        'Da fehlt noch etwas. Eine E-Mail-Adresse sieht so aus: name@beispiel.de');
      ersterFehler = ersterFehler || felder.mail;
    } else {
      fehlerLoeschen(felder.mail);
    }

    if (!felder.einwilligung.checked) {
      fehlerZeigen(felder.einwilligung,
        'Setz bitte den Haken. Ohne dein Einverständnis dürfen wir deine Angaben nicht verarbeiten.');
      ersterFehler = ersterFehler || felder.einwilligung;
    } else {
      fehlerLoeschen(felder.einwilligung);
    }

    return ersterFehler;
  }

  /* ------------------------------------------------------------ Inhalt */

  function angaben() {
    var daten = new FormData(formular);
    daten.delete('_redirect');
    daten.delete('ort_zusatz');
    daten.set('adresse', adresseAufraeumen(felder.adresse.value));
    return daten;
  }

  function alsText(daten) {
    var zeilen = [
      'Website:  ' + (daten.get('adresse') || ''),
      'E-Mail:   ' + (daten.get('mail') || ''),
      'Name:     ' + (daten.get('name') || '—'),
      'Betrieb:  ' + (daten.get('betrieb') || '—'),
      '',
      'Nachricht:',
      (daten.get('nachricht') || '—')
    ];
    return zeilen.join('\n');
  }

  /* ------------------------------------------------------------ Wege */

  function perMail(daten) {
    var ziel = 'mailto:' + mailAdresse +
      '?subject=' + encodeURIComponent('Kostenloser Check: ' + (daten.get('adresse') || '')) +
      '&body=' + encodeURIComponent(alsText(daten));

    window.location.href = ziel;

    meldungZeigen(
      'Dein E-Mail-Programm öffnet sich mit den Angaben. Schick die Nachricht ab, ' +
      'dann haben wir alles. Falls sich nichts öffnet, schreib uns direkt an ' +
      mailAdresse + '.', 'hinweis');
  }

  function perEndpunkt(daten) {
    knopf.setAttribute('aria-disabled', 'true');
    knopf.textContent = 'Wird geschickt …';
    meldungZeigen('Einen Moment, wir nehmen die Adresse auf.');

    fetch(endpunkt, {
      method: 'POST',
      body: daten,
      headers: { 'Accept': 'application/json' }
    })
      .then(function (antwort) {
        if (!antwort.ok) throw new Error('Status ' + antwort.status);
        formular.reset();
        meldungZeigen(
          'Angekommen. Wir schauen uns die Seite an und melden uns bei dir. ' +
          'Das dauert in der Regel ein bis zwei Werktage.');
      })
      .catch(function () {
        meldungZeigen(
          'Das hat gerade nicht geklappt. Versuch es bitte noch einmal — oder ' +
          'schreib uns direkt an ' + mailAdresse + ', dann geht es genauso schnell.',
          'fehler');
      })
      .then(function () {
        knopf.removeAttribute('aria-disabled');
        knopf.textContent = 'Domain schicken';
      });
  }

  /* ---------------------------------------------------------- Absenden */

  formular.addEventListener('submit', function (e) {
    e.preventDefault();
    if (knopf.getAttribute('aria-disabled') === 'true') return;

    /* Falle: ausgefuellt heisst Maschine. Ruhig aussteigen, ohne Hinweis. */
    var falle = formular.querySelector('[name="ort_zusatz"]');
    if (falle && falle.value) return;

    var fehler = pruefen();
    if (fehler) {
      meldungZeigen('');
      fehler.focus();
      return;
    }

    var daten = angaben();
    if (endpunkt) perEndpunkt(daten);
    else perMail(daten);
  });

  /* Adresse gleich beim Verlassen des Feldes aufraeumen, damit der
     Besucher sieht, was wir daraus machen. */
  felder.adresse.addEventListener('blur', function () {
    if (!felder.adresse.value.trim()) return;
    var sauber = adresseAufraeumen(felder.adresse.value);
    if (istAdresse(sauber)) {
      felder.adresse.value = sauber;
      fehlerLoeschen(felder.adresse);
    }
  });

  /* Fehler verschwinden, sobald der Besucher nachbessert. */
  Object.keys(felder).forEach(function (name) {
    var feld = felder[name];
    var ereignis = feld.type === 'checkbox' ? 'change' : 'input';
    feld.addEventListener(ereignis, function () {
      if (feld.getAttribute('aria-invalid') === 'true') fehlerLoeschen(feld);
    });
  });
})();
