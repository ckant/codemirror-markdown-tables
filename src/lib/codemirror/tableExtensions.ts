import { invertedEffects } from "@codemirror/commands"
import { EditorState, type Extension } from "@codemirror/state"
import { EditorView, showTooltip, ViewPlugin } from "@codemirror/view"

import { tableClipboardInputFilterSpec } from "#codemirror/clipboard/tableClipboardInputFilter"
import type { TableConfig } from "#codemirror/config/tableConfig"
import { tableConfigFacet } from "#codemirror/config/tableConfigFacet"
import { tableEditorAttributesSpec } from "#codemirror/dom/tableEditorAttributes"
import { editorFocusUpdaterSpec } from "#codemirror/focus/editorFocusUpdater"
import { outsideTableFocusEffectSpec } from "#codemirror/focus/outsideTableFocusEffect"
import { tableCursorMovementFilterSpec } from "#codemirror/format/tableCursorMovementFilter"
import { tableDeletionFilterSpec } from "#codemirror/format/tableDeletionFilter"
import { tableFormattingUpdaterSpec } from "#codemirror/format/tableFormattingUpdater"
import { tableLineBreakCorrectionFilterSpec } from "#codemirror/format/tableLineBreakCorrectionFilter"
import { tableSelectionFilterSpec } from "#codemirror/format/tableSelectionFilter"
import { tablesStateField } from "#codemirror/state/tablesStateField"
import { viewStateField } from "#codemirror/state/viewStateField"
import { baseThemeSpec } from "#codemirror/theme/baseTheme"
import { menuTooltip as menuTooltipSpec } from "#codemirror/tooltip/menuTooltip"
import { tableEffectAnnotationExtenderSpec } from "#codemirror/transaction/tableEffectAnnotationExtender"
import { tableInvertedEffectsSpec } from "#codemirror/transaction/tableInvertedEffects"
import { ViewStateFieldPlugin } from "#codemirror/view/viewStateFieldPlugin"

export function of(config: TableConfig): Extension {
  return [
    tableConfigFacet.of(config),
    tablesStateField,
    viewStateField,
    ViewPlugin.define((view) => ViewStateFieldPlugin.of(view)),
    EditorView.editorAttributes.compute(
      [tableConfigFacet, EditorView.darkTheme],
      tableEditorAttributesSpec,
    ),
    EditorView.baseTheme(baseThemeSpec),
    // Wrap theme(s) with `:where()` to set CSS specificity to 0 and make it easy to override
    EditorView.theme(
      "light" in config.theme
        ? {
            ':where(:root:has(&[data-tbl-theme-mode="light"]))': config.theme.light.props,
            ':where(:root:has(&[data-tbl-theme-mode="dark"]))': config.theme.dark.props,
          }
        : { ":where(:root:has(&))": config.theme.props },
    ),
    // Wrap style with `:where()` to set CSS specificity to 0 and make it easy to override
    EditorView.theme({ ":where(:root:has(&))": config.style.props }),
    invertedEffects.of(tableInvertedEffectsSpec),
    showTooltip.of(menuTooltipSpec),
    EditorState.transactionExtender.of(tableEffectAnnotationExtenderSpec),
    EditorState.transactionFilter.of(tableLineBreakCorrectionFilterSpec),
    EditorState.transactionFilter.of(tableDeletionFilterSpec),
    EditorState.transactionFilter.of(tableCursorMovementFilterSpec),
    EditorState.transactionFilter.of(tableSelectionFilterSpec),
    EditorView.updateListener.of(tableFormattingUpdaterSpec),
    EditorView.updateListener.of(editorFocusUpdaterSpec),
    EditorView.clipboardInputFilter.of(tableClipboardInputFilterSpec),
    EditorView.focusChangeEffect.of(outsideTableFocusEffectSpec),
  ]
}
