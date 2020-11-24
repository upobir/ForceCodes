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
        ORDER BY
            NVL(U.RATING, -1) DESC,
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


CREATE OR REPLACE VIEW
    SUBMISSIONS_VIEW
AS
    SELECT
        S.ID,
        S.SUBMISSION_TIME,
        S.AUTHOR_ID,
        S.JUDGE_TIME,
        S.URL,
        S.RESULT,
        P.PROB_NUM,
        P.NAME,
        P.CONTEST_ID,
        L.NAME "LANGUAGE",
        CN.HANDLE,
        CN.TYPE "AUTHOR_TYPE",
        NVL(U.COLOR, 'black') "COLOR",
        RT.MAX_TEST,
        RT.TIME,
        RT.MEMORY,
        CASE
            WHEN S.SUBMISSION_TIME < C.TIME_START THEN 'ADMIN'
            ELSE 'REGULAR'
        END "TYPE"
    FROM
        SUBMISSION "S" JOIN
        PROBLEM "P" ON (S.PROBLEM_ID = P.ID) JOIN
        CONTEST "C" ON (P.CONTEST_ID = C.ID) JOIN 
        CONTESTANT "CN"  ON (S.AUTHOR_ID = CN.ID) LEFT JOIN
        USER_LIST_VIEW "U" ON (CN.ID = U.ID) JOIN
        LANGUAGE "L" ON (L.ID = S.LANG_ID) LEFT JOIN (
            SELECT
                R.SUBMISSION_ID,
                MAX(T.TEST_NUMBER) "MAX_TEST",
                MAX(R.RUNTIME) "TIME",
                MAX(R.MEMORY) "MEMORY"
            FROM
                SUBMISSION_TEST_RUN "R" JOIN
                TEST_FILE "T" ON (R.TEST_ID = T.ID)
            GROUP BY
                R.SUBMISSION_ID
        ) "RT" ON (RT.SUBMISSION_ID = S.ID);
