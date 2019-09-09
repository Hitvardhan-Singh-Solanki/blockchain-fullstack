const { GENESIS_DATA } = require("./config.js");
const cryptoHash = require("./cryptoHash");

class Block {
  constructor({ timeStamp, lastHash, hash, data, nonce, difficulty }) {
    this.timeStamp = timeStamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
    this.nonce = nonce;
    this.difficulty = difficulty;
  }

  static genesis() {
    return new this(GENESIS_DATA);
  }
  static mineBlock({ lastBlock, data }) {
    let timeStamp,
      hash,
      lastHash = lastBlock.hash,
      nonce = 0;

    const { difficulty } = lastBlock;

    do {
      nonce++;
      timeStamp = Date.now();
      hash = cryptoHash(timeStamp, lastHash, data, nonce, difficulty);
    } while (hash.substring(0, difficulty) !== "0".repeat(difficulty));

    return new this({
      timeStamp,
      data,
      lastHash,
      hash,
      nonce,
      difficulty
    });
  }
}

module.exports = Block;
