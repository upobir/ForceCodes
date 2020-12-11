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

CREATE OR REPLACE PROCEDURE UPDATE_ADMINSHIP(
    U_HANDLE IN USER_CONTESTANT_VIEW.HANDLE%TYPE
) IS
    U_ID NUMBER;
    U_RATING NUMBER;
BEGIN
    SELECT 
        ID
    INTO
        U_ID
    FROM
        USER_CONTESTANT_VIEW
    WHERE
        HANDLE = U_HANDLE;

    SELECT
        RATING
    INTO
        U_RATING
    FROM
        USER_ACCOUNT
    WHERE
        ID = U_ID;
    
    IF U_RATING IS NULL THEN
        UPDATE
            USER_ACCOUNT
        SET
            RATING = (
                SELECT
                    NVL(SUM(RATING_CHANGE), 0)
                FROM
                    CONTEST_REGISTRATION
                WHERE
                    CONTESTANT_ID = ID
            )
        WHERE
            ID = U_ID;
    ELSE
        UPDATE
            USER_ACCOUNT
        SET
            RATING = NULL
        WHERE
            ID = U_ID;
    END IF;
END;

CREATE OR REPLACE PROCEDURE
    CREATE_TEAM(
        T_ID OUT CONTESTANT.ID%TYPE,
        T_NAME IN CONTESTANT.HANDLE%TYPE
    )
IS
BEGIN
    T_ID := CNTSTNT_SEQ.NEXTVAL;

    INSERT INTO
        CONTESTANT(
            ID,
            HANDLE,
            TYPE
        )
    VALUES(
        T_ID,
        T_NAME,
        'TEAM'
    );

    INSERT INTO
        TEAM(
            ID,
            DESCRIPTION
        )
    VALUES(
        T_ID,
        ''
    );
END;

CREATE OR REPLACE PROCEDURE
    ADD_TEAM_MEMBER(
        T_ID IN CONTESTANT.ID%TYPE,
        M_HANDLE IN CONTESTANT.HANDLE%TYPE,
        M_ID OUT CONTESTANT.ID%TYPE
    )
IS
    CNT NUMBER;
BEGIN
    M_ID := NULL;

    SELECT
        COUNT(*)
    INTO
        CNT
    FROM
        CONTESTANT "CN"
    WHERE
        CN.TYPE <> 'TEAM' AND
        CN.HANDLE = M_HANDLE AND
        NOT EXISTS (
            SELECT
                *
            FROM
                USER_TEAM_MEMBER
            WHERE
                USER_ID = CN.ID AND
                TEAM_ID = T_ID
        );

    IF (CNT > 0) THEN
        SELECT
            ID
        INTO
            M_ID
        FROM
            CONTESTANT
        WHERE
            HANDLE = M_HANDLE;

        INSERT INTO
            USER_TEAM_MEMBER(
                USER_ID,
                TEAM_ID,
                TYPE
            )
        VALUES(
            M_ID,
            T_ID,
            'MEMBER'
        );
    END IF;
END;
    