const Block = require("./block");
const cryptoHash = require("./cryptoHash");
const { GENESIS_DATA } = require("./config.js");

describe("Block", () => {
  const timeStamp = "a-date",
    lastHash = "last-hash",
    hash = "hash",
    data = "data",
    block = new Block({ timeStamp, lastHash, hash, data });
  it("should create a Block", () => {
    expect(block.timeStamp).toEqual(timeStamp);
    expect(block.lastHash).toEqual(lastHash);
    expect(block.hash).toEqual(hash);
    expect(block.data).toEqual(data);
  });
});

describe("genesis func", () => {
  const genesisBlock = Block.genesis();
  it("should return a genesis block", () => {
    expect(genesisBlock instanceof Block).toBe(true);
  });
  it("should returns the genesis data", () => {
    expect(genesisBlock).toEqual(GENESIS_DATA);
  });
});

describe("mine a block", () => {
  const lastBlock = Block.genesis();
  const data = "mined data";
  const minedBlock = Block.mineBlock({ lastBlock, data });
  it("should returns the block instance", () => {
    expect(minedBlock instanceof Block).toBe(true);
  });
  it("should have the same last hash as the last block hash", () => {
    expect(minedBlock.lastHash).toEqual(lastBlock.hash);
  });
  it("should set the data", () => {
    expect(minedBlock.data).toEqual(data);
  });
  it("should set a timestamp", () => {
    expect(minedBlock.timeStamp).toBeTruthy();
  });
  it("should create a sha256 hash", () => {
    expect(minedBlock.hash).toEqual(
      cryptoHash(minedBlock.timeStamp, lastBlock.hash, data)
    );
  });
});
