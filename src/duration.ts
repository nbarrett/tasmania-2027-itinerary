import type {PlanKey} from "./route-map";
import {setRoutePlan} from "./route-map";

const STORAGE_KEY = "trip-duration";

function asPlan(value: string | null): PlanKey {
  return value === "one" ? "one" : "two";
}

function applyDuration(plan: PlanKey): void {
  document.body.dataset.duration = plan;
  document.querySelectorAll<HTMLElement>("[data-plan]").forEach(element => {
    element.hidden = element.dataset.plan !== plan;
  });
  document.querySelectorAll<HTMLElement>("[data-two-only]").forEach(element => {
    element.hidden = plan === "one";
  });
  document.querySelectorAll<HTMLElement>(".swap").forEach(element => {
    const twoText = element.dataset.two;
    const oneText = element.dataset.one;
    if (twoText && oneText) {
      element.textContent = plan === "two" ? twoText : oneText;
    }
  });
  document.querySelectorAll<HTMLElement>(".duration-choice").forEach(button => {
    button.classList.toggle("active", button.dataset.duration === plan);
  });
  document.querySelectorAll<HTMLElement>(".option").forEach(card => {
    card.classList.toggle("selected", card.dataset.optionPlan === plan);
  });
  setRoutePlan(plan);
  document.dispatchEvent(new CustomEvent("durationchange"));
}

export function currentDuration(): PlanKey {
  return asPlan(document.body.dataset.duration ?? null);
}

const saved = asPlan(localStorage.getItem(STORAGE_KEY));
applyDuration(saved);

document.querySelectorAll<HTMLElement>(".duration-choice").forEach(button => {
  button.addEventListener("click", () => {
    const plan = asPlan(button.dataset.duration ?? null);
    localStorage.setItem(STORAGE_KEY, plan);
    applyDuration(plan);
  });
});
