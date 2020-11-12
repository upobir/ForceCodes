// libraries
const express = require('express');
const rightPanelUtils = require('../../utils/rightPanel-utils');

// my modules
const DB_users = require('./../../DB-codes/DB-users-api');

const router = express.Router();

router.get('/', async (req, res) =>{
    const userList = await DB_users.getRatingOrderedUsers();
    let innerNav = [
        {url: '/users', name: 'ALL'}
    ];
    if(req.user !== null){
        innerNav.push({url: '/users/friends', name: 'FRIENDS'});
        if(req.user.isAdmin){
            innerNav.push({url: '/users/admins', name: 'ADMINS'});
        }
    }

    let rightPanel = await rightPanelUtils.getRightPanel(req.user);

    res.render('layout.ejs', {
        title: 'Users - ForceCodes',
        body: ['panel-view', 'userList', 'ALL'],
        user: req.user,
        innerNav: innerNav,
        listHeader: 'All users sorted according to rating',
        userList: userList,
        rightPanel : rightPanel
    });
});

router.get('/friends', async (req, res) =>{
    if(req.user === null){
        res.redirect('/users');
    } else {
        const userList = await DB_users.getRatingOrderedFriends(req.user.id);
        for(let i = 0; i<userList.length; i++){
            userList[i].RANK_NO = (i+1) + "(" + userList[i].RANK_NO + ")";
        }

        let innerNav = [
            {url: '/users', name: 'ALL'},
            {url: '/users/friends', name: 'FRIENDS'}
        ];
        if(req.user.isAdmin){
            innerNav.push({url: '/users/admins', name: 'ADMINS'});
        }

        let rightPanel = await rightPanelUtils.getRightPanel(req.user);

        res.render('layout.ejs', {
            title: 'Users - ForceCodes',
            body: ['panel-view', 'userList', 'FRIENDS'],
            user: req.user,
            innerNav: innerNav,
            listHeader: 'You and your friends sorted accoding to rating',
            userList: userList,
            rightPanel : rightPanel
        });
    }
});

router.get('/admins', async (req, res) =>{
    if(req.user === null || !req.user.isAdmin){
        res.redirect('/users');
    } else {
        const userList = await DB_users.getAllAdmins();
        for(let i = 0; i<userList.length; i++){
            userList[i].RANK_NO = (i+1);
        }

        let innerNav = [
            {url: '/users', name: 'ALL'},
            {url: '/users/friends', name: 'FRIENDS'},
            {url: '/users/admins', name: 'ADMINS'}
        ];

        let rightPanel = await rightPanelUtils.getRightPanel(req.user);

        res.render('layout.ejs', {
            title: 'Users - ForceCodes',
            body: ['panel-view', 'userList', 'ADMINS'],
            user: req.user,
            innerNav: innerNav,
            listHeader: 'All admins',
            userList: userList,
            rightPanel : rightPanel
        });
    }
});

module.exports = router;