const { User, userValidationSchema } = require("../models/userModel");
const { generateToken } = require("../utilities/jwtUtilityFunctions");
const { HTTP_STATUS_CODE } = require("../config/constant");

// Signup new user
const signup = async (req, res) => {
  try {
    const payload = req.body;

    // Validate user input
    const { error, value } = userValidationSchema.validate(payload);
    if (error) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        status: "error",
        message: error.details[0].message,
      });
    }

    // Check if the email already exists
    const existingUser = await User.findOne({ email: value.email.toLowerCase() });
    if (existingUser) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        status: "error",
        message: "Email Already Exists!",
      });
    }

    // Create the new user
    const user = await User.create(value);
    if (!user) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        status: "error",
        message: "Invalid user data",
      });
    }

    // Generate a token and respond
    const token = generateToken(user._id);
    res.status(HTTP_STATUS_CODE.CREATED).json({
      status: "success",
      message: "Thank you for signing up!",
      token,
    });
    
  } catch (error) {
    // Log the error for debugging
    console.error("Signup error:", error);
    return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "An unexpected error occurred. Please try again later.",
    });
  }
};

// Login User
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for missing fields
    if (!email || !password) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        status: "error",
        message: "Please provide both email and password",
      });
    }

    // Validate email format using a regex pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simpler regex for email validation
    if (!emailPattern.test(email)) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        status: "error",
        message: "Invalid Email",
      });
    }

    // Fetch user from the database, including the password
    const dbUser = await User.findOne({ email }).select("+password");
    if (!dbUser) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        status: "error",
        message: "Your email or password is wrong",
      });
    }

    // Check if the password is correct
    const isPasswordCorrect = await dbUser.correctPassword(password, dbUser.password);
    if (!isPasswordCorrect) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        status: "error",
        message: "Your email or password is wrong",
      });
    }

    // Generate a token for the user
    const token = generateToken(dbUser._id);
  
    return res.status(HTTP_STATUS_CODE.OK).json({
      token,
      username: dbUser.username,
      role: dbUser.role,
      message: "You have been successfully logged in!",
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Login error:", error);
    return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "An unexpected error occurred. Please try again later.",
    });
  }
};

module.exports = {
  signup,
  login
};
