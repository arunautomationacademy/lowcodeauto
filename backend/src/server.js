const express = require("express");
const cors = require("cors");

const runTestRoute = require("./routes/runTest");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/run", runTestRoute);

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
