import { logger } from "./logger"
import { NetworkError, handleError } from "./error-handler"

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
}

class GitHubApiClient {
  private readonly baseUrl = "https://api.github.com"
  private readonly owner = "AlliterationofA"
  private readonly repo = "PublicFiles"
  private readonly filePath = "codedata.csv"

  async getLastCommitInfo(): Promise<GitHubApiResponse> {
    try {
      logger.info("Fetching last commit info from GitHub API")

      const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/commits?path=${this.filePath}&per_page=1`

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
              html_url: `https://github.com/${this.owner}/${this.repo}/commits`,
            },
            lastUpdated: new Date().toISOString(),
            commitUrl: `https://github.com/${this.owner}/${this.repo}/commits`,
          }
        }
        throw new NetworkError(`GitHub API error: ${response.status} ${response.statusText}`)
      }

      const commits = await response.json()

      if (!commits || commits.length === 0) {
        throw new NetworkError("No commits found for the CSV file")
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
      const appError = handleError(error, "GitHub API")
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
          html_url: `https://github.com/${this.owner}/${this.repo}/commits`,
        },
        lastUpdated: new Date().toISOString(),
        commitUrl: `https://github.com/${this.owner}/${this.repo}/commits`,
      }
    }
  }

  async getRepositoryInfo() {
    try {
      logger.info("Fetching repository info from GitHub API")

      const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}`

      const response = await fetch(url, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "LeetCode-Analytics-App",
        },
      })

      if (!response.ok) {
        throw new NetworkError(`GitHub API error: ${response.status} ${response.statusText}`)
      }

      const repo = await response.json()

      logger.info("Successfully fetched repository info", {
        name: repo.name,
        updatedAt: repo.updated_at,
        stars: repo.stargazers_count,
      })

      return {
        name: repo.name,
        description: repo.description,
        updatedAt: repo.updated_at,
        htmlUrl: repo.html_url,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
      }
    } catch (error) {
      const appError = handleError(error, "GitHub Repository API")
      logger.error("Failed to fetch GitHub repository info", appError)
      throw appError
    }
  }
}

export const githubApi = new GitHubApiClient()
