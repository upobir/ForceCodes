// libraries
const jwt = require('jsonwebtoken');

// my modules
const DB_user = require('../DB-codes/DB-user-api');

// function to login user into a session
async function loginUser(res, userId){
    // create token
    const payload = {
        id: userId
    };
    let token = jwt.sign(payload, process.env.APP_SECRET);
    // put token in db
    console.log('token ' + typeof token + ' : ' + token);
    await DB_user.updateUserTokenById(userId, token);
    // set token in cookie
    let options = {
        maxAge: 900000, 
        httpOnly: true
    }
    res.cookie('sessionToken', token, options);
}

module.exports = {
    loginUser
}