const Transaction = require("./transaction");
const { verifySignature } = require("../utils");
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

  describe("input Trx", () => {
    it("should have an input", () => {
      expect(transaction).toHaveProperty("input");
    });
    it("should have a timestamp", () => {
      expect(transaction.input).toHaveProperty("timestamp");
    });
    it("should set the amount to the sender wallet balance", () => {
      expect(transaction.input.amount).toEqual(senderWallet.balance);
    });
    it("should contains the sender wallet public key", () => {
      expect(transaction.input.address).toEqual(senderWallet.publicKey);
    });
    it("should sign the input", () => {
      expect(
        verifySignature({
          publicKey: senderWallet.publicKey,
          data: transaction.outputMap,
          signature: transaction.input.signature
        })
      ).toBe(true);
    });
  });
});
