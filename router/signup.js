const express = require('express');
const DB = require('../DB-codes/db-connection');
const DB_user = require('../DB-codes/user_functions');

const router = express.Router();

router.get('/', (req, res) => {
    const errors = [];
    res.render('../views/layout.ejs', {
        title : 'Sign Up - ForceCodes',
        body : 'signup',
        user : null,
        errors : errors
    })
});

router.post('/', (req, res) => {
    console.log(req.body);
    DB.run(async(connection) =>{
        let result, errors = [];

        result = (await DB_user.getUserIDByHandle(connection, req.body.handle)).rows;
        if(result.length > 0)
            errors.push('Handle is already registered to a user');

        result = (await DB_user.getUserIDByEmail(connection, req.body.email)).rows;
        if(result.length > 0)
            errors.push('Email is already registered to a user');
        if(req.body.password !== req.body.password2){
            errors.push('Password confirmation doesn\'t match with password');
        }
        if(req.body.password.length < 8){
            errors.push('Password must be at least 8 characters');
        }

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
                    password2 : req.body.password2
                }
            });
        }
        else{
            res.redirect('/');
        }
    });
})

module.exports = router;