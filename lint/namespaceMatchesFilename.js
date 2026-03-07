/**
 * Checks that namespace import matches filename or directory+filename.
 *
 * e.g.
 * The following pass:
 * - `import * as File from ./file`
 * - `import * as DirFile from ./some/long/dir/file`
 *
 * The following fail:
 * `import * as Wrong from "./wrong"`
 * `import * as WrongDirFile from "./dir/file"`
 * ```
 *
 * Based heavily on the `no-namespace` rule from `eslint-plugin-import`.
 * {@link https://github.com/import-js/eslint-plugin-import/blob/47f732e0f28bf36b09ab975df820e4f9c3232617/src/rules/no-namespace.js }.
 */
import { parse } from "node:path"
import camelcase from "camelcase"

function getScope(context, node) {
  const sourceCode = getSourceCode(context)

  if (sourceCode && sourceCode.getScope) {
    return sourceCode.getScope(node)
  }

  return context.getScope()
}

function getSourceCode(context) {
  if ("sourceCode" in context) {
    return context.sourceCode
  }

  return context.getSourceCode()
}

/**
 * @param {Identifier[]} namespaceIdentifiers
 * @returns {boolean} `true` if the namespace variable is more than just a glorified constant
 */
function usesNamespaceAsObject(namespaceIdentifiers) {
  return !namespaceIdentifiers.every((identifier) => {
    const parent = identifier.parent

    // `namespace.x` or `namespace['x']`
    return (
      parent &&
      parent.type === "MemberExpression" &&
      (parent.property.type === "Identifier" || parent.property.type === "Literal")
    )
  })
}

export default {
  meta: {
    docs: {
      description: "Namespace name match filename or directory+filename.",
      recommended: true,
      requiresTypeChecking: false,
    },
    messages: {
      namespaceShouldBeFilename: "Namespace '{{ namespace }}' should be '{{ filename }}'.",
      namespaceShouldBeFilenameOrDirFilename:
        "Namespace '{{ namespace }}' should be '{{ filename }}' or '{{ dirFilename }}'.",
    },
    type: "suggestion",
    schema: [],
    fixable: "code",
  },
  name: "namespace-matches-filename",
  defaultOptions: [],
  create(context) {
    return {
      ImportNamespaceSpecifier(node) {
        const namespace = node.local.name
        if (namespace == null) return
        const declarationNode = node.parent
        const importPath = declarationNode.source.value

        const { dir: fileDir, name: file } = parse(importPath)

        const filename = camelcase(file, { pascalCase: true })
        if (namespace === filename) return

        let dirFilename = undefined
        const { name: parentDir } = parse(fileDir)
        if (parentDir !== "." && parentDir !== "/" && parentDir !== "") {
          dirFilename = camelcase([parentDir, file], { pascalCase: true })
          if (namespace === dirFilename) return
        }

        const scopeVariables = getScope(context, node).variables
        const namespaceVariable = scopeVariables.find((variable) => variable.defs[0].node === node)
        const namespaceReferences = namespaceVariable.references
        const namespaceIdentifiers = namespaceReferences.map((reference) => reference.identifier)
        const canFix =
          namespaceIdentifiers.length > 0 && !usesNamespaceAsObject(namespaceIdentifiers)

        context.report({
          node,
          messageId:
            dirFilename == null
              ? "namespaceShouldBeFilename"
              : "namespaceShouldBeFilenameOrDirFilename",
          data:
            dirFilename == null ? { namespace, filename } : { namespace, filename, dirFilename },
          fix:
            canFix &&
            ((fixer) => {
              const fixes = []

              // Rename namespace
              fixes.push(fixer.replaceText(node, `* as ${filename}`))

              // Rename usages of namespace
              namespaceIdentifiers.forEach((identifier) => {
                const parent = identifier.parent
                if (parent && parent.type === "MemberExpression") {
                  fixes.push(fixer.replaceText(parent.object, filename))
                }
              })

              return fixes
            }),
        })
      },
    }
  },
}
