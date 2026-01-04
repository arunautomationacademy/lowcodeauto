import { ActionType } from "@/config/action";

export type Step = {
  action: ActionType;
  selector?: string;
  value?: string;
  expected?: string;
};
