const routerMap = new Map();
routerMap.set('bsc', '0x10ED43C718714eb63d5aA57B78B54704E256024E'); // pancake
routerMap.set('fantom', '0xF491e7B69E4244ad4002BC14e878a34207E38c29'); // spooki swap
routerMap.set('avalanche', '0x60aE616a2155Ee3d9A68541Ba4544862310933d4'); // trader joe
routerMap.set('bsctestnet', '0xD99D1c33F9fC3444f8101754aBC46c52416550D1'); // pancake testnet

const factoryMap = new Map();
factoryMap.set('bsc', '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73'); // pancake
factoryMap.set('bsctestnet', '0x6725F303b657a9451d8BA641348b6761A6CC7a17'); // pancake testnet

const feePairMap = new Map();
feePairMap.set('bsc', 0.9975);
feePairMap.set('bsctestnet', 0.998);

const initCodeHashMap = new Map();
initCodeHashMap.set('bsc', '0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5');
initCodeHashMap.set('bsctestnet', '0xd0d4c4cd0848c93cb4fd1f498d7013ee6bfb25783ea21593d5834f5d250ece66');
function instanciateRouter(web3, router) {
  return new web3.eth.Contract(
    [
      {
        inputs: [
          { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
          { internalType: 'address[]', name: 'path', type: 'address[]' },
        ],
        name: 'getAmountsOut',
        outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [
          { internalType: 'uint256', name: 'amountOut', type: 'uint256' },
          { internalType: 'address[]', name: 'path', type: 'address[]' },
        ],
        name: 'getAmountsIn',
        outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    router
  );
}
module.exports = { routerMap, factoryMap, initCodeHashMap, instanciateRouter, feePairMap };
