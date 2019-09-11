const express = require("express");
const chalk = require("chalk");
const Blockchain = require("./blockchain");
const PubSub = require("./pubsub");
const bodyParser = require("body-parser");

const app = express();
const blockchain = new Blockchain();
const pubsub = new PubSub({ blockchain });

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
  res.redirect("/api/blocks");
});

app.listen(3000, () => {
  console.log(`App is live on PORT: ${chalk.green(3000)}`);
});
