const Block = require("./block");
const Blockchain = require("./blockchain");

describe("Blockchain", () => {
  const blockchain = new Blockchain();
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
});
