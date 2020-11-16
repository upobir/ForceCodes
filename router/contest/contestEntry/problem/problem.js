// libraries
const express = require('express');
const rightPanelUtils = require(process.env.ROOT + '/utils/rightPanel-utils');

const DB_problems = require(process.env.ROOT + '/DB-codes/DB-problem-api');

const router = express.Router({mergeParams : true});

router.get('/new', async(req, res) =>{
    let contestId = req.params.contestId;
    let problemCount = 1 + await DB_problems.getContestProbCount(contestId);
    let rightPanel = await rightPanelUtils.getRightPanel(req.user);

    res.render('layout.ejs', {
        title: `New Problem - ForceCodes`,
        body: ['panel-view', 'problemForm'],
        user: req.user,
        contest : req.contest,
        postURL : `problem/new`,
        prob_cnt : problemCount,
        errors : [],
        rightPanel : rightPanel
    });  
});

router.post('/new', async(req, res) =>{
    // TODO add processing
    let problem = {
        name : req.body.title,
        prob_num : parseInt(req.body.prob_num),
        contestId : parseInt(req.params.contestId),
        body : req.body.body,
        SL : parseInt(req.body.SL),
        TL : parseFloat(req.body.TL),
        ML : parseInt(req.body.ML),
        rating : parseInt(req.body.rating),
        tags : []
    }
    await DB_problems.createProblem(problem);
    res.redirect(`/contest/${req.params.contestId}`);
})

module.exports = router;