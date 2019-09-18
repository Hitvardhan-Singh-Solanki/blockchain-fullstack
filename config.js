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
  "291ad95de298fed69e1c8425874cbdf1f4205136978e5e31b7e7e41078b60fc7";

module.exports = { GENESIS_DATA, STRING, SHA256, MINE_RATE, STARTING_BALANCE };
