// libraries
const express = require('express');
const marked = require('marked');

const router = express.Router({mergeParams : true});

const DB_blog = require(process.env.ROOT + '/DB-codes/DB-blog-api');

const blogUtils = require(process.env.ROOT + '/utils/blog-utils');

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

    const id = (req.user === null)? null : req.user.id;
    const blogs = await DB_blog.getAdminBlogs(id);

    for(let i = 0; i<blogs.length; i++){
        await blogUtils.blogProcess(blogs[i]);
        blogs[i].BODY = marked(blogs[i].BODY);
    }

    let rightPanel = await rightPanelUtils.getRightPanel(req.user);

    res.render('layout.ejs', {
        title: 'ForceCodes', 
        body : ['panel-view', 'blog'],
        user: req.user,
        blogs : blogs,
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