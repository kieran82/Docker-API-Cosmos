/*

app.use('/api/couchdb', require('./routes/couchdb'));
app.use('/api/blockchain', require('./routes/blockchain'));
app.use('/api/get', require('./routes/getting'));
app.use('/api/check', require('./routes/checking'));
*/
const fs = require("fs");
const log4js = require("log4js");
const util = require("util");
const TaskDao = require("./models/taskDao");
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
let contents = fs.readFileSync("site_config.json");
let jsoncontents = JSON.parse(contents);
let logpath = jsoncontents.log_file_path;
let current_path_location = jsoncontents.work_path;
console.log(JSON.stringify(contents));

console.log("Check Body " + util.inspect(JSON.parse(contents), {
                    showHidden: false,
                    depth: null
                }));

console.log("config path app " + jsoncontents.config_url + "");
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
logger.info("welcome to verifish");
var server = app.listen(8080, function () {

    var host = server.address().address
    var port = server.address().port

    console.log("App listening at http://%s:%s", host, port);
});
console.log("Hello from verifish web app");
