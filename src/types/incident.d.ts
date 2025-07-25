// Define the type for the incident report
// Report object
interface Report {
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
}

// Incident object
interface Incident {
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

// Media (attached to incident status log)
interface IncidentMedia {
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
interface IncidentAssignee {
  id: string;
  incidentReportId: string;
  assignedBy: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  assignedToData: User;
  assignedByData: User;
  acceptanceStatus: boolean;
  acceptedAt: string;
  acceptanceExpiry: string;
}
interface IncidentData {
  report: Report;
  incident: Incident;
  incidentAssignee: IncidentAssignee[];
  media: IncidentMedia[];
}

interface IncidentApiResponse {
  status: string;
  message: string;
  data: IncidentReportResponse[];
}
// Define the type for the general hazard
interface GeneralHazard {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Define the type for each item in the data array
// Define the type for the API response
interface NewIncidentReport {
  incidentTitle: string;
  generalHazardDescription: string;
  incidentDescription: string;
  coordinates: string;
  incidentType: string;
  hazardType: string;
  status: string;
  severity: string;
  media: string[]; // Array of media file paths
  incidentReportDescription?: string;
}
interface IncidentApiResponse {
  status: string;
  message: string;
  data: IncidentData[];
}
interface SingleIncidentApiResponse {
  status: string;
  message: string;
  data: IncidentData;
}
interface AssignIncidentApiResponse {
  status: string;
  message: string;
  data: IncidentData;
}
