const CosmosClient = require("@azure/cosmos").CosmosClient;
const tools = require("../src/func");
const asyncRoute = require("route-async");
const fs = require("fs");
const log4js = require("log4js");
const util = require("util");
const TaskDao = require("../models/taskDao");
let current_path_location = process.env.WORKPATH;
let logpath = process.env.LOGFILEPATH;
let cosmos_config = process.env.CONFIGSTRING;
let cosmos_key = process.env.CONFIGKEY;

log4js.configure({
    appenders: {
        VERIAPI: {
            type: "file",
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
            appenders: ["VERIAPI"],
            level: "debug"
        }
    }
});

const logger = log4js.getLogger("VERIAPI");
let contents = fs.readFileSync(current_path_location + "json/blockchain_config.json");

let jsonContent = JSON.parse(contents);
let couchServer = process.env.COUCHDB_SERVER;

async function readContainer(client, databaseId, containerId, itemId) {
    const {resource: containerDefinition} = await client.database(databaseId).container(containerId).item(itemId).read();

    console.log(`Reading container:\n${
        containerDefinition.id
    }\n`);
    return containerDefinition;
}

const checkroute = async (req, res) => {
    try {
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
                logger.debug("Check Body " + util.inspect(body, {
                    showHidden: false,
                    depth: null
                }));
                logger.info("" + classData.lower_name + " " + DataIn.id + ", data: " + util.inspect(body, {
                    showHidden: false,
                    depth: null
                }) + "");
                logger.info("" + classData.lower_name + " " + DataIn.id + " exists");
                res.send(tools.responseFormat(null, classData.lower_name + " " + DataIn.id + " exists", true, 200));
            }).catch(err => {
                logger.debug("Check Body " + util.inspect(err, {
                    showHidden: false,
                    depth: null
                }));
                console.error(err);
                logger.error(err);
                res.status(404).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + " does not exists", false, 404));
            });
        }).catch(err => {
            console.error(err);
            logger.error(err);
            res.status(404).send(tools.responseFormat(null, "Database couldn't be created", false, 404));
        });
    } catch (e) { // this will eventually be handled by your error handling middleware
        logger.error(e);
        res.status(404).send(tools.responseFormat(null, "Error Occurred " + e, false, 404));
    }
};

const getitemroute = async (req, res) => {
    try {
        const DataIn = tools.convertJSONString(req.body);
        const classData = jsonContent[req.params.name];
        console.log("" + classData.lower_name + " id results: " + DataIn.id);
        logger.info("getting " + classData.lower_name + " id " + DataIn.id + "");
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
                logger.debug("Get Body " + util.inspect(body, {
                    showHidden: false,
                    depth: null
                }));
                if(!tools.isEmpty(body))
                {
                    logger.info("" + classData.lower_name + " " + DataIn.id + ", data: " + util.inspect(body, {
                        showHidden: false,
                        depth: null
                    }) + "");
                    logger.info("" + classData.lower_name + " " + DataIn.id + " exists");
                    res.send(tools.responseFormat(body, classData.lower_name + " " + DataIn.id + " exists", true, 200));
                }
                else
                {
                    logger.debug("Get Body " + util.inspect(err, {
                        showHidden: false,
                        depth: null
                    }));
                    console.error(body);
                    logger.error(body);
                    res.status(404).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + " does not exists", false, 404));
                }
                
            }).catch(err => {
                logger.debug("Get Body " + util.inspect(err, {
                    showHidden: false,
                    depth: null
                }));
                console.error(err);
                logger.error(err);
                res.status(404).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + " does not exists", false, 404));
            });
        }).catch(err => {
            logger.debug("Init Body " + util.inspect(err, {
                showHidden: false,
                depth: null
            }));
            console.error(err);
            logger.error(err);
            res.status(404).send(tools.responseFormat(null, "Database couldn't be created", false, 404));
        });
    } catch (e) { // this will eventually be handled by your error handling middleware
        logger.error(e);
        res.status(404).send(tools.responseFormat(null, "Error Occurred " + e, false, 404));
    }
};

