const Wallet = require(".");
const Blockchain = require("../blockchain/blockchain");
const { verifySignature } = require("../utils");
const { STARTING_BALANCE } = require("../config");
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
    describe("and a chain is passed", () => {
      it("calls `Wallet.calculateBalance`", () => {
        const calculateBalanceMock = jest.fn();

        const originalCalculateBalance = Wallet.calculateBalance;

        Wallet.calculateBalance = calculateBalanceMock;

        wallet.createTransaction({
          recipient: "foo",
          amount: 10,
          chain: new Blockchain().chain
        });

        expect(calculateBalanceMock).toHaveBeenCalled();

        Wallet.calculateBalance = originalCalculateBalance;
      });
    });
  });

  describe("calculateBalance()", () => {
    let blockchain;
    beforeEach(() => {
      blockchain = new Blockchain();
    });
    describe("and there are no outputs to the wallet", () => {
      it("should return the STARTING_BALANCE", () => {
        expect(
          Wallet.calculateBalance({
            chain: blockchain.chain,
            address: wallet.publicKey
          })
        ).toEqual(STARTING_BALANCE);
      });
    });
    describe("and there are o/p for wallets", () => {
      let trx1, trx2;
      beforeEach(() => {
        trx1 = new Wallet().createTransaction({
          recipient: wallet.publicKey,
          amount: 50
        });
        trx2 = new Wallet().createTransaction({
          recipient: wallet.publicKey,
          amount: 60
        });
        blockchain.addBlock({ data: [trx1, trx2] });
      });
      it("should add the sum to the wallet balance", () => {
        expect(
          Wallet.calculateBalance({
            chain: blockchain.chain,
            address: wallet.publicKey
          })
        ).toEqual(
          STARTING_BALANCE +
            trx1.outputMap[wallet.publicKey] +
            trx2.outputMap[wallet.publicKey]
        );
      });
      describe("and the wallet has made a trx", () => {
        let recentTrx;
        beforeEach(() => {
          recentTrx = wallet.createTransaction({
            recipient: "bar-address",
            amount: 30
          });
          blockchain.addBlock({ data: [recentTrx] });
        });
        it("should return the output amount of the recent trx", () => {
          expect(
            Wallet.calculateBalance({
              chain: blockchain.chain,
              address: wallet.publicKey
            })
          ).toEqual(recentTrx.outputMap[wallet.publicKey]);
        });
        describe("and there are outputs next to and after the recent trx", () => {
          let sameBlockTransaction, nextBlockTransaction;

          beforeEach(() => {
            recentTransaction = wallet.createTransaction({
              recipient: "later-foo-address",
              amount: 60
            });

            sameBlockTransaction = Transaction.rewardTransaction({
              minerWallet: wallet
            });

            blockchain.addBlock({
              data: [recentTransaction, sameBlockTransaction]
            });

            nextBlockTransaction = new Wallet().createTransaction({
              recipient: wallet.publicKey,
              amount: 75
            });

            blockchain.addBlock({ data: [nextBlockTransaction] });
          });

          it("includes the output amounts in the returned balance", () => {
            expect(
              Wallet.calculateBalance({
                chain: blockchain.chain,
                address: wallet.publicKey
              })
            ).toEqual(
              recentTransaction.outputMap[wallet.publicKey] +
                sameBlockTransaction.outputMap[wallet.publicKey] +
                nextBlockTransaction.outputMap[wallet.publicKey]
            );
          });
        });
      });
    });
  });
});
