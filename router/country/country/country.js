// libraries
const express = require('express');

const DB_user = require(process.env.ROOT + '/DB-codes/DB-users-api');
const DB_global = require(process.env.ROOT + '/DB-codes/DB-global-api');
const cityRouter = require('./city/city');

const router = express.Router({mergeParams : true});

router.get('/', async (req, res) =>{
    let countryURL = req.params.country;
    let country = countryURL.replace('_', ' ');

    if(!(await DB_global.isValidCountry(country))){
        res.redirect('/country');
    }
    else{
        let innerNav = [
            {url: '/country/'+countryURL, name: country.toUpperCase()},
            {url: '/country/' + countryURL + '/city', name: 'CITIES'}
        ];
        let userList = await DB_user.getAllUserByCountry(country);
    
        for(let i = 0; i<userList.length; i++){
            userList[i].RANK_NO = (i+1) + `(${userList[i].RANK_NO})`;
        }
    
        res.render('layout.ejs', {
            title: `${country.toUpperCase()} - ForceCodes`,
            body: ['panel-view', 'userList', `${country.toUpperCase()}`],
            user: req.user,
            innerNav: innerNav,
            listHeader: `Users from ${country}`,
            userList : userList
        });
    }
});

router.use('/city', cityRouter);

module.exports = router;