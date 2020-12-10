const tools = require("../src/func");
const asyncRoute = require("route-async");
const fs = require("fs");
const util = require("util");
let scontents = fs.readFileSync("site_config.json");
let jsoncontents = JSON.parse(scontents);
let current_path_location = jsoncontents.work_path;
let contents = fs.readFileSync(current_path_location + "json/blockchain_config.json");
let jsonContent = JSON.parse(contents);
let cdirectory = __dirname;
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

        console.log("name: " + req.params.name);
        console.log("folder: " + DataIn.folder_path);
        console.log("id: " + DataIn.id);
        let configOBJ = DataIn.config_json;
        let classData = jsonContent[req.params.name];
        let contract_name = DataIn.contract_name;

        console.log("nameobj is " + util.inspect(classData, {
            showHidden: false,
            depth: null
        }));
        DataIn.id = !("id" in DataIn) ? DataIn[classData.keyName] : DataIn.id;
        const multi_network = require("../network.js")(configOBJ);
        let result;
        try {
            await multi_network.keyExists(contract_name, classData.methods.checkExists, DataIn.id)
                .then(data => {
                    result = data;
                }).catch(err => {
                    console.log(err);
                    throw err;
                });
        } catch (error) {
            throw error;
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
                res.status(400).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + " does not exists", false, 400));
            }
        } else {
            console.error(result);
            res.status(400).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + " does not exists", false, 400));
        }
    } catch (e) { // this will eventually be handled by your error handling middleware
        console.error(e);
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
            await multi_network.readKeyValue(contract_name, classData.methods.reading, DataIn.id)
                .then(response => response.json())
                .then(data => {
                    data = tools.convertJSONString(data);
                    if (tools.isEmpty(data)) {
                        console.error("Empty object returned");
                        res.send(tools.responseFormat(result, DataIn.id + " " + classData.displayName + " not found", false, 400));
                    }
                    result = data;
                }).catch(err => {
                    console.log(err);
                    throw err;
                });
        } catch (error) {
            throw error;
        }
        console.log("testing return results: " + result);
        console.log("get " + classData.lower_name + " id " + DataIn.id + " details");
        console.log("" + classData.lower_name + " " + DataIn.id + ", data: " + result + "");
        console.log(JSON.stringify(result));

        res.send(tools.responseFormat(result, DataIn.id + " " + classData.displayName + " found", true, 200));

    } catch (e) { // this will eventually be handled by your error handling middleware
        console.error(e);
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
        console.log("testing script results: " + DataIn.id);
        let classData = jsonContent[req.params.name];
        ataIn.id = !("id" in DataIn) ? DataIn[classData.keyName] : DataIn.id;
        let contract_name = DataIn.contract_name;
        let configOBJ = tools.configFile(current_path_location, DataIn.folder_path);
        const multi_network = require(current_path_location + "network.js")(configOBJ);
        let result;
        try {
            result = await multi_network.deleteKeyValue(contract_name, classData.methods.reading, DataIn.id);
        } catch (error) {
            throw error;
        }
        console.log("testing return results: " + result);
        console.log("deleting " + classData.lower_name + " id " + DataIn.id + " details");
        if (tools.checkBool(result)) {
            console.log("" + classData.lower_name + " " + DataIn.id + ", data: " + result + "");
            res.send(tools.responseFormat(result, DataIn.id + " " + classData.displayName + " successfully deleted", true, 200));
        } else {
            console.error(result);
            console.log("" + classData.lower_name + " id " + DataIn.id + " does not exists and can't be deleted");
            res.status(400).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + " does not exists and can't be deleted", false, 400));
        }
    } catch (e) { // this will eventually be handled by your error handling middleware
        console.error(e);
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

        console.log("adding item with contract name: " + contract_name);
        console.log("class results: " + contract_name);
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
        DataIn[classData.keyName]
        console.log("" + classData.lower_name + " id results: " + DataIn[classData.keyName]);
        console.log("received results: " + JSON.stringify(DataIn));
        console.log("adding " + classData.lower_name + " id " + DataIn[classData.keyName] + " with following data " + JSON.stringify(DataIn) + "");
        let result;
        try {
            await multi_network.createKeyValue(contract_name, classData.methods.creating, DataIn[classData.keyName], JSON.stringify(DataIn))
                .then(data => {
                    if (!tools.checkBool(data)) {
                        console.error(data);
                        res.status(400).send(tools.responseFormat(data, DataIn.id + " " + classData.displayName + " was not added", false, 400));
                    }
                    result = data;
                }).catch(err => {
                    console.log(err);
                    throw err;
                });
        } catch (error) {
            throw error;
        }

        console.log("get results: " + result);
        console.log("" + classData.displayName + " " + DataIn[classData.keyName] + " was added");
        let hresult;
        try {
            await multi_network.getHistoryForKey(contract_name, classData.methods.get_history, DataIn.id)
                .then(data => {
                    let js = tools.convertJSONString(data);
                    if (!tools.isEmpty(js)) {
                        let sb = new StringBuilder();
                        js.data.toString().split(",").forEach(s => sb.append(String.fromCharCode(parseInt(s, 10))));
                        hresult = sb.toString();
                        console.log("testing return results: " + hresult);
                        console.log("get history " + classData.lower_name + " id " + DataIn.id + " history");
                    }
                }).catch(err => {
                    console.log(err);
                });
        } catch (error) {
            console.log(err);
        }

        res.send(tools.responseFormat(hresult, DataIn.id + " " + classData.displayName + " was added", true, 200));
    } catch (e) { // this will eventually be handled by your error handling middleware
        console.error(e);
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
        console.log("class results: " + contract_name);
        console.log("updating item with contract name: " + contract_name);
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
        console.log("" + classData.lower_name + " id results: " + DataIn[classData.keyName]);
        console.log("received results: " + JSON.stringify(DataIn));
        console.log("updating " + classData.lower_name + " id " + DataIn[classData.keyName] + " with following data " + JSON.stringify(DataIn) + "");
        let result;
        try {
            await multi_network.updateKeyValue(contract_name, classData.methods.updating, DataIn[classData.keyName], JSON.stringify(DataIn))
                .then(data => {
                    if (!tools.checkBool(data)) {
                        console.error(data);
                        res.status(400).send(tools.responseFormat(data, DataIn.id + " " + classData.displayName + " was not updated", false, 400));
                    }
                    result = data;
                }).catch(err => {
                    console.error(err);
                    throw err;
                });
        } catch (error) {
            throw error;
        }

        console.log("get results: " + result);
        console.log("" + classData.displayName + " " + DataIn[classData.keyName] + " was added");
        let hresult;
        try {
            await multi_network.getHistoryForKey(contract_name, classData.methods.get_history, DataIn.id)
                .then(data => {
                    let js = tools.convertJSONString(data);
                    if (!tools.isEmpty(js)) {
                        console.log("testing return results: " + js);
                        console.log("get history " + classData.lower_name + " id " + DataIn.id + " history");
                        let sb = new StringBuilder();
                        js.data.toString().split(",").forEach(s => sb.append(String.fromCharCode(parseInt(s, 10))));
                        hresult = sb.toString();
                    }
                }).catch(err => {
                    console.log(err);
                });
        } catch (error) {
            console.log(err);
        }

        res.send(tools.responseFormat(hresult, DataIn.id + " " + classData.displayName + " was updated", true, 200));
    } catch (e) { // this will eventually be handled by your error handling middleware
        console.error(e);
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
        console.log("" + classData.lower_name + " id results: " + DataIn.id);
        console.log("getting " + classData.lower_name + " history " + DataIn.id + "");
        let result;
        try {
            await multi_network.getHistoryForKey(contract_name, classData.methods.get_history, DataIn.id)
                .then(data => {
                    let js = tools.convertJSONString(data);
                    if (tools.isEmpty(js)) {
                        console.error(DataIn.id + " " + classData.displayName + " not exists or no history available");
                        res.status(400).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + " not exists or no history available", false, 400));
                    }
                    console.log("testing return results: " + js);
                    console.log("get " + classData.lower_name + " id " + DataIn.id + " history");
                    console.log("testing script results: " + js);
                    let sb = new StringBuilder();
                    js.data.toString().split(",").forEach(s => sb.append(String.fromCharCode(parseInt(s, 10))));
                    let sbjs = sb.toString();
                    console.log("full string " + sbjs);
                    result = tools.stringToJsonTimestamp(sbjs);
                }).catch(err => {
                    console.error(err);
                    throw err;
                });
        } catch (error) {
            throw error;
        }

        let jsonArray = [];
        if (result.length > 0) {
            result.forEach(function(element) {
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
    } catch (e) { // this will eventually be handled by your error handling middleware
        console.error(e);
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
        console.log("" + classData.displayName + " id : " + DataIn.id);
        console.log("check " + classData.displayName + " for a range of ids from " + range_from + " to " + range_to + "");
        let result;
        try {
            result = await multi_network.getStateByRange(contract_name, classData.methods.get_state_by_range, range_from, range_to);
        } catch (error) {
            throw error;
        }

        console.log("testing script results: " + result);
        if (tools.isEmpty(result)) {
            console.error("" + classData.displayName + "  range from " + range_from + " to " + range_to + " does not exists");
            res.status(400).send(tools.responseFormat(null, classData.displayName + "  range from " + range_from + " to " + range_to + " does not exists", false, 400));
        } else {
            console.log(JSON.stringify(result));
            res.send(tools.responseFormat(result, "", true, 200));
        }

    } catch (e) { // this will eventually be handled by your error handling middleware
        console.error(e);
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
            console.error("" + classData.displayName + "  querystring does not exists");
            res.status(400).send(tools.responseFormat(null, "The query string does not exists", false, 400));
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
            throw error;
        }

        console.log("received results: " + result);
        if (tools.isEmpty(result)) {
            console.error("" + classData.displayName + "  query result empty");
            res.status(400).send(tools.responseFormat(null, classData.displayName + " query returned no result", false, 400));
        } else {
            let jsonArray = [];
            const jsarr = JSON.parse(result);
            console.log(`received json results: ${jsarr}`);
            jsarr.forEach(function(element) {
                let Valuestr = element.Value;
                jsonArray.push(Valuestr);
            });
            console.log(JSON.stringify(result));
            res.send(tools.responseFormat(JSON.stringify(jsonArray), "", true, 200));
        }

    } catch (e) { // this will eventually be handled by your error handling middleware
        console.error(e);
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