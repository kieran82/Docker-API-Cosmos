const router = require('express').Router();
var myController = require('../controller/additional.js');

//Check User Exists
router.get('/user/exists', myController.checkUserExists);
//Check Fip Exists
router.get('/fip/exists', myController.checkFipExists);
module.exports = router;