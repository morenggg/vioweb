/* ═══════════════════════════════════════════════════════════════════
   Café Morgenmuffel — Demo
   Reines JavaScript, keine Bibliotheken, keine fremden Aufrufe.
   Ohne JavaScript bleibt die Seite vollständig lesbar und bedienbar.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var ruhig = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ── Kopfzeile: Schatten, sobald gescrollt wird ─────────────── */
  (function kopf() {
    var el = document.getElementById('kopf');
    if (!el) return;
    var offen = false;

    function pruefen() {
      offen = false;
      el.classList.toggle('kopf--geschoben', window.scrollY > 8);
    }
    window.addEventListener('scroll', function () {
      if (offen) return;
      offen = true;
      window.requestAnimationFrame(pruefen);
    }, { passive: true });
    pruefen();
  })();

  /* ── Menü für schmale Fenster ───────────────────────────────── */
  (function menue() {
    var knopf = document.getElementById('klappe');
    var nav = document.getElementById('nav');
    if (!knopf || !nav) return;

    function setzen(auf) {
      nav.dataset.offen = auf ? 'ja' : 'nein';
      knopf.setAttribute('aria-expanded', auf ? 'true' : 'false');
      document.body.classList.toggle('starr', auf);
    }

    knopf.addEventListener('click', function () {
      setzen(knopf.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setzen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && knopf.getAttribute('aria-expanded') === 'true') {
        setzen(false);
        knopf.focus();
      }
    });

    window.matchMedia('(min-width: 901px)').addEventListener('change', function (e) {
      if (e.matches) setzen(false);
    });

    setzen(false);
  })();

  /* ── Sanftes Auftauchen beim Scrollen ───────────────────────── */
  (function auftauchen() {
    var stuecke = document.querySelectorAll('.auf');
    if (!stuecke.length) return;

    if (!('IntersectionObserver' in window) || ruhig.matches) {
      Array.prototype.forEach.call(stuecke, function (s) { s.classList.add('sichtbar'); });
      return;
    }

    /* Kacheln der Galerie leicht versetzt einblenden */
    Array.prototype.forEach.call(document.querySelectorAll('.mauer .kachel'), function (k, i) {
      k.style.transitionDelay = (i % 3) * 90 + 'ms';
    });

    var wache = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('sichtbar');
        wache.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });

    Array.prototype.forEach.call(stuecke, function (s) { wache.observe(s); });
  })();

  /* ── Aktiver Punkt in der Navigation ────────────────────────── */
  (function wegweiser() {
    var verweise = document.querySelectorAll('.nav__liste a[href^="#"]');
    if (!verweise.length || !('IntersectionObserver' in window)) return;

    var karte = {};
    var ziele = [];
    Array.prototype.forEach.call(verweise, function (a) {
      var ziel = document.querySelector(a.getAttribute('href'));
      if (!ziel) return;
      karte[ziel.id] = a;
      ziele.push(ziel);
    });

    function markieren(id) {
      Array.prototype.forEach.call(verweise, function (a) { a.removeAttribute('aria-current'); });
      if (karte[id]) karte[id].setAttribute('aria-current', 'true');
    }

    var wache = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        if (e.isIntersecting) markieren(e.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    ziele.forEach(function (z) { wache.observe(z); });
  })();

  /* ── Geöffnet oder geschlossen ──────────────────────────────────
     Grundlage sind die im Bildmaterial sichtbaren Zeiten:
     Montag bis Sonntag, 9 bis 17 Uhr.                             */
  (function oeffnung() {
    var AUF = 9, ZU = 17;
    var feld = document.getElementById('stand');
    var wort = document.getElementById('standWort');
    var liste = document.getElementById('tage');
    if (!feld || !wort) return;

    function stellen() {
      var jetzt = new Date();
      var stunde = jetzt.getHours() + jetzt.getMinutes() / 60;
      var offen = stunde >= AUF && stunde < ZU;

      feld.hidden = false;
      feld.dataset.offen = offen ? 'ja' : 'nein';

      if (offen) {
        wort.textContent = 'Jetzt geöffnet · noch bis ' + ZU + ' Uhr';
      } else if (stunde < AUF) {
        wort.textContent = 'Gerade geschlossen · öffnet heute um ' + AUF + ' Uhr';
      } else {
        wort.textContent = 'Gerade geschlossen · morgen wieder ab ' + AUF + ' Uhr';
      }

      if (liste) {
        Array.prototype.forEach.call(liste.children, function (li) {
          li.classList.toggle('heute', Number(li.dataset.tag) === jetzt.getDay());
        });
      }
    }

    stellen();
    window.setInterval(stellen, 60000);
  })();

  /* ── Lupe: Bild groß ansehen ────────────────────────────────── */
  (function lupe() {
    var kasten = document.getElementById('lupe');
    var rahmen = document.getElementById('lupeRahmen');
    var bild = document.getElementById('lupeBild');
    var text = document.getElementById('lupeText');
    var zaehler = document.getElementById('lupeZaehler');
    var knopfZu = document.getElementById('lupeZu');
    var knopfVor = document.getElementById('lupeVor');
    var knopfZurueck = document.getElementById('lupeZurueck');
    var knoepfe = document.querySelectorAll('.kachel__knopf');

    if (!kasten || !knoepfe.length || typeof kasten.showModal !== 'function') return;

    var stand = 0;
    var herkunft = null;

    function zeigen(i) {
      stand = (i + knoepfe.length) % knoepfe.length;
      var k = knoepfe[stand];
      var quelle = k.querySelector('img');
      var schnitt = k.dataset.voll || (k.querySelector('.bild').className.replace('bild', '').trim());

      rahmen.className = 'lupe__rahmen bild ' + schnitt;
      bild.src = quelle.getAttribute('src');
      bild.alt = quelle.getAttribute('alt');
      text.textContent = k.dataset.text || '';
      zaehler.textContent = (stand + 1) + ' / ' + knoepfe.length;
    }

    Array.prototype.forEach.call(knoepfe, function (k, i) {
      k.addEventListener('click', function () {
        herkunft = k;
        zeigen(i);
        kasten.showModal();
      });
    });

    knopfVor.addEventListener('click', function () { zeigen(stand + 1); });
    knopfZurueck.addEventListener('click', function () { zeigen(stand - 1); });
    knopfZu.addEventListener('click', function () { kasten.close(); });

    kasten.addEventListener('click', function (e) {
      if (e.target === kasten) kasten.close();
    });

    kasten.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); zeigen(stand + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); zeigen(stand - 1); }
    });

    kasten.addEventListener('close', function () {
      if (herkunft) herkunft.focus();
    });
  })();

})();
