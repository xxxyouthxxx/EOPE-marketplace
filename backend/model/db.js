const mysql = require('mysql');

// 创建MySQL连接池
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '73156',
    database: 'hope',
    charset : 'utf8mb4'
});

// 监听连接事件
pool.getConnection((err, connection) => {
    if (err) {
        console.log('连接MySQL数据库失败');
        throw err;
    }
    console.log('已经连接到MySQL数据库');
    
    // 释放连接
    connection.release();
});

// 监听错误事件
pool.on('error', (err) => {
    console.log('MySQL数据库连接出错 ');
    throw err;
});

// 导出数据库连接池对象
module.exports = pool;
