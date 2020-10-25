const jwt = require('jsonwebtoken');
const DB = require('../DB-codes/db-connection');
const DB_user = require('../DB-codes/user_functions');

function auth(req, res, next){
    req.user = null;
    if(req.cookies.hasOwnProperty('sessionToken')){
        let token = req.cookies.sessionToken;
        jwt.verify(token, process.env.APP_SECRET, (err, decodedId) =>{
            if(err){
                console.log(err)
                next();
            } else {
                decodedId = parseInt(decodedId);
                DB.run( async (connection) => {
                    let results = (await DB_user.getUserPromptById(connection, decodedId)).rows;
                    await connection.close();
                    if(results.length == 0){
                        console.log('auth: invalid cookie');
                    } else if(results[0].LOGIN_TOKEN != token){
                        console.log('auth: invalid token');
                    } else{
                        req.user = {
                            id: decodedId,
                            handle: results[0].HANDLE,
                            msgCount: results[0].MESSAGE_COUNT
                        }
                    }
                    next();
                });
            }
        });
    } else {
        next();
    }   
}

module.exports = auth;