const crypto = require('crypto');
const { ENCRYPTION_KEY, IV } = require("../utilities/envUtils");

// Function to encrypt data
const encryptData = (data) => {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), Buffer.from(IV));
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};

const encryptMiddleware = (req, res, next) => {
    const originalJson = res.json;

    res.json = (body) => {
        try {
            const encryptedBody = encryptData(body);
            originalJson.call(this, { data: encryptedBody });
        } catch (error) {
            console.error("Encryption error:", error);
            return originalJson.call(this, {
                error: "Failed to encrypt response"
            });
        }
    };

    next();
};

module.exports = encryptMiddleware;
