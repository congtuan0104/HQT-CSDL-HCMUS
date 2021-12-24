const sql = require('mssql/msnodesqlv8');

const config = {
    user: 'PCT',
    password: '1234',
    server: 'CONGTUAN\\CONGTUAN',
    driver: 'msnodesqlv8',
    database: 'CUAHANG',
    port: 1433,
    options: {
        trustedConnection: true,
    }
}

module.exports = config;
