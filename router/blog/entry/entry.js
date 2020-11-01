// libraries
require('dotenv').config();
const express = require('express');

const router = express.Router({mergeParams : true});

router.get('/:id', (req, res) =>{
    res.json({
        id : req.params.id,
        message : 'working'
    });
})

module.exports = router;