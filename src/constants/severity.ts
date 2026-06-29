
export const severityMapping: Record<string, string> = {
  SEVERE: "#DC3545",
  MAJOR: "#FD7E14",
  MODERATE: "#FFC107",
  MINOR: "#28A745",
  // EXTREME:"#DC3545",
  // HIGH:"#FD7E14",
  // MEDIUM:"#FFC107",
  // LOW:"#28A745",
};

export const severityDisplayMapping: Record<string, string> = {
  MINOR: "MINOR",
  MODERATE: "MODERATE",
  MAJOR: "MAJOR",
  SEVERE: "SEVERE",
};
export const severityKeys = ["MINOR", "MODERATE", "MAJOR", "SEVERE"] as const;

export const severityDescriptionMapping: Record<string, string> = {
  MINOR: "No injury or damage occurs i.e. near miss/hit",
  MODERATE: "Incident occurs requiring minor first aid treatment (e.g. band aid), or damage having no effect in production",
  MAJOR: "Incident occurs which results in medical treatment from a Doctor, or damage having a minor effect on production",
  SEVERE: "Incident occurs which results in a person being killed or permanently disabled, or major structural damage resulting in building being evacuated and unable to be used.",
};