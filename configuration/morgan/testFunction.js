'use strict';

// const fs = require("fs");
// const path = require("path");
const StringBuilder = require('node-stringbuilder');
const sb = new StringBuilder();
const theContract = 'morgan-production-orders';
const network = require('./Network');

const createBatchObject = (id) => {
  // console.log(`asset ID is ${assetId}`);
  let assetTemplate = {
    id: '09568657-8EA3-4D69-BA49-618277201920',
    batchId: '09568657-8EA3-4D69-BA49-618277201920',
    docType: 'batchOrder',
    batchNumber: 'PFB230320',
    orderId: '7F3DC60F-E16F-412E-AF1F-619775935E89',
    speciesId: 6,
    ProductSpeciesName: 'Hake',
    dateTimeReceived: 1584965510,
    dateReceived: 1584921600,
    dateOnlyReceived: '2020-03-23',
    timeReceived: '12:11:56',
    received_date_time: '2020-03-23 12:11:50',
    ProductSpeciesName: 'Hake Fillets',
    ProductSpeciesCode: 'F001HF',
    ProductSpeciesEAN: '0000',
    qtyUnitMeasurement: 'KG',
    quantity: 580,
    quantity_kg: 580,
    quantity_unit: 0,
    packageIncluded: 'no',
    batchClosed: 'no',
    intakeLines: [
      {
        intakeLine: 1,
        sourceBatchId: 'EB6519D9-5F68-4E5D-9FE6-7F20F23D2601',
        quantity: 300,
        quantity_kg: 300,
        quantity_unit: 0,
        qtyUnitMeasurement: 'KG',
      },
      {
        intakeLine: 2,
        sourceBatchId: '785632F7-2502-4821-82A5-99C5C4BC1F14',
        quantity: 250,
        quantity_kg: 250,
        quantity_unit: 0,
        qtyUnitMeasurement: 'KG',
      },
      {
        intakeLine: 3,
        sourceBatchId: '74437F44-3F99-4B96-933F-2B6CDAECD3A1',
        quantity: 30,
        quantity_kg: 30,
        quantity_unit: 0,
        qtyUnitMeasurement: 'KG',
      },
    ],
  };

  let asset = {};
  asset = assetTemplate;
  asset.id = id;
  asset.quantity_kg = 324;
  // console.log(`asset ID is ${asset.assetId}`);
  return asset;
};

const createOrderObject = (id) => {
  // console.log(`asset ID is ${assetId}`);
  let assetTemplate = {
    id: '7F3DC60F-E16F-412E-AF1F-519775935E80',
    orderId: '7F3DC60F-E16F-412E-AF1F-519775935E80',
    docType: 'foodOrder',
    clientName: 'Morgan',
    orderNumber: 'PF230320',
    dateTimeReceived: 1584964353,
    dateReceived: 1584921600,
    timeReceived: '11:52:33',
    despatchDate: 1584964353,
    received_date_time: '2020-03-23 11:52:33',
    despatched_date: null,
    buyerId: null,
    buyerName: 'Pallas Foods',
    quantity: 700,
    qtyUnitMeasurement: 'KG',
    tested: 'no',
    dateTested: 1584964353,
    test_date: null,
    closed: 'no',
    orderLines: [
      {
        sourceBatchId: '09568657-8EA3-5D69-BA49-618277201920',
        quantity: 580,
        qtyUnitMeasurement: 'KG',
        date_created: '2020-03-23 12:11:50',
      },
    ],
  };

  let asset = {};
  asset = assetTemplate;
  asset.id = id;
  asset.quantity = 1050;
  // console.log(`asset ID is ${asset.assetId}`);
  return asset;
};

const testy = async () => {
  const res = await network.getHistoryForKey(
    theContract,
    'getHistoryForKey',
    'EB6519D9-5F68-4E5D-9FE6-7F20F23D2601'
  );

  let allResults = '';
  const js = JSON.parse(res);
  //Convert the array of ASCII values into a character string
  js.data
    .toString()
    .split(',')
    .forEach((s) => sb.append(String.fromCharCode(parseInt(s, 10))));
  //Parse the string back into a JSON object
  const myJson = JSON.parse(sb.toString());
  console.log(
    '--------------------------------------------------------------------'
  );

  //Now all items in the history object array can be accessed
  for (var myKey in myJson) {
    console.log(myJson[myKey].TxId);
    const dt = new Date(parseInt(myJson[myKey].Timestamp.seconds.low) * 1000);
    // console.log(myJson[myKey].Timestamp.seconds.low);
    console.log(dt.toISOString());

    console.log(
      '--------------------------------------------------------------------'
    );
  }
};

