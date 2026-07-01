import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2/promise'

const pool = mysql.createPool({
    host: process.env.MYSQLHOST,
    port: process.env.MYSQLPASSWORD,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE
})

export default pool;