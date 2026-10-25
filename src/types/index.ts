// Shared data model. Answers and keys are bitmasks: bit i = choice i (A=1, B=2, C=4...).

export interface Student {
  id: string; // digits bubbled on the sheet
  name: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  students: Student[];
}

// Customizable sheet layout; each quiz carries its own form.
export interface SheetForm {
  title: string;
  items: number; // 1..100
  choices: number; // 2..6
  idDigits: number; // 0..10
  fields: string[]; // header write-in lines, e.g. Name, Section
  instructions: string; // free text under the title, up to 4 lines
  perPage: number; // forms printed per A4 page: 1, 2, 3, 4, 6, 8
}

export interface Quiz {
  id: string;
  form: SheetForm;
  key: number[]; // bitmask of accepted choices per item; 0 = unset
  classId?: string;
  updatedAt: number;
}

export interface Result {
  id: string;
  quizId: string;
  studentId: string;
  answers: number[]; // bitmask per item; 0 = blank, >1 bit = multiple marks
  score: number;
  scannedAt: number;
}

export interface AppData {
  classes: ClassRoom[];
  quizzes: Quiz[];
  results: Result[];
}
