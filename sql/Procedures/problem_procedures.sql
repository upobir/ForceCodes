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