const INITIAL_DIFFICULTY = 3;

const STARTING_BALANCE = 1000;

const MINE_RATE = 1000;

const GENESIS_DATA = {
  timeStamp: 1,
  lastHash: "-----",
  hash: "hash-one",
  data: [],
  difficulty: INITIAL_DIFFICULTY,
  nonce: 0
};

const STRING = "foo-bar";

const SHA256 =
  "7d89c4f517e3bd4b5e8e76687937005b602ea00c5cba3e25ef1fc6575a55103e";

module.exports = { GENESIS_DATA, STRING, SHA256, MINE_RATE, STARTING_BALANCE };
