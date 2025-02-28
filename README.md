# Lunchmoney MCP Server


A Model Context Protocol (MCP) server that lets you interact with your [Lunchmoney](https://lunchmoney.app) transactions and budgets through Claude and other AI assistants.

## Features

This server provides four main tools:

1. **get-recent-transactions**: View your recent transactions from the past N days
2. **search-transactions**: Search transactions by keyword in payee names or notes
3. **get-category-spending**: Analyze spending in specific categories
4. **get-budget-summary**: Get detailed budget information including spending, remaining amounts, and recurring items

## Installation

You can use this server directly in Claude Desktop without installation:

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

Replace `your_token_here` with your Lunchmoney API token, which you can get from your [Lunchmoney developer settings](https://my.lunchmoney.app/developers).

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

## Development

To develop locally:

1. Clone this repository
2. Install dependencies:
```bash
npm install
```

3. Build the TypeScript code:
```bash
npm run build
```

4. Run with your API token:
```bash
LUNCHMONEY_TOKEN=your_token_here node build/index.js
```

5. Test with MCP Inspector:
```bash
LUNCHMONEY_TOKEN=your_token_here npx @modelcontextprotocol/inspector node build/index.js
```

## API Notes

- Budget data must use month boundaries for dates (e.g., 2024-01-01 to 2024-01-31)
- Transactions can use any date range
- All monetary values are returned in their original currency
- Category names are case-insensitive when searching

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
