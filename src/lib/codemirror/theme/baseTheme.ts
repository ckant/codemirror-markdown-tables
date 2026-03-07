import type { ThemeSpec } from "@codemirror/view"

import { tableAutocompleterTheme } from "#codemirror/completion/tableAutocompleterTheme"
import { tableWidgetTheme } from "#codemirror/decoration/tableWidgetTheme"
import { menuTooltipTheme } from "#codemirror/tooltip/menuTooltipTheme"

import { blockingOverlayTheme } from "#components/table/blockingOverlay/blockingOverlayTheme"
import { cellEditorTheme } from "#components/table/cell/cellEditor/cellEditorTheme"
import { cellTheme } from "#components/table/cell/cellTheme"
import { cellViewTheme } from "#components/table/cell/cellView/cellViewTheme"
import { handleTheme } from "#components/table/handle/handleTheme"
import { menuItemIconTheme } from "#components/table/menu/menuItem/menuItemIcon/menuItemIconTheme"
import { menuItemTextTheme } from "#components/table/menu/menuItem/menuItemText/menuItemTextTheme"
import { menuItemTheme } from "#components/table/menu/menuItem/menuItemTheme"
import { menuSeparatorTheme } from "#components/table/menu/menuSeparator/menuSeparatorTheme"
import { menuTheme } from "#components/table/menu/menuTheme"
import { selectAllOverlayTheme } from "#components/table/selectAllOverlay/selectAllOverlayTheme"
import { tableTheme } from "#components/table/tableTheme"

export const baseThemeSpec: ThemeSpec = {
  ...tableAutocompleterTheme,
  ...menuTooltipTheme,
  ...tableWidgetTheme,
  ...tableTheme,
  ...blockingOverlayTheme,
  ...cellTheme,
  ...cellEditorTheme,
  ...cellViewTheme,
  ...handleTheme,
  ...menuTheme,
  ...menuItemTheme,
  ...menuItemIconTheme,
  ...menuItemTextTheme,
  ...menuSeparatorTheme,
  ...selectAllOverlayTheme,
}
