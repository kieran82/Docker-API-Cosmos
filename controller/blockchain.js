const tools = require("../src/func");
const asyncRoute = require("route-async");
const fs = require("fs");
const util = require("util");
let scontents = fs.readFileSync("site_config.json");
let jsoncontents = JSON.parse(scontents);
let current_path_location = jsoncontents.work_path;
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
        console.log("id: " + DataIn.id);

        let configOBJ = tools.configFile(current_path_location, DataIn.folder_path);
        let classData = jsonContent[req.params.name];
        let contract_name = DataIn.contract_name;
        
        console.log("nameobj is " + util.inspect(classData, {
            showHidden: false,
            depth: null
        }));
        DataIn.id = !("id" in DataIn) ? tools.objectTostring(DataIn, classData.keyName) : tools.numberTostring(DataIn.id);
        const multi_network = require("../network.js")(configOBJ);
        let result;
        try {
            result = await multi_network.keyExists(contract_name, classData.methods.checkExists, DataIn.id);
        } catch (error) {
            throw(error);
        }
        console.log("testing return results: " + result);
        console.log("check " + classData.lower_name + " id " + DataIn.id + " exists");
        if (tools.checkBool(result)) {
            console.log("boolcheck return yes");
            if (result === true || result == "true") {
                console.log("" + classData.lower_name + " " + DataIn.id + "exists");
                res.send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + " does exists", true, 200));
            } else {
                console.log("" + classData.lower_name + " id " + DataIn.id + " does not exists");
                res.status(404).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + " does not exists", false, 404));
            }
        } else {
            console.error(result);
            res.status(404).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + " does not exists", false, 404));
        }
    } catch (e) { // this will eventually be handled by your error handling middleware
        console.error(e);
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

        let classData = jsonContent[req.params.name];
        DataIn.id = !("id" in DataIn) ? tools.objectTostring(DataIn, classData.keyName) : tools.numberTostring(DataIn.id);
        let contract_name = DataIn.contract_name;
        let configOBJ = tools.configFile(current_path_location, DataIn.folder_path);
        const multi_network = require(current_path_location + "network.js")(configOBJ);
        let result;
        try {
            result = await multi_network.readKeyValue(contract_name, classData.methods.reading, DataIn.id);
        } catch (error) {
            throw(error);
        }
        console.log("testing return results: " + result);
        console.log("get " + classData.lower_name + " id " + DataIn.id + " details");
        if (! tools.isEmpty(result)) {
            console.log("" + classData.lower_name + " " + DataIn.id + ", data: " + result + "");
            let orders = JSON.parse(result);

            console.log(JSON.stringify(orders));

            res.send(tools.responseFormat(orders, DataIn.id + " " + classData.displayName + " found", true, 200));
        } else {
            console.log("" + classData.lower_name + " id " + DataIn.id + " does not exists");
            res.status(404).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + " Not found", false, 404));
        }
    } catch (e) { // this will eventually be handled by your error handling middleware
        console.error(e);
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
        console.log("testing script results: " + DataIn.id);
        let classData = jsonContent[req.params.name];
        DataIn.id = !("id" in DataIn) ? tools.objectTostring(DataIn, classData.keyName) : tools.numberTostring(DataIn.id);
        let contract_name = DataIn.contract_name;

        let configOBJ = tools.configFile(current_path_location, DataIn.folder_path);
        const multi_network = require(current_path_location + "network.js")(configOBJ);
        let result;
        try {
            result = await multi_network.deleteKeyValue(contract_name, classData.methods.reading, DataIn.id);
        } catch (error) {
            throw(error);
        }
        console.log("testing return results: " + result);
        console.log("deleting " + classData.lower_name + " id " + DataIn.id + " details");
        if (tools.checkBool(result)) {
            console.log("" + classData.lower_name + " " + DataIn.id + ", data: " + result + "");
            res.send(tools.responseFormat(result, DataIn.id + " " + classData.displayName + " successfully deleted", true, 200));
        } else {
            console.error(result);
            console.log("" + classData.lower_name + " id " + DataIn.id + " does not exists and can't be deleted");
            res.status(404).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + " does not exists and can't be deleted", false, 404));
        }
    } catch (e) { // this will eventually be handled by your error handling middleware
        console.error(e);
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
        let contract_name = DataIn.contract_name;

        console.log("adding item with contract name: " + contract_name);
        console.log("class results: " + contract_name);
        let id_variable = "";
        if (!("id" in DataIn)) {
            id_variable = DataIn[classData.keyName];
        } else {
            id_variable = DataIn.id;
        } DataIn.id = id_variable;
        let configOBJ = tools.configFile(current_path_location, DataIn.folder_path);
        const multi_network = require("../network.js")(configOBJ);
        let fname = contract_name;
        delete DataIn.folder_path;
        delete DataIn.contract_name;
        let keychk = tools.objectTostring(DataIn, classData.keyName);
        console.log("" + classData.lower_name + " id results: " + keychk);
        console.log("received results: " + JSON.stringify(DataIn));
        console.log("adding " + classData.lower_name + " id " + keychk + " with following data " + JSON.stringify(DataIn) + "");
        await multi_network.createKeyValue(contract_name, classData.methods.creating, keychk, JSON.stringify(DataIn)).then(result => {
            console.log("get results: " + result);
            if (tools.checkBool(result)) {
                console.log("" + classData.displayName + " " + keychk + " was added");
                const hresult = await multi_network.getHistoryForKey(contract_name, classData.methods.get_history, DataIn.id);
                console.log("testing return results: " + hresult);
                console.log("get history " + classData.lower_name + " id " + DataIn.id + " history");
                if (! tools.isEmpty(hresult)) {
                    res.send(tools.responseFormat(tools.bufferToString(hresult), DataIn.id + " " + classData.displayName + " was added", true, 200));
                } else {
                    res.send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + " was added", true, 200));
                }
            } else {
                console.error(result);
                res.status(404).send(tools.responseFormat(result, DataIn.id + " " + classData.displayName + " was not added", false, 404));
            }
          })
          .catch(err => {
            throw err;
          });
    } catch (e) { // this will eventually be handled by your error handling middleware
        console.error(e);
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
        let contract_name = DataIn.contract_name;
        console.log("class results: " + contract_name);
        console.log("updating item with contract name: " + contract_name);
        let id_variable = "";
        if (!("id" in DataIn)) {
            id_variable = DataIn[classData.keyName];
        } else {
            id_variable = DataIn.id;
        } DataIn.id = id_variable;
        let configOBJ = tools.configFile(current_path_location, DataIn.folder_path);
        const multi_network = require("../network.js")(configOBJ);
        let keychk = tools.objectTostring(DataIn, classData.keyName);
        let fname = contract_name;
        delete DataIn.folder_path;
        delete DataIn.contract_name;
        console.log("" + classData.lower_name + " id results: " + keychk);
        console.log("received results: " + JSON.stringify(DataIn));
        console.log("updating " + classData.lower_name + " id " + keychk + " with following data " + JSON.stringify(DataIn) + "");
        let result;
        try {
            result = await multi_network.updateKeyValue(contract_name, classData.methods.updating, keychk, JSON.stringify(DataIn))
            .then(function(body){
                result = body;
            }).catch(function(error) {
                throw(error);
            });
        } catch (error) {
            throw(error);
        }
        console.log("get results: " + result);
        if (tools.checkBool(result)) {
            console.log("" + classData.displayName + " " + keychk + " was updated");
            const hresult = await multi_network.getHistoryForKey(contract_name, classData.methods.get_history, DataIn.id);
            console.log("testing return results: " + hresult);
            console.log("get history " + classData.lower_name + " id " + DataIn.id + " history");
            if (! tools.isEmpty(hresult)) {
                res.send(tools.responseFormat(tools.bufferToString(hresult), DataIn.id + " " + classData.displayName + " was updated", true, 200));
            } else {
                res.send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + " was updated", true, 200));
            }           
        } else {
            console.error(result);
            res.status(404).send(tools.responseFormat(null, classData.displayName + " was not updated", false, 404));
        }
    } catch (e) { // this will eventually be handled by your error handling middleware
        console.error(e);
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
        let contract_name = DataIn.contract_name;
        let configOBJ = tools.configFile(current_path_location, DataIn.folder_path);
        const multi_network = require("../network.js")(configOBJ);
        console.log("" + classData.lower_name + " id results: " + DataIn.id);
        console.log("getting " + classData.lower_name + " history " + DataIn.id + "");
        let result;
        try {
            result = await multi_network.getHistoryForKey(contract_name, classData.methods.get_history, DataIn.id);
        } catch (error) {
            throw(error);
        }
        console.log("testing return results: " + result);
        console.log("get " + classData.lower_name + " id " + DataIn.id + " history");
        console.log("testing script results: " + result);
        if (tools.isEmpty(result)) {
            console.error(DataIn.id + " " + classData.displayName + " not exists or no history available");
            res.status(404).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + " not exists or no history available", false, 404));
        } else {
            let jsonArray = [];
            let changed = tools.bufferToString(result);
            console.log("full string " + changed);
            let arr = tools.stringToJson(changed);
            arr = arr.filter(obj => Object.keys(obj).includes("Timestamp"));
            if (arr.length > 0) {
                arr.forEach(function (element) {
                    if ("seconds" in element.Timestamp) {
                        const dt = new Date(parseInt(element.Timestamp.seconds.low) * 1000);
                        element.datetime = dt.toISOString();
                        element.formatted_datetime = dateFormat(dt.toISOString(), "yyyy-mm-dd h:MM:ss TT");
                        jsonArray.push(element);
                    }
                });
            }

            console.log(JSON.stringify(jsonArray));
            res.send(tools.responseFormat(jsonArray, "", true, 200));
        }
    } catch (e) { // this will eventually be handled by your error handling middleware
        console.error(e);
        res.status(404).send(tools.responseFormat(null, "Error Occurred " + e, false, 404));
    }
};

