"use strict";

// const fs = require("fs");
// const path = require("path");
const StringBuilder = require("node-stringbuilder");
const sb = new StringBuilder();
const theContract = "errigal";
const network = require("./Network");

const createOrderObject = orderId => {
    // console.log(`Order ID is ${orderId}`);
    let orderTemplate = {
        errigalOrderId: "2001",
        docType: "foodOrder",
        despatchDate: "2020-02-20",
        dateReceived: "2020-03-20",
        buyerId: "0001",
        quantity: 150,
        qtyUnitMeasurement: "Kg",
        processUsed: "Smoking",
        orderLines: [
            {
                orderLine: 1,
                sourceBatchId: "101",
                tested: "Yes",
                quantity: 100,
                qtyUnitMeasurement: "Kg"
            },
            {
                orderLine: 2,
                sourceBatchId: "102",
                tested: "Yes",
                quantity: 50,
                qtyUnitMeasurement: "Kg"
            }
        ]
    };

    let order = {};
    order = orderTemplate;
    order.errigalOrderId = orderId;
    order.quantity = 150;
    // console.log(`Order ID is ${order.orderId}`);
    return order;
};

const createSdlmOrderObject = orderId => {
    // console.log(`Order ID is ${orderId}`);
    const orderTemplate = {
        sdlmOrderId: "2001",
        docType: "foodOrder",
        despatchDate: "2020-02-20",
        dateReceived: "2020-02-20",
        buyerId: "1001",
        quantity: 650,
        qtyUnitMeasurement: "Kg",
        processUsed: "Smoking",
        orderLines: [
            {
                orderLine: 1,
                sourceBatchId: "103",
                tested: "Yes",
                quantity: 500,
                qtyUnitMeasurement: "Kg"
            },
            {
                orderLine: 2,
                sourceBatchId: "104",
                tested: "Yes",
                quantity: 150,
                qtyUnitMeasurement: "Kg"
            }
        ]
    };

    let order = {};
    order = orderTemplate;
    order.sdlmOrderId = orderId;
    order.quantity = 650;
    // console.log(`Order ID is ${order.orderId}`);
    return order;
};

const createVfOrderObject = orderId => {
    // console.log(`Order ID is ${orderId}`);
    const orderTemplate = {
        company: "GLN of Errigal",
        exportNo: "200001",
        deliveryNo: "30001",
        orderNo: "MS100001",
        despatchDate: "2019-12-25",
        deliveryDate: "2019-12-26",
        warehouse: {
            gln: null,
            code: "01",
            name: "Errigal Bay - Kilmore",
            address: "Kilmore Quay",
            town: null,
            zip: null,
            county: "Co Wexford",
            country: "Ireland"
        },
        customer: {
            gln: null,
            code: "L01",
            name: "Lidl",
            adddress: "Rotelstr. 30",
            town: "Neckarsulm",
            zip: "74166",
            county: null,
            country: "Germany"
        },
        address: {
            gln: null,
            code: "L01a",
            name: "Lidl Distributionszentrum",
            adddress: "Lange Str. 28",
            town: "Berlin",
            zip: "10115",
            county: null,
            country: "Germany"
        },
        transport: {
            gln: null,
            code: "DHL",
            description: "DHL Express"
        },
        lines: [
            {
                lineId: 10001,
                productBarcode: "802270011054",
                caseBarcode: "8022700130515",
                commodityCode: "03062400",
                customerProductCode: "C001",
                species: "CRE",
                weight: 500,
                isFrozen: false,
                intakes: [
                    {
                        intakeNo: "21665",
                        intakeDate: "2019-11-12",
                        supplier: {
                            gln: null,
                            code: "F01",
                            name: "Fisher & Sons Fisheries",
                            adddress: "The Pier",
                            town: "Killala",
                            zip: null,
                            county: "Co Mayo",
                            country: "Ireland"
                        },
                        catchDate: "2019-11-12",
                        landingDate: "2019-11-13",
                        vessels: ["IRL000I10321", "IRL000I10322"],
                        ports: ["IESCH"],
                        areas: ["27.7"],
                        fishingGears: ["08"],
                        farms: ["IE 500 EC"],
                        countries: ["IRL"]
                    },
                    {
                        intakeNo: "21677",
                        intakeDate: "2019-12-12",
                        supplier: {
                            gln: null,
                            code: "F01",
                            name: "Fisher & Sons Fisheries",
                            adddress: "The Pier",
                            town: "Killala",
                            zip: null,
                            county: "Co Mayo",
                            country: "Ireland"
                        },
                        catchDate: "2019-12-12",
                        landingDate: "2019-12-13",
                        vessels: ["IRL000I10311", "IRL000I10332"],
                        ports: ["IESCH"],
                        areas: ["27.7"],
                        fishingGears: ["08"],
                        farms: ["IE 500 EC"],
                        countries: ["IRL"]
                    }
                ]
            }
        ]
    };

    let order = {};
    order = orderTemplate;
    order.orderNo = orderId;
    // console.log(`Order ID is ${order.orderId}`);
    return order;
};

