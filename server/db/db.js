const mysql = require("mysql");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "liang",
  port: 3306,
  database: "blockchain"
});

const query = function(sql, args) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
      if (err) {
        reject(err);
      } else {
        conn.query(sql, args, (err, rows) => {
          if (err) {
            pool.releaseConnection(conn);
            reject(err);
          } else {
            pool.releaseConnection(conn);
            resolve(rows);
          }
        });
      }
    });
  });
};

module.exports = { query };
