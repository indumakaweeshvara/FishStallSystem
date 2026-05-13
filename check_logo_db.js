const Database = require('better-sqlite3');
const path = require('path');

try {
    const dbPath = path.join(__dirname, 'electron', 'stall_local_v1.db');
    const db = new Database(dbPath);
    console.log('Connected to', dbPath);
    
    const row = db.prepare("SELECT value FROM settings WHERE key = 'stall_logo'").get();
    if (row) {
        console.log("Stall logo length:", row.value.length);
        console.log("Stall logo start:", row.value.substring(0, 100));
    } else {
        console.log("Stall logo not found.");
    }
    db.close();
} catch (err) {
    console.error('Error:', err);
}
