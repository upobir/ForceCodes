const express = require('express');
const bcrypt = require('bcrypt');
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
    DB.run(async(connection) =>{
        let result, errors = [];

        let regex = /^[a-zA-Z0-9_]+$/;
        if(regex.test(req.body.handle)){
            result = (await DB_user.getUserIDByHandle(connection, req.body.handle)).rows;
            if(result.length > 0)
                errors.push('Handle is already registered to a user');
        }
        else{
            errors.push('Handle can only contain English letters or digits or underscore');
        }

        result = (await DB_user.getUserIDByEmail(connection, req.body.email)).rows;
        if(result.length > 0)
            errors.push('Email is already registered to a user');

        if(req.body.password !== req.body.password2){
            errors.push('Password confirmation doesn\'t match with password');
        }

        if(req.body.password.length < 6){
            errors.push('Password must be at least 6 characters');
        }
        
        const ms_per_year = 365*24*60*60*1000;
        if((new Date() - Date.parse(req.body.birthdate))/ms_per_year < 8){
            errors.push('Age must be at least 8 years')
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
                    password2 : req.body.password2,
                    birthdate : req.body.birthdate
                }
            });
        }
        else{
            let user = {
                handle: req.body.handle,
                password: req.body.password,
                email: req.body.email,
                birthdate: new Date(req.body.birthdate)
            }
            await bcrypt.hash(user.password, parseInt(process.env.SALT_ROUNDS), async (err, hash) =>{
                if(err)
                    console.log(err);
                else{
                    user.password = hash;
                    let result = await DB_user.createNewUser(connection, user);
                    console.log(result);
                    console.log('New User Created');
                    res.redirect('/');
                    await connection.close();
                }
            });
        }
    });
})

module.exports = router;