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

module.exports = {
    getCountryList,
    getCityList,
    isValidCityCountry
};