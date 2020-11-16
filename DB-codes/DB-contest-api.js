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
    binds = [];

    for(let i = 0; i<contest.admins.length; i++){
        binds.push({
            handle : contest.admins[i],
            contestId : contestId,
            type : contest.mainAdmin == contest.admins[i]? 'MAIN' : 'REGULAR'
        })
    }
    await database.executeMany(sql, binds, {});
    return contestId;
}

async function updateContest(contest){
    let sql = `
        UPDATE
            CONTEST
        SET
            NAME = :title,
            TIME_START = :start_time,
            DURATION = :duration,
            MIN_RATED = :min_rating,
            MAX_RATED = :max_rating
        WHERE
            ID = :id
        `;
    let binds = {
        title : contest.title,
        start_time : contest.start,
        duration : contest.duration,
        min_rating : contest.min_rating,
        max_rating : contest.max_rating,
        id : contest.id
    };
    await database.execute(sql, binds, {});

    sql = `
        DELETE FROM
            USER_CONTEST_ADMIN
        WHERE
            CONTEST_ID = :id AND
            TYPE = 'REGULAR'
        `;
    binds = {
        id : contest.id
    };

    await database.execute(sql, binds, {});

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
                'REGULAR'
            FROM
                USER_CONTESTANT_VIEW
            WHERE
                HANDLE = :handle
        )
    `;
    binds = [];

    contest.admins.forEach(handle =>{
        binds.push({
            contestId : contest.id,
            handle : handle
        });
    })

    await database.executeMany(sql, binds, {});
    return;
}

async function deleteContest(id){
    let sql = `
        DELETE FROM
            CONTEST
        WHERE
            ID = :id
    `;
    let binds = {
        id : id
    };
    await database.execute(sql, binds, {});
    return;
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

async function getContestInfo(id){
    let sql = `
        SELECT
            C.ID,
            C.NAME,
            C.TIME_START,
            C.DURATION,
            C.MIN_RATED,
            C.MAX_RATED,
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
            C.ID = :id
    `;
    let binds = {
        id : id
    };
    let results = (await database.execute(sql, binds, database.options)).rows;
    if(results.length == 0) return results;

    sql = `
        SELECT
            U.HANDLE,
            U.COLOR,
            A.TYPE
        FROM
            USER_CONTEST_ADMIN "A" JOIN
            USER_LIST_VIEW "U" ON (A.USER_ID = U.ID)
        WHERE
            A.CONTEST_ID = :id
        ORDER BY
            A.TYPE ASC, 
            U.HANDLE ASC
    `;
    results[0].ADMINS = (await database.execute(sql, binds, database.options)).rows;
    return results;
}

//TODO add better checking
async function registerForContest(contestId, userId, contestantId){
    let sql = `
        INSERT INTO
            CONTEST_REGISTRATION(
                CONTESTANT_ID,
                CONTEST_ID
            )
        values(
            :contestantId,
            :contestId
        )
    `
    let binds = {
        contestId : contestId,
        contestantId : contestantId
    };

    console.log(binds);
    await database.execute(sql, binds, database.options);
}

async function checkRegistration(contestId, userId){
    let sql = `
        SELECT
            CN.HANDLE
        FROM
            CONTEST_REGISTRATION "R" JOIN
            CONTESTANT "CN" ON (R.CONTESTANT_ID = CN.ID) LEFT JOIN
            USER_TEAM_MEMBER "U" ON(U.TEAM_ID = CN.ID)
        WHERE
            (U.USER_ID = :userId OR
            CN.ID = :userId) AND
            R.CONTEST_ID = :contestId
    `;
    let binds = {
        userId : userId,
        contestId : contestId
    };
    return (await database.execute(sql, binds, database.options)).rows;
}

async function getAllRegistered(contestId){
    let sql = `
        SELECT
            C.ID,
            C.HANDLE,
            U.COLOR
        FROM
            CONTEST_REGISTRATION "R" JOIN
            CONTESTANT "C" ON (C.ID = R.CONTESTANT_ID) LEFT JOIN
            USER_LIST_VIEW "U" ON (C.ID = U.ID)
        WHERE
            R.CONTEST_ID = :contestId
    `
    let binds = {
        contestId : contestId
    }
    return (await database.execute(sql, binds, database.options)).rows;
}

module.exports = {
    createContest,
    getFutureContests,
    getAllContestAdmins,
    getPastContests,
    getContestInfo,
    registerForContest,
    checkRegistration,
    getAllRegistered,
    updateContest,
    deleteContest
}