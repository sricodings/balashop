const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'striker_shop',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to database:', err);
        console.log('Please ensure MySQL is running and a database named "striker_shop" exists or run the schema script.');
    } else {
        console.log('Connected to MySQL database');
        connection.release();
    }
});

module.exports = db.promise();
