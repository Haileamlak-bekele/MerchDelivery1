// import express from "express";
// import dotenv from "dotenv";
// import dbConnect from "./src/config/dbConnect.js";
// import router from "./routes/user.routes.js";

const express = require("express");
const dotenv = require("dotenv");
const dbConnect = require("./src/config/dbConnect.js");
const userRoutes = require("./routes/user.routes.js");
const AdminRoutes = require("./routes/admin.routes.js");
const merchantRoutes = require("./routes/merchant.routes.js");
const dspRoutes = require("./routes/dsp.routes.js");

dotenv.config();
dbConnect();

const app = express();

const port = process.env.PORT;
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

app.listen(port, () => {
  console.log(`Server is running on port:${port}`);
});
