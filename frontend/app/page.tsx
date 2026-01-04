"use client";

import { useState } from "react";
import { ACTIONS, ActionType } from "@/config/action";
import { Step } from "@/types/step";

export default function Home() {
  const [steps, setSteps] = useState<Step[]>([
    { action: "goto", value: "" },
  ]);

  const [result, setResult] = useState<{
    logs?: { step: number; action: string; status: string; error?: string }[];
    status?: string;
    executionTimeMs?: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);

  // ▶ RUN
  const runFlow = async () => {
    if (!steps.length) return alert("Add at least one step");

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("http://localhost:3001/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steps }),
      });

      const data = await response.json();
      setResult(data);

      if (data.status === "FAIL") {
        alert("Flow failed. Check results below.");
      }
    } catch (err: any) {
      setResult({ status: "FAIL", logs: [], executionTimeMs: 0 });
      alert(`Flow execution error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 💾 SAVE
  const saveFlow = () => {
    localStorage.setItem("automationSteps", JSON.stringify(steps));
    alert("Flow saved");
  };

  // 📂 LOAD
  const loadFlow = () => {
    const saved = localStorage.getItem("automationSteps");
    if (saved) {
      setSteps(JSON.parse(saved));
    }
  };

  // ➕ ADD STEP
  const addStep = () => {
    setSteps([...steps, { action: "click", selector: "", value: "" }]);
  };

  // 🗑 DELETE STEP
  const deleteStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  // 📄 DUPLICATE STEP
  const duplicateStep = (index: number) => {
    const copy = { ...steps[index] };
    const updated = [...steps];
    updated.splice(index + 1, 0, copy);
    setSteps(updated);
  };

  // ✏ UPDATE STEP
  const updateStep = (index: number, key: keyof Step, value: string) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [key]: value };
    setSteps(updated);
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">
        Low-Code Automation Builder
      </h1>

      {/* TOP BAR */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={runFlow}
          className="bg-green-600 px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Running..." : "Run"}
        </button>

        <button
          onClick={saveFlow}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          Save File
        </button>

        <button
          onClick={loadFlow}
          className="bg-gray-600 px-4 py-2 rounded"
        >
          Load File
        </button>
      </div>

      {/* STEPS */}
      {steps.map((step, index) => (
        <div
          key={index}
          className="flex flex-wrap gap-3 items-center bg-gray-800 p-4 rounded mb-3"
        >
          {/* ACTION SELECT */}
          <select
            value={step.action}
            onChange={(e) =>
              updateStep(index, "action", e.target.value as ActionType)
            }
            className="bg-gray-700 p-2 rounded"
          >
            {Object.entries(ACTIONS).map(([key, cfg]) => (
              <option key={key} value={key}>
                {cfg.label}
              </option>
            ))}
          </select>

          {/* DYNAMIC INPUTS */}
          {ACTIONS[step.action].fields.map((field) => (
            <input
              key={field}
              value={step[field] || ""}
              placeholder={
                field === "selector"
                  ? "Locator"
                  : field === "value"
                  ? step.action === "wait"
                    ? "Time (ms)"
                    : "Value"
                  : "Expected text"
              }
              onChange={(e) => updateStep(index, field, e.target.value)}
              className="bg-gray-700 p-2 rounded text-white min-w-[160px]"
            />
          ))}

          {/* STEP ACTIONS */}
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => duplicateStep(index)}
              className="bg-yellow-600 px-2 py-1 rounded text-sm"
            >
              Duplicate
            </button>

            <button
              onClick={() => deleteStep(index)}
              className="bg-red-600 px-2 py-1 rounded text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      {/* ADD STEP */}
      <button
        onClick={addStep}
        className="mt-4 bg-blue-600 px-4 py-2 rounded"
      >
        + Add Step
      </button>

      {/* RESULTS */}
      {result && (
        <div className="mt-6 p-4 bg-gray-800 rounded max-h-96 overflow-y-auto">
          <h2 className="text-lg font-bold mb-2">Execution Results</h2>

          {/* Step logs */}
          {result.logs?.map((log) => (
            <div
              key={log.step}
              className={`flex justify-between items-center p-2 mb-2 rounded ${
                log.status === "PASS" ? "bg-green-700" : "bg-red-700"
              }`}
            >
              <div>
                <span className="font-semibold">Step {log.step}:</span>{" "}
                {log.action}
              </div>
              <div>
                <span className="font-bold mr-2">{log.status}</span>
                {log.error && <span className="text-yellow-300">{log.error}</span>}
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="mt-2 p-2 border-t border-gray-600 text-gray-200">
            <div>
              <span className="font-semibold">Overall Status:</span>{" "}
              <span
                className={
                  result.status === "PASS" ? "text-green-400" : "text-red-400"
                }
              >
                {result.status}
              </span>
            </div>
            <div>
              <span className="font-semibold">Execution Time:</span>{" "}
              {result.executionTimeMs} ms
            </div>
            <div>
              <span className="font-semibold">Steps Executed:</span>{" "}
              {result.logs?.length}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
