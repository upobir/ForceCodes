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

async function getFutureContests(){
    let sql = `
        SELECT
            C.ID,
            C.NAME,
            C.TIME_START, 
            C.DURATION,
            NVL(R.REG_CNT, 0) "REG_CNT"
        FROM
            CONTEST "C" LEFT JOIN
            (
                SELECT 
                    CONTEST_ID,
                    COUNT(*) "REG_CNT"
                FROM
                    CONTEST_REGISTRATION
                GROUP BY
                    CONTEST_ID
            ) "R" ON (R.CONTEST_ID = C.ID)
        WHERE 
            TIME_START + NUMTODSINTERVAL(DURATION, 'MINUTE') >= SYSDATE
        ORDER BY
            TIME_START ASC
    `;
    return (await database.execute(sql, {}, database.options)).rows;
}

async function getAllContestAdmins(){
    let sql = `
        SELECT
            A.CONTEST_ID,
            U.HANDLE,
            U.COLOR
        FROM
            USER_CONTEST_ADMIN "A" JOIN
            USER_LIST_VIEW "U" ON (A.USER_ID = U.ID)
        ORDER BY
            U.HANDLE ASC
    `;
    return (await database.execute(sql, {}, database.options)).rows;
}

async function getPastContests(){
    let sql = `
        SELECT
            C.ID,
            C.NAME,
            C.TIME_START, 
            C.DURATION,
            NVL(R.PART_CNT, 0) "PART_CNT"
        FROM
            CONTEST "C" LEFT JOIN
            (
                SELECT 
                    CONTEST_ID,
                    COUNT(*) "PART_CNT"
                FROM
                    CONTEST_REGISTRATION
                WHERE
                    STANDING IS NOT NULL
                GROUP BY
                    CONTEST_ID
            ) "R" ON (R.CONTEST_ID = C.ID)
        WHERE 
            TIME_START + NUMTODSINTERVAL(DURATION, 'MINUTE') < SYSDATE
        ORDER BY
            TIME_START DESC
    `;
    return (await database.execute(sql, {}, database.options)).rows;
}

module.exports = {
    createContest,
    getFutureContests,
    getAllContestAdmins,
    getPastContests
}