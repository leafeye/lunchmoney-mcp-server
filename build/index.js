import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fetch from "node-fetch";
const API_BASE = "https://dev.lunchmoney.app/v1";
////////////////////////////////////////////////////////////////
class LunchmoneyServer {
    constructor(token) {
        this.token = token;
        this.server = new McpServer({
            name: "lunchmoney",
            version: "1.0.0",
        });
        // Register tools
        this.registerTools();
    }
    registerTools() {
        this.server.tool("get-budget-summary", "Get budget summary for a specific time period", {
            start_date: z.string().describe("Start date (YYYY-MM-DD, should be start of month)"),
            end_date: z.string().describe("End date (YYYY-MM-DD, should be end of month)"),
        }, async ({ start_date, end_date }) => {
            try {
                const budgets = await this.fetchBudgets(start_date, end_date);
                if (!budgets.length) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: "No budget data found for the specified period.",
                            },
                        ],
                    };
                }
                return {
                    content: [
                        {
                            type: "text",
                            text: this.formatBudgetSummary(budgets),
                        },
                    ],
                };
            }
            catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error fetching budget data: ${error}`,
                        },
                    ],
                };
            }
        });
        this.server.tool("get-recent-transactions", "Get recent transactions", {
            days: z.number().default(30).describe("Number of days to look back"),
            limit: z.number().default(10).describe("Maximum number of transactions to return"),
        }, async ({ days, limit }) => {
            const endDate = new Date().toISOString().split('T')[0];
            const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0];
            const transactions = await this.fetchTransactions({
                start_date: startDate,
                end_date: endDate,
                limit,
            });
            return {
                content: [
                    {
                        type: "text",
                        text: this.formatTransactions(transactions),
                    },
                ],
            };
        });
        this.server.tool("search-transactions", "Search transactions by keyword", {
            keyword: z.string().describe("Search term to look for"),
            days: z.number().default(90).describe("Number of days to look back"),
            limit: z.number().default(10).describe("Maximum number of transactions to return"),
        }, async ({ keyword, days, limit }) => {
            const endDate = new Date().toISOString().split('T')[0];
            const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0];
            const transactions = await this.fetchTransactions({
                start_date: startDate,
                end_date: endDate,
                limit: 1000,
            });
            const matchingTransactions = transactions.filter((tx) => tx.payee.toLowerCase().includes(keyword.toLowerCase()) ||
                (tx.notes && tx.notes.toLowerCase().includes(keyword.toLowerCase())));
            return {
                content: [
                    {
                        type: "text",
                        text: this.formatTransactions(matchingTransactions.slice(0, limit)),
                    },
                ],
            };
        });
        this.server.tool("get-category-spending", "Get spending in a category", {
            category: z.string().describe("Category name"),
            days: z.number().default(30).describe("Number of days to look back"),
        }, async ({ category, days }) => {
            const endDate = new Date().toISOString().split('T')[0];
            const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0];
            const transactions = await this.fetchTransactions({
                start_date: startDate,
                end_date: endDate,
                limit: 1000,
            });
            const matchingTransactions = transactions.filter((tx) => tx.category_name.toLowerCase() === category.toLowerCase());
            const totals = matchingTransactions.reduce((acc, tx) => {
                const currency = tx.currency.toUpperCase();
                acc[currency] = (acc[currency] || 0) + Number(tx.amount);
                return acc;
            }, {});
            let summary = `Spending in '${category}' over the past ${days} days:\n\n`;
            Object.entries(totals).forEach(([currency, total]) => {
                summary += `${currency}: ${total.toFixed(2)}\n`;
            });
            if (matchingTransactions.length > 0) {
                summary += "\nRecent transactions in this category:\n";
                summary += this.formatTransactions(matchingTransactions.slice(0, 5));
            }
            return {
                content: [
                    {
                        type: "text",
                        text: summary,
                    },
                ],
            };
        });
    }
    async fetchBudgets(start_date, end_date) {
        const response = await fetch(`${API_BASE}/budgets?start_date=${start_date}&end_date=${end_date}`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: "application/json",
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }
    formatBudgetSummary(budgets) {
        let summary = [];
        for (const budget of budgets) {
            const categoryHeader = `Category: ${budget.category_name}${budget.category_group_name ? ` (${budget.category_group_name})` : ''}`;
            let budgetInfo = [categoryHeader];
            // Add monthly data
            Object.entries(budget.data).forEach(([date, data]) => {
                const monthData = [
                    `\nMonth: ${date}`,
                    `Transactions: ${data.num_transactions || 0}`,
                    `Spending: ${data.spending_to_base?.toFixed(2) || '0.00'} ${data.budget_currency?.toUpperCase() || 'USD'}`,
                ];
                if (data.budget_amount) {
                    monthData.push(`Budget: ${data.budget_amount.toFixed(2)} ${data.budget_currency?.toUpperCase() || 'USD'}`);
                    const remainingBudget = (data.budget_amount - (data.spending_to_base || 0)).toFixed(2);
                    monthData.push(`Remaining: ${remainingBudget} ${data.budget_currency?.toUpperCase() || 'USD'}`);
                }
                budgetInfo.push(monthData.join('\n'));
            });
            // Add recurring items if any
            if (budget.recurring && budget.recurring.list && budget.recurring.list.length > 0) {
                budgetInfo.push('\nRecurring Items:');
                budget.recurring.list.forEach(item => {
                    budgetInfo.push(`- ${item.payee}: ${item.amount} ${item.currency.toUpperCase()}`);
                });
            }
            summary.push(budgetInfo.join('\n'));
        }
        return summary.join('\n\n---\n\n');
    }
    async fetchTransactions(params) {
        const queryParams = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
            queryParams.append(key, value.toString());
        }
        const response = await fetch(`${API_BASE}/transactions?${queryParams}`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: "application/json",
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.transactions || [];
    }
    formatTransactions(transactions) {
        return transactions
            .map(tx => {
            let summary = [
                `Date: ${tx.date}`,
                `Amount: ${tx.amount} ${tx.currency.toUpperCase()}`,
                `Payee: ${tx.payee}`,
                `Category: ${tx.category_name} (${tx.category_group_name})`,
                `Account: ${tx.account_display_name || "N/A"}`,
                `Status: ${tx.status}`,
            ];
            if (tx.tags && tx.tags.length > 0) {
                summary.push(`Tags: ${tx.tags.map((t) => t.name).join(", ")}`);
            }
            if (tx.notes) {
                summary.push(`Notes: ${tx.notes}`);
            }
            return summary.join("\n");
        })
            .join("\n\n---\n\n");
    }
    async start() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
    }
}
// Check if LUNCHMONEY_TOKEN environment variable is set
const token = process.env.LUNCHMONEY_TOKEN;
if (!token) {
    console.error("Error: LUNCHMONEY_TOKEN environment variable is required");
    process.exit(1);
}
const server = new LunchmoneyServer(token);
server.start().catch(error => {
    console.error("Fatal error:", error);
    process.exit(1);
});
