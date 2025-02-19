# Notify Slack Action

### Example

```yaml
      - name: Notify Slack - Deployment Started
        id: slack_start
        uses: BrightcovePS/slack_notifications_action@main
        with:
          slack_token: ${{ secrets.SLACK_TOKEN }}
          slack_channel_id: ${{ vars.SLACK_CHANNEL_ID}}
          status: "started"
          name: ${{ env.NAME }}
          environment: ${{ github.ref_name }}
          actor: ${{ github.actor }}
          run_id: ${{ github.run_id }}

      - name: Notify Slack - Deployment Completed
        if: always()
        uses: BrightcovePS/slack_notifications_action@main
        with:
          slack_token: ${{ secrets.SLACK_TOKEN }}
          slack_channel_id: ${{ vars.SLACK_CHANNEL_ID}}
          status: ${{ job.status }}
          name: ${{ env.NAME }}
          environment: ${{ github.ref_name }}
          actor: ${{ github.actor }}
          run_id: ${{ github.run_id }}
          ts: ${{ steps.slack_start.outputs.ts }}
```