export interface Question {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  companies: string[];
  timeframes: string[];
  topics: string[];
  frequency: number;
  acceptance_rate: number;
  link: string;
  originalRows?: any[];
}

export interface QuestionFilters {
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  companies?: string[];
  topics?: string[];
  timeframes?: string[];
  searchTerm?: string;
}

export interface QuestionSort {
  field: 'title' | 'difficulty' | 'frequency' | 'acceptance_rate' | 'timeframe' | 'occurrences';
  direction: 'asc' | 'desc';
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface QuestionListResponse {
  questions: Question[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
} 