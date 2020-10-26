// libraries
const express = require('express');
const bcrypt = require('bcrypt');

// my modules
const DB_user = require('../../DB-codes/DB-user-api');
const authUtils = require('../../utils/auth-utils');

// creating router
const router = express.Router();

// ROUTE: sign up (get)
router.get('/', (req, res) => {
    // check if already logged in
    if(req.user == null){
        const errors = [];
        res.render('../views/layout.ejs', {
            title : 'Sign Up - ForceCodes',
            body : 'signup',
            user : null,
            errors : errors
        });
    } else {
        console.log("already logged in");
        res.redirect('/');
    }
});

// ROUTE: sign up (post)
router.post('/', async (req, res) => {
    // check if already logged in
    if(req.user == null){
        let results, errors = [];

        let regex = /^[a-zA-Z0-9_]+$/;
        // check if handle is valid (letter+digit+_)
        if(regex.test(req.body.handle)){
            // if valid, check if handle can be used
            // TODO restrict keywords
            results = await DB_user.getUserIDByHandle(req.body.handle);
            if(results.length > 0)
                errors.push('Handle is already registered to a user');
        }
        else{
            errors.push('Handle can only contain English letters or digits or underscore');
        }

        // check if email is alredy used or not
        results = await DB_user.getUserIDByEmail(req.body.email);
        if(results.length > 0)
            errors.push('Email is already registered to a user');

        // check if password confimation is right
        if(req.body.password !== req.body.password2)
            errors.push('Password confirmation doesn\'t match with password');

        // check if password has at least 6 char
        if(req.body.password.length < 6){
            errors.push('Password must be at least 6 characters');
        }
        
        // check if birthday is at least 8 years back or not
        const ms_per_year = 365*24*60*60*1000;
        if((new Date() - Date.parse(req.body.birthdate))/ms_per_year < 8){
            errors.push('Age must be at least 8 years')
        }

        // if there are errors, redirect to sign up but with form informations
        if(errors.length > 0){
            res.render('../views/layout.ejs', {
                title : 'Sign Up - ForceCodes',
                body : 'signup',
                user : null,
                errors : errors,
                form : {
                    handle : req.body.handle,
                    email : req.body.email,
                    password : req.body.password,
                    password2 : req.body.password2,
                    birthdate : req.body.birthdate
                }
            });
        }
        else{
            // if no error, create user object to be sent to database api
            let user = {
                handle: req.body.handle,
                password: req.body.password,
                email: req.body.email,
                birthdate: new Date(req.body.birthdate)
            }
            // hash user password
            await bcrypt.hash(user.password, 8, async (err, hash) =>{
                if(err)
                    console.log("ERROR at hashing password: " + err.message);
                else{
                    // create user via db-api, id is returned
                    user.password = hash;
                    let result = await DB_user.createNewUser(user);
                    console.log('New User Created');
                    // login the user too
                    await authUtils.loginUser(res, result.id)
                    // redirect to home page
                    res.redirect('/');
                }
            });
        }
    } else {
        console.log('already logged in');
        res.redirect('/');
    }
});

module.exports = router;