/**
 * storage.js
 * BizTrack's entire data layer — pure localStorage, single account per
 * device, unlocked with a PIN (no backend, no Supabase).
 *
 * DESIGN NOTE: everything here is synchronous under the hood, but the
 * functions keep their `async`/`await`-friendly signatures so existing
 * call sites (login.js, signup.js, setup.js, app pages) that already
 * `await` these calls keep working without changes.
 */

/**
 * Countries BizTrack supports at signup, each mapped to its currency.
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
  { country: 'United States', code: 'USD', symbol: '$', label: 'US Dollar ($)' },
  { country: 'Canada', code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar (CA$)' },
  { country: 'Mexico', code: 'MXN', symbol: 'MX$', label: 'Mexican Peso (MX$)' },
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
  { country: 'United Arab Emirates', code: 'AED', symbol: 'AED', label: 'UAE Dirham (AED)' },
  { country: 'Saudi Arabia', code: 'SAR', symbol: 'SAR', label: 'Saudi Riyal (SAR)' },
  { country: 'Qatar', code: 'QAR', symbol: 'QAR', label: 'Qatari Riyal (QAR)' },
  { country: 'Israel', code: 'ILS', symbol: '\u20AA', label: 'Israeli Shekel (\u20AA)' },
  { country: 'Brazil', code: 'BRL', symbol: 'R$', label: 'Brazilian Real (R$)' },
  { country: 'Argentina', code: 'ARS', symbol: 'AR$', label: 'Argentine Peso (AR$)' },
  { country: 'Colombia', code: 'COP', symbol: 'COL$', label: 'Colombian Peso (COL$)' },
  { country: 'Chile', code: 'CLP', symbol: 'CL$', label: 'Chilean Peso (CL$)' },
  { country: 'Other', code: 'USD', symbol: '$', label: 'US Dollar ($)' }
];

/* ---------- Storage keys ---------- */

const LS_ACCOUNT_KEY = 'biztrack_account_v1';
const LS_BUSINESS_KEY = 'biztrack_business_v1';
const LS_TRANSACTIONS_KEY = 'biztrack_transactions_v1';
const LS_SETTINGS_KEY = 'biztrack_settings_v1';
// Session-only: whether the PIN has been entered correctly this browser
// session. Using sessionStorage (not localStorage) means the app
// re-locks itself whenever the tab/browser is closed and reopened —
// same feel as PalmPay/OPay's PIN lock screen.
const SS_UNLOCKED_KEY = 'biztrack_unlocked_v1';

/* ---------- In-memory cache ---------- */

function getDefaultBusiness() {
  return { name: '', type: '', currency: 'NGN', logo: null };
}
function getDefaultSettings() {
  return { theme: 'light', language: 'en', balanceHidden: false };
}
function getDefaultAccount() {
  return { name: '', username: '', country: '', currency: 'NGN', pinHash: null, recoveryCodeHash: null };
}

const _cache = {
  loaded: false,
  account: getDefaultAccount(),
  business: getDefaultBusiness(),
  transactions: [],
  settings: getDefaultSettings()
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error('BizTrack: failed to read ' + key, e);
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error('BizTrack: failed to save ' + key, e);
    return false;
  }
}

/**
 * Loads everything from localStorage into the in-memory cache. Call
 * this once per page before any getters are used — login.js/signup.js
 * do it directly, and app pages do it via requireSetup() in app.js.
 * Safe to call multiple times; only re-reads if not already loaded
 * for this page load (pass `true` to force a re-read).
 */
async function bootstrapData(force) {
  if (_cache.loaded && !force) return;

  _cache.account = readJSON(LS_ACCOUNT_KEY, getDefaultAccount());
  _cache.business = readJSON(LS_BUSINESS_KEY, getDefaultBusiness());
  _cache.transactions = readJSON(LS_TRANSACTIONS_KEY, []);
  _cache.settings = readJSON(LS_SETTINGS_KEY, getDefaultSettings());
  _cache.loaded = true;
}

