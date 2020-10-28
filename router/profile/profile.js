// libraries
const express = require('express');
const DB_profile = require('../../DB-codes/DB-profile-api');

const timeUtils = require('../../utils/time-utils');

const router = express.Router();

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

        delete profile.LOGIN_TIME;
        delete profile.CREATION_TIME;

        let innerNav = [
            {url: `/profile/${handle}`, name: `${handle.toUpperCase()}`},
            {url: `/profile/${handle}/blog`, name: `BLOG`},
            {url: `/profile/${handle}/teams`, name: `TEAMS`},
            {url: `/profile/${handle}/submissions`, name: `SUBMISSIONS`},
            {url: `/profile/${handle}/problemsettting`, name: `PROBLEMSETTING`}
        ];

        if(req.user !== null && req.user.handle == handle){
            innerNav.splice(1, 0, {url: `/profile/${handle}/settings`, name: `SETTINGS`});
            innerNav.splice(2, 0, {url: `/profile/${handle}/friends`, name: `FRIENDS`});
        }
    
        res.render('layout.ejs', {
            title: `${handle} - ForceCodes`,
            body: ['panel-view', 'profile', handle.toUpperCase()],
            user: req.user,
            innerNav: innerNav,
            profile: profile
        });    
    }
});

module.exports = router;