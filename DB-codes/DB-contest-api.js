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

    if(binds.length > 0)
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
                    CONTEST_REGISTRATION "CR" 
                WHERE
                    EXISTS(
                        SELECT
                            *
                        FROM
                            SUBMISSION "S" JOIN
                            PROBLEM "P" ON (P.ID = S.PROBLEM_ID)
                        WHERE
                            S.AUTHOR_ID = CR.CONTESTANT_ID AND
                            S.TYPE = 'CONTEST' AND
                            P.CONTEST_ID = CR.CONTEST_ID
                    )
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

    await database.execute(sql, binds, database.options);
}

async function checkRegistration(contestId, userId){
    let sql = `
        SELECT
            CN.ID,
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

async function getUserSubmissions(contestId, userId){
    let sql = `
        SELECT
            *
        FROM
            SUBMISSIONS_VIEW "S"
        WHERE
            (
                S.AUTHOR_ID = :userId OR
                EXISTS (
                    SELECT
                        *
                    FROM
                        USER_TEAM_MEMBER "M"
                    WHERE
                        M.TEAM_ID = S.AUTHOR_ID AND
                        M.USER_ID = :userId
                )
            ) AND
            S.CONTEST_ID = :contestId
        ORDER BY
            S.ID DESC
    `;
    let binds = {
        userId : userId,
        contestId : contestId
    };
    return (await database.execute(sql, binds, database.options)).rows;
}

async function getAdminSubmissions(contestId){
    let sql = `
        SELECT
            *
        FROM
            SUBMISSIONS_VIEW
        WHERE
            TYPE = 'ADMIN' AND
            CONTEST_ID = :contestId
        ORDER BY
            ID DESC
    `;
    let binds = {
        contestId : contestId
    };
    return (await database.execute(sql, binds, database.options)).rows;
}

async function getAllSubmissions(contestId){
    let sql = `
        SELECT
            *
        FROM
            SUBMISSIONS_VIEW
        WHERE
            TYPE <> 'ADMIN' AND
            CONTEST_ID = :contestId
        ORDER BY
            ID DESC
    `;
    let binds = {
        contestId : contestId
    };
    return (await database.execute(sql, binds, database.options)).rows;
}

async function getSubmission(sbmssnId){
    let sql = `
        SELECT
            *
        FROM
            SUBMISSIONS_VIEW
        WHERE
            ID = :sbmssnId
    `;
    let binds = {
        sbmssnId : sbmssnId
    };
    return (await database.execute(sql, binds, database.options)).rows;
}

async function getAnnouncements(contestId){
    let sql = `
        SELECT
            *
        FROM
            CONTEST_ANNOUNCEMENTS
        WHERE
            CONTEST_ID = :contestId
        ORDER BY
            CREATION_TIME ASC
    `;
    let binds = {
        contestId : contestId
    };
    return (await database.execute(sql, binds, database.options)).rows;
}

async function createAnnouncement(contestId, body){
    let sql = `
        INSERT INTO
            CONTEST_ANNOUNCEMENTS(
                ID,
                CONTEST_ID,
                BODY
            )
        VALUES(
            ANNCMNT_SEQ.NEXTVAL,
            :contestId,
            :body
        )
    `;
    let binds = {
        contestId : contestId,
        body : body
    };
    await database.execute(sql, binds, {});
    return;
}

async function deleteAnnouncement(contestId, ann_no){
    let sql = `
        DELETE FROM
            CONTEST_ANNOUNCEMENTS "A1"
        WHERE
            :ann_no = (
                SELECT
                    1 + COUNT(*)
                FROM 
                    CONTEST_ANNOUNCEMENTS "A2"
                WHERE
                    A2.CONTEST_ID = :contestId AND
                    A2.CREATION_TIME < A1.CREATION_TIME
            )
    `;
    let binds = {
        contestId : contestId,
        ann_no : ann_no
    };
    await database.execute(sql, binds, {});
    return;
}

async function getStandings(contestId, problems){
    let select_part = '';
    let from_part = '';
    for(let i= 0; i<problems.length; i++){
        select_part += `,
            T${i}.ACC_COUNT "P${i}_ACC_COUNT",
            T${i}.ACC_TIME "P${i}_ACC_TIME",
            T${i}.ATTEMPTS "P${i}_ATTEMPTS"`;
        from_part += ` LEFT JOIN
            (
                SELECT
                    *
                FROM
                    PRBLM_CNTSTNT_REPORT_VIEW
                WHERE
                    PROBLEM_ID = :prob${i}
            ) "T${i}" ON (T.ID = T${i}.ID)`;
    }
    let sql = `
        SELECT
            ROWNUM "RANK_NO",
            T.*${select_part}
        FROM
        (
            SELECT
                R.ID,
                R.HANDLE,
                R.COLOR,
                R.TYPE,
                SUM(R.ACC_TIME - C.TIME_START)*24*60*60 + SUM(R.ATTEMPTS-1)*10*60 "PENALTY",
                SUM(
                    CASE 
                        WHEN R.ACC_COUNT > 0 THEN 
                            R.RATING
                        ELSE 
                            0
                    END
                ) "SCORE",
                CR.RATING_CHANGE
            FROM
                PRBLM_CNTSTNT_REPORT_VIEW "R" JOIN
                CONTEST "C" ON (R.CONTEST_ID = C.ID) LEFT JOIN
                CONTEST_REGISTRATION "CR" ON (
                    CR.CONTEST_ID = C.ID AND
                    CR.CONTESTANT_ID = R.ID
                )
            WHERE
                R.CONTEST_ID = :contestId AND
                R.ATTEMPTS > 0
            GROUP BY
                R.ID,
                R.HANDLE,
                R.COLOR,
                R.TYPE,
                R.CONTEST_ID,
                CR.RATING_CHANGE
            ORDER BY
                SCORE DESC,
                PENALTY ASC
        ) "T" ${from_part}
        ORDER BY
            RANK_NO ASC
    `;
    let binds = {
        contestId : contestId
    };

    for(let i = 0; i<problems.length; i++){
        binds[`prob${i}`] = problems[i].ID;
    }


    let result = (await database.execute(sql, binds, database.options)).rows;

    return result;
}

async function getFriendStandings(userId, contestId, problems){
    let select_part = '';
    let from_part = '';
    for(let i= 0; i<problems.length; i++){
        select_part += `,
            T${i}.ACC_COUNT "P${i}_ACC_COUNT",
            T${i}.ACC_TIME "P${i}_ACC_TIME",
            T${i}.ATTEMPTS "P${i}_ATTEMPTS"`;
        from_part += ` LEFT JOIN
            (
                SELECT
                    *
                FROM
                    PRBLM_CNTSTNT_REPORT_VIEW
                WHERE
                    PROBLEM_ID = :prob${i}
            ) "T${i}" ON (T.ID = T${i}.ID)`;
    }
    let sql = `
        SELECT
            TT.*
        FROM
        (
            SELECT
                ROWNUM "RANK_NO",
                T.*${select_part}
            FROM
            (
                SELECT
                    R.ID,
                    R.HANDLE,
                    R.COLOR,
                    R.TYPE,
                    SUM(R.ACC_TIME - C.TIME_START)*24*60*60 + SUM(R.ATTEMPTS-1)*10*60 "PENALTY",
                    SUM(
                        CASE 
                            WHEN R.ACC_COUNT > 0 THEN 
                                R.RATING
                            ELSE 
                                0
                        END
                    ) "SCORE",
                    CR.RATING_CHANGE
                FROM
                    PRBLM_CNTSTNT_REPORT_VIEW "R" JOIN
                    CONTEST "C" ON (R.CONTEST_ID = C.ID) LEFT JOIN
                    CONTEST_REGISTRATION "CR" ON (
                        CR.CONTEST_ID = C.ID AND
                        CR.CONTESTANT_ID = R.ID
                    )
                WHERE
                    R.CONTEST_ID = :contestId AND
                    R.ATTEMPTS > 0
                GROUP BY
                    R.ID,
                    R.HANDLE,
                    R.COLOR,
                    R.TYPE,
                    R.CONTEST_ID,
                    CR.RATING_CHANGE
                ORDER BY
                    SCORE DESC,
                    PENALTY ASC
            ) "T" ${from_part}
        ) "TT"
        WHERE
            TT.ID = :userId OR
            EXISTS(
                SELECT
                    *
                FROM
                    USER_TEAM_MEMBER "M"
                WHERE
                    M.TEAM_ID = TT.ID AND
                    M.USER_ID = :userId
            ) OR
            EXISTS
            (
                SELECT
                    *
                FROM
                    USER_USER_FOLLOW "F"
                WHERE
                    TT.ID = F.FOLLOWED_ID AND
                    F.FOLLOWER_ID = :userId
            )
        ORDER BY
            TT.RANK_NO ASC
    `;
    let binds = {
        userId : userId,
        contestId : contestId
    };

    for(let i = 0; i<problems.length; i++){
        binds[`prob${i}`] = problems[i].ID;
    }


    let result = (await database.execute(sql, binds, database.options)).rows;

    return result;
}

async function checkContestRatingUpdated(contestId){
    let sql = `
        SELECT
            COUNT(*) "CNT"
        FROM
            SUBMISSION "S" JOIN
            PROBLEM "P" ON (P.ID = S.PROBLEM_ID) JOIN
            CONTEST_REGISTRATION "CR" ON (CR.CONTEST_ID = P.CONTEST_ID AND S.AUTHOR_ID = CR.CONTESTANT_ID)
        WHERE
            S.TYPE = 'CONTEST' AND
            P.CONTEST_ID = :contestId AND
            CR.STANDING IS NULL
    `;
    let binds = {
        contestId : contestId
    };
    return (await database.execute(sql, binds, database.options)).rows[0].CNT > 0;
}

async function updateRating(contestId){
    let sql = `
        BEGIN
            ASSIGN_RATING(
                :contestId
            );
        END;
    `;
    let binds = {
        contestId : contestId
    };
    await database.execute(sql, binds, {});
    return;
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
    deleteContest,
    getUserSubmissions,
    getAdminSubmissions,
    getAllSubmissions,
    getSubmission,
    getAnnouncements,
    createAnnouncement,
    deleteAnnouncement,
    getStandings,
    getFriendStandings,
    checkContestRatingUpdated,
    updateRating
}