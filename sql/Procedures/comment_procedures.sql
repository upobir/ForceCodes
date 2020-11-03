CREATE OR REPLACE PROCEDURE UPDATE_CMNT_VOTE(
    U_ID IN USER_ACCOUNT.ID%TYPE,
    C_ID IN POST_COMMENT.ID%TYPE,
    V_TYPE IN BLOG_USER_VOTE.TYPE%TYPE
) IS
    CNT NUMBER;
BEGIN

    SELECT
        COUNT(*)
    INTO
        CNT
    FROM
        COMMENT_USER_VOTE
    WHERE
        USER_ID = U_ID AND
        COMMENT_ID = C_ID;

    IF (CNT > 0) THEN
        UPDATE
            COMMENT_USER_VOTE
        SET
            TYPE = V_TYPE
        WHERE
            USER_ID = U_ID AND
            COMMENT_ID = C_ID;
    ELSE
        INSERT INTO
            COMMENT_USER_VOTE(
                USER_ID,
                COMMENT_ID,
                TYPE
            )
        VALUES(
            U_ID,
            C_ID,
            V_TYPE
        );
    END IF;
END;