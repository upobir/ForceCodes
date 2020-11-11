// libraries
const express = require('express');

const DB_profile = require(process.env.ROOT+'/DB-codes/DB-profile-api');


const friendsRouter = require('./friends/friends');
const settingsRouter = require('./settings/settings');
const blogRouter = require('./blog/blog');

const innerNavUtils = require(process.env.ROOT+'/utils/innerNav-utils');
const timeUtils = require(process.env.ROOT+'/utils/time-utils');

const router = express.Router({mergeParams : true});

router.get('/', async(req, res) =>{
    const handle = req.params.handle;
    const profiles = await DB_profile.getProfileByHandle(handle);
    const profile = profiles[0];
    profile.NAME = profile.NAME.trim();
    profile.LAST_VISIT = timeUtils.timeAgo(profile.LOGIN_TIME);
    profile.REGISTERED = timeUtils.timeAgo(profile.CREATION_TIME);

    if(req.user != null){
        profile.IS_FRIEND = await DB_profile.isFriendOfId(profile.ID, req.user.id);
    }

    delete profile.LOGIN_TIME;
    delete profile.CREATION_TIME;

    const innerNav = innerNavUtils.getProfileInnerNav(req.user, handle);

    res.render('layout.ejs', {
        title: `${handle} - ForceCodes`,
        body: ['panel-view', 'profile', handle.toUpperCase()],
        user: req.user,
        innerNav: innerNav,
        profile: profile        
    });    
});

router.post('/admin', async (req, res) =>{
    let handle = req.params.handle;
    if(req.user !== null && req.user.isAdmin && req.user.handle !== handle){
        await DB_profile.updateAdminship(handle);
    }
    res.json({
        message : 'done'
    });
})

router.use('/friends', friendsRouter);
router.use('/settings', settingsRouter);
router.use('/blog', blogRouter);

module.exports = router;