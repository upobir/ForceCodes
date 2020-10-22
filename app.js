// libraries
const express = require('express');
const morgan = require('morgan');

// middlewares/routers
const middlewares = require('./middlewares');
const router = require('./router/router')

// app creation
const app = express();

// using libraries
app.use(morgan('tiny'));
app.set('view engine', 'ejs');

// using router
app.use('/', router);

// allow public directory
app.use(express.static('public'))

// using error handling middlware
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;