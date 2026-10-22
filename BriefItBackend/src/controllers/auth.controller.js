const User = require("../models/user");
const University = require("../models/university");
const Industry = require("../models/industry");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    let universityId = null;
    let industryId = null;

    if (role === "university") {
      const { domain, contact, logo } = req.body;
      const newUniversity = await University.create({
        name,
        domain,
        contact,
        logo,
      });
      universityId = newUniversity._id;
    }

    if (role === "industry") {
      const { domain, contact, logo } = req.body;
      const newIndustry = await Industry.create({
        name,
        domain,
        contact,
        logo,
      });
      industryId = newIndustry._id;
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role,
      university: universityId,
      industry: industryId,
    });

    const { password: _, ...userData } = newUser.toObject();

    res.status(201).json({ success: true, user: userData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    if (user.password !== password) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    const { password: _, ...userData } = user.toObject();

    res.status(200).json({ success: true, user: userData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const admin = await User.create({
      name,
      email,
      password,
      role: "admin",
      university: null,
      industry: null,
    });

    const { password: _, ...adminData } = admin.toObject();

    res.status(201).json({
      success: true,
      user: adminData,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
