const ctx = require('../ctx').getInstance();
const database = require('../database').getInstance();
const Contract = require('../model/contract');
const { pairWhiteListe, swapperFrontRunner } = require('../addresses');

require('dotenv').config();

function setup(chain) {
    setupLogger(chain);
    setupMongoose(chain);
    setupContext(chain);
    setupDatabase(chain);
    setupNonce();
    setupSwapperAddresses(chain);
}

module.exports = setup;

function setupMongoose(chain) {
    const mongoose = require('mongoose');
    mongoose
        .connect(`mongodb://localhost:27017/blockchain-listener-${chain}`)
        .then(() => ctx.log.info('Connexion à MongoDB réussie !'))
        .catch(() => ctx.log.info('Connexion à MongoDB échouée !'));
    ctx.mongoose = mongoose;
}

function setupLogger(chain) {
    // create a rolling file logger based on date/time that fires process events
    const opts = {
        errorEventName: 'error',
        logDirectory: './logs',
        fileNamePattern: `${chain}-<DATE>.log`,
        dateFormat: 'YYYY.MM.DD-HH',
    };
    const manager = require('simple-node-logger').createLogManager();
    manager.createRollingFileAppender(opts);
    ctx.log = manager.createLogger('', 'info');
}

function setupContext(chain) {
    const web3 = require('../web3Provider').get(chain);
    const { routerMap, factoryMap, initCodeHashMap, instanciateRouter, feePairMap } = require('../dexRouter');
    ctx.router = routerMap.get(chain);
    ctx.web3 = web3;
    ctx.chain = chain;
    ctx.accounts = createListOfAccount(1);
    ctx.factory = factoryMap.get(chain);
    ctx.initCodeHash = initCodeHashMap.get(chain);
    ctx.routerContract = instanciateRouter(web3, ctx.router);
    ctx.feePair = feePairMap.get(chain);
}

function setupDatabase(chain) {
    Contract.find({ color: 'white' })
        .then((contracts) => {
            database.whiteListeContract = contracts.map((c) => {
                return { address: c.address, feeBuy: c.feeBuy, feeSell: c.feeSell };
            });
        })
        .catch((e) => log.error('error updating white liste'));

    database.pairWhiteListe = pairWhiteListe.get(chain);
}

function setupNonce() {
    const web3 = ctx.web3;
    const accounts = ctx.accounts;
    for (let account of accounts) {
        web3.eth.getTransactionCount(account.address).then((n) => {
            account.nonce = n - 1;
            ctx.log.info(`${account.address} - nonce : ${account.nonce}`);
        });
    }
}

function setupSwapperAddresses(chain) {
    ctx.swapperFrontRunnerAddress = swapperFrontRunner.get(chain);
}

function createListOfAccount(n) {
    const { web3 } = ctx;
    const accounts = [];
    for (let i = 0; i < n; i++) {
        const account = {};
        account.decryptedAccount = web3.eth.accounts.privateKeyToAccount(process.env['PRIVATE_KEY_' + i]);
        account.address = account.decryptedAccount.address;
        account.nonce = null;
        accounts.push(account);
    }
    return accounts;
}
