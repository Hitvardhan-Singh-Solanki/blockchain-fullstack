const Block = require("./block");
const Blockchain = require("./blockchain");
const Wallet = require("../wallet");
const Transaction = require("../wallet/transaction");
const { cryptoHash } = require("../utils");

describe("Blockchain", () => {
  let blockchain, newChain, originalChain, errorMock;

  beforeEach(() => {
    blockchain = new Blockchain();
    newChain = new Blockchain();
    errorMock = jest.fn();
    global.console.error = errorMock;
    originalChain = blockchain.chain;
  });

  it("should contain a chain of Array instance", () => {
    expect(blockchain.chain instanceof Array).toBe(true);
  });
  it("should start with a genesis block", () => {
    expect(blockchain.chain[0]).toEqual(Block.genesis());
  });
  it("should add a new block to the chain", () => {
    const newData = "foo bar";
    blockchain.addBlock({ data: newData });
    expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newData);
  });

  describe("isValidChain()", () => {
    describe("when chain does not start with the genesis block", () => {
      it("should return a false", () => {
        blockchain.chain[0] = { data: "fake-genesis" };
        expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
      });
    });
    describe("when the chain has a genesis block and has multiple blocks", () => {
      beforeEach(() => {
        blockchain.addBlock({ data: "bears" });
        blockchain.addBlock({ data: "test" });
        blockchain.addBlock({ data: "red" });
      });

      describe("and the chain contains a block with jumped difficulty", () => {
        it("should return false", () => {
          const lastBlock = blockchain.chain[blockchain.chain.length - 1];
          const lastHash = lastBlock.hash;
          const timeStamp = Date.now();
          const nonce = 0;
          const data = [];
          const difficulty = lastBlock.difficulty - 3;
          const hash = cryptoHash(timeStamp, lastHash, nonce, difficulty, data);

          const badBlock = new Block({
            timeStamp,
            data,
            lastHash,
            hash,
            nonce,
            difficulty
          });

          blockchain.chain.push(badBlock);
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });

      describe("and a lastHash reference has changed", () => {
        it("should return false", () => {
          blockchain.chain[2].lastHash = "broken-chain";
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });
      describe("and the chain contains a block with an invalid field", () => {
        it("should return false", () => {
          blockchain.chain[2].data = "broken-chain-data";
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });
      describe("and the chain is alright", () => {
        it("returns true", () => {
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
        });
      });
    });
  });

  describe("replaceChain()", () => {
    let logMock;
    beforeEach(() => {
      logMock = jest.fn();
      global.console.log = logMock;
    });
    describe("when the new chain is not longer", () => {
      beforeEach(() => {
        newChain.chain[0] = { new: "chain" };
        blockchain.replaceChain(newChain.chain);
      });
      it("should not replace the chain", () => {
        expect(blockchain.chain).toEqual(originalChain);
      });
      it("should log an error", () => {
        expect(errorMock).toHaveBeenCalled();
      });
    });
    describe("when the new chain is longer", () => {
      beforeEach(() => {
        newChain.addBlock({ data: "bears" });
        newChain.addBlock({ data: "test" });
        newChain.addBlock({ data: "red" });
      });
      describe("and the chain is invalid", () => {
        beforeEach(() => {
          newChain.chain[1].hash = "some-fake-hash";
          blockchain.replaceChain(newChain.chain);
        });
        it("should not replace the chain", () => {
          expect(blockchain.chain).toEqual(originalChain);
        });
        it("should log an error", () => {
          expect(errorMock).toHaveBeenCalled();
        });
      });
      describe("and the chain is valid", () => {
        beforeEach(() => {
          blockchain.replaceChain(newChain.chain);
        });
        it("should replace the chain", () => {
          expect(blockchain.chain).toEqual(newChain.chain);
        });
        it("should log an chain replacement", () => {
          expect(logMock).toHaveBeenCalled();
        });
      });
    });
    describe("and the validate trx flag is true", () => {
      it("should call validTransactionData()", () => {
        const validTrxDataMock = jest.fn();
        blockchain.validTransactionData = validTrxDataMock;
        newChain.addBlock({ data: "foo" });
        blockchain.replaceChain(newChain.chain, true);
        expect(validTrxDataMock).toHaveBeenCalled();
      });
    });
  });

  describe("validTransactionData()", () => {
    let transaction, rewardTransaction, wallet;
    beforeEach(() => {
      wallet = new Wallet();
      transaction = wallet.createTransaction({
        recipient: "foo-address",
        amount: 60
      });
      rewardTransaction = Transaction.rewardTransaction({
        minerWallet: wallet
      });
    });
    describe("and the trx data is valid", () => {
      it("should return true", () => {
        newChain.addBlock({ data: [transaction, rewardTransaction] });
        expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(
          true
        );
        expect(errorMock).not.toHaveBeenCalled();
      });
    });
    describe("and the trx data is invalid", () => {
      describe("and the trx data has multiple rewards", () => {
        it("should return false  and logs an error", () => {
          newChain.addBlock({
            data: [transaction, rewardTransaction, rewardTransaction]
          });
          expect(
            blockchain.validTransactionData({ chain: newChain.chain })
          ).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        });
      });
      describe("and the trx data has at least one malformed o/p map", () => {
        describe("and teh trx is not a reward trx", () => {
          it("should return false and logs an error", () => {
            transaction.outputMap[wallet.publicKey] = 999999;
            newChain.addBlock({
              data: [transaction, rewardTransaction]
            });
            expect(
              blockchain.validTransactionData({ chain: newChain.chain })
            ).toBe(false);
            expect(errorMock).toHaveBeenCalled();
          });
        });
        describe("and the trx is a reward trx", () => {
          it("should return false and logs an error", () => {
            rewardTransaction.outputMap[wallet.publicKey] = 999999;
            newChain.addBlock({
              data: [transaction, rewardTransaction]
            });
            expect(
              blockchain.validTransactionData({ chain: newChain.chain })
            ).toBe(false);
            expect(errorMock).toHaveBeenCalled();
          });
        });
      });
      describe("and the trx data has at least one malformed i/p", () => {
        it("should return false and logs an error", () => {
          wallet.balance = 9000;

          const evilOutputMap = {
            [wallet.publicKey]: 8900,
            fooRecipient: 100
          };

          const evilTransaction = {
            input: {
              timestamp: Date.now(),
              amount: wallet.balance,
              address: wallet.publicKey,
              signature: wallet.sign(evilOutputMap)
            },
            outputMap: evilOutputMap
          };

          newChain.addBlock({ data: [evilTransaction, rewardTransaction] });

          expect(
            blockchain.validTransactionData({ chain: newChain.chain })
          ).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        });
      });
      describe("and a block contains multiple identical trx", () => {
        it("should return false and logs an error", () => {});
      });
    });
  });
});
