const ctx = require("../ctx").getInstance();
const database = require("../database").getInstance();
const log = ctx.log;
const web3 = ctx.web3;

function createTransactionSendSwap(gasPriceArg, pairAddress, tokenSold, tokenBuy, amount, amountMin, swapperAddress, accountFrom) {
  log.info("createTransactionSendSwap");

  const value = web3.utils.toHex("0");
  const gasPrice = gasPriceArg;
  const gas = 250000;
  const from = accountFrom.address;
  const to = swapperAddress;
  const data = createSendSwap(pairAddress, tokenSold, tokenBuy, amount, amountMin);
  const nonce = ++accountFrom.nonce;
  const transac = { from, to, value, gasPrice, gas, data, nonce };

  return transac;
}
function createTransactionSwapAll(gasPriceArg, pairAddress, tokenSold, tokenBuy, contractAddress, accountFrom) {
  log.info("createTransactionSwapAll");

  const value = web3.utils.toHex("0");
  const gasPrice = gasPriceArg;
  const gas = 250000;
  const from = accountFrom.address;
  const to = contractAddress;
  const data = createSwapAll(pairAddress, tokenSold, tokenBuy);
  const nonce = ++accountFrom.nonce;
  const transac = { from, to, value, gasPrice, gas, data, nonce };
  return transac;
}

function sendTransation(transactionToSend, account) {
  account.decryptedAccount
    .signTransaction(transactionToSend)
    .then((signedTx) => web3.eth.sendSignedTransaction(signedTx.rawTransaction))
    .then((receipt) => log.warn("Transaction receipt: ", receipt))
    .catch((err) => log.fatal(err));
}

module.exports = { createTransactionSendSwap, createTransactionSwapAll, sendTransation };

function createSendSwap(pairAddress, input, output, amount, amountMin) {
  log.info("createSendSwap");
  amount = Math.round(amount).toString(16);
  amountMin = Math.round(amountMin).toString(16);
  amountText = "0".repeat(64 - amount.length) + amount;
  amountMinText = "0".repeat(64 - amountMin.length) + amountMin;
  return (
    "0xed592445" +
    "000000000000000000000000" +
    pairAddress.toString().substring(2) +
    "000000000000000000000000" +
    input.toString().substring(2) +
    "000000000000000000000000" +
    output.toString().substring(2) +
    amountText +
    amountMinText
  );
}

function createSwapAll(pairAddress, output, input) {
  log.info("createSwapAll");

  return (
    "0xfeb8e171" +
    "000000000000000000000000" +
    pairAddress.toString().substring(2) +
    "000000000000000000000000" +
    input.toString().substring(2) +
    "000000000000000000000000" +
    output.toString().substring(2)
  );
}
