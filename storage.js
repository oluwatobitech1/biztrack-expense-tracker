/**
 * storage.js
 * BizTrack's entire data layer. Every read/write to localStorage goes
 * through here so the UI code never touches localStorage directly.
 */

const STORAGE_KEY = 'biztrack_data';

/**
 * Shape of the data saved under STORAGE_KEY:
 * {
 *   business: { name, type, currency },
 *   transactions: [ { id, type, amount, description, category, paymentMethod, date, createdAt } ],
 *   settings: { theme }
 * }
 */

function getDefaultData() {
  return {
    business: {
      name: '',
      type: '',
      currency: 'NGN'
    },
    transactions: [],
    settings: {
      theme: 'light'
    }
  };
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultData();
    const parsed = JSON.parse(raw);
    // Guard against partially-shaped data from older versions.
    return {
      business: { ...getDefaultData().business, ...(parsed.business || {}) },
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
      settings: { ...getDefaultData().settings, ...(parsed.settings || {}) }
    };
  } catch (err) {
    console.error('BizTrack: failed to read stored data, starting fresh.', err);
    return getDefaultData();
  }
}

function persistData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error('BizTrack: failed to save data.', err);
    return false;
  }
}

/* ---------- Business ---------- */

function isSetupComplete() {
  const data = loadData();
  return Boolean(data.business.name && data.business.type);
}

function getBusiness() {
  return loadData().business;
}

function saveBusiness(business) {
  const data = loadData();
  data.business = { ...data.business, ...business };
  return persistData(data);
}

/* ---------- Transactions ---------- */

function getTransactions() {
  return loadData().transactions.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
}

function generateId() {
  return 'txn_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

function saveTransaction(transaction) {
  const data = loadData();
  const newTransaction = {
    id: generateId(),
    createdAt: new Date().toISOString(),
    ...transaction
  };
  data.transactions.push(newTransaction);
  persistData(data);
  return newTransaction;
}

function updateTransaction(id, updates) {
  const data = loadData();
  const index = data.transactions.findIndex((t) => t.id === id);
  if (index === -1) return null;
  data.transactions[index] = { ...data.transactions[index], ...updates };
  persistData(data);
  return data.transactions[index];
}

function deleteTransaction(id) {
  const data = loadData();
  const before = data.transactions.length;
  data.transactions = data.transactions.filter((t) => t.id !== id);
  persistData(data);
  return data.transactions.length < before;
}

function getTransactionById(id) {
  return loadData().transactions.find((t) => t.id === id) || null;
}

/* ---------- Date range filtering ---------- */

function startOfDay(d) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getTransactionsByDateRange(range) {
  const all = getTransactions();
  if (range === 'all') return all;

  const now = new Date();
  const today = startOfDay(now);

  return all.filter((t) => {
    const txnDate = startOfDay(t.date);
    switch (range) {
      case 'today':
        return txnDate.getTime() === today.getTime();
      case 'week': {
        const dayOfWeek = today.getDay(); // 0 = Sunday
        const diffToMonday = (dayOfWeek + 6) % 7;
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - diffToMonday);
        return txnDate >= startOfWeek && txnDate <= today;
      }
      case 'month':
        return (
          txnDate.getFullYear() === today.getFullYear() &&
          txnDate.getMonth() === today.getMonth()
        );
      case 'year':
        return txnDate.getFullYear() === today.getFullYear();
      default:
        return true;
    }
  });
}

/* ---------- Calculations ---------- */

function calculateIncome(transactions) {
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

function calculateExpenses(transactions) {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

function calculateProfit(transactions) {
  return calculateIncome(transactions) - calculateExpenses(transactions);
}

function getBreakdownByCategory(transactions, type) {
  const filtered = transactions.filter((t) => t.type === type);
  const totals = {};
  filtered.forEach((t) => {
    totals[t.category] = (totals[t.category] || 0) + Number(t.amount);
  });
  return Object.entries(totals)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

/* ---------- Settings ---------- */

function getSettings() {
  return loadData().settings;
}

function saveSettings(settings) {
  const data = loadData();
  data.settings = { ...data.settings, ...settings };
  return persistData(data);
}

/* ---------- Export ---------- */

function exportTransactionsToCSV() {
  const transactions = getTransactions();
  const headers = ['Date', 'Description', 'Type', 'Category', 'Payment Method', 'Amount'];
  const rows = transactions.map((t) => [
    t.date,
    csvEscape(t.description),
    t.type,
    csvEscape(t.category),
    csvEscape(t.paymentMethod),
    t.amount
  ]);

  const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  const business = getBusiness();
  const filename = `${(business.name || 'biztrack').replace(/\s+/g, '-').toLowerCase()}-transactions-${todayISO()}.csv`;
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function csvEscape(value) {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

/* ---------- Clear all data ---------- */

function clearAllData() {
  localStorage.removeItem(STORAGE_KEY);
}
