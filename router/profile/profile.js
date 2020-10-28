// libraries
const express = require('express');

const router = express.Router();

router.get('/:handle', async(req, res) =>{
    console.log('here ' + req.originalUrl);
    console.log('here ' + req.params);
    const handle = req.params.handle;
    let innerNav = [
        {url: `/profile/${handle}`, name: `${handle.toUpperCase()}`},
        {url: `/profile/${handle}/blog`, name: `BLOG`},
        {url: `/profile/${handle}/teams`, name: `TEAMS`},
        {url: `/profile/${handle}/submissions`, name: `SUBMISSIONS`},
        {url: `/profile/${handle}/problemsettting`, name: `PROBLEMSETTING`}
    ]
    res.render('layout.ejs', {
        title: `${handle} - ForceCodes`,
        body: ['panel-view', 'profile', handle.toUpperCase()],
        user: req.user,
        innerNav: innerNav
    });
});

module.exports = router;