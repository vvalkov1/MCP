import dotenv from 'dotenv';
dotenv.config();

export const CMC_KEY = process.env.COINMARKETCAP_API_KEY!;
export const TAAPI_KEY = process.env.TAAPI_API_KEY!;
export const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY!;
