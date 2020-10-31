// libraries
const express = require('express');
const bcrypt = require('bcrypt');

const DB_profile = require('../../../DB-codes/DB-profile-api');
const DB_users = require('../../../DB-codes/DB-users-api');
const DB_global = require('../../../DB-codes/DB-global-api');
const DB_auth = require('../../../DB-codes/DB-auth-api');

const timeUtils = require('../../../utils/time-utils');

const router = express.Router({mergeParams : true});

function getInnerNav(user, handle){
    let innerNav = [
        {url: `/profile/${handle}`, name: `${handle.toUpperCase()}`},
        {url: `/profile/${handle}/blog`, name: `BLOG`},
        {url: `/profile/${handle}/teams`, name: `TEAMS`},
        {url: `/profile/${handle}/submissions`, name: `SUBMISSIONS`},
        {url: `/profile/${handle}/problemsettting`, name: `PROBLEMSETTING`}
    ];
    if(user !== null && user.handle == handle){
        innerNav.splice(1, 0, {url: `/profile/${handle}/settings`, name: `SETTINGS`});
        innerNav.splice(2, 0, {url: `/profile/${handle}/friends`, name: `FRIENDS`});
    }
    return innerNav;
};

router.get('/', async(req, res) =>{
    const handle = req.params.handle;
    const profiles = await DB_profile.getProfileByHandle(handle);
    const profile = profiles[0];
    profile.NAME = profile.NAME.trim();
    profile.LAST_VISIT = timeUtils.timeAgo(profile.LOGIN_TIME);
    profile.REGISTERED = timeUtils.timeAgo(profile.CREATION_TIME);

    if(req.user != null){
        profile.IS_FRIEND = await DB_profile.isFriendOfId(profile.ID, req.user.id);
    }

    delete profile.LOGIN_TIME;
    delete profile.CREATION_TIME;

    const innerNav = getInnerNav(req.user, handle);

    res.render('layout.ejs', {
        title: `${handle} - ForceCodes`,
        body: ['panel-view', 'profile', handle.toUpperCase()],
        user: req.user,
        innerNav: innerNav,
        profile: profile
    });    
});

router.get('/friends', async(req, res) =>{
    const handle = req.params.handle;

    if(req.user == null || req.user.handle != handle){
        res.redirect(`/profile/${handle}`);
    } else {
        let userList = await DB_users.getRatingOrderedFriends(req.user.id, 1, 50);

        userList = userList.filter(x => (x.HANDLE != handle));
        for(let i = 0; i<userList.length; i++){
            userList[i].RANK_NO = i+1;
        }

        innerNav = getInnerNav(req.user, handle);

        res.render('layout.ejs', {
            title: `${handle} - ForceCodes`,
            body: ['panel-view', 'userList', 'FRIENDS'],
            user: req.user,
            innerNav: innerNav,
            listHeader: 'Your friends',
            userList: userList
        });
    }
});

// TODO add checking
router.post('/friends', async(req, res) =>{
    const handle = req.params.handle;
    console.log(req.body);

    if(req.user == null || req.user.handle != handle){
        res.redirect(`/profile/${handle}`);
    } else {
        if(req.body.addFriend == 'true'){
            console.log("adding friend");
            await DB_profile.addFriendByHandle(req.user.id, req.body.handle);
        } else {
            console.log("removing friend");
            await DB_profile.removeFriendByHandle(req.user.id, req.body.handle);
        }
        res.redirect(`/profile/${req.body.handle}`);
    }
});

router.get('/settings', async(req, res) =>{
    const handle = req.params.handle;

    if(req.user == null || req.user.handle != handle){
        res.redirect(`/profile/${handle}`);
    } else {
        const countries = await DB_global.getCountryList();
        const cities = await DB_global.getCityList();
        const settingsInfo = (await DB_profile.getSettingsInfo(req.user.id))[0];

        innerNav = getInnerNav(req.user, handle);

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

router.post('/settings', async(req, res) =>{
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
            // console.log(info);
            await DB_profile.updateSettingsById(req.user.id, info);
            res.redirect(`/profile/${handle}/settings`);
        }
        else{
            innerNav = getInnerNav(req.user, handle);
    
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