const timeUtils = require('./time-utils');
const DB_blog = require(process.env.ROOT + '/DB-codes/DB-blog-api');

async function blogProcess(blog){
    blog.CREATION_TIME = timeUtils.timeAgo(blog.CREATION_TIME);
    blog.TAGS = (await DB_blog.getTagsByBlogId(blog.ID)).filter(x => x != null).map(x => x.NAME);
    return;
}

async function getAllTags(){
    let tagsObj = await DB_blog.getAllBlogTags();
    let tags = [];
    for(let i = 0; i<tagsObj.length; i++){
        tags.push(tagsObj[i].NAME);
    }
    return tags;
}

module.exports = {
    blogProcess,
    getAllTags
}