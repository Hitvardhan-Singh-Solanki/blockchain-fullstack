const TransactionPool = require("./transactionPool");
const Transaction = require("./transaction");
const Wallet = require(".");

describe("TrxPool", () => {
  let transactionPool, transaction;
  beforeEach(() => {
    transactionPool = new TransactionPool();
    senderWallet = new Wallet();
    transaction = new Transaction({
      senderWallet,
      recipient: "fake-recipient",
      amount: 50
    });
  });
  describe("setTransaction()", () => {
    it("adds a transaction", () => {
      transactionPool.setTransaction(transaction);

      expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
    });
  });
  describe("existingTransaction()", () => {
    it("returns an existing transaction given an input address", () => {
      transactionPool.setTransaction(transaction);

      expect(
        transactionPool.existingTransaction({
          inputAddress: senderWallet.publicKey
        })
      ).toBe(transaction);
    });
  });
});
