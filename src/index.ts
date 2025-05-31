import express from 'express';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';

import { fetchPrice, fetchIndicators, fetchOhlc } from './services/data.js';
import { aiClassify } from './utils/aiClassify.js';
import { ICandle } from './interfaces/ICandle.js';
import { RUN_HTTP_SERVER } from './config/config.js';

async function main() {
	const mcp = new McpServer({
		name: 'Hyperion MCP',
		version: '0.1.0',
	});

	mcp.tool(
		'checkMarketRegime',
		'Determines whether the price of a crypto asset is trending or ranging on the hourly chart using both price data and technical analysis (TA) indicators',
		{
			symbol: z.string(),
		},
		async ({ symbol }) => {
			try {
				const price = await fetchPrice(symbol);
				const ta = await fetchIndicators(symbol);

				const candles = await fetchOhlc(symbol, '1h', 50);

				const ohlc: number[][] = candles.map((c: ICandle) => [
					c.open,
					c.high,
					c.low,
					c.close,
				]);
				const regime = await aiClassify(symbol, ohlc, ta);
				return {
					content: [
						{
							type: 'text',
							text: `{"symbol":"${symbol}","price":${price},"regime":"${regime}"}`,
						},
					],
				};
			} catch (error) {
				console.error('Error in check tool:', error);
				const errorMessage =
					error instanceof Error ? error.message : String(error);
				return {
					content: [
						{
							type: 'text',
							text: `{"error":"Failed to analyze ${symbol}: ${errorMessage}"}`,
						},
					],
				};
			}
		},
	);

	if (RUN_HTTP_SERVER) {
		// Run HTTP MCP Server
		const app = express();
		app.use(express.json());

		const sessions: Record<string, StreamableHTTPServerTransport> = {};

		app.post('/mcp', (req, res) => {
			(async () => {
				const sid = req.headers['mcp-session-id'] as string | undefined;
				let transport: StreamableHTTPServerTransport;

				if (sid && sessions[sid]) {
					transport = sessions[sid];
				} else if (!sid && isInitializeRequest(req.body)) {
					transport = new StreamableHTTPServerTransport({
						sessionIdGenerator: () => randomUUID(),
						onsessioninitialized: (newSid) => {
							sessions[newSid] = transport;
						},
					});
					transport.onclose = () => {
						if (transport.sessionId) delete sessions[transport.sessionId];
					};
					await mcp.connect(transport);
				} else {
					return res.status(400).json({
						jsonrpc: '2.0',
						error: { code: -32000, message: 'Bad Request: invalid session' },
						id: null,
					});
				}

				await transport.handleRequest(req, res, req.body);
			})().catch((err) => {
				console.error('Error handling MCP request:', err);
				if (!res.headersSent) {
					res.status(500).json({
						jsonrpc: '2.0',
						error: { code: -32603, message: 'Internal error' },
						id: null,
					});
				}
			});
		});

		const sseHandler = async (
			req: express.Request,
			res: express.Response,
		): Promise<void> => {
			const sid = req.headers['mcp-session-id'] as string | undefined;
			if (!sid || !sessions[sid]) {
				res.status(400).send('Invalid session ID');
				return;
			}
			await sessions[sid].handleRequest(req, res);
		};
		app.get('/mcp', sseHandler);
		app.delete('/mcp', sseHandler);

		app.listen(3100, () => {
			console.log(
				'MCP Streamable HTTP server listening on http://localhost:3100',
			);
		});
	} else {
		// Run stdio MCP Server
		const transport = new StdioServerTransport();
		await mcp.connect(transport);
		console.error('Hyperion MCP Server running on stdio');
	}
}

main().catch((error) => {
	console.error('Fatal error in main():', error);
	process.exit(1);
});