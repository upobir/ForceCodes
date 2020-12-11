// libraries
const express = require('express');

const innerNavUtils = require(process.env.ROOT + '/utils/innerNav-utils');
const rightPanelUtils = require(process.env.ROOT + '/utils/rightPanel-utils');

const DB_profiles = require(process.env.ROOT + '/DB-codes/DB-profile-api');

const router = express.Router({mergeParams : true});

router.get('/', async (req, res) =>{
    let handle = req.params.handle;

    let teams = await DB_profiles.getTeamsByHandle(handle);

    const innerNav = innerNavUtils.getProfileInnerNav(req.user, handle);

    const rightPanel = await rightPanelUtils.getRightPanel(req.user);

    res.render('layout.ejs', {
        title: `Teams - ForceCodes`,
        body: ['panel-view', 'teams', 'TEAMS'],
        user: req.user,
        handle : handle,
        teams: teams,
        innerNav: innerNav,
        rightPanel : rightPanel     
    });    
})

module.exports = router;