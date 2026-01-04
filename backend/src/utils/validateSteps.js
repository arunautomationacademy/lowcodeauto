function validateSteps(steps) {
  if (!Array.isArray(steps)) {
    throw new Error("Steps must be an array");
  }

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];

    if (!step.action) {
      throw new Error(`Step ${i + 1}: action is required`);
    }

    if (step.action === "goto" && !step.value) {
      throw new Error(`Step ${i + 1}: URL is required`);
    }

    if (
      (step.action === "click" || step.action === "fill") &&
      !step.selector
    ) {
      throw new Error(`Step ${i + 1}: selector is required`);
    }

    if (step.action === "fill" && !step.value) {
      throw new Error(`Step ${i + 1}: value is required`);
    }

    if (step.action === "assertText" && !step.value) {
      throw new Error(`Step ${i + 1}: text to assert is required`);
    }
  }
}

module.exports = { validateSteps };
