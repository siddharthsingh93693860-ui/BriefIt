const express = require("express");
const router = express.Router();
const {
  createProblem,
  getAllProblems,
  getProblemById,
  updateProblemStatus,
} = require("../controllers/problem.controller");

router.post("/", createProblem);
router.get("/", getAllProblems);
router.get("/:id", getProblemById);
router.patch("/:id/status", updateProblemStatus);

module.exports = router;
