export interface GuidedStepMultipleChoice {
  step_number: number;
  type: 'multiple_choice';
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface GuidedStepDataRead {
  step_number: number;
  type: 'data_read';
  question: string;
  exhibit: {
    type: 'table';
    headers: string[];
    rows: string[][];
  };
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface GuidedStepFreeWrite {
  step_number: number;
  type: 'free_write';
  prompt: string;
  placeholder: string;
  model_answer: string;
  explanation: string;
}

export interface GuidedStepReveal {
  step_number: number;
  type: 'reveal';
  message: string;
}

export type GuidedStep =
  | GuidedStepMultipleChoice
  | GuidedStepDataRead
  | GuidedStepFreeWrite
  | GuidedStepReveal;

export interface Slide {
  slide_number: number;
  title: string;
  layout: 'title_bullets' | 'two_column' | 'single_insight' | 'data_table' | 'recommendation';
  content:
    | string[]
    | { left: string[]; right: string[] }
    | { headline: string; detail: string }
    | { headers: string[]; rows: string[][] };
  so_what: string;
}

export interface Question {
  question: string;
  skill_tested: string;
  hint: string;
}

export interface Case {
  slug: string;
  title: string;
  industry: string;
  framework: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  problem: string;
  guided_steps: GuidedStep[];
  report: string;
  slides: Slide[];
  questions: Question[];
}

export interface Framework {
  slug: string;
  title: string;
  description: string;
  when_to_use: string;
  structure: string;
  worked_example: string;
  common_mistakes: string[];
  practice_prompts: string[];
}
