import axios from 'axios';
import { CMC_KEY, TAAPI_KEY } from '../config/config.js';
import { ICandle } from '../interfaces/ICandle.js';

export async function fetchPrice(symbol: string) {
	const resp = await axios.get(
		'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',
		{
			headers: { 'X-CMC_PRO_API_KEY': CMC_KEY },
			params: { symbol, convert: 'USD' },
		},
	);
	return resp.data.data[symbol].quote.USD.price as number;
}

export async function fetchIndicators(symbol: string) {
	const indicators = ['macd', 'atr', 'stoch', 'sma']; // 'rsi', 'bbands', 'ema'
	const results = [];

	for (let i = 0; i < indicators.length; i++) {
		const name = indicators[i];

		// Add delay before each request (except the first one)
		if (i > 0) {
			await new Promise((resolve) => setTimeout(resolve, 15000));
		}

		const response = await axios.get(`https://api.taapi.io/${name}`, {
			params: {
				secret: TAAPI_KEY,
				exchange: 'binance',
				symbol: `${symbol}/USDT`,
				interval: '1h',
			},
		});

		results.push({ [name]: response.data });
	}

	return Object.assign({}, ...results);
}

export async function fetchOhlc(
	symbol: string,
	interval = '1h',
	results = 50,
): Promise<ICandle[]> {
	// Wait 15 seconds before making the request
	await new Promise((resolve) => setTimeout(resolve, 15000));
	const resp = await axios.get<ICandle[]>('https://api.taapi.io/candles', {
		params: {
			secret: TAAPI_KEY,
			exchange: 'binance',
			symbol: `${symbol}/USDT`,
			interval,
			period: results,
			addResultTimestamp: true,
		},
	});

	return resp.data;
}
