const { parseData } = require('./helper');
const ctx = require('../ctx').getInstance();
const log = ctx.log;
const config = require('./config');
const Pair = require('./Pair');

function computeMaxBuy(transac, parsedData, reserveIn, reserveOut) {
  let maxBuy, theoricalBenef, amountBuyed, amountOutBob, amountInBob;

  const { amountIn, amountOutMin, amountOut, amountInMax, isAmountInExact } = parsedData;
  if (isAmountInExact) {
    maxBuy = Pair.getMaxBuyforExactAmountIn(Number(amountIn), Number(amountOutMin), Number(reserveIn), Number(reserveOut));
  } else {
    maxBuy = Pair.getMaxBuyforExactAmountOut(Number(amountInMax), Number(amountOut), Number(reserveIn), Number(reserveOut));
  }
  if (maxBuy > config.maxBuy) {
    ctx.log.trace(`${transac.hash} - max buy is too high (${maxBuy} > ${config.maxBuy} so maxBuy is set to ${config.maxBuy})`);
    maxBuy = config.maxBuy;
  }

  if (isAmountInExact) {
    ({ theoricalBenef, amountBuyed, amountOutBob } = Pair.computeTheoricalBenefExactAmountIn(
      Number(maxBuy),
      Number(reserveIn),
      Number(reserveOut),
      Number(amountIn)
    ));
  } else {
    ({ theoricalBenef, amountBuyed, amountInBob } = Pair.computeTheoricalBenefExactAmountOut(
      Number(maxBuy),
      Number(reserveIn),
      Number(reserveOut),
      Number(amountOut)
    ));
  }

  const theoricalBenefWithFees = computeTheoricalBenefWithFees(transac, theoricalBenef);
  return { maxBuy, theoricalBenef, theoricalBenefWithFees, amountBuyed, amountOutBob, amountInBob };
}

module.exports = { computeMaxBuy };

function computeTheoricalBenefWithFees(transac, theoricalBenef) {
  const gasPrice = Number(transac.gasPrice) * config.gasMultiple;
  const transacFee = gasPrice * config.averageGasUsed;
  const theoricalBenefWithFees = theoricalBenef - 2 * transacFee;
  return theoricalBenefWithFees;
}
