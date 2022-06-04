const express = require("express");
const contractRouter = require("../routes/contractRouter");
const transactionRouter = require("../routes/transactionRouter");
const botRouter = require("../routes/botRouter");
const log = require("../ctx").getInstance().log;

const logRequest = (req, res, next) => {
  log.info(req.method + " on " + req.url + " with payload : " + JSON.stringify(req.body));
  next();
};

module.exports = function (app) {
  app.use(express.json());
  app.use(logRequest);
  app.use("/api/contract", contractRouter);
  app.use("/api/transaction", transactionRouter);
  app.use("/api/bot", botRouter);
};
