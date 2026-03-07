import { syntaxTree, syntaxTreeAvailable } from "@codemirror/language"
import { type ChangeSpec, EditorState } from "@codemirror/state"

import * as Cursors from "#ext/lezer/common/cursors"
import * as MarkdownNodes from "#ext/lezer/markdown/markdownNodes"
import * as Arrays from "#ext/stdlib/arrays"
import { type Span } from "#ext/stdlib/span"
import * as Spans from "#ext/stdlib/spans"

import * as TableInserter from "#core/tableInserter"
import * as TableParser from "#core/tableParser"

interface TableSpanParseResult {
  readonly complete: boolean
  readonly spans: readonly Span[]
  readonly formatting: readonly ChangeSpec[]
}

export function parseFull(state: EditorState): TableSpanParseResult {
  return parseInternal(state)
}

export function parseIncremental(
  state: EditorState,
  previouslyParsedSpans: Span[],
): TableSpanParseResult {
  return parseInternal(state, previouslyParsedSpans)
}

function parseInternal(
  state: EditorState,
  previouslyParsedSpans: Span[] = [],
): TableSpanParseResult {
  const tables: Span[] = []
  Cursors.forEachDocumentChild(syntaxTree(state), (child) => {
    if (!MarkdownNodes.isTable(child)) return
    tables.push({ from: state.doc.lineAt(child.from).from, to: state.doc.lineAt(child.to).to })
  })

  const spans: Span[] = []
  const formatting: ChangeSpec[] = []

  for (const table of tables) {
    if (Arrays.includesBy(previouslyParsedSpans, table, Spans.equals)) {
      spans.push(table)
      continue
    }

    const changes = format(table, state)
    if (Arrays.isEmpty(changes)) {
      spans.push(table)
    } else {
      formatting.push(...changes)
    }
  }

  return { spans, formatting, complete: syntaxTreeAvailable(state) }
}

function format(table: Span, state: EditorState): ChangeSpec[] {
  return [...formatSpacing(table, state), ...formatContent(table, state)]
}

function formatSpacing(span: Span, { doc, lineBreak }: EditorState): ChangeSpec[] {
  return TableInserter.computeInsertion({ doc, lineBreak, span }).changes
}

function formatContent({ from, to }: Span, { doc }: EditorState): ChangeSpec[] {
  const text = doc.slice(from, to)
  const { text: standardizedText } = TableParser.parse(text)
  return text.eq(standardizedText) ? [] : [{ from, to, insert: standardizedText }]
}
