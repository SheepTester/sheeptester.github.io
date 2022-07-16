// node home-page/imitation-scss-parser.js home-page/index.html.scss index.html home-page/style.css
// nodemon --watch home-page --ext scss,yml,js home-page/imitation-scss-parser.js home-page/index.html.scss index.html home-page/style.css

const fs = require('fs/promises')
const nodePath = require('path')
const YAML = require('yaml')

function * tokenize (text, possibilities) {
  const tokenizers = [Object.entries(possibilities)]
  tokenization: while (text.length) {
    for (const [type, rawPossibility] of tokenizers[tokenizers.length - 1]) {
      const possibility =
        typeof rawPossibility === 'string' || rawPossibility instanceof RegExp
          ? { pattern: rawPossibility }
          : rawPossibility
      let token, groups
      if (typeof possibility.pattern === 'string') {
        if (text.startsWith(possibility.pattern)) {
          token = possibility.pattern
          text = text.slice(possibility.pattern.length)
        }
      } else {
        const match = text.match(possibility.pattern)
        if (match && match.index === 0) {
          token = match[0]
          groups = match
          text = text.slice(match[0].length)
        }
      }
      if (token) {
        if (possibility.pop) {
          tokenizers.pop()
        }
        if (possibility.push) {
          tokenizers.push(Object.entries(possibility.push))
        }
        yield [type, token, groups]
        continue tokenization
      }
    }
    console.error(text)
    throw new Error('Cannot tokenize from here.')
  }
}

