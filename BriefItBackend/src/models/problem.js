const mongoose = require("mongoose");
const { Schema } = mongoose;

// Public web sources gathered by TinyFish after submission (optional).
const webContextSchema = new Schema(
  {
    status: { type: String, enum: ["completed", "failed"] },
    query: { type: String },
    sources: [
      {
        _id: false,
        title: { type: String },
        url: { type: String },
        snippet: { type: String },
        siteName: { type: String, default: null },
        publishedAt: { type: String, default: null },
      },
    ],
    error: { type: String },
    fetchedAt: { type: Date },
  },
  { _id: false },
);

const problemSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: {
      district: { type: String, required: true },
      block: { type: String },
      coordinates: { lat: { type: Number }, lng: { type: Number } },
    },
    media: [
      {
        url: { type: String, required: true },
        type: {
          type: String,
          enum: ["image", "video", "document"],
          required: true,
        },
      },
    ],
    category: {
      type: String,
      enum: [
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
      ],
      default: null,
    },
    rank: { type: Number, default: 0 },
    aiTags: [{ type: String }],
    isDuplicate: { type: Boolean, default: false },
    duplicateOf: { type: Schema.Types.ObjectId, ref: "Problem", default: null },
    submittedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedUniversity: {
      type: Schema.Types.ObjectId,
      ref: "University",
      default: null,
    },
    status: {
      type: String,
      enum: [
        "submitted",
        "under_review",
        "assigned",
        "in_progress",
        "solved",
        "rejected",
      ],
      default: "submitted",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    webContext: { type: webContextSchema, default: undefined },
  },
  { timestamps: true },
);

problemSchema.index({ category: 1, "location.district": 1 });

module.exports = mongoose.model("Problem", problemSchema);
