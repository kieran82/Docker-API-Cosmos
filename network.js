'use strict';

const {FileSystemWallet, Gateway} = require('fabric-network');
module.exports = function(configOBJ) {
	var module = {};
	var userName = configOBJ.userName;
	var gatewayDiscovery = configOBJ.gatewayDiscovery;
	const theChannel = configOBJ.channel_name;
	var ccp = configOBJ.ccp;
	
	// Common method to get a Wallet
	const getWallet = () => {
		const walletPath = configOBJ.wallet_path;
		const wallet = new FileSystemWallet(walletPath);
		console.log(`Wallet path: ${walletPath}`);
		return wallet;
	}

	module.keyExists = async (contractName, func, keyID) => {
		try {
			const wallet = getWallet();
			const exists = await wallet.exists(userName);
			
			console.log(`This is the key ID ${keyID}`);
			console.log(`This is the contract being used ${contractName}`);
			
			if (!exists) {
				console.log(`An identity for the user ${userName} does not exist in the wallet`);
				return;
			}
			
			// Get the contract from the network.
			const gateway = new Gateway();
			await gateway.connect(ccp, { wallet, identity: userName, discovery: gatewayDiscovery });
			const network = await gateway.getNetwork(theChannel);
			const contract = network.getContract(contractName);
			
			// Submit the specified transaction.
			const retVal = await contract.submitTransaction(func, keyID);
			console.log(`Return value is ${retVal}`);
			
			// Disconnect from the gateway.
			await gateway.disconnect();
			return (retVal === true || retVal == "true" ? true : false );
			} catch (error) {
			console.error(`Failed to submit keyExists transaction: ${error}`);
			throw(error);
		}
	}
	
	module.createKeyValue = async (contractName, func, keyID, value) => {
		try {
			const wallet = getWallet();
			const exists = await wallet.exists(userName);
			
			console.log(`This is the Key ID ${keyID}`);
			
			if (!exists) {
				console.log(`An identity for the user ${userName} does not exist in the wallet`);
				return;
			}
			
			// Get the contract from the network.
			const gateway = new Gateway();
			await gateway.connect(ccp, { wallet, identity: userName, discovery: gatewayDiscovery });
			const network = await gateway.getNetwork(theChannel);
			const contract = network.getContract(contractName);
			
			// Submit the specified transaction.
			await contract.submitTransaction(func, keyID, value);
			console.log(`Transaction has been submitted`);
			
			// Disconnect from the gateway.
			await gateway.disconnect();
			return true;
			} catch (error) {
			console.error(`Failed to submit createKeyValue transaction: ${error}`);
			throw(error);

		}
	}

	module.updateKeyValue = async (contractName, func, keyID, value) => {
		try {
			const wallet = getWallet();
			const exists = await wallet.exists(userName);
			
			console.log(`This is the Key ID ${keyID}`);
			
			if (!exists) {
				console.log(`An identity for the user ${userName} does not exist in the wallet`);
				return;
			}
			
			// Get the contract from the network.
			const gateway = new Gateway();
			await gateway.connect(ccp, { wallet, identity: userName, discovery: gatewayDiscovery });
			const network = await gateway.getNetwork(theChannel);
			const contract = network.getContract(contractName);
			
			await contract.submitTransaction(func, keyID, value);
			console.log('Transaction has been submitted');
			
			// Disconnect from the gateway.
			await gateway.disconnect();
			return true;
			} catch (error) {
			console.error(`Failed to submit transaction: ${error}`);
			throw(error);
		}
	}
	
	module.readKeyValue = async (contractName, func, keyID) => {
		
		try {
			const wallet = getWallet();
			const exists = await wallet.exists(userName);
			
			console.log(`This is the Key ID ${keyID}`);
			
			if (!exists) {
				console.log(`An identity for the user ${userName} does not exist in the wallet`);
				return;
			}
			
			// Get the contract from the network.
			const gateway = new Gateway();
			await gateway.connect(ccp, { wallet, identity: userName, discovery: gatewayDiscovery });
			const network = await gateway.getNetwork(theChannel);
			const contract = network.getContract(contractName);
			
			// Submit the specified transaction.
			const result = await contract.evaluateTransaction(func, keyID);
			console.log(`Transaction has been submitted:\n ${result}`);
			
			// Disconnect from the gateway.
			await gateway.disconnect();
			return result;
			
			} catch (error) {
			console.error(`Failed to evaluate transaction: ${error}`);
			throw(error);
		}
	}
	
	module.deleteKeyValue = async (contractName, func, keyID) => {
		try {
			const wallet = getWallet();
			const exists = await wallet.exists(userName);
			
			if (!exists) {
				console.log(`An identity for the user ${userName} does not exist in the wallet`);
				return;
			}
			
			// Get the contract from the network.
			const gateway = new Gateway();
			await gateway.connect(ccp, { wallet, identity: userName, discovery: gatewayDiscovery });
			const network = await gateway.getNetwork(theChannel);
			const contract = network.getContract(contractName);
			
			// Submit the specified transaction.
			await contract.submitTransaction(func, keyID);
			console.log(`Item key ${keyID} has been deleted`);
			
			// Disconnect from the gateway.
			await gateway.disconnect();
			return true;
			} catch (error) {
			console.error(`Failed to submit transaction: ${error}`);
			throw(error);
		}
	}
	
	module.getHistoryForKey = async (contractName, func, keyID) => {
		try {
			const wallet = getWallet();
			const exists = await wallet.exists(userName);
			
			if (!exists) {
				console.log(`An identity for the user ${userName} does not exist in the wallet`);
				return;
			}
			
			// Get the contract from the network.
			const gateway = new Gateway();
			await gateway.connect(ccp, { wallet, identity: userName, discovery: gatewayDiscovery });
			const network = await gateway.getNetwork(theChannel);
			const contract = network.getContract(contractName);
			
			// Submit the specified transaction.
			const result = await contract.submitTransaction(func, keyID);
			// console.log(`Transaction has been submitted:\n ${result}`);
			
			// Disconnect from the gateway.
			await gateway.disconnect();
			
			return result;
			
			} catch (error) {
			console.error(`Failed to submit transaction: ${error}`);
			throw(error);
		}
	}
	
	module.getStateByRange = async (contractName, func, startId, endId) => {
		try {
			const wallet = getWallet();
			const exists = await wallet.exists(userName);
			
			if (!exists) {
				console.log(`An identity for the user ${userName} does not exist in the wallet`);
				return;
			}
			
			// Get the contract from the network.
			const gateway = new Gateway();
			await gateway.connect(ccp, { wallet, identity: userName, discovery: gatewayDiscovery });
			const network = await gateway.getNetwork(theChannel);
			const contract = network.getContract(contractName);
			
			// Submit the specified transaction.
			const result = await contract.submitTransaction(func, startId, endId);
			
			// Disconnect from the gateway.
			await gateway.disconnect();
			// Returning the raw result here and letting the client software handle the buffer.
			return result;
			
			} catch (error) {
			console.error(`Failed to submit transaction: ${error}`);
			throw(error);
		}
	}
	
	module.getQueryResult = async (contractName, func, query) => {
		try {
			const wallet = getWallet();
			const exists = await wallet.exists(userName);
			
			if (!exists) {
				console.log(`An identity for the user ${userName} does not exist in the wallet`);
				return;
			}
			
			// Get the contract from the network.
			const gateway = new Gateway();
			await gateway.connect(ccp, { wallet, identity: userName, discovery: gatewayDiscovery });
			const network = await gateway.getNetwork(theChannel);
			const contract = network.getContract(contractName);
			
			// Submit the specified transaction.
			const result = await contract.submitTransaction(func, query);
			
			// Disconnect from the gateway.
			await gateway.disconnect();
			
			return result;
			
			} catch (error) {
			console.error(`Failed to submit transaction: ${error}`);
			throw(error);
		}
	}	

	return module;
};