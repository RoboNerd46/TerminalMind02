export interface QAEntry {
  question: string;
  answer: string;
}

export type Stage = 'idle' | 'thinking' | 'typing_question' | 'typing_answer' | 'error';