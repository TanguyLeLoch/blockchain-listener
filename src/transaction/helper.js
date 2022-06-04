const actions = require("../mapping");
const ctx = require("../ctx").getInstance();
const log = ctx.log;
Number.prototype.toFixedSpecial = require("../tools/tools").toFixedSpecial;

async function getReseves(parsedData) {
  const { tokenBuy, tokenSold, functionInfo, path, methodName, amountIn, amountInMax, amountOut, amountOutMin } = parsedData;

  const pairAddress = pairFor(tokenSold, tokenBuy);
  const pairContract = instanciatePair(ctx.web3, pairAddress);
  const { _reserve0, _reserve1 } = await pairContract.methods.getReserves().call();
  let [reserveBuy, reserveSold] = tokenBuy < tokenSold ? [_reserve0, _reserve1] : [_reserve1, _reserve0];
  const reserveOut = Number(reserveBuy);
  const reserveIn = Number(reserveSold);

  return { reserveIn, reserveOut, pairAddress };
}
function pairFor(tokenA, tokenB) {
  const web3 = ctx.web3;
  const factory = ctx.factory;
  const initCodeHash = ctx.initCodeHash;
  let [token0, token1] = tokenA < tokenB ? [tokenA, tokenB] : [tokenB, tokenA];
  let abiEncoded1 = web3.eth.abi.encodeParameters(["address", "address"], [token0, token1]);
  abiEncoded1 = abiEncoded1.split("0".repeat(24)).join("");
  let salt = web3.utils.soliditySha3(abiEncoded1);
  let abiEncoded2 = web3.eth.abi.encodeParameters(["address", "bytes32"], [factory, salt]);
  abiEncoded2 = abiEncoded2.split("0".repeat(24)).join("").substr(2);
  let pair = "0x" + web3.utils.soliditySha3("0xff" + abiEncoded2, initCodeHash).substr(26);
  return pair;
}

function splitArgs(data) {
  let argsData = data.substring(10);
  const args = [];
  while (argsData.length > 0) {
    args.push(argsData.substring(0, 64));
    argsData = argsData.substring(64);
  }
  return args;
}

function parseData(transac, method) {
  const data = transac.input;
  const args = splitArgs(data);
  const functionInfo = actions.get(method);
  const methodName = functionInfo.name;
  const isAmountInExact = methodName === "swapExactTokensForTokens" || methodName === "swapExactETHForTokens" || methodName === "swapExactTokensForETH";
  const isAmountOutExact = methodName === "swapTokensForExactTokens" || methodName === "swapETHForExactTokens" || methodName === "swapTokensForExactETH";
  const nbPath = parseInt(args[functionInfo.pathLength]);
  const path = [];
  for (let i = 0; i < nbPath; i++) {
    path.push("0x" + args[functionInfo.path + i].substring(24));
  }
  const tokenSold = path[0];
  const tokenBuy = path[nbPath - 1];
  let amountIn = functionInfo.amountIn != undefined ? parseInt(args[functionInfo.amountIn], 16) : null;
  if (methodName == "swapExactETHForTokens") {
    amountIn = Number(transac.value);
  }
  let amountOutMin = functionInfo.amountOutMin != undefined ? parseInt(args[functionInfo.amountOutMin], 16) : null;
  if (amountOutMin === 0) {
    amountOutMin = 1;
  }
  let amountInMax = functionInfo.amountInMax != undefined ? parseInt(args[functionInfo.amountInMax], 16) : null;
  if (methodName == "swapETHForExactTokens") {
    amountInMax = Number(transac.value);
  }
  const amountOut = functionInfo.amountOut != undefined ? parseInt(args[functionInfo.amountOut], 16) : null;
  return { tokenBuy, tokenSold, functionInfo, path, methodName, amountIn, amountInMax, amountOut, amountOutMin, isAmountInExact, isAmountOutExact };
}

function instanciatePair(web3, pairAddress) {
  return new web3.eth.Contract(
    [
      {
        constant: true,
        inputs: [],
        name: "getReserves",
        outputs: [
          {
            internalType: "uint112",
            name: "_reserve0",
            type: "uint112",
          },
          {
            internalType: "uint112",
            name: "_reserve1",
            type: "uint112",
          },
          {
            internalType: "uint32",
            name: "_blockTimestampLast",
            type: "uint32",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
    ],
    pairAddress
  );
}

module.exports = { getReseves, pairFor, splitArgs, parseData, instanciatePair };
