const { postgresql: { password, user, database } } = require("../config.json");
const { Pool } = require("pg");

class Database {
  constructor(app) {
    this.app = app;
    this.db = new Pool({ password, user, database });
  }

  connect() {
    return this.db.connect().then((connection) => {
      this.connection = connection;
      return connection;
    });
  }

  shutdown() {
    this.connection.release();
    return this.db.end();
  }

  query(...args) {
    return this.db.query(...args);
  }
}

module.exports = Database;
