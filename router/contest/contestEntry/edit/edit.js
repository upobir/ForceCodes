// libraries
const express = require('express');
const contestUtils = require(process.env.ROOT + '/utils/contest-utils');
const rightPanelUtils = require(process.env.ROOT + '/utils/rightPanel-utils');

const DB_contests = require(process.env.ROOT+'/DB-codes/DB-contest-api');

const router = express.Router({mergeParams : true});

router.get('/', async (req, res) => {
    let contestId = req.params.contestId;
    let contest = req.contest;

    if(contest.TIME_START < new Date() || req.user == null || 
        contest.ADMINS.filter(x => x.HANDLE == req.user.handle).length == 0)
    {
        res.redirect(`/contest/${contestId}`);
    }
    else{
        contest.ADMINS.forEach(x => {
            x.AUTHOR = (x.TYPE == 'MAIN')? 'true' : 'false'
        });

        let innerNav = [
            {url : `/contest/${contestId}`, name : 'PROBLEMS'},
            {url : `/contest/${contestId}/edit`, name : 'EDIT CONTEST'}
        ];

        let rightPanel = await rightPanelUtils.getRightPanel(req.user);

        res.render('layout.ejs', {
            title : 'Edit Contest - ForceCodes',
            body : ['panel-view', 'contestForm', 'EDIT CONTEST'],
            user : req.user,
            innerNav : innerNav,
            postURL : `contest/${contestId}/edit`,
            admins : contest.ADMINS,
            form : {
                title : contest.NAME,
                start : new Date(contest.TIME_START - (new Date().getTimezoneOffset() * 60000)).toJSON().slice(0, 23),
                duration : Math.floor(contest.DURATION/60) + ':' + String(contest.DURATION%60).padStart(2, '0'),
                min_rating : contest.MIN_RATED,
                max_rating : contest.MAX_RATED
            },
            errors : [],
            rightPanel : rightPanel
        });
    }
});

router.post('/', async (req, res) => {
    let contestId = req.params.contestId;
    let contest = req.contest


    if(contest.TIME_START < new Date() || req.user == null || 
        contest.ADMINS.filter(x => x.HANDLE == req.user.handle).length == 0)
    {
        res.redirect(`/contest/${contestId}`);
    }
    else{
        let errors = [];
        let newContest = {};

        await contestUtils.processContest(req.body, newContest, errors);
        
        let mainAdmin = contest.ADMINS.filter(x => x.TYPE == 'MAIN')[0].HANDLE;

        newContest.admins = newContest.admins.filter(x => x != mainAdmin);
        newContest.id = parseInt(req.params.contestId);

        if(errors.length == 0){
            await DB_contests.updateContest(newContest);
            res.redirect(`/contest/${contestId}`);
        }
        else{
            errors.push('Admin list reset');

            contest.ADMINS.forEach(x => {
                x.AUTHOR = (x.TYPE == 'MAIN')? 'true' : 'false'
            });
            let rightPanel = await rightPanelUtils.getRightPanel(req.user);

            res.render('layout.ejs', {
                title : 'Edit Contest - ForceCodes',
                body : ['panel-view', 'contestForm'],
                user : req.user,
                postURL : `contest/${contestId}/edit`,
                admins : contest.ADMINS,
                errors : errors,
                form : {
                    title : req.body.title,
                    start : req.body.start,
                    duration : req.body.duration,
                    min_rating : req.body.min_rating,
                    max_rating : req.body.max_rating,
                },
                rightPanel : rightPanel
            });
        }
    }
});

router.delete('/', async (req, res, next) =>{
    let contestId = req.params.contestId;
    let contest = req.contest;

    if(contest.TIME_START < new Date() || req.user == null || 
        contest.ADMINS.filter(x => x.HANDLE == req.user.handle).length == 0 || !req.user.isAdmin)
    {
        next();
    }
    else {
        await DB_contests.deleteContest(contestId);
        res.json({
            message : 'deleted',
            url : '/contest'
        });
    }
});

module.exports = router;