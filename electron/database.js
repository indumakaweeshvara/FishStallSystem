const path = require('path');
const Database = require('better-sqlite3');

console.log(">>> HIGH-FIDELITY DATABASE INITIALIZING... <<<");

// Store DB in the local electron folder for reliability
const dbPath = path.join(__dirname, 'stall_local_v1.db');

const db = new Database(dbPath);
console.log('>>> DATABASE CONNECTED AT:', dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// --- Create Tables ---

// 1. Customers
db.exec(`CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT DEFAULT '',
    address TEXT DEFAULT '',
    balance REAL DEFAULT 0,
    created_at TEXT NOT NULL
)`);

// 2. Transactions - Updated with customer_id and paid_amount
db.exec(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER,
    date TEXT NOT NULL,
    total_amount REAL NOT NULL,
    paid_amount REAL DEFAULT 0,
    items_json TEXT NOT NULL
)`);

// 3. Payments
db.exec(`CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL
)`);

// 4. Products (Fish Types)
db.exec(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    default_rate REAL NOT NULL
)`);

// Add some initial fish types if the table is empty
const countRow = db.prepare("SELECT COUNT(*) as count FROM products").get();
if (countRow && countRow.count === 0) {
  const insertProduct = db.prepare("INSERT INTO products (name, default_rate) VALUES (?, ?)");
  const initialFish = [
    ['තලපත් - Thalapath', 1200],
    ['බලයා - Balaya', 800],
    ['කෙලවල්ලා - Kelawalla', 1000],
    ['කෙලවල්ලා LOIN - Kelawalla LOIN', 1500],
    ['පැණියා - Paniya', 800],
    ['බට්ටා - Batta', 600],
    ['පරව් - Paraw', 950],
    ['ගල්මුල්ලා - Galmulla', 700],
    ['හුරුල්ලා - Hurulla', 500],
    ['සාලයා - Salaya', 400],
    ['බොරළුවා - Boraluwa', 600],
    ['තෝරා - Seer Fish', 1800],
    ['මඩුවා - Stingray', 650],

    ['සූඩයා - Sudaya', 350],

    ['ලින්නා - Linna', 550],
    ['ටොම්බා කෙලවල්ලා - Tomba Kelawalla', 500],
    ['හුලං යකා - Hulan Yaka', 500],
    ['කස මෝරා - Kasa Mora', 500],
    ['උදලු මෝරා - Udalu Mora', 500],
    ['ටින්කිරි මෝරා - Tinkiri Mora', 500],
    ['ගල් මෝරා - Gal Mora', 500],
    ['කොටි මෝරා - Koti Mora', 500],
    ['අලි මඩුවා - Ali Maduwa', 500],
    ['සප්පරු - Sapparu', 500],
    ['කොප්පරු - Kopparu', 500],
    ['පැණි කොප්පරු - Pani Kopparu', 500],
    ['පෙරුන්තලයා - Perunthalaya', 500],
    ['සීනි මෝරු - Seeni Moru', 500],
    ['සවරු - Sawaru', 500],
    ['වන්නා - Wanna', 500]
  ];
  const insertMany = db.transaction((fishList) => {
    for (const fish of fishList) {
      insertProduct.run(fish[0], fish[1]);
    }
  });
  insertMany(initialFish);
}

// 5. Settings
db.exec(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
)`);

const defaultSettings = [
  ['stall_name', 'THINAYA SEA FOOD SUPPLIER'],
  ['stall_address', 'Main Road, Negombo'],
  ['stall_phone', '031-22XXXXX'],
  ['stall_footer', 'Thank You For Your Business!'],
  ['stall_logo', ''], // Base64 or Path
  ['currency', 'Rs.']
];
const insertSetting = db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");
for (const s of defaultSettings) {
  insertSetting.run(s[0], s[1]);
}

console.log(">>> HIGH-FIDELITY DATABASE TABLES READY <<<");

// --- Exported helpers (sync, wrapped in Promises for IPC compatibility) ---
module.exports = {
  query: (sql, params = []) => {
    try {
      const rows = db.prepare(sql).all(...params);
      return Promise.resolve(rows);
    } catch (err) {
      console.error("QUERY ERROR:", err);
      return Promise.reject(err);
    }
  },
  run: (sql, params = []) => {
    try {
      const result = db.prepare(sql).run(...params);
      return Promise.resolve({ id: result.lastInsertRowid, changes: result.changes });
    } catch (err) {
      console.error("RUN ERROR:", err);
      return Promise.reject(err);
    }
  }
};
