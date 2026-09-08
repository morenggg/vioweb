/* =========================================================================
   Campus — Geruest und Router.

   Aufgaben:
     1. Grundpfad bestimmen (/uni, egal wo die App liegt)
     2. Adresse in eine Ansicht uebersetzen
     3. Kopf, Inhalt und Tableiste setzen
     4. Verweise abfangen, damit nichts neu geladen wird
     5. Alle Klicks auf data-tun aus einer Hand behandeln
     6. Schnellmenue und Blaetter

   Direktaufrufe funktionieren trotzdem: unter jeder Adresse liegt eine
   echte index.html mit demselben Geruest. Der Router entscheidet danach
   nur noch, was hineinkommt. Ohne JavaScript zeigt jede Seite den
   Hinweis im <noscript>.
   ========================================================================= */
window.Uni = window.Uni || {};

Uni.app = (function () {
  'use strict';

  var b = Uni.baustein;
  var z = Uni.zustand;
  var q = Uni.abfrage;
  var esc = b.esc;

  /* Der Grundpfad kommt aus dem eigenen Skriptverweis. Damit laeuft die
     App unter vioweb.de/uni genauso wie in einer Vorschau darunter. */
  var BASIS = (function () {
    var s = document.currentScript ? document.currentScript.src : '';
    var t = s.split('/js/app.js')[0];
    try { return new URL(t).pathname.replace(/\/$/, ''); } catch (e) { return '/uni'; }
  })();

  var wurzel, kopfEl, inhaltEl, leisteEl, blattEl;
  var chatEntwurf = {};
  var letzterPfad = null;

  /* ------------------------------------------------- Adressen */

  function pfadVon(adresse) {
    var p = adresse.split('?')[0].split('#')[0];
    if (p.indexOf(BASIS) === 0) p = p.slice(BASIS.length);
    return p.replace(/^\/|\/$/g, '');
  }

  function ziel(pfad) {
    return BASIS + (pfad ? '/' + pfad : '') + (pfad ? '/' : '/');
  }

  var TABELLE = {
    '':            Uni.ansicht.home,
    'studium':     Uni.ansicht.studium,
    'modul':       function (c) { return c.teile[1] ? Uni.ansicht.modul(c) : Uni.ansicht.studium(c); },
    'kalender':    Uni.ansicht.kalender,
    'entdecken':   Uni.ansicht.entdecken,
    'material':    function (c) { return c.teile[1] ? Uni.ansicht.material(c) : Uni.ansicht.materialListe(c); },
    'service':     function (c) { return c.teile[1] ? Uni.ansicht.service(c) : Uni.ansicht.serviceListe(c); },
    'flohmarkt':   function (c) { return c.teile[1] ? Uni.ansicht.artikel(c) : Uni.ansicht.flohmarkt(c); },
    'profil':      Uni.ansicht.profil,
    'inbox':       Uni.ansicht.inbox,
    'suche':       Uni.ansicht.suche,
    'onboarding':  Uni.ansicht.onboarding
  };

  /* ------------------------------------------------- Kopf */

  /* Tageszeit plus Name aus dem Profil. Ist kein Name hinterlegt,
     gruesst die App ohne Namen — es wird keiner erfunden. */
  function grussformel() {
    var h = new Date().getHours();
    var tageszeit = h < 5 ? 'Gute Nacht' : h < 11 ? 'Guten Morgen' : h < 18 ? 'Hallo' : 'Guten Abend';
    var name = z.name();
    return tageszeit + (name ? ', ' + name : '');
  }

  function kopfHtml(kopf) {
    if (kopf === false) return '';
    var ungelesen = q.ungeleseneNachrichten();
    var briefKnopf =
      '<a class="u-rundknopf" href="' + ziel('inbox') + '" aria-label="Nachrichten' +
        (ungelesen ? ', ' + ungelesen + ' ungelesen' : '') + '">' + b.zeichen('brief', 21) +
        (ungelesen ? '<span class="u-rundknopf__punkt"></span>' : '') + '</a>';

    if (kopf.art === 'home') {
      var d = new Date();
      return '<div class="u-kopf__reihe">' +
          '<div class="u-kopf__text">' +
            '<p class="u-kopf__gruss">' + esc(grussformel()) + '</p>' +
            '<p class="u-kopf__datum">' + esc(b.WOCHENTAG_KURZ[d.getDay()] + ', ' + d.getDate() + '. ' + b.MONAT[d.getMonth()]) + '</p>' +
          '</div>' + briefKnopf +
        '</div>' +
        '<a class="u-suchfeld" href="' + ziel('suche') + '">' + b.zeichen('lupe', 18) +
          '<span>Module, Materialien, Leute …</span></a>';
    }

    var aktion = '';
    if (kopf.aktion) {
      aktion = '<button type="button" class="u-rundknopf" data-tun="' + esc(kopf.aktion.tun) + '" ' +
        'aria-label="' + esc(kopf.aktion.text) + '">' + b.zeichen(kopf.aktion.zeichen, 22) + '</button>';
    }

    return '<div class="u-kopf__reihe">' +
      (kopf.zurueck ? '<a class="u-kopf__zurueck" href="' + esc(kopf.zurueck) + '" aria-label="Zurück">' + b.zeichen('zurueck', 22) + '</a>' : '') +
      '<div class="u-kopf__text"><p class="u-kopf__gruss">' + esc(kopf.titel || '') + '</p></div>' +
      '<a class="u-rundknopf" href="' + ziel('suche') + '" aria-label="Suchen">' + b.zeichen('lupe', 21) + '</a>' +
      (aktion || briefKnopf) +
    '</div>';
  }

  /* ------------------------------------------------- Tableiste */

  function leisteHtml(pfad) {
    var ungelesen = q.ungeleseneNachrichten();
    var punkte = [
      { text: 'Home',     zeichen: 'haus',     pfad: '',         ziel: ziel('') },
      { text: 'Studium',  zeichen: 'buch',     pfad: 'studium',  ziel: ziel('studium'), auch: ['modul'] },
      { text: 'Neu',      zeichen: 'plus',     plus: true },
      { text: 'Kalender', zeichen: 'kalender', pfad: 'kalender', ziel: ziel('kalender') },
      { text: 'Profil',   zeichen: 'person',   pfad: 'profil',   ziel: ziel('profil'), punkt: ungelesen > 0 }
    ];
    var wurzelPfad = pfad.split('/')[0];

    return punkte.map(function (p) {
      if (p.plus) {
        return '<button type="button" class="u-leiste__punkt u-leiste__plus" data-tun="schnellmenue" ' +
          'aria-expanded="false" aria-haspopup="dialog">' +
          '<span data-block>' + b.zeichen('plus', 20) + '</span><span>' + esc(p.text) + '</span></button>';
      }
      var aktiv = wurzelPfad === p.pfad || (p.auch && p.auch.indexOf(wurzelPfad) > -1);
      return '<a class="u-leiste__punkt" href="' + p.ziel + '"' + (aktiv ? ' aria-current="page"' : '') + '>' +
        b.zeichen(p.zeichen, 22) + '<span>' + esc(p.text) + '</span>' +
        (p.punkt ? '<span class="u-leiste__punkt-marke"></span>' : '') + '</a>';
    }).join('');
  }

  /* ------------------------------------------------- Zeichnen */

  function zeichnen() {
    var pfad = pfadVon(location.pathname);
    var teile = pfad ? pfad.split('/') : [''];
    var ctx = { pfad: pfad, teile: teile, frage: new URLSearchParams(location.search) };

    /* Beim allerersten Aufruf zuerst die drei Fragen stellen. */
    if (!z.onboardingFertig() && teile[0] !== 'onboarding') {
      history.replaceState({}, '', ziel('onboarding'));
      return zeichnen();
    }

    var fn = TABELLE[teile[0]];
    var ansicht = fn ? fn(ctx) : Uni.ansicht.nichtGefunden();

    document.title = (ansicht.titel ? ansicht.titel + ' · ' : '') + 'Campus';
    kopfEl.innerHTML = kopfHtml(ansicht.kopf);
    kopfEl.hidden = ansicht.kopf === false;
    inhaltEl.innerHTML = '<div class="u-wechsel">' + ansicht.html + '</div>';
    leisteEl.hidden = ansicht.leiste === false;
    leisteEl.innerHTML = ansicht.leiste === false ? '' : leisteHtml(pfad);

    if (letzterPfad !== pfad) {
      window.scrollTo(0, 0);
      if (letzterPfad !== null) inhaltEl.focus({ preventScroll: true });
    }
    letzterPfad = pfad;

    if (ansicht.blatt) blattOeffnen(ansicht.blatt);
    else blattSchliessen(true);

    kopfStand();
  }

  function gehe(adresse, ersetzen) {
    if (ersetzen) history.replaceState({}, '', adresse);
    else history.pushState({}, '', adresse);
    zeichnen();
  }

  /* Fragezeichen-Werte aendern, ohne die Adresse neu zu bauen. */
  function frageSetzen(name, wert) {
    var f = new URLSearchParams(location.search);
    if (wert) f.set(name, wert); else f.delete(name);
    var s = f.toString();
    gehe(location.pathname + (s ? '?' + s : ''), true);
  }

  /* ------------------------------------------------- Blatt */

  var letzterFokus = null;

  function blattOeffnen(inhalt) {
    letzterFokus = document.activeElement;
    blattEl.innerHTML =
      '<div class="u-blatt__schleier" data-tun="blatt-schliessen"></div>' +
      '<div class="u-blatt__tafel" role="dialog" aria-modal="true" aria-label="' + esc(inhalt.titel) + '">' +
        '<div class="u-blatt__griff"></div>' +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:.5rem;margin-bottom:.6rem">' +
          '<h2 class="u-blatt__titel">' + esc(inhalt.titel) + '</h2>' +
          '<button type="button" class="u-rundknopf" data-tun="blatt-schliessen" aria-label="Schließen">' +
            b.zeichen('kreuz', 20) + '</button>' +
        '</div>' + inhalt.html +
      '</div>';
    blattEl.hidden = false;
    document.body.style.overflow = 'hidden';
    var erstes = blattEl.querySelector('button, a, input, select, textarea');
    if (erstes) erstes.focus();
  }

  function blattSchliessen(still) {
    if (blattEl.hidden) return;
    blattEl.hidden = true;
    blattEl.innerHTML = '';
    document.body.style.overflow = '';
    if (!still && letzterFokus && letzterFokus.focus) letzterFokus.focus();
    /* Ein Blatt, das ueber die Adresse geoeffnet wurde, muss dort auch
       wieder verschwinden — sonst kommt es beim naechsten Zeichnen zurueck. */
    if (!still && new URLSearchParams(location.search).get('hinzufuegen')) frageSetzen('hinzufuegen', null);
  }

  /* Inhalte des Schnellmenues. Jeder Punkt fuehrt zu einem kleinen
     Formular — abgeschickt wird im Prototyp nichts. */
  function schnellmenue() {
    var punkte = [
      { art: 'material',  titel: 'Material', text: 'Lernzettel, Zusammenfassung, Formelsammlung', zeichen: 'ordner' },
      { art: 'service',   titel: 'Service', text: 'Nachhilfe, Korrektur, Hilfe anbieten', zeichen: 'blitz' },
      { art: 'flohmarkt', titel: 'Flohmarkt', text: 'Etwas verkaufen oder verschenken', zeichen: 'tasche' },
      { art: 'beitrag',   titel: 'Beitrag', text: 'Frage, Hinweis oder Empfehlung', zeichen: 'sprech' }
    ];
    return {
      titel: 'Neu',
      html: punkte.map(function (p) {
        return '<button type="button" class="u-blatt__punkt" data-tun="neu" data-wert="' + p.art + '">' +
          '<span class="u-blatt__kachel">' + b.zeichen(p.zeichen, 19) + '</span>' +
          '<span><b>' + esc(p.titel) + '</b><span>' + esc(p.text) + '</span></span>' +
          b.zeichen('weiter', 18) + '</button>';
      }).join('') +
      '<div style="padding-top:var(--s-md)">' +
        b.hinweis('Zum Einstellen brauchst du eine bestätigte Hochschul-Adresse. Deine ist bestätigt.') +
      '</div>'
    };
  }

  /* Formular-Geruest fuer die vier Wege. Die Felder sind echt und
     bedienbar; gespeichert wird nichts. */
  function neuBlatt(art) {
    var module = q.meineModule();
    var titel = { material: 'Material einstellen', service: 'Service anbieten', flohmarkt: 'Artikel einstellen', beitrag: 'Beitrag schreiben' }[art];

    var felder =
      feld('titel', 'Titel', 'text', { material: 'Zusammenfassung Statistik II', service: 'Nachhilfe Statistik', flohmarkt: 'Taschenrechner TI-30', beitrag: 'Worum geht es?' }[art]);

    if (art !== 'beitrag') {
      felder += '<div class="u-feld"><label for="neu-preis">Preis in Euro</label>' +
        '<input type="number" id="neu-preis" min="0" step="0.5" placeholder="' + (art === 'flohmarkt' ? '12' : '4,99') + '">' +
        '<span class="u-feld__hinweis">' + (art === 'flohmarkt'
          ? 'Bezahlt wird bei der Übergabe, nicht über die App.'
          : 'Vorschlag auf Basis vergleichbarer Angebote: 3,99 € bis 6,99 €.') + '</span></div>';
    }

    if (art === 'material' || art === 'service' || art === 'beitrag') {
      felder += '<div class="u-feld"><label for="neu-modul">Modul' + (art === 'material' ? ' (optional)' : '') + '</label>' +
        '<select id="neu-modul"><option value="">Kein Modul</option>' +
        module.map(function (m) { return '<option value="' + esc(m.slug) + '">' + esc(m.name) + '</option>'; }).join('') +
        '</select><span class="u-feld__hinweis">Bei klarem Studienbezug empfehlen wir eine Zuordnung.</span></div>';
    }

    if (art === 'beitrag') {
      felder += '<div class="u-feld"><label for="neu-typ">Art</label><select id="neu-typ">' +
        '<option>Frage</option><option>Hinweis</option><option>Empfehlung</option></select></div>';
    }

    felder += '<div class="u-feld"><label for="neu-text">Beschreibung</label>' +
      '<textarea id="neu-text" placeholder="Worum geht es genau?"></textarea></div>';

    var hinweis = art === 'material'
      ? b.hinweis('<b>Hausarbeiten werden vor der Veröffentlichung geprüft.</b> Sie gelten als Referenzmaterial und nicht als Abgabe.', 'warn')
      : b.hinweis('<b>Prototyp.</b> Es gibt keinen Server: Dieses Formular speichert und veröffentlicht nichts.');

    return {
      titel: titel,
      html: '<form data-tun="neu-senden">' + felder + hinweis +
        '<button type="submit" class="u-knopf u-knopf--breit" style="margin-top:var(--s-md)">Weiter</button>' +
        '</form>'
    };

    function feld(id, beschriftung, typ, platzhalter) {
      return '<div class="u-feld"><label for="neu-' + id + '">' + esc(beschriftung) + '</label>' +
        '<input type="' + typ + '" id="neu-' + id + '" placeholder="' + esc(platzhalter) + '"></div>';
    }
  }

  function meldung(titel, text) {
    blattOeffnen({
      titel: titel,
      html: '<p style="font-size:.95rem;line-height:1.6;color:var(--text-leise);max-width:44ch">' + text + '</p>' +
        '<button type="button" class="u-knopf u-knopf--breit" style="margin-top:var(--s-lg)" data-tun="blatt-schliessen">Verstanden</button>'
    });
  }

  /* ------------------------------------------------- Handlungen */

  var handlungen = {
    'schnellmenue': function () { blattOeffnen(schnellmenue()); },
    'blatt-schliessen': function () { blattSchliessen(); },
    'neu': function (el) { blattOeffnen(neuBlatt(el.dataset.wert)); },

    'pin': function (el) { z.pinUmschalten(el.dataset.wert); zeichnen(); },
    'favorit': function (el) { z.favoritUmschalten(el.dataset.wert); zeichnen(); },
    'folgen': function (el) { z.folgenUmschalten(el.dataset.wert); zeichnen(); },

    'modul-suchen': function () { blattOeffnen(Uni.ansicht.modulBlatt()); },
    'modul-hinzufuegen': function (el) {
      z.modulHinzufuegen(el.dataset.wert);
      blattSchliessen(true);
      gehe(ziel('modul/' + el.dataset.wert));
    },
    'modul-vorschlagen': function () {
      meldung('Modul vorschlagen',
        'Du gibst Name, Dozent und Semester an. Der Vorschlag ist sichtbar, sobald ihn mehrere Studenten deiner Hochschule bestätigt haben. ' +
        '<b>Im Prototyp wird nichts übermittelt.</b>');
    },

    'kaufen': function (el) {
      var slug = el.dataset.wert;
      blattOeffnen({
        titel: 'Kaufen',
        html: '<p style="font-size:.95rem;line-height:1.6;color:var(--text-leise);max-width:44ch">' +
            '<b style="color:var(--text)">Es ist kein Zahlungsanbieter angebunden.</b> ' +
            'Im Prototyp wird nichts abgebucht und nichts gespeichert. Du kannst das Material trotzdem freischalten, ' +
            'um zu sehen, wie es danach in deinen Dateien liegt.</p>' +
          '<button type="button" class="u-knopf u-knopf--breit" style="margin-top:var(--s-lg)" ' +
            'data-tun="kauf-vormerken" data-wert="' + esc(slug) + '">Im Prototyp freischalten</button>' +
          '<button type="button" class="u-knopf u-knopf--still u-knopf--breit" style="margin-top:.5rem" ' +
            'data-tun="blatt-schliessen">Abbrechen</button>'
      });
    },
    'kauf-vormerken': function (el) { z.kaufMerken(el.dataset.wert); blattSchliessen(true); zeichnen(); },

    'anfragen': function () {
      meldung('Anfrage schreiben',
        'Anfragen laufen als Chat. Du schreibst, was du brauchst, und klärst Termin und Preis direkt mit der anderen Person. ' +
        'Im Prototyp kannst du dir das in der <a href="' + ziel('inbox') + '" style="color:var(--marke);font-weight:600">Inbox</a> ansehen.');
    },
    'service-anbieten': function () {
      blattOeffnen(neuBlatt('service'));
    },
    'artikel-einstellen': function () { blattOeffnen(neuBlatt('flohmarkt')); },

    'filter-typ': function (el) { frageSetzen('typ', el.dataset.wert); },
    'filter-sortierung': function (el) { frageSetzen('sortierung', el.dataset.wert); },
    'filter-kategorie': function (el) { frageSetzen('kategorie', el.dataset.wert); },

    'haken': function (el) {
      var grund = (el.dataset.grund || '').split(',').filter(function (x) { return x !== ''; }).map(Number);
      z.hakenUmschalten(el.dataset.wert, Number(el.dataset.nr), grund);
      zeichnen();
    },

    'thema': function (el) { z.themaSetzen(el.dataset.wert); zeichnen(); },
    'benachrichtigungen': function (el) { z.benachrichtigungenSetzen(el.dataset.wert); zeichnen(); },
    'zuruecksetzen': function () {
      z.zuruecksetzen();
      z.themaAnwenden();
      chatEntwurf = {};
      gehe(ziel(''));
    },

    'onboarding-fertig': function (el) {
      z.onboardingSpeichern({
        name: el.dataset.name,
        hochschule: el.dataset.hochschule,
        studiengang: el.dataset.studiengang,
        fach: el.dataset.fach || null,
        semester: Number(el.dataset.semester)
      });
      gehe(ziel(''), true);
    },

    'module-zuruecksetzen': function () {
      z.moduleAbleiten();
      meldung('Module abgeleitet',
        'Deine Modulliste ergibt sich jetzt wieder aus Studiengang, Fach und Semester.');
    }
  };

  /* ------------------------------------------------- Ereignisse */

  function klick(e) {
    var tun = e.target.closest ? e.target.closest('[data-tun]') : null;
    if (tun && tun.tagName !== 'FORM' && handlungen[tun.dataset.tun]) {
      e.preventDefault();
      handlungen[tun.dataset.tun](tun);
      return;
    }

    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

    var url;
    try { url = new URL(a.href, location.href); } catch (err) { return; }
    if (url.origin !== location.origin) return;

    /* In den Ansichten stehen die Verweise als /uni/... . Liegt die App
       woanders, werden sie hier auf den erkannten Grundpfad gehoben. */
    var pfad = url.pathname;
    if (BASIS !== '/uni' && pfad.indexOf('/uni') === 0) pfad = BASIS + pfad.slice(4);
    if (pfad.indexOf(BASIS) !== 0) return;

    e.preventDefault();
    if (!blattEl.hidden) blattSchliessen(true);
    if (pfad + url.search === location.pathname + location.search) { zeichnen(); return; }
    gehe(pfad + url.search);
  }

  function absenden(e) {
    var f = e.target.closest('form[data-tun]');
    if (!f) return;
    e.preventDefault();
    var tun = f.dataset.tun;

    if (tun === 'suche-senden') {
      var text = f.querySelector('input[name="q"]').value;
      z.sucheMerken(text);
      gehe(ziel('suche') + (text ? '?q=' + encodeURIComponent(text) : ''), true);
      var feld = document.getElementById('suche-eingabe');
      if (feld) { feld.focus(); feld.setSelectionRange(feld.value.length, feld.value.length); }
      return;
    }

    if (tun === 'chat-senden') {
      var eingabe = f.querySelector('input[name="text"]');
      var wert = eingabe.value.trim();
      if (!wert) return;
      var id = f.dataset.wert;
      chatEntwurf[id] = (chatEntwurf[id] || []).concat([{ von: 'ich', text: wert, zeit: 'gerade eben' }]);
      Uni.app.chatEntwurf = chatEntwurf;
      zeichnen();
      var neu = document.getElementById('chat-eingabe');
      if (neu) neu.focus();
      var chat = document.querySelector('.u-chat');
      if (chat) chat.lastElementChild.scrollIntoView({ block: 'nearest' });
      return;
    }

    if (tun === 'onboarding-name') {
      var nf = f.querySelector('input[name="name"]');
      gehe(f.dataset.weiter.replace(/([?&]name=)[^&]*/, '$1' + encodeURIComponent(nf.value.trim())));
      return;
    }

    if (tun === 'neu-senden') {
      blattSchliessen(true);
      meldung('Noch kein Server',
        'Die Eingaben sind vollständig, es gibt aber nichts, wohin sie gehen könnten. ' +
        'Sobald ein Backend angebunden ist, entsteht hier ein echter Eintrag mit Prüfung, Freigabe und Bearbeitung.');
    }
  }

  function taste(e) {
    if (e.key === 'Escape' && !blattEl.hidden) { e.preventDefault(); blattSchliessen(); }
    /* Fokus bleibt im offenen Blatt. */
    if (e.key === 'Tab' && !blattEl.hidden) {
      var fokussierbar = blattEl.querySelectorAll('a[href], button, input, select, textarea');
      if (!fokussierbar.length) return;
      var erstes = fokussierbar[0], letztes = fokussierbar[fokussierbar.length - 1];
      if (e.shiftKey && document.activeElement === erstes) { e.preventDefault(); letztes.focus(); }
      else if (!e.shiftKey && document.activeElement === letztes) { e.preventDefault(); erstes.focus(); }
    }
  }

  function kopfStand() {
    if (!kopfEl) return;
    kopfEl.dataset.gescrollt = window.scrollY > 4 ? 'ja' : 'nein';
  }

  /* ------------------------------------------------- Start */

  function start() {
    wurzel = document.getElementById('app');
    if (!wurzel) return;

    wurzel.innerHTML =
      '<a class="u-sprung" href="#inhalt">Zum Inhalt springen</a>' +
      '<header class="u-kopf" id="kopf"></header>' +
      '<main class="u-inhalt" id="inhalt" tabindex="-1"></main>' +
      '<nav class="u-leiste" id="leiste" aria-label="Hauptbereiche"></nav>' +
      '<div class="u-blatt" id="blatt" hidden></div>';

    kopfEl = document.getElementById('kopf');
    inhaltEl = document.getElementById('inhalt');
    leisteEl = document.getElementById('leiste');
    blattEl = document.getElementById('blatt');

    z.laden();
    z.themaAnwenden();

    document.addEventListener('click', klick);
    document.addEventListener('submit', absenden);
    document.addEventListener('keydown', taste);
    window.addEventListener('popstate', function () { blattSchliessen(true); zeichnen(); });
    window.addEventListener('scroll', kopfStand, { passive: true });

    zeichnen();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  return { gehe: gehe, zeichnen: zeichnen, chatEntwurf: chatEntwurf, BASIS: BASIS };
})();
