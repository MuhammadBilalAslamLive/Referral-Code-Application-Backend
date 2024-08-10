const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Joi = require("joi");

// Define User Schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    }
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Hash password before saving user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method to check password correctness
userSchema.methods.correctPassword = async function (typedPassword, originalPassword) {
  return await bcrypt.compare(typedPassword, originalPassword);
};

// Joi Validation Schema
const userValidationSchema = Joi.object({
  username: Joi.string().trim().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("admin", "user")
}).options({ allowUnknown: true });

// User Model
const User = mongoose.model("User", userSchema);

module.exports = { User, userValidationSchema };
