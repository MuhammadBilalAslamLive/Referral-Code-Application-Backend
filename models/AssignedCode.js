const mongoose = require("mongoose");
const Joi = require("joi");

// Define AssignedCode Schema
const AssignedCodeSchema = new mongoose.Schema(
  {
    referralCode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReferralCode",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Assuming this is an admin
    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Joi Validation Schema
const AssignedCodeValidationSchema = Joi.object({
  referralCode: Joi.string().required(),
  assignedTo: Joi.string().required(),
  assignedBy: Joi.string().required(),
}).options({ allowUnknown: true });

// AssignedCode Model
const AssignedCode = mongoose.model("AssignedCode", AssignedCodeSchema);

module.exports = { AssignedCode, AssignedCodeValidationSchema };
