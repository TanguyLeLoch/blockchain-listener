const actions = new Map();
actions.set("0x8803dbee", { name: "swapTokensForExactTokens", amountOut: 0, amountInMax: 1, nonce: 2, to: 3, deadline: 4, pathLength: 5, path: 6 });
actions.set("0x7ff36ab5", { name: "swapExactETHForTokens", amountOutMin: 0, nonce: 1, to: 2, deadline: 3, pathLength: 4, path: 5 });
actions.set("0xfb3bdb41", { name: "swapETHForExactTokens", amountOut: 0, nonce: 1, to: 2, deadline: 3, pathLength: 4, path: 5 });
actions.set("0x38ed1739", { name: "swapExactTokensForTokens", amountIn: 0, amountOutMin: 1, nonce: 2, to: 3, deadline: 4, pathLength: 5, path: 6 });

// const actionSellForEth = new Map();
actions.set("0x18cbafe5", { name: "swapExactTokensForETH", amountIn: 0, amountOutMin: 1, nonce: 2, to: 3, deadline: 4, pathLength: 5, path: 6 });
actions.set("0x4a25d94a", { name: "swapTokensForExactETH", amountOut: 0, amountInMax: 1, nonce: 2, to: 3, deadline: 4, pathLength: 5, path: 6 });

module.exports = actions;

const otherAction = new Map();
otherAction.set("0xbaa2abde", "removeLiquidity");

// actionBuyToken.set("0x5c11d795", {
//   name: "swapExactTokensForTokensSupportingFeeOnTransferTokens",
//   amountIn: 0,
//   amountOutMin: 1,
//   nonce: 2,
//   to: 3,
//   deadline: 4,
//   pathLength: 5,
//   path: 6,
// });
// actionBuyToken.set("0xb6f9de95", {
//   name: "swapExactETHForTokensSupportingFeeOnTransferTokens",
//   amountOutMin: 0,
//   nonce: 1,
//   to: 2,
//   deadline: 3,
//   pathLength: 4,
//   path: 5,
// });
// actionSellForEth.set("0x791ac947", "swapExactTokensForETHSupportingFeeOnTransferTokens");
