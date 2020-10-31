CREATE OR REPLACE PROCEDURE UPDATE_SETTINGS(
    U_ID IN USER_ACCOUNT.ID%TYPE,
    U_EMAIL IN USER_ACCOUNT.EMAIL%TYPE,
    U_FIRST_NAME IN USER_ACCOUNT.FIRST_NAME%TYPE,
    U_LAST_NAME IN USER_ACCOUNT.LAST_NAME%TYPE,
    U_DOB IN USER_ACCOUNT.DATE_OF_BIRTH%TYPE,
    CNTRY_NAME IN COUNTRY.NAME%TYPE,
    CITY_NAME IN CITY.NAME%TYPE,
    ORG_NAME IN ORGANIZATION.NAME%TYPE
) IS
    ORG_CNT NUMBER;
BEGIN
    DBMS_OUTPUT.PUT_LINE('HELLO');
    UPDATE
        USER_ACCOUNT
    SET
        EMAIL = U_EMAIL,
        FIRST_NAME = U_FIRST_NAME,
        LAST_NAME = U_LAST_NAME,
        DATE_OF_BIRTH = U_DOB,
        COUNTRY_ID = NULL,
        CITY_ID = NULL
    WHERE
        ID = U_ID;
    
    IF CNTRY_NAME IS NOT NULL THEN
        UPDATE
            USER_ACCOUNT
        SET
            COUNTRY_ID = (
                SELECT
                    ID
                FROM
                    COUNTRY
                WHERE
                    NAME = CNTRY_NAME
            )
        WHERE
            ID = U_ID;
    ELSE
        UPDATE
            USER_ACCOUNT
        SET
            COUNTRY_ID = NULL
        WHERE
            ID = U_ID;
    END IF;

    IF CITY_NAME IS NOT NULL THEN
        UPDATE
            USER_ACCOUNT
        SET
            CITY_ID = (
                SELECT
                    ID
                FROM
                    CITY
                WHERE
                    NAME = CITY_NAME
            )
        WHERE
            ID = U_ID;
    ELSE
        UPDATE
            USER_ACCOUNT
        SET
            CITY_ID = NULL
        WHERE
            ID = U_ID;
    END IF;

    IF ORG_NAME IS NOT NULL THEN
        SELECT
            COUNT(*)
        INTO
            ORG_CNT
        FROM
            ORGANIZATION
        WHERE
            NAME = ORG_NAME;

        IF (ORG_CNT = 0) THEN
            INSERT INTO
                ORGANIZATION(ID, NAME)
            VALUES(
                ORG_SEQ.NEXTVAL,
                ORG_NAME
            );
        END IF;

        UPDATE 
            USER_ACCOUNT
        SET
            ORG_ID = (
                SELECT
                    ID
                FROM
                    ORGANIZATION
                WHERE
                    NAME = ORG_NAME
            )
        WHERE
            ID = U_ID;
    END IF;
END;