const express = require("express");
const { runPlaywrightTest } = require("../runner/playwrightRunner");
const { validateSteps } = require("../utils/validateSteps");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const steps = req.body.steps; // ✅ define first

    console.log("Run Test clicked", steps); // ✅ now safe to log

    // Optional: validate steps
    validateSteps(steps);

    // Run your Playwright test
    const result = await runPlaywrightTest(steps);

    // Send JSON response
    res.json(result);

  } catch (err) {
    res.status(400).json({
      status: "ERROR",
      error: err.message
    });
  }
});

module.exports = router;
