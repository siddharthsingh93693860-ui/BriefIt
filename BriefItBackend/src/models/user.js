const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["citizen", "university", "industry", "admin"],
      required: true,
      default: "citizen",
    },
    university: {
      type: Schema.Types.ObjectId,
      ref: "University",
      default: null,
    },
    industry: { type: Schema.Types.ObjectId, ref: "Industry", default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
