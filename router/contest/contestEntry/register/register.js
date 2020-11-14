// libraries
const express = require('express');
const database = require('../../../../DB-codes/database');
const rightPanelUtils = require(process.env.ROOT + '/utils/rightPanel-utils');

const DB_profile = require(process.env.ROOT+'/DB-codes/DB-profile-api');
const DB_contests = require(process.env.ROOT+'/DB-codes/DB-contest-api');

const router = express.Router({mergeParams : true});

router.get('/', async (req, res) =>{
    let contestId = parseInt(req.params.contestId);

    let contestInfo = await DB_contests.getContestInfo(contestId)
    if(contestInfo.length == 0){
        res.redirect('/contest');
    } else if (new Date() >= contestInfo[0].TIME_START || req.user == null || 
                contestInfo[0].ADMINS.filter(x => x.HANDLE == req.user.handle).length > 0){
        res.redirect(`/contest/${contestId}`);
    } else {
        let results = await DB_contests.checkRegistration(contestId, req.user.id);

        let rightPanel = await rightPanelUtils.getRightPanel(req.user);
        if(results.length == 0){
            let teams = await DB_profile.getTeamsById (req.user.id);
        
            res.render('layout.ejs', {
                title: `Contests - ForceCodes`,
                body: ['panel-view', 'contestReg'],
                user: req.user,
                contest : contestInfo[0],
                teams : teams,
                rightPanel : rightPanel
            }); 
        } else {
            let users = await DB_contests.getAllRegistered(contestId);

            res.render('layout.ejs', {
                title: 'Registered Contestants - ForceCodes',
                body: ['panel-view', 'contestants'],
                user: req.user,
                users: users,
                contestName : contestInfo[0].NAME,
                registeredName : results[0].HANDLE,
                rightPanel : rightPanel
            });
        }
    }
});

router.post('/', async(req, res) =>{
    let contestId = parseInt(req.params.contestId);

    if(req.user != null){
        let id = req.user.id;
        if(req.body.type == 'team'){
            id = parseInt(req.body.team);
        }

        await DB_contests.registerForContest(contestId, req.user.id, id);
    }

    res.redirect(`/contest/${contestId}`);
});

module.exports = router;