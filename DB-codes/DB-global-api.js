const database = require('./database');

async function getCountryList(){
    let sql = `
        SELECT
            NAME
        FROM
            COUNTRY
        ORDER BY
            NAME
    `;
    return (await database.execute(sql, {}, database.options)).rows;
}

async function getCityList(){
    let sql = `
        SELECT
            CI.NAME,
            CO.NAME "COUNTRY"
        FROM
            CITY "CI" JOIN
            COUNTRY "CO" ON (CI.COUNTRY_ID = CO.ID)
        ORDER BY
            CI.NAME
    `;
    return (await database.execute(sql, {}, database.options)).rows;
}

async function isValidCountry(country){
    const sql = `
        SELECT
            COUNT(*) "CNT"
        FROM
            COUNTRY
        WHERE
            NAME = :country
    `;
    const binds = {
        country : country
    };
    return (await database.execute(sql, binds, database.options)).rows[0].CNT > 0;
}

async function isValidCityCountry(city, country){
    let sql = `
        SELECT
            ID
        FROM
            COUNTRY
        WHERE
            NAME = :country
    `;
    let binds = {
        country : country
    };
    let results = (await database.execute(sql, binds, database.options)).rows;
    if(results.length == 0 && country !== null) return false;
    const countryId = (results.length == 0)? null : results[0].ID;

    sql = `
        SELECT
            ID
        FROM
            CITY
        WHERE
            NAME = :city AND
            COUNTRY_ID = :countryId
    `;
    binds = {
        city : city,
        countryId : countryId
    };
    results = (await database.execute(sql, binds, database.options)).rows;
    if(results.length == 0 && city !== null) return false;
    return true;
}

async function getAllCountriesSorted(){
    let sql = `
        SELECT
            ROWNUM "RANK_NO",
            NAME,
            AVG
        FROM
        (
            SELECT
                C.NAME,
                ROUND(NVL(U.AVG_R, 0), 2) "AVG"
            FROM
                COUNTRY "C" LEFT JOIN
                (
                    SELECT
                        AVG(RATING) "AVG_R",
                        COUNTRY_ID
                    FROM
                        USER_ACCOUNT
                    GROUP BY
                        COUNTRY_ID
                ) "U" ON (U.COUNTRY_ID = C.ID)
            ORDER BY
                NVL(U.AVG_R, -1) DESC,
                C.NAME ASC
        )
    `;
    return (await database.execute(sql, {}, database.options)).rows;
}

async function getAllCitiesSorted(country){
    let sql = `
        SELECT
            ROWNUM "RANK_NO",
            NAME,
            AVG
        FROM
        (
            SELECT
                C.NAME,
                ROUND(NVL(U.AVG_R, 0), 2) "AVG"
            FROM
                CITY "C" LEFT JOIN
                (
                    SELECT
                        AVG(RATING) "AVG_R",
                        CITY_ID
                    FROM
                        USER_ACCOUNT
                    GROUP BY
                        CITY_ID
                ) "U" ON (U.CITY_ID = C.ID)
            WHERE
                C.COUNTRY_ID = (
                    SELECT
                        ID
                    FROM
                        COUNTRY
                    WHERE
                        NAME = :country
                )
            ORDER BY
                NVL(U.AVG_R, -1) DESC,
                C.NAME ASC
        )
    `;
    const binds = {
        country : country
    }
    return (await database.execute(sql, binds, database.options)).rows;
}

async function addCountry(country){
    let sql = `
        BEGIN
            ADD_COUNTRY(:country);
        END;
    `;
    let binds = {
        country : country
    };
    await database.execute(sql, binds, database.options);
}

async function deleteCountry(country){
    let sql = `
        DELETE FROM
            COUNTRY
        WHERE
            LOWER(NAME) = LOWER(:country)
    `;
    let binds = {
        country : country
    };
    await database.execute(sql, binds, database.options);
}

async function addCity(city, country){
    let sql = `
        BEGIN
            ADD_CITY(:city, :country);
        END;
    `;
    let binds = {
        city : city,
        country : country
    };
    await database.execute(sql, binds, database.options);
}

async function deleteCity(city, country){
    let sql = `
        DELETE FROM
            CITY
        WHERE
            LOWER(NAME) = LOWER(:city) AND
            COUNTRY_ID = (
                SELECT
                    ID
                FROM
                    COUNTRY
                WHERE
                    LOWER(NAME) = LOWER(:country)
            )
    `;
    let binds = {
        city : city,
        country : country
    };
    await database.execute(sql, binds, database.options);
}

module.exports = {
    getCountryList,
    getCityList,
    isValidCityCountry,
    getAllCountriesSorted,
    getAllCitiesSorted,
    isValidCountry,
    addCountry,
    deleteCountry,
    addCity,
    deleteCity
};