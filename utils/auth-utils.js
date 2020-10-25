const jwt = require('jsonwebtoken');
const DB_user = require('../DB-codes/user_functions');

async function loginUser(res, connection, userId){
    let token = jwt.sign(userId, process.env.APP_SECRET);
    await DB_user.updateUserTokenById(connection, userId, token);
    res.cookie('sessionToken', token);
}

module.exports = {
    loginUser
}