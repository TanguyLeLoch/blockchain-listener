module.exports = createApp;

function createApp(chain) {
    const express = require('express');
    require('./startup/setup')(chain);
    const runBotFrontRunner = require('./bot/bot-front-runner');
    const ctx = require('./ctx').getInstance();
    const log = ctx.log;

    const app = express();

    require('./startup/routes')(app);
    try {
        runBotFrontRunner();
    } catch (e) {
        log.error('catching error... ');
        log.error(e);
    }
    return app;
}
