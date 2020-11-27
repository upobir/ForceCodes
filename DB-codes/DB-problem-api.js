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
            P.ID,
            P.PROB_NUM,
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
                    S.TYPE = 'CONTEST'
            ) "SOLVE_CNT",
            P.RATING
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
            ID,
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

async function getSampleTests(contestId, probNum){
    let sql = `
        SELECT
            T.ID,
            T.TEST_NUMBER,
            T.INPUT_URL,
            T.OUTPUT_URL
        FROM
            TEST_FILE "T" JOIN
            PROBLEM "P" ON (T.PROBLEM_ID = P.ID)
        WHERE
            T.TYPE = 'SAMPLE' AND
            P.PROB_NUM = :probNum AND
            P.CONTEST_ID = :contestId
        ORDER BY
            T.TEST_NUMBER ASC
    `;
    let binds = {
        contestId : contestId,
        probNum : probNum
    };
    return (await database.execute(sql, binds, database.options)).rows;
}

async function getMainTests(contestId, probNum){
    let sql = `
        SELECT
            T.ID,
            T.TEST_NUMBER,
            T.INPUT_URL,
            T.OUTPUT_URL
        FROM
            TEST_FILE "T" JOIN
            PROBLEM "P" ON (T.PROBLEM_ID = P.ID)
        WHERE
            T.TYPE = 'MAIN' AND
            P.PROB_NUM = :probNum AND
            P.CONTEST_ID = :contestId
        ORDER BY
            T.TEST_NUMBER ASC
    `;
    let binds = {
        contestId : contestId,
        probNum : probNum
    };
    return (await database.execute(sql, binds, database.options)).rows;
}

async function isValidTestURL(contestId, probNum, testURL){
    let sql = `
        SELECT
            COUNT(*) "CNT"
        FROM 
            TEST_FILE "T" JOIN
            PROBLEM "P" ON (P.ID = T.PROBLEM_ID)
        WHERE
            P.CONTEST_ID = :contestId AND
            P.PROB_NUM = :probNum AND 
            (T.INPUT_URL = :testURL OR
            T.OUTPUT_URL = :testURL)
    `;
    let binds = {
        contestId : contestId,
        probNum : probNum,
        testURL : testURL
    };
    let result = (await database.execute(sql, binds, database.options)).rows[0].CNT;
    return result > 0;
}

async function deleteTest(contestId, probNum, type, testNum){
    let sql = `
        BEGIN
            DELETE_TEST_FILE(
                :contestId,
                :probNum,
                :test_type,
                :testNum,
                :inputURL,
                :outputURL
            );
        END;
    `;
    let binds = {
        contestId : contestId,
        probNum : probNum,
        test_type : type,
        testNum : testNum,
        inputURL : {
            dir : oracledb.BIND_OUT,
            type : oracledb.STRING,
            maxSize : 100
        },
        outputURL : {
            dir : oracledb.BIND_OUT,
            type : oracledb.STRING,
            maxSize : 100
        }
    }
    return (await database.execute(sql, binds, {})).outBinds;
}

async function getLanguages(){
    let sql = `
        SELECT
            *
        FROM
            LANGUAGE
    `;
    return (await database.execute(sql, {}, database.options)).rows;
}

async function createSubmission(problemId, userId, langId, codeSize, url){
    let sql = `
        BEGIN
            CREATE_SUBMISSION(
                :id,
                :problemId,
                :userId,
                :langId,
                :codeSize,
                :url
            );
        END;
    `;
    let binds = {
        id : {
            dir : oracledb.BIND_OUT,
            type : oracledb.NUMBER
        },
        problemId : problemId,
        userId : userId,
        langId : langId,
        codeSize : codeSize,
        url : url
    };
    return (await database.execute(sql, binds, {})).outBinds.id;
}

async function updateSubmissionResult(sbmssnId, result){
    let sql = `
        UPDATE
            SUBMISSION
        SET
            RESULT = :result,
            JUDGE_TIME = (
                SELECT
                    SYSDATE
                FROM 
                    DUAL
            )
        WHERE
            ID = :sbmssnId        
    `;
    let binds = {
        sbmssnId : sbmssnId,
        result : result
    };
    await database.execute(sql, binds, {});
    return;
}

async function updateTestResults(sbmssnId, results){
    let sql = `
        INSERT INTO
            SUBMISSION_TEST_RUN(
                SUBMISSION_ID,
                TEST_ID,
                RESULT,
                RUNTIME,
                MEMORY
            )
        SELECT
            :sbmssnId,
            T.ID,
            :result,
            :runtime,
            :memory
        FROM
            TEST_FILE "T" JOIN
            SUBMISSION "S" ON (T.PROBLEM_ID = S.PROBLEM_ID)
        WHERE
            S.ID = :sbmssnId AND
            T.TEST_NUMBER = :testNum AND
            T.TYPE = 'MAIN'
    `;
    let binds = [];
    for(let i = 0; i<results.length; i++){
        if(results[i] != null){
            binds.push({
                sbmssnId : sbmssnId,
                testNum : i+1,
                result : results[i].result,
                runtime : results[i].time,
                memory : results[i].memory
            });
        }
    }

    await database.executeMany(sql, binds, {});
    return;
}

module.exports = {
    getContestProbCount,
    createProblem,
    getContestProblems,
    getProblem,
    updateProblem,
    deleteProblem,
    addTestFile,
    getSampleTests,
    getMainTests,
    isValidTestURL,
    deleteTest,
    getLanguages,
    createSubmission,
    updateSubmissionResult,
    updateTestResults
};