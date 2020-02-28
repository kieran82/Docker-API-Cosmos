﻿const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const log4js = require('log4js');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/api/couchdb', require('./routes/couchdb'));
app.use('/api/blockchain', require('./routes/blockchain'));
app.use('/api/get', require('./routes/getting'));
app.use('/api/check', require('./routes/checking'));
let logpath = process.env.LOGFILEPATH;


var server = app.listen(8080, function () {

    var host = server.address().address
    var port = server.address().port

    console.log("App listening at http://%s:%s", host, port);
});
