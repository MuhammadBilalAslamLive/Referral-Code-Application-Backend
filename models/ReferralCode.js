const mongoose = require("mongoose");
const Joi = require("joi");

// Define ReferralCode Schema
const referralCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["unused", "used"],
      default: "unused",
    }
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Joi Validation Schema
const referralCodeValidationSchema = Joi.object({
  code: Joi.string().required(),
  status: Joi.string().valid("unused", "used").optional(),
  expirationDate: Joi.date().optional(),
}).options({ allowUnknown: true });

// ReferralCode Model
const ReferralCode = mongoose.model("ReferralCode", referralCodeSchema);

module.exports = { ReferralCode, referralCodeValidationSchema };
