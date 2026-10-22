const express = require("express");
const router = express.Router();
const {
  getEligibleProblems,
  claimProblem,
  getAssignedProblems,
} = require("../controllers/university.controller");

router.get("/problems", getEligibleProblems);
router.patch("/problems/:id/claim", claimProblem);
router.get("/problems/assigned", getAssignedProblems);
module.exports = router;
