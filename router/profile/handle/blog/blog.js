const express = require('express');

const DB_blog = require(process.env.ROOT + '/DB-codes/DB-blog-api');
const innerNavUtils = require(process.env.ROOT + '/utils/innerNav-utils');
const timeUtils = require(process.env.ROOT + '/utils/time-utils');

const router = express.Router({mergeParams : true});

router.get('/', async (req, res) => {
    const handle = req.params.handle;
    const innerNav = innerNavUtils.getProfileInnerNav(req.user, handle);

    const id = (req.user === null)? null : req.user.id;
    const blogs = await DB_blog.getBlogInfosByHandle(handle, id);
    for(let i = 0; i<blogs.length; i++){
        blogs[i].CREATION_TIME = timeUtils.timeAgo(blogs[i].CREATION_TIME) + ' ago';
    }

    res.render('layout.ejs', {
        title: `${handle} - ForceCodes`,
        body: ['panel-view', 'blog', 'BLOG'],
        user: req.user,
        innerNav: innerNav,
        handle : handle,
        blogs : blogs
    })
});

module.exports = router;