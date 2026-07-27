/* =========================================================================
   Vioweb — das gesamte JavaScript der Seite.

   Fuenf Teile, mehr nicht:
     1. Kontaktformular
     2. Mobilmenue (Fokusfang, Scroll-Sperre, Ausblenden)
     3. Haarlinie unter dem Kopfbereich beim Scrollen
     4. Dezentes Einblenden der Abschnitte
     5. Fortschrittsbalken am oberen Rand

   Teil 2 bis 4 sind Zugaben. Ohne JavaScript bleibt die Seite vollstaendig
   bedienbar: das Menue ist ein <details> und oeffnet nativ, das Formular
   faellt auf eine vorbefuellte E-Mail zurueck, und nichts ist versteckt.
   ========================================================================= */

/* =========================================================================
   1. Kontaktformular

   Drei Wege, in dieser Reihenfolge:
     a) Endpunkt hinterlegt -> Versand per fetch, Antwort an Ort und Stelle
     b) kein Endpunkt       -> vorbefuellte E-Mail im Mailprogramm
     c) kein JavaScript     -> das action-Attribut greift (mailto)
   ========================================================================= */
(function () {
  'use strict';

  var formular = document.getElementById('check-formular');
  if (!formular) return;

  var meldung = document.getElementById('formular-meldung');
  var knopf = formular.querySelector('.formular__senden');
  var knopfText = knopf ? knopf.innerHTML : '';
  var endpunkt = (formular.dataset.endpunkt || '').trim();
  var mailAdresse = (formular.dataset.mail || '').trim();

  var felder = {
    adresse: document.getElementById('adresse'),
    mail: document.getElementById('mail'),
    einwilligung: document.getElementById('einwilligung')
  };

  function fehlerZeigen(feld, text) {
    var ziel = document.getElementById(feld.id + '-fehler');
    if (ziel) ziel.textContent = text;
    feld.setAttribute('aria-invalid', 'true');
  }
  function fehlerLoeschen(feld) {
    var ziel = document.getElementById(feld.id + '-fehler');
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
    var w = (wert || '').trim().replace(/\s+/g, '');
    if (!w) return '';
    if (!/^https?:\/\//i.test(w)) w = 'https://' + w;
    return w;
  }
  function istAdresse(wert) {
    try {
      var u = new URL(wert);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
      return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/i
        .test(u.hostname);
    } catch (e) { return false; }
  }
  function istMail(wert) { return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test((wert || '').trim()); }

  /* Fehler stehen neben dem betroffenen Feld und sagen, was fehlt —
     nicht "Ungueltige Eingabe". */
  /* Bei "neue Website" gibt es noch keine Adresse — dann ist das Feld
     freiwillig. Bei "bestehende Website pruefen" ist es Pflicht. */
  function adressePflicht() {
    var gewaehlt = formular.querySelector('[name="anliegen"]:checked');
    return !gewaehlt || /bestehende/i.test(gewaehlt.value);
  }

  function pruefen() {
    var ersterFehler = null;
    var adresse = adresseAufraeumen(felder.adresse.value);

    if (!felder.adresse.value.trim()) {
      if (adressePflicht()) {
        fehlerZeigen(felder.adresse, 'Trag hier die Adresse deiner Website ein, zum Beispiel beispiel.de');
        ersterFehler = ersterFehler || felder.adresse;
      } else {
        fehlerLoeschen(felder.adresse);
      }
    } else if (!istAdresse(adresse)) {
      fehlerZeigen(felder.adresse, 'Das sieht noch nicht nach einer Adresse aus. So sollte sie aussehen: beispiel.de');
      ersterFehler = ersterFehler || felder.adresse;
    } else {
      felder.adresse.value = adresse;
      fehlerLoeschen(felder.adresse);
    }

    if (!felder.mail.value.trim()) {
      fehlerZeigen(felder.mail, 'Ohne deine E-Mail können wir dir nicht antworten.');
      ersterFehler = ersterFehler || felder.mail;
    } else if (!istMail(felder.mail.value)) {
      fehlerZeigen(felder.mail, 'Da fehlt noch etwas. Eine E-Mail sieht so aus: name@beispiel.de');
      ersterFehler = ersterFehler || felder.mail;
    } else {
      fehlerLoeschen(felder.mail);
    }

    if (!felder.einwilligung.checked) {
      fehlerZeigen(felder.einwilligung, 'Setz bitte den Haken. Ohne dein Einverständnis dürfen wir deine Angaben nicht verarbeiten.');
      ersterFehler = ersterFehler || felder.einwilligung;
    } else {
      fehlerLoeschen(felder.einwilligung);
    }
    return ersterFehler;
  }

  function angaben() {
    var daten = new FormData(formular);
    daten.delete('_redirect');
    daten.delete('ort_zusatz');
    daten.set('adresse', adresseAufraeumen(felder.adresse.value));
    return daten;
  }

  function perMail(daten) {
    var text = [
      'Website:  ' + (daten.get('adresse') || ''),
      'E-Mail:   ' + (daten.get('mail') || ''),
      'Name:     ' + (daten.get('name') || '—'),
      'Betrieb:  ' + (daten.get('betrieb') || '—'),
      '', 'Nachricht:', (daten.get('nachricht') || '—')
    ].join('\n');

    window.location.href = 'mailto:' + mailAdresse +
      '?subject=' + encodeURIComponent('Ersteinschätzung: ' + (daten.get('adresse') || '')) +
      '&body=' + encodeURIComponent(text);

    meldungZeigen('Dein E-Mail-Programm öffnet sich mit den Angaben. Schick die ' +
      'Nachricht ab, dann haben wir alles. Falls sich nichts öffnet, schreib ' +
      'uns direkt an ' + mailAdresse + '.', 'hinweis');
  }

  function perEndpunkt(daten) {
    knopf.setAttribute('aria-disabled', 'true');
    knopf.textContent = 'Wird geschickt …';
    meldungZeigen('Einen Moment, wir nehmen die Adresse auf.');

    fetch(endpunkt, { method: 'POST', body: daten, headers: { 'Accept': 'application/json' } })
      .then(function (a) { if (!a.ok) throw new Error('Status ' + a.status); })
      .then(function () {
        formular.reset();
        meldungZeigen('Angekommen. Wir sehen uns die Seite an und melden uns, ' +
          'in der Regel innerhalb von ein bis zwei Werktagen.');
      })
      .catch(function () {
        meldungZeigen('Das hat gerade nicht geklappt. Versuch es bitte noch einmal, ' +
          'oder schreib uns direkt an ' + mailAdresse + '.', 'fehler');
      })
      .then(function () {
        knopf.removeAttribute('aria-disabled');
        knopf.innerHTML = knopfText;
      });
  }

  formular.addEventListener('submit', function (e) {
    e.preventDefault();
    if (knopf.getAttribute('aria-disabled') === 'true') return;

    /* Falle: ausgefuellt heisst Maschine. Ruhig aussteigen, ohne Hinweis. */
    var falle = formular.querySelector('[name="ort_zusatz"]');
    if (falle && falle.value) return;

    var fehler = pruefen();
    if (fehler) { meldungZeigen(''); fehler.focus(); return; }

    var daten = angaben();
    if (endpunkt) perEndpunkt(daten); else perMail(daten);
  });

  /* Beschriftung und Pflichtmarke folgen der Auswahl. Ohne das stuende
     "Pflicht" an einem Feld, das gerade keines ist. */
  function anliegenUebernehmen() {
    var pflicht = adressePflicht();
    var marke = formular.querySelector('#feld-adresse .pflicht');
    var beschriftung = formular.querySelector('label[for="adresse"]');
    if (marke) marke.hidden = !pflicht;
    if (beschriftung) {
      beschriftung.childNodes[0].nodeValue =
        pflicht ? 'Adresse deiner Website ' : 'Bestehende Adresse, falls vorhanden ';
    }
    if (!pflicht) fehlerLoeschen(felder.adresse);
  }
  Array.prototype.forEach.call(
    formular.querySelectorAll('[name="anliegen"]'),
    function (r) { r.addEventListener('change', anliegenUebernehmen); });
  anliegenUebernehmen();

  felder.adresse.addEventListener('blur', function () {
    if (!felder.adresse.value.trim()) return;
    var sauber = adresseAufraeumen(felder.adresse.value);
    if (istAdresse(sauber)) { felder.adresse.value = sauber; fehlerLoeschen(felder.adresse); }
  });

  Object.keys(felder).forEach(function (name) {
    var feld = felder[name];
    feld.addEventListener(feld.type === 'checkbox' ? 'change' : 'input', function () {
      if (feld.getAttribute('aria-invalid') === 'true') fehlerLoeschen(feld);
    });
  });
})();

/* =========================================================================
   2. Off-Canvas-Menue

   Das <details> traegt den Zustand — damit funktioniert das Menue auch
   ohne dieses Skript. Ergaenzt werden hier vier Dinge, die ein <details>
   allein nicht kann:

     - Scroll-Sperre, damit die Seite dahinter nicht wegrutscht
     - Fokusfang, damit die Tabulatortaste im Menue bleibt
     - Escape und Klick auf den Schleier zum Schliessen
     - eine Ausblendbewegung: <details> entfernt seinen Inhalt sofort,
       deshalb wird das Schliessen kurz verzoegert
   ========================================================================= */
(function () {
  'use strict';

  var menue = document.getElementById('menue');
  if (!menue) return;

  var knopf = menue.querySelector('summary');
  var tafel = menue.querySelector('.menue__tafel');
  var vorher = null;
  var sanft = window.matchMedia('(prefers-reduced-motion: reduce)');

  function fokussierbare() {
    return Array.prototype.filter.call(
      tafel.querySelectorAll('a[href], button, input, select, textarea'),
      function (el) { return el.offsetParent !== null; });
  }

  function auf() { return menue.hasAttribute('open'); }

  function zu() {
    if (!auf() || menue.classList.contains('geht')) return;

    var fertig = function () {
      menue.classList.remove('geht');
      menue.removeAttribute('open');
      document.body.classList.remove('starr');
      if (vorher && document.contains(vorher)) vorher.focus();
      vorher = null;
    };

    if (sanft.matches) { fertig(); return; }
    menue.classList.add('geht');
    window.setTimeout(fertig, 320);   /* deckt sich mit --mittel-zeit */
  }

  /* Der native Umschalter von <details> wuerde das Menue ohne
     Ausblendbewegung schliessen. Deshalb faengt der Klick ab und
     uebernimmt das Schliessen selbst. */
  knopf.addEventListener('click', function (e) {
    if (!auf()) return;
    e.preventDefault();
    zu();
  });

  menue.addEventListener('toggle', function () {
    if (!auf()) { document.body.classList.remove('starr'); return; }
    vorher = document.activeElement;
    document.body.classList.add('starr');
    var erste = fokussierbare()[0];
    if (erste) erste.focus();
  });

  /* Verweis gewaehlt: schliessen, damit das Sprungziel sichtbar wird. */
  tafel.addEventListener('click', function (e) {
    if (e.target.closest('a')) zu();
  });

  document.addEventListener('click', function (e) {
    if (auf() && e.target.closest('[data-menue-zu]')) zu();
  });

  document.addEventListener('keydown', function (e) {
    if (!auf()) return;

    if (e.key === 'Escape') { e.preventDefault(); zu(); return; }
    if (e.key !== 'Tab') return;

    var liste = [knopf].concat(fokussierbare());
    var erste = liste[0], letzte = liste[liste.length - 1];
    if (e.shiftKey && document.activeElement === erste) { e.preventDefault(); letzte.focus(); }
    else if (!e.shiftKey && document.activeElement === letzte) { e.preventDefault(); erste.focus(); }
  });

  window.matchMedia('(min-width: 1000px)').addEventListener('change', function (e) {
    if (e.matches && auf()) {
      menue.removeAttribute('open');
      document.body.classList.remove('starr');
    }
  });
})();

/* =========================================================================
   3. Haarlinie unter dem Kopfbereich, sobald gescrollt wird.
   ========================================================================= */
(function () {
  'use strict';
  var kopf = document.getElementById('kopf');
  if (!kopf || !('IntersectionObserver' in window)) return;

  var wache = document.createElement('div');
  wache.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none';
  wache.setAttribute('aria-hidden', 'true');
  document.body.prepend(wache);

  new IntersectionObserver(function (e) {
    kopf.classList.toggle('gescrollt', !e[0].isIntersecting);
  }).observe(wache);
})();

/* =========================================================================
   4. Einblenden beim Scrollen.

   Der unsichtbare Ausgangszustand wird erst gesetzt, wenn dieses Skript
   laeuft UND IntersectionObserver vorhanden ist. Dazu ein Sicherheitsnetz
   nach zwei Sekunden. Sichtbarkeit von Inhalt darf nie vom Zustand einer
   Animation abhaengen.
   ========================================================================= */
(function () {
  'use strict';
  if (!('IntersectionObserver' in window)) return;

  var bloecke = document.querySelectorAll(
    '.teil .spalte, .tafel, .band__liste, .kontakt__flaeche');
  if (!bloecke.length) return;

  document.documentElement.classList.add('bereit');
  bloecke.forEach(function (el) { el.classList.add('zeigen'); });

  var beobachter = new IntersectionObserver(function (eintraege, selbst) {
    eintraege.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('da');
      selbst.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -5% 0px' });

  bloecke.forEach(function (el) { beobachter.observe(el); });

  window.setTimeout(function () {
    bloecke.forEach(function (el) { el.classList.add('da'); });
  }, 2000);
})();


/* =========================================================================
   5. Fortschrittsbalken am oberen Rand.

   Der Balken liegt fest ueber der Seite und nimmt keinen Platz im Fluss
   ein — er kann deshalb nichts verschieben. Aktualisiert wird nur einmal
   pro Bildaufbau ueber requestAnimationFrame; ein Scroll-Ereignis loest
   sonst dutzende Neuberechnungen pro Sekunde aus.
   ========================================================================= */
(function () {
  'use strict';
  var balken = document.getElementById('fortschritt');
  if (!balken) return;

  var wartet = false;

  function messen() {
    wartet = false;
    var hoehe = document.documentElement.scrollHeight - window.innerHeight;
    var anteil = hoehe > 0 ? Math.min(Math.max(window.scrollY / hoehe, 0), 1) : 0;
    balken.style.transform = 'scaleX(' + anteil.toFixed(4) + ')';
  }

  function anstossen() {
    if (wartet) return;
    wartet = true;
    window.requestAnimationFrame(messen);
  }

  window.addEventListener('scroll', anstossen, { passive: true });
  window.addEventListener('resize', anstossen, { passive: true });
  messen();
})();
