const core = require('@actions/core');
const axios = require('axios');

async function run() {
    try {
        const slackToken = core.getInput('slack_token');
        const slackChannel = core.getInput('slack_channel_id');
        const status = core.getInput('status');
        const environment = core.getInput('environment');
        const name = core.getInput('name');
        const actor = core.getInput('actor');
        const runId = core.getInput('run_id');
        const ts = core.getInput('ts') || null;
        const githubRepo = process.env.GITHUB_REPOSITORY;
        const githubRunUrl = `https://github.com/${githubRepo}/actions/runs/${runId}`;

        let emoji, color;
        switch (status) {
            case 'started':
                emoji = ':large_yellow_circle:';
                color = '#f7b500';
                break;
            case 'success':
                emoji = ':white_check_mark:';
                color = '#2eb886';
                break;
            case 'failure':
                emoji = ':x:';
                color = '#d00000';
                break;
            default:
                emoji = ':grey_question:';
                color = '#cccccc';
        }

        const messagePayload = {
            channel: slackChannel,
            attachments: [
                {
                    color: color,
                    blocks: [
                        {
                            type: 'section',
                            fields: [
                              {
                                type: 'mrkdwn',
                                text: `*Component:* ${name}`
                              },
                              {
                                type: 'mrkdwn',
                                text: `*Environment:* ${environment}`
                              },
                              {
                                type: 'mrkdwn',
                                text: `*Triggered by:* ${actor}\n`
                              }   ,                           
                              {
                                type: 'mrkdwn',
                                text: `*<${githubRunUrl}|View Action>*`
                              }
                            ],
                            accessory: {
                              type: 'image',
                              image_url: "https://api.slack.com/img/blocks/bkb_template_images/approvalsNewDevice.png",
                              alt_text: "computer thumbnail"
                            }
                        }
                    ]
                }
            ]
        };

        if (ts) {
            messagePayload.ts = ts; // Update the message instead of posting a new one
        }

        const response = await axios.post('https://slack.com/api/chat.postMessage', messagePayload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${slackToken}`
            }
        });

        if (!response.data.ok) {
            core.setFailed(`Failed to send Slack notification: ${response.data.error}`);
        } else {
            core.info(`Slack notification sent successfully. TS: ${response.data.ts}`);
            core.setOutput('ts', response.data.ts); // Store TS for updates
        }
    } catch (error) {
        core.setFailed(`Failed to send Slack notification: ${error.message}`);
    }
}

run();
