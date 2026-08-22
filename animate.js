/**
 * animate.js
 * Shared, dependency-free motion behavior for BizTrack:
 *  1. Reveals cards/sections with a subtle fade+slide as they enter
 *     view (also picks up content added later by page scripts).
 *  2. Animates stat numbers counting up whenever their text changes,
 *     so range-filter switches and initial loads feel alive instead
 *     of just snapping.
 * No dependency on storage.js/app.js — safe to include anywhere.
 */

(function () {
  'use strict';

  var REVEAL_SELECTORS = [
    '.hero > div',
    '.hero-preview',
    '.section .section-heading',
    '.steps-grid > *',
    '.features-grid > *',
    '.stat-grid > *',
    '.dashboard-grid > *',
    '.report-summary-grid > *',
    '.report-charts-grid > *',
    '.settings-section',
    '#recent-txn-list > *',
    '#full-txn-list > *',
    '#income-breakdown-list > *',
    '#expense-breakdown-list > *',
    '.auth-card'
  ].join(', ');

  var io = null;
  var staggerCounters = new WeakMap();

  function nextStaggerIndex(parent) {
    var n = staggerCounters.get(parent) || 0;
    staggerCounters.set(parent, n + 1);
    return n;
  }

  function prepareElement(el) {
    if (!el || el.classList.contains('anim-reveal') || el.dataset.animReady === '1') return;
    el.dataset.animReady = '1';
    el.classList.add('anim-reveal');
    var parent = el.parentElement;
    var index = parent ? nextStaggerIndex(parent) : 0;
    var delay = Math.min(index * 55, 330);
    el.style.transitionDelay = delay + 'ms';
    if (io) io.observe(el);
  }

  function initReveal() {
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
      );
    }

    document.querySelectorAll(REVEAL_SELECTORS).forEach(prepareElement);

    // Pick up elements rendered later by page-specific scripts
    // (e.g. transaction rows, breakdown lists added after load).
    var mo = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          if (node.matches && node.matches(REVEAL_SELECTORS)) {
            prepareElement(node);
          }
          if (node.querySelectorAll) {
            node.querySelectorAll(REVEAL_SELECTORS).forEach(prepareElement);
          }
        });
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // Fallback: if IntersectionObserver isn't available, just show everything.
    if (!io) {
      document.querySelectorAll('.anim-reveal').forEach(function (el) {
        el.classList.add('is-visible');
      });
    }
  }

  /* ---------- Stat count-up ---------- */

  var COUNT_UP_IDS = [
    'stat-income', 'stat-expenses', 'stat-profit', 'stat-count',
    'flow-income-value', 'flow-expense-value',
    'report-income', 'report-expenses', 'report-profit'
  ];

  function animateCountUp(el, toText, onDone) {
    var match = toText.match(/^([^\d\-]*)(-?[\d,]+(?:\.\d+)?)(.*)$/);
    if (!match) { if (onDone) onDone(); return; }
    var prefix = match[1];
    var target = parseFloat(match[2].replace(/,/g, ''));
    var suffix = match[3];
    if (isNaN(target)) { if (onDone) onDone(); return; }

    var duration = 550;
    var startTime = null;
    el.classList.add('anim-counting');

    function tick(now) {
      if (startTime === null) startTime = now;
      var progress = Math.min((now - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(target * eased);
      el.textContent = prefix + Math.abs(current).toLocaleString() + suffix;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        // Final write — happens exactly once, then we stop for good.
        el.textContent = prefix + Math.abs(Math.round(target)).toLocaleString() + suffix;
        el.classList.remove('anim-counting');
        if (onDone) onDone();
      }
    }
    requestAnimationFrame(tick);
  }

  function watchCountUp(id) {
    var el = document.getElementById(id);
    if (!el) return;

    var lastKnown = el.textContent; // the last value WE consider "settled"
    var isAnimating = false;
    var pendingText = null; // a newer target that arrived mid-animation

    function runAnimation(toText) {
      isAnimating = true;
      lastKnown = toText;
      animateCountUp(el, toText, function () {
        isAnimating = false;
        if (pendingText !== null && pendingText !== lastKnown) {
          var next = pendingText;
          pendingText = null;
          runAnimation(next);
        } else {
          pendingText = null;
        }
      });
    }

    var observer = new MutationObserver(function () {
      var toText = el.textContent;
      // Our own final write echoes back here — since it matches what we
      // already consider settled, this is where the old version looped
      // forever. Ignoring a no-op change is what makes it actually stop.
      if (toText === lastKnown) return;
      if (isAnimating) {
        pendingText = toText;
        return;
      }
      runAnimation(toText);
    });
    observer.observe(el, { childList: true, characterData: true, subtree: true });
  }

  function initCountUp() {
    COUNT_UP_IDS.forEach(watchCountUp);
  }

  function init() {
    initReveal();
    initCountUp();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
