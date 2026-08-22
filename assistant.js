/**
 * assistant.js
 * BizTrack's built-in assistant. Fully local and free — no API key,
 * no network calls, no data ever leaves the browser. It answers
 * questions about your transactions and can add new ones via chat,
 * using the exact same storage.js data layer as the rest of the app.
 */

(function () {
  'use strict';

  // Only show the assistant where there's real business data to talk about.
  if (
    typeof isLoggedIn !== 'function' || !isLoggedIn() ||
    typeof isSetupComplete !== 'function' || !isSetupComplete()
  ) {
    return;
  }

  const RANGE_LABELS = { today: 'today', week: 'this week', month: 'this month', year: 'this year', all: 'all time' };

  let pendingTransaction = null; // holds a parsed-but-unconfirmed transaction

  /* ---------- Styles ---------- */
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #biztrack-assistant-fab {
        position: fixed; bottom: 24px; right: 24px; width: 56px; height: 56px;
        border-radius: 50%; background: var(--color-primary, #1B5E42); color: #fff;
        border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
        box-shadow: 0 8px 24px rgba(0,0,0,0.2); z-index: 9998; transition: transform 0.15s ease;
      }
      #biztrack-assistant-fab:hover { transform: scale(1.06); }
      #biztrack-assistant-fab svg { width: 26px; height: 26px; }

      #biztrack-assistant-panel {
        position: fixed; bottom: 92px; right: 24px; width: 360px; max-width: calc(100vw - 32px);
        height: 480px; max-height: calc(100vh - 140px); background: var(--color-surface, #fff);
        border-radius: 16px; box-shadow: 0 16px 48px rgba(0,0,0,0.22); z-index: 9999;
        display: none; flex-direction: column; overflow: hidden; font-family: var(--font-body, Inter, sans-serif);
        border: 1px solid rgba(0,0,0,0.06);
      }
      #biztrack-assistant-panel.is-open { display: flex; }

      .btai-header {
        background: var(--color-primary, #1B5E42); color: #fff; padding: 14px 16px;
        display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
      }
      .btai-header-title { font-family: var(--font-display, Sora, sans-serif); font-weight: 700; font-size: 0.95rem; display:flex; align-items:center; gap:8px; }
      .btai-close-btn { background: none; border: none; color: #fff; cursor: pointer; opacity: 0.85; padding: 4px; display:flex; }
      .btai-close-btn:hover { opacity: 1; }

      .btai-messages { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 10px; background: var(--color-bg, #F7F7F5); }

      .btai-msg { max-width: 85%; padding: 9px 12px; border-radius: 12px; font-size: 0.86rem; line-height: 1.45; white-space: pre-wrap; }
      .btai-msg--bot { background: #fff; border: 1px solid rgba(0,0,0,0.08); align-self: flex-start; border-bottom-left-radius: 4px; color: var(--color-text, #1a1a1a); }
      .btai-msg--user { background: var(--color-primary, #1B5E42); color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; }

      .btai-suggestions { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 14px 10px; flex-shrink: 0; }
      .btai-chip { border: 1px solid rgba(0,0,0,0.12); background: #fff; border-radius: 999px; padding: 6px 10px; font-size: 0.76rem; cursor: pointer; color: var(--color-text, #1a1a1a); }
      .btai-chip:hover { border-color: var(--color-primary, #1B5E42); color: var(--color-primary, #1B5E42); }

      .btai-input-row { display: flex; gap: 8px; padding: 12px; border-top: 1px solid rgba(0,0,0,0.08); flex-shrink: 0; background: #fff; }
      .btai-input { flex: 1; border: 1px solid rgba(0,0,0,0.15); border-radius: 10px; padding: 9px 12px; font-size: 0.86rem; font-family: inherit; outline: none; }
      .btai-input:focus { border-color: var(--color-primary, #1B5E42); }
      .btai-send-btn { background: var(--color-primary, #1B5E42); color: #fff; border: none; border-radius: 10px; width: 38px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
      .btai-send-btn svg { width: 16px; height: 16px; }

      @media (max-width: 900px) {
        /* Your .mobile-nav bar takes over the bottom of the screen at this
           same breakpoint — push the widget up above it instead of
           overlapping it (which was blocking taps on the nav bar). */
        #biztrack-assistant-fab {
          right: 16px;
          bottom: calc(76px + env(safe-area-inset-bottom));
        }
        #biztrack-assistant-panel {
          right: 16px;
          left: 16px;
          width: auto;
          bottom: calc(144px + env(safe-area-inset-bottom));
          max-height: calc(100vh - 220px);
        }
      }
    `;
    document.head.appendChild(style);
  }

  /* ---------- DOM scaffold ---------- */
  function buildWidget() {
    const fab = document.createElement('button');
    fab.id = 'biztrack-assistant-fab';
    fab.type = 'button';
    fab.setAttribute('aria-label', 'Open BizTrack Assistant');
    fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>';

    const panel = document.createElement('div');
    panel.id = 'biztrack-assistant-panel';
    panel.innerHTML =
      '<div class="btai-header">' +
        '<span class="btai-header-title">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>' +
          'BizTrack Assistant' +
        '</span>' +
        '<button class="btai-close-btn" type="button" aria-label="Close assistant">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="btai-messages" id="btai-messages"></div>' +
      '<div class="btai-suggestions" id="btai-suggestions"></div>' +
      '<div class="btai-input-row">' +
        '<input type="text" class="btai-input" id="btai-input" placeholder="Ask about your business..." autocomplete="off" />' +
        '<button class="btai-send-btn" id="btai-send-btn" type="button" aria-label="Send">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>' +
        '</button>' +
      '</div>';

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    fab.addEventListener('click', function () { togglePanel(true); });
    panel.querySelector('.btai-close-btn').addEventListener('click', function () { togglePanel(false); });

    const input = panel.querySelector('#btai-input');
    const sendBtn = panel.querySelector('#btai-send-btn');
    sendBtn.addEventListener('click', handleUserInput);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') handleUserInput();
    });

    renderSuggestions();
    greet();
  }

  function togglePanel(open) {
    const panel = document.getElementById('biztrack-assistant-panel');
    panel.classList.toggle('is-open', open);
    if (open) document.getElementById('btai-input').focus();
  }

  function greet() {
    const business = getBusiness();
    addGreetingMessage('Hi! I\'m your BizTrack assistant for ' + (business.name || 'your business') + '. Ask me about your income, expenses or profit \u2014 or tell me to add a transaction.');
  }

  function renderSuggestions() {
    const wrap = document.getElementById('btai-suggestions');
    const suggestions = ["What's my profit this month?", 'Top expense category', 'How much did I spend this week?', 'Add a transaction'];
    wrap.innerHTML = '';
    suggestions.forEach(function (s) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'btai-chip';
      chip.textContent = s;
      chip.addEventListener('click', function () {
        document.getElementById('btai-input').value = s;
        handleUserInput();
      });
      wrap.appendChild(chip);
    });
  }

  /* ---------- Message rendering ---------- */
  function addUserMessage(text) { appendMessage(text, 'user'); }
  function addBotMessage(text) { appendMessage(text, 'bot'); }

  /** Only used for the static, developer-authored greeting — wraps the
   *  emoji in a span so it can get its own wave animation. Regular chat
   *  messages stay on the textContent path below for safety. */
  function addGreetingMessage(text) {
    const list = document.getElementById('btai-messages');
    const bubble = document.createElement('div');
    bubble.className = 'btai-msg btai-msg--bot';
    const wave = document.createElement('span');
    wave.className = 'btai-wave-emoji';
    wave.textContent = '\uD83D\uDC4B';
    bubble.appendChild(wave);
    bubble.appendChild(document.createTextNode(' ' + text));
    list.appendChild(bubble);
    list.scrollTop = list.scrollHeight;
  }

  function appendMessage(text, who) {
    const list = document.getElementById('btai-messages');
    const bubble = document.createElement('div');
    bubble.className = 'btai-msg btai-msg--' + who;
    bubble.textContent = text;
    list.appendChild(bubble);
    list.scrollTop = list.scrollHeight;
    return bubble;
  }

  /* ---------- Input handling ---------- */
  function handleUserInput() {
    const input = document.getElementById('btai-input');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    addUserMessage(text);

    if (pendingTransaction) {
      handlePendingResponse(text);
      return;
    }
    respondTo(text);
  }

  function handlePendingResponse(text) {
    const lower = text.trim().toLowerCase();
    if (/^y(es)?$/.test(lower)) {
      confirmPendingTransaction();
    } else if (/^n(o)?$/.test(lower) || lower.indexOf('cancel') !== -1) {
      pendingTransaction = null;
      addBotMessage("Okay, I won't save that. Anything else?");
    } else {
      pendingTransaction = null;
      addBotMessage('I\'ve cancelled that unsaved entry so I don\'t guess wrong. Try rephrasing, e.g. "add expense 5000 for fuel today".');
    }
  }

  function confirmPendingTransaction() {
    const txn = saveTransaction(pendingTransaction);
    pendingTransaction = null;
    addBotMessage('Saved! ' + (txn.type === 'income' ? '+' : '-') + formatCurrency(txn.amount) + ' \u2014 ' + txn.description + ' (' + txn.category + ').');
  }

  /* ---------- Intent parsing ---------- */
  function detectRange(text) {
    if (/\btoday\b/.test(text)) return 'today';
    if (/\bthis week\b|\bweek\b/.test(text)) return 'week';
    if (/\bthis year\b|\byear\b/.test(text)) return 'year';
    if (/\ball time\b|\boverall\b|\bever\b/.test(text)) return 'all';
    if (/\bthis month\b|\bmonth\b/.test(text)) return 'month';
    return 'month'; // sensible default, matches the dashboard's default range
  }

  function findMatchingCategory(text, categories) {
    const lower = text.toLowerCase();
    return categories.find(function (c) { return lower.indexOf(c.toLowerCase()) !== -1; }) || null;
  }

  function allKnownCategories() {
    const txns = getTransactions();
    const set = {};
    txns.forEach(function (t) { if (t.category) set[t.category] = true; });
    return Object.keys(set);
  }

  function respondTo(rawText) {
    const text = rawText.toLowerCase();

    // --- Add transaction intent ---
    const addKeywords = /(^|\s)(add|log|record|enter)(\s|$)/;
    const expenseWords = /(spent|spend|expense|paid|bought|purchase)/;
    const incomeWords = /(income|earned|received|got paid|sale|sold|revenue)/;

    if (addKeywords.test(text) || expenseWords.test(text) || incomeWords.test(text)) {
      const amountMatch = rawText.match(/[\d,]+(?:\.\d+)?/);
      if (amountMatch) {
        const amount = parseFloat(amountMatch[0].replace(/,/g, ''));
        if (amount > 0) {
          const type = expenseWords.test(text) ? 'expense' : (incomeWords.test(text) ? 'income' : null);
          if (!type) {
            addBotMessage('Is that income or an expense? Try: "add expense 5000 for fuel" or "add income 20000 customer payment".');
            return;
          }
          buildPendingTransaction(rawText, amount, type);
          return;
        }
      }
      addBotMessage('What amount should I log? For example: "add expense 5000 for fuel today".');
      return;
    }

    // --- Profit ---
    if (/profit/.test(text)) {
      const range = detectRange(text);
      const txns = getTransactionsByDateRange(range);
      const profit = calculateProfit(txns);
      addBotMessage('Your profit ' + RANGE_LABELS[range] + ' is ' + formatCurrency(profit) + '.');
      return;
    }

    // --- Top category ---
    if (/(top|highest|biggest)/.test(text) && /categor/.test(text)) {
      const type = /income/.test(text) ? 'income' : 'expense';
      const range = detectRange(text);
      const txns = getTransactionsByDateRange(range);
      const breakdown = getBreakdownByCategory(txns, type);
      if (breakdown.length === 0) {
        addBotMessage('No ' + type + ' recorded ' + RANGE_LABELS[range] + ' yet.');
      } else {
        addBotMessage('Your top ' + type + ' category ' + RANGE_LABELS[range] + ' is "' + breakdown[0].category + '" at ' + formatCurrency(breakdown[0].amount) + '.');
      }
      return;
    }

    // --- Count ---
    if (/(how many|number of|count)/.test(text) && /transaction/.test(text)) {
      const range = detectRange(text);
      const txns = getTransactionsByDateRange(range);
      addBotMessage('You have ' + txns.length + ' transaction' + (txns.length === 1 ? '' : 's') + ' ' + RANGE_LABELS[range] + '.');
      return;
    }

    // --- Expenses (with optional category) ---
    if (/expense|spend|spent|spending/.test(text)) {
      const range = detectRange(text);
      const txns = getTransactionsByDateRange(range);
      const category = findMatchingCategory(text, allKnownCategories());
      const filtered = category ? txns.filter(function (t) { return t.type === 'expense' && t.category === category; }) : txns;
      const total = calculateExpenses(filtered);
      if (category) {
        addBotMessage('You spent ' + formatCurrency(total) + ' on ' + category + ' ' + RANGE_LABELS[range] + '.');
      } else {
        addBotMessage('Your total expenses ' + RANGE_LABELS[range] + ' are ' + formatCurrency(total) + '.');
      }
      return;
    }

    // --- Income ---
    if (/income|earn|revenue|made|sales/.test(text)) {
      const range = detectRange(text);
      const txns = getTransactionsByDateRange(range);
      const category = findMatchingCategory(text, allKnownCategories());
      const filtered = category ? txns.filter(function (t) { return t.type === 'income' && t.category === category; }) : txns;
      const total = calculateIncome(filtered);
      if (category) {
        addBotMessage('You made ' + formatCurrency(total) + ' from ' + category + ' ' + RANGE_LABELS[range] + '.');
      } else {
        addBotMessage('Your total income ' + RANGE_LABELS[range] + ' is ' + formatCurrency(total) + '.');
      }
      return;
    }

    // --- Help / fallback ---
    addBotMessage('I can answer things like "profit this month", "top expense category", "how much did I spend on fuel this week", or "add expense 5000 for fuel today". What would you like to know?');
  }

  function buildPendingTransaction(rawText, amount, type) {
    // Date
    let date = todayISO();
    if (/yesterday/i.test(rawText)) {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      date = d.toISOString().split('T')[0];
    }

    // Category: try to match against categories already used before
    const knownCategories = allKnownCategories();
    let category = findMatchingCategory(rawText, knownCategories);

    // Description: text after "for", else strip filler words
    let description = null;
    const forMatch = rawText.match(/\bfor\s+(.+)/i);
    if (forMatch) {
      description = forMatch[1].replace(/\btoday\b|\byesterday\b/gi, '').trim();
    }
    if (!description) {
      description = rawText
        .replace(/\b(add|log|record|enter|expense|income|spent|spend|paid|bought|purchase|earned|received|sale|sold|revenue|today|yesterday)\b/gi, '')
        .replace(/[\d,]+(?:\.\d+)?/, '')
        .trim();
    }
    if (!description) description = category || (type === 'income' ? 'Income' : 'Expense');
    if (!category) category = description.charAt(0).toUpperCase() + description.slice(1);

    description = description.charAt(0).toUpperCase() + description.slice(1);

    pendingTransaction = {
      type: type,
      amount: amount,
      description: description,
      category: category,
      paymentMethod: 'Other',
      date: date
    };

    addBotMessage(
      'Log this ' + (type === 'income' ? 'income' : 'expense') + '?\n' +
      (type === 'income' ? '+' : '-') + formatCurrency(amount) + ' \u2014 ' + description + '\n' +
      'Category: ' + category + ' \u00b7 Date: ' + formatDate(date) + '\n\n' +
      'Reply "yes" to save or "no" to cancel.'
    );
  }

  /* ---------- Init ---------- */
  function init() {
    injectStyles();
    buildWidget();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
