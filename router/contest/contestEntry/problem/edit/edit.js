// libraries
const express = require('express');

const rightPanelUtils = require(process.env.ROOT + '/utils/rightPanel-utils');

const DB_problems = require(process.env.ROOT + '/DB-codes/DB-problem-api');

const testRouter = require('./test/test');
const router = express.Router({mergeParams : true});

router.use('/', async (req, res, next) =>{
    let contestId = req.params.contestId;
    let prob_num = req.params.num;
    let probNum = prob_num.charCodeAt(0)-65;

    let problems = await DB_problems.getProblem(contestId, probNum);

    if(problems.length == 0 || !req.contest.IS_ADMIN || req.contest.TIME_START <= new Date()){
        res.redirect(`/contest/${contestId}/`);
    }
    else{
        req.problem = problems[0];
        next();
    }
})

router.get('/', async (req, res) =>{

    let contestId = req.params.contestId;
    let prob_num = req.params.num;
    let probNum = prob_num.charCodeAt(0)-65;

    let innerNav = [
        {url : `/contest/${contestId}`, name : 'PROBLEMS'},
        {url : `/contest/${contestId}/problem/${prob_num}/edit`, name : 'EDIT PROBLEM'},
        {url : `/contest/${contestId}/problem/${prob_num}/edit/tests`, name : 'TESTS'}
    ];
    let problemCount = await DB_problems.getContestProbCount(contestId);
    let rightPanel = await rightPanelUtils.getRightPanel(req.user);

    res.render('layout.ejs', {
        title: `Edit Problem - ForceCodes`,
        body: ['panel-view', 'problemForm', 'EDIT PROBLEM'],
        user: req.user,
        innerNav : innerNav,
        contest : req.contest,
        postURL : `contest/${contestId}/problem/${prob_num}`,
        prob_cnt : problemCount,
        form : {
            prob_num : req.problem.PROB_NUM,
            title : req.problem.NAME,
            body : req.problem.BODY,
            SL : req.problem.SL,
            TL : req.problem.TL,
            ML : req.problem.ML,
            rating : req.problem.RATING
        },
        errors : [],
        rightPanel : rightPanel
    });  
});

router.post('/', async (req, res) =>{
    // TODO add processing
    let contestId = req.params.contestId;
    let prob_num = req.params.num;
    let probNum = prob_num.charCodeAt(0)-65;

    let problemCount = 1 + await DB_problems.getContestProbCount(contestId);

    if(probNum < 0 || probNum >= problemCount || !req.contest.IS_ADMIN || req.contest.TIME_START <= new Date()){
        res.redirect(`/contest/${contestId}`);
        return;
    }

    let SL = parseInt(req.body.SL);
    let TL = parseInt(req.body.TL);
    let ML = parseInt(req.body.ML);
    let rating = parseInt(req.body.rating);

    let errors = [];

    if(SL < 512)
        errors.push('Source limit must be at least 512 bytes');
    if(TL < 500)
        errors.push('Time limit must be at least 500 millieseconds');
    if(ML > 512)
        errrors.push('Memory limit can be at most 512 megabytes')
    if(rating <= 0)
        errors.push('Rating must be positive');

    if(errors.length > 0){
        let innerNav = [
            {url : `/contest/${contestId}`, name : 'PROBLEMS'},
            {url : `/contest/${contestId}/problem/${prob_num}/edit`, name : 'EDIT PROBLEM'},
            {url : `/contest/${contestId}/problem/${prob_num}/edit/tests`, name : 'TESTS'}
        ];
        let problemCount = await DB_problems.getContestProbCount(contestId);
        let rightPanel = await rightPanelUtils.getRightPanel(req.user);

        res.render('layout.ejs', {
            title: `Edit Problem - ForceCodes`,
            body: ['panel-view', 'problemForm', 'EDIT PROBLEM'],
            user: req.user,
            innerNav : innerNav,
            contest : req.contest,
            postURL : `contest/${contestId}/problem/${prob_num}`,
            prob_cnt : problemCount,
            form : {
                prob_num : req.body.prob_num,
                title : req.params.contestId,
                body : req.body.body,
                SL : SL,
                TL : TL,
                ML : ML,
                rating : rating
            },
            errors : errors,
            rightPanel : rightPanel
        }); 
    }
    else{
        let problem = {
            name : req.body.title,
            old_num : probNum,
            new_num : parseInt(req.body.prob_num),
            contestId : parseInt(req.params.contestId),
            body : req.body.body,
            SL : SL,
            TL : TL,
            ML : ML,
            rating : rating,
            tags : []
        }
        await DB_problems.updateProblem(problem);
        res.redirect(`/contest/${req.params.contestId}`);
    }
});

router.delete('/', async(req, res, next) =>{
    let contestId = req.params.contestId;
    let prob_num = req.params.num;
    let probNum = prob_num.charCodeAt(0)-65;

    if(!req.contest.IS_ADMIN || req.contest.TIME_START <= new Date()){
        next();
    }
    else{
        await DB_problems.deleteProblem(contestId, probNum);
        res.json({
            message : 'deleted',
            url : `/contest/${contestId}`
        });
    }
});

router.use('/tests', testRouter);

module.exports = router;