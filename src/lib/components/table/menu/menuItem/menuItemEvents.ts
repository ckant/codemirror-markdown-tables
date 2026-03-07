import type { TableState } from "#componentModels/table/tableState.svelte"

import type { Alignment } from "#core/models/alignment"

type Command =
  | { action: "add"; direction: "before" | "after" }
  | { action: "align"; alignment: Alignment }
  | { action: "clear" }
  | { action: "duplicate" }
  | { action: "move"; direction: "backward" | "forward" }
  | { action: "remove" }
  | { action: "sort"; direction: "ascending" | "descending" }

export function onclick(command: Command, tableState: TableState): void {
  switch (command.action) {
    case "add": {
      return tableState.menu!.clickAdd(command.direction)
    }
    case "align": {
      return tableState.menu!.clickAlign(command.alignment)
    }
    case "clear": {
      return tableState.menu!.clickClear()
    }
    case "duplicate": {
      return tableState.menu!.clickDuplicate()
    }
    case "move": {
      return tableState.menu!.clickMove(command.direction)
    }
    case "remove": {
      return tableState.menu!.clickRemove()
    }
    case "sort": {
      return tableState.menu!.clickSort(command.direction)
    }
  }
}
