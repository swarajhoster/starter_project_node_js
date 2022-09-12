"use strict";

const morgan = require("morgan");
const express = require("express");

// File Imports
const connectToDatabase = require("./db/db.js");
const keys = require("./config/keys.js")
const errorMiddleware = require("./utils/middelwares/Error.js");

// App Configurations
const app = express();
const PORT = keys.PORT || 3000
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(morgan("common"));

// Connect to DataBase
connectToDatabase();

// Configure Routes
app.use("/auth", require("./routes/auth.router.js"));

// Base URL
app.get("/", (req, res) => {
  return res.json({ error: "false", message: "Welcome to starter-project" });
});

// create local server
app.listen(PORT, () => {
  console.log("Server is running on port 3000");
});

// Custom Error Handler
app.use(errorMiddleware);
