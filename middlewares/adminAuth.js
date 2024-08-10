const jwt = require('jsonwebtoken');
const { User } = require('../models/userModel');
const { JWT_SECRET } = require("../utilities/envUtils");
const { promisify } = require('util'); 

const adminAuth = async (req, res, next) => {
    const token = req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null;

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = await promisify(jwt.verify)(token, JWT_SECRET);
        const user = await User.findById(decoded._id);

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized as an admin' });
        }
        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = adminAuth;
