const database = require('./database');

async function isValidCommentId(id){
    let sql = `
        SELECT 
            ID
        FROM
            POST_COMMENT
        WHERE
            ID = :id
    `;
    let binds = {
        id : id
    };
    return (await database.execute(sql, binds, database.options)).rows.length > 0;
}

async function addComment(userId, blogId, cmntId, body){
    let sql=`
        INSERT INTO
            POST_COMMENT(
                ID,
                BODY,
                AUTHOR_ID,
                BLOG_ID,
                PARENT_ID
            )
        VALUES(
            CMMNT_SEQ.NEXTVAL,
            :body,
            :userId,
            :blogId,
            :cmntId
        )
    `;
    let binds = {
        body : body,
        userId : userId,
        blogId : blogId,
        cmntId : cmntId
    }
    await database.execute(sql, binds, database.options);
    return;
}

//TODO add url here
async function getAllComments(blogId, userId){
    let sql = `
        SELECT
            C.ID,
            U.HANDLE,
            U.COLOR,
            C.BODY,
            C.CREATION_TIME,
            NVL(V.VOTE_CNT, 0) "VOTE_CNT",
            UV.TYPE "VOTED",
            C.PARENT_ID
        FROM
            USER_LIST_VIEW "U" JOIN
            POST_COMMENT "C" ON (U.ID = C.AUTHOR_ID) LEFT JOIN
            (
                SELECT
                    COMMENT_ID,
                    SUM(CASE WHEN TYPE = 'UP' THEN
                            1
                        ELSE
                            -1
                        END) "VOTE_CNT"
                FROM
                    COMMENT_USER_VOTE
                GROUP BY
                    COMMENT_ID
            ) "V" ON (V.COMMENT_ID = C.ID) LEFT JOIN
            (
                SELECT
                    COMMENT_ID,
                    TYPE
                FROM
                    COMMENT_USER_VOTE
                WHERE
                    USER_ID = :userId
            ) "UV" ON (UV.COMMENT_ID = C.ID)
        WHERE
            BLOG_ID = :blogId
        ORDER BY
            C.CREATION_TIME ASC
    `;
    let binds = {
        userId : userId,
        blogId : blogId
    };
    return (await database.execute(sql, binds, database.options)).rows;
}

async function removeVote(userId, cmntId){
    let sql = `
        DELETE FROM
            COMMENT_USER_VOTE
        WHERE
            BLOG_ID = :cmntId AND
            USER_ID = :userId
    `;
    let binds = {
        userId : userId,
        cmntId : cmntId
    };
    await database.execute(sql, binds, database.options);
    return;
}

async function addVote(userId, cmntId, type){
    let sql =`
        BEGIN
            UPDATE_CMNT_VOTE(:userId, :cmntId, :type);
        END;
    `;
    let binds = {
        userId : userId,
        cmntId: cmntId,
        type : type? 'UP' : 'DOWN'
    }
    await database.execute(sql, binds, {});
    return;
}

module.exports = {
    isValidCommentId,
    addComment,
    getAllComments,
    removeVote,
    addVote
}