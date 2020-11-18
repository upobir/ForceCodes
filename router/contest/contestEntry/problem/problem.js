// libraries
const express = require('express');
const marked = require('marked');

const innerNavUtils = require(process.env.ROOT + '/utils/innerNav-utils');
const rightPanelUtils = require(process.env.ROOT + '/utils/rightPanel-utils');

const DB_problems = require(process.env.ROOT + '/DB-codes/DB-problem-api');

const editRouter = require('./edit/edit');
const router = express.Router({mergeParams : true});

router.get('/new', async(req, res) =>{
    let contestId = req.params.contestId;
    let problemCount = 1 + await DB_problems.getContestProbCount(contestId);
    let rightPanel = await rightPanelUtils.getRightPanel(req.user);

    if(!req.contest.IS_ADMIN && req.contest.TIME_START > new Date()){
        res.redirect(`/contest/${contestId}`);
    }
    else{
        let innerNav = [
            {url : `/contest/${contestId}`, name : 'PROBLEMS'},
            {url : `/contest/${contestId}/problem/new`, name : 'NEW PROBLEM'}
        ];
    
        res.render('layout.ejs', {
            title: `New Problem - ForceCodes`,
            body: ['panel-view', 'problemForm', 'NEW PROBLEM'],
            user: req.user,
            innerNav : innerNav,
            contest : req.contest,
            postURL : `problem/new`,
            prob_cnt : problemCount,
            errors : [],
            rightPanel : rightPanel
        });  
    }
});

router.post('/new', async(req, res) =>{
    // TODO add processing
    let contestId = req.params.contestId;

    if(!req.contest.IS_ADMIN || req.contest.TIME_START <= new Date()){
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
            {url : `/contest/${contestId}/problem/new`, name : 'NEW PROBLEM'}
        ];
        let problemCount = 1 + await DB_problems.getContestProbCount(contestId);
        let rightPanel = await rightPanelUtils.getRightPanel(req.user);

        res.render('layout.ejs', {
            title: `New Problem - ForceCodes`,
            body: ['panel-view', 'problemForm', 'NEW PROBLEM'],
            user: req.user,
            innerNav : innerNav,
            contest : req.contest,
            postURL : `problem/new`,
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
            prob_num : parseInt(req.body.prob_num),
            contestId : parseInt(req.params.contestId),
            body : req.body.body,
            SL : SL,
            TL : TL,
            ML : ML,
            rating : rating,
            tags : []
        }
        await DB_problems.createProblem(problem);
        res.redirect(`/contest/${req.params.contestId}`);
    }
})

router.get('/:num', async(req, res) =>{
    let prob_num = req.params.num;
    let probNum = prob_num.charCodeAt(0)-65;
    let problems = await DB_problems.getProblem(req.params.contestId, probNum);

    if(prob_num.length > 1 || problems.length == 0){
        res.redirect(`/contest/${req.contest.ID}`);
    }
    else{
        let innerNav = innerNavUtils.getContestInnerNav(req.contest);
        let rightPanel = await rightPanelUtils.getRightPanel(req.user);

        problems[0].BODY = marked(problems[0].BODY);

        res.render('layout.ejs', {
            title: `Problem ${prob_num} - ForceCodes`,
            body: ['panel-view', 'problemEntry', 'PROBLEMS'],
            user: req.user,
            innerNav : innerNav,
            contest : req.contest,
            problem : problems[0],
            adminContest : req.contest.IS_ADMIN,
            rightPanel : rightPanel
        }); 
    }
});

router.use('/:num/edit', editRouter);

module.exports = router;