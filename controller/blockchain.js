const tools = require("../src/func");
const asyncRoute = require("route-async");
const fs = require("fs");
const util = require("util");
const log4js = require('log4js');
let scontents = fs.readFileSync("site_config.json");
let jsoncontents = JSON.parse(scontents);
let current_path_location = jsoncontents.work_path;
let contents = fs.readFileSync(current_path_location + "json/blockchain_config.json");
let jsonContent = JSON.parse(contents);
let cdirectory = __dirname;
let logpath = process.env.LOGFILEPATH;
log4js.configure({
    appenders: {
        BlockchainFile: { type: 'file', filename: logpath, maxLogSize: 4194304, backups: 10, keepFileExt: true, compress: true, daysToKeep: 20 }
    },
    categories: {
        default: { appenders: ['BlockchainFile'], level: 'trace' }
    }
});
const logger = log4js.getLogger('BlockchainFile');
console.log("cdirectory = " + cdirectory);
console.log("cdirectory1 = " + __dirname);
console.log("cwd = " + process.cwd());

const checkroute = async(req, res) => {
    try {
        let DataIn = req.body;
        if (!("folder_path" in DataIn)) {
            res.status(400).send(tools.responseFormat(null, "database prefix is missing", false, 400));
        }
        if (jsonContent[req.params.name] === undefined) {
            res.status(400).send(tools.responseFormat(null, "name is not found in config file", false, 400));
        }

        logger.info("name: " + req.params.name);
        logger.info("folder: " + DataIn.folder_path);
        logger.info("id: " + DataIn.id);
        let configOBJ = DataIn.config_json;
        let classData = jsonContent[req.params.name];
        let contract_name = DataIn.contract_name;

        logger.info("nameobj is " + util.inspect(classData, {
            showHidden: false,
            depth: null
        }));
        DataIn.id = !("id" in DataIn) ? DataIn[classData.keyName] : DataIn.id;
        const multi_network = require("../network.js")(configOBJ);
        let result;
        try {
            result = await multi_network.keyExists(contract_name, classData.methods.checkExists, DataIn.id);
        } catch (error) {
            throw error;
        }
        logger.info("testing return results: " + result);
        logger.info("check " + classData.lower_name + " id " + DataIn.id + " exists");
        if (tools.checkBool(result)) {
            logger.info("boolcheck return yes");
            if (result === true || result == "true") {
                logger.info("" + classData.lower_name + " " + DataIn.id + "exists");
                res.send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + " does exists", true, 200));
            } else {
                logger.info("" + classData.lower_name + " id " + DataIn.id + " does not exists");
                res.status(400).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + " does not exists", false, 400));
            }
        } else {
            logger.error(result);
            res.status(400).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + " does not exists", false, 400));
        }
    } catch (e) { // this will eventually be handled by your error handling middleware
        logger.error(e);
        res.status(400).send(tools.responseFormat(null, "Error Occurred " + e, false, 400));
    }
};

const getitemroute = async(req, res) => {
    try {
        let DataIn = req.body;
        if (!("folder_path" in DataIn)) {
            res.status(400).send(tools.responseFormat(null, "database prefix is missing", false, 400));
        }
        if (jsonContent[req.params.name] === undefined) {
            res.status(400).send(tools.responseFormat(null, "name is not found in config file", false, 400));
        }

        let classData = jsonContent[req.params.name];
        DataIn.id = !("id" in DataIn) ? DataIn[classData.keyName] : DataIn.id;
        let contract_name = DataIn.contract_name;
        let configOBJ = DataIn.config_json;
        const multi_network = require(current_path_location + "network.js")(configOBJ);
        let result;
        try {
            result = await multi_network.readKeyValue(contract_name, classData.methods.reading, DataIn.id);
        } catch (error) {
            throw error;
        }
        logger.info("testing return results: " + result);
        logger.info("get " + classData.lower_name + " id " + DataIn.id + " details");
        if (!tools.isEmpty(result)) {
            logger.info("" + classData.lower_name + " " + DataIn.id + ", data: " + result + "");
            let orders = JSON.parse(result);

            logger.info(JSON.stringify(orders));

            res.send(tools.responseFormat(orders, DataIn.id + " " + classData.displayName + " found", true, 200));
        } else {
            logger.info("" + classData.lower_name + " id " + DataIn.id + " does not exists");
            res.status(400).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + " Not found", false, 400));
        }
    } catch (e) { // this will eventually be handled by your error handling middleware
        logger.error(e);
        res.status(400).send(tools.responseFormat(null, "Error Occurred " + e, false, 400));
    }
};

