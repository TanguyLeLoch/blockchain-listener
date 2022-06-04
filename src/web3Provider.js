require('dotenv').config();
const moralisKey = process.env.MORALIS_KEY;
const Web3 = require('web3');
const ctx = require('./ctx').getInstance();
const log = ctx.log;

const providers = new Map();
const web3Bsc = new Web3(Web3.givenProvider || `wss://speedy-nodes-nyc.moralis.io/${moralisKey}/bsc/mainnet/ws`);
providers.set('bsc', web3Bsc);
providers.set('avalanche', new Web3(Web3.givenProvider || `wss://speedy-nodes-nyc.moralis.io/${moralisKey}/avalanche/mainnet/ws`));
providers.set('fantom', new Web3(Web3.givenProvider || `wss://speedy-nodes-nyc.moralis.io/${moralisKey}/fantom/mainnet/ws`));
providers.set('bsctestnet', new Web3(Web3.givenProvider || `wss://speedy-nodes-nyc.moralis.io/${moralisKey}/bsc/testnet/ws`));

module.exports = providers;

const provider = new Web3.providers.WebsocketProvider(`wss://speedy-nodes-nyc.moralis.io/${moralisKey}/bsc/mainnet/ws`);
provider.on('error', (e) => log.error('WS Error', e));
provider.on('end', (e) => log.error('WS End', e));
