CREATE OR REPLACE TRIGGER
    RATING_RANK_TRIGGER
BEFORE
    UPDATE
ON
    USER_ACCOUNT
FOR EACH ROW
DECLARE
    R_ID NUMBER;
BEGIN
    IF(:NEW.RATING IS NULL) THEN
        SELECT
            ID
        INTO
            R_ID
        FROM
            RANK
        WHERE
            MIN_RATING IS NULL;
    ELSE
        SELECT
            ID
        INTO
            R_ID
        FROM
            RANK
        WHERE
            :NEW.RATING BETWEEN MIN_RATING AND MAX_RATING;
    END IF;

    :NEW.RANK_ID := R_ID;
END;

CREATE OR REPLACE TRIGGER
    SBMSSN_TYPE_TRIGGER
BEFORE
    INSERT
ON
    SUBMISSION
FOR EACH ROW
DECLARE
    S_TIME DATE;
    E_TIME DATE;
BEGIN
    SELECT
        TIME_START,
        TIME_START + NUMTODSINTERVAL(DURATION, 'MINUTE')
    INTO
        S_TIME,
        E_TIME
    FROM
        CONTEST
    WHERE
        ID = (
            SELECT
                CONTEST_ID
            FROM
                PROBLEM
            WHERE
                ID = :NEW.PROBLEM_ID
        );

    IF (:NEW.SUBMISSION_TIME < S_TIME) THEN
        :NEW.TYPE := 'ADMIN';
    ELSIF (:NEW.SUBMISSION_TIME <= E_TIME) THEN
        :NEW.TYPE := 'CONTEST';
    ELSE
        :NEW.TYPE := 'REGULAR';
    END IF;
END;

SHOW ERRORS;