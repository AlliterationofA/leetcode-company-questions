import { Question, FilterState, SortState, PaginationState } from '@/shared/types'
import { QuestionRepository } from '../../domain/repositories/QuestionRepository'

export class GetQuestionsUseCase {
  constructor(private readonly repository: QuestionRepository) {}

  async execute(filters: FilterState, sort: SortState, pagination: PaginationState): Promise<{ questions: Question[]; pagination: PaginationState }> {
    const questions = await this.repository.getQuestionsByFilters(filters, sort, pagination);
    return { questions, pagination };
  }
}

export class GetQuestionByIdUseCase {
  constructor(private questionRepository: QuestionRepository) {}

  async execute(id: string) {
    return this.questionRepository.getQuestionById(id);
  }
}

export class GetMetadataUseCase {
  constructor(private questionRepository: QuestionRepository) {}

  async execute() {
    const [companies, topics, timeframes] = await Promise.all([
      this.questionRepository.getCompanies(),
      this.questionRepository.getTopics(),
      this.questionRepository.getTimeframes()
    ]);

    return {
      companies,
      topics,
      timeframes
    };
  }
} 