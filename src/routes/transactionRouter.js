const express = require('express');
const router = express.Router();
const Transaction = require('../model/transaction');
const ctx = require('../ctx').getInstance();
const log = ctx.log;
const analyseTransaction = require('../transaction/analyzer');

// GET ALL
router.get('/', async (req, res, next) => {
    Transaction.find()
        .then((transactions) => res.status(200).json(transactions))
        .catch((error) => res.status(400).json({ error }));
});

// GET by hash
router.get('/hash/:hash', async (req, res, next) => {
    const hash = req.params.hash;
    Transaction.findOne({ hash })
        .then((transaction) => {
            if (transaction) {
                return res.status(200).json(transaction);
            } else {
                log.info('unknow hash, retrieve from blockchain');
                return ctx.web3.eth.getTransactionReceipt(hash);
            }
        })
        .then((trx) => res.status(200).json(trx))
        .catch((error) => res.status(400).json({ error }));
});

// DELETE ALL
router.delete('/', async (req, res, next) => {
    const message = 'Delete all transactions';
    log.warn(message);
    Transaction.deleteMany()
        .then(() => res.status(202).json(message))
        .catch((error) => res.status(400).json({ error }));
});

// ANALYSE
router.get('/analyse', async (req, res, next) => {
    const message = 'Analyse all transactions';
    analyseTransaction()
        .then(() => res.status(202).json(message))
        .catch((error) => res.status(400).json({ error }));
});

// Post buy
router.post('/', async (req, res, next) => {
    const message = 'transaction créée !';
    sendFakeBuy(ctx.accounts[1]);
    res.status(201).json(message);
});

module.exports = router;
