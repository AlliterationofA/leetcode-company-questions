import { QuestionMetadata, Question } from '../../shared/types'
import { QuestionRepository } from '../../domain/repositories/QuestionRepository'

export class GetMetadataUseCase {
  constructor(private readonly repository: QuestionRepository) {}

  async execute(): Promise<QuestionMetadata> {
    try {
      const questions = await this.repository.getAllQuestions()
      
      const companies = new Set<string>()
      const difficulties = new Set<string>()
      const timeframes = new Set<string>()
      const topics = new Set<string>()

      questions.forEach((question: Question) => {
        question.companies.forEach((company: string) => companies.add(company))
        difficulties.add(question.difficulty)
        timeframes.add(question.timeframe)
        question.topics.forEach((topic: string) => topics.add(topic))
      })

      return {
        companies: Array.from(companies).sort(),
        difficulties: Array.from(difficulties).sort() as QuestionMetadata['difficulties'],
        timeframes: Array.from(timeframes).sort() as QuestionMetadata['timeframes'],
        topics: Array.from(topics).sort()
      }
    } catch (error) {
      throw new Error('Failed to fetch metadata')
    }
  }
} 