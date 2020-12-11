const database = require('./database');

async function getRatingOrderedUsers(){
    const sql = `
        SELECT
            RANK_NO,
            HANDLE,
            COLOR,
            RATING
        FROM
            USER_LIST_VIEW
        WHERE
            RATING IS NOT NULL
        ORDER BY
            RANK_NO
    `;
    const binds = {}
    return (await database.execute(sql, binds, database.options)).rows;
}

async function getAllUserByCountry(country){
    const sql = `
        SELECT
            UR.RANK_NO,
            UR.HANDLE,
            UR.COLOR,
            UR.RATING
        FROM
            USER_LIST_VIEW "UR" JOIN
            USER_ACCOUNT "U" ON (U.ID = UR.ID) JOIN
            COUNTRY "C" ON (C.ID = U.COUNTRY_ID)
        WHERE
            C.NAME = :country
        ORDER BY
            UR.RANK_NO
    `;
    const binds = {
        country : country
    };
    return (await database.execute(sql, binds, database.options)).rows;
}

async function getAllUsersByCity(city, country){
    const sql = `
        SELECT
            UR.RANK_NO,
            UR.HANDLE,
            UR.COLOR,
            UR.RATING
        FROM
            USER_LIST_VIEW "UR" JOIN
            USER_ACCOUNT "U" ON (U.ID = UR.ID) JOIN
            COUNTRY "CO" ON (CO.ID = U.COUNTRY_ID) JOIN
            CITY "CI" ON (CI.ID = U.CITY_ID)
        WHERE
            CO.NAME = :country AND
            CI.NAME = :city
        ORDER BY
            UR.RANK_NO
    `;
    const binds = {
        country : country,
        city : city
    };
    return (await database.execute(sql, binds, database.options)).rows;
}

//TODO fix order
async function getRatingOrderedFriends(userId){
    const sql = `
        (
            SELECT
                U.RANK_NO,
                U.HANDLE,
                U.COLOR,
                U.RATING
            FROM
                USER_LIST_VIEW "U" LEFT JOIN
                USER_USER_FOLLOW "F" ON (U.ID = F.FOLLOWED_ID)
            WHERE
                F.FOLLOWER_ID = :id
        ) UNION (
            SELECT
                U.RANK_NO,
                U.HANDLE,
                U.COLOR,
                U.RATING
            FROM
                USER_LIST_VIEW "U"
            WHERE
                ID = :id
        )
        ORDER BY
            RANK_NO
    `;
    const binds = {
        id: userId
    }
    return (await database.execute(sql, binds, database.options)).rows;
}

async function getAllAdmins(){
    const sql = `
        SELECT
            U.RANK_NO,
            U.HANDLE,
            U.COLOR
        FROM
            USER_LIST_VIEW "U"
        WHERE
            U.RATING IS NULL
        ORDER BY
            RANK_NO
    `;
    return (await database.execute(sql, {}, database.options)).rows;
}

async function getUserInfoByHandles(handles){
    let sql = `
        SELECT
            HANDLE,
            COLOR
        FROM
            USER_LIST_VIEW
        WHERE
            HANDLE IN (`;

        
    let binds = [];
    for(let i = 0; i<handles.length; i++){
        binds.push( handles[i]);
        sql += (i > 0) ? ", :" + i : ":" + i;
    }
    sql += ')'
    return (await database.execute(sql, binds, database.options)).rows;
}

async function getUserInfoByHandle(handle){
    const sql = `
        SELECT
            HANDLE,
            COLOR
        FROM
            USER_LIST_VIEW
        WHERE
            HANDLE = :handle
    `;
    const binds = {
        handle : handle
    };
    return (await database.execute(sql, binds, database.options)).rows;
}

module.exports = {
    getRatingOrderedUsers,
    getRatingOrderedFriends,
    getAllUserByCountry,
    getAllUsersByCity,
    getAllAdmins,
    getUserInfoByHandles,
    getUserInfoByHandle
}