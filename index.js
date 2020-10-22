const app = require('./app');

const port = process.env.PORT || 2391;
app.listen(port, () => {
    console.log(`listening on http://localhost:${port}`);
});