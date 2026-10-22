const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("../db/db.js");

const app = express();
const cors = require("cors");
// ...
app.use(cors());
app.use(express.json());

const authRouter = require("./Router/auth.js");
const problemRouter = require("./Router/problem.js");
const universityRouter = require("./Router/university.js");
const solutionRouter = require("./Router/solution.js");
const adminRouter = require("./Router/admin.js");
app.use("/api/admin", adminRouter);
app.use("/api/solutions", solutionRouter);
app.use("/api/university", universityRouter);
app.use("/api/auth", authRouter);
app.use("/api/problems", problemRouter);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