const patternTokenizers = {
  in: {
    pattern: 'in',
    pop: true
  },
  variable: /^\$[\w-]+/,
  separator: ',',
  whitespace: /^\s+/
}
const makeCssRawTokenizers = tokenizers => ({
  comment: /^\/\/.*/,
  string: /^(?:"(?:[^"\r\n\\]|\\.)*"|'(?:[^'\r\n\\]|\\.)*')/,
  ...tokenizers,
  semicolon: /^\s*;\s*/,
  colon: /^\s*:\s*/,
  separator: /^\s*,\s*/,
  lparen: /^\s*\(\s*/,
  rparen: /^\s*\)\s*/,
  whitespace: /^\s+/,
  anythingElse: /^[^{}:,\s]+/
})
const cssBodyTokenizers = makeCssRawTokenizers({
  lcurly: { pattern: /^\s*\{\s*/ },
  rcurly: { pattern: /^\s*}\s*/, pop: true }
})
cssBodyTokenizers.lcurly.push = cssBodyTokenizers
const mediaQueryTokenizers = makeCssRawTokenizers({
  lcurly: {
    pattern: /^\s*\{\s*/,
    pop: true,
    push: cssBodyTokenizers
  }
})
const tokenizers = {
  multilineString: /^"""([^"\\]|\\.)*(?:"{1,2}([^"\\]|\\.)+)*"""/,
  string: /^"(?:[^"\r\n\\]|\\.)*"/,
  comment: /^\/\/.*/,
  cssRawBegin: { pattern: /^css\s*\{/, push: cssBodyTokenizers },
  lparen: '(',
  rparen: ')',
  lbracket: '[',
  rbracket: ']',
  lcurly: '{',
  rcurly: '}',
  eqeq: '==',
  equal: '=',
  semicolon: ';',
  colon: ':',
  media: { pattern: '@media', push: mediaQueryTokenizers },
  import: '@import',
  importFunc: /^import\s*\(\s*("(?:[^"\r\n\\]|\\.)*")\s*\)/,
  if: '@if',
  each: {
    pattern: '@each',
    push: patternTokenizers
  },
  variable: /^\$[\w-]+/,
  mapGet:
    /^map\s*\.\s*get\s*\(\s*(\$[\w-]+)\s*,\s*('(?:[^'\r\n\\]|\\.)*'|\$[\w-]+)\s*\)/,
  idName:
    /^#(?:[\w-]|#\{(?:\$[\w-]+|map\s*\.\s*get\s*\(\s*\$[\w-]+\s*,\s*'(?:[^'\r\n\\]|\\.)*'\s*\))\})+/,
  className:
    /^\.(?:[\w-]|#\{(?:\$[\w-]+|map\s*\.\s*get\s*\(\s*\$[\w-]+\s*,\s*'(?:[^'\r\n\\]|\\.)*'\s*\))\})+/,
  tagName:
    /^(?:[\w-]|#\{(?:\$[\w-]+|map\s*\.\s*get\s*\(\s*\$[\w-]+\s*,\s*'(?:[^'\r\n\\]|\\.)*'\s*\))\})+/,
  whitespace: /^\s+/
}

function startSelector (context) {
  context.type = 'selector'
  context.html = variables => {
    const { tagName = 'div', classes = [], id, attributes = [] } = context
    if (classes.length) {
      attributes.push(['class', classes.join(' ')])
    }
    if (id) {
      attributes.push(['id', id])
    }
    return `<${substitute(tagName, variables)}${attributes
      .map(([name, value]) => [name, value && substitute(value, variables)])
      .filter(([, value]) => value !== '')
      .map(([name, value]) =>
        value === undefined ? ' ' + name : ` ${name}="${escapeHtml(value)}"`
      )
      .join('')}>`
  }
}

const escapeMap = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }
function escapeHtml (str) {
  return str.replace(/[<>&"]/g, m => escapeMap[m])
}

const substitutionPattern =
  /#\{(?:(\$[\w-]+)|map\s*\.\s*get\s*\(\s*(\$[\w-]+)\s*,\s*('(?:[^'\r\n\\]|\\.)*'|\$[\w-]+)\s*\))\}/g

function trimMultilineString (str) {
  const contents = str.slice(3, -3)
  const firstIndentMatch = contents.match(/\n([ \t]*)/)
  return contents
    .replace(
      new RegExp(
        String.raw`\s*\n[ \t]{0,${
          firstIndentMatch ? firstIndentMatch[1].length : 0
        }}`,
        'g'
      ),
      ' '
    )
    .trim()
}

function assignToCss (targetCss, newCss) {
  for (const [key, styles] of newCss) {
    const targetStyles = targetCss.get(key)
    if (targetStyles) {
      for (const style of styles) {
        targetStyles.add(style)
      }
    } else {
      targetCss.set(key, styles)
    }
  }
}

function addStyle (targetCss, style, key = 'main') {
  const targetStyles = targetCss.get(key)
  if (targetStyles) {
    targetStyles.add(style)
  } else {
    targetCss.set(key, new Set([style]))
  }
}

function mapGet (vars, mapName, keyName, undefinedOk = false) {
  if (vars[mapName] === undefined) {
    throw new ReferenceError(`${mapName} not defined`)
  }
  if (vars[mapName] === null || typeof vars[mapName] !== 'object') {
    throw new TypeError(`${mapName} not object`)
  }
  if (keyName[0] === '$' && vars[keyName] === undefined) {
    throw new TypeError(`${keyName} not defined`)
  }
  if (keyName[0] === '$' && typeof vars[keyName] !== 'string') {
    throw new TypeError(`${keyName} not string`)
  }
  const key =
    keyName[0] === '$'
      ? vars[keyName]
      : JSON.parse(
          `"${keyName
            .slice(1, -1)
            .replace(/"|\\'/g, m => (m === '"' ? '\\"' : "'"))}"`
        )
  if (!undefinedOk && vars[mapName][key] === undefined) {
    throw new ReferenceError(`${key} not not in map`)
  }
  return vars[mapName][key]
}

function substitute (html, vars, escape = escapeHtml) {
  return html.replace(substitutionPattern, (_, varName, mapName, keyName) => {
    if (mapName) {
      return escape(mapGet(vars, mapName, keyName) + '')
    } else {
      if (vars[varName] === undefined) {
        throw new ReferenceError(`${varName} not defined`)
      }
      return escape(vars[varName])
    }
  })
}

const fileCache = new Map()
async function getFile (path) {
  const file = fileCache.get(path)
  if (file === undefined) {
    const file = await fs.readFile(path, 'utf8')
    fileCache.set(path, file)
    return file
  } else {
    return file
  }
}

async function parseImitationScss (
  psuedoScss,
  filePath,
  {
    html = '',
    css = new Map([['main', new Set()]]),
    noisy = false,
    logPop = false,
    variables = {}
  } = {}
) {
  const tokens = tokenize(psuedoScss, tokenizers)
  const contextHistory = []
  const contextStack = [{}]
  function pop (label = '') {
    const popped = contextStack.pop()
    if (logPop) {
      // delete popped._from
      console.log(label, popped)
    }
  }
  async function loopOverArray (context, data, variables) {
    if (data === null || typeof data !== 'object') {
      console.error(data)
      throw new TypeError('Cannot loop over non-array')
    }
    const array = Array.isArray(data) ? data : Object.entries(data)
    const minLength = Math.min(
      ...array.map(sublist => (Array.isArray(sublist) ? sublist.length : 1))
    )
    if (context.variables.length > minLength && minLength >= 2) {
      throw new RangeError(
        `Destructuring too many variables from a list of at minimum ${minLength} items`
      )
    }
    const loopTokens = []
    let brackets = 0
    while (true) {
      const { value: nextToken, done } = tokens.next()
      if (done)
        throw new Error(
          'tokens should not be done; unbalanced curlies probably'
        )
      loopTokens.push(nextToken)
      if (nextToken[0] === 'lcurly' || nextToken[0] === 'cssRawBegin') {
        brackets++
      } else if (nextToken[0] === 'rcurly') {
        brackets--
        if (brackets <= 0) break
      }
    }
    let tempHtml = html
    let tempCss = css
    let index = 0
    for (const entry of array) {
      contextStack.push({ type: 'each-loop' })
      css = new Map()
      html = ''
      if (context.variables.length === 1) {
        variables[context.variables[0]] = entry
      } else {
        if (Array.isArray(entry)) {
          context.variables.forEach((varName, i) => {
            variables[varName] = entry[i]
          })
        } else {
          variables[context.variables[0]] = entry
          variables[context.variables[1]] = index + 1
        }
      }
      // console.log('loopstart', variables);
      for (const token of loopTokens) {
        if (logPop) console.log('BEGIN TOKEN', token.slice(0, 2))
        await analyseToken(token, variables)
      }
      // console.log('loopend');
      tempHtml += substitute(html, variables)
      assignToCss(tempCss, css)
      pop('each-loop (loop end)') // each-loop
      if (contextStack[contextStack.length - 1].type === 'each-loop') {
        console.error(contextHistory.join('\n'))
        throw new Error('Unbalanced popping; each-loop still exists')
      }
      index++
    }
    html = tempHtml
    css = tempCss
    pop('each') // each
    contextStack.push({ _from: 'loopOverArray' })
  }
  async function analyseToken ([tokenType, token, groups], variables) {
    let context = contextStack[contextStack.length - 1]
    if (noisy) console.log([tokenType, token], context)
    const contextEntry = contextStack
      .map(context => {
        if (context.type === 'if') {
          return `if(${context.not ? !context.condition : context.condition})[${
            context.step
          }]`
        } else if (context.type) {
          return (
            context.type +
            (context.step ? `[${context.step}]` : '') +
            (context.brackets !== undefined ? `[${context.brackets}]` : '')
          )
        } else {
          return `?(${context._from})`
        }
      })
      .join(' ')
    if (contextHistory[contextHistory.length - 1] !== contextEntry) {
      contextHistory.push(contextEntry)
    }

    if (context.type === 'if' && context.step === 'skip') {
      if (tokenType === 'lcurly' || tokenType === 'cssRawBegin') {
        context.brackets++
      } else if (tokenType === 'rcurly') {
        context.brackets--
      }
      if (context.brackets <= 0) {
        pop('if (condition false)')
        contextStack.push({ _from: 'lcurly if content (false)' })
      }
      return
    }

    switch (tokenType) {
      case 'comment': {
        break
      }

      case 'tagName': {
        if (!context.type) {
          if (token === 'content') {
            context.type = 'content'
            context.step = 'after-content'
            break
          } else {
            startSelector(context)
          }
        }
        if (context.type === 'selector') {
          if (context.tagName) {
            throw new Error('Tag name already set')
          } else {
            context.tagName = token
          }
        } else if (context.type === 'attribute') {
          if (context.step === 'name') {
            context.name = token
            context.step = 'post-name'
          } else if (context.step === 'value') {
            context.value = token
            context.step = 'end'
          }
        } else if (context.type === 'if') {
          if (context.step === 'condition') {
            if (token === 'not') {
              context.not = !context.not
            } else {
              throw new Error('must only use `not` after @if')
            }
          } else {
            throw new Error('not must be after @if')
          }
        } else {
          throw new Error('Invalid tag name context')
        }
        break
      }

      case 'className': {
        if (!context.type) startSelector(context)
        if (context.type === 'selector') {
          if (!context.classes) context.classes = []
          context.classes.push(token.slice(1))
        } else {
          throw new Error('Class token should only be in selector')
        }
        break
      }

      case 'idName': {
        if (!context.type) startSelector(context)
        if (context.type === 'selector') {
          if (context.id) {
            throw new Error('ID already set')
          } else {
            context.id = token.slice(1)
          }
        } else {
          throw new Error('Class token should only be in selector')
        }
        break
      }

      case 'lbracket': {
        if (!context.type) startSelector(context)
        if (context.type === 'selector') {
          contextStack.push({
            type: 'attribute',
            step: 'name'
          })
        } else {
          throw new Error('Left bracket should only be in selector')
        }
        break
      }

      case 'equal': {
        if (context.type === 'attribute') {
          if (context.step === 'post-name') {
            context.step = 'value'
          } else {
            throw new Error('Equal must be after name')
          }
        } else {
          throw new Error('Equal should only be in attribute')
        }
        break
      }

      case 'rbracket': {
        if (context.type === 'attribute') {
          if (context.step === 'post-name' || context.step === 'end') {
            pop('attribute')
            const parentContext = contextStack[contextStack.length - 1]
            if (!parentContext.attributes) parentContext.attributes = []
            parentContext.attributes.push([context.name, context.value])
          } else {
            throw new Error('Right bracket must be after name or value')
          }
        } else {
          throw new Error('Right bracket should only be in attribute')
        }
        break
      }

      case 'multilineString':
      case 'string': {
        if (context.type === 'css') {
          context.css += token
          break
        } else if (context.type === 'media') {
          context.media += token
          break
        }
        const rawStrValue =
          tokenType === 'multilineString'
            ? trimMultilineString(token)
            : JSON.parse(token)
        const strValue = substitute(rawStrValue, variables, str => str)
        const escaped = escapeHtml(strValue)
        if (context.type === 'attribute') {
          if (context.step === 'value') {
            context.value = strValue
            context.step = 'end'
          } else {
            throw new Error('String must be after equal sign')
          }
        } else if (context.type === 'content') {
          if (context.step === 'value') {
            html += escaped
            context.step = 'end'
          } else {
            throw new Error('String must be after colon')
          }
        } else if (context.type === 'import') {
          if (context.step === 'path') {
            const path = nodePath.join(nodePath.dirname(filePath), strValue)
            const imported = await parseImitationScss(
              await getFile(path),
              path,
              {
                noisy,
                logPop,
                variables: { ...variables }
              }
            )
            html += imported.html
            assignToCss(css, imported.css)
            context.step = 'end'
          } else {
            throw new Error('String must be after colon')
          }
        } else if (context.type === 'var') {
          if (context.step === 'value') {
            variables[context.var] = strValue
            context.step = 'end'
          } else {
            throw new Error('Import function must only be used after colon')
          }
        } else if (context.type === 'if') {
          if (context.step === 'value') {
            context.condition = context.value === strValue
            context.step = 'content'
          } else {
            throw new Error('Import function must only be used after colon')
          }
        } else {
          throw new Error('Invalid string context')
        }
        break
      }

      case 'whitespace': {
        if (context.type === 'selector') {
          // Intended to be syntactic sugar for nested elements, but currently
          // unimplemented
          context.encounteredWhiteSpace = true
        } else if (context.type === 'css') {
          context.css += ' '
        } else if (context.type === 'media') {
          context.media += ' '
        }
        break
      }

      case 'lcurly': {
        if (context.type === 'selector') {
          html += context.html(variables)
          contextStack.push({ _from: 'lcurly selector' })
        } else if (context.type === 'each-loop') {
          contextStack.push({ _from: 'lcurly each-loop' })
        } else if (context.type === 'css') {
          context.css += '{'
          context.brackets++
        } else if (context.type === 'media') {
          context.type = 'css'
          context.brackets = 1
          context.css = ''
        } else if (context.type === 'if') {
          if (context.step === 'content') {
            if (context.not) {
              context.condition = !context.condition
            }
            if (context.condition) {
              context.step = 'end'
              contextStack.push({ _from: 'lcurly if content (true)' })
            } else {
              context.step = 'skip'
              context.brackets = 1
            }
          } else {
            throw new Error('Left curly must be after if condition')
          }
        } else {
          throw new Error('Left curly in ivnalid context')
        }
        break
      }

      case 'rcurly': {
        if (context.type === 'css') {
          context.brackets--
          if (context.brackets <= 0) {
            addStyle(
              css,
              substitute(context.css.trim(), variables, str => str),
              context.media
            )
            pop('css')
            contextStack.push({ _from: 'rcurly css' })
          } else {
            context.css += '}'
          }
          break
        }
        pop('generic rcurly')
        context = contextStack[contextStack.length - 1]
        if (noisy) console.log('RCURLY', context)
        if (context.type === 'selector') {
          html += `</${
            context.tagName ? substitute(context.tagName, variables) : 'div'
          }>`
          pop('selector (})')
          contextStack.push({ _from: 'rcurly selector' })
        } else if (context.type === 'each-loop') {
          pop('each-loop (})')
          contextStack.push({ _from: 'rcurly each-loop' })
        } else if (context.type === 'if') {
          if (context.step === 'end') {
            pop('if (})')
            contextStack.push({ _from: 'rcurly if' })
          } else {
            throw new Error('Right curly must be after left curly in @if')
          }
        } else {
          console.error(contextHistory.join('\n'))
          // console.error(contextStack)
          throw new Error("Right curly's matching left curly in wrong context")
        }
        break
      }

      case 'semicolon': {
        if (context.type === 'selector') {
          html += context.html(variables)
          pop('selector (;)')
          contextStack.push({ _from: 'semicolon selector' })
        } else if (context.type === 'content') {
          if (context.step === 'end') {
            pop('content')
            contextStack.push({ _from: 'semicolon content' })
          } else {
            throw new Error('Semicolon must be after string')
          }
        } else if (context.type === 'var') {
          if (context.step === 'end') {
            pop('var')
            contextStack.push({ _from: 'semicolon var' })
          } else {
            throw new Error('Semicolon must be after var setting')
          }
        } else if (context.type === 'import') {
          if (context.step === 'end') {
            pop('@import')
            contextStack.push({ _from: 'semicolon import end' })
          } else {
            throw new Error('Semicolon must be after import path string')
          }
        } else if (context.type === 'css') {
          context.css += ';'
        } else if (context.type === 'media') {
          context.media += ';'
        } else {
          throw new Error('Invalid semicolon context')
        }
        break
      }

      case 'colon': {
        if (context.type === 'content') {
          if (context.step === 'after-content') {
            context.step = 'value'
          } else {
            throw new Error('Colon must be after `content`')
          }
        } else if (context.type === 'var') {
          if (context.step === 'after-varname') {
            context.step = 'value'
          } else {
            throw new Error('Colon must be after var name')
          }
        } else if (context.type === 'css') {
          context.css += ':'
        } else if (context.type === 'media') {
          context.media += ':'
        } else {
          throw new Error('Colon in wrong context')
        }
        break
      }

      case 'each': {
        if (!context.type) {
          context.type = 'each'
          context.variables = []
          context.step = 'variables'
        } else {
          throw new Error('Each cannot be used inside a context')
        }
        break
      }

      case 'variable': {
        if (!context.type) {
          context.type = 'var'
          context.step = 'after-varname'
          context.var = token
        } else if (context.type === 'each') {
          if (context.step === 'variables') {
            context.variables.push(token)
          } else if (context.step === 'expr') {
            if (variables[token] === undefined) {
              throw new ReferenceError(`${token} not defined`)
            }
            await loopOverArray(context, variables[token], variables)
          } else {
            throw new Error('Variables must be after @each')
          }
        } else if (context.type === 'if') {
          if (context.step === 'condition') {
            if (context.equal) {
              if (variables[token] === undefined) {
                throw new ReferenceError(`${token} not defined`)
              }
              context.condition = context.value === variables[token]
            } else {
              context.value = variables[token]
              context.condition = variables[token] !== undefined
            }
            context.step = 'content'
          } else {
            throw new Error('Variable must be after @if')
          }
        } else {
          throw new Error('Variable invalid context')
        }
        break
      }

      case 'separator': {
        if (context.type === 'css') {
          context.css += ','
        } else if (context.type === 'media') {
          context.media += ','
        }
        break
      }

      case 'in': {
        if (context.type === 'each') {
          if (context.step === 'variables') {
            if (context.variables.length === 0) {
              throw new Error('Need at least one variable before `in`')
            }
            context.step = 'expr'
          } else {
            throw new Error('`in` must be after @each or variables')
          }
        } else {
          throw new Error('`in` should only be in @each')
        }
        break
      }

      case 'importFunc': {
        if (context.type === 'each') {
          if (context.step === 'expr') {
            const path = nodePath.join(
              nodePath.dirname(filePath),
              JSON.parse(groups[1])
            )
            const yaml = YAML.parse(await getFile(path))
            if (yaml === null || typeof yaml !== 'object') {
              throw new TypeError('Cannot loop over a non-array/object')
            }
            await loopOverArray(context, yaml, variables)
          } else {
            throw new Error('Import function must only be used after in')
          }
        } else if (context.type === 'var') {
          if (context.step === 'value') {
            const path = nodePath.join(
              nodePath.dirname(filePath),
              JSON.parse(groups[1])
            )
            const yaml = YAML.parse(await getFile(path))
            variables[context.var] = yaml
            context.step = 'end'
          } else {
            throw new Error('Import function must only be used after colon')
          }
        } else {
          throw new Error('Import function should only be in @each')
        }
        break
      }

      case 'import': {
        if (!context.type) {
          context.type = 'import'
          context.step = 'path'
        } else {
          throw new Error('@import cannot be inside a context')
        }
        break
      }

      case 'mapGet': {
        if (context.type === 'each') {
          if (context.step === 'expr') {
            const array = mapGet(variables, groups[1], groups[2])
            await loopOverArray(context, array, variables)
          } else {
            throw new Error('map.get function must only be used after in')
          }
        } else if (context.type === 'if') {
          if (context.step === 'condition') {
            if (context.equal) {
              context.condition = mapGet(variables, groups[1], groups[2])
            } else {
              const value = mapGet(variables, groups[1], groups[2], true)
              context.value = value
              context.condition = value !== undefined
            }
            context.step = 'content'
          } else {
            throw new Error('map.get must be after @if')
          }
        } else if (context.type === 'var') {
          if (context.step === 'value') {
            variables[context.var] = mapGet(variables, groups[1], groups[2])
            context.step = 'end'
          } else {
            throw new Error('map.get must be after colon')
          }
        } else {
          throw new Error('map.get in wrong context')
        }
        break
      }

      case 'cssRawBegin': {
        if (!context.type) {
          context.type = 'css'
          context.brackets = 1
          context.css = ''
        } else {
          throw new Error('css cannot be inside a context')
        }
        break
      }

      case 'anythingElse': {
        if (context.type === 'css') {
          context.css += token
        } else if (context.type === 'media') {
          context.media += token
        } else {
          throw new Error('anythingElse must be inside css')
        }
        break
      }

      case 'media': {
        if (!context.type) {
          context.type = 'media'
          context.media = '@media'
        } else {
          throw new Error('@media cannot be inside a context')
        }
        break
      }

      case 'lparen': {
        if (context.type === 'css') {
          context.css += '('
        } else if (context.type === 'media') {
          // @media queries require spaces around `and` and after @media, but
          // the lparen token swallows up the whitespace for that.
          context.media += token.startsWith(' ') ? ' (' : '('
        }
        break
      }

      case 'rparen': {
        if (context.type === 'css') {
          context.css += ')'
        } else if (context.type === 'media') {
          context.media += ')'
        }
        break
      }

      case 'if': {
        if (!context.type) {
          context.type = 'if'
          context.step = 'condition'
        } else {
          throw new Error('@media cannot be inside a context')
        }
        break
      }

      case 'eqeq': {
        if (context.type === 'if') {
          if (context.step === 'content') {
            context.equal = true
            context.step = 'value'
          } else {
            throw new Error('== must be after the condition')
          }
        } else {
          throw new Error('== must be inside @if')
        }
        break
      }

      default: {
        console.error(html)
        throw new Error(`${tokenType} not implemented yet`)
      }
    }
  }
  for (const token of tokens) {
    await analyseToken(token, variables)
  }
  if (noisy) console.log(contextStack)
  return { html, css }
}

const [, , inputFile, outputHtml, outputCss] = process.argv
fs.readFile(inputFile, 'utf8')
  .then(async psuedoScss => {
    const { html, css } = await parseImitationScss(psuedoScss, inputFile, {
      html: `<!DOCTYPE html>\n<!-- Hi! This file was generated, so it's hard to read. The source code is at ${inputFile} -->\n`,
      noisy: false
      // logPop: true
    })
    await fs.writeFile(outputHtml, html + '\n')
    await fs.writeFile(
      outputCss,
      `/* Hi! This file was generated, so it's hard to read. The source code is at ${inputFile} */\n${Array.from(
        css,
        ([media, styles]) => {
          const css = [...styles].join('')
          return media === 'main' ? css : `${media}{${css}}`
        }
      ).join('')}\n`
    )
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
