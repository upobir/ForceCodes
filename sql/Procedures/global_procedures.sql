CREATE OR REPLACE PROCEDURE
    ADD_COUNTRY(
        C_NAME IN COUNTRY.NAME%TYPE
    )
IS
    CNT NUMBER;
BEGIN
    SELECT
        COUNT(*)
    INTO
        CNT
    FROM
        COUNTRY
    WHERE
        LOWER(NAME) = LOWER(C_NAME);

    IF CNT = 0 THEN
        INSERT INTO
            COUNTRY(
                ID,
                NAME
            )
        VALUES(
            CNTRY_SEQ.NEXTVAL,
            C_NAME
        );
    END IF;
    
END;

CREATE OR REPLACE PROCEDURE
    ADD_CITY(
        CI_NAME IN CITY.NAME%TYPE,
        CO_NAME IN COUNTRY.NAME%TYPE
    )
IS
    CO_ID COUNTRY.ID%TYPE;
    CNT NUMBER;
BEGIN
    SELECT
        ID
    INTO
        CO_ID
    FROM
        COUNTRY
    WHERE
        NAME = CO_NAME;

    SELECT
        COUNT(*)
    INTO
        CNT
    FROM
        CITY
    WHERE
        LOWER(NAME) = LOWER(CI_NAME) AND
        COUNTRY_ID = CO_ID;

    IF CNT = 0 THEN
        INSERT INTO
            CITY(
                ID,
                NAME,
                COUNTRY_ID
            )
        VALUES(
            CITY_SEQ.NEXTVAL,
            CI_NAME,
            CO_ID
        );
    END IF;
    
END;

SHOW ERRORS;