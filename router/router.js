const express = require('express');

const router = express.Router();

router.get('/', (req, res) =>{
    res.render('../views/layout.ejs', {body : 'home'});
});

module.exports = router