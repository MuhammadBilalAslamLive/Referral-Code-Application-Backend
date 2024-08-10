const jwt = require('jsonwebtoken');
const { User } = require('../models/userModel');
const { JWT_SECRET } = require("../utilities/envUtils");
const { promisify } = require('util'); 

const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null;

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {       
        // Verify the token and get the decoded data
        const decoded = await promisify(jwt.verify)(token, JWT_SECRET);
        
        // Find the user associated with the decoded id
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(401).json({ message: 'This user no longer exists' });
        }
        
        req.user = user; // Set the user object in the request
        next();
    } catch (err) {
        console.error("Token verification error:", err);
        return res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = authMiddleware;
