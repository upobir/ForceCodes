// libraries
const express = require('express');

const teamEntryRouter = require('./teamEntry/teamEntry');

const DB_profile = require(process.env.ROOT + '/DB-codes/DB-profile-api');

const rightPanelUtils = require(process.env.ROOT + '/utils/rightPanel-utils');
const innerNavUtils = require(process.env.ROOT+'/utils/innerNav-utils');

const router = express.Router({mergeParams : true});

router.get('/new', async(req, res) =>{
    if(req.user == null){
        res.redirect('/');
        return;
    }

    const innerNav = innerNavUtils.getProfileInnerNav(req.user, req.user.handle);
    let rightPanel = await rightPanelUtils.getRightPanel(req.user);

    let team = {
        id : null,
        name : null,
        created : null,
        members : [
            {
                handle : req.user.handle,
                color : req.user.color,
                type : 'CREATOR'
            }
        ],
        isMember : true
    }

    res.render('layout.ejs', {
        title: 'ForceCodes', 
        body : ['panel-view', 'teamEntry', 'TEAMS'],
        innerNav : innerNav,
        team : team,
        user: req.user,
        rightPanel : rightPanel
    });
});

router.post('/new', async (req, res) =>{
    let members = req.body.members.split(',').filter(x => x != '');
    console.log(members);
    if(req.user == null || members[0] != req.user.handle){
        res.redirect('/');
        return;
    }

    let teamId = await DB_profile.createTeam(req.body.name, members);
    res.redirect(`/profile/${req.user.handle}/teams`);
});

router.use('/:teamId', teamEntryRouter);

module.exports = router;