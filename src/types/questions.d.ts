export interface Question {
    id: string;
    question: string;
    type: AnsType;
    options?: string[];
  }
  
  export type AnsType =
    | "text"
    | "yes_no"
    | "single_selection"
    | "multiple_selection"
    | "date"
    | "date_range"
    |"media";
  