function genId() {
  return 'id_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** SHA-256 hashes a PIN (with a static salt) so it's never stored in plain text. */
async function hashPin(pin) {
  const encoder = new TextEncoder();
  const data = encoder.encode('biztrack_pin_salt_' + pin);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Strips spaces/dashes and uppercases a recovery code so formatting doesn't matter when checking it. */
function normalizeRecoveryCode(code) {
  return (code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/** SHA-256 hashes a (normalized) recovery code so it's never stored in plain text. */
async function hashRecoveryCode(code) {
  const encoder = new TextEncoder();
  const data = encoder.encode('biztrack_recovery_salt_' + normalizeRecoveryCode(code));
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Generates a random, human-typeable recovery code like "AB3CD-EF4GH" (no 0/O/1/I to avoid mix-ups). */
function genRecoveryCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const randomValues = crypto.getRandomValues(new Uint8Array(10));
  let raw = '';
  for (let i = 0; i < 10; i++) {
    raw += chars[randomValues[i] % chars.length];
  }
  return raw.slice(0, 5) + '-' + raw.slice(5);
}

/* ---------- Account & session ---------- */

/** Whether an account (name + PIN) has ever been created on this device. */
function isAccountCreated() {
  const account = readJSON(LS_ACCOUNT_KEY, null);
  return Boolean(account && account.pinHash);
}

function getAccount() {
  return _cache.account;
}

/**
 * Updates fields on the local account (currently just `username` from
 * Settings). Synchronous and called without `await` from settings.js,
 * matching that call site. Returns { success, error }.
 */
function saveAccount(updates) {
  const next = { ...updates };
  if (next.username !== undefined) {
    const trimmed = (next.username || '').trim();
    if (!/^[a-zA-Z0-9_.]{3,}$/.test(trimmed)) {
      return { success: false, error: 'Username must be at least 3 characters, using only letters, numbers, underscores, or periods.' };
    }
    next.username = trimmed;
  }
  _cache.account = { ..._cache.account, ...next };
  writeJSON(LS_ACCOUNT_KEY, _cache.account);
  return { success: true };
}

/**
 * Creates the on-device account with a PIN instead of an email/password.
 * `pin` is a plain string of digits (e.g. "4821"); it's hashed before
 * being stored. Returns { success, error }.
 */
async function createAccount({ name, username, country, currency, pin }) {
  if (!pin || pin.length < 4) {
    return { success: false, error: 'Please set a PIN of at least 4 digits.' };
  }

  const pinHash = await hashPin(pin);
  const recoveryCode = genRecoveryCode();
  const recoveryCodeHash = await hashRecoveryCode(recoveryCode);

  const account = {
    name: name || '',
    username: username || '',
    country: country || '',
    currency: currency || 'NGN',
    pinHash,
    recoveryCodeHash
  };

  writeJSON(LS_ACCOUNT_KEY, account);
  if (!readJSON(LS_BUSINESS_KEY, null)) {
    writeJSON(LS_BUSINESS_KEY, { ...getDefaultBusiness(), currency: account.currency });
  }
  if (!readJSON(LS_SETTINGS_KEY, null)) {
    writeJSON(LS_SETTINGS_KEY, getDefaultSettings());
  }
  if (!readJSON(LS_TRANSACTIONS_KEY, null)) {
    writeJSON(LS_TRANSACTIONS_KEY, []);
  }

  sessionStorage.setItem(SS_UNLOCKED_KEY, '1');
  await bootstrapData(true);
  // recoveryCode is only ever available here, right after signup — it's
  // not retrievable later since only its hash is stored.
  return { success: true, recoveryCode };
}

/**
 * Verifies a PIN against the stored account and unlocks the session if
 * it matches. Returns { success, error }.
 */
async function login(pin) {
  const account = readJSON(LS_ACCOUNT_KEY, null);
  if (!account || !account.pinHash) {
    return { success: false, error: 'No account found on this device.' };
  }

  const enteredHash = await hashPin(pin);
  if (enteredHash !== account.pinHash) {
    return { success: false, error: 'Incorrect PIN.' };
  }

  sessionStorage.setItem(SS_UNLOCKED_KEY, '1');
  await bootstrapData(true);
  return { success: true };
}

/**
 * Verifies a recovery code and, if it matches, sets a new PIN — without
 * touching the business, transactions, or settings already saved.
 * Returns { success, error }.
 */
async function resetPinWithRecoveryCode(code, newPin) {
  const account = readJSON(LS_ACCOUNT_KEY, null);
  if (!account || !account.recoveryCodeHash) {
    return { success: false, error: 'No account found on this device.' };
  }
  if (!newPin || newPin.length < 4) {
    return { success: false, error: 'Please set a PIN of at least 4 digits.' };
  }

  const enteredHash = await hashRecoveryCode(code);
  if (enteredHash !== account.recoveryCodeHash) {
    return { success: false, error: 'That recovery code doesn\u2019t match.' };
  }

  account.pinHash = await hashPin(newPin);
  writeJSON(LS_ACCOUNT_KEY, account);

  sessionStorage.setItem(SS_UNLOCKED_KEY, '1');
  await bootstrapData(true);
  return { success: true };
}

/** Locks the app again (data stays on the device). */
async function logout() {
  sessionStorage.removeItem(SS_UNLOCKED_KEY);
  _cache.loaded = false;
}

async function isLoggedIn() {
  return Boolean(sessionStorage.getItem(SS_UNLOCKED_KEY)) && isAccountCreated();
}

/** Wipes everything on this device — account, PIN, business, transactions, settings. Used for "Forgot PIN". */
async function resetApp() {
  localStorage.removeItem(LS_ACCOUNT_KEY);
  localStorage.removeItem(LS_BUSINESS_KEY);
  localStorage.removeItem(LS_TRANSACTIONS_KEY);
  localStorage.removeItem(LS_SETTINGS_KEY);
  sessionStorage.removeItem(SS_UNLOCKED_KEY);
  _cache.loaded = false;
  _cache.account = getDefaultAccount();
  _cache.business = getDefaultBusiness();
  _cache.transactions = [];
  _cache.settings = getDefaultSettings();
}

/* ---------- Business ---------- */

function isSetupComplete() {
  return Boolean(_cache.business.name && _cache.business.type);
}

function getBusiness() {
  return _cache.business;
}

async function saveBusiness(business) {
  _cache.business = { ..._cache.business, ...business };
  return writeJSON(LS_BUSINESS_KEY, _cache.business);
}

/* ---------- Transactions ---------- */

function getTransactions() {
  return _cache.transactions.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
}

async function saveTransaction(transaction) {
  const newTransaction = {
    id: genId(),
    type: transaction.type,
    amount: transaction.amount,
    description: transaction.description,
    category: transaction.category,
    paymentMethod: transaction.paymentMethod,
    date: transaction.date,
    createdAt: new Date().toISOString()
  };
  _cache.transactions.push(newTransaction);
  writeJSON(LS_TRANSACTIONS_KEY, _cache.transactions);
  return newTransaction;
}

async function updateTransaction(id, updates) {
  const index = _cache.transactions.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const updated = { ..._cache.transactions[index], ...updates };
  _cache.transactions[index] = updated;
  writeJSON(LS_TRANSACTIONS_KEY, _cache.transactions);
  return updated;
}

async function deleteTransaction(id) {
  const before = _cache.transactions.length;
  _cache.transactions = _cache.transactions.filter((t) => t.id !== id);
  writeJSON(LS_TRANSACTIONS_KEY, _cache.transactions);
  return _cache.transactions.length < before;
}

function getTransactionById(id) {
  return _cache.transactions.find((t) => t.id === id) || null;
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
        const dayOfWeek = today.getDay();
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

/* ---------- Calculations (pure, unchanged) ---------- */

function calculateIncome(transactions) {
  return transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
}

function calculateExpenses(transactions) {
  return transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
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
  return _cache.settings;
}

async function saveSettings(settings) {
  _cache.settings = { ..._cache.settings, ...settings };
  return writeJSON(LS_SETTINGS_KEY, _cache.settings);
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

/** Deletes the business, all transactions, and settings — keeps the account/PIN itself. */
async function clearAllData() {
  _cache.business = getDefaultBusiness();
  _cache.transactions = [];
  _cache.settings = getDefaultSettings();
  writeJSON(LS_BUSINESS_KEY, _cache.business);
  writeJSON(LS_TRANSACTIONS_KEY, _cache.transactions);
  writeJSON(LS_SETTINGS_KEY, _cache.settings);
}
