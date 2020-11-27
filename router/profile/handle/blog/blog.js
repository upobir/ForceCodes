const express = require('express');
const marked = require('marked');
const rightPanelUtils = require('../../../../utils/rightPanel-utils');

const DB_blog = require(process.env.ROOT + '/DB-codes/DB-blog-api');
const innerNavUtils = require(process.env.ROOT + '/utils/innerNav-utils');
const blogUtils = require(process.env.ROOT + '/utils/blog-utils');

const router = express.Router({mergeParams : true});

router.get('/', async (req, res) => {
    const handle = req.params.handle;
    const innerNav = innerNavUtils.getProfileInnerNav(req.user, handle);

    const id = (req.user === null)? null : req.user.id;
    const blogs = await DB_blog.getBlogInfosByHandle(handle, id);
    for(let i = 0; i<blogs.length; i++){
        await blogUtils.blogProcess(blogs[i]);
        blogs[i].BODY = marked(blogs[i].BODY);
    }

    let rightPanel = await rightPanelUtils.getRightPanel(req.user);

    res.render('layout.ejs', {
        title: `${handle} - ForceCodes`,
        body: ['panel-view', 'blog', 'BLOG'],
        user: req.user,
        innerNav: innerNav,
        handle : handle,
        blogs : blogs,
        rightPanel : rightPanel
    })
});

module.exports = router;