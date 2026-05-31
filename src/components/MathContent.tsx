'use client'
import { InlineMath, BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'

type Segment =
  | { type: 'text'; content: string }
  | { type: 'inline'; content: string }
  | { type: 'block'; content: string }

function parse(text: string): Segment[] {
  const segments: Segment[] = []
  // Match $$...$$ (block) or $...$ (inline); block must come first
  const re = /\$\$([\s\S]*?)\$\$|\$((?:[^$\\]|\\.)*?)\$/g
  let last = 0
  let m: RegExpExecArray | null

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      segments.push({ type: 'text', content: text.slice(last, m.index) })
    }
    if (m[0].startsWith('$$')) {
      segments.push({ type: 'block', content: m[1] })
    } else {
      segments.push({ type: 'inline', content: m[2] })
    }
    last = m.index + m[0].length
  }

  if (last < text.length) {
    segments.push({ type: 'text', content: text.slice(last) })
  }

  return segments
}

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />')
}

interface Props {
  content: string
  block?: boolean
}

export function MathContent({ content, block = false }: Props) {
  const Tag = block ? 'div' : 'span'

  // Split on block math first, then process each piece
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []

  let i = 0
  for (const line of lines) {
    const segs = parse(line)
    const lineNodes = segs.map((seg, j) => {
      if (seg.type === 'block') {
        return <BlockMath key={`${i}-${j}`} math={seg.content} />
      }
      if (seg.type === 'inline') {
        return <InlineMath key={`${i}-${j}`} math={seg.content} />
      }
      // Plain text – render simple markdown (bold, etc.)
      return (
        <span
          key={`${i}-${j}`}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(seg.content) }}
        />
      )
    })
    elements.push(...lineNodes)
    if (i < lines.length - 1) elements.push(<br key={`br-${i}`} />)
    i++
  }

  return <Tag className="prose-content">{elements}</Tag>
}
