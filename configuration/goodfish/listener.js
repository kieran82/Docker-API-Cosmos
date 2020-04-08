'use strict';

const {
  FileSystemWallet,
  Gateway,
  X509WalletMixin
} = require('fabric-network');
const fs = require('fs');
const path = require('path');
const StringBuilder = require('node-stringbuilder');
const sb = new StringBuilder();
const theContract = 'gunpoint-orders';
const network = require('./Network');
const utility = require('./classes/utility');

// capture network variables from config.json
const configPath = path.join(process.cwd(), './config.json');
// console.log(`Config path is ${configPath} from web client`);
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);
var connection_file = config.connection_file;
var userName = config.userName;
var gatewayDiscovery = config.gatewayDiscovery;
const theWallet = config.wallet;
const theChannel = config.channel;
const batchSize = Number(config.batchSize);

const events = require('events');
const eventEmitter = new events.EventEmitter();
const theBlockchainEvent = 'orderReadEvent'; //orderReadEvent orderEvent  orderAddEvent

console.log(`The wallet folder is ${theWallet} and ${userName}`);

// connect to the connection file
const ccpPath = path.join(process.cwd(), connection_file);
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

console.log(`Connection file is ${connection_file} `);

/* ===============================  Test Methods ====================================== */

//Assign the event handler to an event:
eventEmitter.on('blockEvent', id => {
  console.log(id);
  // console.log(`This is ccp ${ccp.toString()}`);

  utility.getBlockTxId(id, theContract, 'getHistoryForKey');
});

// Common method to get a Wallet
const getWallet = () => {
  const walletPath = path.join(process.cwd(), theWallet);
  const wallet = new FileSystemWallet(walletPath);
  console.log(`Wallet path: ${walletPath}`);
  return wallet;
};
const listenerAdd = async event => {
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
      discovery: gatewayDiscovery
    });
    const network = await gateway.getNetwork(theChannel);
    const contract = network.getContract(theContract);

    await contract.addContractListener(theContract, event, (err, event) => {
      if (err) {
        console.error(err);
        return;
      }

      //convert event to something we can parse
      event = event.payload.toString();
      event = JSON.parse(event);

      //where we output the TradeEvent
      console.log(
        '************************ Start listenerAdd Event *******************************************************'
      );
      console.log(JSON.stringify(event));

      utility.getBlockTxId(event.id, theContract, 'getHistoryForKey');

      console.log(
        '************************ End listenerAdd Event ************************************'
      );
    });
  } catch (error) {
    console.error(`Failed to handle Event: ${error}`);
  }
};

const listenerUpdate = async event => {
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
      discovery: gatewayDiscovery
    });
    const network = await gateway.getNetwork(theChannel);
    const contract = network.getContract(theContract);

    await contract.addContractListener(theContract, event, (err, event) => {
      if (err) {
        console.error(err);
        return;
      }

      //convert event to something we can parse
      event = event.payload.toString();
      event = JSON.parse(event);

      //where we output the TradeEvent
      console.log(
        '************************ Start listenerUpdate Event *******************************************************'
      );
      console.log(JSON.stringify(event));

      utility.getBlockTxId(event.id, theContract, 'getHistoryForKey');

      console.log(
        '************************ End listenerUpdate Event ************************************'
      );
    });
  } catch (error) {
    console.error(`Failed to handle Event: ${error}`);
  }
};

const main = async () => {
  const orderAddEvent = 'orderAddEvent';
  const orderUpdateEvent = 'orderUpdateEvent';

  await listenerAdd(orderAddEvent);
  await listenerUpdate(orderUpdateEvent);
};

main();
