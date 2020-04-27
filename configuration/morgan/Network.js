'use strict';

const {
  FileSystemWallet,
  Gateway,
  X509WalletMixin,
} = require('fabric-network');
const fs = require('fs');
const path = require('path');

const configPath = path.join(process.cwd(), './config.json');
console.log(`Config path is ${configPath} from web client`);
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);
var connection_file = config.connection_file;
var userName = config.userName;
var gatewayDiscovery = config.gatewayDiscovery;
const theWallet = config.wallet;
const theChannel = config.channel;
const batchSize = Number(config.batchSize);

console.log(`The wallet folder is ${theWallet} and ${userName}`);

// connect to the connection file
const ccpPath = path.join(process.cwd(), connection_file);
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

console.log(`Connection file is ${connection_file} `);

/* ===============================  Test Methods ====================================== */
// Common method to get a Wallet
const getWallet = () => {
  const walletPath = path.join(process.cwd(), theWallet);
  const wallet = new FileSystemWallet(walletPath);
  console.log(`Wallet path: ${walletPath}`);
  return wallet;
};

exports.keyExists = async (contractName, func, keyID) => {
  try {
    const wallet = getWallet();
    const exists = await wallet.exists(userName);

    console.log(`This is the key ID ${keyID}`);
    console.log(`This is the contract being used ${contractName}`);

    if (!exists) {
      console.log(
        `An identity for the user ${userName} does not exist in the wallet`
      );
      return;
    }

    // Get the contract from the network.
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: userName,
      discovery: gatewayDiscovery,
    });
    const network = await gateway.getNetwork(theChannel);
    const contract = network.getContract(contractName);

    // Submit the specified transaction.
    const retVal = await contract.evaluateTransaction(func, keyID);
    console.log(`Return value is ${retVal}`);

    // Disconnect from the gateway.
    await gateway.disconnect();
  } catch (error) {
    console.error(`Failed to submit keyExists transaction: ${error}`);
  }
};

exports.createKeyValue = async (contractName, func, keyID, value) => {
  try {
    const wallet = getWallet();
    const exists = await wallet.exists(userName);

    console.log(`This is the Key ID ${keyID}`);

    if (!exists) {
      console.log(
        `An identity for the user ${userName} does not exist in the wallet`
      );
      return;
    }

    // Get the contract from the network.
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: userName,
      discovery: gatewayDiscovery,
    });
    const network = await gateway.getNetwork(theChannel);
    // console.log("Got the Network");

    const contract = network.getContract(contractName);
    // console.log("Got the Contract");

    // Submit the specified transaction.
    // console.log(
    //     `This is the function ${func} and this is the value ${value}`
    // );

    // Submit the specified transaction.
    await contract.submitTransaction(func, keyID, value);
    console.log(`Transaction has been submitted`);
    // console.log(new Date());

    // Disconnect from the gateway.
    await gateway.disconnect();
  } catch (error) {
    console.error(`Failed to submit createKeyValue transaction: ${error}`);
  }
};

exports.readKeyValue = async (contractName, func, keyID) => {
  try {
    const wallet = getWallet();
    const exists = await wallet.exists(userName);

    console.log(`This is the Key ID ${keyID}`);

    if (!exists) {
      console.log(
        `An identity for the user ${userName} does not exist in the wallet`
      );
      return;
    }

    // Get the contract from the network.
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: userName,
      discovery: gatewayDiscovery,
    });
    const network = await gateway.getNetwork(theChannel);
    const contract = network.getContract(contractName);

    // Submit the specified transaction.
    const result = await contract.evaluateTransaction(func, keyID);
    // console.log(`Transaction has been submitted:\n ${result}`);

    // Disconnect from the gateway.
    await gateway.disconnect();
    console.log(new Date());
    return result;
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
  }
};