const deleteitemroute = async (req, res) => {
    try {
        let DataIn = req.body;
        const classData = jsonContent[req.params.name];
        console.log("" + classData.lower_name + " id results: " + DataIn.id);
        logger.info("deleting " + classData.lower_name + " id " + DataIn.id + "");
        const primaryKey = classData.primaryKey;
        const databaseId = classData.database_name;
        const additionalId = primaryKey.substring(1);
        const searchAddition = DataIn[additionalId];
        const containerId = DataIn.folder_path + "" + classData.container_name;
        const cosmosClient = new CosmosClient({endpoint: cosmos_config, key: cosmos_key});
        const taskDao = new TaskDao(cosmosClient, databaseId, containerId, primaryKey);
        taskDao.init().then(() => {
            taskDao.deleteItem(DataIn.id, searchAddition).then(body => {
                logger.debug("Delete Body " + util.inspect(body, {
                    showHidden: false,
                    depth: null
                }));
                logger.info("" + classData.lower_name + " " + DataIn.id + ", data: " + util.inspect(body, {
                    showHidden: false,
                    depth: null
                }) + "");
                logger.info("" + classData.lower_name + " " + DataIn.id + " deleted");
                res.send(tools.responseFormat(body, classData.lower_name + " " + DataIn.id + " deleted", true, 200));
            }).catch(err => {
                logger.debug("Get Body " + util.inspect(err, {
                    showHidden: false,
                    depth: null
                }));
                console.error(err);
                logger.error(err);
                res.status(404).send(tools.responseFormat(null, DataIn.id + " " + classData.displayName + " couldn't be deleted", false, 404));
            });
        }).catch(err => {
            logger.debug("Get Body " + util.inspect(err, {
                showHidden: false,
                depth: null
            }));
            console.error(err);
            logger.error(err);
            res.status(404).send(tools.responseFormat(null, "Database couldn't be created", false, 404));
        });
    } catch (e) { // this will eventually be handled by your error handling middleware
        logger.error(e);
        res.status(404).send(tools.responseFormat(null, "Error Occurred " + e, false, 404));
    }
};

const additemroute = async (req, res) => {
    try {
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
        logger.info("adding " + classData.lower_name + " id " + id_variable + " with following data " + JSON.stringify(DataIn) + "");
        const taskDao = new TaskDao(cosmosClient, databaseId, containerId, primaryKey);
        taskDao.init().then(() => {
            taskDao.addItem(DataIn).then(body => {
                logger.debug("Add Body " + util.inspect(body, {
                    showHidden: false,
                    depth: null
                }));
                console.log("add Body: " + util.inspect(body, {
                    showHidden: false,
                    depth: null
                }));
                logger.info("" + classData.displayName + " " + id_variable + " was added");
                res.send(tools.responseFormat(null, classData.displayName + " was added", true, 200));
            }).catch(err => {
                console.log("add Error: " + util.inspect(err, {
                    showHidden: false,
                    depth: null
                }));
                logger.error(err);
                res.status(404).send(tools.responseFormat(null, classData.displayName + " was not added", false, 404));
            });
        }).catch(err => {
            logger.debug("Get Body " + util.inspect(err, {
                showHidden: false,
                depth: null
            }));
            console.error(err);
            logger.error(err);
            res.status(404).send(tools.responseFormat(null, "Database couldn't be created", false, 404));
        });
    } catch (e) { // this will eventually be handled by your error handling middleware
        logger.error(e);
        res.status(404).send(tools.responseFormat(null, "Error Occurred " + e, false, 404));
    }
};

const updateitemroute = async (req, res) => {
    try {
        let DataIn = req.body;
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
                logger.debug("Update Body " + util.inspect(body, {
                    showHidden: false,
                    depth: null
                }));
                console.log("Update Body: " + util.inspect(body, {
                    showHidden: false,
                    depth: null
                }));
                logger.info("" + classData.displayName + " " + id_variable + " was updated");
                res.send(tools.responseFormat(null, classData.displayName + " was updated", true, 200));
            }).catch(err => {
                console.log("Update Error: " + util.inspect(err, {
                    showHidden: false,
                    depth: null
                }));
                logger.error(err);
                res.status(404).send(tools.responseFormat(null, classData.displayName + " was not updated", false, 404));
            });
        }).catch(err => {
            logger.debug("Get Body " + util.inspect(err, {
                showHidden: false,
                depth: null
            }));
            console.error(err);
            logger.error(err);
            res.status(404).send(tools.responseFormat(null, "Database couldn't be created", false, 404));
        });
    } catch (e) { // this will eventually be handled by your error handling middleware
        logger.error(e);
        res.status(404).send(tools.responseFormat(null, "Error Occurred " + e, false, 404));
    }
};

