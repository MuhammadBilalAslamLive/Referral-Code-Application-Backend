const express = require("express");
const Router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middlewares/adminAuth'); // Import the adminAuth middleware

// Create a referral code
Router.post('/create-referral-code', adminAuth, adminController.createReferralCode);

// List all users
Router.get('/get-users', adminAuth, adminController.listUsers);

// Assign a referral code to a user
Router.post('/referral-code/assign', adminAuth, adminController.assignReferralCode);

// View all referral codes
Router.get('/referral-codes', adminAuth, adminController.viewAllReferralCodes);

// View all referral codes with user detils
Router.get('/referral-codes/details', adminAuth, adminController.ReferralCodesWithUserDetails);

// View all getUnassignedReferralCodes
Router.get('/getUnassignedReferralCodes', adminAuth, adminController.getUnassignedReferralCodes);

module.exports = Router;
