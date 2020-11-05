// libraries
const express = require('express');

const DB_global = require(process.env.ROOT + '/DB-codes/DB-global-api');
const DB_user = require(process.env.ROOT + '/DB-codes/DB-users-api');

const router = express.Router({mergeParams : true});

router.get('/', async (req, res) =>{
    let countryURL = req.params.country;
    let country = countryURL.replace('_', ' ');

    let cityList = await DB_global.getAllCitiesSorted(country);

    for(let i = 0; i<cityList.length; i++){
        cityList[i].URL = `/country/${countryURL}/city/${cityList[i].NAME.replace(' ', '_')}`;
    }

    let innerNav = [
        {url: '/country/' + countryURL, name: country.toUpperCase()},
        {url: '/country/' + countryURL + '/city', name: 'CITIES'}
    ];
    res.render('layout.ejs', {
        title: 'Cities - ForceCodes',
        body: ['panel-view', 'globalList', 'CITIES'],
        user: req.user,
        innerNav: innerNav,
        listHeader: `Cities of ${country}`,
        list : cityList
    });
});

router.get('/:city', async (req, res) =>{
    let countryURL = req.params.country;
    let country = countryURL.replace('_', ' ');
    
    let cityURL = req.params.city;
    let city = cityURL.replace('_', ' ');

    console.log(city);
    console.log(country);

    if(!(await DB_global.isValidCityCountry(city, country))){
        res.redirect(`/country/${countryURL}`);
    }
    else{
        let userList = await DB_user.getAllUsersByCity(city, country);

        for(let i = 0; i<userList.length; i++){
            userList[i].RANK_NO = (i+1) + `(${userList[i].RANK_NO})`;
        }

        let innerNav = [
            {url: '/country/' + countryURL + '/city/' + cityURL, name: city.toUpperCase()},
        ];
        res.render('layout.ejs', {
            title: `${city} - ForceCodes`,
            body: ['panel-view', 'userList', city.toUpperCase()],
            user: req.user,
            innerNav: innerNav,
            listHeader: `users of ${city}, ${country}`,
            userList : userList
        });
    }

    
});

module.exports = router;