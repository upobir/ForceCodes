const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('../views/layout.ejs', {
        title : 'Sign Up - ForceCodes',
        prompt : '_non-user-prompt',
        body : 'signup',
        message_count : 0
    })
});

router.post('/', (req, res) => {
    res.json(req.body);
})

module.exports = router;