const deleteitemroute = async(req, res) => {
    try {
        let DataIn = req.body;
        if (!("folder_path" in DataIn)) {
            res.status(400).send(tools.responseFormat(null, "database prefix is missing", false, 400));
        }
        if (jsonContent[req.params.name] === undefined) {
            res.status(400).send(tools.responseFormat(null, "name is not found in config file", false, 400));
        }
        logger.info("testing script results: " + DataIn.id);
        let classData = jsonContent[req.params.name];
        DataIn.id = !("id" in DataIn) ? DataIn[classData.keyName] : DataIn.id;
        let contract_name = DataIn.contract_name;
        let configOBJ = tools.configFile(current_path_location, DataIn.folder_path);
        const multi_network = require(current_path_location + "network.js")(configOBJ);
        let result;
        try {
            result = await multi_network.deleteKeyValue(contract_name, classData.methods.reading, DataIn.id);
        } catch (error) {
            throw error;
        }
        logger.info("testing return results: " + result);
        logger.info("deleting " + classData.lower_name + " id " + DataIn.id + " details");
        if (tools.checkBool(result)) {
            logger.info("" + classData.lower_name + " " + DataIn.id + ", data: " + result + "");
            res.send(tools.responseFormat(result, DataIn.id + " " + classData.displayName + " successfully deleted", true, 200));
        } else {
            logger.error(result);
            logger.info("" + classData.lower_name + " id " + DataIn.id + " does not exists and can't be deleted");
            res.status(400).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + " does not exists and can't be deleted", false, 400));
        }
    } catch (e) { // this will eventually be handled by your error handling middleware
        logger.error(e);
        res.status(400).send(tools.responseFormat(null, "Error Occurred " + e, false, 400));
    }
};

const additemroute = async(req, res) => {
    try {
        let DataIn = req.body;
        if (!("folder_path" in DataIn)) {
            res.status(400).send(tools.responseFormat(null, "database prefix is missing", false, 400));
        }
        if (jsonContent[req.params.name] === undefined) {
            res.status(400).send(tools.responseFormat(null, "name is not found in config file", false, 400));
        }
        let classData = jsonContent[req.params.name];
        let contract_name = DataIn.contract_name;

        logger.info("adding item with contract name: " + contract_name);
        logger.info("class results: " + contract_name);
        let id_variable = "";
        if (!("id" in DataIn)) {
            id_variable = DataIn[classData.keyName];
        } else {
            id_variable = DataIn.id;
        }
        DataIn.id = id_variable;
        let configOBJ = DataIn.config_json;
        const multi_network = require("../network.js")(configOBJ);
        delete DataIn.folder_path;
        delete DataIn.contract_name;
        delete DataIn.config_json;

        logger.info("" + classData.lower_name + " id results: " + DataIn.id);
        logger.info("received results: " + JSON.stringify(DataIn));
        logger.info("adding " + classData.lower_name + " id " + DataIn.id + " with following data " + JSON.stringify(DataIn) + "");
        let result;
        try {
            result = await multi_network.createKeyValue(contract_name, classData.methods.creating, DataIn.id, JSON.stringify(DataIn));
        } catch (error) {
            throw error;
        }
        logger.info("get results: " + result);
        if (tools.checkBool(result)) {
            logger.info("" + classData.displayName + " " + DataIn.id + " was added");
            logger.info("get history " + classData.lower_name + " id " + DataIn.id + " history");
            let history = null;
            try {
                history = await multi_network.getHistoryForKey(contract_name, classData.methods.get_history, DataIn.id);
                logger.info("testing return results: " + history);
                history = tools.bufferToString(history);
            } catch (error) {
                logger.error(error);
            }
            res.send(tools.responseFormat(history, DataIn.id + " " + classData.displayName + " was added", true, 200));
        } else {
            logger.error(result);
            res.status(400).send(tools.responseFormat(result, DataIn.id + " " + classData.displayName + " was not added", false, 400));
        }
    } catch (e) { // this will eventually be handled by your error handling middleware
        logger.error(e);
        res.status(400).send(tools.responseFormat(null, "Error Occurred " + e, false, 400));
    }
};

