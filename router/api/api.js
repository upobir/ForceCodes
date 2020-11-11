// libraries
const express = require('express');

const DB_users = require(process.env.ROOT + '/DB-codes/DB-users-api');

const router = express.Router({mergeParams : true});

router.get('/users/:handle', async (req, res) =>{
    let response = null;
    let results = await DB_users.getUserInfoByHandle(req.params.handle);

    if(results.length > 0){
        response = results[0];
    }
    res.json({
        user : response
    });
});

module.exports = router;