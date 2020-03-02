const fs = require('fs');
const sprintf = require('sprintf-js').sprintf;

module.exports = {
	configFile: function (parentpath, name, localblockchain = false) {
		let config_name = localblockchain ? "local_config" : "config";
		let configPath = sprintf('%sconfiguration/%s/%s.json', parentpath, name, config_name);
		console.log("path: " + configPath);
		let obj = {};
		obj.config_path = configPath;
		let configJSON = fs.readFileSync(configPath, 'utf8');
		let config = JSON.parse(configJSON);
		obj.config_json_array = config;
		obj.connection_file_path = sprintf('%sconfiguration/%s/%s', parentpath, name, config.connection_file);
		let connection_file = sprintf('%sconfiguration/%s/%s', parentpath, name, config.connection_file);
		obj.connection_file = connection_file;
		let userName = config.userName;
		let gatewayDiscovery = config.gatewayDiscovery;
		obj.userName = userName;
		obj.gatewayDiscovery = gatewayDiscovery;
		let theWallet = sprintf('%sconfiguration/%s%s', parentpath, name, config.wallet);
		obj.wallet_path = theWallet;
		obj.channel_name = config.channel;
		let ccp = JSON.parse(fs.readFileSync(connection_file, 'utf8'));
		obj.ccp = ccp;
		return obj;
	},
	objectTostring: function (obj, key) {
		let str = obj[key];
		if (typeof str == "number" || (typeof str == "object" && str.constructor === Number)) {
			return sprintf('%s', str);
		}

		return str;
	},
	numberTostring: function (str) {
		if (typeof str == "number" || (typeof str == "object" && str.constructor === Number)) {
			return sprintf('%s', str);
		}

		return str;
	},
	responseFormat: function (data=null,message=null,success=true,status_code=200) {
	let	response = {
			'success': success,
			'message': message,
			'data': data,
			'status_code': status_code,
		};

		return response;
	},	
	IsJsonString: function (str) {
		try {
			JSON.parse(str);
		}
		catch (e) {
			return false;
		}
		return true;
	},
	isNumeric: function (n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	},
	isEmpty: function (val) {
		//check for empty object {}, array []
		if (val !== null && typeof val === 'object') {
			if (Object.keys(val).length === 0) {
				return true;
			}
		}
		//check for undefined, null and "" 
		else if (val == null || val === "") {
			return true;
		}
		return false;
	},
	checkBool: function (bool) {
		return typeof bool === 'boolean' ||
			(typeof bool === 'object' &&
				bool !== null &&
				typeof bool.valueOf() === 'boolean');
	},
	makeBoolWhateverItIs: function (input) {
		if (typeof input == "boolean") {
			return input;
		 } else if (typeof input == "string") {
			return input == "true";  
		 }
		 return false;
	 },
	 isString: function (o) {
		return typeof o == "string" || (typeof o == "object" && o.constructor === String);
	 },
	 convertJSONString: function (o) {
		 if(!module.exports.IsJsonString(o))
		 {
			 return o;
		 }
		return JSON.parse(o);
	 }	 
};