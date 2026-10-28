import source from './unit06_crime_prevention_master.json';
import { normalizeContent } from './normalizeContent';

export const unitContent = normalizeContent(source);
export { ContentValidationError, normalizeContent } from './normalizeContent';
export { studentPracticeQuestions } from './studentPractice';
export type { UnitContent, QuizQuestion, QuizOption, Flashcard } from './normalizeContent';
export type { StudentPracticeQuestion } from './studentPractice';
