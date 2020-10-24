oracledb = require('oracledb')
oracledb.autoCommit = true;

async function run(callback){
    let connection;
    try {
        connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            connectstring: process.env.DB_CONNECTSTRING,
            externalAuth: false   
        });
        await callback(connection);

    } catch (err) {
        console.error('ERROR (db-connection): ' + err);
    }
}

module.exports = { run };