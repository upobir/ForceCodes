// libraries
const express = require('express');

const router = express.Router();

// sub-routers
const signupRouter = require('./signup');
const loginRouter = require('./login');

// ROUTE: home page
router.get('/', (req, res) =>{
    res.render('../views/layout.ejs', {
        title: 'ForceCodes', 
        body : 'home',
        user: req.user
    });
});

// setting up sub-routers
router.use('/signup', signupRouter);
router.use('/login', loginRouter);


module.exports = router