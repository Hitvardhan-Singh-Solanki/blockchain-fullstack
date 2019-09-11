const express = require("express");
const chalk = require("chalk");
const request = require("request");
const Blockchain = require("./blockchain");
const PubSub = require("./pubsub");
const bodyParser = require("body-parser");

const app = express();
const blockchain = new Blockchain();
const pubsub = new PubSub({ blockchain });

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

const syncChain = () => {
  request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (err, resp, body) => {
    if (!err && resp.statusCode === 200) {
      const rootChain = JSON.parse(body);
      console.log("replace chain on a sync with,", rootChain);

      blockchain.replaceChain(rootChain);
    }
  });
};

let PEER_PORT;

if (process.env.PEER_PORTING === "true") {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;

app.listen(PORT, () => {
  console.log(`App is live on PORT: ${chalk.green(PORT)}`);
  if (PORT !== DEFAULT_PORT) syncChain();
});
