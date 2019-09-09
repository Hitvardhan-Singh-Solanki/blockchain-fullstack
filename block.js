const { GENESIS_DATA } = require("./config.js");
const cryptoHash = require("./cryptoHash");

class Block {
  constructor({ timeStamp, lastHash, hash, data }) {
    this.timeStamp = timeStamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
  }

  static genesis() {
    return new this(GENESIS_DATA);
  }
  static mineBlock({ lastBlock, data }) {
    const timeStamp = Date.now(),
      lastHash = lastBlock.hash;

    return new this({
      timeStamp,
      data,
      lastHash,
      hash: cryptoHash(timeStamp, lastHash, data)
    });
  }
}

module.exports = Block;
