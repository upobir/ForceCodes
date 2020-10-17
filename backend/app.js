const express = require('express');
const morgan = require('morgan');

const app = express();
app.use(morgan('tiny'));

app.get('/', (req, res) =>{
    res.json({
        message : 'Hello world'
    })
});

module.exports = app;