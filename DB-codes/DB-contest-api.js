const { executeMany } = require('./database');
const database = require('./database');

async function createContest(contest){
    let sql = `
        BEGIN
            CREATE_CONTEST(
                :id,
                :name,
                :start,
                :duration,
                :min_rated,
                :max_rated
            );
        END;
    `;
    let binds = {
        id : {
            dir : oracledb.BIND_OUT,
            type : oracledb.NUMBER
        },
        name : contest.title,
        start : contest.start,
        duration : contest.duration,
        min_rated : contest.min_rating,
        max_rated : contest.max_rating
    };
    let contestId = (await database.execute(sql, binds, {})).outBinds.id;
    if(contestId == null)
        return null;

    sql = `
        INSERT INTO
            USER_CONTEST_ADMIN(
                USER_ID,
                CONTEST_ID,
                TYPE
            )
        (
            SELECT
                ID,
                :contestId,
                :type
            FROM
                USER_CONTESTANT_VIEW
            WHERE
                HANDLE = :handle
        )
    `;
    binds = [{
        handle : contest.mainAdmin,
        contestId : contestId,
        type : 'MAIN'
    }];

    for(let i = 0; i<contest.admins.length; i++){
        binds.push({
            handle : contest.admins[i],
            contestId : contestId,
            type : 'REGULAR'
        })
    }
    await database.executeMany(sql, binds, {});
    return contestId;
}

module.exports = {
    createContest
}