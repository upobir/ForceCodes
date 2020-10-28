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

CREATE OR REPLACE VIEW
    USER_LIST_VIEW
AS
    SELECT
        ROWNUM "RANK_NO",
        U.ID,
        U.HANDLE,
        U.RATING,
        R.COLOR
    FROM
        USER_CONTESTANT_VIEW "U" JOIN
        RANK "R" ON (U.RANK_ID = R.ID)
    ORDER BY
        U.RATING DESC;
        