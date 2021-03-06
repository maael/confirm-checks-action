<p align="center">
  <a href="https://github.com/maael/confirm-checks-action/actions"><img alt="confirm-checks-action status" src="https://github.com/maael/confirm-checks-action/workflows/build-test/badge.svg"></a>
</p>

# confirm-checks-action

This action will send a nice deploy message in slack, including:

- Listing the commits between what's on the service and what you're deploying
- Pinging the authors of the commits via slack in the message

## Usage

```yml
- uses: maael/confirm-checks-action
  with:
    github_token: ${{secrets.GH_PAT_TOKEN}}
    commit: '25e6c46a48a3052c27b8f35e2e3cd513193ce9a8'
    repo: 'ThreadsStyling/web-app-next-template'
    checks: 'Deploy Staging,CI Checks'
```


## Inputs

```yml
inputs:
  github_token:
    required: true
    description: 'GitHub token'
  commit:
    description: 'The commit sha to use as the HEAD, defaults to the current sha'
  repo:
    description: 'The repo in form OWNER/NAME to use, defaults to current'
  checks:
    description: 'The checks to confirm, separated by a comma'
    required: true
```

## Publishing

Actions are run from GitHub repos so we will checkin the packed dist folder.

Then run [ncc](https://github.com/zeit/ncc) and push the results:
```bash
$ npm run package
$ git add dist
$ git commit -a -m "prod dependencies"
$ git tag -fa v1.0.0 -m "v1.0.0"
$ git push --tags
$ git checkout v1
$ git push origin v1 --force
$ git checkout main
```

## Local Testing

Install [act](https://github.com/nektos/act) via brew.

Then make a copy of the `.env.schema` in `.env`, and fill it out with the expected environment variables.

You can then run `act -j local`.

Make sure to run `yarn run build && yarn run package` first to use the latest version of the action.
