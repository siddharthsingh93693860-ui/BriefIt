const express = require("express");

const router = express.Router();

const solutionController = require("../controllers/solution.controller");

router.post("/", solutionController.createSolution);

router.get("/citizen", solutionController.getCitizenSolutions);

router.patch("/:id/approve", solutionController.approveSolution);

router.get("/industry", solutionController.getIndustrySolutions);

router.patch("/:id/fund", solutionController.fundSolution);

module.exports = router;
