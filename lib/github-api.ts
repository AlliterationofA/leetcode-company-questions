import { logger } from "./logger"
import { AppError } from "./error-handler"

interface GitHubCommit {
  sha: string
  commit: {
    author: {
      name: string
      email: string
      date: string
    }
    message: string
  }
  html_url: string
}

interface GitHubApiResponse {
  lastCommit: GitHubCommit
  lastUpdated: string
  commitUrl: string
  commitAuthor?: string
}

interface GitHubRepositoryInfo {
  name: string;
  description: string;
  updated_at: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
}

class GitHubApiClient {
  private readonly baseUrl = "https://api.github.com"
  private readonly owner = "yourusername"
  private readonly repo = "leetcode-company-questions"

  async getLastCommitInfo(
    owner: string = "AlliterationofA",
    repo: string = "PublicFiles",
    filePath?: string,
  ): Promise<GitHubApiResponse> {
    try {
      let url = `${this.baseUrl}/repos/${owner}/${repo}/commits?per_page=1`;
      if (filePath) {
        url = `${this.baseUrl}/repos/${owner}/${repo}/commits?path=${filePath}&per_page=1`;
      }

      logger.info(`Fetching last commit info for ${owner}/${repo}${filePath ? '/' + filePath : ''} from GitHub API`);

      const response = await fetch(url, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "LeetCode-Analytics-App",
        },
      })

      if (!response.ok) {
        if (response.status === 403) {
          logger.warn("GitHub API rate limit exceeded, using fallback")
          // Return fallback data when rate limited
          return {
            lastCommit: {
              sha: "unknown",
              commit: {
                author: {
                  name: "Unknown",
                  email: "",
                  date: new Date().toISOString(),
                },
                message: "Unable to fetch commit info (rate limited)",
              },
              html_url: `https://github.com/${owner}/${repo}/commits`,
            },
            lastUpdated: new Date().toISOString(),
            commitUrl: `https://github.com/${owner}/${repo}/commits`,
          }
        }
        throw new AppError(`GitHub API error: ${response.status} ${response.statusText}`)
      }

      const commits = await response.json()

      if (!commits || commits.length === 0) {
        throw new AppError("No commits found for the CSV file")
      }

      const lastCommit = commits[0]

      logger.info("Successfully fetched last commit info", {
        sha: lastCommit.sha.substring(0, 7),
        date: lastCommit.commit.author.date,
        message: lastCommit.commit.message.substring(0, 50),
      })

      return {
        lastCommit,
        lastUpdated: lastCommit.commit.author.date,
        commitUrl: lastCommit.html_url,
      }
    } catch (error) {
      const appError = AppError.from(error, "GitHub API")
      logger.error("Failed to fetch GitHub commit info", appError)

      // Return fallback data instead of throwing
      return {
        lastCommit: {
          sha: "unknown",
          commit: {
            author: {
              name: "Unknown",
              email: "",
              date: new Date().toISOString(),
            },
            message: "Unable to fetch commit info",
          },
          html_url: `https://github.com/${owner}/${repo}/commits`,
        },
        lastUpdated: new Date().toISOString(),
        commitUrl: `https://github.com/${owner}/${repo}/commits`,
      }
    }
  }

  async getRepositoryInfo(
    owner: string = "AlliterationofA",
    repo: string = "PublicFiles",
  ): Promise<GitHubRepositoryInfo> {
    try {
      logger.info(`Fetching repository info for ${owner}/${repo} from GitHub API`);

      const url: string = `${this.baseUrl}/repos/${owner}/${repo}`;

      const response: Response = await fetch(url, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "LeetCode-Analytics-App",
        },
      })

      if (!response.ok) {
        throw new AppError(`GitHub API error: ${response.status} ${response.statusText}`)
      }

      const repoData: GitHubRepositoryInfo = await response.json()

      logger.info("Successfully fetched repository info", {
        name: repoData.name,
        updated_at: repoData.updated_at,
        stars: repoData.stargazers_count,
      })

      return {
        name: repoData.name,
        description: repoData.description,
        updated_at: repoData.updated_at,
        html_url: repoData.html_url,
        stargazers_count: repoData.stargazers_count,
        forks_count: repoData.forks_count,
      }
    } catch (error) {
      const appError = AppError.from(error, "GitHub Repository API")
      logger.error("Failed to fetch GitHub repository info", appError)
      throw appError
    }
  }

  async getLastUpdated(): Promise<string> {
    try {
      const response = await fetch(
        `${this.baseUrl}/repos/${this.owner}/${this.repo}/commits?path=codedata.csv&per_page=1`
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const [latestCommit] = await response.json() as { commit: { committer: { date: string } } }[]
      return latestCommit.commit.committer.date
    } catch (error) {
      logger.error('Error fetching last updated date from GitHub:', error)
      throw new AppError('Failed to fetch last updated date', { cause: error })
    }
  }

  async getFileContent(path: string): Promise<string> {
    try {
      const response = await fetch(
        `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json() as { content: string }
      return Buffer.from(data.content, 'base64').toString()
    } catch (error) {
      logger.error(`Error fetching file content from GitHub: ${path}`, error)
      throw new AppError('Failed to fetch file content', { cause: error })
    }
  }
}

export const githubApi = new GitHubApiClient()
