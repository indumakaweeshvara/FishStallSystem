const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'electron', 'stall_local_v1.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('DATABASE ERROR:', err.message);
    return;
  }
  
  db.serialize(() => {
    db.run("ALTER TABLE customers ADD COLUMN email TEXT", (err) => {
      if (err) console.log("Column 'email' might already exist or error:", err.message);
      else console.log("Added 'email' to customers.");
    });

    db.run("ALTER TABLE customers ADD COLUMN address TEXT", (err) => {
      if (err) console.log("Column 'address' might already exist or error:", err.message);
      else console.log("Added 'address' to customers.");
    });
  });

  setTimeout(() => db.close(), 1000);
});
