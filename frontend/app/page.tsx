"use client";

import { useState, useRef } from "react";
import { ACTIONS, ActionType } from "@/config/action";
import { Step } from "@/types/step";
//test push
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ▶ RUN FLOW
  const runFlow = async () => {
    if (!steps.length) return alert("Add at least one step");

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("http://localhost:4000/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steps }),
      });

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setResult({
        status: "FAIL",
        logs: [],
        executionTimeMs: 0,
      });
      alert("Execution failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  // 💾 SAVE FLOW AS JSON
  const saveFlow = () => {
    const json = JSON.stringify(steps, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `automation-flow-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
  };

  // 📂 LOAD FLOW FROM JSON FILE
  const loadFlowFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      alert("Select a valid JSON file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);

        if (!Array.isArray(parsed)) {
          throw new Error("Invalid format");
        }

        setSteps(parsed);
      } catch {
        alert("Invalid JSON file");
      }
    };

    reader.readAsText(file);
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
          Save JSON
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-gray-600 px-4 py-2 rounded"
        >
          Load JSON
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={loadFlowFromFile}
        />
      </div>

      {/* STEPS */}
      {steps.map((step, index) => (
        <div
          key={index}
          className="flex flex-wrap gap-3 items-center bg-gray-800 p-4 rounded mb-3"
        >
          {/* ACTION */}
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

          {/* INPUTS */}
          {ACTIONS[step.action].fields.map((field) => (
            <input
              key={field}
              value={step[field] || ""}
              placeholder={
                field === "selector"
                  ? "Locator"
                  : step.action === "wait"
                  ? "Time (ms)"
                  : "Value"
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

          {result.logs?.map((log) => (
            <div
              key={log.step}
              className={`p-2 mb-2 rounded ${
                log.status === "PASS" ? "bg-green-700" : "bg-red-700"
              }`}
            >
              Step {log.step} – {log.action} → {log.status}
              {log.error && (
                <div className="text-yellow-300">{log.error}</div>
              )}
            </div>
          ))}

          <div className="mt-2 border-t border-gray-600 pt-2">
            <div>Status: {result.status}</div>
            <div>Execution Time: {result.executionTimeMs} ms</div>
            <div>Steps Executed: {result.logs?.length}</div>
          </div>
        </div>
      )}
    </main>
  );
}