const getRangeroute = async (req, res) => {
    try {
        let DataIn = req.body;
        let classData = jsonContent[req.params.name];
        let contract_name = DataIn.contract_name;
        let range_from = DataIn.range_from;
        let range_to = DataIn.range_to;
        let configOBJ = tools.configFile(current_path_location, DataIn.folder_path);
        const multi_network = require("../network.js")(configOBJ);
        console.log("" + classData.displayName + " id : " + DataIn.id);
        console.log("check " + classData.displayName + " for a range of ids from " + range_from + " to " + range_to + "");
        let result;
        try {
            result = await multi_network.getStateByRange(contract_name, classData.methods.get_state_by_range, range_from, range_to);
        } catch (error) {
            throw(error);
        }

        console.log("testing script results: " + result);
        if (tools.isEmpty(result)) {
            console.error("" + classData.displayName + "  range from " + range_from + " to " + range_to + " does not exists");
            res.status(404).send(tools.responseFormat(null, classData.displayName + "  range from " + range_from + " to " + range_to + " does not exists", false, 404));
        } else {
            console.log(JSON.stringify(result));
            res.send(tools.responseFormat(result, "", true, 200));
        }

    } catch (e) { // this will eventually be handled by your error handling middleware
        console.error(e);
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

        if (!("query_string" in DataIn)) {
            console.error("" + classData.displayName + "  querystring does not exists");
            res.status(404).send(tools.responseFormat(null, "The query string does not exists", false, 404));
        }

        let contract_name = DataIn.contract_name;
        let configOBJ = tools.configFile(current_path_location, DataIn.folder_path);
        const multi_network = require("../network.js")(configOBJ);
        console.log("check " + classData.displayName + "  with queryString with query:" + DataIn.query_string + "");
        console.log("" + classData.displayName + " query results: " + DataIn.query_string);
        let result;
        try {
            result = await multi_network.getQueryResult(contract_name, classData.methods.get_query_result, DataIn.query_string);
        } catch (error) {
            throw(error);
        }

        console.log("received results: " + result);
        if (tools.isEmpty(result)) {
            console.error("" + classData.displayName + "  query result empty");
            res.status(404).send(tools.responseFormat(null, classData.displayName + " query returned no result", false, 404));
        } else {
            let jsonArray = [];
            const jsarr = JSON.parse(result);
            console.log(`received json results: ${jsarr}`);
            jsarr.forEach(function (element) {
                let Valuestr = element.Value;
                jsonArray.push(Valuestr);
            });
            console.log(JSON.stringify(result));
            res.send(tools.responseFormat(JSON.stringify(jsonArray), "", true, 200));
        }

    } catch (e) { // this will eventually be handled by your error handling middleware
        console.error(e);
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
