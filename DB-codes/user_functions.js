let options = {
    outFormat: oracledb.OUT_FORMAT_OBJECT
}

async function getUserIDByHandle(connection, handle){
    let sql = `
        SELECT 
            ID
        FROM 
            USER_CONTESTANT_VIEW
        WHERE 
            HANDLE = :handle
        `;
    let binds = {
        handle : handle
    }

    return await connection.execute(sql, binds, options);
}

async function getUserIDByEmail(connection, email){
    let sql = `
        SELECT 
            ID
        FROM 
            USER_CONTESTANT_VIEW
        WHERE 
            EMAIL = :email
        `;
    let binds = {
        email : email
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
            ID,
            HANDLE,
            PASSWORD
        FROM
            USER_CONTESTANT_VIEW
        WHERE
            HANDLE = :handle
    `;
    let binds = {
        handle: handle
    }

    return await connection.execute(sql, binds, options);
}

async function updateUserTokenById(connection, id, token){
    let sql = `
        UPDATE
            USER_ACCOUNT
        SET
            LOGIN_TOKEN = :token
        WHERE
            ID = :id
    `;
    let binds = {
        id: id,
        token: token
    };
    
    return await connection.execute(sql, binds, options);
}

async function getUserPromptById(connection, id){
    let sql = `
        SELECT
            HANDLE,
            LOGIN_TOKEN,
            (SELECT
                COUNT(*)
            FROM
                MESSAGE
            WHERE
                TO_USER_ID = :id AND
                TIME_READ = NULL
            ) AS "MESSAGE_COUNT"
        FROM
            USER_CONTESTANT_VIEW
        WHERE
            ID = :id
    `;
    let binds = {
        id: id
    }
    
    return await connection.execute(sql, binds, options);
}


module.exports = {
    getUserIDByHandle,
    getUserIDByEmail,
    createNewUser,
    getLoginInfoByHandle,
    updateUserTokenById,
    getUserPromptById
}