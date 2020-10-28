const database = require('./database');

async function getRatingOrderedUsers(rowBegin, rowEnd){
    const sql = `
        SELECT
            RANK_NO,
            HANDLE,
            COLOR,
            RATING
        FROM
            USER_LIST_VIEW
        WHERE
            RANK_NO BETWEEN :begin AND :end
        ORDER BY
            RANK_NO
    `;
    const binds = {
        begin: rowBegin,
        end: rowEnd
    }
    return (await database.execute(sql, binds, database.options)).rows;
}

async function getRatingOrderedFriends(userId, rowBegin, rowEnd){
    const sql = `
        SELECT
            RANK_NO,
            HANDLE,
            COLOR,
            RATING
        FROM
            (
                SELECT
                    ROWNUM "NEW_RANK",
                    RANK_NO,
                    ID,
                    HANDLE,
                    COLOR,
                    RATING
                FROM
                    USER_LIST_VIEW "U" LEFT JOIN
                    USER_USER_FOLLOW "F" ON (U.ID = F.FOLLOWED_ID)
                WHERE
                    F.FOLLOWER_ID = :id OR
                    (F.FOLLOWER_ID IS NULL AND U.ID = :id)
                ORDER BY
                    RANK_NO ASC
            )
        WHERE
            NEW_RANK BETWEEN :begin AND :end
        ORDER BY
            NEW_RANK ASC
    `;
    const binds = {
        id: userId,
        begin: rowBegin,
        end: rowEnd
    }
    return (await database.execute(sql, binds, database.options)).rows;
}

module.exports = {
    getRatingOrderedUsers,
    getRatingOrderedFriends
}