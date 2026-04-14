interface Question {
  id: string;
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

interface getInspectionsResponse {
  data: Inspection[];
  message: string;
}
interface getInspectionResponse {
  data: InspectionDetail;
  message: string;
}
type AnsType =
  | "TEXT"
  | "YES_NO"
  | "SINGLE_OPTION"
  | "MULTI_OPTION"
  | "DATE"
  | "DATE_RANGE"
  | "LONG_TEXT";
type Inspection = {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  status?: string;
  dueDate?: string;
  createdBy: string;
};
interface InspectionLog {
  id: string;
  inspectionId: string;
  status:
    | "INITIATED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "ASSIGNED"
    | "CLOSED";
  userId: string;
  comment: string;
  createdAt: string; // ISO date string
}

interface InspectionAnswer {
  id?: string;
  questionId?: string;
  answer?: string | string[] | null;
  createdAt?: string;
  updatedAt?: string;
}

interface InspectionAnswerWithQuestion {
  inspectionId: string;
  answers: { questionId: string; answer: string | string[] }[];
}
interface InspectionItem {
  id: string;
  surveyId: string;
  is_deleted: boolean;
  assignedTo: {
    id: string;
    name: string;
    email: string;
    role: string;
    providedImageUrl: string;
    phoneNumber: string;
  };
  assignedBy: string | null;
  status:
    | "INITIATED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "ASSIGNED"
    | "CLOSED";
  dueDate: string; // ISO date string
  acceptedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  answers: InspectionAnswer[];
  logs: InspectionLog[];
}
type InspectionDetail = {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  status?: string;
  dueDate?: string;
  inspections: InspectionItem[];
  createdBy: string;
};
type NewInspection = {
  title: string;
  description: string;
  questions: NewQuestion[];
  status?: string;
  // dueDate: string;
};
