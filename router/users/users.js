// libraries
const express = require('express');

// my modules
const DB_users = require('./../../DB-codes/DB-users-api');

const router = express.Router();

router.get('/', async (req, res) =>{
    const userList = await DB_users.getRatingOrderedUsers(1, 50);
    let innerNav = [
        {url: '/users', name: 'ALL'}
    ]
    if(req.user !== null){
        innerNav.push({url: '/users/friends', name: 'FRIENDS'});
    }

    res.render('layout.ejs', {
        title: 'Users - ForceCodes',
        body: ['panel-view', 'userList', 'ALL'],
        user: req.user,
        innerNav: innerNav,
        listHeader: 'All users sorted according to rating',
        userList: userList
    });
});

router.get('/friends', async (req, res) =>{
    if(req.user === null){
        res.redirect('/users');
    } else {
        const userList = await DB_users.getRatingOrderedFriends(req.user.id, 1, 50);
        for(let i = 0; i<userList.length; i++){
            userList[i].RANK_NO = (i+1) + "(" + userList[i].RANK_NO + ")";
        }

        let innerNav = [
            {url: '/users', name: 'ALL'},
            {url: '/users/friends', name: 'FRIENDS'}
        ]

        res.render('layout.ejs', {
            title: 'Users - ForceCodes',
            body: ['panel-view', 'userList', 'FRIENDS'],
            user: req.user,
            innerNav: innerNav,
            listHeader: 'You and your friends sorted accoding to rating',
            userList: userList
        });
    }
});

module.exports = router;