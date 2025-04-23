export interface Question {
    question: string;
    type: QuestionType;
    options?: string[];
  }
  
  export type QuestionType =
    | "text"
    | "yesno"
    | "radio"
    | "select"
    | "date"
    | "daterange";
  