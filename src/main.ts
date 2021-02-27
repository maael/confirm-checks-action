import * as core from '@actions/core'
import * as github from '@actions/github'

async function run(): Promise<void> {
  try {
    const commit = await getCommit()

    const octo = github.getOctokit(core.getInput('github_token'))

    const repoFull =
      core.getInput('repo') ||
      `${github.context.repo.repo}/${github.context.repo.owner}`
    const repoParts = repoFull.split('/')
    const owner = repoParts[0]
    const repo = repoParts[1]

    const result = await octo.request(
      'GET /repos/{owner}/{repo}/commits/{ref}/check-runs',
      {
        owner,
        repo,
        ref: commit
      }
    )
    const mappedResult = result.data.check_runs.map(r => ({
      name: r.name,
      status: r.status,
      conclusion: r.conclusion,
      link: r.html_url
    }))

    const checks = (core.getInput('checks') || '').split(',')
    const missingChecks = checks.filter(
      c =>
        !mappedResult.find(
          ({name, status, conclusion}) =>
            name === c && status === 'completed' && conclusion === 'success'
        )
    )
    if (missingChecks.length) {
      core.setFailed(
        `${missingChecks.length} checks missing: ${missingChecks.join(', ')}`
      )
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

async function getCommit(): Promise<string> {
  return core.getInput('commit') || github.context.sha
}

run()