const updateitemroute = async(req, res) => {
    try {
        let DataIn = req.body;
        if (!("folder_path" in DataIn)) {
            res.status(400).send(tools.responseFormat(null, "database prefix is missing", false, 400));
        }
        if (jsonContent[req.params.name] === undefined) {
            res.status(400).send(tools.responseFormat(null, "name is not found in config file", false, 400));
        }
        let classData = jsonContent[req.params.name];
        let contract_name = DataIn.contract_name;
        logger.info("class results: " + contract_name);
        logger.info("updating item with contract name: " + contract_name);
        let id_variable = "";
        if (!("id" in DataIn)) {
            id_variable = DataIn[classData.keyName];
        } else {
            id_variable = DataIn.id;
        }
        DataIn.id = id_variable;
        let configOBJ = DataIn.config_json;
        const multi_network = require("../network.js")(configOBJ);
        delete DataIn.folder_path;
        delete DataIn.contract_name;
        delete DataIn.config_json;
        logger.info("" + classData.lower_name + " id results: " + DataIn[classData.keyName]);
        logger.info("received results: " + JSON.stringify(DataIn));
        logger.info("updating " + classData.lower_name + " id " + DataIn[classData.keyName] + " with following data " + JSON.stringify(DataIn) + "");
        let result;
        try {
            result = await multi_network.updateKeyValue(contract_name, classData.methods.updating, DataIn[classData.keyName], JSON.stringify(DataIn));
        } catch (error) {
            throw error;
        }
        logger.info("get results: " + result);
        if (tools.checkBool(result)) {
            logger.info("" + classData.displayName + " " + DataIn[classData.keyName] + " was updated");
            let history = null;
            try {
                history = await multi_network.getHistoryForKey(contract_name, classData.methods.get_history, DataIn.id);
                logger.info("testing return results: " + history);
                history = tools.bufferToString(history);
            } catch (error) {
                logger.error(error);
            }

            logger.info("get history " + classData.lower_name + " id " + DataIn.id + " history");
            res.send(tools.responseFormat(history, DataIn.id + " " + classData.displayName + " was updated", true, 200));
        } else {
            logger.error(result);
            res.status(400).send(tools.responseFormat(null, classData.displayName + " was not updated", false, 400));
        }
    } catch (e) { // this will eventually be handled by your error handling middleware
        logger.error(e);
        res.status(400).send(tools.responseFormat(null, "Error Occurred " + e, false, 400));
    }
};

const getHistoryroute = async(req, res) => {
    try {
        let DataIn = req.body;
        if (!("folder_path" in DataIn)) {
            res.status(400).send(tools.responseFormat(null, "database prefix is missing", false, 400));
        }
        if (jsonContent[req.params.name] === undefined) {
            res.status(400).send(tools.responseFormat(null, "name is not found in config file", false, 400));
        }
        let classData = jsonContent[req.params.name];
        let contract_name = DataIn.contract_name;
        let configOBJ = DataIn.config_json;
        const multi_network = require("../network.js")(configOBJ);
        logger.info("" + classData.lower_name + " id results: " + DataIn.id);
        logger.info("getting " + classData.lower_name + " history " + DataIn.id + "");
        let result;
        try {
            result = await multi_network.getHistoryForKey(contract_name, classData.methods.get_history, DataIn.id);
        } catch (error) {
            throw error;
        }
        logger.info("testing return results: " + result);
        logger.info("get " + classData.lower_name + " id " + DataIn.id + " history");
        logger.info("testing script results: " + result);
        if (tools.isEmpty(result)) {
            logger.error(DataIn.id + " " + classData.displayName + " not exists or no history available");
            res.status(400).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + " not exists or no history available", false, 400));
        } else {
            let jsonArray = [];
            let changed = tools.bufferToString(result);
            logger.info("full string " + changed);
            let arr = tools.stringToJson(changed);
            arr = arr.filter(obj => Object.keys(obj).includes("Timestamp"));
            if (arr.length > 0) {
                arr.forEach(function(element) {
                    if ("seconds" in element.Timestamp) {
                        const dt = new Date(parseInt(element.Timestamp.seconds.low) * 1000);
                        element.datetime = dt.toISOString();
                        element.formatted_datetime = dateFormat(dt.toISOString(), "yyyy-mm-dd h:MM:ss TT");
                        jsonArray.push(element);
                    }
                });
            }

            logger.info(JSON.stringify(jsonArray));
            res.send(tools.responseFormat(jsonArray, "", true, 200));
        }
    } catch (e) { // this will eventually be handled by your error handling middleware
        logger.error(e);
        res.status(400).send(tools.responseFormat(null, "Error Occurred " + e, false, 400));
    }
};

