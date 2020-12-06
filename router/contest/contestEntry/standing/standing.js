// libraries
const express = require('express');

const innerNavUtils = require(process.env.ROOT + '/utils/innerNav-utils');

const DB_contests = require(process.env.ROOT + '/DB-codes/DB-contest-api');
const DB_problems = require(process.env.ROOT + '/DB-codes/DB-problem-api');

const router = express.Router({mergeParams : true});

router.get('/', async(req, res) =>{

    req.contest.NOT_UPDATED = true;
    if(req.contest.IS_ADMIN && Date.now() - req.contest.TIME_START > req.contest.DURATION*60*1000){
        req.contest.NOT_UPDATED = await DB_contests.checkContestRatingUpdated(req.contest.ID);    
    }

    let problems = await DB_problems.getContestProblems(req.contest.ID);
    let result = await DB_contests.getStandings(req.contest.ID, problems);

    let layoutNav = innerNavUtils.getStandingsInnerNav(req.user, req.contest.ID);
    res.render('layout.ejs', {
        title : `standings - ForceCodes`,
        body : ['standings', '', 'STANDINGS'],
        layoutNav : layoutNav,
        user : req.user,
        contest : req.contest,
        problems : problems,
        standings : result
    });
})

router.get('/friends', async(req, res) =>{

    req.contest.NOT_UPDATED = true;
    if(req.contest.IS_ADMIN && Date.now() - req.contest.TIME_START > req.contest.DURATION*60*1000){
        req.contest.NOT_UPDATED = await DB_contests.checkContestRatingUpdated(req.contest.ID);    
    }

    let problems = await DB_problems.getContestProblems(req.contest.ID);
    let result = await DB_contests.getFriendStandings(req.user.id, req.contest.ID, problems);

    for(let i = 0; i<result.length; i++){
        result[i].RANK_NO = (i+1) + `(${result[i].RANK_NO})`;
    }

    let layoutNav = innerNavUtils.getStandingsInnerNav(req.user, req.contest.ID);
    res.render('layout.ejs', {
        title : `standings - ForceCodes`,
        body : ['standings', '', 'FRIEND STANDINGS'],
        layoutNav : layoutNav,
        user : req.user,
        contest : req.contest,
        problems : problems,
        standings : result
    });
})


module.exports = router;