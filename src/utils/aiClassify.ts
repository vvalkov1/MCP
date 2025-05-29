import { generateText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { ANTHROPIC_KEY } from '../config/config.js';

const anthropic = createAnthropic({
	apiKey: ANTHROPIC_KEY,
});

export async function aiClassify(
	symbol: string,
	ohlc: number[][],
	ta: Record<string, object>,
): Promise<string> {
	const prompt =
		`Given the following 1h OHLC data for ${symbol} (each entry is [open, high, low, close]): ${ohlc
			.map((c) => `[${c.join(', ')}]`)
			.join('\n')} And these technical indicators: ${JSON.stringify(
			ta,
		)}, classify whether the market is "trending" or "ranging".  Please answer with JUST the word and a one-sentence rationale.`.trim();

	const { text } = await generateText({
		model: anthropic('claude-3-5-sonnet-20241022'),
		prompt,
	});

	return text.trim();
}
