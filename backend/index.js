import express from "express";
import dotenv from "dotenv";
import dbConnect from "./src/config/dbConnect.js";

dotenv.config();
dbConnect();

const app = express();

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is running on port:${port}`);
});
