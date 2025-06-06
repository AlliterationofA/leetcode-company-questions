import { Question, FilterState, SortState, PaginationState } from '@/shared/types'

export interface QuestionRepository {
  getAllQuestions(): Promise<Question[]>
  getQuestionsByFilters(filters: FilterState, sort: SortState, pagination: PaginationState): Promise<Question[]>
  getQuestionById(id: number): Promise<Question | null>
  getQuestionsByCompany(company: string): Promise<Question[]>
  getQuestionsByDifficulty(difficulty: string): Promise<Question[]>
  getQuestionsByTimeframe(timeframe: string): Promise<Question[]>
  getQuestionsByTopic(topic: string): Promise<Question[]>
  getCompanies(): Promise<string[]>
  getTopics(): Promise<string[]>
  getTimeframes(): Promise<string[]>
} 