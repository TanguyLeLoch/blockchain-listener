const express = require("express");
const router = express.Router();
const Contract = require("../model/contract");
const ctx = require("../ctx").getInstance();
const log = ctx.log;

// GET ALL
router.get("/", async (req, res, next) => {
  Contract.find()
    .then((contracts) => res.status(200).json(contracts))
    .catch((error) => res.status(400).json({ error }));
});
// GET by address
router.get("/address/:address", async (req, res, next) => {
  const address = req.params.address;
  Contract.findOne({ address })
    .then((contracts) => res.status(200).json(contracts))
    .catch((error) => res.status(400).json({ error }));
});

// GET by address
router.get("/sortBy/:sortingParam", async (req, res, next) => {
  const sortingParam = req.params.sortingParam;
  let sortingObj = {};
  sortingObj[sortingParam] = "desc";

  Contract.find()
    .sort(sortingObj)
    .then((contracts) => res.status(200).json(contracts))
    .catch((error) => res.status(400).json({ error }));
});

// GET by color
router.get("/color/:color", async (req, res, next) => {
  const color = req.params.color;
  Contract.find({ color })
    .then((contracts) => res.status(200).json(contracts))
    .catch((error) => res.status(400).json({ error }));
});
// POST
router.post("/", async (req, res, next) => {
  const contract = new Contract({
    ...req.body,
  });
  contract
    .save()
    .then(() => res.status(201).json({ message: "Contract enregistré !" }))
    .catch((error) => res.status(400).json({ error }));
});
// PUT
router.put("/", async (req, res, next) => {
  Contract.updateOne({ address: req.body.address }, req.body)
    .then((retour) => {
      log.info("retour = " + JSON.stringify(retour));
      res.status(200).json({ message: "Objet modifié !" });
    })
    .catch((error) => res.status(400).json({ error }));
});

// DELETE ALL
router.delete("/", async (req, res, next) => {
  const message = "Delete all contracts";
  log.warn(message);
  Contract.deleteMany()
    .then(() => res.status(202).json(message))
    .catch((error) => res.status(400).json({ error }));
});

module.exports = router;