const testy = async () => {
    const res = await network.getHistoryForKey(
        theContract,
        "getHistoryForKey",
        "MS100025"
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

const testyOne = async newOrder => {
    const res = await network.getHistoryForKey(
        theContract,
        "getHistoryForKey",
        newOrder
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

let newOrder = createVfOrderObject("MS100020");
// // console.log(newOrder);

const readNewOrder = async newOrder => {
    console.log(newOrder.orderNo);

    let order = await network.readKeyValue(
        theContract,
        "readOrder",
        newOrder.orderNo
    );

    // order = JSON.parse(order);
    console.log(order.toString());
    // console.log(order.tx_id);
};

const updateNewOrder = async newOrder => {
    console.log(newOrder.orderNo);

    let order = await network.updateKeyValue(
        theContract,
        "updateOrder",
        newOrder.orderNo,
        JSON.stringify(newOrder)
    );

    // order = JSON.parse(order);
    // console.log(order.toString());
    // console.log(order.tx_id);
    await testyOne(newOrder.orderNo);
};

/**
 * Create an array of batchfeed objects based on a lower and upper limit
 * @param {*} firstBatchId
 * @param {*} lastBatchId
 */
const createBatchfeedBatch = (firstBatchId, lastBatchId) => {
    let batchArray = [];

    for (let i = firstBatchId; i <= lastBatchId; i++) {
        let obj = {};
        const orderNo = "MS" + i.toString();
        obj = createVfOrderObject(orderNo);
        // obj = createBatchfeedObject(i, client);
        batchArray.push(obj);
        // console.log(JSON.stringify(obj));
    }

    for (let i = 0; i < batchArray.length; i++) {
        console.log(`${batchArray[i].orderNo} `);
    }

    return batchArray;
};
/**
 * Create and save a batch of batchfeeds identified by the range of numbers given
 * @param {The first number in the BatchId range} firstBatchId
 * @param {the last number in the BatchId range} lastBatchId
 */
const saveBatchfeedBatch = async (firstBatchId, lastBatchId, inIncrements) => {
    let counter = 0;
    //saveArray
    let batchArray = [];
    batchArray = createBatchfeedBatch(firstBatchId, lastBatchId);
    console.log(`batchArray length is ${batchArray.length}`);

    if (inIncrements === true) {
        await network.saveArrayOneAtATime(
            theContract,
            "createOrder",
            batchArray
        );
    } else {
        await network.saveArrayInSegments(theContract, "saveArray", batchArray);
    }
};

const saveArray = async (contract, func, array) => {
    // console.log(contract);
    array.forEach(s => {
        s.Comment = s.Comment + " --- other comment";
    });

    // let strArray = JSON.stringify(array);

    await network.saveArrayInSegments(contract, func, array); //
};

// const read = async order => {
//     order = await network.readKeyValue(theContract, "readVfOrder", order);
//     order = JSON.parse(order);
//     console.log(`This is the order number ${order.orderNo}`);
// };

// order = JSON.parse(order);
// console.log(`This is the order number ${order.orderNo}`);
// console.log(new Date());
// // read(newOrder.orderNo);

// let buffer = network.createKeyValue(
//     theContract,
//     "createVfOrder",
//     newOrder.orderNo,
//     JSON.stringify(newOrder)
// );

const addNewOrder = async newOrder => {
    await network.createKeyValue(
        theContract,
        "createOrder",
        newOrder.orderNo,
        JSON.stringify(newOrder)
    );

    await testyOne(newOrder.orderNo);
    // order = JSON.parse(order);
    // console.log(order);
};

// readNewOrder(newOrder);
addNewOrder(createVfOrderObject("MS100027"));
// updateNewOrder(createVfOrderObject("MS100020"));
// testy();
// testyOne(newOrder.orderNo);
// MS100004  MS100010

// saveBatchfeedBatch(100004, 100020, false);
// network.keyExists(theContract, "orderExists", "MS100001");
