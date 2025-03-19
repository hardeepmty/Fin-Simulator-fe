import { BASE_URL } from './client';

const GET_STOCK_QUOTE = (symbol) => `${BASE_URL}/api/stocks/quote?symbol=${symbol.toUpperCase()}`;

export { GET_STOCK_QUOTE };
