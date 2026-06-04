import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { KaprukaMcpClient } from "@/lib/kapruka";
import { KAPRUKA_TOOLS } from "@/lib/tools";
import { getSystemPrompt } from "@/lib/system-prompt";
import type { StreamEvent } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 120;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: StreamEvent) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
        );
      };

      const mcpClient = new KaprukaMcpClient();

      try {
        // Deep copy messages and convert to Anthropic format
        const apiMessages: Anthropic.Messages.MessageParam[] = messages.map(
          (m: { role: string; content: string }) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })
        );

        let iterations = 0;
        const MAX_ITERATIONS = 8;

        while (iterations < MAX_ITERATIONS) {
          iterations++;

          const response = await anthropic.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 4096,
            system: getSystemPrompt(),
            tools: KAPRUKA_TOOLS,
            messages: apiMessages,
          });

          // Collect text from this response
          let textContent = "";
          for (const block of response.content) {
            if (block.type === "text") {
              textContent += block.text;
            }
          }

          if (textContent) {
            send({ type: "text", content: textContent });
          }

          if (response.stop_reason === "end_turn") {
            break;
          }

          if (response.stop_reason === "tool_use") {
            const toolUseBlocks = response.content.filter(
              (b): b is Anthropic.Messages.ToolUseBlock => b.type === "tool_use"
            );

            const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];

            for (const toolUse of toolUseBlocks) {
              send({
                type: "tool_call",
                toolName: toolUse.name,
                toolUseId: toolUse.id,
              });

              let result: unknown;
              let resultStr: string;

              try {
                result = await mcpClient.callTool(
                  toolUse.name,
                  toolUse.input as Record<string, unknown>
                );
                resultStr = typeof result === "string" ? result : JSON.stringify(result);
              } catch (err) {
                result = { error: String(err) };
                resultStr = String(err);
              }

              send({
                type: "tool_result",
                toolName: toolUse.name,
                toolUseId: toolUse.id,
                result,
              });

              toolResults.push({
                type: "tool_result",
                tool_use_id: toolUse.id,
                content: resultStr,
              });
            }

            // Add assistant turn and tool results to message history
            apiMessages.push({ role: "assistant", content: response.content });
            apiMessages.push({ role: "user", content: toolResults });
          } else {
            // Unexpected stop reason
            break;
          }
        }

        send({ type: "done" });
      } catch (err) {
        send({ type: "error", message: String(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
