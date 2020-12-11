// libraries
require('dotenv').config();
const express = require('express');
const rightPanelUtils = require('../../utils/rightPanel-utils');
const router = express.Router({mergeParams : true});

router.get('/', async (req, res)=>{
    let rightPanel = await rightPanelUtils.getRightPanel(req.user);

    res.render('layout.ejs', {
        title: 'About - ForceCodes', 
        body : ['panel-view', 'about'],
        user: req.user,
        rightPanel : rightPanel
    });
})

module.exports = router;