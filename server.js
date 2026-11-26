//import express from "express";
//var express = require("express");
//var app = express();
dotenv.config(); // Load environment variables from .env file
import dotenv from "dotenv";

import app from "./server/express.js";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
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
const frontendDistPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "portfolio", "dist");

app.use("/api/contacts", contactRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/qualifications", qualificationsRoutes);
app.use(express.static(frontendDistPath));
app.use((req, res, next) => {
  if (req.method !== "GET" || req.path === "/api" || req.path.startsWith("/api/")) {
    return next();
  }

  res.sendFile(path.join(frontendDistPath, "index.html"), (error) => {
    if (error) next(error);
  });
});

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
