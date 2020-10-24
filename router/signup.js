const express = require('express');
const oracledb = require('oracledb');
const DB = require('../db-connection/db-connection');

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
    // DB.run(async (connection) => {
    //     let sql = `SELECT * FROM COUNTRY`;
    //     let binds = {};
    //     let options = {
    //         outFormat: oracledb.OUT_FORMAT_OBJECT
    //     }

    //     let result = await connection.execute(sql, binds, options);
    //     console.log(result);
    //     res.redirect('/')
    // });
})

module.exports = router;