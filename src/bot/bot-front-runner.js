const { UnimplementedException } = require('../exceptions');
const { sleep, formatTimestamp } = require('../tools/tools');
const ctx = require('../ctx').getInstance();
const log = ctx.log;

const processTransac = require('../transaction/processor');
const actions = require('../mapping');

const analyseTransaction = require('../transaction/analyzer');

const MAX_REQUEST_PER_MINUTE = 300;
const nb_transac_buffer = [0, 0];
const subscriptionHolder = { subscription: undefined };

async function runBot() {
    log.info(`launching bot on ${ctx.chain}`);
    subscriptionHolder.subscription = undefined;
    while (true) {
        if (ctx.botFrontRunnerEnabled) {
            if (!subscriptionHolder.subscription) {
                subscriptionHolder.subscription = subPendingTransac();
            }
            const now = new Date();
            const idx = now.getMinutes() % 2;
            const sec = now.getSeconds();
            if (nb_transac_buffer[idx] > MAX_REQUEST_PER_MINUTE) {
                unsubscribe();
                const timeToSleep = (60 - sec) * 1000;
                log.info('time to sleep = ' + timeToSleep + 'ms, wake up at ' + formatTimestamp(Date.now() + timeToSleep));
                analyseTransaction();
                await sleep(timeToSleep);
                log.info('wakey wakey');
                subscriptionHolder.subscription = subPendingTransac();
            }
            nb_transac_buffer[(idx + 1) % 2] = 0;
            // log.info(`nb_transac_buffer=${nb_transac_buffer}`);
        } else if (subscriptionHolder.subscription) {
            unsubscribe();
        }
        await sleep(100);
    }
}

module.exports = runBot;

function subPendingTransac() {
    log.warn('subPendingTransac');
    let cpt = 0;
    return ctx.web3.eth.subscribe('pendingTransactions', function (error, transacHash) {
        if (transacHash && cpt++ % 4 === 0) {
            const now = new Date();
            const idx = now.getMinutes() % 2;
            nb_transac_buffer[idx]++;

            ctx.web3.eth.getTransaction(transacHash).then((transac) => {
                if (transac && transac.to === ctx.router) {
                    const data = transac.input;
                    const methodSignature = data.substring(0, 10);
                    if (actions.get(methodSignature)) {
                        processTransac(transac, methodSignature)
                            .then((res) => res)
                            .catch((e) => {
                                if (e instanceof UnimplementedException) {
                                    //log.warn("hash : " + e.hash + " - code : " + e.code + " - message : " + e.message);
                                } else {
                                    log.error(`${transacHash} -  ${e}`);
                                }
                            });
                    }
                }
            });
            cpt = 0;
        } else if (error) {
            log.info(error);
        }
    });
}

function unsubscribe() {
    subscriptionHolder.subscription.unsubscribe((error, success) => {
        if (success) {
            log.info('Successfully unsubscribed!');
            subscriptionHolder.subscription = undefined;
        } else if (error) {
            log.error(error);
        }
    });
}
