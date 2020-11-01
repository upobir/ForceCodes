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
            B.TITLE,
            U.HANDLE "AUTHOR",
            U.COLOR,
            B.CREATION_TIME,
            B.BODY,
            NVL(V.VOTES, 0) "VOTE_CNT",
            UV.TYPE "VOTED",
            NVL(C.CNT, 0) "CMNT_CNT"
        FROM
            BLOG_POST "B" JOIN
            USER_LIST_VIEW "U" ON (B.AUTHOR_ID = U.ID) LEFT JOIN
            (
                SELECT
                    BLOG_ID,
                    COUNT(*) "CNT"
                FROM
                    POST_COMMENT
                GROUP BY 
                    BLOG_ID
            ) "C" ON (C.BLOG_ID = B.ID) LEFT JOIN
            (
                SELECT
                    BLOG_ID,
                    SUM(CASE WHEN TYPE = 'UP' THEN
                            1
                        ELSE
                            -1
                        END) "VOTES"
                FROM
                    BLOG_USER_VOTE
                GROUP BY
                    BLOG_ID
            ) "V" ON (V.BLOG_ID = B.ID) LEFT JOIN
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
            U.HANDLE = :handle
    `;
    let binds = {
        handle : handle,
        id : id
    };
    return (await database.execute(sql, binds, database.options)).rows;
}

module.exports = {
    getAllBlogTags,
    createBlog,
    addBlogTags,
    getBlogInfosByHandle
};