const { JWT_SECRET, JWT_EXPIRES_IN } = require("./envUtils");
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
    return jwt.sign({ _id: user }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
  };
  
const authenticationToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access token is missing or invalid" });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            const status = err.name === 'TokenExpiredError' ? 401 : 403;
            return res.status(status).json({ message: err.message });
        }

        req.user = user;
        next();
    });
};

module.exports = { authenticationToken, generateToken };
