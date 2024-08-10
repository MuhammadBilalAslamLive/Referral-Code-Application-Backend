const dotenv = require('dotenv');
dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV = process.env.IV;
const CONNECTION_STRING_HOSTED = process.env.CONNECTION_STRING_HOSTED;
const CONNECTION_STRING_LOCAL = process.env.CONNECTION_STRING_LOCAL;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

module.exports = {
  ENCRYPTION_KEY,
  IV,
  CONNECTION_STRING_HOSTED,
  CONNECTION_STRING_LOCAL,
  JWT_SECRET,
  JWT_EXPIRES_IN,
};
