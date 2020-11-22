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

    let sampleTests = await DB_problems.getSampleTests(contestId, probNum);
    let mainTests = await DB_problems.getMainTests(contestId, probNum);

    let innerNav = [
        {url : `/contest/${contestId}/problem/${prob_num}`, name : 'PROBLEM'},
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
        sampleTests : sampleTests,
        mainTests : mainTests,
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
    res.redirect(`/contest/${contestId}/problem/${prob_num}/edit/tests`);
});

router.delete('/', async (req, res) =>{
    let contestId = parseInt(req.params.contestId);
    let prob_num = req.params.num;
    let probNum = prob_num.charCodeAt(0)-65;

    let files = await DB_problems.deleteTest(contestId, probNum, req.body.type, req.body.testNum);
    fs.unlinkSync(process.env.ROOT + '/problem-data/tests/' + files.inputURL);
    fs.unlinkSync(process.env.ROOT + '/problem-data/tests/' + files.outputURL);

    res.json({
        message : 'deleted',
        url : req.originalUrl
    });
});

router.get('/:testURL', async (req, res, next) =>{
    let contestId = parseInt(req.params.contestId);
    let prob_num = req.params.num;
    let probNum = prob_num.charCodeAt(0)-65;
    let testURL = req.params.testURL;
    if(await DB_problems.isValidTestURL(contestId, probNum, testURL)){
        fs.readFile(process.env.ROOT + '/problem-data/tests/' + testURL, 'utf8', (err, contents) =>{
            if(err){
                console.log('ERROR reading test file:' + err.message);
                next();
            }
            else{
                res.send(contents);
            }
        });
    }
    else{
        next();
    }
});

module.exports = router;