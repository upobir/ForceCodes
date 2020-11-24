// libraries
const express = require('express');
const rightPanelUtils = require(process.env.ROOT + '/utils/rightPanel-utils');
const innerNavUtils = require(process.env.ROOT + '/utils/innerNav-utils');

const DB_profile = require(process.env.ROOT+'/DB-codes/DB-profile-api');
const DB_contests = require(process.env.ROOT+'/DB-codes/DB-contest-api');

const router = express.Router({mergeParams : true});

router.get('/', async (req, res) =>{
    let contestId = parseInt(req.params.contestId);
    let contest = req.contest;

    if (new Date() >= contest.TIME_START || req.user == null){
        res.redirect(`/contest/${contestId}`);
    } else {
        let results;
        if(!req.contest.IS_ADMIN)
            results =  await DB_contests.checkRegistration(contestId, req.user.id);
        else
            results = [{HANDLE : '0'}];

        let rightPanel = await rightPanelUtils.getRightPanel(req.user);
        if(results.length == 0){
            let teams = await DB_profile.getTeamsById (req.user.id);
        
            res.render('layout.ejs', {
                title: `Contests - ForceCodes`,
                body: ['panel-view', 'contestReg'],
                user: req.user,
                contest : contest,
                teams : teams,
                rightPanel : rightPanel
            }); 
        } else {
            let users = await DB_contests.getAllRegistered(contestId);
            let innerNav = null;
            if(req.contest.IS_ADMIN)
                innerNav = innerNavUtils.getContestInnerNav(req.contest);

            res.render('layout.ejs', {
                title: 'Registered Contestants - ForceCodes',
                body: ['panel-view', 'contestants', 'REGISTERED'],
                user: req.user,
                innerNav : innerNav,
                users: users,
                contestName : contest.NAME,
                registeredName : results[0].HANDLE,
                rightPanel : rightPanel
            });
        }
    }
});

router.post('/', async(req, res) =>{
    let contestId = parseInt(req.params.contestId);

    if(req.user != null && !req.contest.IS_ADMIN && !req.user.isAdmin){
        let id = req.user.id;
        if(req.body.type == 'team'){
            id = parseInt(req.body.team);
        }

        await DB_contests.registerForContest(contestId, req.user.id, id);
    }

    res.redirect(`/contest/${contestId}`);
});

module.exports = router;