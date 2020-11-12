// libraries
const express = require('express');
const rightPanelUtils = require('../../../../../utils/rightPanel-utils');

const DB_global = require(process.env.ROOT + '/DB-codes/DB-global-api');
const DB_user = require(process.env.ROOT + '/DB-codes/DB-users-api');

const router = express.Router({mergeParams : true});

router.get('/', async (req, res) =>{
    let countryURL = req.params.country;
    let country = countryURL.replace('_', ' ');
    
    let cityURL = req.params.city;
    let city = cityURL.replace('_', ' ');

    if(!(await DB_global.isValidCityCountry(city, country))){
        res.redirect(`/country/${countryURL}`);
    }
    else{
        let userList = await DB_user.getAllUsersByCity(city, country);

        for(let i = 0; i<userList.length; i++){
            userList[i].RANK_NO = (i+1) + `(${userList[i].RANK_NO})`;
        }

        let innerNav = [
            {url: `/country/${countryURL}`, name : country.toUpperCase()},
            {url: '/country/' + countryURL + '/city/' + cityURL, name: city.toUpperCase()},
        ];

        if(req.user == null || !req.user.isAdmin){
            var adminAccess = null;
        }
        else{
            var adminAccess = ['DELETE', 'CITY'];
        }

        let rightPanel = await rightPanelUtils.getRightPanel(req.user);

        res.render('layout.ejs', {
            title: `${city} - ForceCodes`,
            body: ['panel-view', 'userList', city.toUpperCase()],
            user: req.user,
            innerNav: innerNav,
            listHeader: `users of ${city}, ${country}`,
            userList : userList,
            adminAccess : adminAccess,
            rightPanel : rightPanel
        });
    }
});

router.delete('/', async (req, res) =>{
    let countryURL = req.params.country;
    let country = countryURL.replace('_', ' ');
    let cityURL = req.params.city;
    let city = cityURL.replace('_', ' ');

    if(req.user != null && req.user.isAdmin)
        await DB_global.deleteCity(city, country);
    res.json({
        message : 'done',
        url : `/country/${countryURL}/city`
    });
});

module.exports = router;