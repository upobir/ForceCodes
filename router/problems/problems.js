// libraries
const express = require('express');

const rightPanelUtils = require(process.env.ROOT + '/utils/rightPanel-utils')
const innerNavUtils = require(process.env.ROOT + '/utils/innerNav-utils')

const DB_problems = require(process.env.ROOT + '/DB-codes/DB-problem-api');

const router = express.Router({mergeParams : true});

router.get('/', async(req, res) =>{
    let rightPanel = await rightPanelUtils.getRightPanel(req.user);
    let innerNav = innerNavUtils.getProblemsNav();

    let problems = await DB_problems.getAllProblems();

    res.render('layout.ejs', {
        title: `Problems - ForceCodes`,
        body: ['panel-view', 'problems', 'PROBLEMS'],
        user: req.user,
        innerNav : innerNav,
        problems : problems,
        rightPanel : rightPanel
    });  
})

module.exports = router;