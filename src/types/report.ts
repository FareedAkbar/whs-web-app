// import { MediaItem } from "./media";

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
  status:
    | ("ASSIGNED" | "COMPLETED" | "PENDING" | "IN_PROGRESS")
    | (string & {});
  userId: string;
  comment: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

enum status {}
export interface Comment {
  id: string;
  comment?: string;
  showToAll: boolean;
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
  links?: IncidentLink[];
  linkedInspections?:LinkedInspection[];
}

// Report object
export interface Report {
  id: string;
  title: string;
  ticket_number?: string;
  ticketNumber?: string;
  description: string;
  mainType: "INCIDENT" | "HAZARD";
  status: ("INITIATED" | "IN_PROGRESS" | "RESOLVED") | (string & {});
  priority: ("LOW" | "MEDIUM" | "HIGH" | "EXTREME") | (string & {});
  hazardId: string | null;
  incidentId: string;
  incident_coordinates: string;
  userId: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  followUp?: boolean;
    links?: IncidentLink[];

}

// Incident object
export interface Incident {
  id: string;
  name: string;
  incidentDescription: string;
  ticket_number: string;
  status: ("INITIATED" | "IN_PROGRESS" | "RESOLVED") | (string & {});
  treatmentType:
    | "FIRST_AID"
    | "NO_TREATMENT_PROVIDED"
    | "OTHER"
    | (string & {});
  treatmentDescription: string;
  injuredBodyPart: string;
  groupId: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface IncidentLink {
  linkId: string;
  incidentId: string;
  hazardId: string;
  isActive: boolean;
  comment: string;
  createdAt: string;
  reportId: string;
  reportTitle: string;
  reportDescription: string;
  linkType: string;
  linkDescription: string;
  reportStatus: string;
  reportPriority: string;
  reportCreatedAt: string;
  ticket_number: number;
}
export interface Hazard {
  id: string;
  name: string;
  hazardDescription: string;
  status: ("INITIATED" | "IN_PROGRESS" | "RESOLVED") | (string & {});
  groupId: string | null;
  createdAt: string;
  updatedAt: string;
  ticket_number: string;
}

// Media (attached to incident status log)
export interface IncidentMedia {
  id: string;
  mediaId: string;
  incidentStatusLogId: string;
  createdAt: string;
  updatedAt: string;
  status: ("INITIATED" | "IN_PROGRESS" | "RESOLVED") | (string & {});
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
  groupType: "DEPARTMENT" | (string & {}); // Add other types if applicable
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
  address?: string;
  reportDescription: string;
  severity: severity; // assuming possible values
  mainType: "INCIDENT";
  status: ("INITIATED" | "IN_PROGRESS" | "RESOLVED") | (string & {});
  followUp?: boolean;
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
  dynamicQuestion?: {
    questionId: string;
    answer: string;
  }[];
  // Media (UUIDs or URLs)
  media: string[];
  hazardId?: string;
  linkToHazard?: boolean;
  hazardLinkMode?: "existing" | "new";
  hazardReportTitle?: string;
  hazardReportDescription?: string;
  hazardSeverity?: severity;
  hazardCoordinates?: string;
  hazardAddress?: string;
  hazardCategoryType?: string;
  hazardDescription?: string;
  hazardMedia?: string[];
}

export interface CreateIncidentPayload {
  incident: Omit<
    NewIncidentReport,
    | "linkToHazard"
    | "hazardLinkMode"
    | "hazardReportTitle"
    | "hazardReportDescription"
    | "hazardSeverity"
    | "hazardCoordinates"
    | "hazardCategoryType"
    | "hazardDescription"
    | "hazardMedia"
  >;
  hazard?: NewHazardReport;
  hazardId?: string;
}

export interface NewHazardReport {
  // Report Data
  reportTitle: string;
  coordinates?: string;
  address?: string;
  reportDescription?: string;
  severity: severity; // assuming possible values
  mainType: "HAZARD";
  status: ("INITIATED" | "IN_PROGRESS" | "RESOLVED") | (string & {});

  // Incident Data
  categoryType: string;
  hazardDescription: string;

  managerSignatureConfirmationDate: string | null;
  dynamicQuestion?: {
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
export enum HazardCategoryType {
  FIRE = 'FIRE',
  NEAR_MISS = 'NEAR_MISS',
  PROPERTY_DAMAGE = 'PROPERTY_DAMAGE',
  EXPLOSION = 'EXPLOSION',
  SLIP = 'SLIP',
  FALL = 'FALL',
  COLLISION = 'COLLISION',
  ELECTRICAL = 'ELECTRICAL',
  CHEMICAL = 'CHEMICAL',
  BIOLOGICAL = 'BIOLOGICAL',
  PHYSICAL = 'PHYSICAL',
  PSYCHOLOGICAL = 'PSYCHOLOGICAL',
  ERGONOMIC = 'ERGONOMIC',
  MECHANICAL = 'MECHANICAL',
  ENVIRONMENTAL = 'ENVIRONMENTAL',
  OTHER = 'OTHER',
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
  MINOR = "MINOR",
  MODERATE = "MODERATE",
  MAJOR = "MAJOR",
  SEVERE = "SEVERE",
}
export interface reportStatus {
  incidentReportId?: string;
  status: string;
  comment?: string;
  media?: string[]; // Array of media file paths
}
