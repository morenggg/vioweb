/* =========================================================================
   Vioweb — das gesamte JavaScript der Seite.

   Fuenf Teile, mehr nicht:
     1. Kontaktformular
     2. Schublade im Kopfbereich
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
    anliegen: document.getElementById('anliegen'),
    eigenes: document.getElementById('eigenes'),
    adresse: document.getElementById('adresse'),
    mail: document.getElementById('mail'),
    einwilligung: document.getElementById('einwilligung')
  };
  var feldEigenes = document.getElementById('feld-eigenes');

  /* Bei diesen Auswahlen gibt es keinen festen Leistungsumfang. Dann
     brauchen wir eine Beschreibung, sonst ist die Anfrage nicht
     beantwortbar. */
  var OFFEN = ['Weitere Leistung', 'Individuelle Funktion', 'Sonstiges'];
  function brauchtBeschreibung() {
    return felder.anliegen ? OFFEN.indexOf(felder.anliegen.value) > -1 : false;
  }

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
  /* Die Adresse ist nur dort Pflicht, wo es schon eine Website gibt.
     Bei "Landingpage" oder "Unternehmenswebsite" waere sie eine Huerde
     ohne Zweck. */
  var OHNE_WEBSITE = ['Landingpage', 'Unternehmenswebsite', 'Online-Shop',
                      'Mehrsprachige Website', 'Beratung', 'Sonstiges',
                      'Weitere Leistung', 'Individuelle Funktion'];
  function adressePflicht() {
    if (!felder.anliegen || !felder.anliegen.value) return false;
    return OHNE_WEBSITE.indexOf(felder.anliegen.value) === -1;
  }

  function pruefen() {
    var ersterFehler = null;
    var adresse = adresseAufraeumen(felder.adresse.value);

    if (felder.anliegen && !felder.anliegen.value) {
      fehlerZeigen(felder.anliegen, 'Wähl bitte aus, worum es geht.');
      ersterFehler = ersterFehler || felder.anliegen;
    } else if (felder.anliegen) {
      fehlerLoeschen(felder.anliegen);
    }

    if (felder.eigenes && brauchtBeschreibung() && !felder.eigenes.value.trim()) {
      fehlerZeigen(felder.eigenes, 'Beschreib bitte kurz, worum es geht.');
      ersterFehler = ersterFehler || felder.eigenes;
    } else if (felder.eigenes) {
      fehlerLoeschen(felder.eigenes);
    }

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
      'Anliegen: ' + (daten.get('anliegen') || '—'),
      (daten.get('eigenes') ? 'Und zwar: ' + daten.get('eigenes') : ''),
      'Website:  ' + (daten.get('adresse') || ''),
      'E-Mail:   ' + (daten.get('mail') || ''),
      'Name:     ' + (daten.get('name') || '—'),
      'Betrieb:  ' + (daten.get('betrieb') || '—'),
      '', 'Nachricht:', (daten.get('nachricht') || '—')
    ].filter(function (z) { return z !== ''; }).join('\n');

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
    var frei = formular.querySelector('#feld-adresse .freiwillig');
    var beschriftung = formular.querySelector('label[for="adresse"]');
    if (marke) marke.hidden = !pflicht;
    if (frei) frei.hidden = pflicht;
    if (beschriftung) {
      beschriftung.childNodes[0].nodeValue =
        pflicht ? 'Adresse deiner Website ' : 'Adresse deiner Website ';
    }
    if (!pflicht) fehlerLoeschen(felder.adresse);
  }
  /* Das Zusatzfeld erscheint nur, wenn die Auswahl keinen festen Umfang
     hat. Ohne JavaScript bleibt es sichtbar und damit ausfuellbar; das
     hidden-Attribut setzt erst das Skript. */
  function zusatzfeldUebernehmen() {
    if (!feldEigenes) return;
    var noetig = brauchtBeschreibung();
    if (noetig === !feldEigenes.hidden) return;
    feldEigenes.hidden = !noetig;
    if (felder.eigenes) {
      felder.eigenes.required = noetig;
      if (!noetig) { felder.eigenes.value = ''; fehlerLoeschen(felder.eigenes); }
    }
  }
  if (feldEigenes) feldEigenes.hidden = true;

  if (felder.anliegen) {
    felder.anliegen.addEventListener('change', function () {
      anliegenUebernehmen();
      zusatzfeldUebernehmen();
    });
  }
  anliegenUebernehmen();
  zusatzfeldUebernehmen();

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
   2. Schublade im Kopfbereich

   Das <details> traegt den Zustand — damit funktioniert die Navigation auch
   ohne dieses Skript: der Knopf oeffnet und schliesst sie nativ. Ergaenzt
   wird hier, was ein <details> allein nicht kann:

     - Schliessen bei Klick auf den Schleier
     - Schliessen mit Escape, danach Fokus zurueck auf den Knopf
     - Fokusfang, solange die Schublade offen ist
     - Scroll-Sperre fuer die Seite dahinter
     - weiche Ausfahrt: <details> raeumt den Inhalt sofort aus dem Baum,
       deshalb bleibt open noch stehen, bis die Bewegung durch ist
     - aria-expanded, damit Hilfsmittel den Zustand ansagen

   Das gehoert zu einer Schublade, die den Bildschirm ausfuellt, und nicht
   zu einem Feld, das unter dem Knopf haengt. Bei einer frueheren Fassung
   als Dropdown war beides bewusst draussen.
   ========================================================================= */
