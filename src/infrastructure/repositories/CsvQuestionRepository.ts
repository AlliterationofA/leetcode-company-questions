import { Question, FilterState, SortState, PaginationState } from '@/shared/types'
import { QuestionRepository } from '@/domain/repositories/QuestionRepository'
import { AppError } from '../../shared/utils'

export class CsvQuestionRepository implements QuestionRepository {
  private questions: Question[] = []

  constructor() {
    this.loadQuestions()
  }

  private async loadQuestions(): Promise<void> {
    try {
      const response = await fetch('/codedata.csv')
      const text = await response.text()
      this.questions = this.parseCsv(text)
    } catch (error) {
      console.error('Error loading questions:', error)
    }
  }

  private parseCsv(csvText: string): Question[] {
    const lines = csvText.split('\n')
    const headers = lines[0].split(',')
    return lines.slice(1).map(line => {
      const values = line.split(',')
      return {
        title: values[0],
        difficulty: values[1] as 'Easy' | 'Medium' | 'Hard',
        frequency: parseFloat(values[2]),
        acceptance_rate: parseFloat(values[3]),
        timeframe: values[4],
        occurrences: parseInt(values[5], 10),
        companies: values[6].split(';'),
        topics: values[7].split(';'),
        link: values[8]
      }
    })
  }

  async getAllQuestions(): Promise<Question[]> {
    return this.questions
  }

  async getQuestionsByFilters(filters: FilterState, sort: SortState, pagination: PaginationState): Promise<Question[]> {
    let filtered = this.questions

    if (filters.companies.length > 0) {
      filtered = filtered.filter(q => q.companies.some((c: string) => filters.companies.includes(c)))
    }
    if (filters.difficulty.length > 0) {
      filtered = filtered.filter(q => filters.difficulty.includes(q.difficulty))
    }
    if (filters.timeframes.length > 0) {
      filtered = filtered.filter(q => filters.timeframes.includes(q.timeframe))
    }
    if (filters.topics.length > 0) {
      filtered = filtered.filter(q => q.topics.some((t: string) => filters.topics.includes(t)))
    }
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(q => q.title.toLowerCase().includes(term))
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[sort.field as keyof Question]
      const bValue = b[sort.field as keyof Question]
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sort.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }
      return sort.direction === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number)
    })

    // Paginate
    const start = (pagination.page - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    return filtered.slice(start, end)
  }

  async getQuestionById(id: number): Promise<Question | null> {
    return this.questions[id] || null
  }

  async getQuestionsByCompany(company: string): Promise<Question[]> {
    return this.questions.filter(q => q.companies.includes(company))
  }

  async getQuestionsByDifficulty(difficulty: string): Promise<Question[]> {
    return this.questions.filter(q => q.difficulty === difficulty)
  }

  async getQuestionsByTimeframe(timeframe: string): Promise<Question[]> {
    return this.questions.filter(q => q.timeframe === timeframe)
  }

  async getQuestionsByTopic(topic: string): Promise<Question[]> {
    return this.questions.filter(q => q.topics.includes(topic))
  }

  async getCompanies(): Promise<string[]> {
    const companies = new Set<string>()
    this.questions.forEach(q => q.companies.forEach(c => companies.add(c)))
    return Array.from(companies).sort()
  }

  async getTopics(): Promise<string[]> {
    const topics = new Set<string>()
    this.questions.forEach(q => q.topics.forEach(t => topics.add(t)))
    return Array.from(topics).sort()
  }

  async getTimeframes(): Promise<string[]> {
    const timeframes = new Set<string>()
    this.questions.forEach(q => timeframes.add(q.timeframe))
    return Array.from(timeframes).sort()
  }
} 