const testyOne = async (newasset) => {
  const res = await network.getHistoryForKey(
    theContract,
    'getHistoryForKey',
    newasset
  );

  let allResults = '';
  const js = JSON.parse(res);
  //Convert the array of ASCII values into a character string
  js.data
    .toString()
    .split(',')
    .forEach((s) => sb.append(String.fromCharCode(parseInt(s, 10))));
  //Parse the string back into a JSON object
  const myJson = JSON.parse(sb.toString());
  console.log(
    '--------------------------------------------------------------------'
  );

  //Now all items in the history object array can be accessed
  for (var myKey in myJson) {
    console.log(myJson[myKey].TxId);
    const dt = new Date(parseInt(myJson[myKey].Timestamp.seconds.low) * 1000);
    // console.log(myJson[myKey].Timestamp.seconds.low);
    console.log(dt.toISOString());

    console.log(
      '--------------------------------------------------------------------'
    );
  }
};

// // console.log(newasset);

const readNewAsset = async (newAsset) => {
  console.log(newAsset.id);

  let asset = await network.readKeyValue(
    theContract,
    'readTheAsset',
    newAsset.id
  );

  asset = JSON.parse(asset);
  console.log(asset.id);
  // console.log(asset.tx_id);
};

const deleteAsset = async (newAsset) => {
  console.log(newAsset.id);

  await network.deleteKeyValue(theContract, 'deleteAsset', newAsset.id);

  // console.log(asset.tx_id);
};

const updateNewAsset = async (newAsset) => {
  console.log(newAsset.id);

  let asset = await network.updateKeyValue(
    theContract,
    'updateAsset',
    newAsset.id,
    JSON.stringify(newAsset)
  );

  // asset = JSON.parse(asset);
  // console.log(asset.toString());
  // console.log(asset.tx_id);
  // await testyOne(newAsset.id);
  const order = await getHistory(newAsset.id);
  console.log(JSON.stringify(order));
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
    const id = 'MS' + i.toString();
    obj = createOrderObject(id);
    // obj = createBatchfeedObject(i, client);
    batchArray.push(obj);
    // console.log(JSON.stringify(obj));
  }

  for (let i = 0; i < batchArray.length; i++) {
    console.log(`${batchArray[i].id} `);
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
    await network.saveArrayOneAtATime(theContract, 'createAsset', batchArray);
  } else {
    await network.saveArrayInSegments(theContract, 'saveArray', batchArray);
  }
};

const saveArray = async (contract, func, array) => {
  // console.log(contract);
  array.forEach((s) => {
    s.Comment = s.Comment + ' --- other comment';
  });

  // let strArray = JSON.stringify(array);

  await network.saveArrayInSegments(contract, func, array); //
};

// const read = async asset => {
//     asset = await network.readKeyValue(theContract, "readVfasset", asset);
//     asset = JSON.parse(asset);
//     console.log(`This is the asset number ${asset.id}`);
// };

// asset = JSON.parse(asset);
// console.log(`This is the asset number ${asset.id}`);
// console.log(new Date());
// // read(newasset.id);

// let buffer = network.createKeyValue(
//     theContract,
//     "createVfasset",
//     newasset.id,
//     JSON.stringify(newasset)
// );

// createasset
// createassetWithEvent
// createassetWithReturn
// createassetWithReturnFromInternalCall

const getHistory = async (id) => {
  sb.clear();
  let order = {};
  let res = await network.getHistoryForKey(theContract, 'getHistoryForKey', id);

  const js = JSON.parse(res);
  //Convert the array of ASCII values into a character string
  js.data
    .toString()
    .split(',')
    .forEach((s) => sb.append(String.fromCharCode(parseInt(s, 10))));
  //Parse the string back into a JSON object
  const myJson = JSON.parse(sb.toString());
  console.log(
    '--------------------------------------------------------------------'
  );

  //Now all items in the history object array can be accessed
  for (var myKey in myJson) {
    // console.log(myJson[myKey].Value);
    order = myJson[myKey].Value;

    const dt = new Date(parseInt(myJson[myKey].Timestamp.seconds.low) * 1000);

    order.Timestamp = dt;
    order.TxId = myJson[myKey].TxId;
  }

  // console.log(JSON.stringify(order));

  // console.log(
  //   '--------------------------------------------------------------------'
  // );

  return order;
};

const addNewAsset = async (newAsset) => {
  await network.createKeyValue(
    theContract,
    'createAsset',
    newAsset.id,
    JSON.stringify(newAsset)
  );

  const order = await getHistory(newAsset.id);
  console.log(JSON.stringify(order));
};

let newAsset = createOrderObject('7F3DC60F-E16F-412E-AF1F-519775935E80');
// network.keyExists(theContract, 'assetExists', newAsset.id);
deleteAsset(newAsset);
// readNewAsset(newAsset);
// addNewAsset(newAsset);
// updateNewAsset(newAsset);
// testy();
// testyOne(newAsset.id);
// MS100004  MS100010

// saveBatchfeedBatch(100003, 100020, false);
