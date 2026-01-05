const { chromium } = require("playwright");

async function runPlaywrightTest(steps) {
  const startTime = Date.now();
  const logs = [];

  console.log("🚀 Starting Playwright execution");

  // ✅ SERVER-SAFE BROWSER LAUNCH
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  try {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      console.log(`➡️ Executing step ${i + 1}`, step);

      try {
        switch (step.action) {
          case "goto":
            await page.goto(step.value, { timeout: 30000 });
            break;

          case "click":
            await page.click(step.selector, { timeout: 10000 });
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

          default:
            throw new Error(`Unknown action: ${step.action}`);
        }

        logs.push({
          step: i + 1,
          action: step.action,
          status: "PASS",
        });
      } catch (stepError) {
        logs.push({
          step: i + 1,
          action: step.action,
          status: "FAIL",
          error: stepError.message,
        });

        throw stepError;
      }
    }

    const endTime = Date.now();
    await browser.close();

    console.log("✅ Execution completed");

    return {
      status: "PASS",
      executionTimeMs: endTime - startTime,
      stepsExecuted: steps.length,
      logs,
    };
  } catch (error) {
    const endTime = Date.now();

    try {
      await page.screenshot({ path: "error.png" });
    } catch {}

    await browser.close();

    console.error("❌ Execution failed:", error.message);

    return {
      status: "FAIL",
      executionTimeMs: endTime - startTime,
      stepsExecuted: logs.length,
      logs,
      error: error.message,
    };
  }
}

module.exports = { runPlaywrightTest };
