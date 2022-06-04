class UnimplementedException extends Error {
  constructor(hash, code, message) {
    super(message);
    this.hash = hash;
    this.code = code;
    this.name = "UnimplementedException";
  }
}

class WeirdSwapLogExeption extends Error {
  constructor(hash, code, message) {
    super(message);
    this.hash = hash;
    this.code = code;
    this.name = "WeirdSwapLogExeption";
  }
}
module.exports = { UnimplementedException, WeirdSwapLogExeption };
