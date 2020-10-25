// libraries
const jwt = require('jsonwebtoken');

// my modules
const DB_user = require('../DB-codes/user_functions');

// function to login user into a session
async function loginUser(res, userId){
    // create token
    let token = jwt.sign(userId, process.env.APP_SECRET);
    // put token in db
    await DB_user.updateUserTokenById(userId, token);
    // set token in cookie
    res.cookie('sessionToken', token);
}

module.exports = {
    loginUser
}