exports.updateKeyValue = async (contractName, func, keyID, value) => {
  try {
    const wallet = getWallet();
    const exists = await wallet.exists(userName);

    console.log(`This is the Key ID ${keyID}`);

    if (!exists) {
      console.log(
        `An identity for the user ${userName} does not exist in the wallet`
      );
      return;
    }

    // Get the contract from the network.
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: userName,
      discovery: gatewayDiscovery,
    });
    const network = await gateway.getNetwork(theChannel);
    const contract = network.getContract(contractName);

    await contract.submitTransaction(func, keyID, value);
    console.log('Transaction has been submitted');

    // Disconnect from the gateway.
    await gateway.disconnect();
  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
  }
};

exports.getHistoryForKey = async (contractName, func, keyID) => {
  try {
    const wallet = getWallet();
    const exists = await wallet.exists(userName);

    if (!exists) {
      console.log(
        `An identity for the user ${userName} does not exist in the wallet`
      );
      return;
    }

    // Get the contract from the network.
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: userName,
      discovery: gatewayDiscovery,
    });
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
  }
};

exports.saveArrayInSegments = async (contractName, func, newBatchFeed) => {
  try {
    let counter = 0;
    let recordCount = 0;
    let arr = [];

    const wallet = getWallet();
    const exists = await wallet.exists(userName);

    if (!exists) {
      console.log(
        `An identity for the user ${userName} does not exist in the wallet`
      );
      return;
    }

    // Get the contract from the network.
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: userName,
      discovery: gatewayDiscovery,
    });
    const network = await gateway.getNetwork(theChannel);
    const contract = network.getContract(contractName);

    console.log(`Counter = ${newBatchFeed.length}`);

    for (let i = 0; i < newBatchFeed.length; i++) {
      arr.push(newBatchFeed[i]);

      if (counter >= batchSize) {
        let strArray = JSON.stringify(arr);
        console.log(`Counter = ${counter}`);

        await contract.submitTransaction(func, strArray);
        // Empty the array
        arr.length = 0;
        counter = 0;
      }

      counter++;
      recordCount++;
      // console.log(`${newBatchFeed[i].orderId} and ${JSON.stringify(newBatchFeed[i])}`);
    }

    let strArray = JSON.stringify(arr);
    console.log(`Counter = ${counter}`);

    await contract.submitTransaction(func, strArray);

    // Submit the specified transaction.
    // await contract.submitTransaction(func, newBatchFeed);

    // Disconnect from the gateway.
    gateway.disconnect();
  } catch (error) {
    gateway.disconnect();
    console.error(`Failed to submit transaction: ${error}`);
  }
};

exports.saveArrayOneAtATime = async (contractName, func, newBatchFeed) => {
  try {
    const wallet = getWallet();
    const exists = await wallet.exists(userName);

    if (!exists) {
      console.log(
        `An identity for the user ${userName} does not exist in the wallet`
      );
      return;
    }

    // Get the contract from the network.
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: userName,
      discovery: gatewayDiscovery,
    });
    const network = await gateway.getNetwork(theChannel);
    const contract = network.getContract(contractName);

    console.log(newBatchFeed.length);

    for (let i = 0; i < newBatchFeed.length; i++) {
      console.log(
        `${newBatchFeed[i].orderNo} and ${JSON.stringify(
          newBatchFeed[i].company
        )}`
      );
      await contract.submitTransaction(
        func,
        newBatchFeed[i].orderNo,
        JSON.stringify(newBatchFeed[i])
      );
    }

    // Submit the specified transaction.
    // await contract.submitTransaction(func, strArray);

    // Disconnect from the gateway.
    await gateway.disconnect();
  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
  }
};

exports.deleteKeyValue = async (contractName, func, keyID) => {
  try {
    const wallet = getWallet();
    const exists = await wallet.exists(userName);

    if (!exists) {
      console.log(
        `An identity for the user ${userName} does not exist in the wallet`
      );
      return;
    }

    // Get the contract from the network.
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: userName,
      discovery: gatewayDiscovery,
    });
    const network = await gateway.getNetwork(theChannel);
    const contract = network.getContract(contractName);

    // Submit the specified transaction.
    await contract.submitTransaction(func, keyID);
    console.log(`Item key ${keyID} has been deleted`);

    // Disconnect from the gateway.
    await gateway.disconnect();
  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
  }
};
