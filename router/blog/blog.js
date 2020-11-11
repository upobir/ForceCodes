// libraries
require('dotenv').config();
const express = require('express');

const DB_blog = require(process.env.ROOT + '/DB-codes/DB-blog-api');
const entryRouter = require('./entry/entry');

const router = express.Router({mergeParams : true});

router.get('/new', async (req, res) =>{
    if(req.user === null){
        res.redirect('/');
    } else {
        let tagsObj = await DB_blog.getAllBlogTags();
        let tags = [];
        for(let i = 0; i<tagsObj.length; i++){
            tags.push(tagsObj[i].NAME);
        }
        res.render('layout.ejs', {
            title: `New Blog Entry - Codeforces`,
            body: ['panel-view', 'blogForm'],
            user: req.user,
            tags : tags,
            postURL : '/blog/new'
        });   
    }
});

//TODO add contest linking to blog
router.post('/new', async (req, res, next)=>{
    if(req.user == null)
        next();
    else{
        const blog = {
            title : req.body.title,
            body : req.body.body,
            author : req.user.id
        };
        const blogId = await DB_blog.createBlog(blog);

        let tags = req.body.tagList.toLowerCase().split(',');
        tags = tags.sort().filter((item, pos, ar) => {
            return item != '' && (pos == 0 || item != ar[pos-1]);
        });
        
        if(tags.length > 0){
            await DB_blog.addBlogTags(blogId, tags);
        }

        res.redirect(`/blog/entry/${blogId}`);
    }
});

router.use('/entry/:id', entryRouter);


module.exports = router;