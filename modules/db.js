var mysql = require('mysql');

var pool = mysql.createPool({
    host: process.env.DBHOST,
    database: process.env.DBNAME,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    connectionLimit: 10
});

pool.getConnection((err) => {
    if (err) {
        console.error('Sikertelen adatbázis-kapcsolat:', err);
    } else {
        console.log('Sikeres adatbázis-kapcsolat.');
    }
});

module.exports = pool;