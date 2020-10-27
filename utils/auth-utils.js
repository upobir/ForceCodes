// libraries
const jwt = require('jsonwebtoken');

// my modules
const DB_auth = require('../DB-codes/DB-auth-api');

// function to login user into a session
async function loginUser(res, userId){
    // create token
    const payload = {
        id: userId
    };
    let token = jwt.sign(payload, process.env.APP_SECRET);
    // put token in db
    await DB_auth.updateUserTokenById(userId, token);
    // set token in cookie
    let options = {
        maxAge: 90000000, 
        httpOnly: true
    }
    res.cookie('sessionToken', token, options);
}

module.exports = {
    loginUser
}