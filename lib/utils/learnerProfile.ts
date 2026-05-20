import { STORAGE_KEYS } from "@/lib/constants";

export type LearnerType = "daily" | "flexible";

export function getLearnerType(): LearnerType {
  if (typeof window === "undefined") return "daily";
  return localStorage.getItem(STORAGE_KEYS.LEARNER_TYPE) === "flexible"
    ? "flexible"
    : "daily";
}

export function setLearnerType(type: LearnerType): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.LEARNER_TYPE, type);
}
