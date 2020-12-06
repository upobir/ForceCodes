// libraries
const express = require('express');

const DB_profile = require(process.env.ROOT + '/DB-codes/DB-profile-api');
const DB_contests = require(process.env.ROOT + '/DB-codes/DB-contest-api');

const timeUtils = require(process.env.ROOT + '/utils/time-utils');
const innerNavUtils = require(process.env.ROOT + '/utils/innerNav-utils');
const rightPanelUtils = require(process.env.ROOT + '/utils/rightPanel-utils');

const router = express.Router({mergeParams : true});

router.get('/', async (req, res) =>{
    const handle = req.params.handle;
    let contestsMap = {}

    let contests = await DB_profile.getAdminnedContests(handle);
    contests.forEach(contest =>{
        contestsMap[contest.ID] = contest;
        contest.ADMINS = [];
        contest.TIME_AGO = timeUtils.timeAgo(contest.TIME_START);
    });

    let contestAdminsList = await DB_contests.getAllContestAdmins();

    contestAdminsList.forEach(x => {
        if(contestsMap[x.CONTEST_ID])
            contestsMap[x.CONTEST_ID].ADMINS.push(x);
    })

    const innerNav = innerNavUtils.getProfileInnerNav(req.user, handle);
    let rightPanel = await rightPanelUtils.getRightPanel(req.user);

    res.render('layout.ejs', {
        title: `ProblemSetting - ForceCodes`,
        body: ['panel-view', 'contestAll', 'PROBLEMSETTING'],
        user: req.user,
        innerNav : innerNav,
        contestsFuture: [],
        contestsPast : contests,
        header : `Contests administered by ${handle}`,
        rightPanel : rightPanel
    });
})

module.exports = router;