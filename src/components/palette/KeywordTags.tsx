// src/components/palette/KeywordTags.tsx
interface Props { keywords: string[]; mood: string }

export function KeywordTags({ keywords, mood }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      <span className="bg-indigo-900 text-indigo-300 rounded-full px-3 py-0.5 text-xs font-medium">
        {mood}
      </span>
      {keywords.map(k => (
        <span key={k} className="bg-neutral-800 text-neutral-300 rounded-full px-3 py-0.5 text-xs">
          {k}
        </span>
      ))}
    </div>
  )
}
