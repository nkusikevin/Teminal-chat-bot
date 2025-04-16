import { forwardRef, type ForwardedRef } from "react"
import type { Message } from "ai"
import { Loader } from "lucide-react"
import { formatTerminalOutput } from "@/lib/terminal-formatter"

interface TerminalProps {
  messages: Message[]
  isLoading: boolean
}

export const Terminal = forwardRef(function Terminal(
  { messages, isLoading }: TerminalProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      className="flex-1 overflow-y-auto bg-black text-green-500 font-mono p-2 rounded border border-green-700"
    >
      {messages.length === 0 && (
        <div className="text-green-700 italic">Welcome to Terminal Chat. Type a message to begin...</div>
      )}

      {messages.map((message) => (
        <div key={message.id} className="mb-4">
          {message.role === "user" && (
            <div className="flex">
              <span className="text-yellow-500 mr-2">user@terminal:~$</span>
              <span>{message.content}</span>
            </div>
          )}

          {message.role === "assistant" && (
            <div className="flex flex-col">
              <div className="flex">
                <span className="text-blue-500 mr-2">ai@terminal:~$</span>
                <div
                  className="whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: formatTerminalOutput(message.content) }}
                />
              </div>
            </div>
          )}

          {message.role === "system" && (
            <div className="flex">
              <span className="text-red-500 mr-2">system@terminal:~$</span>
              <span>{message.content}</span>
            </div>
          )}
        </div>
      ))}

      {isLoading && (
        <div className="flex items-center">
          <span className="text-blue-500 mr-2">ai@terminal:~$</span>
          <Loader className="h-4 w-4 animate-spin text-green-500" />
        </div>
      )}
    </div>
  )
})
