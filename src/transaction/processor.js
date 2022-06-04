const { UnimplementedException } = require("../exceptions");
const database = require("../database.js").getInstance();
const ctx = require("../ctx").getInstance();
const log = ctx.log;
const Transaction = require("../model/transaction");
const { parseData, getReseves } = require("./helper");
const { createTransactionSendSwap, createTransactionSwapAll, sendTransation } = require("./sender");
const { computeMaxBuy } = require("./calculator");
const config = require("./config");

async function processTransac(transac, method) {
  const parsedData = parseData(transac, method);
  checkTransac(parsedData, transac);
  if (database.blackListContract.includes(parsedData.tokenBuy)) {
    log.info(transac.hash + " Coin is blacklisted = " + parsedData.tokenBuy);
    return;
  }

  const { reserveIn, reserveOut, pairAddress } = await getReseves(parsedData);

  const { maxBuy, theoricalBenef, theoricalBenefWithFees, amountBuyed, amountOutBob, amountInBob } = computeMaxBuy(transac, parsedData, reserveIn, reserveOut);
  const maxBuyFormatted = maxBuy * 10 ** -18;
  const theoricalBenefFormatted = theoricalBenef * 10 ** -18;
  const theoricalBenefWithFeesFormatted = theoricalBenefWithFees * 10 ** -18;
  if (theoricalBenefWithFeesFormatted > 0) {
    log.info(`
    maxBuyFormatted : ${maxBuyFormatted}
    theoricalBenefFormatted : ${theoricalBenefFormatted}
    theoricalBenefWithFeesFormatted : ${theoricalBenefWithFeesFormatted}
    dextool : https://www.dextools.io/app/bsc/pair-explorer/${pairAddress}
    trx : https://bscscan.com/tx/${transac.hash}
    `);
  }
  if (isBuyable(parsedData) && maxBuyFormatted > 0 && maxBuyFormatted <= config.maxBuy && theoricalBenefWithFeesFormatted > 0) {
    log.warn(transac.hash + " TARGET");
    log.error(transac);
    log.info(
      `${transac.hash} -  \n maxBuy : ${maxBuyFormatted}  theorical benef :  ${theoricalBenefWithFeesFormatted},\n contrat : ${
        parsedData.tokenBuy
      } , amountBuy: ${
        (parsedData.amountIn ? parsedData.amountIn : parsedData.amountInMax) * 10 ** -18
      }  dextool :  https://www.dextools.io/app/bsc/pair-explorer/${pairAddress}\n trx : https://bscscan.com/tx/${transac.hash}`
    );
    const transaction1 = createTransactionSendSwap(
      Math.round(Number(transac.gasPrice) * config.gasMultiple),
      pairAddress,
      parsedData.tokenSold,
      parsedData.tokenBuy,
      maxBuy,
      Math.round(0.99 * amountBuyed),
      ctx.swapperFrontRunnerAddress,
      ctx.accounts[0]
    );
    log.warn(transaction1);
    const transaction2 = createTransactionSwapAll(
      transac.gasPrice,
      pairAddress,
      parsedData.tokenSold,
      parsedData.tokenBuy,
      ctx.swapperFrontRunnerAddress,
      ctx.accounts[0]
    );
    log.warn(transaction2);
    if (ctx.traddingEnabled) {
      // BUY !
      sendTransation(transaction1, ctx.accounts[0]);
      // SELL
      sendTransation(transaction2, ctx.accounts[0]);
    }
  }

  if (isExchangeWithWhiteListPair(parsedData.tokenBuy, parsedData.tokenSold) && !isWhiteList(parsedData.tokenBuy)) {
    saveTransacToStudy(transac, parsedData, { amountOutBob, amountInBob });
  }
}
module.exports = processTransac;

function isBuyable(parsedData) {
  return (
    database.pairWhiteListe.includes(parsedData.tokenSold.toUpperCase()) && // verify is from bnb , busd, usdt
    isWhiteList(parsedData.tokenBuy)
  );
}
function isWhiteList(tokenBuy) {
  const size = database.whiteListeContract.filter((contrat) => {
    return contrat.feeBuy < 0.1 && contrat.feeSell < 0.1 && contrat.address.toUpperCase() == tokenBuy.toUpperCase();
  }).length;
  const wl = size == 1;
  return wl;
}

function saveTransacToStudy(transac, parsedData, calculatedInfo) {
  const transaction = new Transaction({
    ...transac,
    parsedData,
    calculatedInfo,
  });
  transaction
    .save()
    // .then(() => log.info(transac.hash + " : Transaction enregistrée !"))
    .catch((error) => log.error(error));
}

function checkTransac(parsedData, transac) {
  if (parsedData.path.length > 2) {
    throw new UnimplementedException(transac.hash, "3_CONTRACT_ROUTE", "cannot compute 3 contract route for now");
  }
}
function isExchangeWithWhiteListPair(tokenBuy, tokenSold) {
  return database.pairWhiteListe.includes(tokenBuy) || database.pairWhiteListe.includes(tokenSold);
}
