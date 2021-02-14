# Repository Status Collector

![Report failures to Slack](https://github.com/dwardu89/repository-status-collector/workflows/Report%20failures%20to%20Slack/badge.svg)

## What is the use of this repository?

This repository is a solution to creating a serverless solution to help increase visibility of the health of GitHub Actions workflows.

GitHub Actions provides a badge that lets you visibly see it's status, however that requires you to look at it to determine whether it is passing or failing. This can get out of hand when your number of repositories scale up, and you are not actively looking at the pages.

You can use this repository to store the status of repositories and have an action read their latest outcome and send a status back to Slack.

It's useful especially when working in a team to ensure that at the beginning of the day, you will get a daily update of the status of the repositories that are failing. This will stop members of the team from having a surprise when they expect the workflows to work.

## How do I use it?

## Requirements

- An Incoming Slack Webhook
- A GitHub PAT Token with the **repo**, and **webhook** scopes
- A repository with GithHub Actions with workflows

I will refer to the repository you want to monitor as the **reporter** repository and the Repository Status Collector as the **collector**.

### The **collector** repository

Steps:

1. Fork the **collector** repository.
2. Set the Slack Incoming Webhook URL as a repository secret to the variable `SLACK_WEBHOOK`.
3. Clear the `repositories/` folder, just ensure there is the `.gitkeep` file to still commit that variable.
4. Set the schedule in the `report_failures.yml` to your desired time.
5. Wait for the `report_failures.yml` workflow to trigger, or you can trigger it manually.

### The **reporter** repository

Steps:

1. Add the Github PAT Token you created and store it as a secret to the variable `ACCESS_TOKEN`.

2. In the workflow you want to report it's status on. Add the following step to the job. Replace `dwardu89/repository-status-collector` with your repository-status-collector's repository.

```yaml
- name: Dispatch a successful event
  if: ${{ always() }}
  run: |
    curl -X POST https://api.github.com/repos/dwardu89/repository-status-collector/dispatches \
    -H "Accept: application/vnd.github.v3+json" \
    -u ${{ secrets.ACCESS_TOKEN }} \
    --data '{"event_type": "status_report", "client_payload": { "result": "${{ job.status }}", "workflow": "${{ github.workflow }}", "github_user": "${{ github.actor }}", "repository": "${{ github.repository}}" }}'
```

3. Repeat step to to the workflows you want to monitor.
