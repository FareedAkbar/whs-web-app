interface Inspection {
  id: string;
  title: string;    
  description: string;
  questions: Question[];
  status: "not_started" | "in_progress" | "completed" | "submitted";
}
