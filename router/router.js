const express = require('express');

const router = express.Router();
const signupRouter = require('./signup');

router.get('/', (req, res) =>{
    res.render('../views/layout.ejs', {
        title: 'ForceCodes', 
        prompt: '_non-user-prompt', 
        body : 'home',
        message_count : 0
    });
});

router.use('/signup', signupRouter);


module.exports = router