const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'electron', 'stall_local_v1.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('DATABASE ERROR:', err.message);
  } else {
    db.serialize(() => {
      // Clear existing products
      db.run("DELETE FROM products");
      
      const fishList = [
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

      const stmt = db.prepare("INSERT INTO products (name, default_rate) VALUES (?, ?)");
      fishList.forEach(fish => {
        stmt.run(fish);
      });
      stmt.finalize();
      
      console.log("Fish types updated successfully.");
      db.close();
    });
  }
});
