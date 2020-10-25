const express = require('express');
const bcrypt = require('bcrypt');
const DB = require('../DB-codes/db-connection');
const DB_user = require('../DB-codes/user_functions');
const authUtils = require('../utils/auth-utils');

const router = express.Router();

router.get('/', (req, res) => {
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

router.post('/', (req, res) => {
    if(req.user == null){
        DB.run(async(connection) =>{
            let results, errors = [];
            results = (await DB_user.getLoginInfoByHandle(connection, req.body.handle)).rows;
            

            if(results.length == 0){
                errors.push('No such user found');
            } else {
                const match = await bcrypt.compare(req.body.password, results[0].PASSWORD);
                if(match){
                    console.log("login successful");
                    await authUtils.loginUser(res, connection, results[0].ID);
                }
                else{
                    errors.push('wrong password');
                }
            }
            await connection.close();

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
        });
    } else {
        console.log('already logged in');
        res.redirect('/');
    }
});

module.exports = router;