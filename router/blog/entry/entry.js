// libraries
require('dotenv').config();
const express = require('express');
const blogUtils = require(process.env.ROOT + '/utils/blog-utils');
const innerNavUtils = require(process.env.ROOT + '/utils/innerNav-utils');

const DB_blog = require(process.env.ROOT + '/DB-codes/DB-blog-api');

const router = express.Router({mergeParams : true});

router.use('/', async (req, res, next) =>{
    if(await DB_blog.isBlogIdValid(req.params.id)){
        next();
    } else {
        res.redirect('/');
    }
});

router.get('/', async (req, res) =>{
    const blogId = req.params.id;
    let results = await DB_blog.getBlogInfoById(blogId, req.user == null? null : req.user.id);
    console.log('blog fetch cool');
    if(results.length == 0){
        res.redirect('/');
    } else {
        let blog = results[0];
        console.log(blog);
        await blogUtils.blogProcess(blog);

        const innerNav = innerNavUtils.getProfileInnerNav(req.user, blog.AUTHOR);

        res.render('layout.ejs', {
            title: `${blog.TITLE} - ForceCodes`,
            body: ['panel-view', 'blogEntry', 'BLOG'],
            user: req.user,
            innerNav: innerNav,
            handle : blog.AUTHOR,
            blog : blog
        });
    }
    // res.json({
    //     id : req.params.id,
    //     message : 'working'
    // });
});

router.post('/vote', async (req, res) =>{
    if(req.body.vote == null){
        await DB_blog.removeVote(req.body.user, req.params.id);
    } else{
        await DB_blog.addVote(req.body.user, req.params.id, req.body.vote);
    }
});

module.exports = router;