const CosmosClient = require("@azure/cosmos").CosmosClient;
const tools = require("../src/func");
const asyncRoute = require("route-async");
const fs = require("fs");
const util = require("util");
const TaskDao = require("../models/taskDao");
const StringBuilder = require("node-stringbuilder");
const sprintf = require("sprintf-js").sprintf;
let scontents = fs.readFileSync("site_config.json");
let jsoncontents = JSON.parse(scontents);
let current_path_location = jsoncontents.work_path;
const checkArray = ["stock", "batch", "raw_material"];
let contents = fs.readFileSync(current_path_location + "json/blockchain_config.json");
let cosmos_config = jsoncontents.config_url;
let cosmos_key = jsoncontents.config_key;
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
		let class_name = "";
		if (!("class_name" in DataIn)) {
			class_name = sprintf("%s_%s", DataIn.folder_path, classData.class);
        }
		else
		{
			class_name = DataIn.class_name;
		}
        console.log("nameobj is " + util.inspect(classData, {
            showHidden: false,
            depth: null
        }));
        DataIn.id = !("id" in DataIn) ? tools.objectTostring(DataIn, classData.keyName) : tools.numberTostring(DataIn.id);
        if (checkArray.includes(req.params.name)) {
            const primaryKey = classData.primaryKey;
            const databaseId = classData.database_name;
            const additionalId = primaryKey.substring(1);
            const searchAddition = DataIn[additionalId];
            const containerId = DataIn.folder_path + "" + classData.container_name;
            const cosmosClient = new CosmosClient({
                endpoint: cosmos_config,
                key: cosmos_key
            });
            const taskDao = new TaskDao(cosmosClient, databaseId, containerId, primaryKey);
            taskDao.init().then(() => {
                taskDao.getItem(DataIn.id, searchAddition).then(body => {
                    console.log(body);
                    console.log("Check Body " + util.inspect(body, {
                        showHidden: false,
                        depth: null
                    }));
                    console.log("" + classData.lower_name + " " + DataIn.id + ", data: " + util.inspect(body, {
                        showHidden: false,
                        depth: null
                    }) + "");
                    console.log("" + classData.lower_name + " " + DataIn.id + " exists");
                    res.send(tools.responseFormat(null, classData.lower_name + " " + DataIn.id + " exists", true, 200));
                }).catch(err => {
                    console.log("Check Body " + util.inspect(err, {
                        showHidden: false,
                        depth: null
                    }));
                    console.error(err);
                    res.status(404).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + " does not exists", false, 404));
                });
            }).catch(err => {
                console.error(err);
                res.status(404).send(tools.responseFormat(null, "Database couldn't be created", false, 404));
            });
        } else {
            const multi_network = require("../network.js")(configOBJ);
            const result = await multi_network.keyExists(class_name, classData.methods.checkExists, DataIn.id);
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
		let class_name = "";
		if (!("class_name" in DataIn)) {
			class_name = sprintf("%s_%s", DataIn.folder_path, classData.class);
        }
		else
		{
			class_name = DataIn.class_name;
		}
        if (checkArray.includes(req.params.name)) {
            const primaryKey = classData.primaryKey;
            const databaseId = classData.database_name;
            const additionalId = primaryKey.substring(1);
            const searchAddition = DataIn[additionalId];
            const containerId = DataIn.folder_path + "" + classData.container_name;
            const cosmosClient = new CosmosClient({
                endpoint: cosmos_config,
                key: cosmos_key
            });
            const taskDao = new TaskDao(cosmosClient, databaseId, containerId, primaryKey);
            taskDao.init().then(() => {
                taskDao.getItem(DataIn.id, searchAddition).then(body => {
                    console.log(body);
                    console.log("Get Body " + util.inspect(body, {
                        showHidden: false,
                        depth: null
                    }));
                    console.log("" + classData.lower_name + " " + DataIn.id + ", data: " + util.inspect(body, {
                        showHidden: false,
                        depth: null
                    }) + "");
                    if (!tools.isEmpty(body)) {
                        console.log("" + classData.lower_name + " " + DataIn.id + ", data: " + util.inspect(body, {
                            showHidden: false,
                            depth: null
                        }) + "");
                        console.log("" + classData.lower_name + " " + DataIn.id + " exists");
                        res.send(tools.responseFormat(body, classData.lower_name + " " + DataIn.id + " exists", true, 200));
                    } else {
                        console.log("Get Body " + util.inspect(err, {
                            showHidden: false,
                            depth: null
                        }));
                        console.error(body);
                        res.status(404).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + " does not exists", false, 404));
                    }
                }).catch(err => {
                    console.log("Get Body " + util.inspect(err, {
                        showHidden: false,
                        depth: null
                    }));
                    console.error(err);
                    res.status(404).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + " does not exists", false, 404));
                });
            }).catch(err => {
                console.error(err);
                res.status(404).send(tools.responseFormat(null, "Database couldn't be created", false, 404));
            });
        } else {
            let configOBJ = tools.configFile(current_path_location, DataIn.folder_path);
            const multi_network = require(current_path_location + "network.js")(configOBJ);
            const result = await multi_network.readKeyValue(class_name, classData.methods.reading, DataIn.id);
            console.log("testing return results: " + result);
            console.log("get " + classData.lower_name + " id " + DataIn.id + " details");
            if (!tools.isEmpty(result)) {
                console.log("" + classData.lower_name + " " + DataIn.id + ", data: " + result + "");
                res.send(tools.responseFormat(result, DataIn.id + " " + classData.displayName + " found", true, 200));
            } else {
                console.log("" + classData.lower_name + " id " + DataIn.id + " does not exists");
                res.status(404).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + " Not found", false, 404));
            }
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
        let class_name = "";
		if (!("class_name" in DataIn)) {
			class_name = sprintf("%s_%s", DataIn.folder_path, classData.class);
        }
		else
		{
			class_name = DataIn.class_name;
		}
        if (checkArray.includes(req.params.name)) {
            const primaryKey = classData.primaryKey;
            const databaseId = classData.database_name;
            const additionalId = primaryKey.substring(1);
            const searchAddition = DataIn[additionalId];
            const containerId = DataIn.folder_path + "" + classData.container_name;
            const cosmosClient = new CosmosClient({
                endpoint: cosmos_config,
                key: cosmos_key
            });
            const taskDao = new TaskDao(cosmosClient, databaseId, containerId, primaryKey);
            taskDao.init().then(() => {
                taskDao.deleteItem(DataIn.id, searchAddition).then(body => {
                    console.log(body);
                    console.log("Delete Body " + util.inspect(body, {
                        showHidden: false,
                        depth: null
                    }));
                    console.log("" + classData.lower_name + " " + DataIn.id + ", data: " + util.inspect(body, {
                        showHidden: false,
                        depth: null
                    }) + "");
                    if (!tools.isEmpty(body)) {
                        console.log("" + classData.lower_name + " " + DataIn.id + ", data: " + util.inspect(body, {
                            showHidden: false,
                            depth: null
                        }) + "");
                        console.log("" + classData.lower_name + " " + DataIn.id + " deleted");
                        res.send(tools.responseFormat(body, classData.lower_name + " " + DataIn.id + " deleted", true, 200));
                    } else {
                        console.log("Delete Body " + util.inspect(err, {
                            showHidden: false,
                            depth: null
                        }));
                        console.error(body);
                        res.status(404).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + " does not exists", false, 404));
                    }
                }).catch(err => {
                    console.log("Get Body " + util.inspect(err, {
                        showHidden: false,
                        depth: null
                    }));
                    console.error(err);
                    res.status(404).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + " does not exists", false, 404));
                });
            }).catch(err => {
                console.error(err);
                res.status(404).send(tools.responseFormat(null, "Database couldn't be created", false, 404));
            });
        } else {
            let configOBJ = tools.configFile(current_path_location, DataIn.folder_path);
            const multi_network = require(current_path_location + "network.js")(configOBJ);
            const result = await multi_network.deleteKeyValue(class_name, classData.methods.reading, DataIn.id);
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
        let class_name = "";
		if (!("class_name" in DataIn)) {
			class_name = sprintf("%s_%s", DataIn.folder_path, classData.class);
        }
		else
		{
			class_name = DataIn.class_name;
		}
        console.log("class results: " + class_name);
        let id_variable = "";
        if (!("id" in DataIn)) {
            id_variable = DataIn[classData.keyName];
        } else {
            id_variable = DataIn.id;
        }
        DataIn.id = id_variable;
        const primaryKey = classData.primaryKey;
        const databaseId = classData.database_name;
        let containerId = DataIn.folder_path + "" + classData.container_name;
        if (checkArray.includes(req.params.name)) {
            const cosmosClient = new CosmosClient({
                endpoint: cosmos_config,
                key: cosmos_key
            });
            delete DataIn.folder_path;
            console.log("" + classData.lower_name + " id results: " + id_variable);
            console.log("received results: " + JSON.stringify(DataIn));
            console.log("adding " + classData.lower_name + " id " + id_variable + " with following data " + JSON.stringify(DataIn) + "");
            const taskDao = new TaskDao(cosmosClient, databaseId, containerId, primaryKey);
            taskDao.init().then(() => {
                taskDao.addItem(DataIn).then(body => {
                    console.log("Add Body " + util.inspect(body, {
                        showHidden: false,
                        depth: null
                    }));
                    console.log("add Body: " + util.inspect(body, {
                        showHidden: false,
                        depth: null
                    }));
                    console.log("" + classData.displayName + " " + id_variable + " was added");
                    res.send(tools.responseFormat(null, classData.displayName + " was added", true, 200));
                }).catch(err => {
                    console.error("add Error: " + util.inspect(err, {
                        showHidden: false,
                        depth: null
                    }));
                    console.error(err);
                    res.status(404).send(tools.responseFormat(null, classData.displayName + " was not added", false, 404));
                });
            }).catch(err => {
                console.error("Add Error " + util.inspect(err, {
                    showHidden: false,
                    depth: null
                }));
                console.error(err);
                res.status(404).send(tools.responseFormat(null, "Database couldn't be created", false, 404));
            });
        } else {
            let configOBJ = tools.configFile(current_path_location, DataIn.folder_path);
            const multi_network = require("../network.js")(configOBJ);
            delete DataIn.folder_path;
            let keychk = tools.objectTostring(DataIn, classData.keyName);
            console.log("" + classData.lower_name + " id results: " + keychk);
            console.log("received results: " + JSON.stringify(DataIn));
            console.log("adding " + classData.lower_name + " id " + keychk + " with following data " + JSON.stringify(DataIn) + "");

            const result = await multi_network.createKeyValue(class_name, classData.methods.creating, keychk, JSON.stringify(DataIn));
            console.log("get results: " + result);
            if (tools.checkBool(result)) {
                res.send(tools.responseFormat(result, DataIn.id + " " + classData.displayName + " was added", true, 200));
                console.log("" + classData.displayName + " " + keychk + " was added");
            } else {
                console.error(result);
                res.status(404).send(tools.responseFormat(result, DataIn.id + " " + classData.displayName + " was not added", false, 404));
            }
        }

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
        let class_name = "";
		if (!("class_name" in DataIn)) {
			class_name = sprintf("%s_%s", DataIn.folder_path, classData.class);
        }
		else
		{
			class_name = DataIn.class_name;
		}
        let class_name = sprintf("%s_%s", DataIn.folder_path, classData.class);
        console.log("class results: " + class_name);
        let id_variable = "";
        if (!("id" in DataIn)) {
            id_variable = DataIn[classData.keyName];
        } else {
            id_variable = DataIn.id;
        }
        DataIn.id = id_variable;
        const primaryKey = classData.primaryKey;
        const databaseId = classData.database_name;
        let containerId = DataIn.folder_path + "" + classData.container_name;
        if (checkArray.includes(req.params.name)) {
            delete DataIn.folder_path;
            const taskDao = new TaskDao(cosmosClient, databaseId, containerId, primaryKey);
            taskDao.init().then(() => {
                taskDao.updateItem(DataIn.id, searchAddition, DataIn).then(body => {
                    console.log("Update Body " + util.inspect(body, {
                        showHidden: false,
                        depth: null
                    }));
                    console.log("Update Body: " + util.inspect(body, {
                        showHidden: false,
                        depth: null
                    }));
                    console.log("" + classData.displayName + " " + id_variable + " was updated");
                    res.send(tools.responseFormat(null, classData.displayName + " was updated", true, 200));
                }).catch(err => {
                    console.error("Update Error: " + util.inspect(err, {
                        showHidden: false,
                        depth: null
                    }));
                    console.error(err);
                    res.status(404).send(tools.responseFormat(null, classData.displayName + " was not updated", false, 404));
                });
            }).catch(err => {
                console.error("Get Body " + util.inspect(err, {
                    showHidden: false,
                    depth: null
                }));
                console.error(err);
                res.status(404).send(tools.responseFormat(null, "Database couldn't be created", false, 404));
            });
        } else {
            let configOBJ = tools.configFile(current_path_location, DataIn.folder_path);
            const multi_network = require("../network.js")(configOBJ);
            let keychk = tools.objectTostring(DataIn, classData.keyName);
            delete DataIn.folder_path;
            console.log("" + classData.lower_name + " id results: " + keychk);
            console.log("received results: " + JSON.stringify(DataIn));
            console.log("updating " + classData.lower_name + " id " + keychk + " with following data " + JSON.stringify(DataIn) + "");
            const result = await multi_network.updateKeyValue(class_name, classData.methods.updating, keychk, JSON.stringify(DataIn));
            console.log("get results: " + result);
            if (tools.checkBool(result)) {
                res.send(tools.responseFormat(result, DataIn.id + " " + classData.displayName + " was updated", true, 200));
                console.log("" + classData.displayName + " " + keychk + " was updated");
            } else {
                console.error(result);
                res.status(404).send(tools.responseFormat(null, classData.displayName + " was not updated", false, 404));
            }
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
        let class_name = "";
		if (!("class_name" in DataIn)) {
			class_name = sprintf("%s_%s", DataIn.folder_path, classData.class);
        }
		else
		{
			class_name = DataIn.class_name;
		}
        let configOBJ = tools.configFile(current_path_location, DataIn.folder_path);
        const multi_network = require("../network.js")(configOBJ);
        console.log("" + classData.lower_name + " id results: " + DataIn.id);
        console.log("getting " + classData.lower_name + " history " + DataIn.id + "");
        const result = await multi_network.getHistoryForKey(class_name, classData.methods.get_history, DataIn.id);
        console.log("testing return results: " + result);
        console.log("get " + classData.lower_name + " id " + DataIn.id + " history");
        console.log("testing script results: " + result);
        if (tools.isEmpty(result)) {
            console.error(DataIn.id + " " + classData.displayName + " not exists or no history available");
            res.status(404).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + " not exists or no history available", false, 404));
        } else {
            let jsonArray = [];
            const js = JSON.parse(result);
            let sb = new StringBuilder();
            js.data.toString().split(",").forEach(s => sb.append(String.fromCharCode(parseInt(s, 10))));
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

            chnged = chnged.replace(/ *\[[^\]]*]/, "");
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
                if ("Timestamp" in element) {
                    let TStamp = element.Timestamp;
                    if ("seconds" in TStamp) {
                        let TStampSec = TStamp.seconds;
                        const dt = new Date(parseInt(TStampSec.low) * 1000);
                        element.datetime = dt.toISOString();
                        element.formatted_datetime = dateFormat(dt.toISOString(), "yyyy-mm-dd h:MM:ss TT");
                        jsonArray.push(element);
                    }
                }
            });
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
        let class_name = "";
		if (!("class_name" in DataIn)) {
			class_name = sprintf("%s_%s", DataIn.folder_path, classData.class);
        }
		else
		{
			class_name = DataIn.class_name;
		}
        let range_from = DataIn.range_from;
        let range_to = DataIn.range_to;
        if (checkArray.includes(req.params.name)) {
            const querySpec = {
                query: "SELECT * FROM root r WHERE r.id >= @idstart AND r.id <= @idend",
                parameters: [{
                    name: "@idstart",
                    value: DataIn.range_from
                }, {
                    name: "@idend",
                    value: DataIn.range_to
                }]
            };

            const primaryKey = classData.primaryKey;
            const databaseId = classData.database_name;
            let containerId = DataIn.folder_path + "" + classData.container_name;
            const cosmosClient = new CosmosClient({
                endpoint: cosmos_config,
                key: cosmos_key
            });
            const taskDao = new TaskDao(cosmosClient, databaseId, containerId, primaryKey);
            taskDao.init().then(() => {
                taskDao.find(querySpec).then(body => {
                    console.log("Query Body " + util.inspect(body, {
                        showHidden: false,
                        depth: null
                    }));
                    console.log("Query Body: " + util.inspect(body, {
                        showHidden: false,
                        depth: null
                    }));
                    console.log("check " + classData.displayName + " for a range of ids from " + DataIn.range_from + " to " + DataIn.range_to + "");
                    console.log(JSON.stringify(body));
                    if (!tools.isEmpty(body)) {
                        res.send(tools.responseFormat(body, "", true, 200));
                    } else {
                        res.status(404).send(tools.responseFormat(null, classData.displayName + " ranges were not found", false, 400));
                    }
                }).catch(err => {
                    console.error("Query Error: " + util.inspect(err, {
                        showHidden: false,
                        depth: null
                    }));
                    console.error(err);
                    console.error("" + classData.displayName + " query result empty");
                    res.status(404).send(tools.responseFormat(null, classData.displayName + " query returned no result", false, 400));
                });
            }).catch(err => {
                console.error("Query  Body " + util.inspect(err, {
                    showHidden: false,
                    depth: null
                }));
                console.error(err);
                res.status(404).send(tools.responseFormat(null, "Database couldn't be created", false, 404));
            });
        } else {
            let configOBJ = tools.configFile(current_path_location, DataIn.folder_path);
            const multi_network = require("../network.js")(configOBJ);
            console.log("" + classData.displayName + " id : " + DataIn.id);
            console.log("check " + classData.displayName + " for a range of ids from " + range_from + " to " + range_to + "");
            const result = await multi_network.getStateByRange(class_name, classData.methods.get_state_by_range, range_from, range_to);
            console.log("testing script results: " + result);
            if (tools.isEmpty(result)) {
                console.error("" + classData.displayName + "  range from " + range_from + " to " + range_to + " does not exists");
                res.status(404).send(tools.responseFormat(null, classData.displayName + "  range from " + range_from + " to " + range_to + " does not exists", false, 404));
            } else {
                console.log(JSON.stringify(result));
                res.send(tools.responseFormat(result, "", true, 200));
            }
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

        let class_name = "";
		if (!("class_name" in DataIn)) {
			class_name = sprintf("%s_%s", DataIn.folder_path, classData.class);
        }
		else
		{
			class_name = DataIn.class_name;
		}
        const primaryKey = classData.primaryKey;
        const databaseId = classData.database_name;
        let containerId = DataIn.folder_path + "" + classData.container_name;
        if (checkArray.includes(req.params.name)) {
            delete DataIn.folder_path;
            const cosmosClient = new CosmosClient({
                endpoint: cosmos_config,
                key: cosmos_key
            });
            const taskDao = new TaskDao(cosmosClient, databaseId, containerId, primaryKey);
            taskDao.init().then(() => {
                taskDao.find(DataIn.querystring).then(body => {
                    console.log("Query Body " + util.inspect(body, {
                        showHidden: false,
                        depth: null
                    }));
                    console.log("Query Body: " + util.inspect(body, {
                        showHidden: false,
                        depth: null
                    }));
                    console.log(JSON.stringify(body));
                    if (!tools.isEmpty(body)) {
                        res.send(tools.responseFormat(body, "", true, 200));
                    } else {
                        res.status(404).send(tools.responseFormat(null, classData.displayName + " query returned no result", false, 400));
                    }
                }).catch(err => {
                    console.error("Query Error: " + util.inspect(err, {
                        showHidden: false,
                        depth: null
                    }));
                    console.error(err);
                    console.error("" + classData.displayName + " query result empty");
                    res.status(404).send(tools.responseFormat(null, classData.displayName + " query returned no result", false, 400));
                });
            }).catch(err => {
                console.log("Query  Body " + util.inspect(err, {
                    showHidden: false,
                    depth: null
                }));
                console.error(err);
                res.status(404).send(tools.responseFormat(null, "Database couldn't be created", false, 404));
            });
        } else {
            let configOBJ = tools.configFile(current_path_location, DataIn.folder_path);
            const multi_network = require("../network.js")(configOBJ);
            console.log("check " + classData.displayName + "  with queryString with query:" + DataIn.query_string + "");
            console.log("" + classData.displayName + " query results: " + DataIn.query_string);
            const result = await multi_network.getQueryResult(class_name, classData.methods.get_query_result, DataIn.query_string);
            console.log("received results: " + result);
            if (tools.isEmpty(result)) {
                console.error("" + classData.displayName + "  query result empty");
                res.status(404).send(tools.responseFormat(null, classData.displayName + " query returned no result", false, 404));
            } else {
                let jsonArray = [];
                const jsarr = JSON.parse(result);
                console.log("received json results: " + jsarr);
                jsarr.forEach(function (element) {
                    let Valuestr = element.Value;
                    jsonArray.push(Valuestr);
                });
                console.log(JSON.stringify(result));
                res.send(tools.responseFormat(JSON.stringify(jsonArray), "", true, 200));
            }
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