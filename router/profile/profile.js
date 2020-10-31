// libraries
const express = require('express');

const handleRouter = require('./handle/handle');
const DB_profile = require('../../DB-codes/DB-profile-api');

const router = express.Router({mergeParams : true});

router.use('/:handle', async (req, res, next) =>{
    const handle = req.params.handle;
    if(await DB_profile.isHandleValid(handle)){
        next();
    } else {
        res.redirect('/');
    }
});

router.use('/:handle', handleRouter);

module.exports = router;
