import { Step } from "@/types/step";

export async function executeSteps(steps: Step[]) {
  console.log("Executing steps:", steps);
  // later → Playwright logic here
}
