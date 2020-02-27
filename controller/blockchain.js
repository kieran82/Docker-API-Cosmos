const tools = require('../src/func');
const asyncRoute = require('route-async')
const fs = require('fs');
const log4js = require('log4js');
const util = require('util');
const StringBuilder = require('node-stringbuilder');
const sprintf = require('sprintf-js').sprintf;
let current_path_location = process.env.WORKPATH;
let logpath = process.env.LOGFILEPATH;
log4js.configure({
    appenders: {
        VERIAPI: {
            type: 'file',
            filename: logpath,
            maxLogSize: 4194304,
            backups: 10,
            keepFileExt: true,
            compress: true,
            daysToKeep: 20
        }
    },
    categories: {
        default: {
            appenders: ['VERIAPI'],
            level: 'debug'
        }
    }
});

const logger = log4js.getLogger('VERIAPI');
let contents = fs.readFileSync(current_path_location + "json/blockchain_config.json");
let jsonContent = JSON.parse(contents);

const checkroute = async (req, res) => {
    try {
        let DataIn = req.body;
        if (!("folder_path" in DataIn)) {
            res.status(404).send(tools.responseFormat(null, "database prefix is missing", false, 404));
        }
        if (jsonContent[req.params.name] === undefined) {
            res.status(404).send(tools.responseFormat(null, "name is not found in config file", false, 404));
        }

        console.log("name: " + req.params.name);
        console.log("folder: " + DataIn.folder_path);
        console.log("id: " + DataIn._id);

        let configOBJ = tools.configFile(current_path_location, DataIn.folder_path);
        let classData = jsonContent[req.params.name];
        let class_name = "";
        class_name = sprintf('%s_%s', DataIn.folder_path, classData.class);
        console.log("nameobj is " + util.inspect(classData, {
            showHidden: false,
            depth: null
        }));
        DataIn._id = !('_id' in DataIn) ? tools.objectTostring(DataIn, classData.keyName) : tools.numberTostring(DataIn._id);
        const multi_network = require('../network.js')(configOBJ);
        const result = await multi_network.keyExists(class_name, classData.methods.checkExists, DataIn._id);
        console.log("testing return results: " + result);
        logger.info('check ' + classData.lower_name + ' id ' + DataIn._id + ' exists');
        if (tools.checkBool(result)) {
            console.log("boolcheck return yes");
            if (result === true || result == 'true') {
                logger.info('' + classData.lower_name + ' ' + DataIn._id + 'exists');
                res.send(tools.responseFormat(null, DataIn._id + " " + classData.displayName + " does exists", true, 200));
            } else {
                logger.info('' + classData.lower_name + ' id ' + DataIn._id + ' does not exists');
                res.status(404).send(tools.responseFormat(null, DataIn._id + " " + classData.displayName + " does not exists", false, 404));
            }
        } else {
            logger.error(result);
            res.status(404).send(tools.responseFormat(null, DataIn._id + " " + classData.displayName + " does not exists", false, 404));
        }
    } catch (e) { // this will eventually be handled by your error handling middleware
        logger.error(e);
        res.status(404).send(tools.responseFormat(null, "Error Occurred " + e, false, 404));
    }
};

const getitemroute = async (req, res) => {
    try {
        let DataIn = req.body;
        if (!("folder_path" in DataIn)) {
            res.status(404).send(tools.responseFormat(null, "database prefix is missing", false, 404));
        }
        if (jsonContent[req.params.name] === undefined) {
            res.status(404).send(tools.responseFormat(null, "name is not found in config file", false, 404));
        }
        console.log("testing script results: " + DataIn._id);
        let classData = jsonContent[req.params.name];

        let class_name = "";
        class_name = sprintf('%s_%s', DataIn.folder_path, classData.class);
        let configOBJ = tools.configFile(current_path_location, DataIn.folder_path);
        const multi_network = require(current_path_location + 'network.js')(configOBJ);
        const result = await multi_network.readKeyValue(class_name, classData.methods.reading, DataIn._id);
        console.log("testing return results: " + result);
        logger.info('get ' + classData.lower_name + ' id ' + DataIn._id + ' details');
        if (! tools.isEmpty(result)) {
            logger.info('' + classData.lower_name + ' ' + DataIn._id + ', data: ' + result + '');
            res.send(tools.responseFormat(result, DataIn._id + " " + classData.displayName + " found", true, 200));
        } else {
            logger.info('' + classData.lower_name + ' id ' + DataIn._id + ' does not exists');
            res.status(404).send(tools.responseFormat(null, DataIn._id + " " + classData.displayName + " Not found", false, 404));
        }
    } catch (e) { // this will eventually be handled by your error handling middleware
        logger.error(e);
        res.status(404).send(tools.responseFormat(null, "Error Occurred " + e, false, 404));
    }
};

