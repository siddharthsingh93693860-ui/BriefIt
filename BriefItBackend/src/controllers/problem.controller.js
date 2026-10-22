const Problem = require("../models/problem");
const { classifyProblem } = require("../services/aiClassification");
const { enrichProblem } = require("../services/tinyfishResearch");

exports.createProblem = async (req, res) => {
  try {
    const { title, description, location, submittedBy, media } = req.body;

    const aiResult = await classifyProblem(
      title,
      description,
      location.district,
    );

    const newProblem = await Problem.create({
      title,
      description,
      location,
      submittedBy,
      media,
      category: aiResult.category,
      rank: aiResult.rank,
      aiTags: aiResult.aiTags,
      isDuplicate: aiResult.isDuplicate,
      duplicateOf: aiResult.duplicateOf,
      status: aiResult.isDuplicate ? "rejected" : "submitted",
    });

    res.status(201).json({ success: true, problem: newProblem });

    // Background TinyFish web research. Runs after the response is sent,
    // is a no-op without TINYFISH_API_KEY, and never throws.
    if (!newProblem.isDuplicate) {
      enrichProblem(newProblem._id);
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllProblems = async (req, res) => {
  try {
    const { category, status, district } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (district) filter["location.district"] = district;

    const problems = await Problem.find(filter)
      .populate("submittedBy", "name email")
      .populate("assignedUniversity", "name domain");

    res.status(200).json({ success: true, problems });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id)
      .populate("submittedBy", "name email")
      .populate("assignedUniversity", "name domain");

    if (!problem) {
      return res
        .status(404)
        .json({ success: false, message: "Problem not found" });
    }

    res.status(200).json({ success: true, problem });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProblemStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const problem = await Problem.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    if (!problem) {
      return res
        .status(404)
        .json({ success: false, message: "Problem not found" });
    }

    res.status(200).json({ success: true, problem });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
