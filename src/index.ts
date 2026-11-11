import { env } from "cloudflare:workers";

async function sendToWebhook(message: String) {
	await fetch(env.WEBHOOK, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ content: message })
	});
}

function writeAnalyticsPoint(doubles: number[]) {
	env.ENDPOINT_ANALYTICS.writeDataPoint({
		'blobs': [env.MONITORED_ENDPOINT],
		'doubles': doubles
	});
}

export default {
	async scheduled(event, env, ctx): Promise<void> {
		let state = 'DOWN';
		let startTime: number = Date.now();
		let previousState = await env.ENDPOINT_STATE.get(env.MONITORED_ENDPOINT);

		try {
			const response = await env.TUNNEL.fetch(env.MONITORED_ENDPOINT, { redirect: "manual", signal: AbortSignal.timeout(10000) });
			if (response.ok) {
				state = 'UP';
			}
			let latency: number = Date.now() - startTime;

			writeAnalyticsPoint([
				response.status,
				parseInt(response.headers.get("content-length") ?? "0"),
				latency
			]);
		} catch (error) {
			state = 'ERROR'
			if (previousState !== state) {
				await sendToWebhook(`Endpoint: ${env.MONITORED_ENDPOINT} has failed with error: ${error}`);
				await env.ENDPOINT_STATE.put(env.MONITORED_ENDPOINT, state);
			}
			return;
		}

		if (previousState !== state) {
			await sendToWebhook(`Endpoint: ${env.MONITORED_ENDPOINT} is ${state}`);
			await env.ENDPOINT_STATE.put(env.MONITORED_ENDPOINT, state);
		}
	},
} satisfies ExportedHandler<Env>;
