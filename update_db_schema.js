const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'electron', 'stall_local_v1.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('DATABASE ERROR:', err.message);
    return;
  }
  
  db.serialize(() => {
    // Add balance to customers
    db.run("ALTER TABLE customers ADD COLUMN balance REAL DEFAULT 0", (err) => {
      if (err) console.log("Column 'balance' might already exist.");
      else console.log("Added 'balance' to customers.");
    });

    // Add paid_amount to transactions
    db.run("ALTER TABLE transactions ADD COLUMN paid_amount REAL DEFAULT 0", (err) => {
      if (err) console.log("Column 'paid_amount' might already exist.");
      else console.log("Added 'paid_amount' to transactions.");
    });

    // Create payments table
    db.run(`CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        date TEXT NOT NULL
    )`, (err) => {
      if (err) console.log("Error creating payments table:", err);
      else console.log("Payments table ready.");
    });
  });

  setTimeout(() => db.close(), 1000);
});
