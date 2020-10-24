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

async function createNewUser(connection, user){
    let sql = `
        BEGIN
            CREATE_NEW_USER(:handle, :email, :pass, :dob, :id);
        END;
    `;
    let binds = {
        handle: user.handle,
        email: user.email,
        pass: user.password,
        dob: user.birthdate,
        id: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER
        }
    }

    return await connection.execute(sql, binds);
}

async function getLoginInfoByHandle(connection, handle){
    let sql = `
        SELECT 
            C.ID,
            C.HANDLE,
            U.PASSWORD
        FROM
            CONTESTANT "C" JOIN
            USER_ACCOUNT "U" ON(C.ID = U.ID)
        WHERE
            C.HANDLE = :handle
    `;
    let binds = {
        handle: handle
    }
    let options = {
        outFormat: oracledb.OUT_FORMAT_OBJECT
    }

    return await connection.execute(sql, binds, options);
}


module.exports = {
    getUserIDByHandle,
    getUserIDByEmail,
    createNewUser,
    getLoginInfoByHandle
}