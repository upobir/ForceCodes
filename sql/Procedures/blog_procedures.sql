CREATE OR REPLACE PROCEDURE CREATE_BLOG(
    B_TITLE IN BLOG_POST.TITLE%TYPE,
    B_BODY IN BLOG_POST.BODY%TYPE,
    B_AUTHOR IN BLOG_POST.AUTHOR_ID%TYPE,
    B_ID OUT BLOG_POST.ID%TYPE
) IS
BEGIN
    B_ID := BLOG_SEQ.NEXTVAL;
    INSERT INTO
        BLOG_POST(
            ID,
            TITLE,
            BODY,
            AUTHOR_ID
        )
    VALUES(
        B_ID,
        B_TITLE,
        B_BODY,
        B_AUTHOR
    );
END;

CREATE OR REPLACE PROCEDURE ADD_BLOG_TAG(
    B_ID IN BLOG_POST.ID%TYPE,
    TAG_NAME IN TAG.NAME%TYPE
) IS
    T_ID TAG.ID%TYPE;
    CNT NUMBER;
BEGIN
    -- CHECK IF TAG IS IN THE TAG TABLE ALREAY
    SELECT 
        COUNT(*)
    INTO
        CNT
    FROM
        TAG
    WHERE
        NAME = TAG_NAME AND
        TYPE = 'BLOG';

    -- IF TAG IS NOT ALREADY CREATED CREATE TAG
    IF (CNT = 0) THEN
        INSERT INTO
            TAG(
                ID,
                NAME,
                TYPE
            )
        VALUES(
            TAG_SEQ.NEXTVAL,
            TAG_NAME,
            'BLOG'
        );
    END IF;

    -- GET TAG ID
    SELECT
        ID
    INTO
        T_ID
    FROM
        TAG
    WHERE
        NAME = TAG_NAME AND
        TYPE = 'BLOG';

    -- CHECK IF (BLOG, TAG) IS ALREAYD IN TABLE
    SELECT 
        COUNT(*)
    INTO
        CNT
    FROM
        BLOG_TAG
    WHERE
        BLOG_ID = B_ID AND
        TAG_ID = T_ID;
    
    -- IF IT ISN'T ADD BLOG, TAG
    IF(CNT = 0) THEN
        INSERT INTO
            BLOG_TAG(
                BLOG_ID,
                TAG_ID
            )
        VALUES(
            B_ID,
            T_ID
        );
    END IF;
END;

SHOW ERRORS;