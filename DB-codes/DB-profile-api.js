const database = require('./database');

async function getProfileByHandle(handle){
    let sql = `
        SELECT
            U.ID,
            U.HANDLE,
            U.EMAIL,
            R.COLOR,
            R.NAME "RANK_NAME",
            U.RATING,
            U.FIRST_NAME || ' ' || U.LAST_NAME "NAME",
            C.NAME "CITY",
            CO.NAME "COUNTRY",
            O.NAME "ORGANIZATION",
            NVL(FRIEND_COUNT, 0) "FRIEND_COUNT",
            LOGIN_TIME,
            CREATION_TIME,
            NVL(B.BLOG_COUNT, 0) "BLOG_COUNT"
        FROM
            USER_CONTESTANT_VIEW "U" JOIN
            RANK "R" ON (U.RANK_ID = R.ID) LEFT JOIN
            CITY "C" ON (U.CITY_ID = C.ID AND U.COUNTRY_ID = C.COUNTRY_ID) LEFT JOIN
            COUNTRY "CO" ON (U.COUNTRY_ID = CO.ID) LEFT JOIN
            ORGANIZATION "O" ON (U.ORG_ID = O.ID) LEFT JOIN
            (
                SELECT
                    AUTHOR_ID,
                    COUNT(*) "BLOG_COUNT"
                FROM
                    BLOG_POST
                GROUP BY
                    AUTHOR_ID
            ) "B" ON (B.AUTHOR_ID = U.ID) LEFT JOIN
            (
                SELECT
                    FOLLOWED_ID,
                    COUNT(*) "FRIEND_COUNT"
                FROM
                    USER_USER_FOLLOW
                GROUP BY
                    FOLLOWED_ID
            ) "F" ON (F.FOLLOWED_ID = U.ID)
        WHERE
            HANDLE = :handle
    `;
    let binds = {
        handle: handle
    };
    return (await database.execute(sql, binds, database.options)).rows;
}

async function isFriendOfId(checkId, id){
    let sql = `
        SELECT
            *
        FROM
            USER_USER_FOLLOW
        WHERE
            FOLLOWER_ID = :id AND
            FOLLOWED_ID = :checkId
    `;
    let binds = {
        id : id,
        checkId : checkId
    }
    let results = (await database.execute(sql, binds, database.options));
    return results.rows.length > 0;
}

async function addFriendByHandle(id, handle){
    let sql = `
        INSERT INTO
            USER_USER_FOLLOW(
                FOLLOWER_ID,
                FOLLOWED_ID
            )
        SELECT
            :id,
            ID
        FROM
            USER_CONTESTANT_VIEW
        WHERE
            HANDLE = :handle
    `;
    let binds ={
        id : id,
        handle : handle
    }
    await database.execute(sql, binds, database.options);
    return;
}

async function removeFriendByHandle(id, handle){
    let sql = `
        DELETE FROM
            USER_USER_FOLLOW
        WHERE
            FOLLOWER_ID = :id AND
            FOLLOWED_ID = (
                SELECT 
                    ID
                FROM
                    USER_CONTESTANT_VIEW
                WHERE
                    HANDLE = :handle
            )
    `;
    let binds ={
        id : id,
        handle : handle
    }
    await database.execute(sql, binds, database.options);
    return;
}

module.exports = {
    getProfileByHandle,
    isFriendOfId,
    addFriendByHandle,
    removeFriendByHandle
}