let dashboardChart = null;

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

  renderChart(transactions);
  renderRecentTransactions();
}

function renderChart(transactions) {
  const chartWrap = document.getElementById('chart-wrap');
  const canvas = document.getElementById('income-expense-chart');
  const emptyState = document.getElementById('chart-empty-state');

  if (transactions.length === 0) {
    canvas.style.display = 'none';
    emptyState.style.display = 'block';
    if (dashboardChart) {
      dashboardChart.destroy();
      dashboardChart = null;
    }
    return;
  }

  canvas.style.display = 'block';
  emptyState.style.display = 'none';

  // Group by day for the selected range so the chart reflects real trend.
  const byDate = {};
  transactions.forEach((t) => {
    const key = t.date;
    if (!byDate[key]) byDate[key] = { income: 0, expense: 0 };
    byDate[key][t.type] += Number(t.amount);
  });

  const sortedDates = Object.keys(byDate).sort((a, b) => new Date(a) - new Date(b));
  const labels = sortedDates.map((d) => formatDate(d));
  const incomeData = sortedDates.map((d) => byDate[d].income);
  const expenseData = sortedDates.map((d) => byDate[d].expense);

  const styles = getComputedStyle(document.documentElement);
  const incomeColor = styles.getPropertyValue('--color-income').trim();
  const expenseColor = styles.getPropertyValue('--color-expense').trim();

  if (dashboardChart) dashboardChart.destroy();

  dashboardChart = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        { label: 'Income', data: incomeData, backgroundColor: incomeColor, borderRadius: 6, maxBarThickness: 28 },
        { label: 'Expenses', data: expenseData, backgroundColor: expenseColor, borderRadius: 6, maxBarThickness: 28 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 10, usePointStyle: true } }
      },
      scales: {
        y: { beginAtZero: true, ticks: { callback: (v) => formatCurrency(v) } }
      }
    }
  });
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
