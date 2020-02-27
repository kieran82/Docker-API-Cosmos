const asyncRoute = require('route-async')
const log4js = require('log4js');
let logpath = process.env.LOGFILEPATH;
const request = require('request');
const rp = require('request-promise');
const sprintf = require('sprintf-js').sprintf;

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

const urlRequest = (option) => {
	return new Promise(
		(resolve, reject) => {
			request.post(option, function (error, response, data) {
				if (error) reject(error);

				let content = JSON.parse(data);
				resolve(content);
			});
		}
	);
};

const logger = log4js.getLogger('VERIAPI');
const checkUserExistsroute = async (req, res) => {
	try {
		console.log("testing script results: " + req.params.id);
		let current_url = sprintf('https://login.veri.fish/Api/public/v1/validate/exists/user/%s', req.params.id);
		let options = {
			uri: current_url,
			auth: {
				'bearer': '2da17b15-1c5c-446c-b39e-1a8d7933f60a'
			},
		};

		rp(options).then(function (body) {
			logger.info('users checking result ' + body);
			res.send(body);
		}).catch(function (err) {
			logger.error('users checking result ' + err);
			res.status(404).json({
				message: err
			});
		});
	} catch (e) {
		//this will eventually be handled by your error handling middleware
		logger.error(e);
		res.status(404).json({
			message: e
		});
	}
};

const checkFipExistsroute = async (req, res) => {
	try {
		let opts = {
			headers: {
				'content-type': 'application/x-www-form-urlencoded'
			},
			url: sprintf('https://login.veri.fish/Api/public/v1/product/fip/exists/%s', req.params.id),
			auth: {
				'bearer': '2da17b15-1c5c-446c-b39e-1a8d7933f60a'
			},
		};

		urlRequest(opts)
			.then(function (body) {
				logger.info('users checking result ' + body);
				res.send(body);
			})
			.catch(function (err) {
				logger.error(err);
				res.statusMessage = err;
				res.status(404).end();
			});
	} catch (e) {
		//this will eventually be handled by your error handling middleware
		logger.error(e);
		res.status(404).json({
			message: e
		});
	}
};

const getBlockchainDetailsroute = async (req, res) => {
	try {
		let opts = {
			headers: {
				'content-type': 'application/x-www-form-urlencoded'
			},
			url: sprintf('https://login.veri.fish/Api/public/v1/request/details/blockchain/%s/%s', req.params.user_ref, req.params.key_ref),
			auth: {
				'bearer': '2da17b15-1c5c-446c-b39e-1a8d7933f60a'
			},
		};

		urlRequest(opts)
			.then(function (body) {
				logger.info('blockchain user reference ' + req.params.user_ref + ', exists');
				res.send(JSON.stringify(body));
			})
			.catch(function (err) {
				logger.error(err);
				res.statusMessage = err;
				res.status(404).end();
			});
	} catch (e) {
		//this will eventually be handled by your error handling middleware
		logger.error(e);
		res.status(404).json({
			message: e
		});
	}
};

exports.checkUserExists = asyncRoute(checkUserExistsroute);
exports.checkFipExists = asyncRoute(checkFipExistsroute);
exports.getBlockchainDetails = asyncRoute(getBlockchainDetailsroute);