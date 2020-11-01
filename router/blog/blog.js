// libraries
require('dotenv').config();
const express = require('express');

const DB_blog = require(process.env.ROOT + '/DB-codes/DB-blog-api');

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
            body: ['panel-view', 'newBlog'],
            user: req.user,
            tags : tags
        });   
    }
});

//TODO add contest linking to blog
router.post('/new', async (req, res, next)=>{
    if(req.user == null)
        next();
    else{
        //res.json(req.body);
        const blog = {
            title : req.body.title,
            body : req.body.body,
            author : req.user.id
        };
        const blogId = await DB_blog.createBlog(blog);
        console.log('blog created');

        let tags = req.body.tagList.toLowerCase().split(',');
        tags = tags.sort().filter((item, pos, ar) => {
            return item != '' && (pos == 0 || item != ar[pos-1]);
        });

        await DB_blog.addBlogTags(blogId, tags);
        console.log('tags added');

        res.redirect(`/profile/${req.user.handle}/blog`);
    }
});

module.exports = router;