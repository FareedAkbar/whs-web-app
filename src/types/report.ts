// import { MediaItem } from "./media";
import { User } from "./user";

// Define the type for the incident report
export interface FormQuestion {
  id: string;
  question: string;
  questionType: string;
  createdBy: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FormAnswer {
  id: string;
  questionId: string;
  answer: string;
  createdBy: string;
  isDeleted: boolean;
  incidentId?: string;
  hazardId?: string;
  createdAt: string;
  updatedAt: string;
}
export interface IncidentLog {
  id: string;
  incidentId: string;
  hazardId: string | null;
  status: "ASSIGNED" | "COMPLETED" | "PENDING" | "IN_PROGRESS" | string; // extend as needed
  userId: string;
  comment: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
export interface Comment {
  id: string;
  comment?: string;
  followUpDescription?: string;
  createdAt: string; // ISO date string
  name: string;
  email: string;
  role: string;
  providedImageUrl: string;
  phoneNumber: string;
  userId: string;
}

export interface ReportResponse {
  report: Report;
  incident?: Incident;
  hazard?: Hazard;
  incidentAssignee: AssigneeUser;
  dynamicQuestion: {
    question: FormQuestion;
    answer: FormAnswer;
  }[];
  media: IncidentMedia[];
  logs: IncidentLog[];
  reportLogs: IncidentLog[];
  comments: Comment[];
  followUps?: Comment[];
}

// Report object
export interface Report {
  id: string;
  title: string;
  description: string;
  mainType: "INCIDENT" | "HAZARD";
  status: "INITIATED" | "IN_PROGRESS" | "RESOLVED" | string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "EXTREME" | string;
  hazardId: string | null;
  incidentId: string;
  incident_coordinates: string;
  userId: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  followUp: boolean;
}

// Incident object
export interface Incident {
  id: string;
  name: string;
  incidentDescription: string;
  status: "INITIATED" | "IN_PROGRESS" | "RESOLVED" | string;
  treatmentType: "FIRST_AID" | "NO_TREATMENT_PROVIDED" | "OTHER" | string;
  treatmentDescription: string;
  injuredBodyPart: string;
  groupId: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface Hazard {
  id: string;
  name: string;
  hazardDescription: string;
  status: "INITIATED" | "IN_PROGRESS" | "RESOLVED" | string;
  groupId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Media (attached to incident status log)
export interface IncidentMedia {
  id: string;
  mediaId: string;
  incidentStatusLogId: string;
  createdAt: string;
  updatedAt: string;
  status: "INITIATED" | "IN_PROGRESS" | "RESOLVED" | string;
  comment: string;
  url: string;
}

// Incident Assignee
export interface AssigneeUser {
  id: string;
  name: string;
  email: string;
  role: "DEPARTMENT_MANAGER" | "STAFF"; // Add more roles if needed
  providedImageUrl: string;
  phoneNumber: string;
  assigntype: "SELF_ASSIGNED" | "MANAGER_ASSIGNED";
}

export interface GroupData {
  id: string;
  name: string;
  description: string;
  groupType: "DEPARTMENT" | string; // Add other types if applicable
  createdAt: string;
  updatedAt: string;
}

export interface IncidentAssignee {
  groupManager: AssigneeUser;
  groupUsers: AssigneeUser[];
  groupData: GroupData;
}

// User type (used in assignedToData and assignedByData)

// Define the type for each item in the data array
// export interface ReportData {
//   incidentReport: Report;
//   incident?: Incident;
//   hazard?: Hazard;
//   // generalHazard: GeneralHazard;
//   media: MediaItem[];
//   incidentAssignee: IncidentAssignee;
//   assignedToData: User;
// }

// Define the type for the API response
export interface NewIncidentReport {
  // Report Data
  reportTitle: string;
  coordinates: string;
  reportDescription: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "EXTREME"; // assuming possible values
  mainType: "INCIDENT";
  status: "INITIATED" | "IN_PROGRESS" | "RESOLVED" | string;
  followUp: boolean;
  // Incident Data
  categoryType: IncidentCategoryType;
  incidentDescription: string;
  treatmentType: treatmentType;
  treatmentDescription: string;
  injuredBodyPart: string;

  // First Aider Details (optional)
  firstAiderName?: string;
  firstAiderPhone?: string;
  firstAiderEmail?: string;
  firstAidDate?: string;

  // Injured Person Data
  injuredPersonName: string;
  injuredPhoneNumber: string;
  injuredPersonEmail: string;
  managerSignatureConfirmationDate: string | null;
  dynamicQuestion: {
    questionId: string;
    answer: string;
  }[];
  // Media (UUIDs or URLs)
  media: string[];
}
export interface NewHazardReport {
  // Report Data
  reportTitle: string;
  coordinates: string;
  reportDescription: string;
  severity: "LOW" | "MEDIUM" | "HIGH"; // assuming possible values
  mainType: "HAZARD";
  status: "INITIATED" | "IN_PROGRESS" | "RESOLVED" | string;

  // Incident Data
  categoryType: string;
  hazardDescription: string;

  managerSignatureConfirmationDate: string | null;
  dynamicQuestion: {
    questionId: string;
    answer: string;
  }[];
  // Media (UUIDs or URLs)
  media: string[];
}
export enum IncidentCategoryType {
  BUMP = "BUMP",
  CUT = "CUT",
  FRACTURE = "FRACTURE",
  RESPIRATORY = "RESPIRATORY",
  SLIP = "SLIP",
  ERGONOMIC = "ERGONOMIC",
  BREAK = "BREAK",
  PSYCHOSOCIAL = "PSYCHOSOCIAL",
  BURN = "BURN",
  FALL = "FALL",
  FAINT = "FAINT",
  CONCUSSION = "CONCUSSION",
  STRAIN = "STRAIN",
  BRUISE = "BRUISE",
  TRIP = "TRIP",
  OTHER = "OTHER",
}
export enum treatmentType {
  FIRST_AID = "FIRST_AID",
  NO_TREATMENT_PROVIDED = "NO_TREATMENT_PROVIDED",
  MONITORED = "MONITORED",
  DOCTOR_GP = "DOCTOR_GP",
  HOSPITAL = "HOSPITAL",
  OTHER = "OTHER",
}

export enum severity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  EXTREME = "EXTREME",
}
export interface reportStatus {
  incidentReportId?: string;
  status: string;
  comment?: string;
  media?: string[]; // Array of media file paths
}