const deleteitemroute = async (req, res) => {
    try {
        let DataIn = req.body;
        if (!("folder_path" in DataIn)) {
            res.status(404).send(tools.responseFormat(null, "database prefix is missing", false, 404));
        }
        if (jsonContent[req.params.name] === undefined) {
            res.status(404).send(tools.responseFormat(null, "name is not found in config file", false, 404));
        }
        console.log("testing script results: " + DataIn._id);
        let classData = jsonContent[req.params.name];

        let class_name = "";
        class_name = sprintf('%s_%s', DataIn.folder_path, classData.class);
        let configOBJ = tools.configFile(current_path_location, DataIn.folder_path);
        const multi_network = require(current_path_location + 'network.js')(configOBJ);
        const result = await multi_network.deleteKeyValue(class_name, classData.methods.reading, DataIn._id);
        console.log("testing return results: " + result);
        logger.info('deleting ' + classData.lower_name + ' id ' + DataIn._id + ' details');
        if (tools.checkBool(result)) {
            logger.info('' + classData.lower_name + ' ' + DataIn._id + ', data: ' + result + '');
            res.send(tools.responseFormat(result, DataIn._id + " " + classData.displayName + " successfully deleted", true, 200));
        } else {
            logger.error(result);
            logger.info('' + classData.lower_name + ' id ' + DataIn._id + ' does not exists and can\'t be deleted');
            res.status(404).send(tools.responseFormat(null, DataIn._id + " " + classData.displayName + " does not exists and can\'t be deleted", false, 404));
        }
    } catch (e) { // this will eventually be handled by your error handling middleware
        logger.error(e);
        res.status(404).send(tools.responseFormat(null, "Error Occurred " + e, false, 404));
    }
};

const additemroute = async (req, res) => {
    try {
        let DataIn = req.body;
        if (!("folder_path" in DataIn)) {
            res.status(404).send(tools.responseFormat(null, "database prefix is missing", false, 404));
        }
        if (jsonContent[req.params.name] === undefined) {
            res.status(404).send(tools.responseFormat(null, "name is not found in config file", false, 404));
        }
        let classData = jsonContent[req.params.name];
        let class_name = "";
        class_name = sprintf('%s_%s', DataIn.folder_path, classData.class);
        console.log("class results: " + class_name);
        let configOBJ = tools.configFile(current_path_location, DataIn.folder_path);
        const multi_network = require('../network.js')(configOBJ);
        delete DataIn.folder_path;
        let keychk = tools.objectTostring(DataIn, classData.keyName);
        console.log("" + classData.lower_name + " id results: " + keychk);
        console.log("received results: " + JSON.stringify(DataIn));
        logger.info('adding ' + classData.lower_name + ' id ' + keychk + ' with following data ' + JSON.stringify(DataIn) + '');

        const result = await multi_network.createKeyValue(class_name, classData.methods.creating, keychk, JSON.stringify(DataIn));
        console.log("get results: " + result);
        if (tools.checkBool(result)) {
            res.send(tools.responseFormat(result, DataIn._id + " " + classData.displayName + " was added", true, 200));
            logger.info("" + classData.displayName + " " + keychk + " was added");
        } else {
            logger.error(result);
            res.status(404).send(tools.responseFormat(result, DataIn._id + " " + classData.displayName + " was not added", false, 404));
        }
    } catch (e) { // this will eventually be handled by your error handling middleware
        logger.error(e);
        res.status(404).send(tools.responseFormat(null, "Error Occurred " + e, false, 404));
    }
};

