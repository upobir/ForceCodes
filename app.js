const express = require('express');
const morgan = require('morgan');
const middlewares = require('./middlewares');

const app = express();

app.use(morgan('tiny'));
app.set('view engine', 'ejs');

app.get('/', (req, res) =>{
    res.json({
        message : 'Hello world'
    })
});

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;