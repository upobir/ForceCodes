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

CREATE OR REPLACE PROCEDURE
    ASSIGN_RATING(
        C_ID IN CONTEST.ID%TYPE
    )
IS
    RANK NUMBER;
    E_RANK NUMBER;
    BASE_DEL NUMBER;
    DEL NUMBER;
    TOT_CNT NUMBER;
    C_MIN_RATING NUMBER;
    C_MAX_RATING NUMBER;
BEGIN
    -- GET COUNT OF USER CONTESTANT WHO PARTICIPATED
    SELECT
        COUNT(*)
    INTO
        TOT_CNT
    FROM
        CONTEST_REGISTRATION "CR" JOIN
        USER_ACCOUNT "U" ON (CR.CONTESTANT_ID = U.ID)
    WHERE
        CR.CONTEST_ID = C_ID AND
        EXISTS(
            SELECT
                *
            FROM
                SUBMISSION "S" JOIN
                PROBLEM "P" ON (S.PROBLEM_ID = P.ID)
            WHERE
                S.TYPE = 'CONTEST' AND
                P.CONTEST_ID = C_ID AND
                S.AUTHOR_ID = U.ID
        );

    -- GET RATING RANGE OF CONTEST
    SELECT
        MIN_RATED,
        MAX_RATED
    INTO
        C_MIN_RATING,
        C_MAX_RATING
    FROM
        CONTEST
    WHERE
        ID = C_ID;

    -- SET RANK VARIABLE
    RANK := 1;

    -- LOOP OVER ALL CONTESTANT WITH THEIR RANK
    FOR REC IN (
        SELECT
            ROWNUM "RANK_NO",
            T.*
        FROM
        (
            SELECT
                R.ID,
                R.HANDLE,
                R.TYPE,
                U.RATING,
                SUM(R.ACC_TIME - C.TIME_START)*24*60*60 + SUM(R.ATTEMPTS-1)*10*60 "PENALTY",
                SUM(
                    CASE
                        WHEN R.ACC_COUNT > 0 THEN R.RATING
                        ELSE 0
                    END
                ) "SCORE"
            FROM
                PRBLM_CNTSTNT_REPORT_VIEW "R" JOIN
                CONTEST "C" ON (R.CONTEST_ID = C.ID) LEFT JOIN
                USER_ACCOUNT "U" ON (U.ID = R.ID)
            WHERE
                R.CONTEST_ID = C_ID AND
                R.ATTEMPTS > 0
            GROUP BY
                R.ID,
                R.TYPE,
                U.RATING,
                R.HANDLE
            ORDER BY
                SCORE DESC,
                PENALTY ASC
        ) "T"
    )
    LOOP

        -- UPDATE THE STANDING TO REGISTRATION TABLE
        UPDATE
            CONTEST_REGISTRATION
        SET
            STANDING = REC.RANK_NO
        WHERE
            CONTESTANT_ID = REC.ID AND
            CONTEST_ID = C_ID;
        
        -- IF TEAM CONTESTANT THEN NO NEED TO UPDATE
        IF (REC.TYPE = 'TEAM') THEN
            CONTINUE;
        END IF;

        -- IF NOT RATED FOR USER THEN CONTINUE
        IF(C_MIN_RATING IS NULL OR REC.RATING < C_MIN_RATING OR C_MAX_RATING < REC.RATING) THEN
            CONTINUE;
        END IF;

        -- GET EXPECTED STANDING
        SELECT
            COUNT(*) + 1
        INTO
            E_RANK
        FROM
            CONTEST_REGISTRATION "CR" JOIN
            USER_ACCOUNT "U" ON (CR.CONTESTANT_ID = U.ID)
        WHERE
            CR.CONTEST_ID = C_ID AND
            U.RATING > REC.RATING AND
            EXISTS(
                SELECT
                    *
                FROM
                    SUBMISSION "S" JOIN
                    PROBLEM "P" ON (S.PROBLEM_ID = P.ID)
                WHERE
                    S.TYPE = 'CONTEST' AND
                    P.CONTEST_ID = C_ID AND
                    S.AUTHOR_ID = U.ID
            );

        -- COMPUTE BASE DEL
        BASE_DEL := 500;
        DEL := 0;

        IF(REC.RATING = 0) THEN
            DEL := 500;
            IF(RANK > E_RANK) THEN
                BASE_DEL := 100;
            END IF;
        ELSIF (RANK > E_RANK AND 2*BASE_DEL > REC.RATING) THEN
            BASE_DEL := FLOOR(REC.RATING/2);
        END IF;

        -- COMPUTE RATING CHANGE
        DEL := DEL + FLOOR((E_RANK - RANK + 1)/TOT_CNT * BASE_DEL);

        --DBMS_OUTPUT.PUT_LINE(REC.HANDLE || ' : ' || DEL);

        -- UPDATE RATING CHANGE IN REGISTRATION TABLE
        UPDATE
            CONTEST_REGISTRATION
        SET
            RATING_CHANGE = DEL
        WHERE
            CONTEST_ID = C_ID AND
            CONTESTANT_ID = REC.ID;

        -- UPDATE RANK VARIABLE
        IF(REC.SCORE <> 0) THEN
            RANK := RANK + 1;
        END IF;
    END LOOP;

    -- LOOP OVER THE REGISTRATION LIST
    FOR REC IN (
        SELECT
            *
        FROM
            CONTEST_REGISTRATION
        WHERE
            CONTEST_ID = C_ID AND
            RATING_CHANGE IS NOT NULL
    )
    LOOP
        -- UPDATE USER RATING
        UPDATE
            USER_ACCOUNT
        SET
            RATING = RATING + REC.RATING_CHANGE
        WHERE
            ID = REC.CONTESTANT_ID;
    END LOOP;
END;