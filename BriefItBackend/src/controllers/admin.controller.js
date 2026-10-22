const Problem = require("../../../../BriefIt/BriefItBackend/src/models/problem");
const Solution = require("../models/solution");
const University = require("../models/university");
const Industry = require("../models/industry");

exports.getAnalytics = async (req, res) => {
  try {
    const totalProblems = await Problem.countDocuments();

    const problemsByStatus = await Problem.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const problemsByCategory = await Problem.aggregate([
      { $match: { category: { $ne: null } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const totalSolutions = await Solution.countDocuments();
    const fundedSolutions = await Solution.countDocuments({ status: "funded" });

    const totalUniversities = await University.countDocuments();
    const totalIndustries = await Industry.countDocuments();

    res.status(200).json({
      success: true,
      analytics: {
        totalProblems,
        problemsByStatus,
        problemsByCategory,
        totalSolutions,
        fundedSolutions,
        totalUniversities,
        totalIndustries,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
