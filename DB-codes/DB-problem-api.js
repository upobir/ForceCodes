const database = require('./database');

async function getContestProbCount(contestId){
    let sql = `
        SELECT
            COUNT(*) "CNT"
        FROM
            CONTEST "C" JOIN
            PROBLEM "P" ON (C.ID = P.CONTEST_ID)
        WHERE
            C.ID = :id
    `;
    let binds = {
        id : contestId
    };
    return (await database.execute(sql, binds, database.options)).rows[0].CNT;
}

async function createProblem(problem){
    let sql = `
        BEGIN
            CREATE_PROBLEM(
                :name,
                :prob_num,
                :contestId,
                :body,
                :SL,
                :TL,
                :ML,
                :rating
            );
        END;
    `;
    let binds = {
        name : problem.name,
        prob_num : problem.prob_num,
        contestId : problem.contestId,
        body : problem.body,
        SL : problem.SL,
        TL : problem.TL,
        ML : problem.ML,
        rating : problem.rating
    };
    await database.execute(sql, binds, {});
    return;
}

async function updateProblem(problem){
    let sql = `
        BEGIN
            UPDATE_PROBLEM(
                :name,
                :old_num,
                :new_num,
                :contestId,
                :body,
                :SL,
                :TL,
                :ML,
                :rating
            );
        END;
    `;

    let binds = {
        name : problem.name,
        old_num : problem.old_num,
        new_num : problem.new_num,
        contestId : problem.contestId,
        body : problem.body,
        SL : problem.SL,
        TL : problem.TL,
        ML : problem.ML,
        rating : problem.rating
    };

    await database.execute(sql, binds, {});
    return;
}

async function getContestProblems(contestId){
    let sql = `
        SELECT
            P.NAME,
            P.SOURCE_LIMIT "SL",
            P.TIME_LIMIT "TL",
            P.MEMORY_LIMIT "ML",
            (
                SELECT
                    COUNT(*)
                FROM
                    SUBMISSION "S"
                WHERE
                    S.PROBLEM_ID = P.ID AND
                    S.RESULT = 'AC' AND
                    S.SUBMISSION_TIME >= C.TIME_START
            ) "SOLVE_CNT"
        FROM
            PROBLEM "P" JOIN
            CONTEST "C" ON (C.ID = P.CONTEST_ID) 
        WHERE
            C.ID = :id
        ORDER BY
            P.PROB_NUM ASC
    `;
    let binds = {
        id : contestId
    };
    return (await database.execute(sql, binds, database.options)).rows;
}

async function getProblem(contestId, probNum){
    let sql = `
        SELECT
            CONTEST_ID,
            PROB_NUM,
            NAME,
            BODY,
            SOURCE_LIMIT "SL",
            TIME_LIMIT "TL",
            MEMORY_LIMIT "ML",
            RATING
        FROM
            PROBLEM
        WHERE
            CONTEST_ID = :contestId AND
            PROB_NUM = :probNum
    `;

    let binds = {
        contestId : contestId,
        probNum : probNum
    };
    return (await database.execute(sql, binds, database.options)).rows;
}

async function deleteProblem(contestId, probNum){
    let sql = `
        DELETE FROM
            PROBLEM
        WHERE
            CONTEST_ID = :contestId AND
            PROB_NUM = :probNum
    `;
    let binds = {
        contestId : contestId,
        probNum : probNum
    };
    await database.execute(sql, binds, {});
}

async function addTestFile(contestId, probNum, type, inputURL, outputURL){
    let sql = `
        BEGIN
            ADD_TEST_FILE(
                :contestId,
                :probNum,
                :type,
                :input,
                :output
            );
        END;
    `;
    let binds = {
        contestId : contestId,
        probNum : probNum,
        type : type,
        input : inputURL,
        output : outputURL
    };
    await database.execute(sql, binds, database.options);
    return;
}

module.exports = {
    getContestProbCount,
    createProblem,
    getContestProblems,
    getProblem,
    updateProblem,
    deleteProblem,
    addTestFile
};