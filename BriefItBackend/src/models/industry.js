const mongoose = require("mongoose");
const { Schema } = mongoose;

const domainEnum = [
  "education",
  "healthcare",
  "agriculture",
  "water",
  "sanitation",
  "environment",
  "energy",
  "urban_development",
  "accessibility",
  "public_administration",
  "rural_livelihoods",
];

const industrySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    domain: [{ type: String, enum: domainEnum }],
    contact: { type: String, required: true },
    logo: { type: String, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Industry", industrySchema);
