/**
 * faq-bot.js
 * Self-contained floating FAQ chat bubble. Matches whatever the person
 * types against a list of preset questions/answers using simple keyword
 * scoring — no backend, no API key, works fully offline.
 *
 * Drop this file in and add:
 *   <script src="faq-bot.js"></script>
 * near the bottom of any page's <body> (after your other scripts).
 * It injects its own styles and markup, so nothing else needs to change.
 *
 * To edit what the bot knows, just edit the FAQ_ITEMS list below —
 * each entry is a set of keywords to match on, plus the answer to show.
 */

(function () {
  const FAQ_ITEMS = [
    {
      keywords: ['add', 'transaction', 'record', 'sale', 'expense', 'income', 'new'],
      answer: 'Tap "+ Add Transaction" in the sidebar (or the + button on mobile), choose Income or Expense, fill in the amount and details, then hit Save.'
    },
    {
      keywords: ['pin', 'forgot', 'forget', 'reset', 'password', 'login', 'locked', 'access'],
      answer: 'If you forgot your PIN, go to the sign-in page and tap "Forgot your PIN?" — you\'ll need the recovery code you saved when you created your account.'
    },
    {
      keywords: ['recovery', 'code', 'backup'],
      answer: 'Your recovery code was shown once when you signed up. It\'s the only way to reset your PIN, so keep it somewhere safe — it can\'t be recovered if lost.'
    },
    {
      keywords: ['export', 'csv', 'download', 'backup', 'data'],
      answer: 'You can export all your transactions as a CSV file from Reports or Settings — look for the "Export CSV" button.'
    },
    {
      keywords: ['currency', 'money', 'naira', 'dollar', 'change currency'],
      answer: 'You can change your business currency anytime in Settings > Business Info.'
    },
    {
      keywords: ['dark', 'light', 'theme', 'mode', 'color', 'appearance'],
      answer: 'You can switch between Light and Dark mode in Settings > Appearance.'
    },
    {
      keywords: ['logo', 'business logo', 'image', 'picture'],
      answer: 'Upload or change your business logo in Settings > Business Info > Change logo.'
    },
    {
      keywords: ['delete', 'remove', 'clear', 'erase', 'wipe'],
      answer: 'To delete a single transaction, use the trash icon next to it in Transactions. To erase everything, use "Clear Data" in Settings — this cannot be undone.'
    },
    {
      keywords: ['report', 'category', 'breakdown', 'chart', 'graph'],
      answer: 'Reports shows your income and expenses broken down by category, with filters for Today, This Week, This Month, This Year, or All Time.'
    },
    {
      keywords: ['device', 'sync', 'phone', 'computer', 'another device', 'transfer'],
      answer: 'BizTrack currently stores data only on this device/browser — it doesn\'t sync across devices yet. Export a CSV if you need a backup or want to move data.'
    },
    {
      keywords: ['setup', 'business type', 'onboarding', 'get started'],
      answer: 'When you first sign up, you\'ll be asked for your business name and type — this only takes a few seconds and helps tailor your categories.'
    }
  ];

  const FALLBACK_ANSWER = "I'm not sure about that one yet — try asking about adding transactions, your PIN, exporting data, currency, or dark mode.";

  function scoreMatch(query, item) {
    const q = query.toLowerCase();
    let score = 0;
    item.keywords.forEach((kw) => {
      if (q.includes(kw)) score += 1;
    });
    return score;
  }

  function findAnswer(query) {
    let best = null;
    let bestScore = 0;
    FAQ_ITEMS.forEach((item) => {
      const score = scoreMatch(query, item);
      if (score > bestScore) {
        bestScore = score;
        best = item;
      }
    });
    return best ? best.answer : FALLBACK_ANSWER;
  }

  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #faqbot-bubble {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: #1B5E42;
        color: #fff;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 14px rgba(0,0,0,0.25);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        transition: transform 0.15s ease;
      }
      #faqbot-bubble:hover { transform: scale(1.06); }
      #faqbot-panel {
        position: fixed;
        bottom: 88px;
        right: 20px;
        width: 320px;
        max-width: calc(100vw - 40px);
        height: 420px;
        max-height: calc(100vh - 140px);
        background: #fff;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        display: none;
        flex-direction: column;
        overflow: hidden;
        z-index: 9999;
        font-family: system-ui, -apple-system, sans-serif;
      }
      #faqbot-panel.is-open { display: flex; }
      #faqbot-header {
        background: #1B5E42;
        color: #fff;
        padding: 14px 16px;
        font-weight: 700;
        font-size: 0.95rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      #faqbot-close {
        background: none;
        border: none;
        color: #fff;
        font-size: 18px;
        cursor: pointer;
        line-height: 1;
      }
      #faqbot-messages {
        flex: 1;
        overflow-y: auto;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        background: #F7F8FA;
      }
      .faqbot-msg {
        max-width: 85%;
        padding: 8px 12px;
        border-radius: 12px;
        font-size: 0.85rem;
        line-height: 1.4;
        word-wrap: break-word;
      }
      .faqbot-msg--bot {
        background: #fff;
        border: 1px solid #E5E7EB;
        align-self: flex-start;
        color: #1F2937;
      }
      .faqbot-msg--user {
        background: #1B5E42;
        color: #fff;
        align-self: flex-end;
      }
      #faqbot-input-row {
        display: flex;
        border-top: 1px solid #E5E7EB;
        padding: 8px;
        gap: 8px;
      }
      #faqbot-input {
        flex: 1;
        border: 1px solid #E5E7EB;
        border-radius: 8px;
        padding: 8px 10px;
        font-size: 0.85rem;
        outline: none;
      }
      #faqbot-send {
        background: #1B5E42;
        color: #fff;
        border: none;
        border-radius: 8px;
        padding: 0 14px;
        font-size: 0.85rem;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  }

  function addMessage(container, text, variant) {
    const msg = document.createElement('div');
    msg.className = 'faqbot-msg faqbot-msg--' + variant;
    msg.textContent = text;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
  }

  function buildWidget() {
    const bubble = document.createElement('button');
    bubble.id = 'faqbot-bubble';
    bubble.setAttribute('aria-label', 'Open help chat');
    bubble.textContent = '💬';

    const panel = document.createElement('div');
    panel.id = 'faqbot-panel';
    panel.innerHTML = `
      <div id="faqbot-header">
        <span>BizTrack Help</span>
        <button id="faqbot-close" aria-label="Close">✕</button>
      </div>
      <div id="faqbot-messages"></div>
      <div id="faqbot-input-row">
        <input type="text" id="faqbot-input" placeholder="Ask a question..." autocomplete="off" />
        <button id="faqbot-send">Send</button>
      </div>
    `;

    document.body.appendChild(bubble);
    document.body.appendChild(panel);

    const messages = panel.querySelector('#faqbot-messages');
    const input = panel.querySelector('#faqbot-input');
    const sendBtn = panel.querySelector('#faqbot-send');
    const closeBtn = panel.querySelector('#faqbot-close');

    let greeted = false;

    bubble.addEventListener('click', () => {
      panel.classList.toggle('is-open');
      if (panel.classList.contains('is-open') && !greeted) {
        addMessage(messages, "Hi! Ask me about adding transactions, your PIN, exporting data, currency, dark mode, and more.", 'bot');
        greeted = true;
      }
      if (panel.classList.contains('is-open')) input.focus();
    });

    closeBtn.addEventListener('click', () => {
      panel.classList.remove('is-open');
    });

    function handleSend() {
      const text = input.value.trim();
      if (!text) return;
      addMessage(messages, text, 'user');
      input.value = '';
      const answer = findAnswer(text);
      setTimeout(() => addMessage(messages, answer, 'bot'), 250);
    }

    sendBtn.addEventListener('click', handleSend);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    injectStyles();
    buildWidget();
  });
})();
