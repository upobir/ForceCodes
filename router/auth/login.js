// libraries
const express = require('express');
const bcrypt = require('bcrypt');

// my modules
const DB_user = require('../../DB-codes/DB-user-api');
const authUtils = require('../../utils/auth-utils');

// creating router
const router = express.Router();

// ROUTE: login (get)
router.get('/', (req, res) => {
    // if not logged in take to login page
    if(req.user == null){
        const errors = [];
        res.render('../views/layout.ejs', {
            title : 'Login - ForceCodes',
            body : 'login',
            user : null,
            errors : errors
        })
    } else {
        console.log('already logged in');
        res.redirect('/');
    }
});


// ROUTE: login (post)
router.post('/', async (req, res) => {
    // if not logged in take perform the post
    if(req.user == null){
        let results, errors = [];
        // get login info for handle (id, handle, password)
        results = await DB_user.getLoginInfoByHandle(req.body.handle);

        // if no result, there is no such user
        if(results.length == 0){
            errors.push('No such user found');
        } else {
            // match passwords
            const match = await bcrypt.compare(req.body.password, results[0].PASSWORD);
            if(match){
                console.log("login successful");
                // if successful login the user
                await authUtils.loginUser(res, results[0].ID);
            }
            else{
                errors.push('wrong password');
            }
        }

        // if any error, redirect to login page but with form information, else redirect to homepage
        if(errors.length == 0){
            res.redirect('/');
        } else {
            res.render('../views/layout.ejs', {
                title : 'Login - ForceCodes',
                body : 'login',
                user : null,
                errors : errors,
                form: {
                    handle: req.body.handle,
                    password: req.body.password
                }
            });
        }
    } else {
        console.log('already logged in');
        res.redirect('/');
    }
});

module.exports = router;