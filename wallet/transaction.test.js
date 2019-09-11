const Transaction = require("./transaction");
const Wallet = require(".");

describe("Transaction", () => {
  let transaction, senderWallet, recipient, amount;
  beforeEach(() => {
    senderWallet = new Wallet();
    recipient = "recipient-public-key";
    amount = 50;
    transaction = new Transaction({
      senderWallet,
      recipient,
      amount
    });
  });
  it("should have an ID", () => {
    expect(transaction).toHaveProperty("id");
  });
  describe("outputMap", () => {
    it("should have an outputMap", () => {
      expect(transaction).toHaveProperty("outputMap");
    });

    it("should output the amount to the recipient", () => {
      expect(transaction.outputMap[recipient]).toEqual(amount);
    });
    it("should output the remaining balance in senders wallet", () => {
      expect(transaction.outputMap[senderWallet.publicKey]).toEqual(
        senderWallet.balance - amount
      );
    });
  });
});
