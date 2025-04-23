// import jwt from "jsonwebtoken";
// import { User } from "../models/user.model.js";

const jwt = require("jsonwebtoken");
const User = require("../src/config/model/Users.model.js"); // Adjust the path as necessary

// Middleware to protect routes
 const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

  if (!token) return res.status(401).json({ message: "No token, access denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Middleware for role-based access
 const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access forbidden: role not allowed" });
    }
    next();
  };
};

const authenticate = async (req, res, next) => {
  try {
    // Extract the token from the Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: "Authentication token is missing" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Attach the user to the request object
    req.user = user;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Error in authenticate middleware:", error);
    res.status(401).json({ message: "Invalid token", error: error.message });
  }
};



module.exports = { protect, authorizeRoles, authenticate };
