const cryptoHash = require("./cryptoHash");
const { SHA256, STRING } = require("../config.js");

describe("cryptoHash()", () => {
  it("should generate sha256 hashed output", () => {
    expect(cryptoHash(STRING)).toEqual(SHA256);
  });
  it("should produce the same hash with same input arguments regardless of the order of the arguments", () => {
    expect(cryptoHash("one", "two", "three")).toEqual(
      cryptoHash("three", "one", "two")
    );
  });
});
