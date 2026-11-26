//import express from "express";
//var express = require("express");
//var app = express();
dotenv.config(); // Load environment variables from .env file
import dotenv from "dotenv";

import app from "./server/express.js";
// import router from "./server/assets-router.js";
//const assetsRouter = require("./server/assets-router");
// import express from "express";
import mongoose from "mongoose";

import contactRoutes from "./server/routes/contact-routes.js";
import projectsRoutes from "./server/routes/projects-routes.js";
import usersRoutes from "./server/routes/users-routes.js";
import qualificationsRoutes from "./server/routes/qualifications-routes.js";
import seedAdmin from "./server/seeds/admin-seed.js";

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Welcome, this is the backend of my portfolio. Mitchell Dennis");
});

app.use("/api/contacts", contactRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/qualifications", qualificationsRoutes);

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB: Portfolio");
    await seedAdmin();

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exitCode = 1;
  }
};

startServer();

//module.exports = app;
export default app;
