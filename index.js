const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const { IncomingWebhook } = require('@slack/webhook');

const gitKeepFile = ".gitkeep"

const statusMapEmoji = {
    "success": ":white_check_mark:",
    "failed": ":fire:"
}

try {
    const slackWebhookUrl = core.getInput('slack-webhook');
    const workflowResults = core.getInput('workflow-results');
    const ownerName = core.getInput('owner-name');

    const statusesToReport = workflowResults.split(',');

    const repositoryOwnerPath = "repositories/" + ownerName;
    const repositories = fs.readdirSync(repositoryOwnerPath);

    let slackReport = "";

    // Build a string to generate a report for slack.
    repositories.forEach(repository => {
        if (repository !== gitKeepFile) {
            const repositoryPath = repositoryOwnerPath + "/" + repository;
            const workflows = fs.readdirSync(repositoryPath);

            const workflowMap = new Map();
            workflows.forEach(workflow => {
                const workflowStatus = fs.readFileSync(repositoryPath + "/" + workflow).toString();
                if (statusesToReport.includes(workflowStatus)) {
                    slackReport += `${statusMapEmoji[workflowStatus]} \`${workflow}\` Status [${workflowStatus}]\n`;
                }
            });
        }
    });

    const webhook = new IncomingWebhook(slackWebhookUrl);

    (async () => {
        await webhook.send({
            text: slackReport,
            icon_emoji: ":fire:"
        });
    })();
} catch (error) {
    core.setFailed(error.message);
}