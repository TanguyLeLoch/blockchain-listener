const Transaction = require("../model/transaction");
const { WeirdSwapLogExeption } = require("../exceptions");
const Contract = require("../model/contract");
const ctx = require("../ctx").getInstance();
const database = require("../database").getInstance();
const log = ctx.log;

const swapEvent = "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822";

async function analyseTransaction() {
  const transactions = await retrieveTransaction();
  for (const transaction of transactions) {
    await analyseThisTransaction(transaction);
  }
  await Contract.find({ color: "white" })
    .then((contracts) => {
      database.whiteListeContract = contracts.map((c) => {
        return { address: c.address, feeBuy: c.feeBuy, feeSell: c.feeSell };
      });
    })
    .catch((e) => log.error("error updating white liste"));
}

module.exports = analyseTransaction;

async function analyseThisTransaction(transaction) {
  const tokenAddress = database.pairWhiteListe.includes(transaction.parsedData.tokenSold) ? transaction.parsedData.tokenBuy : transaction.parsedData.tokenSold;

  const receipt = await ctx.web3.eth.getTransactionReceipt(transaction.hash);
  if (receipt) {
    if (receipt.status) {
      let contract = await Contract.findOne({ address: tokenAddress });
      if (!contract) {
        contract = new Contract({ address: tokenAddress, color: "gray" });
        await contract.save();
      }
      try {
        await compareReceiptAndTransac(transaction, receipt, contract);
      } catch (e) {
        if (e instanceof WeirdSwapLogExeption) {
          log.info("hash : " + e.hash + " - code : " + e.code + " - message : " + e.message);
        } else {
          log.error(e);
        }
      }
    } else {
      log.info(transaction.hash + " transaction reverted");
    }

    if (ctx.deleteTransaction) {
      log.trace(transaction.hash + " deleting transaction...");
      await Transaction.deleteOne({ _id: transaction._id });
    }
  } else {
    log.info(transaction.hash + " transac still not processed");
  }
}

async function retrieveTransaction() {
  return await Transaction.find();
}

async function compareReceiptAndTransac(transaction, receipt, contract) {
  const isAmountInExact = transaction.parsedData.isAmountInExact;
  const swapLogs = receipt.logs.filter((element) => element.topics[0] === swapEvent);
  if (swapLogs.length != 1) {
    throw new WeirdSwapLogExeption(transaction.hash, "2_SWAP_LOG", "2 swap log in a single transaction");
  }
  const swapLog = swapLogs[0];

  let fee = calculateFee(isAmountInExact, transaction, swapLog);

  if (transaction.parsedData.tokenBuy === contract.address) {
    log.trace(transaction.hash + " buy");
    contract.feesBuy = contract.feesBuy.filter((item) => item.sender != transaction.from);
    contract.feesBuy.push({ fee, hash: transaction.hash, sender: transaction.from });
    contract.feeBuy = computeAverageFee(contract.feesBuy);
  } else {
    log.trace(transaction.hash + " sell");
    contract.feesSell = contract.feesSell.filter((item) => item.sender != transaction.from);
    contract.feesSell.push({ fee, hash: transaction.hash, sender: transaction.from });
    contract.feeSell;
    contract.feeSell = computeAverageFee(contract.feesSell);
    const seller = transaction.from;
    if (!contract.sellers.includes(seller)) {
      contract.sellers.push(seller);
      if (contract.sellers.length > 5 && contract.color != "black") {
        contract.color = "white";
        log.info(`Contrat just whitelisted : ${contract.address}`);
      }
    }
  }
  manageWhiteListing(contract);
  // contract.transactions.push(transaction.hash);
  await Contract.updateOne({ address: contract.address }, contract);
}

function computeAverageFee(fees) {
  let feesSorted = fees.map((f) => f.fee).sort((a, b) => a - b);
  const len = feesSorted.length;
  const bornInf = Math.round(len * 0.2);
  const bornSup = Math.round(len * 0.7);
  feesSorted = feesSorted.slice(bornInf, bornSup);
  return feesSorted.reduce((a, b) => a + b) / feesSorted.length;
}

function manageWhiteListing(contract) {
  if (contract.sellers.length > 5 && contract.feeBuy != undefined && contract.feeBuy < 0.1 && contract.feeSell < 0.1) {
    contract.color = "white";
  }
}

function calculateFee(isAmountInExact, transaction, swapLog) {
  let fee;
  const { amount0Out, amount1Out, amount0In, amount1In } = extractFromSwapLog(swapLog);
  if (!(amount0Out == 0 || amount1Out == 0) || !(amount0In == 0 || amount1In == 0)) {
    throw new WeirdSwapLogExeption(transaction.hash, "WEIRD_SWAP_LOG", "(amount0Out or amount1Out) and (amount0In or amount1In) should be equals to 0");
  }
  if (isAmountInExact) {
    const amountOutTheorical = transaction.calculatedInfo.amountOutBob;
    const amountOut = amount1Out > amount0Out ? amount1Out : amount0Out;
    fee = ((amountOutTheorical - amountOut) / amountOutTheorical) * 100;
  } else {
    const amountInTheorical = transaction.calculatedInfo.amountInBob;
    const amountIn = amount0In > amount1In ? amount0In : amount1In;
    fee = ((amountIn - amountInTheorical) / amountInTheorical) * 100;
  }

  if (fee < 0) {
    fee = 0.00001;
  }
  return fee;
}

function extractFromSwapLog(swapLog) {
  let data = swapLog.data.substring(2);

  const amount0In = parseInt(data.substring(0, 64), 16);
  data = data.substring(64);
  const amount1In = parseInt(data.substring(0, 64), 16);
  data = data.substring(64);
  const amount0Out = parseInt(data.substring(0, 64), 16);
  data = data.substring(64);
  const amount1Out = parseInt(data.substring(0, 64), 16);
  return { amount0In, amount1In, amount0Out, amount1Out };
}
