oracledb = require('oracledb')
oracledb.autoCommit = true;

// creates connection pool for oracledb
async function startup() {
    console.log('starting up database.');
    const pool = await oracledb.createPool({
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        connectstring: process.env.DB_CONNECTSTRING,
        poolMin: 0,
        poolMax: 10,
        poolIncrement: 1
    });    
}

// closes connection pool for oracledb
async function shutdown() {
    console.log('shutting down database.');
    try {
        // If this hangs, you may need DISABLE_OOB=ON in a sqlnet.ora file.
        await oracledb.getPool().close(10);
        console.log('Pool closed');
    } catch(err) {
        console.error("ERROR shutting down database: "+err.message);
    }
}

// code to execute sql
async function execute(sql, binds, options){
    let connection, results;
    try {
        // Get a connection from the default pool
        connection = await oracledb.getConnection();
        results = await connection.execute(sql, binds, options);
    } catch (err) {
        console.error("ERROR executing sql: " + err.message);
    } finally {
        if (connection) {
            try {
                // Put the connection back in the pool
                await connection.close();
            } catch (err) {
                console.error("ERROR closing connection: " + err);
            }
        }
    }

    return results;
}

module.exports = { 
    startup,
    shutdown,
    execute
};