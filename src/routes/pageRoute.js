const express = require("express");
const PageController = require("../controllers/pagesController.js");


const router = express.Router();


router.get('/', PageController.homePage);

router.get('/about', PageController.aboutPage);

router.get('/plans', PageController.planPage);

router.get('/contact', PageController.contactPage);

router.get('/terms-and-conditions', PageController.termsAndCondition);

module.exports = router;