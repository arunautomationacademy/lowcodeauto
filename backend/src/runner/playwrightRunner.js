const { chromium } = require("playwright");

async function runPlaywrightTest(steps) {
  const startTime = Date.now();
  const logs = [];
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
for (let i = 0; i < steps.length; i++) {
  const step = steps[i];

  try {
    switch (step.action) {
      case "goto":
        await page.goto(step.value);
        break;

      case "click":
        await page.click(step.selector);
        break;

      case "fill":
        await page.fill(step.selector, step.value);
        break;

      case "wait":
        await page.waitForTimeout(Number(step.value) || 1000);
        break;

      case "assertText":
        const bodyText = await page.textContent("body");
        if (!bodyText.includes(step.value)) {
          throw new Error(`Text "${step.value}" not found`);
        }
        break;
    }

    logs.push({
      step: i + 1,
      action: step.action,
      status: "PASS"
    });

  } catch (stepError) {
    logs.push({
      step: i + 1,
      action: step.action,
      status: "FAIL",
      error: stepError.message
    });

    throw stepError; // stop execution
  }
}

    const endTime = Date.now();
    await browser.close();
return {
  status: "PASS",
  executionTimeMs: endTime - startTime,
  stepsExecuted: steps.length,
  logs
};


  } catch (error) {
    const endTime = Date.now();
    await page.screenshot({ path: "error.png" });
    await browser.close();

    return {
  status: "FAIL",
  executionTimeMs: endTime - startTime,
  stepsExecuted: logs.length,
  logs,
  error: error.message
};

  }
}

module.exports = { runPlaywrightTest };
