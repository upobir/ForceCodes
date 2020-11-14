// libraries
const express = require('express');
const rightPanelUtils = require(process.env.ROOT + '/utils/rightPanel-utils');
const timeUtils = require(process.env.ROOT + '/utils/time-utils');
const innerNavUtils = require(process.env.ROOT + '/utils/innerNav-utils');

const DB_contests = require(process.env.ROOT+'/DB-codes/DB-contest-api');

const router = express.Router({mergeParams : true});

const registerRouter = require('./register/register');

router.get('/', async (req, res) =>{
    let contestId = req.params.contestId;
    let contestInfo = await DB_contests.getContestInfo(contestId);

    if(req.user == null || contestInfo[0].ADMINS.filter(x => x.HANDLE == req.user.handle).length == 0){
        if(new Date() <= contestInfo[0].TIME_START){
            contestInfo[0].TIME_LEFT = timeUtils.timeAgo(contestInfo[0].TIME_START);

            let rightPanel = await rightPanelUtils.getRightPanel(req.user);

            res.render('layout.ejs', {
                title: `${contestInfo[0].NAME} - ForceCodes`,
                body: ['panel-view', 'contestAll'],
                user: req.user,
                contestsFuture: contestInfo,
                contestsPast : [],
                rightPanel : rightPanel
            });  
        }
        else{
            let innerNav = innerNavUtils.getContestInnerNav(contestInfo[0]);

            let rightPanel = await rightPanelUtils.getRightPanel(req.user);

            res.render('layout.ejs', {
                title: `${contestInfo[0].NAME} - ForceCodes`,
                body: ['panel-view', 'contestEntry', 'PROBLEMS'],
                user: req.user,
                innerNav : innerNav,
                rightPanel : rightPanel
            });  
        }
    }
    else{
        res.json({
            message : 'working for admin'
        });
    }
});

router.use('/register', registerRouter);

module.exports = router;