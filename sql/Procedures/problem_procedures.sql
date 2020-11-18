CREATE OR REPLACE PROCEDURE
    UPDATE_PROB_NUM(
        P_ID IN PROBLEM.ID%TYPE,
        NUM IN NUMBER
    )
IS
    TEMP NUMBER;
    C_ID CONTEST.ID%TYPE;
BEGIN
    -- get old number
    SELECT
        PROB_NUM
    INTO
        TEMP
    FROM
        PROBLEM
    WHERE
        ID = P_ID;

    -- get contest id
    SELECT
        CONTEST_ID
    INTO
        C_ID
    FROM
        PROBLEM
    WHERE
        ID = P_ID;

    -- decrease numbers that were above old number
    UPDATE
        PROBLEM
    SET
        PROB_NUM = PROB_NUM-1
    WHERE
        PROB_NUM > TEMP AND
        CONTEST_ID = C_ID;

    -- increase numbers that are above new number
    UPDATE
        PROBLEM
    SET
        PROB_NUM = PROB_NUM+1
    WHERE
        PROB_NUM >= NUM AND
        CONTEST_ID = C_ID;

    -- set new number 
    UPDATE
        PROBLEM
    SET 
        PROB_NUM = NUM
    WHERE
        ID = P_ID;

END;

CREATE OR REPLACE PROCEDURE
    CREATE_PROBLEM(
        P_NAME IN PROBLEM.NAME%TYPE,
        P_NUM IN PROBLEM.PROB_NUM%TYPE,
        P_CID IN PROBLEM.CONTEST_ID%TYPE,
        P_BODY IN PROBLEM.BODY%TYPE,
        P_SL IN PROBLEM.SOURCE_LIMIT%TYPE,
        P_TL IN PROBLEM.TIME_LIMIT%TYPE,
        P_ML IN PROBLEM.MEMORY_LIMIT%TYPE,
        P_RATING IN PROBLEM.RATING%TYPE
    )
IS
    PROB_CNT NUMBER;
    P_ID PROBLEM.ID%TYPE;
BEGIN
    SELECT
        COUNT(*)
    INTO
        PROB_CNT
    FROM
        PROBLEM
    WHERE
        CONTEST_ID = P_CID;

    P_ID := PRBLM_SEQ.NEXTVAL;

    INSERT INTO
        PROBLEM(
            ID,
            NAME,
            PROB_NUM,
            CONTEST_ID,
            BODY,
            SOURCE_LIMIT,
            TIME_LIMIT,
            MEMORY_LIMIT,
            RATING
        )
    VALUES(
        P_ID,
        P_NAME,
        PROB_CNT,
        P_CID,
        P_BODY,
        P_SL,
        P_TL,
        P_ML,
        P_RATING
    );
    
    UPDATE_PROB_NUM(
        P_ID,
        P_NUM
    );
END;

CREATE OR REPLACE PROCEDURE
    UPDATE_PROBLEM(
        P_NAME IN PROBLEM.NAME%TYPE,
        P_OLD_NUM IN PROBLEM.PROB_NUM%TYPE,
        P_NEW_NUM IN PROBLEM.PROB_NUM%TYPE,
        P_CID IN PROBLEM.CONTEST_ID%TYPE,
        P_BODY IN PROBLEM.BODY%TYPE,
        P_SL IN PROBLEM.SOURCE_LIMIT%TYPE,
        P_TL IN PROBLEM.TIME_LIMIT%TYPE,
        P_ML IN PROBLEM.MEMORY_LIMIT%TYPE,
        P_RATING IN PROBLEM.RATING%TYPE
    )
IS
    P_ID PROBLEM.ID%TYPE;
BEGIN
    SELECT
        ID
    INTO
        P_ID
    FROM
        PROBLEM
    WHERE
        CONTEST_ID = P_CID AND
        PROB_NUM = P_OLD_NUM;

    UPDATE
        PROBLEM
    SET
        NAME = P_NAME,
        BODY = P_BODY,
        SOURCE_LIMIT = P_SL,
        TIME_LIMIT = P_TL,
        MEMORY_LIMIT = P_ML,
        RATING = P_RATING
    WHERE
        ID = P_ID;

    UPDATE_PROB_NUM(
        P_ID,
        P_NEW_NUM
    );
END;


CREATE OR REPLACE PROCEDURE
    ADD_TEST_FILE(
        C_ID IN CONTEST.ID%TYPE,
        P_NUM IN PROBLEM.PROB_NUM%TYPE,
        T_TYPE IN TEST_FILE.TYPE%TYPE,
        T_INPUT IN TEST_FILE.INPUT_URL%TYPE,
        T_OUTPUT IN TEST_FILE.OUTPUT_URL%TYPE
    )
IS
    P_ID PROBLEM.ID%TYPE;
    T_NUM TEST_FILE.TEST_NUMBER%TYPE;
BEGIN

    SELECT
        ID
    INTO
        P_ID
    FROM
        PROBLEM
    WHERE
        CONTEST_ID = C_ID AND
        PROB_NUM = P_NUM;

    SELECT
        NVL(MAX(TEST_NUMBER), 0) + 1
    INTO
        T_NUM
    FROM
        TEST_FILE
    WHERE
        PROBLEM_ID = P_ID;

    INSERT INTO
        TEST_FILE(
            ID,
            PROBLEM_ID,
            TEST_NUMBER,
            TYPE,
            INPUT_URL,
            OUTPUT_URL
        )
    VALUES(
        TEST_SEQ.NEXTVAL,
        P_ID,
        T_NUM,
        T_TYPE,
        T_INPUT,
        T_OUTPUT
    );
END;