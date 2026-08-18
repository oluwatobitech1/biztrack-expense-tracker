document.addEventListener('DOMContentLoaded', () => {
  requireSetup();
  setGreeting(document.getElementById('greeting-text'));

  const chips = document.querySelectorAll('[data-range]');
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      renderDashboard(chip.getAttribute('data-range'));
    });
  });

  renderDashboard('month');
});

function renderDashboard(range) {
  const transactions = getTransactionsByDateRange(range);
  const income = calculateIncome(transactions);
  const expenses = calculateExpenses(transactions);
  const profit = calculateProfit(transactions);

  document.getElementById('stat-income').textContent = formatCurrency(income);
  document.getElementById('stat-expenses').textContent = formatCurrency(expenses);
  document.getElementById('stat-profit').textContent = formatCurrency(profit);
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

  document.getElementById('flow-income-value').textContent = formatCurrency(income);
  document.getElementById('flow-expense-value').textContent = formatCurrency(expenses);

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
    row.innerHTML = `
      <div class="txn-icon txn-icon--${t.type}">${t.type === 'income' ? '🟢' : '🔴'}</div>
      <div class="txn-info">
        <div class="txn-desc">${escapeHtml(t.description)}</div>
        <div class="txn-meta">${escapeHtml(t.category)} · ${formatDate(t.date)}</div>
      </div>
      <div class="txn-amount txn-amount--${t.type}">${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}</div>
    `;
    list.appendChild(row);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
