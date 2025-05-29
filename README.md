
## Overview
MCP Server that provides tool to determine whether the price of a given crypto asset is in a trending or ranging regime on the 1-hour chart, using both price data and technical analysis (TA) indicators.
## Setup
Run the project using one of these options:
1. Docker:
 `docker compose up --build` 
3. NPM:
    `npm run build`
    `npm run start`

The server is running on port 3100. You can connect to it in your MCP client using the URL: "http://localhost:3100/mcp".
Example configuration for VSC (mcp.json): 
`
    {
	    "servers": {
		    "my-mcp-server-a7160f39": {
			    "url": "http://localhost:3100/mcp"
			}
		}
	}
`

## Environment variables
You need to set the following environment variables in .env file in the root directory:

COINMARKETCAP_API_KEY - Your coinmarketcap.com API key
TAAPI_API_KEY - Your taapi.io API key
ANTHROPIC_API_KEY - Your anthropic API key