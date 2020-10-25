const database = require('./database');

let options = {
    outFormat: oracledb.OUT_FORMAT_OBJECT
}

// function to get id from handle
async function getUserIDByHandle(handle){
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

    return (await database.execute(sql, binds, options)).rows;
}

// function to get id from email
async function getUserIDByEmail(email){
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

    return (await database.execute(sql, binds, options)).rows;
}

// function to creat new user
// user should have handle, email, pass, dob
// {id} will be returned
async function createNewUser(user){
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

    return (await database.execute(sql, binds, {})).outBinds;
}

// return login info (id, handle, password) from handle
async function getLoginInfoByHandle(handle){
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

    return (await database.execute(sql, binds, options)).rows;
}

// set new token in user table
// empty rows are returned
async function updateUserTokenById(id, token){
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
    
    return (await database.execute(sql, binds, options)).rows;
}

// return user prompt (handle, login_token, msgCount) from id
async function getUserPromptById(id){
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
    
    return (await database.execute(sql, binds, options)).rows;
}


module.exports = {
    getUserIDByHandle,
    getUserIDByEmail,
    createNewUser,
    getLoginInfoByHandle,
    updateUserTokenById,
    getUserPromptById
}