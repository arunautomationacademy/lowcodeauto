import { Step } from "@/types/step";

export const ACTIONS = {
  goto: {
    label: "Go To URL",
    fields: ["value"],
  },
  click: {
    label: "Click",
    fields: ["selector"],
  },
  fill: {
    label: "Fill",
    fields: ["selector", "value"],
  },
  wait: {
    label: "Wait",
    fields: ["value"],
  },
  assert: {
    label: "assertText",
    fields: ["selector", "expected"],
  },
} as const;

export type ActionType = keyof typeof ACTIONS;
export type ActionField = (typeof ACTIONS)[ActionType]["fields"][number];
