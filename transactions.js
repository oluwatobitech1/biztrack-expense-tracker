let currentFilter = 'all';
let currentSort = 'newest';
let searchTerm = '';
let pendingDeleteId = null;
let confirmModal = null;

document.addEventListener('DOMContentLoaded', () => {
  requireSetup();

  const params = new URLSearchParams(window.location.search);
  if (params.get('saved') === '1') {
    const mode = params.get('mode');
    showToast(mode === 'edit' ? 'Transaction updated.' : 'Transaction saved.', 'success');
    window.history.replaceState({}, '', 'transactions.html');
  }

  document.querySelectorAll('[data-filter]').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach((c) => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      currentFilter = chip.getAttribute('data-filter');
      renderList();
    });
  });

  document.getElementById('sort-select').addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderList();
  });

  document.getElementById('search-input').addEventListener('input', (e) => {
    searchTerm = e.target.value.trim().toLowerCase();
    renderList();
  });

  confirmModal = createConfirmModal({
    modalEl: document.getElementById('delete-modal'),
    confirmBtn: document.getElementById('confirm-delete-btn'),
    cancelBtn: document.getElementById('cancel-delete-btn'),
    onConfirm: () => {
      if (pendingDeleteId) {
        deleteTransaction(pendingDeleteId);
        pendingDeleteId = null;
        showToast('Transaction deleted.', 'success');
        renderList();
      }
    }
  });

  renderList();
});

function renderList() {
  let transactions = getTransactions();

  if (currentFilter === 'income' || currentFilter === 'expense') {
    transactions = transactions.filter((t) => t.type === currentFilter);
  }

  if (searchTerm) {
    transactions = transactions.filter(
      (t) =>
        t.description.toLowerCase().includes(searchTerm) ||
        t.category.toLowerCase().includes(searchTerm)
    );
  }

  transactions = sortTransactions(transactions, currentSort);

  const list = document.getElementById('full-txn-list');
  const emptyState = document.getElementById('full-txn-empty');
  const countLabel = document.getElementById('result-count');

  list.innerHTML = '';

  if (transactions.length === 0) {
    emptyState.style.display = 'block';
    list.style.display = 'none';
    countLabel.textContent = '0 transactions';
    return;
  }

  emptyState.style.display = 'none';
  list.style.display = 'flex';
  countLabel.textContent = `${transactions.length} transaction${transactions.length === 1 ? '' : 's'}`;

  transactions.forEach((t) => {
    const row = document.createElement('div');
    row.className = 'txn-row';
    row.innerHTML = `
      <div class="txn-icon txn-icon--${t.type}">${t.type === 'income' ? '🟢' : '🔴'}</div>
      <div class="txn-info">
        <div class="txn-desc">${escapeHtml(t.description)}</div>
        <div class="txn-meta">${escapeHtml(t.category)} · ${escapeHtml(t.paymentMethod)} · ${formatDate(t.date)}</div>
      </div>
      <div class="txn-amount txn-amount--${t.type}">${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}</div>
      <div class="txn-actions">
        <button class="icon-btn" data-edit="${t.id}" aria-label="Edit transaction">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4z"/></svg>
        </button>
        <button class="icon-btn" data-delete="${t.id}" aria-label="Delete transaction">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/></svg>
        </button>
      </div>
    `;
    list.appendChild(row);
  });

  list.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', () => {
      window.location.href = `add-transaction.html?edit=${btn.getAttribute('data-edit')}`;
    });
  });

  list.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', () => {
      pendingDeleteId = btn.getAttribute('data-delete');
      confirmModal.open();
    });
  });
}

function sortTransactions(transactions, sort) {
  const sorted = transactions.slice();
  switch (sort) {
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
    case 'highest':
      return sorted.sort((a, b) => Number(b.amount) - Number(a.amount));
    case 'lowest':
      return sorted.sort((a, b) => Number(a.amount) - Number(b.amount));
    case 'newest':
    default:
      return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
