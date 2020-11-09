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

SHOW ERRORS;