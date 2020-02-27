const router = require('express').Router();
var myController = require('../controller/additional.js');

//Get Blockchain Details
router.get('/bc/info', myController.getBlockchainDetails);
module.exports = router;