const getRangeroute = async(req, res) => {
    try {
        let DataIn = req.body;
        let classData = jsonContent[req.params.name];
        let contract_name = DataIn.contract_name;
        let range_from = DataIn.range_from;
        let range_to = DataIn.range_to;
        let configOBJ = tools.configFile(current_path_location, DataIn.folder_path);
        const multi_network = require("../network.js")(configOBJ);
        logger.info("" + classData.displayName + " id : " + DataIn.id);
        logger.info("check " + classData.displayName + " for a range of ids from " + range_from + " to " + range_to + "");
        let result;
        try {
            result = await multi_network.getStateByRange(contract_name, classData.methods.get_state_by_range, range_from, range_to);
        } catch (error) {
            throw error;
        }

        logger.info("testing script results: " + result);
        if (tools.isEmpty(result)) {
            logger.error("" + classData.displayName + "  range from " + range_from + " to " + range_to + " does not exists");
            res.status(400).send(tools.responseFormat(null, classData.displayName + "  range from " + range_from + " to " + range_to + " does not exists", false, 400));
        } else {
            logger.info(JSON.stringify(result));
            res.send(tools.responseFormat(result, "", true, 200));
        }

    } catch (e) { // this will eventually be handled by your error handling middleware
        logger.error(e);
        res.status(400).send(tools.responseFormat(null, "Error Occurred " + e, false, 400));
    }
};

const getQueryroute = async(req, res) => {
    try {
        let DataIn = req.body;
        if (!("folder_path" in DataIn)) {
            res.status(400).send(tools.responseFormat(null, "database prefix is missing", false, 400));
        }
        if (jsonContent[req.params.name] === undefined) {
            res.status(400).send(tools.responseFormat(null, "name is not found in config file", false, 400));
        }

        let classData = jsonContent[req.params.name];

        if (!("query_string" in DataIn)) {
            logger.error("" + classData.displayName + "  querystring does not exists");
            res.status(400).send(tools.responseFormat(null, "The query string does not exists", false, 400));
        }

        let contract_name = DataIn.contract_name;
        let configOBJ = tools.configFile(current_path_location, DataIn.folder_path);
        const multi_network = require("../network.js")(configOBJ);
        logger.info("check " + classData.displayName + "  with queryString with query:" + DataIn.query_string + "");
        logger.info("" + classData.displayName + " query results: " + DataIn.query_string);
        let result;
        try {
            result = await multi_network.getQueryResult(contract_name, classData.methods.get_query_result, DataIn.query_string);
        } catch (error) {
            throw error;
        }

        logger.info("received results: " + result);
        if (tools.isEmpty(result)) {
            logger.error("" + classData.displayName + "  query result empty");
            res.status(400).send(tools.responseFormat(null, classData.displayName + " query returned no result", false, 400));
        } else {
            let jsonArray = [];
            const jsarr = JSON.parse(result);
            logger.info(`received json results: ${jsarr}`);
            jsarr.forEach(function(element) {
                let Valuestr = element.Value;
                jsonArray.push(Valuestr);
            });
            logger.info(JSON.stringify(result));
            res.send(tools.responseFormat(JSON.stringify(jsonArray), "", true, 200));
        }

    } catch (e) { // this will eventually be handled by your error handling middleware
        logger.error(e);
        res.status(400).send(tools.responseFormat(null, "Error Occurred " + e, false, 400));
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