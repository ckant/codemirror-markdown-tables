<script lang="ts">
  import { autocompletion } from "@codemirror/autocomplete"
  import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands"
  import { markdown } from "@codemirror/lang-markdown"
  import {
    defaultHighlightStyle,
    HighlightStyle,
    indentOnInput,
    syntaxHighlighting,
  } from "@codemirror/language"
  import { languages } from "@codemirror/language-data"
  import { search, searchKeymap } from "@codemirror/search"
  import { EditorState, type EditorStateConfig } from "@codemirror/state"
  import { oneDark } from "@codemirror/theme-one-dark"
  import {
    drawSelection,
    EditorView,
    highlightSpecialChars,
    keymap,
    rectangularSelection,
  } from "@codemirror/view"
  import { classHighlighter, styleTags, tags } from "@lezer/highlight"
  import {
    Autolink,
    Emoji,
    Strikethrough,
    Subscript,
    Superscript,
    Table,
    TaskList,
  } from "@lezer/markdown"
  import { watch } from "runed"
  import { onMount } from "svelte"

  import * as QueryParameters from "#ext/dom/queryParameters"
  import { def } from "#ext/stdlib/existence"
  import { trimIndent } from "#ext/stdlib/templateStrings"

  import { TableTheme } from "#codemirror/config/tableTheme"

  import {
    insertEmptyMarkdownTable,
    markdownTableAutocompleter,
    markdownTables,
    TableStyle,
  } from "."

  const text = trimIndent`
    | Last Name  | First Name | Age | Profession     | Actor         |
    | ---------- | ---------- | --: | -------------- | ------------- |
    | Brannigan  | Zapp       | 28  | General        | Billy West    |
    | Conrad     | Hermes     | 41  | Bureaucrat     | Phil LaMarr   |
    | Farnsworth | Hubert     | 159 | Scientist      | Billy West    |
    | Fry        | Philip     | 25  | Delivery Boy   | Billy West    |
    | Leela      | Turanga    | 25  | Captain        | Katey Sagal   |
    | Rodríguez  | Bender     | 4   | Delivery Robot | John DiMaggio |
    | Wong       | Amy        | 21  | Intern         | Lauren Tom    |
    | Zoidberg   | John       | 87  | Doctor         | Billy West    |
  `

  const themeBackgrounds = {
    light: "#ffffff",
    dark: "#1d2024",
    githubLight: "#ffffff",
    githubDark: "#0d1117",
    githubSoftDark: "#212830",
    oneDark: "#282c34",
  } as const

  const themeNames = [
    "light",
    "dark",
    "githubLight",
    "githubDark",
    "githubSoftDark",
    "oneDark",
  ] as const

  const defaultThemeName =
    QueryParameters.getValueOrNil("theme", themeNames) ??
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
  let themeName = $state(defaultThemeName)
  const mode: "light" | "dark" = $derived(
    themeName.toLowerCase().endsWith("light") ? "light" : "dark",
  )
  const background = $derived(themeBackgrounds[themeName])

  const defaultSelectionType =
    QueryParameters.getValueOrNil("selectionType", ["codemirror", "native"]) ?? "codemirror"
  let selectionType = $state(defaultSelectionType)

  const defaultLineWrapping =
    QueryParameters.getValueOrNil("lineWrapping", ["wrap", "nowrap"]) ?? "wrap"
  let lineWrapping = $state(defaultLineWrapping)

  const defaultHandlePosition =
    QueryParameters.getValueOrNil("handlePosition", ["outside", "inside"]) ?? "outside"
  let handlePosition = $state(defaultHandlePosition)

  const defaultFontName =
    QueryParameters.getValueOrNil("font", ["system-ui", "monospace"]) ?? "system-ui"
  let fontName = $state(defaultFontName)

  const showSidebar = QueryParameters.getBoolOrNil("sidebar") ?? true

  let element: HTMLElement

  const githubFlavoredMarkdown = markdown({
    codeLanguages: languages,
    extensions: [
      Table,
      TaskList,
      Strikethrough,
      Autolink,
      Subscript,
      Superscript,
      Emoji,
      {
        props: [styleTags({ "InlineCode/...": tags.monospace })],
      },
    ],
    addKeymap: false,
  })

  let view: EditorView

  onMount(() => {
    view = new EditorView({
      state: createState({ doc: text, selection: { anchor: 0 } }),
      parent: element,
    })
    view.focus()
  })

  watch(
    [
      () => themeName,
      () => selectionType,
      () => lineWrapping,
      () => handlePosition,
      () => fontName,
    ],
    () => {
      const { doc, selection } = view.state
      view.destroy()
      view = new EditorView({
        state: createState({ doc, selection }),
        parent: element,
      })
    },
    { lazy: true },
  )

  /**
   * (Hack) Clear global styles mounted to document and window by style-mod.
   *s
   * Prevents leaking styles every time a new editor is configured.
   * {@link https://github.com/marijnh/style-mod/blob/master/src/style-mod.js}
   */
  function clearEditorStyles(): void {
    const [styleModuleSet] = Object.getOwnPropertySymbols(document)
    if (def(styleModuleSet))
      delete (document as unknown as { [styleModuleSet]: unknown })[styleModuleSet]
    const styleModuleCount = Symbol.for("\u037c")
    delete (window as unknown as { [styleModuleCount]: unknown })[styleModuleCount]

    const styles = document.getElementsByTagName("style")
    if (styles.length >= 2) {
      for (let i = styles.length - 2; i >= 0; i--) {
        styles[i].remove()
      }
    }
  }

  function createState({
    doc,
    selection,
  }: {
    doc: EditorStateConfig["doc"]
    selection: EditorStateConfig["selection"]
  }): EditorState {
    clearEditorStyles()

    return EditorState.create({
      doc,
      selection,
      extensions: [
        search(),
        history(),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...searchKeymap,
          indentWithTab,
          { key: "Alt-Mod-t", run: insertEmptyMarkdownTable({ size: { rows: 3, cols: 3 } }) },
        ]),
        selectionType === "codemirror"
          ? [EditorState.allowMultipleSelections.of(true), rectangularSelection(), drawSelection()]
          : [],
        highlightSpecialChars(),
        indentOnInput(),
        EditorState.tabSize.of(4),
        EditorView.lineWrapping,
        autocompletion(),
        githubFlavoredMarkdown,
        githubFlavoredMarkdown.language.data.of({
          autocomplete: markdownTableAutocompleter({
            options: [
              { rows: 2, cols: 2 },
              { rows: 3, cols: 3 },
              { rows: 4, cols: 4 },
              { rows: 5, cols: 5 },
            ],
          }),
        }),
        markdownTables({
          theme: TableTheme[themeName],
          style: TableStyle.default.with({
            "--tbl-style-font-family": fontName,
            "--tbl-style-menu-font-family": fontName,
          }),
          selectionType,
          handlePosition,
          lineWrapping,
          markdownConfig: { extensions: [Strikethrough, Autolink, Subscript, Superscript, Emoji] },
          extensions: [highlightSpecialChars(), keymap.of(defaultKeymap)],
          globalKeyBindings: [...historyKeymap, ...searchKeymap],
        }),
        themeName === "oneDark" ? [oneDark] : [],
        syntaxHighlighting(defaultHighlightStyle),
        syntaxHighlighting(classHighlighter),
        syntaxHighlighting(
          HighlightStyle.define([
            {
              tag: tags.monospace,
              "font-family": "monospace",
            },
          ]),
        ),
        EditorView.darkTheme.of(mode === "dark"),
        EditorView.baseTheme({
          "body:has(&)": {
            "background-color": background,
          },
          ".tok-heading": {
            "text-decoration": "none",
          },
          "&": {
            "background-color": background,
          },
          '&[data-tbl-theme-mode="light"]': {
            color: "#000000",
          },
          '&[data-tbl-theme-mode="dark"]': {
            color: "#dddddd",

            "& .tok-heading, & .tok-heading.tok-meta": {
              color: "#dddddd",
            },
            "& .tok-url": {
              color: "#a0d0f8",
            },
            "& .tok-meta": {
              color: "#8dc3f0",
            },
            "& .tok-typeName, & .tok-punctuation": {
              color: "#8dc3f0",
            },
            "& .tok-string": {
              color: "#dddddd",
            },
          },
          '&[data-tbl-theme-mode="light"] .cm-selectionBackground': {
            background: "#d9d9d9",
          },
          '&[data-tbl-theme-mode="dark"] .cm-selectionBackground': {
            background: "rgb(68 68 68)",
          },
          '&[data-tbl-theme-mode="light"].cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground':
            {
              background: "#d7d4f0",
            },
          '&[data-tbl-theme-mode="dark"].cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground':
            {
              background: "rgb(107 107 107)",
            },
          "main > &, main > &.cm-focused": {
            outline: "none",
          },
          "main > &": {
            "max-height": "100vh",
          },
          "main > & > .cm-tooltip": {
            "font-size": "90%",
          },
          "main > & > .cm-scroller": {
            padding: "6px 6px 6px 16px",
            "font-family": fontName,
            overflow: "auto",
          },
          "main > & > .cm-scroller > .cm-content": {
            width: "100%",
          },
        }),
      ],
    })
  }
