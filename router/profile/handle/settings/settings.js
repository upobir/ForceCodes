// libraries
const express = require('express');
const bcrypt = require('bcrypt');

const DB_profile = require('../../../../DB-codes/DB-profile-api');
const DB_global = require('../../../../DB-codes/DB-global-api');
const DB_auth = require('../../../../DB-codes/DB-auth-api');

const innerNavUtils = require('../../../../utils/innerNav-utils');

const router = express.Router({mergeParams : true});

router.get('/', async(req, res) =>{
    const handle = req.params.handle;

    if(req.user == null || req.user.handle != handle){
        res.redirect(`/profile/${handle}`);
    } else {
        const countries = await DB_global.getCountryList();
        const cities = await DB_global.getCityList();
        const settingsInfo = (await DB_profile.getSettingsInfo(req.user.id))[0];

        innerNav = innerNavUtils.getProfileInnerNav(req.user, handle);

        res.render('layout.ejs', {
            title: `${handle} - ForceCodes`,
            body: ['panel-view', 'settings', 'SETTINGS'],
            user: req.user,
            innerNav: innerNav,
            countries : countries,
            cities : cities,
            errors : [],
            form : {
                email : settingsInfo.EMAIL,
                firstName : settingsInfo.FIRST_NAME,
                lastName : settingsInfo.LAST_NAME,
                birthdate : settingsInfo.DATE_OF_BIRTH.toJSON().slice(0, 10),
                country : settingsInfo.COUNTRY,
                city : settingsInfo.CITY,
                organization : settingsInfo.ORGANIZATION
            }
        });
    }
});

router.post('/', async(req, res) =>{
    const handle = req.params.handle;

    if(req.user == null || req.user.handle != handle){
        res.redirect(`/profile/${handle}`);
    } else {
        console.log("starting checkups");
        let errors = [];

        let results = await DB_auth.getUserIDByEmail(req.body.email);

        if(results.length > 0 && results[0].ID != req.user.id){
            errors.push('Email is already registerd to a user')
        }

        const ms_per_year = 365*24*60*60*1000;
        if((new Date() - Date.parse(req.body.birthdate))/ms_per_year < 8){
            errors.push('Age must be at least 8 years')
        }

        req.body.city = (req.body.city == '')? null : req.body.city;
        req.body.country = (req.body.country == '')? null : req.body.country;

        if(!(await DB_global.isValidCityCountry(req.body.city, req.body.country))){
            errors.push('Invalid city/country information');
        }

        const passwords = await DB_profile.getPasswordById(req.user.id);

        if(req.body.newPassword != '' || req.body.newPassword2 != ''){
            if(req.body.newPassword != req.body.newPassword2){
                errors.push('password confirmation is wrong');
            } else if (req.body.newPassword.length < 6){
                errors.push('Password must be at least 6 characters');
            }

            console.log(passwords[0].PASSWORD);
            if(bcrypt.compareSync(req.body.oldPassword, passwords[0].PASSWORD)){
                console.log("password match");
                if(errors.length == 0){
                    console.log("calling hash");
                    const hash = bcrypt.hashSync(req.body.newPassword, 8);
                    await DB_profile.updatePasswordById(req.user.id, hash);
                    console.log('password updated with ' + req.body.newPassword);
                }
            } else {
                errors.push('wrong password');
            }
        }

        if(errors.length == 0){
            const info = {
                email : req.body.email,
                firstName : req.body.firstName == '' ? null : req.body.firstName,
                lastName : req.body.lastName == '' ? null : req.body.lastName,
                birthdate : new Date(req.body.birthdate),
                country : req.body.country,
                city : req.body.city,
                organization : req.body.organization == ''? null : req.body.organization
            };
            await DB_profile.updateSettingsById(req.user.id, info);
            res.redirect(`/profile/${handle}/settings`);
        }
        else{
            innerNav = innerNavUtils.getProfileInnerNav(req.user, handle);
    
            const countries = await DB_global.getCountryList();
            const cities = await DB_global.getCityList();
    
            res.render('layout.ejs', {
                title: `${handle} - ForceCodes`,
                body: ['panel-view', 'settings', 'SETTINGS'],
                user: req.user,
                innerNav: innerNav,
                countries : countries,
                cities : cities,
                errors : errors,
                form : {
                    email : req.body.email,
                    firstName : req.body.firstName,
                    lastName : req.body.lastName,
                    birthdate : req.body.birthdate,
                    country : req.body.country,
                    city : req.body.city,
                    organization : req.body.organization
                }
            });
        }
    }
});

module.exports = router;