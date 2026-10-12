/**
 * ads.js — Google AdSense integration for BizTrack.
 *
 * HOW TO TURN ADS ON
 *   1. Publisher ID is set (ADS_CONFIG.client).
 *   2. In AdSense: Ads > By ad unit > Display ads, create three responsive
 *      units and paste each unit's numeric ID into ADS_CONFIG.slots below.
 *   3. Put your publisher ID in ads.txt (already filled in).
 *
 * Until step 1 is done this file does nothing, so nothing is broken and no
 * Google script is loaded.
 *
 * Where ads appear (a page opts in by adding a placeholder):
 *   <div class="ad-slot" data-ad="dashboard"></div>
 * Premium users never see ads. Nothing is shown on login, signup, setup,
 * recover, add-transaction, settings, reports, privacy or terms pages.
 */
(function () {
  'use strict';

  var ADS_CONFIG = {
    client: 'ca-pub-4642781642169453',
    slots: {
      landing:      'XXXXXXXXXX',
      dashboard:    'XXXXXXXXXX',
      transactions: 'XXXXXXXXXX'
    }
  };

  function isPlaceholder(v) { return !v || /X{6,}/.test(v); }

  function userIsPremium() {
    try { return typeof isPremium === 'function' && isPremium(); } catch (e) { return false; }
  }

  function removeSlots(nodes) {
    nodes.forEach(function (n) { n.parentNode && n.parentNode.removeChild(n); });
  }

  function init() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll('.ad-slot[data-ad]'));
    if (!nodes.length) return;

    // Not configured yet, or a Premium user: no ads, no empty gaps, no script.
    if (isPlaceholder(ADS_CONFIG.client) || userIsPremium()) { removeSlots(nodes); return; }

    var live = nodes.filter(function (n) { return !isPlaceholder(ADS_CONFIG.slots[n.getAttribute('data-ad')]); });
    removeSlots(nodes.filter(function (n) { return live.indexOf(n) === -1; }));
    if (!live.length) return;

    if (document.querySelector('script[src*="adsbygoogle.js"]')) { /* already loaded in <head> */ } else {
    var s = document.createElement('script');
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(ADS_CONFIG.client);
    // If the script is blocked (ad blockers, offline), remove the empty boxes.
    s.onerror = function () { removeSlots(live); };
    document.head.appendChild(s);
    }

    window.adsbygoogle = window.adsbygoogle || [];
    live.forEach(function (node) {
      var label = document.createElement('div');
      label.className = 'ad-label';
      label.textContent = 'Advertisement';

      var ins = document.createElement('ins');
      ins.className = 'adsbygoogle';
      ins.style.display = 'block';
      ins.setAttribute('data-ad-client', ADS_CONFIG.client);
      ins.setAttribute('data-ad-slot', ADS_CONFIG.slots[node.getAttribute('data-ad')]);
      ins.setAttribute('data-ad-format', 'auto');
      ins.setAttribute('data-full-width-responsive', 'true');

      node.appendChild(label);
      node.appendChild(ins);
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) { /* ignore */ }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
