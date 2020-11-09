const database = require('./database');

// function to get id from handle
async function getUserIDByHandle(handle){
    const sql = `
        SELECT 
            ID
        FROM 
            USER_CONTESTANT_VIEW
        WHERE 
            HANDLE = :handle
        `;
    const binds = {
        handle : handle
    }

    return (await database.execute(sql, binds, database.options)).rows;
}

// function to get id from email
async function getUserIDByEmail(email){
    const sql = `
        SELECT 
            ID
        FROM 
            USER_CONTESTANT_VIEW
        WHERE 
            EMAIL = :email
        `;
    const binds = {
        email : email
    }

    return (await database.execute(sql, binds, database.options)).rows;
}

// function to creat new user
// user should have handle, email, pass, dob
// {id} will be returned
async function createNewUser(user){
    const sql = `
        BEGIN
            CREATE_NEW_USER(:handle, :email, :pass, :dob, :id);
        END;
    `;
    const binds = {
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
    const sql = `
        SELECT 
            ID,
            HANDLE,
            PASSWORD
        FROM
            USER_CONTESTANT_VIEW
        WHERE
            HANDLE = :handle
    `;
    const binds = {
        handle: handle
    }

    return (await database.execute(sql, binds, database.options)).rows;
}

// set new token in user table
// empty rows are returned
async function updateUserTokenById(id, token){
    const sql = `
        UPDATE
            USER_ACCOUNT
        SET
            LOGIN_TOKEN = :token
        WHERE
            ID = :id
    `;
    const binds = {
        id: id,
        token: token
    };
    
    await database.execute(sql, binds, database.options);
    return;
}

// return user prompt (handle, login_token, msgCount) from id
async function getUserPromptById(id){
    const sql = `
        SELECT
            HANDLE,
            LOGIN_TOKEN,
            RATING,
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
    const binds = {
        id: id
    }
    
    return (await database.execute(sql, binds, database.options)).rows;
}

async function updateLoginTimeById(id, time){
    const sql = `
        UPDATE
            USER_ACCOUNT
        SET
            LOGIN_TIME = :time
        WHERE
            ID = :id
    `;
    const binds = {
        id: id,
        time: time
    };
    await database.execute(sql, binds, database.options);
    return;
}


module.exports = {
    getUserIDByHandle,
    getUserIDByEmail,
    createNewUser,
    getLoginInfoByHandle,
    updateUserTokenById,
    getUserPromptById,
    updateLoginTimeById
}