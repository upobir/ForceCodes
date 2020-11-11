CREATE OR REPLACE PROCEDURE
    CREATE_CONTEST(
        C_ID OUT CONTEST.ID%TYPE,
        C_NAME IN CONTEST.NAME%TYPE,
        C_TIME_START IN CONTEST.TIME_START%TYPE,
        C_DURATION IN CONTEST.DURATION%TYPE,
        C_MIN_RATED IN CONTEST.MIN_RATED%TYPE,
        C_MAX_RATED IN CONTEST.MAX_RATED%TYPE
    )
IS
    CNT NUMBER;
BEGIN
    SELECT
        COUNT(*)
    INTO
        CNT
    FROM
        CONTEST
    WHERE
        NAME = C_NAME;

    IF CNT = 0 THEN
        C_ID := CNTST_SEQ.NEXTVAL;
        INSERT INTO
            CONTEST(
                ID,
                NAME,
                TIME_START,
                DURATION,
                MIN_RATED,
                MAX_RATED
            )
        VALUES(
            C_ID,
            C_NAME,
            C_TIME_START,
            C_DURATION,
            C_MIN_RATED,
            C_MAX_RATED
        );
    ELSE
        C_ID := NULL;
    END IF;
END;