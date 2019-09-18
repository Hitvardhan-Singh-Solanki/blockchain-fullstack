const Wallet = require(".");
const { verifySignature } = require("../utils");
const Transaction = require("./transaction");
describe("Wallet", () => {
  let wallet;
  beforeEach(() => {
    wallet = new Wallet();
  });

  it("has a balance", () => {
    expect(wallet).toHaveProperty("balance");
  });
  it("should have a public key", () => {
    expect(wallet).toHaveProperty("publicKey");
  });
  describe("sign a data", () => {
    const data = "foobar";
    it("should verify a signature", () => {
      expect(
        verifySignature({
          publicKey: wallet.publicKey,
          data,
          signature: wallet.sign(data)
        })
      ).toBe(true);
    });
    it("should not verify an invalid signature", () => {
      expect(
        verifySignature({
          publicKey: wallet.publicKey,
          data,
          signature: new Wallet().sign(data)
        })
      ).toBe(false);
    });
  });

  describe("createTransaction()", () => {
    describe("and the amount exceeds the balance", () => {
      it("should throw an error", () => {
        expect(() =>
          wallet.createTransaction({
            amount: 999999999999,
            recipient: "foo-recipient"
          })
        ).toThrow("Amount exceeds balance");
      });
    });

    describe("and the amount is valid", () => {
      let transaction, amount, recipient;
      beforeEach(() => {
        amount = 50;
        recipient = "foo-recipient";
        transaction = wallet.createTransaction({ amount, recipient });
      });
      it("should create and instance of trx", () => {
        expect(transaction instanceof Transaction).toBe(true);
      });
      it("should match the trx input with the wallet", () => {
        expect(transaction.input.address).toEqual(wallet.publicKey);
      });
      it("should output the amount the recipient", () => {
        expect(transaction.outputMap[recipient]).toEqual(amount);
      });
    });
  });
});
