async function getUserIDByHandle(connection, handle){
    let sql = `
        SELECT 
            C.ID
        FROM 
            USER_ACCOUNT "U" JOIN
            CONTESTANT "C" ON (U.ID = C.ID)
        WHERE 
            C.HANDLE = :handle
        `;
    let binds = {
        handle : handle
    }
    let options = {
        outFormat: oracledb.OUT_FORMAT_OBJECT
    }

    return await connection.execute(sql, binds, options);
}

async function getUserIDByEmail(connection, email){
    let sql = `
        SELECT 
            C.ID
        FROM 
            USER_ACCOUNT "U" JOIN
            CONTESTANT "C" ON (U.ID = C.ID)
        WHERE 
            U.EMAIL = :email
        `;
    let binds = {
        email : email
    }
    let options = {
        outFormat: oracledb.OUT_FORMAT_OBJECT
    }

    return await connection.execute(sql, binds, options);
}


module.exports = {
    getUserIDByHandle,
    getUserIDByEmail
}