CREATE OR REPLACE VIEW
    USER_CONTESTANT_VIEW
AS
    SELECT
        C.ID,
        C.HANDLE,
        C.CREATION_TIME,
        U.FIRST_NAME,
        U.LAST_NAME,
        U.PASSWORD,
        U.EMAIL,
        U.RATING,
        U.RANK_ID,
        U.LOGIN_TIME,
        U.PICTURE,
        U.DATE_OF_BIRTH,
        U.ORG_ID,
        U.COUNTRY_ID,
        U.CITY_ID,
        U.LOGIN_TOKEN
    FROM
        CONTESTANT "C" JOIN
        USER_ACCOUNT "U" ON (C.ID = U.ID);

CREATE OR REPLACE VIEW
    USER_LIST_VIEW
AS
    SELECT
        ROWNUM "RANK_NO",
        ID,
        HANDLE,
        RATING,
        COLOR
    FROM
    (
        SELECT
            U.ID,
            U.HANDLE,
            U.RATING,
            R.COLOR
        FROM
            USER_CONTESTANT_VIEW "U" JOIN
            RANK "R" ON (U.RANK_ID = R.ID)
        WHERE
            U.RATING IS NOT NULL
        ORDER BY
            U.RATING DESC,
            U.ID ASC
    );
        

CREATE OR REPLACE VIEW
    BLOG_INFO_VIEW
AS
    SELECT
        B.ID,
        B.TITLE,
        U.HANDLE "AUTHOR",
        U.COLOR,
        B.CREATION_TIME,
        B.BODY,
        NVL(V.VOTES, 0) "VOTE_CNT",
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
        ) "V" ON (V.BLOG_ID = B.ID) 