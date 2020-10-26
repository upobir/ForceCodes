// libraries
const express = require('express');
const DB_user = require('../../DB-codes/DB-user-api');

// creating router
const router = express.Router();

router.post('/', async (req, res) =>{
    // if logged in, delete token from database
    if(req.user !== null){
        // set null in token
        await DB_user.updateUserTokenById(req.user.id, null);
        console.log('token deleted from database');
    }
    res.redirect('/');
});

module.exports = router;