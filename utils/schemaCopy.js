const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const sourceDbPath = path.join(__dirname, '../db/database.sqlite');
const targetDbPath = path.join(__dirname, '../db/example_database.sqlite');

const sourceDb = new Database(sourceDbPath);

const schema = sourceDb.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND sql IS NOT NULL").all();


if (fs.existsSync(targetDbPath)) {
    fs.unlinkSync(targetDbPath); 
}
const targetDb = new Database(targetDbPath);


targetDb.transaction(() => {
    schema.forEach(({ sql }) => {
        if (sql) {
            targetDb.exec(sql); 
        }
    });
})();

console.log("Schema copied successfully to new_database.sqlite");

sourceDb.close();
targetDb.close();
