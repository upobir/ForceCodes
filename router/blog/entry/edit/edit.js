// libraries
require('dotenv').config();
const express = require('express');
const blogUtils = require(process.env.ROOT + '/utils/blog-utils');

const DB_blog = require(process.env.ROOT + '/DB-codes/DB-blog-api');

const router = express.Router({mergeParams : true});

router.use('/', async (req, res, next) => {
    if(req.user == null || req.user.id !== await DB_blog.getAuthorId(req.params.id)){
        res.redirect(`/blog/entry/${req.params.id}`);
    }
    else{
        next();
    }
});

router.get('/', async (req, res) =>{
    let tags = await blogUtils.getAllTags();
    let blog = await DB_blog.getBlogSettingsInfo(req.params.id);
    await blogUtils.blogProcess(blog);
    res.render('layout.ejs', {
        title: `Edit Blog - Codeforces`,
        body: ['panel-view', 'blogForm'],
        user: req.user,
        tags : tags,
        postURL : `/blog/entry/${req.params.id}/edit`,
        form : {
            id : blog.ID,
            title : blog.TITLE,
            body : blog.BODY,
            tags : blog.TAGS
        }
    });
});

router.post('/', async (req, res) =>{
    const blogId = req.params.id;
    const blog = {
        title : req.body.title,
        body : req.body.body,
    };
    await DB_blog.updateBlogById(blogId, blog);
    await DB_blog.deleteAllTags(blogId);

    let tags = req.body.tagList.toLowerCase().split(',');
    tags = tags.sort().filter((item, pos, ar) => {
        return item != '' && (pos == 0 || item != ar[pos-1]);
    });

    if(tags.length > 0){
        await DB_blog.addBlogTags(blogId, tags);
    }

    res.redirect(`/blog/entry/${req.params.id}`);
});

router.delete('/', async (req, res) =>{
    console.log('deleting');
    await DB_blog.deleteBlog(req.params.id);
    res.json({
        message : 'done'
    });
    //res.redirect(`/profile/${req.user.handle}/blog`);
});

module.exports = router;