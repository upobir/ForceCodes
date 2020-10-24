oracledb = require('oracledb')

async function run(callback){
    let connection;
    try {
        connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            connectstring: process.env.DB_CONNECTSTRING,
            externalAuth: false   
        });

        // let sql = `SELECT *1 FROM COUNTRY`;
        // let binds = {};
        // let options = {
        //     outFormat: oracledb.OUT_FORMAT_OBJECT
        // }

        // let result = await connection.execute(sql, binds, options);
        // console.log(result);
        await callback(connection);

    } catch (err) {
        console.error('ERROR: ' + err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

module.exports = { run };