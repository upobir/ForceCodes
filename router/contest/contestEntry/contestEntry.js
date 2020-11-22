// libraries
const express = require('express');
const rightPanelUtils = require(process.env.ROOT + '/utils/rightPanel-utils');
const timeUtils = require(process.env.ROOT + '/utils/time-utils');
const innerNavUtils = require(process.env.ROOT + '/utils/innerNav-utils');

const DB_contests = require(process.env.ROOT+'/DB-codes/DB-contest-api');
const DB_problems = require(process.env.ROOT+'/DB-codes/DB-problem-api');

const router = express.Router({mergeParams : true});

const registerRouter = require('./register/register');
const editRouter = require('./edit/edit');
const problemRouter = require('./problem/problem');
const submitRouter = require('./submit/submit');

router.use('/', async(req, res, next) =>{
    let contestId = parseInt(req.params.contestId);
    if(isNaN(contestId)){
        res.redirect('/contest');
    }
    else{
        let contestInfo = await DB_contests.getContestInfo(contestId);

        if(contestInfo.length == 0){
            res.redirect('/contest');
        }
        else{
            req.contest = contestInfo[0];
            req.contest.IS_ADMIN = (req.user != null && req.contest.ADMINS.filter(x => x.HANDLE == req.user.handle).length > 0);
            next();
        }
    }
});

router.get('/', async (req, res) =>{
    let contest = req.contest;

    let adminContest = contest.IS_ADMIN;

    if(req.user == null || !adminContest){
        if(new Date() <= contest.TIME_START){
            // non-user, regular user, before contest start
            contest.TIME_LEFT = timeUtils.timeAgo(contest.TIME_START);

            let rightPanel = await rightPanelUtils.getRightPanel(req.user);

            res.render('layout.ejs', {
                title: `${contest.NAME} - ForceCodes`,
                body: ['panel-view', 'contestAll'],
                user: req.user,
                contestsFuture: [contest],
                contestsPast : [],
                rightPanel : rightPanel
            });  
            return;
        }
    }
    
    let problems = await DB_problems.getContestProblems(contest.ID);

    let innerNav = innerNavUtils.getContestInnerNav(contest);
    let rightPanel = await rightPanelUtils.getRightPanel(req.user);

    res.render('layout.ejs', {
        title: `${contest.NAME} - ForceCodes`,
        body: ['panel-view', 'contestEntry', 'PROBLEMS'],
        user: req.user,
        innerNav : innerNav,
        contest : contest,
        adminContest : adminContest,
        problems : problems,
        rightPanel : rightPanel
    }); 
});

router.use('/edit', editRouter);
router.use('/register', registerRouter);
router.use('/problem', problemRouter);
router.use('/submit', submitRouter);

module.exports = router;