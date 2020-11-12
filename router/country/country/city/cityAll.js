// libraries
const express = require('express');
const rightPanelUtils = require('../../../../utils/rightPanel-utils');

const DB_global = require(process.env.ROOT + '/DB-codes/DB-global-api');

const cityRouter = require('./city/city');

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
    if(req.user == null || !req.user.isAdmin){
        var adminAccess = null;
    }
    else{
        var adminAccess = ['ADD', 'CITY'];
    }

    let rightPanel = await rightPanelUtils.getRightPanel(req.user);

    res.render('layout.ejs', {
        title: 'Cities - ForceCodes',
        body: ['panel-view', 'globalList', 'CITIES'],
        user: req.user,
        innerNav: innerNav,
        listHeader: `Cities of ${country}`,
        list : cityList,
        adminAccess : adminAccess,
        rightPanel : rightPanel
    });
});

router.post('/', async (req, res) =>{
    let countryURL = req.params.country;
    let country = countryURL.replace('_', ' ');
    let name = req.body.name.trim();

    if(req.user != null && req.user.isAdmin)
        await DB_global.addCity(name, country);
    let cityURL = name.replace(' ', '_');

    res.json({
        message : 'done',
        url : `/country/${countryURL}/city/${cityURL}`
    });
});

router.use('/:city', cityRouter);

module.exports = router;