let incomeChart = null;
let expenseChart = null;

document.addEventListener('DOMContentLoaded', () => {
  requireSetup();

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

  renderCategoryChart('income', transactions);
  renderCategoryChart('expense', transactions);
  renderBreakdownList('income', transactions);
  renderBreakdownList('expense', transactions);
}

function renderCategoryChart(type, transactions) {
  const canvas = document.getElementById(`${type}-chart`);
  const emptyState = document.getElementById(`${type}-chart-empty`);
  const breakdown = getBreakdownByCategory(transactions, type);

  const chartRef = type === 'income' ? 'incomeChart' : 'expenseChart';
  if (window[chartRef]) {
    window[chartRef].destroy();
    window[chartRef] = null;
  }

  if (breakdown.length === 0) {
    canvas.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  canvas.style.display = 'block';
  emptyState.style.display = 'none';

  const palette = type === 'income'
    ? ['#1E8E5A', '#4CAF7D', '#7BC29E', '#A9D6BE', '#D3EADF', '#123D2B']
    : ['#C6432F', '#D97058', '#E39A87', '#EDBFB2', '#F6E1DA', '#7A2A1D'];

  window[chartRef] = new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: breakdown.map((b) => b.category),
      datasets: [{
        data: breakdown.map((b) => b.amount),
        backgroundColor: palette.slice(0, breakdown.length),
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 10, usePointStyle: true, font: { size: 11 } } },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: ${formatCurrency(ctx.parsed)}`
          }
        }
      }
    }
  });
}

function renderBreakdownList(type, transactions) {
  const container = document.getElementById(`${type}-breakdown-list`);
  const breakdown = getBreakdownByCategory(transactions, type);
  container.innerHTML = '';

  if (breakdown.length === 0) return;

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
