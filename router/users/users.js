// libraries
const express = require('express');

// my modules
const DB_users = require('./../../DB-codes/DB-users-api');

const router = express.Router();

router.get('/', async (req, res) =>{
    const userList = await DB_users.getRatingOrderedUsers(1, 50);
    res.render('layout.ejs', {
        title: 'Users - ForceCodes',
        body: ['panel-view', 'users', 'all'],
        user: req.user,
        userList: userList
    });
});

router.get('/:id', (req, res) =>{
    res.json({
        userId: req.params.id
    });
});

module.exports = router;