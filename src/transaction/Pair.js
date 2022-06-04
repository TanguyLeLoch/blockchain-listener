const ctx = require("../ctx").getInstance();
const config = require("./config");

class Pair {
  constructor(r0, r1) {
    this.r0 = r0;
    this.r1 = r1;
    this.fee = ctx.feePair;
  }

  swapAmountInBuy(amountIn) {
    const k0 = this.r0 * this.r1;
    const reserveOutUpd = k0 / (this.r0 + amountIn * this.fee);
    const reserveInUpd = this.r0 + amountIn;
    const amountOut = this.r1 - reserveOutUpd;
    this.r0 = reserveInUpd;
    this.r1 = reserveOutUpd;
    return amountOut;
  }

  swapAmountInSell(amountIn) {
    const k0 = this.r0 * this.r1;
    const r1upd = this.r1 + amountIn;
    const r0Upd = k0 / (this.r1 + amountIn * this.fee);
    const amountOut = this.r0 - r0Upd;
    this.r0 = r0Upd;
    this.r1 = r1upd;
    return amountOut;
  }

  swapAmountOutBuy(amountOut) {
    const reserveOutUpd = this.r1 - amountOut;
    const amountIn = (amountOut * this.r0) / reserveOutUpd / this.fee;
    const reserveInUpd = this.r0 + amountIn;
    this.r0 = reserveInUpd;
    this.r1 = reserveOutUpd;
    return amountIn;
  }

  static getMaxBuyforExactAmountIn(amountIn, amountOutMin, reserveIn, reserveOut) {
    ctx.log.trace(`params : amountIn=${amountIn}, amountOutMin=${amountOutMin}, reserveIn=${reserveIn}, reserveOut=${reserveOut}`);
    const tolerance = config.tolerance;
    let x = amountIn * 52;
    let amountOutBob = -1;
    let step = x / 2;
    let previous = true;
    let cpt = 0;
    while (amountOutBob < amountOutMin || amountOutBob > amountOutMin * (1 + tolerance)) {
      const pair = new Pair(reserveIn, reserveOut);
      pair.swapAmountInBuy(x);
      amountOutBob = pair.swapAmountInBuy(amountIn);
      if (amountOutBob < amountOutMin || amountOutBob > amountOutMin * (1 + tolerance)) {
        if (amountOutBob < amountOutMin * (1 + tolerance / 2)) {
          if (!previous) {
            step /= 2;
          }
          x -= step;
          previous = true;
        } else {
          if (previous) {
            step /= 2;
          }
          x += step;
          previous = false;
        }
      }
      cpt++;
      if (cpt > 10000) {
        throw Error(`too much iteration, amountIn=${amountIn}, amountOutMin=${amountOutMin}, reserveIn=${reserveIn}, reserveOut=${reserveOut}, x=${x}`);
      }
      if (cpt > 1000 && x > 100 * config.maxBuy && !previous) {
        ctx.log.debug(`Amount is higher than maxBuy in any case return x=${x}`);
        return Math.floor(x);
      }
    }
    if (x < 0) {
      throw Error(`x<0 amountIn=${amountIn}, amountOutMin=${amountOutMin}, reserveIn=${reserveIn}, reserveOut=${reserveOut}`);
    }
    return Math.floor(x);
  }

  static getMaxBuyforExactAmountOut(amountInMax, amountOut, reserveIn, reserveOut) {
    const tolerance = config.tolerance;
    let x = amountInMax * 52;
    let amountInBob = -1;
    let step = x / 2;
    let previous = true;
    let cpt = 0;
    while (amountInBob > amountInMax || amountInBob < amountInMax * (1 - tolerance)) {
      const pair = new Pair(reserveIn, reserveOut);
      pair.swapAmountInBuy(x);
      amountInBob = pair.swapAmountOutBuy(amountOut);
      if (amountInBob > amountInMax || amountInBob < amountInMax * (1 - tolerance)) {
        if (amountInBob > amountInMax * (1 - tolerance / 2)) {
          if (!previous) {
            step /= 2;
          }
          x -= step;
          previous = true;
        } else {
          if (previous) {
            step /= 2;
          }
          x += step;
          previous = false;
        }
      }
      cpt++;
      if (cpt > 10000) {
        throw Error(`too much iteration, amountInMax=${amountInMax}, amountOut=${amountOut}, reserveIn=${reserveIn}, reserveOut=${reserveOut}, x=${x}`);
      }
      if (cpt > 1000 && x > 100 * config.maxBuy && !previous) {
        ctx.log.debug(`Amount is higher than maxBuy in any case return x=${x}`);
        return Math.floor(x);
      }
    }
    if (x < 0) {
      throw Error(`x<0 amountInMax=${amountInMax}, amountOut=${amountOut}, reserveIn=${reserveIn}, reserveOut=${reserveOut}`);
    }
    return Math.floor(x);
  }

  static computeTheoricalBenefExactAmountIn(maxBuy, reserveIn, reserveOut, amountInBob) {
    const recapIn = [];
    const recapOut = [];
    const pair = new Pair(reserveIn, reserveOut);
    recapIn.push(pair.r0);
    recapOut.push(pair.r1);
    const amountBuyed = pair.swapAmountInBuy(maxBuy);
    recapIn.push(pair.r0);
    recapOut.push(pair.r1);
    const amountOutBob = pair.swapAmountInBuy(amountInBob);
    recapIn.push(pair.r0);
    recapOut.push(pair.r1);
    const coinBack = pair.swapAmountInSell(amountBuyed);
    recapIn.push(pair.r0);
    recapOut.push(pair.r1);
    Pair.logPairBalance(recapIn, recapOut);
    const theoricalBenef = coinBack - maxBuy;
    return { theoricalBenef, amountBuyed, amountOutBob };
  }

  static computeTheoricalBenefExactAmountOut(maxBuy, reserveIn, reserveOut, amountOutBob) {
    const recapIn = [];
    const recapOut = [];
    const pair = new Pair(reserveIn, reserveOut);
    recapIn.push(pair.r0);
    recapOut.push(pair.r1);
    const amountBuyed = pair.swapAmountInBuy(maxBuy);
    recapIn.push(pair.r0);
    recapOut.push(pair.r1);
    const amountInBob = pair.swapAmountOutBuy(amountOutBob);
    recapIn.push(pair.r0);
    recapOut.push(pair.r1);
    const coinBack = pair.swapAmountInSell(amountBuyed);
    recapIn.push(pair.r0);
    recapOut.push(pair.r1);
    Pair.logPairBalance(recapIn, recapOut);
    const theoricalBenef = coinBack - maxBuy;
    return { theoricalBenef, amountBuyed, amountInBob };
  }

  static logPairBalance(recapIn, recapOut) {
    for (let i = 0; i < recapIn.length; i++) {
      ctx.log.trace(`${i}|  ${recapIn[i] / 10 ** 18}  |  ${recapOut[i] / 10 ** 18}  |`);
    }
  }
}

module.exports = Pair;