const getQueryroute = async (req, res) => {
    try {
        let DataIn = req.body;
        if (!("query_string" in DataIn)) {
            logger.error("" + classData.displayName + "  querystring does not exists");
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
                logger.debug("Query Body " + util.inspect(body, {
                    showHidden: false,
                    depth: null
                }));
                console.log("Query Body: " + util.inspect(body, {
                    showHidden: false,
                    depth: null
                }));
                logger.info(JSON.stringify(body));
                if (! tools.isEmpty(body)) {
                    res.send(tools.responseFormat(body, "", true, 200));
                } else {
                    res.status(404).send(tools.responseFormat(null, classData.displayName + " query returned no result", false, 400));
                }
            }).catch(err => {
                console.log("Query Error: " + util.inspect(err, {
                    showHidden: false,
                    depth: null
                }));
                logger.error(err);
                logger.error("" + classData.displayName + " query result empty");
                res.status(404).send(tools.responseFormat(null, classData.displayName + " query returned no result", false, 400));
            });
        }).catch(err => {
            logger.debug("Query  Body " + util.inspect(err, {
                showHidden: false,
                depth: null
            }));
            console.error(err);
            logger.error(err);
            res.status(404).send(tools.responseFormat(null, "Database couldn't be created", false, 404));
        });
    } catch (e) { // this will eventually be handled by your error handling middleware
        logger.error(e);
        res.status(404).send(tools.responseFormat(null, classData.displayName + " query returned no result", false, 404));
    }
};

const getRangeroute = async (req, res) => {
    try {
        let DataIn = req.body;
        if (!("query_string" in DataIn)) {
            logger.error("" + classData.displayName + "  querystring does not exists");
            res.status(404).send(tools.responseFormat(null, "The query string does not exists", false, 404));
        }
        const classData = jsonContent[req.params.name];
        const primaryKey = classData.primaryKey;
        const databaseId = classData.database_name;
        let containerId = DataIn.folder_path + "" + classData.container_name;
        const cosmosClient = new CosmosClient({endpoint: cosmos_config, key: cosmos_key});
        const taskDao = new TaskDao(cosmosClient, databaseId, containerId, primaryKey);
        taskDao.init().then(() => {
            taskDao.find(DataIn.querystring).then(body => {
                logger.debug("Query Body " + util.inspect(body, {
                    showHidden: false,
                    depth: null
                }));
                console.log("Query Body: " + util.inspect(body, {
                    showHidden: false,
                    depth: null
                }));
                logger.info(JSON.stringify(body));
                if (! tools.isEmpty(body)) {
                    logger.info(JSON.stringify(body));
                    res.send(tools.responseFormat(body, "", true, 200));
                } else {
                    res.status(404).send(tools.responseFormat(null, classData.displayName + "  range from " + range_from + " to " + range_to + " does not exists", false, 404));
                }
            }).catch(err => {
                console.log("Query Error: " + util.inspect(err, {
                    showHidden: false,
                    depth: null
                }));
                logger.error(err);
                logger.error("" + classData.displayName + "  range from " + range_from + " to " + range_to + " does not exists");
                res.status(404).send(tools.responseFormat(null, classData.displayName + "  range from " + range_from + " to " + range_to + " does not exists", false, 404));
            });
        }).catch(err => {
            logger.debug("Get Body " + util.inspect(err, {
                showHidden: false,
                depth: null
            }));
            console.error(err);
            logger.error(err);
            res.status(404).send(tools.responseFormat(null, "Database couldn't be created", false, 404));
        });

        let id_variable = "";
        if (!("id" in DataIn)) {
            id_variable = DataIn[classData.keyName];
        } else {
            id_variable = DataIn.id;
        } DataIn.id = id_variable;
    } catch (e) { // this will eventually be handled by your error handling middleware
        logger.error(e);
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
