// libraries
const express = require('express');

const DB_users = require('../../../../DB-codes/DB-users-api');
const DB_profile = require('../../../../DB-codes/DB-profile-api');

const innerNavUtils = require('../../../../utils/innerNav-utils');

const router = express.Router({mergeParams : true});

router.get('/', async(req, res) =>{
    const handle = req.params.handle;

    if(req.user == null || req.user.handle != handle){
        res.redirect(`/profile/${handle}`);
    } else {
        let userList = await DB_users.getRatingOrderedFriends(req.user.id);

        userList = userList.filter(x => (x.HANDLE != handle));
        for(let i = 0; i<userList.length; i++){
            userList[i].RANK_NO = i+1;
        }

        innerNav = innerNavUtils.getProfileInnerNav(req.user, handle);

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

// TODO add checking
router.post('/', async(req, res) =>{
    const handle = req.params.handle;

    if(req.user == null || req.user.handle != handle){
        res.redirect(`/profile/${handle}`);
    } else {
        if(req.body.addFriend){
            await DB_profile.addFriendByHandle(req.user.id, req.body.handle);
        } else {
            await DB_profile.removeFriendByHandle(req.user.id, req.body.handle);
        }
        res.redirect(`/profile/${req.body.handle}`);
    }
});

module.exports = router;