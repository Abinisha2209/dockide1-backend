const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const userRoutes = require("./routes/user");

const executeRoutes = require("./routes/execute");
const statsRoutes = require("./routes/stats");
const sessionRoutes = require("./routes/sessions");

// Use routes
app.use("/", userRoutes);

app.use("/api/code", executeRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/sessions", sessionRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
