const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'electron', 'stall_local_v1.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('DATABASE ERROR:', err.message);
  } else {
    db.run("UPDATE settings SET value = ? WHERE key = ?", ['Devinuwara', 'stall_address'], function(err) {
      if (err) {
        console.error("UPDATE ERROR:", err);
      } else {
        console.log("Stall address updated successfully.");
      }
      db.close();
    });
  }
});
