const express = require("express");
const chalk = require("chalk");
const request = require("request");
const Blockchain = require("./blockchain/blockchain");
const TransactionPool = require("./wallet/transactionPool");
const Wallet = require("./wallet");
const PubSub = require("./app/pubsub");
const bodyParser = require("body-parser");

const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({ blockchain, transactionPool });

const DEFAULT_PORT = 3000;

const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

setTimeout(() => {
  pubsub.broadcastChain();
}, 1000);

app.use(bodyParser.json());

app.get("/api/blocks", (_, res) => {
  res.json(blockchain.chain);
});
app.post("/api/mine", (req, res) => {
  const { data } = req.body;
  blockchain.addBlock({ data });
  pubsub.broadcastChain();
  res.redirect("/api/blocks");
});

app.post("/api/transact", (req, res) => {
  const { amount, recipient } = req.body;

  let trx = transactionPool.existingTransaction({
    inputAddress: wallet.publicKey
  });

  try {
    if (trx) {
      trx.update({ senderWallet: wallet, recipient, amount });
    } else {
      trx = wallet.createTransaction({ recipient, amount });
    }
    transactionPool.setTransaction(trx);

    pubsub.broadcastTrx(trx);

    res.json({ type: "success", trx });
  } catch (e) {
    res.status(400).json({ type: "error", message: e.message });
  }
});

app.get("/api/transaction-pool-map", (req, res) => {
  res.json(transactionPool.transactionMap);
});

const syncWithRootState = () => {
  request(
    { url: `${ROOT_NODE_ADDRESS}/api/blocks` },
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const rootChain = JSON.parse(body);

        console.log("replace chain on a sync with", rootChain);
        blockchain.replaceChain(rootChain);
      }
    }
  );

  request(
    { url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map` },
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const rootTransactionPoolMap = JSON.parse(body);

        console.log(
          "replace transaction pool map on a sync with",
          rootTransactionPoolMap
        );
        transactionPool.setMap(rootTransactionPoolMap);
      }
    }
  );
};

let PEER_PORT;

if (process.env.PEER_PORTING === "true") {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;

app.listen(PORT, () => {
  console.log(`App is live on PORT: ${chalk.green(PORT)}`);
  if (PORT !== DEFAULT_PORT) {
    syncWithRootState();
  }
});
