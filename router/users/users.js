// libraries
const express = require('express');

const router = express.Router();

router.get('/', (req, res) =>{
    res.render('layout.ejs', {
        title: 'Users - ForceCodes',
        body: 'users',
        user: req.user
    });
});

router.get('/:id', (req, res) =>{
    res.json({
        userId: req.params.id
    });
});

module.exports = router;