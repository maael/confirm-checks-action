import * as core from '@actions/core'
import * as github from '@actions/github'

type CheckRuns = {
  name: string
  status: string
  conclusion: string
  html_url: string
}

async function run(): Promise<void> {
  try {
    const commit = await getCommit()

    const octo = github.getOctokit(core.getInput('github_token'))

    const repoFull =
      core.getInput('repo') ||
      `${github.context.repo.owner}/${github.context.repo.repo}`
    const repoParts = repoFull.split('/')
    const owner = repoParts[0]
    const repo = repoParts[1]

    core.info(
      `GET /repos/${owner}/${repo}/commits/${commit}/check-runs?per_page=100`
    )

    const result = await octo.request(
      'GET /repos/{owner}/{repo}/commits/{ref}/check-runs?per_page=100',
      {
        owner,
        repo,
        ref: commit
      }
    )

    core.info(`${result.data.check_runs.length} check runs found for ${commit}`)

    const mappedResult = result.data.check_runs.map((r: CheckRuns) => ({
      name: r.name,
      status: r.status,
      conclusion: r.conclusion,
      link: r.html_url
    }))

    const checks = (core.getInput('checks') || '').split(',')
    const missingChecks = checks.filter(
      c =>
        !mappedResult.find(
          ({name, status, conclusion}: CheckRuns) =>
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
