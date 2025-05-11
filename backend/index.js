// import express from "express";
// import dotenv from "dotenv";
// import dbConnect from "./src/config/dbConnect.js";
// import router from "./routes/user.routes.js";

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

const dbConnect = require("./src/config/dbConnect.js");
const userRoutes = require("./routes/user.routes.js");
const AdminRoutes = require("./routes/admin.routes.js");
const merchantRoutes = require("./routes/merchant.routes.js");
const dspRoutes = require("./routes/dsp.routes.js");
const customersRoutes = require("./routes/customer.routes.js");

dotenv.config();
dbConnect();

const app = express();

const port = process.env.PORT;

// Allow requests from your frontend
app.use(cors({
  origin: 'http://localhost:5173', // Allow the frontend from port 5173
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow these methods
  credentials: true // If you're using cookies or sessions, include credentials
}));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//middleware
app.use(express.json());
app.use((req, res, next) => {
  console.log('Request body:', req.body);
  next();});
app.use(express.urlencoded({ extended: false }));

//routes
app.use("/users", userRoutes);
app.use("/admin", AdminRoutes);
app.use("/merchant", merchantRoutes);
app.use("/dsp", dspRoutes);
app.use("/customers", customersRoutes);

app.listen(port, () => {
  console.log(`Server is running on port:${port}`);
});
