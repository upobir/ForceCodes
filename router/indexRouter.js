// libraries
const express = require('express');

const router = express.Router({mergeParams : true});

// sub-routers
const signupRouter = require('./auth/signup');
const loginRouter = require('./auth/login');
const logoutRouter = require('./auth/logout');
const userRouter = require('./users/users.js');
const profileRouter = require('./profile/profile');
const blogRouter = require('./blog/blog');

// ROUTE: home page
router.get('/', (req, res) =>{
    res.render('layout.ejs', {
        title: 'ForceCodes', 
        body : ['panel-view', 'home'],
        user: req.user
    });
});

// setting up sub-routers
router.use('/signup', signupRouter);
router.use('/login', loginRouter);
router.use('/logout', logoutRouter);
router.use('/users', userRouter);
router.use('/profile', profileRouter);
router.use('/blog', blogRouter);


module.exports = router