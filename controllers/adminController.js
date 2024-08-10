const { ReferralCode } = require("../models/ReferralCode");
const { AssignedCode } = require("../models/AssignedCode");
const { User } = require("../models/userModel");
const { HTTP_STATUS_CODE } = require("../config/constant");
const mongoose = require("mongoose");

// Create Referral Code
const createReferralCode = async (req, res) => {
  try {
    const { code } = req.body;

    // Create a new referral code
    const referralCode = await ReferralCode.create({ code });

    // Respond with the created referral code
    return res.status(HTTP_STATUS_CODE.CREATED).json({
      status: "success",
      message: "Referral code created successfully."
    });
  } catch (error) {
    console.error("Error creating referral code:", error);
    return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "An unexpected error occurred while creating the referral code.",
    });
  }
};

const assignReferralCode = async (req, res) => {
  try {
    const { referralCodeId, userId } = req.body;

    // Convert string IDs to ObjectID
    const referralCodeObjectId = mongoose.Types.ObjectId(referralCodeId);
    const userObjectId = mongoose.Types.ObjectId(userId);

    // Find the referral code and user
    const referralCode = await ReferralCode.findById(referralCodeObjectId);
    const user = await User.findById(userObjectId);

    // Check if the referral code and user exist
    if (!referralCode || !user) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        status: "error",
        message: "Referral code or user not found.",
      });
    }

    // Check if the referral code is already assigned to another user
    const existingAssignmentToAnotherUser = await AssignedCode.findOne({
      referralCode: referralCode._id,
      assignedTo: { $ne: user._id }, // Checks if assigned to any other user
    });

    if (existingAssignmentToAnotherUser) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        status: "error",
        message: "Referral code is already assigned to another user.",
      });
    }

    // Check if the referral code is already assigned to the same user
    const existingAssignmentToSameUser = await AssignedCode.findOne({
      referralCode: referralCode._id,
      assignedTo: user._id,
    });

    if (existingAssignmentToSameUser) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        status: "error",
        message: "Referral code is already assigned to this user.",
      });
    }

    // Create an assignment record
    const assignment = await AssignedCode.create({
      referralCode: referralCode._id,
      assignedTo: user._id,
      assignedBy: req.user._id,
    });

    // Respond with the assignment details
    return res.status(HTTP_STATUS_CODE.OK).json({
      status: "success",
      message: `Referral code assigned successfully to ${user?.username}`
    });
  } catch (error) {
    console.error("Error assigning referral code:", error);
    return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "An unexpected error occurred while assigning the referral code.",
    });
  }
};

// View All Referral Codes
const viewAllReferralCodes = async (req, res) => {
  try {
    // Fetch all referral codes with assigned user details
    const referralCodes = await ReferralCode.find();

    // Respond with the referral codes
    return res.status(HTTP_STATUS_CODE.OK).json({
      status: "success",
      message: "Referral codes retrieved successfully.",
      referralCodes,
    });
  } catch (error) {
    console.error("Error retrieving referral codes:", error);
    return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "An unexpected error occurred while retrieving referral codes.",
    });
  }
};

const listUsers = async (req, res) => {
  try {
    // Fetch all users with the role "user" from the database
    const users = await User.find({ role: "user" });

    // Check if no users are found
    if (!users.length) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        status: "error",
        message: "No users found.",
      });
    }

    // Respond with the list of users
    return res.status(HTTP_STATUS_CODE.OK).json({
      status: "success",
      message: "Users retrieved successfully.",
      users,
    });
  } catch (error) {
    console.error("Error retrieving users:", error);
    return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "An unexpected error occurred while retrieving users.",
    });
  }
};


// View All Referral Codes with Assigned User Details
const ReferralCodesWithUserDetails = async (req, res) => {
  try {
    // Fetch all assignments with referral code and user details
    const assignments = await AssignedCode.find()
      .populate("referralCode", "code status _id")
      .populate("assignedTo", "username")
      .populate("assignedBy", "username");

    // Check if no assignments are found
    if (!assignments.length) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        status: "error",
        message: "No referral code assignments found.",
      });
    }

    // Transform assignments to include desired fields
    const response = assignments.map(assignment => ({
      referralCodeID: assignment.referralCode._id,
      status: assignment.referralCode.status,
      referralCode: assignment.referralCode.code,
      assignedTo: assignment.assignedTo ? assignment.assignedTo.username : null,
      assignedBy: assignment.assignedBy ? assignment.assignedBy.username : null,
    }));

    // Respond with the referral codes and user details
    return res.status(HTTP_STATUS_CODE.OK).json({
      status: "success",
      message: "Referral codes retrieved successfully.",
      referralCodes: response,
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error retrieving referral codes:", error);
    return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "An unexpected error occurred while retrieving referral codes.",
    });
  }
};

const getUnassignedReferralCodes = async (req, res) => {
  try {
    // Fetch all referral codes that are not assigned to anyone
    const assignedReferralCodes = await AssignedCode.find().distinct("referralCode");

    // Fetch referral codes that are not in the assignedReferralCodes array
    const unassignedReferralCodes = await ReferralCode.find({
      _id: { $nin: assignedReferralCodes }
    });

    // Check if no unassigned referral codes are found
    if (!unassignedReferralCodes.length) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        status: "error",
        message: "No unassigned referral codes found.",
      });
    }

    // Transform referral codes to include desired fields
    const response = unassignedReferralCodes.map(referralCode => ({
      _id: referralCode._id,
      status: referralCode.status,
      referralCode: referralCode.code,
    }));

    // Respond with the unassigned referral codes
    return res.status(HTTP_STATUS_CODE.OK).json({
      status: "success",
      message: "Unassigned referral codes retrieved successfully.",
      referralCodes: response,
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error retrieving unassigned referral codes:", error);
    return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "An unexpected error occurred while retrieving unassigned referral codes.",
    });
  }
};

module.exports = {
  createReferralCode,
  assignReferralCode,
  viewAllReferralCodes,
  listUsers,
  ReferralCodesWithUserDetails,
  getUnassignedReferralCodes
};
