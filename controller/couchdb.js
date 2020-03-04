require("dotenv").config();
const CosmosClient = require("@azure/cosmos").CosmosClient;
const tools = require("../src/func");
const asyncRoute = require("route-async");
const fs = require("fs");
const util = require("util");
const TaskDao = require("../models/taskDao");
let scontents = fs.readFileSync("site_config.json");
import parseBearerToken from "parse-bearer-token";
let jsoncontents = JSON.parse(scontents);
let current_path_location = jsoncontents.work_path;
let cosmos_config = jsoncontents.config_url;
let cosmos_key = jsoncontents.config_key;
let contents = fs.readFileSync(current_path_location + "json/blockchain_config.json");
let jsonContent = JSON.parse(contents);
const checkroute = async (req, res) => {
    try {
        // const token = parseBearerToken(req);
        // if (! token) {
        //     res.status(401).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + "token missing", false, 401));
        // } else if (token != process.env.JWT_SECRET) {
        //     res.status(401).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + "token invalid", false, 401));
        // }

        let DataIn = req.body;
        console.log("name: " + req.params.name);
        console.log("folder: " + DataIn.folder_path);
        console.log("id: " + DataIn.id);

        const classData = jsonContent[req.params.name];
        const primaryKey = classData.primaryKey;
        const databaseId = classData.database_name;
        const additionalId = primaryKey.substring(1);
        const searchAddition = DataIn[additionalId];
        const containerId = DataIn.folder_path + "" + classData.container_name;
        const cosmosClient = new CosmosClient({endpoint: cosmos_config, key: cosmos_key});
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
                console.error("Check Error " + util.inspect(err, {
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
    } catch (e) { // this will eventually be handled by your error handling middleware
        console.error(e);
        res.status(404).send(tools.responseFormat(null, "Error Occurred " + e, false, 404));
    }
};

const getitemroute = async (req, res) => {
    try {
        const token = parseBearerToken(req);
        consol.log("token is " + token);
        const DataIn = tools.convertJSONString(req.body);
        const classData = jsonContent[req.params.name];
        console.log("" + classData.lower_name + " id results: " + DataIn.id);
        console.log("getting " + classData.lower_name + " id " + DataIn.id + "");
        const primaryKey = classData.primaryKey;
        const additionalId = primaryKey.substring(1);
        const searchAddition = DataIn[additionalId];
        const databaseId = classData.database_name;
        const containerId = DataIn.folder_path + "" + classData.container_name;
        const cosmosClient = new CosmosClient({endpoint: cosmos_config, key: cosmos_key});

        const querySpec = {
            query: "SELECT * FROM root r WHERE r.id = @id",
            parameters: [
                {
                    name: "@id",
                    value: DataIn.id
                }
            ]
        };
        console.log("database is " + databaseId);
        console.log("container is " + containerId);
        console.log("addional key is " + additionalId);
        const taskDao = new TaskDao(cosmosClient, databaseId, containerId, primaryKey);
        taskDao.init().then(() => {
            taskDao.getItem(DataIn.id, searchAddition).then(body => {
                console.log(body);
                console.log("Get Body " + util.inspect(body, {
                    showHidden: false,
                    depth: null
                }));
                if (! tools.isEmpty(body)) {
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
                console.error("Get Error " + util.inspect(err, {
                    showHidden: false,
                    depth: null
                }));
                console.error(err);
                res.status(404).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + " does not exists", false, 404));
            });
        }).catch(err => {
            console.error("Init Error" + util.inspect(err, {
                showHidden: false,
                depth: null
            }));
            console.error(err);
            res.status(404).send(tools.responseFormat(null, "Database couldn't be created", false, 404));
        });
    } catch (e) { // this will eventually be handled by your error handling middleware
        console.error(e);
        res.status(404).send(tools.responseFormat(null, "Error Occurred " + e, false, 404));
    }
};

const deleteitemroute = async (req, res) => {
    try {
        // const token = parseBearerToken(req);
        // if (! token) {
        //     res.status(401).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + "token missing", false, 401));
        // } else if (token != process.env.JWT_SECRET) {
        //     res.status(401).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + "token invalid", false, 401));
        // }
        let DataIn = req.body;
        const classData = jsonContent[req.params.name];
        console.log("" + classData.lower_name + " id results: " + DataIn.id);
        console.log("deleting " + classData.lower_name + " id " + DataIn.id + "");
        const primaryKey = classData.primaryKey;
        const databaseId = classData.database_name;
        const additionalId = primaryKey.substring(1);
        const searchAddition = DataIn[additionalId];
        const containerId = DataIn.folder_path + "" + classData.container_name;
        const cosmosClient = new CosmosClient({endpoint: cosmos_config, key: cosmos_key});
        const taskDao = new TaskDao(cosmosClient, databaseId, containerId, primaryKey);
        taskDao.init().then(() => {
            taskDao.deleteItem(DataIn.id, searchAddition).then(body => {
                console.log("Delete Body " + util.inspect(body, {
                    showHidden: false,
                    depth: null
                }));
                console.log("" + classData.lower_name + " " + DataIn.id + ", data: " + util.inspect(body, {
                    showHidden: false,
                    depth: null
                }) + "");
                console.log("" + classData.lower_name + " " + DataIn.id + " deleted");
                res.send(tools.responseFormat(body, classData.lower_name + " " + DataIn.id + " deleted", true, 200));
            }).catch(err => {
                console.error("Get Error " + util.inspect(err, {
                    showHidden: false,
                    depth: null
                }));
                console.error(err);
                res.status(404).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + " couldn't be deleted", false, 404));
            });
        }).catch(err => {
            console.error("Get Error " + util.inspect(err, {
                showHidden: false,
                depth: null
            }));
            console.error(err);
            res.status(404).send(tools.responseFormat(null, "Database couldn't be created", false, 404));
        });
    } catch (e) { // this will eventually be handled by your error handling middleware
        console.error(e);
        res.status(404).send(tools.responseFormat(null, "Error Occurred " + e, false, 404));
    }
};

