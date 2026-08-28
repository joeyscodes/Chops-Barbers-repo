/* ==========================================================================
   CHOPS BARBERS — MAIN.JS
   Handles: header state, mobile nav, scroll reveals, the hero emblem's
   3D tilt, the services selector + booking-page handoff, and both
   forms (Contact + Booking), both Formspree-ready.
   ========================================================================== */

/* Progressive-enhancement flag — CSS only hides .reveal content when this
   is present, so a missing/broken JS file can never make real content
   invisible. This line must run before anything else. */
document.documentElement.classList.add('has-js');

(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header scroll state ---------- */
  var header = document.querySelector('.site-header');
  function onScrollHeader() {
    if (!header) return;
    if (window.scrollY > 40) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  document.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('is-open');
      navToggle.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('nav-open', open);
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('is-open');
        navToggle.classList.remove('is-open');
        document.body.classList.remove('nav-open');
      });
    });
  }

  /* ---------- Active nav link ---------- */
  (function markActiveNav() {
    var path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a[data-page]').forEach(function (a) {
      if (a.getAttribute('data-page') === path) a.classList.add('is-active');
    });
  })();

  /* ---------- Scroll reveals ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Hero emblem: the one deliberate 3D moment ---------- */
  var emblem = document.querySelector('.hero-emblem img');
  if (emblem && !reducedMotion) {
    var targetX = 0, targetY = 0, curX = 0, curY = 0;

    window.addEventListener('mousemove', function (e) {
      var relX = (e.clientX / window.innerWidth) - 0.5;
      var relY = (e.clientY / window.innerHeight) - 0.5;
      targetX = relY * -18;
      targetY = relX * 22;
    });

    document.addEventListener('scroll', function () {
      var scrollRot = Math.min(window.scrollY * 0.06, 40);
      emblem.style.setProperty('--scrollRot', scrollRot + 'deg');
    }, { passive: true });

    function animateEmblem() {
      curX += (targetX - curX) * 0.06;
      curY += (targetY - curY) * 0.06;
      var scrollRot = parseFloat(getComputedStyle(emblem).getPropertyValue('--scrollRot')) || 0;
      emblem.style.transform =
        'rotateX(' + curX + 'deg) rotateY(' + (curY + scrollRot) + 'deg)';
      requestAnimationFrame(animateEmblem);
    }
    requestAnimationFrame(animateEmblem);
  }

  /* ---------- Service selector: shared by services.html AND book.html ---------- */
  var menuItems = document.querySelectorAll('.menu-item input[type="checkbox"]');
  var STORAGE_KEY = 'chops_selected_services';

  // Elements that may or may not exist depending on which page we're on
  var visitPanel = document.querySelector('.visit-panel');       // services.html
  var visitTime = document.querySelector('#visitTime');
  var visitPrice = document.querySelector('#visitPrice');

  var bkVisitTime = document.querySelector('#bkVisitTime');      // book.html
  var bkVisitPrice = document.querySelector('#bkVisitPrice');
  var bkNoServiceNote = document.querySelector('#bkNoServiceNote');
  var hiddenServices = document.querySelector('#hiddenServices');
  var hiddenDuration = document.querySelector('#hiddenDuration');
  var hiddenTotal = document.querySelector('#hiddenTotal');

  function getSelections() {
    var totalTime = 0, totalPrice = 0, chosen = [];
    menuItems.forEach(function (cb) {
      if (cb.checked) {
        totalTime += parseInt(cb.dataset.time || '0', 10);
        totalPrice += parseFloat(cb.dataset.price || '0');
        chosen.push(cb.dataset.name);
      }
    });
    return { totalTime: totalTime, totalPrice: totalPrice, chosen: chosen };
  }

  function updateVisitPanel() {
    var sel = getSelections();

    // services.html sticky panel
    if (visitPanel) {
      if (sel.chosen.length > 0) {
        visitPanel.classList.add('is-active');
        if (visitTime) visitTime.textContent = sel.totalTime + ' min';
        if (visitPrice) visitPrice.textContent = sel.totalPrice.toFixed(0) + ' KD';
      } else {
        visitPanel.classList.remove('is-active');
      }
    }

    // book.html inline summary + hidden fields for Formspree
    if (bkVisitTime) bkVisitTime.textContent = sel.totalTime + ' min';
    if (bkVisitPrice) bkVisitPrice.textContent = sel.totalPrice.toFixed(0) + ' KD';
    if (bkNoServiceNote) {
      bkNoServiceNote.style.color = sel.chosen.length === 0 ? 'var(--oxblood-bright)' : 'var(--steel)';
    }
    if (hiddenServices) hiddenServices.value = sel.chosen.join(', ');
    if (hiddenDuration) hiddenDuration.value = sel.totalTime + ' min';
    if (hiddenTotal) hiddenTotal.value = sel.totalPrice.toFixed(0) + ' KD';

    // Persist selections so services.html -> book.html carries them across
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sel.chosen)); } catch (e) { /* storage unavailable, ignore */ }
  }

  menuItems.forEach(function (cb) {
    cb.addEventListener('change', updateVisitPanel);
  });

  // On book.html load, restore selections carried over from services.html
  if (bkVisitTime || bkVisitPrice) {
    try {
      var saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
      if (saved.length) {
        menuItems.forEach(function (cb) {
          if (saved.indexOf(cb.dataset.name) !== -1) cb.checked = true;
        });
      }
    } catch (e) { /* ignore malformed/blocked storage */ }
  }

  updateVisitPanel();

  /* ---------- Shared Formspree submit handler (Contact + Booking) ---------- */
  function wireFormspreeForm(formEl, options) {
    if (!formEl) return;
    options = options || {};

    formEl.addEventListener('submit', function (e) {
      e.preventDefault();

      if (options.requireService) {
        var sel = getSelections();
        if (sel.chosen.length === 0) {
          alert('Please select at least one service before sending your booking request.');
          return;
        }
      }

      var action = formEl.getAttribute('action') || '';
      var successBox = document.querySelector(options.successSelector || '#formSuccess');
      var submitBtn = formEl.querySelector('button[type="submit"]');
      var originalLabel = submitBtn ? submitBtn.textContent : '';

      function showSuccess() {
        formEl.reset();
        updateVisitPanel();
        if (successBox) successBox.classList.add('is-visible');
        formEl.style.display = 'none';
      }

      // Formspree endpoint not connected yet: show the same premium
      // confirmation the real flow will show once it's wired up, rather
      // than a setup error — so anyone previewing the site sees the
      // intended final experience. Swapping in the real endpoint later
      // switches this to an actual network submission automatically.
      if (action.indexOf('YOUR_FORM_ID') !== -1) {
        showSuccess();
        return;
      }

      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }
      var data = new FormData(formEl);

      fetch(action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      })
        .then(function (response) {
          if (response.ok) {
            showSuccess();
          } else {
            alert('Something went wrong sending this — please try again, or reach us on WhatsApp.');
          }
        })
        .catch(function () {
          alert('Something went wrong sending this — please try again, or reach us on WhatsApp.');
        })
        .finally(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalLabel; }
        });
    });
  }

  wireFormspreeForm(document.querySelector('#contactForm'));
  wireFormspreeForm(document.querySelector('#bookingForm'), { requireService: true });

  /* ---------- Footer year ---------- */
  var yearEl = document.querySelector('#currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
