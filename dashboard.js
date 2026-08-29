document.addEventListener('DOMContentLoaded', async () => {
  const allowed = await requireSetup();
  if (!allowed) return; // already redirecting to login/setup — don't render stale data

  setGreeting(document.getElementById('greeting-text'));

  const chips = document.querySelectorAll('[data-range]');
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      renderDashboard(chip.getAttribute('data-range'));
    });
  });

  // Balance visibility toggle — persisted in settings, defaults to visible.
  const toggleBtn = document.getElementById('balance-toggle-btn');
  balanceHidden = Boolean(getSettings().balanceHidden);
  updateBalanceToggleIcon();

  toggleBtn.addEventListener('click', async () => {
    balanceHidden = !balanceHidden;
    await saveSettings({ balanceHidden });
    updateBalanceToggleIcon();
    renderDashboard(currentRange);
  });

  renderDashboard('month');
});

let currentRange = 'month';
let balanceHidden = false;
const MASK = '••••••';

function maskOrShow(text) {
  return balanceHidden ? MASK : text;
}

function updateBalanceToggleIcon() {
  const icon = document.getElementById('balance-toggle-icon');
  if (!icon) return;
  icon.innerHTML = balanceHidden
    // eye-off icon
    ? '<path d="M17.94 17.94A10.94 10.94 0 0112 20c-7 0-11-8-11-8a20.3 20.3 0 015.06-6.06M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a20.3 20.3 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><path d="M1 1l22 22"/>'
    // eye icon
    : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
}

function renderDashboard(range) {
  currentRange = range;
  const transactions = getTransactionsByDateRange(range);
  const income = calculateIncome(transactions);
  const expenses = calculateExpenses(transactions);
  const profit = calculateProfit(transactions);

  document.getElementById('stat-income').textContent = maskOrShow(formatCurrency(income));
  document.getElementById('stat-expenses').textContent = maskOrShow(formatCurrency(expenses));
  document.getElementById('stat-profit').textContent = maskOrShow(formatCurrency(profit));
  document.getElementById('stat-count').textContent = transactions.length;

  // Each section is independent on purpose: if one throws, the other still renders.
  try {
    renderFlowStats(income, expenses);
  } catch (err) {
    console.error('BizTrack: failed to render Income vs Expenses.', err);
  }

  try {
    renderRecentTransactions();
  } catch (err) {
    console.error('BizTrack: failed to render Recent Transactions.', err);
  }
}

function renderFlowStats(income, expenses) {
  const wrap = document.getElementById('flow-stats-wrap');
  const emptyState = document.getElementById('chart-empty-state');
  const total = income + expenses;

  document.getElementById('flow-income-value').textContent = maskOrShow(formatCurrency(income));
  document.getElementById('flow-expense-value').textContent = maskOrShow(formatCurrency(expenses));

  const incomeBar = document.getElementById('flow-bar-income');
  const expenseBar = document.getElementById('flow-bar-expense');

  if (total === 0) {
    wrap.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  wrap.style.display = 'block';
  emptyState.style.display = 'none';

  const incomePct = (income / total) * 100;
  const expensePct = (expenses / total) * 100;
  incomeBar.style.width = incomePct + '%';
  expenseBar.style.width = expensePct + '%';
}

function renderRecentTransactions() {
  const list = document.getElementById('recent-txn-list');
  const emptyState = document.getElementById('recent-txn-empty');
  const all = getTransactions();
  const recent = all.slice(0, 5);

  list.innerHTML = '';

  if (recent.length === 0) {
    emptyState.style.display = 'block';
    list.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';
  list.style.display = 'flex';

  recent.forEach((t) => {
    const row = document.createElement('div');
    row.className = 'txn-row';
    const amountText = maskOrShow((t.type === 'income' ? '+' : '-') + formatCurrency(t.amount));
    row.innerHTML = `
      <div class="txn-icon txn-icon--${t.type}">${t.type === 'income' ? '🟢' : '🔴'}</div>
      <div class="txn-info">
        <div class="txn-desc">${escapeHtml(t.description)}</div>
        <div class="txn-meta">${escapeHtml(t.category)} · ${formatDate(t.date)}</div>
      </div>
      <div class="txn-amount txn-amount--${t.type}">${amountText}</div>
    `;
    list.appendChild(row);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
