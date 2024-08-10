const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware"); 
const router = express.Router();

// Get Referral Codes for the Logged-in User
router.get("/referral-codes", authMiddleware, userController.getReferralCodes);

// Update the Status of a Referral Code
router.patch("/use-referral-codes/:referralCodeId", authMiddleware, userController.updateReferralCodeStatus);

module.exports = router;
