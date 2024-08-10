const { AssignedCode } = require("../models/AssignedCode");
const { ReferralCode } = require("../models/ReferralCode");
const { generateToken } = require("../utilities/jwtUtilityFunctions");
const { HTTP_STATUS_CODE } = require("../config/constant");

const getReferralCodes = async (req, res) => {
  try {
    // Fetch referral codes assigned to the logged-in user
    const referralCodes = await AssignedCode.find({ assignedTo: req.user._id })
      .populate('referralCode', 'status _id code') // Populate status and referralCode fields from ReferralCode
      .populate('assignedBy', 'username'); // Populate the name field from User assignedBy

    // Check if no referral codes are found
    if (!referralCodes.length) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        status: "error",
        message: "No referral codes found for this user.",
      });
    }
    // Map the referral codes to include the required structure
    const formattedReferralCodes = referralCodes.map(mapcode => ({
      referralCode_id: mapcode?.referralCode?._id.toString(), // Ensure this is the referralCode ID
      status: mapcode?.referralCode?.status || "unused", // Set a default value for status if not present
      referralCode: mapcode?.referralCode?.code, // Ensure this field is present in the referralCode object
      assignedBy: mapcode.assignedBy.username || "Unknown Admin" // Get the name of the user who assigned the code
    }));

    // Respond with the formatted referral codes
    return res.status(HTTP_STATUS_CODE.OK).json({
      status: "success",
      message: "Referral codes retrieved successfully.",
      referralCodes: formattedReferralCodes,
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


// const getReferralCodes = async (req, res) => {
//   try {
//     // Fetch referral codes assigned to the logged-in user, including the status
//     const referralCodes = await AssignedCode.find({ assignedTo: req.user._id });

//     // Check if no referral codes are found
//     if (!referralCodes.length) {
//       return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
//         status: "error",
//         message: "No referral codes found for this user.",
//       });
//     }

//     // Map the referral codes to include the required structure
//     const formattedReferralCodes = referralCodes.map(code => ({
//       id: code._id, // Assuming `_id` is the unique identifier for each code
//       status: code.status, // Assuming `status` is a field in your database
//       referralCode: code.referralCode, // Assuming `referralCode` is a field in your database
//       assignedTo: code.assignedTo, // Assuming `assignedTo` is a field in your database
//       assignedBy: code.assignedBy // Assuming `assignedBy` is a field in your database
//     }));

//     // Respond with the formatted referral codes
//     return res.status(HTTP_STATUS_CODE.OK).json({
//       status: "success",
//       message: "Referral codes retrieved successfully.",
//       referralCodes: formattedReferralCodes,
//     });
//   } catch (error) {
//     // Log the error for debugging
//     console.error("Error retrieving referral codes:", error);
//     return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
//       status: "error",
//       message: "An unexpected error occurred while retrieving referral codes.",
//     });
//   }
// };


// Get Referral Codes for a User
// const getReferralCodes = async (req, res) => {
//   try {
//     // Fetch referral codes assigned to the logged-in user
//     const referralCodes = await AssignedCode.find({ assignedTo: req.user._id });

//     // Check if no referral codes are found
//     if (!referralCodes.length) {
//       return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
//         status: "error",
//         message: "No referral codes found for this user.",
//       });
//     }

//     // Respond with the found referral codes
//     return res.status(HTTP_STATUS_CODE.OK).json({
//       status: "success",
//       referralCodes,
//     });
//   } catch (error) {
//     // Log the error for debugging
//     console.error("Error retrieving referral codes:", error);
//     return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
//       status: "error",
//       message: "An unexpected error occurred while retrieving referral codes.",
//     });
//   }
// };

// Update the status of a referral code
const updateReferralCodeStatus = async (req, res) => {
  try {
    const { referralCodeId } = req.params; // Get referral code ID from the request parameters

    // Find the assigned code entry by referral code ID and the assigned user
    const assignedCode = await AssignedCode.findOne({
      referralCode: referralCodeId,
      assignedTo: req.user._id, // Check if the logged-in user is the assigned user
    });

    // Check if the assigned code exists
    if (!assignedCode) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        status: "error",
        message: "Referral code not found or not assigned to this user.",
      });
    }

    // Find the referral code to update its status
    const referralCode = await ReferralCode.findById(referralCodeId);

    // Check if the referral code exists
    if (!referralCode) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        status: "error",
        message: "Referral code not found.",
      });
    }

    // Check if the referral code is already used
    if (referralCode.status === "used") {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        status: "error",
        message: "This referral code has already been used.",
      });
    }

    // Update the status to 'used'
    referralCode.status = "used";
    await referralCode.save();

    // Respond with the updated referral code
    return res.status(HTTP_STATUS_CODE.OK).json({
      status: "success",
      message: "Referral code successfully marked as used.",
      referralCode,
    });
  } catch (error) {
    console.error("Error updating referral code status:", error);
    return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "An unexpected error occurred while updating the referral code status.",
    });
  }
};

module.exports = {
  getReferralCodes,
  updateReferralCodeStatus
};
