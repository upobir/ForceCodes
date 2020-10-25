CREATE OR REPLACE VIEW
    USER_CONTESTANT_VIEW
AS
    SELECT
        C.ID,
        C.HANDLE,
        C.CREATION_TIME,
        U.FIRST_NAME,
        U.LAST_NAME,
        U.PASSWORD,
        U.EMAIL,
        U.RATING,
        U.RANK_ID,
        U.LOGIN_TIME,
        U.PICTURE,
        U.DATE_OF_BIRTH,
        U.ORG_ID,
        U.COUNTRY_ID,
        U.CITY_ID,
        U.LOGIN_TOKEN
    FROM
        CONTESTANT "C" JOIN
        USER_ACCOUNT "U" ON (C.ID = U.ID);