const Blockchain = require("../blockchain/blockchain");
const chalk = require("chalk");

const blockchain = new Blockchain();

blockchain.addBlock({ data: "initial-block" });

console.log(
  chalk.red(
    `First block: ${JSON.stringify(
      blockchain.chain[blockchain.chain.length - 1]
    )}`
  )
);

let prevTimeStamp, nextTimeStamp, nextBlock, timeDiff, average;

const times = [];

for (let i = 0; i < 10000; i++) {
  prevTimeStamp = blockchain.chain[blockchain.chain.length - 1].timeStamp;
  blockchain.addBlock({ data: `data ${i}` });
  nextBlock = blockchain.chain[blockchain.chain.length - 1];
  nextTimeStamp = nextBlock.timeStamp;
  timeDiff = nextTimeStamp - prevTimeStamp;
  times.push(timeDiff);
  average = times.reduce((total, ele) => total + ele, 0) / times.length;
  console.log(
    chalk.blue(`Time to mine block ${timeDiff}ms.`),
    chalk.green(`Difficulty: ${nextBlock.difficulty},`),
    chalk.cyan(`Average time to mine a block: ${average}ms`)
  );
}
