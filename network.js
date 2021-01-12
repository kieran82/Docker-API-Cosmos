"use strict";
const tools = require("./src/func");
const log4js = require('log4js');
let logpath = process.env.LOGFILEPATH;
log4js.configure({
    appenders: {
        BlockchainFile: { type: 'file', filename: logpath, maxLogSize: 4194304, backups: 10, keepFileExt: true, compress: true, daysToKeep: 20 }
    },
    categories: {
        default: { appenders: ['BlockchainFile'], level: 'trace' }
    }
});
const logger = log4js.getLogger('BlockchainFile');
const { FileSystemWallet, Gateway } = require("fabric-network");
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
        logger.info(`Wallet path: ${walletPath}`);
        return wallet;
    };

    module.keyExists = async(contractName, func, keyID) => {
        try {
            const wallet = getWallet();
            const exists = await wallet.exists(userName);

            logger.info(`This is the key ID ${keyID}`);
            logger.info(`This is the contract being used ${contractName}`);

            if (!exists) {
                logger.info(
                    `An identity for the user ${userName} does not exist in the wallet`
                );
                throw new "An identity for the user ${userName} does not exist in the wallet";
            }

            // Get the contract from the network.
            const gateway = new Gateway();
            await gateway.connect(ccp, {
                wallet,
                identity: userName,
                discovery: gatewayDiscovery
            });
            try {
                const network = await gateway.getNetwork(theChannel);
                const contract = network.getContract(contractName);

                // Submit the specified transaction.
                const retVal = await contract.evaluateTransaction(func, keyID);
                logger.info(`Return value is ${retVal}`);
                logger.info(`Boolean value is ${Boolean(retVal)}`);
                // Disconnect from the gateway.
                await gateway.disconnect();
                return Boolean(retVal);
            } catch (error) {
                throw error;
            }
        } catch (error) {
            console.error(`Failed to submit keyExists transaction: ${error}`);
            throw error;
        }
    };

    module.createKeyValue = async(contractName, func, keyID, value) => {
        try {
            const wallet = getWallet();
            const exists = await wallet.exists(userName);

            logger.info(`This is the Key ID ${keyID}`);

            if (!exists) {
                logger.info(
                    `An identity for the user ${userName} does not exist in the wallet`
                );
                throw new "An identity for the user ${userName} does not exist in the wallet";
            }

            // Get the contract from the network.
            const gateway = new Gateway();
            await gateway.connect(ccp, {
                wallet,
                identity: userName,
                discovery: gatewayDiscovery
            });

            try {
                const network = await gateway.getNetwork(theChannel);
                const contract = network.getContract(contractName);

                // Submit the specified transaction.
                await contract.submitTransaction(func, keyID, value);
                logger.info(`Transaction has been submitted`);

                // Disconnect from the gateway.
                await gateway.disconnect();
                return true;
            } catch (error) {
                throw error;
            }
        } catch (error) {
            console.error(`Failed to submit createKeyValue transaction: ${error}`);
            throw error;
        }
    };

    module.updateKeyValue = async(contractName, func, keyID, value) => {
        try {
            const wallet = getWallet();
            const exists = await wallet.exists(userName);

            logger.info(`This is the Key ID ${keyID}`);

            if (!exists) {
                logger.info(
                    `An identity for the user ${userName} does not exist in the wallet`
                );
                throw new "An identity for the user ${userName} does not exist in the wallet";
            }

            // Get the contract from the network.
            const gateway = new Gateway();
            await gateway.connect(ccp, {
                wallet,
                identity: userName,
                discovery: gatewayDiscovery
            });

            try {
                const network = await gateway.getNetwork(theChannel);
                const contract = network.getContract(contractName);

                // Submit the specified transaction.
                await contract.submitTransaction(func, keyID, value);
                logger.info(`Transaction has been submitted`);

                // Disconnect from the gateway.
                await gateway.disconnect();
                return true;
            } catch (error) {
                throw error;
            }
        } catch (error) {
            console.error(`Failed to submit transaction: ${error}`);
            throw error;
        }
    };

    module.readKeyValue = async(contractName, func, keyID) => {
        try {
            const wallet = getWallet();
            const exists = await wallet.exists(userName);

            logger.info(`This is the Key ID ${keyID}`);

            if (!exists) {
                logger.info(
                    `An identity for the user ${userName} does not exist in the wallet`
                );
                throw new "An identity for the user ${userName} does not exist in the wallet";
            }

            // Get the contract from the network.
            const gateway = new Gateway();
            await gateway.connect(ccp, {
                wallet,
                identity: userName,
                discovery: gatewayDiscovery
            });

            try {
                const network = await gateway.getNetwork(theChannel);
                const contract = network.getContract(contractName);

                // Submit the specified transaction.
                const result = await contract.evaluateTransaction(func, keyID);
                logger.info(`Transaction has been submitted:\n ${result}`);

                // Disconnect from the gateway.
                await gateway.disconnect();
                return result;
            } catch (error) {
                throw error;
            }
        } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            throw error;
        }
    };

    module.deleteKeyValue = async(contractName, func, keyID) => {
        try {
            const wallet = getWallet();
            const exists = await wallet.exists(userName);

            if (!exists) {
                logger.info(
                    `An identity for the user ${userName} does not exist in the wallet`
                );
                throw new "An identity for the user ${userName} does not exist in the wallet";
            }

            // Get the contract from the network.
            const gateway = new Gateway();
            await gateway.connect(ccp, {
                wallet,
                identity: userName,
                discovery: gatewayDiscovery
            });

            try {
                const network = await gateway.getNetwork(theChannel);
                const contract = network.getContract(contractName);

                // Submit the specified transaction.
                await contract.submitTransaction(func, keyID);
                logger.info(`Item key ${keyID} has been deleted`);

                // Disconnect from the gateway.
                await gateway.disconnect();
                return true;
            } catch (error) {
                throw error;
            }
        } catch (error) {
            console.error(`Failed to submit transaction: ${error}`);
            throw error;
        }
    };

    module.getHistoryForKey = async(contractName, func, keyID) => {
        try {
            const wallet = getWallet();
            const exists = await wallet.exists(userName);

            if (!exists) {
                logger.info(
                    `An identity for the user ${userName} does not exist in the wallet`
                );
                throw new "An identity for the user ${userName} does not exist in the wallet";
            }

            // Get the contract from the network.
            const gateway = new Gateway();
            await gateway.connect(ccp, {
                wallet,
                identity: userName,
                discovery: gatewayDiscovery
            });

            try {
                const network = await gateway.getNetwork(theChannel);
                const contract = network.getContract(contractName);

                // Submit the specified transaction.
                const result = await contract.submitTransaction(func, keyID);
                // logger.info(`Transaction has been submitted:\n ${result}`);

                // Disconnect from the gateway.
                await gateway.disconnect();

                return result;
            } catch (error) {
                throw error;
            }
        } catch (error) {
            console.error(`Failed to submit transaction: ${error}`);
            throw error;
        }
    };

    module.getStateByRange = async(contractName, func, startId, endId) => {
        try {
            const wallet = getWallet();
            const exists = await wallet.exists(userName);

            if (!exists) {
                logger.info(
                    `An identity for the user ${userName} does not exist in the wallet`
                );
                throw new "An identity for the user ${userName} does not exist in the wallet";
            }

            // Get the contract from the network.
            const gateway = new Gateway();
            await gateway.connect(ccp, {
                wallet,
                identity: userName,
                discovery: gatewayDiscovery
            });

            try {
                const network = await gateway.getNetwork(theChannel);
                const contract = network.getContract(contractName);

                // Submit the specified transaction.
                const result = await contract.submitTransaction(func, startId, endId);

                // Disconnect from the gateway.
                await gateway.disconnect();
                // Returning the raw result here and letting the client software handle the buffer.
                return result;
            } catch (error) {
                throw error;
            }
        } catch (error) {
            console.error(`Failed to submit transaction: ${error}`);
            throw error;
        }
    };

    module.getQueryResult = async(contractName, func, query) => {
        try {
            const wallet = getWallet();
            const exists = await wallet.exists(userName);

            if (!exists) {
                logger.info(
                    `An identity for the user ${userName} does not exist in the wallet`
                );
                throw new "An identity for the user ${userName} does not exist in the wallet";
            }

            // Get the contract from the network.
            const gateway = new Gateway();
            await gateway.connect(ccp, {
                wallet,
                identity: userName,
                discovery: gatewayDiscovery
            });

            try {
                const network = await gateway.getNetwork(theChannel);
                const contract = network.getContract(contractName);

                // Submit the specified transaction.
                const result = await contract.submitTransaction(func, query);

                // Disconnect from the gateway.
                await gateway.disconnect();

                return result;
            } catch (error) {
                throw error;
            }
        } catch (error) {
            console.error(`Failed to submit transaction: ${error}`);
            throw error;
        }
    };

    return module;
};