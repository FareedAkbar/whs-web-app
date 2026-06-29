// ── Primitives ────────────────────────────────────────────────────────────────

 type AnsType =
  | "TEXT"
  | "YES_NO"
  | "SINGLE_OPTION"
  | "MULTI_OPTION"
  | "DATE"
  | "DATE_RANGE"
  | "LONG_TEXT";

// ── Questions ─────────────────────────────────────────────────────────────────

 interface Question {
  id: string;
  sectionId?: string;
  questionNumber?: number;
  title: string;
  type: AnsType;
  options?: string[];
}

 interface NewQuestion {
  questionNumber: number;
  title: string;
  type: AnsType;
  options?: string[];
  __editing?: boolean;
}

/** Question with an embedded answer — inside InspectionItem.sections */
 interface AnsweredQuestion extends Question {
  answer?: EmbeddedAnswer;
}

// ── Answers ───────────────────────────────────────────────────────────────────

/** Answer embedded directly on a question inside inspection.sections */
 interface EmbeddedAnswer {
  id?: string;
  inspectionId?: string;
  questionId?: string;
  answer?: string | string[] | null;
  createdAt?: string;
  updatedAt?: string;
}

 interface InspectionSectionAnswer {
  sectionId: string;
  hazard?: NewHazardReport | null;
  hazardId?: string | null;
  answers: { questionId: string; answer: string | string[] }[];
}

// ── Hazards ───────────────────────────────────────────────────────────────────

 interface LinkedHazard {
  linkId: string;
  hazardId: string;
  inspectionId: string;
  sectionId: string;
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

// ── Sections ──────────────────────────────────────────────────────────────────

/** Template section — questions without answers */
 interface InspectionSection {
  id: string;
  title: string;
  description?: string;
  order?: number;
  questions: Question[];
  notes?: string; // optional additional comments for the section
  tables?: NewTable[]; // optional tables for the section
}

/** Section inside a submitted InspectionItem — answered questions + linked hazards */
 interface InspectionItemSection {
  id: string;
  title: string;
  description?: string;
  order?: number;
  questions: AnsweredQuestion[];
  linkedHazards?: LinkedHazard[];
  comments?: string;
}
 interface LinkedInspection {
  linkId: string;
  inspectionId: string;
  inspectionStatus: string;
  inspectionComments?: string;
  inspectionExpiryDate?: string;
  areaBuilding?: string;
  areaDescription?: string;
  businessUnit?: string;
  survey: LinkedInspectionSurvey;
  sections: LinkedInspectionSection[];
}
// ── Logs ──────────────────────────────────────────────────────────────────────

 interface InspectionLog {
  id: string;
  inspectionId: string;
  status: InspectionStatus;
  userId: string;
  comment: string;
  createdAt: string;
}

// ── Status ────────────────────────────────────────────────────────────────────

 type InspectionStatus =
  | "INITIATED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "ASSIGNED"
  | "CLOSED";

// ── Core entities ─────────────────────────────────────────────────────────────

 type Inspection = {
  id: string;
  title: string;
  description: string;
  questions?: Question[];
  status?: string;
  dueDate?: string;
  createdBy: string;
};

 interface InspectionItem {
  id: string;
  surveyId: string;
  is_deleted: boolean;
  assignedTo: {
    id: string;
    name: string;
    email: string;
    role: string;
    providerImageUrl?: string;
    phoneNumber?: string;
  };
  assignedBy: string | null;
  status: InspectionStatus;
  dueDate: string;
  acceptedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Populated when the inspection has been submitted */
  sections?: InspectionItemSection[];
  logs: InspectionLog[];
  // ── New meta fields ──
  areaBuilding?: string;
  /** Comma-separated area descriptions as stored/returned by API */
  areaDescription?: string;
  businessUnit?: string;
  inspectionBuddy?: string;
  nextInspectionDue?: string;
  comments?: string;
}

 type InspectionDetail = {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  status?: string;
  dueDate?: string;
  /** Template sections (no answers) */
  sections?: InspectionSection[];
  inspections: InspectionItem[];
};

// ── Creation ──────────────────────────────────────────────────────────────────

 type NewSection = {
  title: string;
  description: string;
  order: number;
  questions: NewQuestion[];
  notes?: string; // optional additional comments for the section
  tables?: NewTable[]; // optional tables for the section
};

 type NewInspection = {
  title: string;
  description: string;
  sections: NewSection[];
  status?: string;
};

// ── API responses ─────────────────────────────────────────────────────────────

 interface getInspectionsResponse {
  data: Inspection[];
  message: string;
}

 interface getInspectionResponse {
  data: InspectionDetail;
  message: string;
}

interface AreaData {
  areaBuilding: string; // e.g. "Area 1 - 11"
  descriptions: string[];
}

// In your types file (e.g. types/inspection.ts)
interface NewTable {
  name: string;
  columns: string[];
}

