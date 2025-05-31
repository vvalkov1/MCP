
## Overview
MCP Server that provides a tool to determine whether the price of a given crypto asset is in a trending or ranging regime on the 1-hour chart, using both price data and technical analysis (TA) indicators.
## Setup

If you want to use the server inside Cursor or VSC, you can set RUN_HTTP_SERVER to true in the environment variables. Then run the project using one of these options:

1. Docker:
`docker compose up --build` 
2. NPM:
`npm run build`
`npm run start`

The server is running on port 3100. You can connect to it in your MCP client using the URL: "http://localhost:3100/mcp".

Example configuration for VSC (`mcp.json`):

`
{
	"servers": {
		"my-mcp-server-a7160f39": {
			"url": "http://localhost:3100/mcp"
		}
	}
}
`

Otherwise, if you want to use Claude Desktop, you should set RUN_HTTP_SERVER to false.
Run the following command to build the docker image locally:

`docker build -t mcp-hyperion .`

Then you should put this configuration into `claude_desktop_config.json`:

`
	"hyperion": {
		"command": "docker",
		"args": [
			"run",
			"-i",
			"--rm",
			"-p",
			"3100:3100",
			"-e",
			"COINMARKETCAP_API_KEY",
			"-e",
			"TAAPI_API_KEY",
			"-e",
			"ANTHROPIC_API_KEY",
			"-e",
			"RUN_HTTP_SERVER",
			"mcp-hyperion"
		],
		"env": {
			"COINMARKETCAP_API_KEY": "your_api_key",
			"TAAPI_API_KEY": "your_api_key",
			"ANTHROPIC_API_KEY": "your_api_key",
			"RUN_HTTP_SERVER": "false"
		}
	}
`

## Environment variables
You need to set the described environment variables in .env file in the root directory:

`COINMARKETCAP_API_KEY` - Your coinmarketcap.com API key
`TAAPI_API_KEY` - Your taapi.io API key
`ANTHROPIC_API_KEY` - Your anthropic API key
`RUN_HTTP_SERVER` - Use "true" or "false". Whether to start a HTTP server, if "false", the MCP will use the standard input/output (Claude Desktop Support)