const MCP_ENDPOINT = "https://mcp.kapruka.com/mcp";

interface McpResponse {
  jsonrpc: string;
  id: number;
  result?: unknown;
  error?: { code: number; message: string };
}

interface ToolCallContent {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}

async function parseMcpResponse(res: Response): Promise<unknown> {
  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  if (contentType.includes("text/event-stream")) {
    for (const line of text.split("\n")) {
      if (line.startsWith("data: ")) {
        try {
          const data = JSON.parse(line.slice(6)) as McpResponse;
          if (data.result !== undefined) return data.result;
          if (data.error) throw new Error(`MCP: ${data.error.message}`);
        } catch (e) {
          if (e instanceof Error && e.message.startsWith("MCP:")) throw e;
        }
      }
    }
    return null;
  }

  const data = JSON.parse(text) as McpResponse;
  if (data.result !== undefined) return data.result;
  if (data.error) throw new Error(`MCP: ${data.error.message}`);
  return null;
}

export class KaprukaMcpClient {
  private sessionId: string | null = null;
  private initialized = false;

  async initialize(): Promise<void> {
    const res = await fetch(MCP_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "kavi-agent", version: "1.0.0" },
        },
      }),
    });

    this.sessionId = res.headers.get("Mcp-Session-Id");
    await parseMcpResponse(res);
    this.initialized = true;
  }

  async callTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    if (!this.initialized) await this.initialize();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    };
    if (this.sessionId) headers["Mcp-Session-Id"] = this.sessionId;

    const res = await fetch(MCP_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/call",
        params: { name: toolName, arguments: args },
      }),
    });

    const rawResult = await parseMcpResponse(res);
    const toolResult = rawResult as ToolCallContent;

    if (toolResult?.isError) {
      const errorText = toolResult.content?.[0]?.text || "Tool error";
      throw new Error(errorText);
    }

    const textContent = toolResult?.content?.[0]?.text || "";

    try {
      return JSON.parse(textContent);
    } catch {
      return textContent;
    }
  }
}
