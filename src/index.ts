/**
 * Welcome to Cloudflare Workers!
 *
 * This is a template for a Scheduled Worker: a Worker that can run on a
 * configurable interval:
 * https://developers.cloudflare.com/workers/platform/triggers/cron-triggers/
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Run `curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"` to see your Worker in action
 * - Run `npm run deploy` to publish your Worker
 *
 * Bind resources to your Worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async scheduled(event, env, ctx): Promise<void> {
		// A Cron Trigger can make requests to other endpoints on the Internet,
		// publish to a Queue, query a D1 Database, and much more.
		//
		// We'll keep it simple and make an API call to a Cloudflare API:
		let startTime: number = Date.now();
		let resp = await env.ERSA.fetch(env.MONITORED_ENDPOINT, { redirect: "manual" });
		let latency: number = Date.now() - startTime;

		let state = 'DOWN';
		if (resp.ok) {
			state = 'UP'
		}
		await env.ENDPOINT_STATE.put(env.MONITORED_ENDPOINT, state);


		env.ENDPOINT_ANALYTICS.writeDataPoint({
			'blobs': [env.MONITORED_ENDPOINT],
			'doubles': [
				resp.status,
				parseInt(resp.headers.get("content-length") ?? "0"),
				latency
			]
		});
	},
} satisfies ExportedHandler<Env>;
