export function formatTerminalOutput(text: string): string {
  // Format code blocks with syntax highlighting
  let formattedText = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, language, code) => {
    const lang = language || "text"
    return `<div class="mt-2 mb-2 bg-gray-900 p-2 rounded overflow-x-auto">
                <div class="text-xs text-gray-500 mb-1">${lang}</div>
                <pre class="text-green-400">${escapeHtml(code)}</pre>
              </div>`
  })

  // Format inline code
  formattedText = formattedText.replace(/`([^`]+)`/g, '<code class="bg-gray-900 text-green-400 px-1 rounded">$1</code>')

  // Format bold text
  formattedText = formattedText.replace(/\*\*([^*]+)\*\*/g, '<span class="font-bold">$1</span>')

  // Format italic text
  formattedText = formattedText.replace(/\*([^*]+)\*/g, '<span class="italic">$1</span>')

  // Format links
  formattedText = formattedText.replace(
    /\[([^\]]+)\]$$([^)]+)$$/g,
    '<a href="$2" target="_blank" class="text-blue-400 underline">$1</a>',
  )

  // Format lists
  formattedText = formattedText.replace(/^- (.+)$/gm, "• $1")

  return formattedText
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