const additemroute = async (req, res) => {
    try {
        // const token = parseBearerToken(req);
        // if (! token) {
        //     res.status(401).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + "token missing", false, 401));
        // } else if (token != process.env.JWT_SECRET) {
        //     res.status(401).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + "token invalid", false, 401));
        // }
        const DataIn = tools.convertJSONString(req.body);
        console.log("input results: " + JSON.stringify(DataIn));
        const classData = jsonContent[req.params.name];
        let id_variable = "";
        if (!("id" in DataIn)) {
            id_variable = DataIn[classData.keyName];
        } else {
            id_variable = DataIn.id;
        } DataIn.id = id_variable;
        const primaryKey = classData.primaryKey;
        const databaseId = classData.database_name;
        let containerId = DataIn.folder_path + "" + classData.container_name;
        delete DataIn.folder_path;
        const cosmosClient = new CosmosClient({endpoint: cosmos_config, key: cosmos_key});
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
            console.error("add Error " + util.inspect(err, {
                showHidden: false,
                depth: null
            }));
            console.error(err);
            res.status(404).send(tools.responseFormat(null, "Database couldn't be created", false, 404));
        });
    } catch (e) { // this will eventually be handled by your error handling middleware
        console.error(e);
        res.status(404).send(tools.responseFormat(null, "Error Occurred " + e, false, 404));
    }
};

