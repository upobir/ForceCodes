// libraries
const express = require('express');

const DB_profile = require(process.env.ROOT + '/DB-codes/DB-profile-api');
const DB_users = require(process.env.ROOT + '/DB-codes/DB-users-api');

const rightPanelUtils = require(process.env.ROOT + '/utils/rightPanel-utils');
const timeUtils = require(process.env.ROOT+'/utils/time-utils');

const router = express.Router({mergeParams : true});

router.get('/', async (req, res) =>{
    let rightPanel = await rightPanelUtils.getRightPanel(req.user);

    let teamResult = await DB_profile.getTeam(req.params.teamId);

    if(teamResult == null){
        res.redirect('/');
        return;
    }

    let user = (req.user == null)? null : req.user.handle;

    let team = {
        id : teamResult.ID,
        name : teamResult.HANDLE,
        created : timeUtils.timeAgo(teamResult.CREATION_TIME),
        members : teamResult.MEMBERS.map(x => {
            return {
                handle : x.HANDLE,
                color : x.COLOR,
                type : x.TYPE
            };
        }),
        isMember : teamResult.MEMBERS.filter(x => (x.HANDLE == user)).length > 0
    }

    res.render('layout.ejs', {
        title: `${team.name} - ForceCodes`, 
        body : ['panel-view', 'teamEntry'],
        team : team,
        user: req.user,
        rightPanel : rightPanel
    });
})

router.post('/add', async (req, res) =>{
    if(req.user == null){
        res.json(null);
        return;
    }
    if((await DB_profile.addTeamMember(req.params.teamId, req.body.handle) != null)){
        let result = (await DB_users.getUserInfoByHandle(req.body.handle))[0];
        res.json({
            user : result
        });
    } else {
        res.json(null);
    }
});

router.post('/remove', async (req, res) =>{
    if(req.user == null){
        res.json(null);
        return;
    }

    await DB_profile.removeTeamMember(req.params.teamId, req.body.handle);
    res.json({
        message : 'done'
    });
})

module.exports = router;