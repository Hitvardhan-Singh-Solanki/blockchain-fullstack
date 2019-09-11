const { GENESIS_DATA, MINE_RATE } = require("./config.js");
const cryptoHash = require("./cryptoHash");
const hex2Binary = require("hex-to-binary");

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
      { difficulty } = lastBlock,
      lastHash = lastBlock.hash,
      nonce = 0;

    do {
      nonce++;
      timeStamp = Date.now();
      difficulty = Block.adjustDifficulty({
        originalBlock: lastBlock,
        timeStamp
      });
      hash = cryptoHash(timeStamp, lastHash, data, nonce, difficulty);
    } while (
      hex2Binary(hash).substring(0, difficulty) !== "0".repeat(difficulty)
    );

    return new this({
      timeStamp,
      data,
      lastHash,
      hash,
      nonce,
      difficulty
    });
  }

  static adjustDifficulty({ originalBlock, timeStamp }) {
    const { difficulty } = originalBlock;
    if (difficulty < 1) return 1;
    if (timeStamp - originalBlock.timeStamp > MINE_RATE) return difficulty - 1;
    return difficulty + 1;
  }
}

module.exports = Block;