</script>

<main bind:this={element}></main>
{#if showSidebar}
  <div class={["sidebar", mode]}>
    <h1>Config</h1>
    <h2>theme</h2>
    <select aria-label="theme" name="theme" bind:value={themeName}>
      {#each themeNames as name (name)}
        <option value={name}>
          {name}
        </option>
      {/each}
    </select>

    <h2>font</h2>
    <label>
      <input type="radio" name="system-ui" value="system-ui" bind:group={fontName} />
      system-ui
    </label>
    <label>
      <input type="radio" name="monospace" value="monospace" bind:group={fontName} />
      monospace
    </label>

    <h2>selection</h2>
    <label>
      <input type="radio" name="codemirror" value="codemirror" bind:group={selectionType} />
      codemirror
    </label>
    <label>
      <input type="radio" name="native" value="native" bind:group={selectionType} />
      native
    </label>

    <h2>lineWrapping</h2>
    <label>
      <input type="radio" name="wrap" value="wrap" bind:group={lineWrapping} />
      wrap
    </label>
    <label>
      <input type="radio" name="nowrap" value="nowrap" bind:group={lineWrapping} />
      nowrap
    </label>

    <h2>handlePosition</h2>
    <label>
      <input type="radio" name="outside" value="outside" bind:group={handlePosition} />
      outside
    </label>
    <label>
      <input type="radio" name="inside" value="inside" bind:group={handlePosition} />
      inside
    </label>
  </div>
{/if}

<style>
  :global {
    html {
      width: 100%;
      height: 100%;
      -webkit-text-size-adjust: 100%;
    }

    body {
      margin: 0;
      min-height: 100vh;
    }

    #demo {
      display: flex;
      width: 100vw;
      height: 100vh;
    }

    main {
      flex-grow: 999;
      flex-basis: 0;
      min-width: 0;
    }

    .sidebar {
      display: flex;
      flex-grow: 1;
      flex-direction: column;
      background-color: var(--background-color);
      padding: 6px 12px;
      color: var(--color);
      font-family: system-ui, sans-serif;
      user-select: none;

      *,
      *::before,
      *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-weight: normal;
      }

      &.light {
        --color: #000000;
        --background-color: rgb(0 0 0 / 10%);
      }

      &.dark {
        --background-color: rgb(255 255 255 / 10%);
        --color: #f0f6fc;
      }

      h1 {
        margin-inline: -0.5rem;
        padding: 0.25rem 0.5rem 0.25rem 0.5rem;
        font-size: medium;
      }

      h2 {
        padding-top: 1em;
        padding-bottom: 0.5em;
        font-size: small;
        text-decoration: underline;
      }

      label {
        font-size: smaller;

        &:has(+ label) {
          margin-bottom: 0.5em;
        }
      }

      input,
      select {
        vertical-align: middle;
        margin-left: 6px;
      }

      select {
        padding-left: 0.5em;
      }
    }
  }
</style>
