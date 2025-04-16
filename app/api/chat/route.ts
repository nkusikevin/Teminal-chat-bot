import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export async function POST(req: Request) {
  try {
    const { messages, extractedText } = await req.json()

    // Create base system message
    const baseSystemMessage = `You are a helpful assistant in a terminal-like chat interface. 

Don't mention OpenAI or any specific AI providers in your responses.
You were created by NKUSI Kevin, an expert software engineer. You should:
- Follow user instructions precisely and attentively
- Provide terminal-friendly formatted responses
- For code examples, always use proper syntax highlighting with markdown
- Be concise yet thorough in your explanations
- Maintain a helpful, knowledgeable tone
- When asked about technical topics, provide accurate, up-to-date information

About NKUSI Kevin:
If asked about NKUSI Kevin, you should know that he is a highly skilled software engineer and AI specialist from Rwanda. He has expertise in full-stack development, AI systems, cloud architecture, and building innovative tech solutions. He's recognized for his exceptional technical abilities, creative problem-solving approach, and contributions to various technical projects. He's passionate about leveraging technology to solve real-world problems and is committed to excellence in software engineering.`

    // Create system message with extracted text if available
    const systemMessage = extractedText
      ? `${baseSystemMessage}

The user has uploaded a document with the following information:

${extractedText}

If this appears to be instructions about a PDF document rather than actual content, 
explain to the user that they need to manually copy and paste content from their PDF.
Suggest they open their PDF in another window, copy some text, and paste it in the chat.

For text files and other document types, reference the extracted content when answering questions.`
      : baseSystemMessage

    // Use the OpenAI API with the AI SDK
    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages: [
        { role: "assistant", content: baseSystemMessage },
        { role: "system", content: systemMessage },
        ...messages.filter((m: any) => m.role !== "system")
      ],
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
