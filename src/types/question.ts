import { Schema } from '../../amplify/data/resource';

export type Question = Schema['Question'];
export type QuestionCategory = Schema['QuestionCategory'];
export type QuestionDifficulty = Schema['QuestionDifficulty'];

// Helper type for creating a new question
export type CreateQuestionInput = Omit<Question, 'id' | 'createdAt' | 'updatedAt' | 'owner'>;

// Helper type for updating an existing question
export type UpdateQuestionInput = Partial<CreateQuestionInput> & { id: string };
