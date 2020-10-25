const express = require('express');

const router = express.Router();
const signupRouter = require('./signup');
const loginRouter = require('./login');

router.get('/', (req, res) =>{
    res.render('../views/layout.ejs', {
        title: 'ForceCodes', 
        user: req.user, 
        body : 'home',
        message_count : 0
    });
});

router.use('/signup', signupRouter);
router.use('/login', loginRouter);


module.exports = router