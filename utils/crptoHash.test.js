const { cryptoHash } = require(".");
const { SHA256, STRING } = require("../config.js");

describe("cryptoHash()", () => {
  it("should generate sha256 hashed output", () => {
    expect(cryptoHash("foo-bar")).toEqual(
      "291ad95de298fed69e1c8425874cbdf1f4205136978e5e31b7e7e41078b60fc7"
    );
  });
  it("should produce the same hash with same input arguments regardless of the order of the arguments", () => {
    expect(cryptoHash("one", "two", "three")).toEqual(
      cryptoHash("three", "one", "two")
    );
  });
  it("should produce a unique hash when the properties are changed on an input", () => {
    const foo = {};
    const originalHash = cryptoHash(foo);
    foo["a"] = "a";
    expect(cryptoHash(foo)).not.toEqual(originalHash);
  });
});
