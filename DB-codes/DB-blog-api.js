const database = require('./database');

async function getAllBlogTags(){
    let sql = `
        SELECT 
            NAME
        FROM
            TAG
        WHERE
            TYPE = 'BLOG'
    `;
    return (await database.execute(sql, {}, database.options)).rows;
}

async function createBlog(blog){
    let sql = `
        BEGIN
            CREATE_BLOG(:title, :body, :author, :id);
        END;
    `;
    let binds = {
        title : blog.title,
        body : blog.body,
        author : blog.author,
        id : {
            dir : oracledb.BIND_OUT,
            type : oracledb.NUMBER
        }
    };
    return (await database.execute(sql, binds, database.options)).outBinds.id;
}

async function addBlogTags(blog, tags){
    let sql = `
        BEGIN
            ADD_BLOG_TAG(:id, :tag);
        END;
    `;
    let binds = [];
    for(let i = 0; i<tags.length; i++){
        binds.push({
            id : blog,
            tag : tags[i]
        });
    }
    await database.executeMany(sql, binds, {});
    return;
}

async function getBlogInfosByHandle(handle, id){
    let sql = `
        SELECT
            B.*,
            UV.TYPE "VOTED"
        FROM
            BLOG_INFO_VIEW "B" LEFT JOIN
            (
                SELECT
                    BLOG_ID,
                    TYPE
                FROM
                    BLOG_USER_VOTE
                WHERE
                    USER_ID = :id
            ) "UV" ON (UV.BLOG_ID = B.ID)
        WHERE
            B.AUTHOR = :handle
        ORDER BY
            B.CREATION_TIME DESC
    `;
    let binds = {
        handle : handle,
        id : id
    };
    return (await database.execute(sql, binds, database.options)).rows;
}

async function getBlogInfoById(blogId, userId){
    let sql = `
        SELECT
            B.*,
            UV.TYPE "VOTED"
        FROM
            BLOG_INFO_VIEW "B" LEFT JOIN
            (
                SELECT
                    BLOG_ID,
                    TYPE
                FROM
                    BLOG_USER_VOTE
                WHERE
                    USER_ID = :userId
            ) "UV" ON (UV.BLOG_ID = B.ID)
        WHERE
            B.ID = :blogId
    `;
    let binds = {
        blogId : blogId,
        userId : userId
    };
    return (await database.execute(sql, binds, database.options)).rows;
}

async function getTagsByBlogId(id){
    let sql = `
        SELECT
            T.NAME
        FROM
            BLOG_TAG "B" LEFT JOIN
            TAG "T" ON (B.TAG_ID = T.ID)
        WHERE
            B.BLOG_ID = :id
    `;
    let binds = {
        id : id
    };
    return (await database.execute(sql, binds, database.options)).rows;
}

async function isBlogIdValid(id){
    let sql = `
        SELECT
            COUNT(*) "CNT"
        FROM
            BLOG_POST
        WHERE
            ID = :id
    `;
    let binds = {
        id : id
    };
    return (await database.execute(sql, binds, database.options)).rows[0].CNT;
}

async function removeVote(user, blog){
    let sql = `
        DELETE FROM
            BLOG_USER_VOTE
        WHERE
            BLOG_ID = :blogId AND
            USER_ID = (
                SELECT
                    ID
                FROM
                    USER_CONTESTANT_VIEW
                WHERE
                    HANDLE = :handle
            )
    `;
    let binds = {
        handle : user,
        blogId : blog
    };
    await database.execute(sql, binds, database.options);
    return;
}

async function addVote(user, blogId, type){
    let sql =`
        BEGIN
            UPDATE_VOTE(:user, :blog, :type);
        END;
    `;
    let binds = {
        user : user,
        blog : blogId,
        type : type? 'UP' : 'DOWN'
    }
    await database.execute(sql, binds, {});
    return;
}

async function getAuthorId(blogId){
    let sql = `
        SELECT
            AUTHOR_ID
        FROM
            BLOG_POST
        WHERE
            ID = :blogId
    `;
    let binds = {
        blogId : blogId
    };
    return (await database.execute(sql, binds, database.options)).rows[0].AUTHOR_ID;
}

async function getBlogSettingsInfo(blogId){
    let sql = `
        SELECT
            ID,
            TITLE,
            BODY,
            CREATION_TIME
        FROM
            BLOG_POST
        WHERE
            ID = :blogId
    `;
    let binds = {
        blogId : blogId
    };

    return (await database.execute(sql, binds, database.options)).rows[0];
}

async function updateBlogById(blogId, blog){
    let sql = `
        UPDATE
            BLOG_POST
        SET
            TITLE = :title,
            BODY = :body
        WHERE
            ID = :blogId
    `;
    let binds = {
        blogId : blogId,
        title : blog.title,
        body : blog.body
    };
    await database.execute(sql, binds, database.options);
    return;
}

async function deleteAllTags(blogId){
    let sql = `
        DELETE FROM
            BLOG_TAG
        WHERE
            BLOG_ID = :blogId
    `;
    let binds = {
        blogId : blogId
    };
    await database.execute(sql, binds, database.options);
    return;
}

async function deleteBlog(blogId){
    let sql = `
        DELETE FROM
            BLOG_POST
        WHERE
            ID = :blogId
    `;
    let binds = {
        blogId : blogId
    };
    await database.execute(sql, binds, database.options);
    return;
}

module.exports = {
    getAllBlogTags,
    createBlog,
    addBlogTags,
    getBlogInfosByHandle,
    isBlogIdValid,
    removeVote,
    addVote,
    getTagsByBlogId,
    getBlogInfoById,
    getAuthorId,
    getBlogSettingsInfo,
    updateBlogById,
    deleteAllTags,
    deleteBlog
};