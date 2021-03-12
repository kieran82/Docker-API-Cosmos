const router = require('express').Router();
const myController = require('../controller/blockchain.js');
//Check Item Exists
router.post('/:name/exists', myController.checkExists);
//Get Item
router.post('/:name/get', myController.getItem);
//Delete Item
router.post('/:name/delete', myController.deleteItem);
//Add Item
router.post('/:name/add', myController.addItem);
//Update Item
router.post('/:name/update', myController.updateItem);
//Get History
router.post('/:name/get_history', myController.getHistory);
//Get Range
router.post('/:name/get_range', myController.getRange);
//Get Query Result
router.post('/:name/get_query', myController.getQueryResult);

module.exports = router;