const updateitemroute = async (req, res) => {
    try {
        let DataIn = req.body;
        // const token = parseBearerToken(req);
        // if (! token) {
        //     res.status(401).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + "token missing", false, 401));
        // } else if (token != process.env.JWT_SECRET) {
        //     res.status(401).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + "token invalid", false, 401));
        // }
        const classData = jsonContent[req.params.name];
        const primaryKey = classData.primaryKey;
        const databaseId = classData.database_name;
        let containerId = DataIn.folder_path + "" + classData.container_name;
        delete DataIn.folder_path;
        const additionalId = primaryKey.substring(1);
        const searchAddition = DataIn[additionalId];
        const cosmosClient = new CosmosClient({endpoint: cosmos_config, key: cosmos_key});
        let id_variable = "";
        if (!("id" in DataIn)) {
            id_variable = DataIn[classData.keyName];
        } else {
            id_variable = DataIn.id;
        } DataIn.id = id_variable;
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
            console.error("Update Error " + util.inspect(err, {
                showHidden: false,
                depth: null
            }));
            console.error(err);
            res.status(404).send(tools.responseFormat(null, "Database couldn't be created", false, 404));
        });
    } catch (e) { // this will eventually be handled by your error handling middleware
        console.error(e);
        res.status(404).send(tools.responseFormat(null, "Error Occurred " + e, false, 404));
    }
};

const getQueryroute = async (req, res) => {
    try {
        // const token = parseBearerToken(req);
        // if (! token) {
        //     res.status(401).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + "token missing", false, 401));
        // } else if (token != process.env.JWT_SECRET) {
        //     res.status(401).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + "token invalid", false, 401));
        // }
        let DataIn = req.body;
        if (!("query_string" in DataIn)) {
            console.error("" + classData.displayName + "  querystring does not exists");
            res.status(404).send(tools.responseFormat(null, "The query string does not exists", false, 404));
        }
        const classData = jsonContent[req.params.name];
        const primaryKey = classData.primaryKey;
        const databaseId = classData.database_name;
        let containerId = DataIn.folder_path + "" + classData.container_name;
        delete DataIn.folder_path;

        const querySpec = {
            query: "SELECT * FROM root r WHERE r.id = @id",
            parameters: [
                {
                    name: "@id",
                    value: DataIn.id
                }
            ]
        };

        const cosmosClient = new CosmosClient({endpoint: cosmos_config, key: cosmos_key});
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
                if (! tools.isEmpty(body)) {
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
            console.error("Query Error " + util.inspect(err, {
                showHidden: false,
                depth: null
            }));
            console.error(err);
            console.error(err);
            res.status(404).send(tools.responseFormat(null, "Database couldn't be created", false, 404));
        });
    } catch (e) { // this will eventually be handled by your error handling middleware
        console.error(e);
        res.status(404).send(tools.responseFormat(null, classData.displayName + " query returned no result", false, 404));
    }
};

const getRangeroute = async (req, res) => {
    try {
        // const token = parseBearerToken(req);
        // if (! token) {
        //     res.status(401).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + "token missing", false, 401));
        // } else if (token != process.env.JWT_SECRET) {
        //     res.status(401).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + "token invalid", false, 401));
        // }
        let DataIn = req.body;
        const querySpec = {
            query: "SELECT * FROM root r WHERE r.id >= @idstart AND r.id <= @idend",
            parameters: [
                {
                    name: "@idstart",
                    value: DataIn.range_from
                }, {
                    name: "@idend",
                    value: DataIn.range_to
                }
            ]
        };
        const classData = jsonContent[req.params.name];
        const primaryKey = classData.primaryKey;
        const databaseId = classData.database_name;
        let containerId = DataIn.folder_path + "" + classData.container_name;
        const cosmosClient = new CosmosClient({endpoint: cosmos_config, key: cosmos_key});
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
                if (! tools.isEmpty(body)) {
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
    } catch (e) { // this will eventually be handled by your error handling middleware
        console.error(e);
        res.status(404).send(tools.responseFormat(null, classData.displayName + "  range from " + range_from + " to " + range_to + " does not exists", false, 404));
    }
};

exports.checkExists = asyncRoute(checkroute);
exports.getItem = asyncRoute(getitemroute);
exports.addItem = asyncRoute(additemroute);
exports.deleteItem = asyncRoute(deleteitemroute);
exports.updateItem = asyncRoute(updateitemroute);
exports.getRange = asyncRoute(getRangeroute);
exports.getQueryResult = asyncRoute(getQueryroute);
