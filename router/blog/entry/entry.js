// libraries
require('dotenv').config();
const express = require('express');
const rightPanelUtils = require('../../../utils/rightPanel-utils');
const blogUtils = require(process.env.ROOT + '/utils/blog-utils');
const innerNavUtils = require(process.env.ROOT + '/utils/innerNav-utils');
const timeUtils = require(process.env.ROOT + '/utils/time-utils');

const DB_blog = require(process.env.ROOT + '/DB-codes/DB-blog-api');
const DB_cmnt = require(process.env.ROOT + '/DB-codes/DB-comment-api');

const editRouter = require('./edit/edit');

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
    if(results.length == 0){
        res.redirect('/');
    } else {
        let blog = results[0];
        await blogUtils.blogProcess(blog);

        let comments = await DB_cmnt.getAllComments(blog.ID, req.user === null? null : req.user.id);
        let allCmnts = {};
        let rootCmnts = [];

        for(let i = 0; i<comments.length; i++){
            comments[i].CREATION_TIME = timeUtils.timeAgo(comments[i].CREATION_TIME);
            comments[i].CHILDS = [];
            allCmnts[comments[i].ID] = comments[i];
        }
        for(let i = 0; i<comments.length; i++){
            if(comments[i].PARENT_ID == null){
                rootCmnts.push(comments[i]);
            }
            else{
                allCmnts[comments[i].PARENT_ID].CHILDS.push(comments[i]);
            }
        }

        const innerNav = innerNavUtils.getProfileInnerNav(req.user, blog.AUTHOR);

        let rightPanel = await rightPanelUtils.getRightPanel(req.user);

        res.render('layout.ejs', {
            title: `${blog.TITLE} - ForceCodes`,
            body: ['panel-view', 'blogEntry', 'BLOG'],
            user: req.user,
            innerNav: innerNav,
            handle : blog.AUTHOR,
            blog : blog,
            comments : rootCmnts,
            rightPanel : rightPanel
        });
    }
});

router.post('/', async(req, res) =>{
    let blogId = req.params.id;
    if(req.user == null || !(req.body.id == 'null' || await DB_cmnt.isValidCommentId(req.body.id))){
        res.redirect(`/blog/entry/${blogId}`);
    }
    else{
        let cmntId = req.body.id;
        if(cmntId == 'null') cmntId = null;
        else cmntId = parseInt(cmntId);

        await DB_cmnt.addComment(req.user.id, blogId, cmntId, req.body.body);

        res.redirect(`/blog/entry/${blogId}`);
    }
});

//TODO check if comment and blog match
router.post('/vote', async (req, res) =>{
    if(req.user == null){
        res.redirect(`/blog/entry/${req.params.id}`);
    }
    else{
        if(req.body.cmntId == null){
            if(req.body.vote == null){
                await DB_blog.removeVote(req.user.id, req.params.id);
            } else {
                await DB_blog.addVote(req.user.id, req.params.id, req.body.vote);
            }
        } else {
            if(req.body.vote == null){
                await DB_cmnt.removeVote(req.user.id, req.body.cmntId);
            } else {
                await DB_cmnt.addVote(req.user.id, req.body.cmntId, req.body.vote);
            }
        }
    }
});

router.use('/edit', editRouter);

module.exports = router;