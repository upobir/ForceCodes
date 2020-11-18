// libraries
const express = require('express');
const multer = require('multer');
const fs = require('fs');
var path = require('path');

const rightPanelUtils = require(process.env.ROOT + '/utils/rightPanel-utils');

const DB_problems = require(process.env.ROOT + '/DB-codes/DB-problem-api');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        req.test_type = req.body.test_type;
        cb(null, process.env.ROOT + '/problem-data/tests')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + (file.fieldname == 'input'? '.in' : '.out'));
    }
});
const upload = multer({storage : storage});
const router = express.Router({mergeParams : true});

router.get('/', async (req, res) =>{

    let contestId = req.params.contestId;
    let prob_num = req.params.num;
    let probNum = prob_num.charCodeAt(0)-65;

    let innerNav = [
        {url : `/contest/${contestId}`, name : 'PROBLEMS'},
        {url : `/contest/${contestId}/problem/${prob_num}/edit`, name : 'EDIT PROBLEM'},
        {url : `/contest/${contestId}/problem/${prob_num}/edit/tests`, name : 'TESTS'}
    ];
    let rightPanel = await rightPanelUtils.getRightPanel(req.user);

    res.render('layout.ejs', {
        title: `Tests - ForceCodes`,
        body: ['panel-view', 'tests', 'TESTS'],
        user: req.user,
        innerNav : innerNav,
        contest : req.contest,
        rightPanel : rightPanel
    });  
});

router.post('/', upload.fields([{
            name : 'input', maxCount : 1},{
            name : 'output', maxCount : 1
        }]), upload.single('output'), async(req, res) =>{

        
    let contestId = parseInt(req.params.contestId);
    let prob_num = req.params.num;
    let probNum = prob_num.charCodeAt(0)-65;
    
    let inputURL = req.files.input[0].filename;
    let outputURL = req.files.output[0].filename;

    await DB_problems.addTestFile(contestId, probNum, req.test_type, inputURL, outputURL);
    res.redirect(`/contest/${contestId}/problem/${probNum}/edit/tests`);
});

module.exports = router;