const INCOME_CATEGORIES = ['Sales', 'Services', 'Delivery', 'Commission', 'Other'];
const EXPENSE_CATEGORIES = ['Stock', 'Transport', 'Rent', 'Electricity', 'Internet/Data', 'Marketing', 'Staff', 'Equipment', 'Other'];
const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'POS', 'Other'];

let currentType = 'income';
let selectedCategory = '';
let editingId = null;
let isSubmitting = false;

document.addEventListener('DOMContentLoaded', () => {
  if (!requireLogin()) return;

  const business = getBusiness();
  const match = CURRENCIES.find((c) => c.code === business.currency);
  document.getElementById('currency-prefix').textContent = match ? match.symbol : '$';

  const params = new URLSearchParams(window.location.search);
  editingId = params.get('edit');
  const presetType = params.get('type');

  renderPaymentMethods();

  document.querySelectorAll('.type-toggle-btn').forEach((btn) => {
    btn.addEventListener('click', () => setType(btn.getAttribute('data-type')));
  });

  document.getElementById('date-input').valueAsDate = new Date();

  if (editingId) {
    loadForEdit(editingId);
  } else {
    setType(presetType === 'expense' ? 'expense' : 'income');
  }

  document.getElementById('transaction-form').addEventListener('submit', handleSubmit);

  document.getElementById('cancel-btn').addEventListener('click', () => {
    window.history.length > 1 ? window.history.back() : (window.location.href = 'dashboard.html');
  });
});

function setType(type) {
  currentType = type;
  document.querySelectorAll('.type-toggle-btn').forEach((btn) => {
    btn.classList.toggle('is-active', btn.getAttribute('data-type') === type);
  });
  selectedCategory = '';
  renderCategories();

  const heading = document.getElementById('form-heading');
  const saveBtn = document.getElementById('save-btn');
  if (editingId) {
    heading.textContent = `Edit ${type === 'income' ? 'Income' : 'Expense'}`;
    saveBtn.textContent = 'Save Changes';
  } else {
    heading.textContent = type === 'income' ? 'Add Income' : 'Add Expense';
    saveBtn.textContent = type === 'income' ? 'Save Income' : 'Save Expense';
  }
}

function renderCategories() {
  const grid = document.getElementById('category-grid');
  const categories = currentType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  grid.innerHTML = '';
  categories.forEach((cat) => {
    const el = document.createElement('div');
    el.className = 'category-option';
    el.textContent = cat;
    el.setAttribute('data-category', cat);
    if (cat === selectedCategory) el.classList.add('is-selected');
    el.addEventListener('click', () => {
      selectedCategory = cat;
      grid.querySelectorAll('.category-option').forEach((o) => o.classList.remove('is-selected'));
      el.classList.add('is-selected');
      clearError('category-error');
    });
    grid.appendChild(el);
  });
}

function renderPaymentMethods() {
  const select = document.getElementById('payment-method-select');
  select.innerHTML = '<option value="">Select payment method</option>' +
    PAYMENT_METHODS.map((m) => `<option value="${m}">${m}</option>`).join('');
}

function loadForEdit(id) {
  const txn = getTransactionById(id);
  if (!txn) {
    showToast('Transaction not found.', 'error');
    window.location.href = 'transactions.html';
    return;
  }
  setType(txn.type);
  selectedCategory = txn.category;
  renderCategories();
  document.getElementById('amount-input').value = txn.amount;
  document.getElementById('description-input').value = txn.description;
  document.getElementById('payment-method-select').value = txn.paymentMethod;
  document.getElementById('date-input').value = txn.date;
}

function clearError(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('is-visible');
}

function setError(id, inputId, message) {
  const el = document.getElementById(id);
  el.textContent = message;
  el.classList.add('is-visible');
  const input = document.getElementById(inputId);
  if (input) input.classList.add('is-invalid');
}

function handleSubmit(e) {
  e.preventDefault();
  if (isSubmitting) return;

  const amountInput = document.getElementById('amount-input');
  const descriptionInput = document.getElementById('description-input');
  const paymentSelect = document.getElementById('payment-method-select');
  const dateInput = document.getElementById('date-input');

  [amountInput, descriptionInput, paymentSelect, dateInput].forEach((el) => el.classList.remove('is-invalid'));
  ['amount-error', 'description-error', 'category-error', 'payment-error', 'date-error'].forEach(clearError);

  let hasError = false;
  const amount = parseFloat(amountInput.value);
  const description = descriptionInput.value.trim();
  const paymentMethod = paymentSelect.value;
  const date = dateInput.value;

  if (!amountInput.value || isNaN(amount)) {
    setError('amount-error', 'amount-input', 'Amount is required.');
    hasError = true;
  } else if (amount <= 0) {
    setError('amount-error', 'amount-input', 'Amount must be greater than zero.');
    hasError = true;
  }

  if (!description) {
    setError('description-error', 'description-input', 'Description is required.');
    hasError = true;
  }

  if (!selectedCategory) {
    setError('category-error', null, 'Please select a category.');
    hasError = true;
  }

  if (!paymentMethod) {
    setError('payment-error', 'payment-method-select', 'Payment method is required.');
    hasError = true;
  }

  if (!date) {
    setError('date-error', 'date-input', 'Date is required.');
    hasError = true;
  }

  if (hasError) return;

  isSubmitting = true;
  const saveBtn = document.getElementById('save-btn');
  saveBtn.disabled = true;

  const payload = {
    type: currentType,
    amount,
    description,
    category: selectedCategory,
    paymentMethod,
    date
  };

  if (editingId) {
    updateTransaction(editingId, payload);
  } else {
    saveTransaction(payload);
  }

  window.location.href = `transactions.html?saved=1&mode=${editingId ? 'edit' : 'add'}`;
}