(function () {
  'use strict';

  var menue = document.getElementById('menue');
  if (!menue) return;

  var knopf = menue.querySelector('summary');
  var tafel = menue.querySelector('.menue__tafel');
  var schleier = menue.querySelector('.menue__schleier');
  var ruhig = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Alles, was den Fokus annehmen kann — der Knopf gehoert dazu, weil er in
     der Kopfleiste der Schublade sitzt und dort das Kreuz ist. */
  function fokussierbar() {
    var liste = [knopf];
    var f = tafel.querySelectorAll('a[href], button, input, select, textarea');
    for (var i = 0; i < f.length; i++) liste.push(f[i]);
    return liste;
  }

  function auf() { return menue.hasAttribute('open'); }

  /* Die Sperre haengt am <html>, nicht am <body>: manche Browser machen den
     Body sonst selbst zum Scrollbereich. Die Schublade scrollt weiter, dafuer
     sorgt overscroll-behavior im CSS. */
  function sperre(an) {
    document.documentElement.style.overflow = an ? 'hidden' : '';
  }

  var laeuft = false;

  function zu(fokusZurueck) {
    if (!auf() || laeuft) return;

    function fertig() {
      menue.classList.remove('menue--zu');
      menue.removeAttribute('open');
      sperre(false);
      laeuft = false;
      if (fokusZurueck) knopf.focus();
    }

    if (ruhig.matches) { fertig(); return; }

    laeuft = true;
    menue.classList.add('menue--zu');

    /* Auf das Ende der Bewegung warten. Der Zeitgeber ist das Netz darunter,
       falls kein animationend kommt — sonst bliebe die Schublade haengen. */
    var erledigt = false;
    function einmal() {
      if (erledigt) return;
      erledigt = true;
      tafel.removeEventListener('animationend', einmal);
      fertig();
    }
    tafel.addEventListener('animationend', einmal);
    setTimeout(einmal, 600);
  }

  menue.addEventListener('toggle', function () {
    knopf.setAttribute('aria-expanded', auf() ? 'true' : 'false');
    if (auf()) sperre(true);
  });

  /* Der Knopf schliesst ueber denselben Weg wie alles andere, damit die
     Ausfahrt auch beim zweiten Antippen laeuft. Das <details> wuerde sonst
     sofort zuklappen. */
  knopf.addEventListener('click', function (e) {
    if (!auf()) return;
    e.preventDefault();
    zu(false);
  });

  schleier.addEventListener('click', function () { zu(true); });

  /* Verweis gewaehlt: schliessen, damit das Ziel sichtbar wird. Ohne
     Bewegung, sonst laeuft die Ausfahrt gegen den Seitenwechsel. */
  tafel.addEventListener('click', function (e) {
    if (!e.target.closest('a')) return;
    menue.removeAttribute('open');
    sperre(false);
  });

  document.addEventListener('keydown', function (e) {
    if (!auf()) return;

    if (e.key === 'Escape') { e.preventDefault(); zu(true); return; }
    if (e.key !== 'Tab') return;

    /* Fokusfang: der Rundlauf bleibt in der Schublade. */
    var liste = fokussierbar();
    var erste = liste[0], letzte = liste[liste.length - 1];
    if (e.shiftKey && document.activeElement === erste) {
      e.preventDefault(); letzte.focus();
    } else if (!e.shiftKey && document.activeElement === letzte) {
      e.preventDefault(); erste.focus();
    }
  });

  /* Wandert der Fokus trotzdem hinaus — etwa ueber die Suchleiste des
     Browsers — dann zurueck auf den Knopf statt die Schublade zu schliessen.
     Ein Wechsel auf ein Bedienelement dahinter waere sonst unsichtbar. */
  document.addEventListener('focusin', function (e) {
    if (auf() && !menue.contains(e.target)) knopf.focus();
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