const updateitemroute = async (req, res) => {
    try {
        let DataIn = req.body;
        if (!("folder_path" in DataIn)) {
            res.status(404).send(tools.responseFormat(null, "database prefix is missing", false, 404));
        }
        if (jsonContent[req.params.name] === undefined) {
            res.status(404).send(tools.responseFormat(null, "name is not found in config file", false, 404));
        }
        let classData = jsonContent[req.params.name];
        let class_name = "";
        class_name = sprintf('%s_%s', DataIn.folder_path, classData.class);
        console.log("class results: " + class_name);
        let configOBJ = tools.configFile(current_path_location, DataIn.folder_path);
        const multi_network = require('../network.js')(configOBJ);
        let keychk = tools.objectTostring(DataIn, classData.keyName);
        delete DataIn.folder_path;
        console.log("" + classData.lower_name + " id results: " + keychk);
        console.log("received results: " + JSON.stringify(DataIn));
        logger.info('updating ' + classData.lower_name + ' id ' + keychk + ' with following data ' + JSON.stringify(DataIn) + '');
        const result = await multi_network.updateKeyValue(class_name, classData.methods.updating, keychk, JSON.stringify(DataIn));
        console.log("get results: " + result);
        if (tools.checkBool(result)) {
            res.send(tools.responseFormat(result, DataIn._id + " " + classData.displayName + " was updated", true, 200));
            logger.info("" + classData.displayName + " " + keychk + " was updated");
        } else {
            logger.error(result);
            res.status(404).send(tools.responseFormat(null, classData.displayName + " was not updated", false, 404));
        }
    } catch (e) { // this will eventually be handled by your error handling middleware
        logger.error(e);
        res.status(404).send(tools.responseFormat(null, "Error Occurred " + e, false, 404));
    }
};

const getHistoryroute = async (req, res) => {
    try {
        let DataIn = req.body;
        if (!("folder_path" in DataIn)) {
            res.status(404).send(tools.responseFormat(null, "database prefix is missing", false, 404));
        }
        if (jsonContent[req.params.name] === undefined) {
            res.status(404).send(tools.responseFormat(null, "name is not found in config file", false, 404));
        }
        let classData = jsonContent[req.params.name];
        let class_name = "";
        class_name = sprintf('%s_%s', DataIn.folder_path, classData.class);
        let configOBJ = tools.configFile(current_path_location, DataIn.folder_path);
        const multi_network = require('../network.js')(configOBJ);
        console.log("" + classData.lower_name + " id results: " + DataIn._id);
        logger.info('getting ' + classData.lower_name + ' history ' + DataIn._id + '');
        const result = await multi_network.getHistoryForKey(class_name, classData.methods.get_history, DataIn._id);
        console.log("testing return results: " + result);
        logger.info('get ' + classData.lower_name + ' id ' + DataIn._id + ' history');
        console.log("testing script results: " + result);
        if (tools.isEmpty(result)) {
            logger.error(DataIn._id + " " + classData.displayName + " not exists or no history available");
            res.status(404).send(tools.responseFormat(null, DataIn._id + " " + classData.displayName + " not exists or no history available", false, 404));
        } else {
            let jsonArray = [];
            const js = JSON.parse(result);
            let sb = new StringBuilder();
            js.data.toString().split(',').forEach((s) => (sb.append(String.fromCharCode(parseInt(s, 10)))));
            // Parse the string back into a JSON object
            let chnged = sb.toString();
            console.log("full string " + chnged);

            let matches = chnged.match(/\[.*?\]/g);
            let arr = [];
            if (matches.length > 0) {
                matches.forEach(function (element) {
                    arr = arr.concat(JSON.parse(element));
                });
            }

            chnged = chnged.replace(/ *\[[^\]]*]/, '');
            if (chnged.length > 0) {
                let jsonmatches = chnged.match(/\{.*?\}/g);
                if (jsonmatches.length > 0) {
                    jsonmatches.forEach(function (element) {
                        if (tools.IsJsonString(element)) {
                            arr = arr.concat(JSON.parse(element));
                        }

                    });
                }
            }

            arr.forEach(function (element) {
                if ('Timestamp' in element) {
                    let TStamp = element.Timestamp;
                    if ('seconds' in TStamp) {
                        let TStampSec = TStamp.seconds;
                        const dt = new Date(parseInt(TStampSec.low) * 1000);
                        element.datetime = dt.toISOString();
                        element.formatted_datetime = dateFormat(dt.toISOString(), "yyyy-mm-dd h:MM:ss TT");
                        jsonArray.push(element);
                    }
                }
            });
            logger.info(JSON.stringify(jsonArray));
            res.send(tools.responseFormat(jsonArray, '', true, 200));
        }
    } catch (e) { // this will eventually be handled by your error handling middleware
        logger.error(e);
        res.status(404).send(tools.responseFormat(null, "Error Occurred " + e, false, 404));
    }
};

