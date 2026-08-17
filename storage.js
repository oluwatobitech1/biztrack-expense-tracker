/**
 * storage.js
 * BizTrack's entire data layer. Every read/write to localStorage goes
 * through here so the UI code never touches localStorage directly.
 */

const STORAGE_KEY = 'biztrack_data';

/**
 * Countries BizTrack supports at signup, each mapped to its currency.
 * Selecting a country auto-fills the currency used across the app.
 * Covers every major region so the app works for any business, anywhere.
 */
const CURRENCIES = [
  // Africa
  { country: 'Nigeria', code: 'NGN', symbol: '\u20A6', label: 'Nigerian Naira (\u20A6)' },
  { country: 'Ghana', code: 'GHS', symbol: '\u20B5', label: 'Ghana Cedi (\u20B5)' },
  { country: 'Kenya', code: 'KES', symbol: 'KSh', label: 'Kenyan Shilling (KSh)' },
  { country: 'South Africa', code: 'ZAR', symbol: 'R', label: 'South African Rand (R)' },
  { country: 'Uganda', code: 'UGX', symbol: 'USh', label: 'Ugandan Shilling (USh)' },
  { country: 'Tanzania', code: 'TZS', symbol: 'TSh', label: 'Tanzanian Shilling (TSh)' },
  { country: 'Rwanda', code: 'RWF', symbol: 'FRw', label: 'Rwandan Franc (FRw)' },
  { country: 'Egypt', code: 'EGP', symbol: 'E\u00A3', label: 'Egyptian Pound (E\u00A3)' },
  { country: 'Morocco', code: 'MAD', symbol: 'MAD', label: 'Moroccan Dirham (MAD)' },
  { country: 'Ethiopia', code: 'ETB', symbol: 'Br', label: 'Ethiopian Birr (Br)' },
  // North America
  { country: 'United States', code: 'USD', symbol: '$', label: 'US Dollar ($)' },
  { country: 'Canada', code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar (CA$)' },
  { country: 'Mexico', code: 'MXN', symbol: 'MX$', label: 'Mexican Peso (MX$)' },
  // Europe
  { country: 'United Kingdom', code: 'GBP', symbol: '\u00A3', label: 'British Pound (\u00A3)' },
  { country: 'Germany', code: 'EUR', symbol: '\u20AC', label: 'Euro (\u20AC)' },
  { country: 'France', code: 'EUR', symbol: '\u20AC', label: 'Euro (\u20AC)' },
  { country: 'Spain', code: 'EUR', symbol: '\u20AC', label: 'Euro (\u20AC)' },
  { country: 'Italy', code: 'EUR', symbol: '\u20AC', label: 'Euro (\u20AC)' },
  { country: 'Netherlands', code: 'EUR', symbol: '\u20AC', label: 'Euro (\u20AC)' },
  { country: 'Ireland', code: 'EUR', symbol: '\u20AC', label: 'Euro (\u20AC)' },
  { country: 'Switzerland', code: 'CHF', symbol: 'CHF', label: 'Swiss Franc (CHF)' },
  { country: 'Sweden', code: 'SEK', symbol: 'kr', label: 'Swedish Krona (kr)' },
  { country: 'Norway', code: 'NOK', symbol: 'kr', label: 'Norwegian Krone (kr)' },
  { country: 'Poland', code: 'PLN', symbol: 'z\u0142', label: 'Polish Z\u0142oty (z\u0142)' },
  { country: 'Turkey', code: 'TRY', symbol: '\u20BA', label: 'Turkish Lira (\u20BA)' },
  // Asia-Pacific
  { country: 'India', code: 'INR', symbol: '\u20B9', label: 'Indian Rupee (\u20B9)' },
  { country: 'China', code: 'CNY', symbol: '\u00A5', label: 'Chinese Yuan (\u00A5)' },
  { country: 'Japan', code: 'JPY', symbol: '\u00A5', label: 'Japanese Yen (\u00A5)' },
  { country: 'South Korea', code: 'KRW', symbol: '\u20A9', label: 'South Korean Won (\u20A9)' },
  { country: 'Singapore', code: 'SGD', symbol: 'S$', label: 'Singapore Dollar (S$)' },
  { country: 'Indonesia', code: 'IDR', symbol: 'Rp', label: 'Indonesian Rupiah (Rp)' },
  { country: 'Malaysia', code: 'MYR', symbol: 'RM', label: 'Malaysian Ringgit (RM)' },
  { country: 'Philippines', code: 'PHP', symbol: '\u20B1', label: 'Philippine Peso (\u20B1)' },
  { country: 'Vietnam', code: 'VND', symbol: '\u20AB', label: 'Vietnamese Dong (\u20AB)' },
  { country: 'Pakistan', code: 'PKR', symbol: 'Rs', label: 'Pakistani Rupee (Rs)' },
  { country: 'Bangladesh', code: 'BDT', symbol: '\u09F3', label: 'Bangladeshi Taka (\u09F3)' },
  { country: 'Australia', code: 'AUD', symbol: 'A$', label: 'Australian Dollar (A$)' },
  { country: 'New Zealand', code: 'NZD', symbol: 'NZ$', label: 'New Zealand Dollar (NZ$)' },
  // Middle East
  { country: 'United Arab Emirates', code: 'AED', symbol: 'AED', label: 'UAE Dirham (AED)' },
  { country: 'Saudi Arabia', code: 'SAR', symbol: 'SAR', label: 'Saudi Riyal (SAR)' },
  { country: 'Qatar', code: 'QAR', symbol: 'QAR', label: 'Qatari Riyal (QAR)' },
  { country: 'Israel', code: 'ILS', symbol: '\u20AA', label: 'Israeli Shekel (\u20AA)' },
  // South America
  { country: 'Brazil', code: 'BRL', symbol: 'R$', label: 'Brazilian Real (R$)' },
  { country: 'Argentina', code: 'ARS', symbol: 'AR$', label: 'Argentine Peso (AR$)' },
  { country: 'Colombia', code: 'COP', symbol: 'COL$', label: 'Colombian Peso (COL$)' },
  { country: 'Chile', code: 'CLP', symbol: 'CL$', label: 'Chilean Peso (CL$)' },
  // Fallback
  { country: 'Other', code: 'USD', symbol: '$', label: 'US Dollar ($)' }
];

/**
 * Shape of the data saved under STORAGE_KEY:
 * {
 *   account: { name, email, passwordHash, country },
 *   session: { loggedIn },
 *   business: { name, type, currency },
 *   transactions: [ { id, type, amount, description, category, paymentMethod, date, createdAt } ],
 *   settings: { theme }
 * }
 */

function getDefaultData() {
  return {
    account: {
      name: '',
      email: '',
      passwordHash: '',
      country: ''
    },
    session: {
      loggedIn: false
    },
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
      account: { ...getDefaultData().account, ...(parsed.account || {}) },
      session: { ...getDefaultData().session, ...(parsed.session || {}) },
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

/* ---------- Account & session ---------- */

/**
 * Lightweight non-cryptographic hash so we don't store passwords in
 * plain text. This is a client-only demo (no server), so it's not a
 * substitute for real password hashing on a backend — good enough to
 * avoid an obvious plaintext string in localStorage, not for production auth.
 */
function simpleHash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

function isAccountCreated() {
  const data = loadData();
  return Boolean(data.account.email && data.account.passwordHash);
}

function getAccount() {
  return loadData().account;
}

function createAccount({ name, email, password, country, currency }) {
  const data = loadData();
  data.account = {
    name,
    email: email.toLowerCase().trim(),
    passwordHash: simpleHash(password),
    country
  };
  if (currency) data.business.currency = currency;
  data.session.loggedIn = true;
  persistData(data);
  return true;
}

function login(email, password) {
  const data = loadData();
  const normalizedEmail = email.toLowerCase().trim();
  if (data.account.email === normalizedEmail && data.account.passwordHash === simpleHash(password)) {
    data.session.loggedIn = true;
    persistData(data);
    return true;
  }
  return false;
}

function logout() {
  const data = loadData();
  data.session.loggedIn = false;
  persistData(data);
}

function isLoggedIn() {
  return loadData().session.loggedIn;
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
