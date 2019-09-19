const redis = require("redis");

const channels = {
  TEST: "TEST",
  BLOCKCHAIN: "BLOCKCHAIN",
  TRANSACTION: "TRANSACTION"
};

class PubSub {
  constructor({ blockchain, transactionPool }) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.publisher = redis.createClient();
    this.subscriber = redis.createClient();

    this.subscriberToChannel();

    this.subscriber.on("message", (channel, message) =>
      this.handleMessage(channel, message)
    );
  }
  handleMessage(channel, message) {
    console.log(`Message: ${message} on Channel: ${channel}`);
    const parsedMsg = JSON.parse(message);
    switch (channel) {
      case channels.BLOCKCHAIN:
        this.blockchain.replaceChain(parsedMsg, true, () => {
          this.transactionPool.clearBlockchainTransactions({
            chain: parsedMsg
          });
        });
        break;
      case channels.TRANSACTION:
        this.transactionPool.setTransaction(parsedMsg);
        break;
      default:
        return "NO_CHANNEL_DEFINED";
    }
  }
  subscriberToChannel() {
    Object.values(channels).forEach(channel => {
      this.subscriber.subscribe(channel);
    });
  }

  publish({ channel, message }) {
    this.subscriber.unsubscribe(channel, () => {
      this.publisher.publish(channel, message, () => {
        this.subscriber.subscribe(channel);
      });
    });
  }
  broadcastChain() {
    this.publish({
      channel: channels.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain)
    });
  }
  broadcastTrx(trx) {
    this.publish({
      channel: channels.TRANSACTION,
      message: JSON.stringify(trx)
    });
  }
}

module.exports = PubSub;
