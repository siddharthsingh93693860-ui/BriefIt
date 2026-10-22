const Solution = require("../models/solution");
const Problem = require("../../../../BriefIt/BriefItBackend/src/models/problem");
const University = require("../models/university");
const User = require("../models/user");
const Industry = require("../models/industry");

exports.createSolution = async (req, res) => {
  try {
    const { problemId, universityId, title, description, attachments, fund } =
      req.body;

    const problem = await Problem.findById(problemId);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    if (String(problem.assignedUniversity) !== String(universityId)) {
      return res.status(403).json({
        success: false,
        message: "This university is not assigned to this problem",
      });
    }

    const university = await University.findById(universityId);

    if (!university) {
      return res.status(404).json({
        success: false,
        message: "University not found",
      });
    }

    const newSolution = await Solution.create({
      problem: problemId,
      university: universityId,
      title,
      description,
      attachments: attachments || [],
      fund,
      approvedByCitizen: false,
      status: "proposed",
      fundedBy: null,
    });

    problem.status = "solved";
    await problem.save();

    await University.findByIdAndUpdate(universityId, {
      $inc: {
        problemsSolvedOnPlatform: 1,
      },
    });

    res.status(201).json({
      success: true,
      solution: newSolution,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getCitizenSolutions = async (req, res) => {
  try {
    const { userId } = req.query;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "citizen") {
      return res.status(403).json({
        success: false,
        message: "Only citizens can access this API",
      });
    }

    const problems = await Problem.find({
      submittedBy: userId,
    }).select("_id");

    const problemIds = problems.map((problem) => problem._id);

    const solutions = await Solution.find({
      problem: { $in: problemIds },
    })
      .populate(
        "problem",
        "title description category location priority rank aiTags",
      )
      .populate("university", "name domain contact logo");

    res.status(200).json({
      success: true,
      solutions,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.approveSolution = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "citizen") {
      return res.status(403).json({
        success: false,
        message: "Only citizens can approve solutions",
      });
    }

    const solution = await Solution.findById(id);

    if (!solution) {
      return res.status(404).json({
        success: false,
        message: "Solution not found",
      });
    }

    const problem = await Problem.findById(solution.problem);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    if (String(problem.submittedBy) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message:
          "Only the citizen who submitted this problem can approve the solution",
      });
    }

    if (solution.approvedByCitizen) {
      return res.status(400).json({
        success: false,
        message: "Solution is already approved by citizen",
      });
    }

    solution.approvedByCitizen = true;

    await solution.save();

    res.status(200).json({
      success: true,
      message: "Solution approved by citizen",
      solution,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getIndustrySolutions = async (req, res) => {
  try {
    const solutions = await Solution.find({
      status: "proposed",
      approvedByCitizen: true,
    })
      .populate(
        "problem",
        "title description category location priority rank aiTags",
      )
      .populate("university", "name domain contact logo");

    res.status(200).json({
      success: true,
      solutions,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.fundSolution = async (req, res) => {
  try {
    const { industryId } = req.body;
    const { id } = req.params;

    const industry = await Industry.findById(industryId);

    if (!industry) {
      return res.status(404).json({
        success: false,
        message: "Industry not found",
      });
    }

    const solution = await Solution.findById(id);

    if (!solution) {
      return res.status(404).json({
        success: false,
        message: "Solution not found",
      });
    }

    if (!solution.approvedByCitizen) {
      return res.status(403).json({
        success: false,
        message: "Citizen must approve this solution before it can be funded",
      });
    }

    if (solution.status !== "proposed") {
      return res.status(400).json({
        success: false,
        message: "Solution is not available for funding",
      });
    }

    solution.status = "funded";
    solution.fundedBy = industryId;

    await solution.save();

    res.status(200).json({
      success: true,
      message: "Solution funded successfully",
      solution,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
