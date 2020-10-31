// libraries
const express = require('express');
const DB_auth = require('../../DB-codes/DB-auth-api');

// creating router
const router = express.Router({mergeParams : true});

router.post('/', async (req, res) =>{
    // if logged in, delete token from database
    if(req.user !== null){
        // set null in token
        await DB_auth.updateUserTokenById(req.user.id, null);
        console.log('token deleted from database');
    }
    res.redirect('/');
});

module.exports = router;