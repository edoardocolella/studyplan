const sqlite = require('sqlite3');

// open the database
exports.db = new sqlite.Database('./database/studyPlan.sqlite', (err) => {
  if (err) throw err;
});