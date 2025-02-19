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
                image = 'http://bgs-static-assets.s3-website-us-east-1.amazonaws.com/started.png';
                color = '#f7b500';
                break;
            case 'success':
                image = 'http://bgs-static-assets.s3-website-us-east-1.amazonaws.com/success.png';
                color = '#4bb543';
                break;
            case 'failure':
                image = 'http://bgs-static-assets.s3-website-us-east-1.amazonaws.com/failure.png';
                color = '#fc100d';
                break;
            default:
                image = 'http://bgs-static-assets.s3-website-us-east-1.amazonaws.com/confused.png';
                color = '#8b50ff';
        }

        const messagePayload = {
            channel: slackChannel,
            ...(ts && { ts }),
            attachments: [
                {
                    color: color,
                    blocks: [
                        {
                            type: 'section',
                            fields: [
                              {
                                type: 'mrkdwn',
                                text: `*Component:* ${name}\n`
                              },
                              {
                                type: 'mrkdwn',
                                text: `*Environment:* ${environment}\n`
                              },
                              {
                                type: 'mrkdwn',
                                text: `*Status:* ${status}`
                              },
                              {
                                type: 'mrkdwn',
                                text: `*Triggered by:* ${actor}`
                              }
                            ],
                            accessory: {
                              type: 'image',
                              image_url: image,
                              alt_text: status
                            }
                        },
                        {
                          type: "divider"
                        },
                        {
                          type: "actions",
                          elements: [
                            {
                              type: "button",
                              text: {
                                type: "plain_text",
                                emoji: true,
                                text: "View Action",
                              },
                              url: githubRunUrl
                            }
                          ]
                        }
                    ]
                }
            ]
        };

        const slackUrl = ts 
          ? 'https://slack.com/api/chat.update'
          : 'https://slack.com/api/chat.postMessage';

        const response = await axios.post(slackUrl, messagePayload, {
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
