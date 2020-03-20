"use strict";

const {
    FileSystemWallet,
    Gateway,
    X509WalletMixin
} = require("fabric-network");
const fs = require("fs");
const path = require("path");
const StringBuilder = require("node-stringbuilder");
const sb = new StringBuilder();
const theContract = "errigal";
// const lineByLine = require("n-readlines");
// const log = require("./logger");
const network = require("./Network");

// capture network variables from config.json
const configPath = path.join(process.cwd(), "./config.json");
// console.log(`Config path is ${configPath} from web client`);
const configJSON = fs.readFileSync(configPath, "utf8");
const config = JSON.parse(configJSON);
var connection_file = config.connection_file;
var userName = config.userName;
var gatewayDiscovery = config.gatewayDiscovery;
const theWallet = config.wallet;
const theChannel = config.channel;
const batchSize = Number(config.batchSize);
const contractName = "errigal";

const events = require("events");
const eventEmitter = new events.EventEmitter();

console.log(`The wallet folder is ${theWallet} and ${userName}`);

// connect to the connection file
const ccpPath = path.join(process.cwd(), connection_file);
const ccpJSON = fs.readFileSync(ccpPath, "utf8");
const ccp = JSON.parse(ccpJSON);
let readyToRock = false;

console.log(`Connection file is ${connection_file} `);

/* ===============================  Test Methods ====================================== */

//Create an event handler:
const myEventHandler = () => {
    if (!readyToRock) {
        readyToRock = true;
        return;
    }
    console.log("I hear a scream!");
};

//Assign the event handler to an event:
eventEmitter.on("scream", myEventHandler);

//Fire the 'scream' event:
eventEmitter.emit("scream");

// Common method to get a Wallet
const getWallet = () => {
    const walletPath = path.join(process.cwd(), theWallet);
    const wallet = new FileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);
    return wallet;
};

const readRec = async orderId => {
    console.log(`Order ${orderId} from blockchain`);
    let order = await network.readKeyValue(
        theContract,
        "readVfOrder",
        orderId.toString()
    );
    order = JSON.parse(order);
    console.log(`This is the order quantity ${order.quantity}`);
};

const testy = async id => {
    const res = await network.getHistoryForKey(
        theContract,
        "getHistoryForKey",
        id
    );

    let allResults = "";
    const js = JSON.parse(res);
    //Convert the array of ASCII values into a character string
    js.data
        .toString()
        .split(",")
        .forEach(s => sb.append(String.fromCharCode(parseInt(s, 10))));
    //Parse the string back into a JSON object
    const myJson = JSON.parse(sb.toString());
    console.log(
        "--------------------------------------------------------------------"
    );

    //Now all items in the history object array can be accessed
    for (var myKey in myJson) {
        console.log(myJson[myKey].TxId);
        const dt = new Date(
            parseInt(myJson[myKey].Timestamp.seconds.low) * 1000
        );
        // console.log(myJson[myKey].Timestamp.seconds.low);
        console.log(dt.toISOString());

        console.log(
            "--------------------------------------------------------------------"
        );
    }
};

const main = async () => {
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
        const contract = network.getContract(contractName);

        await contract.addContractListener(
            contractName,
            "orderEvent",
            (err, event, blockNumber, transactionId, status) => {
                if (err) {
                    console.error(err);
                    return;
                }

                //convert event to something we can parse
                event = event.payload.toString();
                event = JSON.parse(event);

                //where we output the TradeEvent
                console.log(
                    "************************ Start Order Event *******************************************************"
                );
                console.log(`type: ${event.type}`);
                console.log(`ownerId: ${event.ownerId}`);
                console.log(`id: ${event.id}`);
                console.log(`deliverNo: ${event.deliverNo}`);
                console.log(`status: ${event.status}`);
                console.log(`deliverDate: ${event.deliverDate}`);
                // console.log(
                //     `Block Number: ${blockNumber}\n Transaction ID: ${transactionId}\n Status: ${status}`
                // );
                console.log(
                    "************************ End Order Event ************************************"
                );

                //Fire the 'scream' event:
                // testy(event.id);
                eventEmitter.emit("scream");
            }
        );

        // const result = await readRec("MS100012");
        // console.log(result);
    } catch (error) {
        console.error(`Failed to handle Event: ${error}`);
    }
};

main();
