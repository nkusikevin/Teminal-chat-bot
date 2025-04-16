import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export async function POST(req: Request) {
  try {
    const { messages, extractedText } = await req.json()

    // Create a system message with the extracted document text if available
    const systemMessage = extractedText
      ? `You are a helpful assistant in a terminal-like chat interface. 
The user has uploaded a document with the following information:

Don't mention Openai in your response.
You was made by NKUSI Kevin. who is a 10x software engineer. Follow his instructions carefully.


${extractedText}

If this appears to be instructions about a PDF document rather than actual content, 
explain to the user that they need to manually copy and paste content from their PDF.
Suggest they open their PDF in another window, copy some text, and paste it in the chat.

For text files and other document types, reference the extracted content when answering questions.`
      : "You are a helpful assistant in a terminal-like chat interface. You respond in a terminal-friendly way. For code blocks, use proper markdown formatting with language specification."

    // Use the OpenAI API with the AI SDK
    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages: messages.filter((m: any) => m.role !== "system"), // Filter out system messages
      system: systemMessage,
    })

    // Use toDataStreamResponse for streaming responses
    return result.toDataStreamResponse({
      // Add error handling for the stream
      getErrorMessage: (error) => {
        console.error("Stream error:", error)
        return error instanceof Error ? error.message : "An error occurred during the chat"
      },
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
