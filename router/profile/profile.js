// libraries
const express = require('express');
const DB_profile = require('../../DB-codes/DB-profile-api');
const DB_users = require('../../DB-codes/DB-users-api');

const timeUtils = require('../../utils/time-utils');

const router = express.Router();

function getInnerNav(user, handle){
    let innerNav = [
        {url: `/profile/${handle}`, name: `${handle.toUpperCase()}`},
        {url: `/profile/${handle}/blog`, name: `BLOG`},
        {url: `/profile/${handle}/teams`, name: `TEAMS`},
        {url: `/profile/${handle}/submissions`, name: `SUBMISSIONS`},
        {url: `/profile/${handle}/problemsettting`, name: `PROBLEMSETTING`}
    ];
    if(user !== null && user.handle == handle){
        innerNav.splice(1, 0, {url: `/profile/${handle}/settings`, name: `SETTINGS`});
        innerNav.splice(2, 0, {url: `/profile/${handle}/friends`, name: `FRIENDS`});
    }
    return innerNav;
}

router.get('/:handle', async(req, res, next) =>{
    const handle = req.params.handle;
    const profiles = await DB_profile.getProfileByHandle(handle);
    if(profiles.length == 0){
        next();
    }
    else{
        const profile = profiles[0];
        profile.NAME = profile.NAME.trim();
        profile.LAST_VISIT = timeUtils.timeAgo(profile.LOGIN_TIME);
        profile.REGISTERED = timeUtils.timeAgo(profile.CREATION_TIME);

        if(req.user != null){
            profile.IS_FRIEND = await DB_profile.isFriendOfId(profile.ID, req.user.id);
        }

        delete profile.LOGIN_TIME;
        delete profile.CREATION_TIME;

        const innerNav = getInnerNav(req.user, handle);
    
        res.render('layout.ejs', {
            title: `${handle} - ForceCodes`,
            body: ['panel-view', 'profile', handle.toUpperCase()],
            user: req.user,
            innerNav: innerNav,
            profile: profile
        });    
    }
});

router.get('/:handle/friends', async(req, res) =>{
    const handle = req.params.handle;

    if(req.user == null || req.user.handle != handle){
        res.redirect(`/profile/${handle}`);
    } else {
        let userList = await DB_users.getRatingOrderedFriends(req.user.id, 1, 50);

        userList = userList.filter(x => (x.HANDLE != handle));
        for(let i = 0; i<userList.length; i++){
            userList[i].RANK_NO = i+1;
        }

        innerNav = getInnerNav(req.user, handle);

        res.render('layout.ejs', {
            title: `${handle} - ForceCodes`,
            body: ['panel-view', 'userList', 'FRIENDS'],
            user: req.user,
            innerNav: innerNav,
            listHeader: 'Your friends',
            userList: userList
        });
    }
});

router.post('/:handle/friends', async(req, res) =>{
    const handle = req.params.handle;
    console.log(req.body);

    if(req.user == null || req.user.handle != handle){
        res.redirect(`/profile/${handle}`);
    } else {
        if(req.body.addFriend == 'true'){
            console.log("adding friend");
            await DB_profile.addFriendByHandle(req.user.id, req.body.handle);
        } else {
            console.log("removing friend");
            await DB_profile.removeFriendByHandle(req.user.id, req.body.handle);
        }
        res.redirect(`/profile/${req.body.handle}`);
    }
});

module.exports = router;