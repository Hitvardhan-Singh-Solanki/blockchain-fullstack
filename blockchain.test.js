const Block = require("./block");
const Blockchain = require("./blockchain");
const cryptoHash = require("./cryptoHash");

describe("Blockchain", () => {
  let blockchain, newChain, originalChain;

  beforeEach(() => {
    blockchain = new Blockchain();
    newChain = new Blockchain();

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
    let errorMock, logMock;
    beforeEach(() => {
      errorMock = jest.fn();
      logMock = jest.fn();
      global.console.error = errorMock;
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
  });
});
