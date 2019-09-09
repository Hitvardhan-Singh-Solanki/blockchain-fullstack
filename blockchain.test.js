const Block = require("./block");
const Blockchain = require("./blockchain");

describe("Blockchain", () => {
  let blockchain;

  beforeEach(() => {
    blockchain = new Blockchain();
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
        expect(blockchain.isValidChain(blockchain.chain)).toBe(false);
      });
    });
    describe("when the chain has a genesis block", () => {
      beforeEach(() => {
        blockchain.addBlock({ data: "bears" });
        blockchain.addBlock({ data: "test" });
        blockchain.addBlock({ data: "red" });
      });
      describe("and a lastHash reference has changed", () => {
        it("should return false", () => {
          blockchain.chain[2].lastHash = "broken-chain";
          expect(blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });
      describe("and the chain contains a block with an invalid field", () => {
        it("should return false", () => {
          blockchain.chain[2].data = "broken-chain-data";
          expect(blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });
      describe("and the chain is alright", () => {
        it("returns true", () => {
          expect(blockchain.isValidChain(blockchain.chain)).toBe(true);
        });
      });
    });
  });
});
