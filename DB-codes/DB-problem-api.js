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

module.exports = {
    getContestProbCount,
    createProblem
};