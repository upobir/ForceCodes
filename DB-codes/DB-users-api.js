const database = require('./database');

const options = {
    outFormat: oracledb.OUT_FORMAT_OBJECT
}

async function getRatingOrderedUsers(rowBegin, rowEnd){
    const sql = `
        SELECT
            RANK_NO,
            HANDLE,
            COLOR,
            RATING
        FROM
            (
                SELECT
                    ROWNUM AS "RANK_NO",
                    U.HANDLE,
                    U.RATING,
                    R.COLOR
                FROM
                    USER_CONTESTANT_VIEW "U" JOIN
                    RANK "R" ON (U.RANK_ID = R.ID)
                ORDER BY
                    U.RATING DESC
            )
        WHERE
            RANK_NO BETWEEN :begin AND :end
        ORDER BY
            RANK_NO
    `;
    const binds = {
        begin: rowBegin,
        end: rowEnd
    }
    return (await database.execute(sql, binds, options)).rows;
}

module.exports = {
    getRatingOrderedUsers
}