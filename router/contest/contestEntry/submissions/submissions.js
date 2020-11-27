// libraries
const express = require('express');
const fs = require('fs');

const rightPanelUtils = require(process.env.ROOT + '/utils/rightPanel-utils');
const innerNavUtils = require(process.env.ROOT + '/utils/innerNav-utils');

const DB_contests = require(process.env.ROOT + '/DB-codes/DB-contest-api');

const router = express.Router({mergeParams : true});

router.get('/', async(req, res) =>{
    let innerNav = innerNavUtils.getContestInnerNav(req.contest);
    let rightPanel = await rightPanelUtils.getRightPanel(req.user);
    let submissions = await DB_contests.getAllSubmissions(req.contest.ID);
    submissions.forEach(sbmssn => {
        sbmssn.NAME = String.fromCharCode(65+sbmssn.PROB_NUM) + '. ' + sbmssn.NAME;
    })

    res.render('layout.ejs', {
        title: `${req.contest.NAME} - ForceCodes`,
        body: ['panel-view', 'submissions', 'STATUS'],
        user: req.user,
        innerNav : innerNav,
        listHeader : 'All Submissions',
        submissions : submissions,
        rightPanel : rightPanel
    }); 
});

router.get('/my', async(req, res) =>{
    let innerNav = innerNavUtils.getContestInnerNav(req.contest);
    let rightPanel = await rightPanelUtils.getRightPanel(req.user);
    let user = (req.user == null)? null : req.user.id;
    let submissions = await DB_contests.getUserSubmissions(req.contest.ID, user);
    submissions.forEach(sbmssn => {
        sbmssn.NAME = String.fromCharCode(65+sbmssn.PROB_NUM) + '. ' + sbmssn.NAME;
    })

    res.render('layout.ejs', {
        title: `${req.contest.NAME} - ForceCodes`,
        body: ['panel-view', 'submissions', 'MY SUBMISSIONS'],
        user: req.user,
        innerNav : innerNav,
        listHeader : 'Your Submissions',
        submissions : submissions,
        rightPanel : rightPanel
    }); 
});

router.get('/admin', async(req, res) =>{
    if(!req.contest.IS_ADMIN){
        res.redirect(`/contest/${req.contest.ID}/submissions`);
    }
    else{
        let innerNav = innerNavUtils.getContestInnerNav(req.contest);
        let rightPanel = await rightPanelUtils.getRightPanel(req.user);
        let submissions = await DB_contests.getAdminSubmissions(req.contest.ID);
        submissions.forEach(sbmssn => {
            sbmssn.NAME = String.fromCharCode(65+sbmssn.PROB_NUM) + '. ' + sbmssn.NAME;
        })

        res.render('layout.ejs', {
            title: `${req.contest.NAME} - ForceCodes`,
            body: ['panel-view', 'submissions', 'ADMIN SUBMISSIONS'],
            user: req.user,
            innerNav : innerNav,
            listHeader : 'Admin Submissions',
            submissions : submissions,
            rightPanel : rightPanel
        }); 
    }
});

router.get('/:sbmssnId', async(req, res, next) =>{
    let submissions = await DB_contests.getSubmission(req.params.sbmssnId);
    if(submissions.length == 0 || req.user == null){
        next();
        return;
    }
    if(submissions[0].TYPE == 'ADMIN' && !req.contest.IS_ADMIN){
        next();
        return;
    }
    if(submissions[0].TYPE == 'CONTEST' && req.user.id != submissions[0].AUTHOR_ID && !req.contest.IS_ADMIN && Date.now() - req.contest.TIME_START <= req.contest.DURATION * 60 * 1000){
        res.redirect(`/contest/${req.contest.ID}/submissions`);
        return;
    }

    let code = await fs.readFileSync(process.env.ROOT + '/problem-data/submissions/' + submissions[0].URL);
    let layoutNav = innerNavUtils.getContestInnerNav(req.contest);

    res.render('layout.ejs', {
        title : 'Submission - ForceCodes',
        body : ['submission'],
        layoutNav : layoutNav,
        user : req.user,
        submission : submissions[0],
        code : code
    });
});

module.exports = router;