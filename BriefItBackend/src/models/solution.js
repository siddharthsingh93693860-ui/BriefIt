const mongoose = require("mongoose");

const { Schema } = mongoose;

const solutionSchema = new Schema(
  {
    problem: {
      type: Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },

    university: {
      type: Schema.Types.ObjectId,
      ref: "University",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    attachments: [
      {
        type: String,
      },
    ],

    fund: {
      type: Number,
      required: true,
    },

    approvedByCitizen: {
      type: Boolean,
      default: false,
      required: true,
    },

    status: {
      type: String,
      enum: ["proposed", "funded", "in_progress", "completed"],
      default: "proposed",
    },

    fundedBy: {
      type: Schema.Types.ObjectId,
      ref: "Industry",
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Solution", solutionSchema);
