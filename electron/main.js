const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./database');
const isDev = !app.isPackaged;

console.log(">>> MAIN PROCESS STARTING... <<<");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "FRESH FISH STALL - POS SYSTEM",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const startUrl = isDev 
    ? 'http://localhost:3001' 
    : `file://${path.join(__dirname, '../build/index.html')}`;

  win.loadURL(startUrl);

  // --- IPC HANDLERS ---

  ipcMain.handle('get-customers', async () => {
    console.log(">>> GET CUSTOMERS CALLED <<<");
    try {
      return await db.query("SELECT * FROM customers ORDER BY name ASC");
    } catch (err) {
      return [];
    }
  });

  ipcMain.handle('get-products', async () => {
    console.log(">>> GET PRODUCTS CALLED <<<");
    try {
      return await db.query("SELECT * FROM products ORDER BY name ASC");
    } catch (err) {
      return [];
    }
  });

  ipcMain.handle('get-transactions', async () => {
    console.log(">>> GET TRANSACTIONS CALLED <<<");
    try {
      // Join with customers to get the name
      return await db.query(`
        SELECT t.*, IFNULL(c.name, 'Walk-in Customer') as customer_name 
        FROM transactions t
        LEFT JOIN customers c ON t.customer_id = c.id
        ORDER BY t.id DESC
      `);
    } catch (err) {
      console.error("GET TRANSACTIONS ERROR:", err);
      return [];
    }
  });

  ipcMain.handle('get-settings', async () => {
    console.log(">>> GET SETTINGS CALLED <<<");
    try {
      const rows = await db.query("SELECT * FROM settings");
      const settings = {};
      rows.forEach(r => settings[r.key] = r.value);
      return settings;
    } catch (err) {
      return {};
    }
  });

  ipcMain.handle('update-setting', async (event, { key, value }) => {
    console.log(">>> UPDATE SETTING:", key, value);
    try {
      return await db.run("UPDATE settings SET value = ? WHERE key = ?", [value, key]);
    } catch (err) {
      throw err;
    }
  });

  ipcMain.handle('backup-database', async () => {
    console.log(">>> BACKUP DATABASE CALLED <<<");
    const fs = require('fs');
    const path = require('path');
    const source = path.join(__dirname, 'stall_local_v1.db');
    const destination = path.join(process.env.USERPROFILE, 'Desktop', `fish_stall_backup_${Date.now()}.db`);
    try {
      fs.copyFileSync(source, destination);
      return { success: true, path: destination };
    } catch (err) {
      console.error("BACKUP ERROR:", err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('reset-database', async () => {
    console.log(">>> RESET DATABASE CALLED <<<");
    try {
      await db.run("DELETE FROM transactions");
      // Optionally keep customers or products? User said "Reset System" so maybe all sales.
      // For safety, only reset sales/transactions for now.
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('add-customer', async (event, customer) => {
    console.log(">>> ADD CUSTOMER CALLED:", customer.name);
    try {
      return await db.run("INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)", [customer.name, customer.phone, customer.email, customer.address]);
    } catch (err) {
      console.error("ADD CUSTOMER ERROR:", err);
      throw err;
    }
  });

  ipcMain.handle('delete-customer', async (event, id) => {
    console.log(">>> DELETE CUSTOMER CALLED ID:", id);
    try {
      return await db.run("DELETE FROM customers WHERE id = ?", [id]);
    } catch (err) {
      console.error("DELETE CUSTOMER ERROR:", err);
      throw err;
    }
  });

  ipcMain.handle('save-transaction', async (event, txn) => {
    console.log(">>> SAVE TRANSACTION CALLED. TOTAL:", txn.total_amount);
    try {
      const result = await db.run(
        "INSERT INTO transactions (customer_id, date, total_amount, items_json) VALUES (?, ?, ?, ?)",
        [txn.customer_id, new Date().toISOString(), txn.total_amount, JSON.stringify(txn.items)]
      );
      console.log(">>> TRANSACTION SAVED SUCCESS, ID:", result.id);
      return result;
    } catch (err) {
      console.error(">>> SAVE TRANSACTION FAILED:", err);
      throw err;
    }
  });

  console.log(">>> IPC HANDLERS READY <<<");
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