const getRangeroute = async (req, res) => {
    try {
        let DataIn = req.body;
        let classData = jsonContent[req.params.name];
        let class_name = "";
        class_name = sprintf('%s_%s', DataIn.folder_path, classData.class);
        let configOBJ = tools.configFile(current_path_location, DataIn.folder_path);
        const multi_network = require('../network.js')(configOBJ);
        console.log("" + classData.displayName + " id : " + DataIn._id);
        let range_from = DataIn.range_from;
        let range_to = DataIn.range_to;
        logger.info("check " + classData.displayName + " for a range of ids from " + range_from + " to " + range_to + "");
        const result = await multi_network.getStateByRange(class_name, classData.methods.get_state_by_range, range_from, range_to);
        console.log("testing script results: " + result);
        if (tools.isEmpty(result)) {
            logger.error('' + classData.displayName + '  range from ' + range_from + ' to ' + range_to + ' does not exists');
            res.status(404).send(tools.responseFormat(null, classData.displayName + '  range from ' + range_from + ' to ' + range_to + ' does not exists', false, 404));
        } else {
            logger.info(JSON.stringify(result));
            res.send(tools.responseFormat(result, '', true, 200));
        }
    } catch (e) { // this will eventually be handled by your error handling middleware
        logger.error(e);
        res.status(404).send(tools.responseFormat(null, "Error Occurred " + e, false, 404));
    }
};

const getQueryroute = async (req, res) => {
    try {
        let DataIn = req.body;
        if (!("folder_path" in DataIn)) {
            res.status(404).send(tools.responseFormat(null, "database prefix is missing", false, 404));
        }
        if (jsonContent[req.params.name] === undefined) {
            res.status(404).send(tools.responseFormat(null, "name is not found in config file", false, 404));
        }

        let classData = jsonContent[req.params.name];

        if (!('query_string' in DataIn)) {
            logger.error('' + classData.displayName + '  querystring does not exists');
            res.status(404).send(tools.responseFormat(null, 'The query string does not exists', false, 404));
        }

        let class_name = "";
        class_name = sprintf('%s_%s', DataIn.folder_path, classData.class);
        let configOBJ = tools.configFile(current_path_location, DataIn.folder_path);
        const multi_network = require('../network.js')(configOBJ);
        logger.info('check ' + classData.displayName + '  with queryString with query:' + DataIn.query_string + '');
        console.log("" + classData.displayName + " query results: " + DataIn.query_string);
        const result = await multi_network.getQueryResult(class_name, classData.methods.get_query_result, DataIn.query_string);
        console.log("received results: " + result);
        if (tools.isEmpty(result)) {
            logger.error('' + classData.displayName + '  query result empty');
            res.status(404).send(tools.responseFormat(null, classData.displayName + " query returned no result", false, 404));
        } else {
            let jsonArray = [];
            const jsarr = JSON.parse(result);
            console.log("received json results: " + jsarr);
            jsarr.forEach(function (element) {
                let Valuestr = element.Value;
                jsonArray.push(Valuestr);
            });
            logger.info(JSON.stringify(result));
            res.send(tools.responseFormat(JSON.stringify(jsonArray), '', true, 200));
        }
    } catch (e) { // this will eventually be handled by your error handling middleware
        logger.error(e);
        res.status(404).send(tools.responseFormat(null, "Error Occurred " + e, false, 404));
    }
};

exports.checkExists = asyncRoute(checkroute);
exports.getItem = asyncRoute(getitemroute);
exports.addItem = asyncRoute(additemroute);
exports.updateItem = asyncRoute(updateitemroute);
exports.deleteItem = asyncRoute(deleteitemroute);
exports.getHistory = asyncRoute(getHistoryroute);
exports.getRange = asyncRoute(getRangeroute);
exports.getQueryResult = asyncRoute(getQueryroute);
