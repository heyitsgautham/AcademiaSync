/**
 * Splits a label into lines of at most `maxChars` characters at word boundaries,
 * keeping two lines and shortening the second with "..." when more would follow.
 */
export function wrapLabel(text: string, maxChars = 15): string[] {
  const lines: string[] = []
  let current = ""

  for (const word of text.split(" ")) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length > maxChars && current) {
      lines.push(current)
      current = word
    } else {
      current = candidate
    }
  }
  if (current) lines.push(current)

  const shown = lines.slice(0, 2)
  if (lines.length > 2) shown[1] = shown[1].substring(0, 12) + "..."
  return shown
}

/** The props Recharts passes to a custom axis tick element. */
export interface AxisTickProps {
  x?: number
  y?: number
  payload?: { value: string }
}

interface WrappedAxisTickProps extends AxisTickProps {
  fill: string
  fontFamily?: string
}

/** An X-axis tick that wraps long category names, such as course titles, onto two lines. */
export function WrappedAxisTick({ x, y, payload, fill, fontFamily }: WrappedAxisTickProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      {wrapLabel(payload?.value ?? "").map((line, index) => (
        <text
          key={index}
          x={0}
          y={0}
          dy={index * 14 + 8}
          textAnchor="middle"
          fill={fill}
          fontSize="11"
          style={fontFamily ? { fontFamily } : undefined}
        >
          {line}
        </text>
      ))}
    </g>
  )
}
