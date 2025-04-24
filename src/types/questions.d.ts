export interface Question {
    id?: string;
    question: string;
    type: QuestionType;
    options?: string[];
  }
  
  export type QuestionType =
    | "text"
    | "yes_no"
    | "single_selection"
    | "multiple_selection"
    | "date"
    | "date_range"
    |"media";
  