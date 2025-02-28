# Lunchmoney MCP Server

A Model Context Protocol (MCP) server that lets you interact with your [Lunchmoney](https://lunchmoney.app) transactions and budgets through Claude and other AI assistants.

## What is this?

This tool allows you to connect your Lunchmoney financial data to Claude AI, so you can ask questions about your spending, analyze your budget, and get insights about your finances through a natural conversation.

## Features

This server provides four main tools:

1. **get-recent-transactions**: View your recent transactions from the past N days
2. **search-transactions**: Search transactions by keyword in payee names or notes
3. **get-category-spending**: Analyze spending in specific categories
4. **get-budget-summary**: Get detailed budget information including spending, remaining amounts, and recurring items

## Privacy and Data Handling

**Important:** MCP provides a structured way for Claude to interact with your Lunchmoney data while maintaining privacy boundaries. Here's what you should know:

- Claude (the host) creates a client that connects to your local MCP server
- Your Lunchmoney API token stays on your local machine
- The MCP server runs locally and fetches data from Lunchmoney's API
- You will be asked to approve each request to access your Lunchmoney data
- When you ask a question about your finances, Claude requests specific information from the MCP server
- The MCP server processes your request locally and returns only the relevant results
- Claude never has direct access to your full financial data or API token
- Only the specific information requested (like transaction summaries or budget status) is shared with Claude
- Anthropic's data retention policies apply to these summary results that are part of your conversation
- Each server connection is isolated, maintaining clear security boundaries

You can find more about MCP in the documentaion: https://modelcontextprotocol.io/introduction

## Installation 

Also look at the offical Claude documentation: https://modelcontextprotocol.io/quickstart/user

### Using npx

Node.js is a software platform that lets you run JavaScript code on your computer (outside of a web browser).

To install Node.js:
- **Windows/Mac**: Download and run the installer from the [official Node.js website](https://nodejs.org/)
- **Mac with Homebrew**: Run `brew install node` in Terminal
- **Linux**: Use your package manager (e.g., `sudo apt install nodejs` for Ubuntu)

Once Node.js is installed on your computer, you can run the server directly without downloading anything:

1. Get your Lunchmoney API token from your [Lunchmoney developer settings](https://my.lunchmoney.app/developers)
2. Open Claude Desktop
3. Go to Settings → Developer -> `Edit Config`
4. Add the following configuration:

```json
{
  "mcpServers": {
    "lunchmoney": {
      "command": "npx",
      "args": ["-y", "lunchmoney-mcp-server"],
      "env": {
        "LUNCHMONEY_TOKEN": "your_token_here"
      }
    }
  }
}
```

Replace `your_token_here` with your actual Lunchmoney API token.

**Important Note:** After changing the configuration, you may need to restart Claude Desktop for the changes to take effect.


## Example Usage

Once configured in Claude Desktop, you can ask questions like:

### Transactions
- "Show me my recent transactions from the past week"
- "Search for all transactions at Amazon"
- "How much did I spend on restaurants last month?"
- "Find transactions tagged as business expenses"

### Budgets
- "Show me my budget summary for this month"
- "What's my budget status from January to March 2024?"
- "How much of my food budget is remaining?"
- "Show me categories where I'm over budget"

## What is MCP?

The [Model Context Protocol (MCP)](https://modelcontextprotocol.io) is an open protocol that standardizes how applications provide context to Large Language Models (LLMs). Think of MCP like a USB-C port for AI applications - it provides a standardized way to connect AI models to different data sources and tools.

Some key benefits of MCP:
- Standardized way to expose data and functionality to LLMs
- Human-in-the-loop security (all actions require user approval)
- Growing ecosystem of pre-built integrations
- Works with multiple AI models and applications

## Troubleshooting

**Claude says it can't connect to my MCP server:**
- Make sure the configuration in Claude's Developer settings is correct
- Try restarting Claude Desktop after changing the configuration
- Check that your Lunchmoney API token is valid

**Claude doesn't recognize Lunchmoney commands:**
- Start a new conversation in Claude
- Try explicitly mentioning Lunchmoney in your query (e.g., "Show me my recent Lunchmoney transactions")

## API Notes

- Budget data must use month boundaries for dates (e.g., 2024-01-01 to 2024-01-31)
- Transactions can use any date range
- All monetary values are returned in their original currency

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
