const { app } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log(">>> HIGH-FIDELITY DATABASE INITIALIZING... <<<");

// Store DB in the local electron folder for reliability
const dbPath = path.join(__dirname, 'stall_local_v1.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('DATABASE ERROR:', err.message);
  } else {
    console.log('>>> DATABASE CONNECTED AT:', dbPath);
    
    db.serialize(() => {
      // 1. Customers
      db.run(`CREATE TABLE IF NOT EXISTS customers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          created_at TEXT NOT NULL
      )`);

      // 2. Transactions - Updated with customer_id
      db.run(`CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_id INTEGER,
          date TEXT NOT NULL,
          total_amount REAL NOT NULL,
          items_json TEXT NOT NULL
      )`);

      // 3. Products (Fish Types)
      db.run(`CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          default_rate REAL NOT NULL
      )`, () => {
        // Add some initial fish types if the table is empty
        db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
          if (row && row.count === 0) {
            const initialFish = [
              ['Thalapath', 1200],
              ['Balaya', 800],
              ['Kelawalla', 1000],
              ['Paraw', 950],
              ['Galmulla', 700],
              ['Hurulla', 500],
              ['Salaya', 400],
              ['Boraluwa', 600]
            ];
            initialFish.forEach(fish => {
              db.run("INSERT INTO products (name, default_rate) VALUES (?, ?)", fish);
            });
          }
        });
      });

      // 4. Settings
      db.run(`CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT
      )`, () => {
        const defaultSettings = [
          ['stall_name', 'FRESH FISH STALL'],
          ['stall_address', 'Main Road, Negombo'],
          ['stall_phone', '031-22XXXXX'],
          ['stall_footer', 'Thank You For Your Business!'],
          ['stall_logo', ''], // Base64 or Path
          ['currency', 'Rs.']
        ];
        defaultSettings.forEach(s => {
          db.run("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)", s);
        });
      });

      console.log(">>> HIGH-FIDELITY DATABASE TABLES READY <<<");
    });
  }
});

module.exports = {
  query: (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error("QUERY ERROR:", err);
        reject(err);
      } else resolve(rows);
    });
  }),
  run: (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        console.error("RUN ERROR:", err);
        reject(err);
      } else resolve({ id: this.lastID, changes: this.changes });
    });
  })
};
