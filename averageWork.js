const Blockchain = require("./blockchain");

const blockchain = new Blockchain();

blockchain.addBlock({ data: "initial-block" });

let prevTimeStamp;
