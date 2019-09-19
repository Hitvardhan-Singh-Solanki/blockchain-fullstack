const Block = require("./block");
const { cryptoHash } = require("../utils");
const { REWARD_INPUT, MINING_REWARD } = require("../config");
const Transaction = require("../wallet/transaction");
const Wallet = require("../wallet");

class Blockchain {
  constructor() {
    this.chain = [Block.genesis()];
  }
  addBlock({ data }) {
    const newBlock = Block.mineBlock({
      lastBlock: this.chain[this.chain.length - 1],
      data
    });
    this.chain.push(newBlock);
  }

  static isValidChain(chain) {
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis()))
      return false;

    for (let i = 1; i < chain.length; i++) {
      const { timeStamp, lastHash, hash, data, nonce, difficulty } = chain[i];
      const actualHash = chain[i - 1].hash;
      const lastDifficulty = chain[i - 1].difficulty;

      if (actualHash !== lastHash) return false;
      const validatedHash = cryptoHash(
        timeStamp,
        lastHash,
        data,
        nonce,
        difficulty
      );
      if (validatedHash !== hash) return false;
      if (Math.abs(lastDifficulty - difficulty) > 1) return false;
    }

    return true;
  }

  replaceChain(chain, validateTransactions, onSuccess) {
    if (chain.length <= this.chain.length)
      return console.error("The incoming chain must be longer");
    if (!Blockchain.isValidChain(chain))
      return console.error("The incoming chain must be valid");

    if (validateTransactions && !this.validTransactionData({ chain })) {
      return console.error("The incoming transaction must be valid");
    }
    if (onSuccess) onSuccess();
    console.log("replacing chain with: ", chain);
    this.chain = chain;
  }

  validTransactionData({ chain }) {
    // Escape the genesis block
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const transactionSet = new Set();
      let rewardTrxCount = 0;
      for (let trx of block.data) {
        if (trx.input.address === REWARD_INPUT.address) {
          rewardTrxCount++;
          if (rewardTrxCount > 1) {
            console.error("Miner has multiple rewards for a single block");
            return false;
          }
          if (Object.values(trx.outputMap)[0] !== MINING_REWARD) {
            console.error("Miner has invalid reward");
            return false;
          }
        } else {
          if (!Transaction.validTransaction(trx)) {
            console.error("Invalid transaction");
            return false;
          }
          const trueBalance = Wallet.calculateBalance({
            chain: this.chain,
            address: trx.input.address
          });
          if (trx.input.amount !== trueBalance) {
            console.error("Invalid input amount");
            return false;
          }
          if (transactionSet.has(trx)) {
            console.error(
              "An identical transaction appears more than once in the block"
            );
            return false;
          } else {
            transactionSet.add(trx);
          }
        }
      }
    }
    return true;
  }
}

module.exports = Blockchain;
