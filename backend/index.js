const express = require("express");
const cors = require("cors");

// import route
const runTestRoute = require("./src/routes/runTest");

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// routes
app.use("/run", runTestRoute);

// health check
app.get("/", (req, res) => {
  res.send("Backend running");
});

// ✅ SAFE PORT HANDLING
// - Locally: uses 4000 (avoids 3000 conflict)
// - Cloud (Render/Fly): uses process.env.PORT
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
