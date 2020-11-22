// libraries
const express = require('express');

const DB_problems = require(process.env.ROOT + '/DB-codes/DB-problem-api');
const DB_contests = require(process.env.ROOT + '/DB-codes/DB-contest-api');

const innerNavUtils = require(process.env.ROOT + '/utils/innerNav-utils');
const rightPanelUtils = require(process.env.ROOT + '/utils/rightPanel-utils');
const submissionUtils = require(process.env.ROOT + '/utils/submission-utils');
const router = express.Router({mergeParams : true});

router.get('/', async (req, res) =>{
    let languages = await DB_problems.getLanguages();
    let problems = await DB_problems.getContestProblems(req.params.contestId);

    let innerNav = innerNavUtils.getContestInnerNav(req.contest);
    let rightPanel = await rightPanelUtils.getRightPanel(req.user);

    res.render('layout.ejs', {
        title: `Submit Code - ForceCodes`,
        body: ['panel-view', 'submit', 'SUBMIT CODE'],
        user: req.user,
        problems: problems,
        selected : req.query.problem,
        languages : languages,
        innerNav : innerNav,
        contest : req.contest,
        rightPanel : rightPanel
    }); 
});

router.post('/', async(req, res) =>{
    if(req.user == null){
        res.redirect(`/contest/${req.contest.ID}`);
        return;
    }
    let author = req.user.id;

    if(req.contest.TIME_START > Date.now()){
        if(req.contest.IS_ADMIN){
            ;
        }
        else{
            res.redirect(`/contest/${req.contest.ID}`);
            return;
        }
    }
    else if(new Date(req.contest.TIME_START + req.contest.duration * 60 * 1000) >= Data.now()){
        let results = (await DB_contests.checkRegistration(req.contest.ID, req.user.ID));
        if(results.length > 0){
            author = results[0].ID;
        }
        else{
            res.redirect(`/contest/${req.contest.ID}`);
            return;
        }
    }

    await submissionUtils.submit(req.user.id, req.contest.ID, req.body.problem, req.body.language, req.body.code);

    res.redirect(`/contest/${req.contest.ID}/submissions/my`);
});

module.exports = router;