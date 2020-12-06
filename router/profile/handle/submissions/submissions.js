const express = require('express');

const DB_profile = require(process.env.ROOT + '/DB-codes/DB-profile-api');

const router = express.Router({mergeParams : true});

const innerNavUtils = require(process.env.ROOT + '/utils/innerNav-utils');
const rightPanelUtils = require(process.env.ROOT + '/utils/rightPanel-utils');

router.get('/', async (req, res) =>{
    let handle = req.params.handle;

    let innerNav = innerNavUtils.getProfileInnerNav(req.user, handle);
    let rightPanel = await rightPanelUtils.getRightPanel(req.user);
    let submissions = await DB_profile.getSubmissionsByHandle(handle);

    submissions.forEach(sbmssn => {
        sbmssn.NAME = String.fromCharCode(65+sbmssn.PROB_NUM) + '. ' + sbmssn.NAME;
    })

    res.render('layout.ejs', {
        title: `Submissions - ForceCodes`,
        body: ['panel-view', 'submissions', 'SUBMISSIONS'],
        user: req.user,
        innerNav : innerNav,
        listHeader : `Submissions By ${handle}`,
        submissions : submissions,
        rightPanel : rightPanel
    }); 
});

module.exports = router;