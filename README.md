# endpoint-health-monitor

## Introduction

Need to know the moment when your server goes down? Diagnosing tricky issues with your REST endpoint?

Powered by [Cloudflare Workers](https://www.cloudflare.com/products/workers/) and [Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/), 
this program will periodically query your specified endpoint(s);
if the state of the endpoint changes (e.g. it goes down),
a message is sent to your specified webhook so that you know the moment something happens. What's more, the program integrates with 
[Worker's Analytics Engine](https://developers.cloudflare.com/analytics/analytics-engine/) so that
you can analyse metrics such as response status codes, content length and approximate latency.

## Usage

You can deploy this to Cloudflare Workers using the [Wrangler](https://developers.cloudflare.com/workers/get-started/guide/) tool.

### 1. Set the WEBHOOK secret using**
```
npx wrangler secret put WEBHOOK
```
When the state changes (from UP to DOWN, or vice versa), the program will send a POST request to this webhook with this JSON content:
```json
{content: "Example endpoint is down"}
```
This way, the webhook seamlessly integrates with a [Discord webhook](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks).
Feel free to fork the repository if you need a different payload!

### 2. Set the endpoint you'd like to monitor by modifying the `wrangler.jsonc` file:**
```json
"vars": {
		"MONITORED_ENDPOINT": "https://maia395.dev"
	}
```

### (Optional) Change the cron frequency
Modify the cron frequency, or add multiple triggers in `wrangler.jsonc`
```json
"triggers": {
		"crons": [
			"* * * * *"
		]
	}
```
