"use strict";
const network = require("../Network");
const StringBuilder = require("node-stringbuilder");
const sb = new StringBuilder();

module.exports = class Utility {
    constructor() {}

    static async getBlockTxId(id, contract, func) {
        sb.clear();
        let order = {};
        let res = await network.getHistoryForKey(contract, func, id);

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
            // console.log(myJson[myKey].Value);
            order = myJson[myKey].Value;

            const dt = new Date(
                parseInt(myJson[myKey].Timestamp.seconds.low) * 1000
            );

            order.Timestamp = dt;
            order.TxId = myJson[myKey].TxId;

            // console.log(JSON.stringify(order));

            // console.log(myJson[myKey].Timestamp.seconds.low);
            // console.log(dt.toISOString());

            // console.log(
            //     "--------------------------------------------------------------------"
            // );
        }

        console.log(JSON.stringify(order));

        console.log(
            "--------------------------------------------------------------------"
        );
    }
};
