const express = require('express');
const bcrypt = require('bcrypt');
const DB = require('../DB-codes/db-connection');
const DB_user = require('../DB-codes/user_functions');

const router = express.Router();

router.get('/', (req, res) => {
    const errors = [];
    res.render('../views/layout.ejs', {
        title : 'Login - ForceCodes',
        body : 'login',
        user : null,
        errors : errors
    })
});

router.post('/', (req, res) => {
    DB.run(async(connection) =>{
        let results, errors = [];
        results = (await DB_user.getLoginInfoByHandle(connection, req.body.handle)).rows;
        await connection.close();

        if(results.length == 0){
            errors.push('No such user found');

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
        } else {
            const match = await bcrypt.compare(req.body.password, results[0].PASSWORD);
            if(match){
                console.log("login successful");
                res.redirect('/');
            }
            else{
                errors.push('wrong password');
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
        }
    });
});

module.exports = router;