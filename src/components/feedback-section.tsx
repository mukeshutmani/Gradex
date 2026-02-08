"use client"

interface FeedbackSectionProps {
  feedback: string
  size?: "sm" | "md"
}

function parseFeedbackSection(section: string) {
  const bracketMatch = section.match(/^\[(.+?)\]\s*(.*?)\n(.+)$/s)
  if (bracketMatch) {
    return { title: bracketMatch[1], score: bracketMatch[2].trim(), content: bracketMatch[3].trim() }
  }
  return { title: "", score: "", content: section }
}

function getSectionStyle(title: string, content: string) {
  const t = title.toLowerCase()
  if (t.includes("duplicate")) return "bg-red-50 border-red-300 text-red-800"
  if (t.includes("strength")) return "bg-green-50 border-green-200 text-green-800"
  if (t.includes("improvement")) return "bg-orange-50 border-orange-200 text-orange-800"
  if (t.includes("marks breakdown")) return "bg-gray-50 border-gray-200 text-gray-700"
  if (t) return "bg-violet-50 border-violet-200 text-violet-800"
  // Legacy emoji fallback
  if (content.startsWith("🚨")) return "bg-red-50 border-red-300 text-red-800"
  if (content.startsWith("✅")) return "bg-green-50 border-green-200 text-green-800"
  if (content.startsWith("⚠️")) return "bg-orange-50 border-orange-200 text-orange-800"
  return "bg-gray-50 border-gray-200 text-gray-700"
}

function getScoreBadgeColor(score: string) {
  const s = score.toLowerCase()
  if (s === "good" || s === "human") return "bg-green-100 text-green-700"
  if (s === "average" || s === "mixed") return "bg-yellow-100 text-yellow-700"
  if (s === "poor" || s === "likely ai") return "bg-red-100 text-red-700"
  return "bg-violet-100 text-violet-700"
}

function renderMarksBreakdown(content: string) {
  const items = content.split("|").map(s => s.trim()).filter(Boolean)
  return (
    <div className="mt-2 space-y-1.5">
      {items.map((item, i) => {
        const match = item.match(/^(.+?:\s*\d+\/\d+)\s*[-–]\s*(.+)$/)
        return (
          <div key={i} className="flex items-start gap-2">
            <span className="font-medium text-gray-700 whitespace-nowrap">{match ? match[1] : item.split("-")[0]?.trim()}</span>
            {match && <span className="text-gray-500">—</span>}
            {match && <span className="opacity-80">{match[2]}</span>}
          </div>
        )
      })}
    </div>
  )
}

export function FeedbackSections({ feedback, size = "md" }: FeedbackSectionProps) {
  const sections = feedback.split("\n\n").filter(Boolean)
  const padding = size === "sm" ? "p-2.5" : "p-3"
  const textSize = size === "sm" ? "text-xs" : "text-sm"

  return (
    <div className="space-y-2">
      {sections.map((section, i) => {
        const parsed = parseFeedbackSection(section)
        return (
          <div
            key={i}
            className={`${padding} rounded-lg ${textSize} leading-relaxed border ${getSectionStyle(parsed.title, parsed.content)}`}
          >
            {parsed.title ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{parsed.title}</span>
                  {parsed.score && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getScoreBadgeColor(parsed.score)}`}>
                      {parsed.score}
                    </span>
                  )}
                </div>
                {parsed.title.toLowerCase().includes("marks breakdown")
                  ? renderMarksBreakdown(parsed.content)
                  : <p className="opacity-90 mt-1">{parsed.content}</p>
                }
              </>
            ) : (
              <p>{parsed.content}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
