const express = require('express');
const ctx = require('../ctx').getInstance();
const log = ctx.log;
const router = express.Router();

router.get('/switch/frontRunner', async (req, res, next) => {
    ctx.botFrontRunnerEnabled = !ctx.botFrontRunnerEnabled;
    const message = 'Bot front-runner is now ' + (ctx.botFrontRunnerEnabled ? 'ON' : 'OFF');
    log.warn(message);
    res.status(200).json(message);
});

module.exports = router;
