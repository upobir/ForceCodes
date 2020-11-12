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
const countryRouter = require('./country/countryAll');
const contestRouter = require('./contest/contest');
const apiRouter = require('./api/api');
const rightPanelUtils = require('../utils/rightPanel-utils');

// ROUTE: home page
router.get('/', async (req, res) =>{
    let rightPanel = await rightPanelUtils.getRightPanel(req.user);

    res.render('layout.ejs', {
        title: 'ForceCodes', 
        body : ['panel-view', 'home'],
        user: req.user,
        rightPanel : rightPanel
    });
});

// setting up sub-routers
router.use('/signup', signupRouter);
router.use('/login', loginRouter);
router.use('/logout', logoutRouter);
router.use('/users', userRouter);
router.use('/profile', profileRouter);
router.use('/blog', blogRouter);
router.use('/country', countryRouter);
router.use('/contest', contestRouter);
router.use('/api', apiRouter);


module.exports = router