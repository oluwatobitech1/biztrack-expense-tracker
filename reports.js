document.addEventListener('DOMContentLoaded', () => {
  if (!requireSetup()) return;

  document.querySelectorAll('[data-report-range]').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('[data-report-range]').forEach((c) => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      renderReports(chip.getAttribute('data-report-range'));
    });
  });

  document.getElementById('export-csv-btn').addEventListener('click', () => {
    if (getTransactions().length === 0) {
      showToast('No transactions to export yet.', 'error');
      return;
    }
    exportTransactionsToCSV();
    showToast('CSV exported.', 'success');
  });

  renderReports('month');
});

function renderReports(range) {
  const transactions = getTransactionsByDateRange(range);
  const income = calculateIncome(transactions);
  const expenses = calculateExpenses(transactions);
  const profit = calculateProfit(transactions);

  document.getElementById('report-income').textContent = formatCurrency(income);
  document.getElementById('report-expenses').textContent = formatCurrency(expenses);
  document.getElementById('report-profit').textContent = formatCurrency(profit);

  // Each breakdown is independent: a problem in one should never block the other.
  try {
    renderBreakdownList('income', transactions);
  } catch (err) {
    console.error('BizTrack: failed to render Income by Category.', err);
  }

  try {
    renderBreakdownList('expense', transactions);
  } catch (err) {
    console.error('BizTrack: failed to render Expenses by Category.', err);
  }
}

function renderBreakdownList(type, transactions) {
  const container = document.getElementById(`${type}-breakdown-list`);
  const emptyState = document.getElementById(`${type}-chart-empty`);
  const breakdown = getBreakdownByCategory(transactions, type);
  container.innerHTML = '';

  if (breakdown.length === 0) {
    container.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  container.style.display = 'block';
  emptyState.style.display = 'none';

  const max = breakdown[0].amount;
  const color = type === 'income' ? 'var(--color-income)' : 'var(--color-expense)';

  breakdown.forEach((b) => {
    const row = document.createElement('div');
    row.className = 'breakdown-row';
    const pct = max > 0 ? Math.round((b.amount / max) * 100) : 0;
    row.innerHTML = `
      <span class="breakdown-label">${escapeHtml(b.category)}</span>
      <span class="breakdown-bar-track"><span class="breakdown-bar-fill" style="width:${pct}%; background:${color};"></span></span>
      <span class="breakdown-amount">${formatCurrency(b.amount)}</span>
    `;
    container.appendChild(row);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
