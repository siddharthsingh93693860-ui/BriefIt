const Problem = require("../../../../BriefIt/BriefItBackend/src/models/problem");
const University = require("../models/university");

exports.getEligibleProblems = async (req, res) => {
  try {
    const { universityId } = req.query;

    const university = await University.findById(universityId);
    if (!university) {
      return res
        .status(404)
        .json({ success: false, message: "University not found" });
    }

    const problems = await Problem.find({
      category: { $in: university.domain },
      status: "submitted",
      assignedUniversity: null,
    }).sort({ rank: -1 });

    res.status(200).json({ success: true, problems });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.claimProblem = async (req, res) => {
  try {
    const { universityId } = req.body;
    const { id } = req.params;

    const problem = await Problem.findById(id);
    if (!problem) {
      return res
        .status(404)
        .json({ success: false, message: "Problem not found" });
    }
    if (problem.assignedUniversity) {
      return res
        .status(400)
        .json({ success: false, message: "Problem already claimed" });
    }

    problem.assignedUniversity = universityId;
    problem.status = "assigned";
    await problem.save();

    res.status(200).json({ success: true, problem });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
exports.getAssignedProblems = async (req, res) => {
  try {
    const { universityId } = req.query;

    const university = await University.findById(universityId);

    if (!university) {
      return res.status(404).json({
        success: false,
        message: "University not found",
      });
    }

    const problems = await Problem.find({
      assignedUniversity: universityId,
    }).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      problems,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
